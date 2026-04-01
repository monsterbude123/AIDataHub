import 'reflect-metadata';
import { describe, it, expect, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { DataSource } from 'typeorm';
import { AuthService } from './auth.service';
import { CaslAbilityFactory, Action } from './casl-ability.factory';
import { UserEntity } from '../../entities/User.entity';
import { UserRoleEntity } from '../../entities/UserRole.entity';
import { RoleEntity } from '../../entities/Role.entity';
import { RolePermissionEntity } from '../../entities/RolePermission.entity';
import { PermissionEntity } from '../../entities/Permission.entity';
import { OrganizationEntity } from '../../entities/Organization.entity';

describe('AuthService', () => {
  let service: AuthService;
  let dataSource: DataSource;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [
            UserEntity,
            UserRoleEntity,
            RoleEntity,
            RolePermissionEntity,
            PermissionEntity,
            OrganizationEntity,
          ],
          synchronize: true,
          logging: false,
        }),
        TypeOrmModule.forFeature([
          UserEntity,
          UserRoleEntity,
          RoleEntity,
          RolePermissionEntity,
          PermissionEntity,
        ]),
      ],
      providers: [AuthService],
    }).compile();

    service = moduleRef.get(AuthService);
    dataSource = moduleRef.get(DataSource);

    await dataSource.dropDatabase();
    await dataSource.synchronize(true);
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      // Create a user with password
      const passwordHash = await bcrypt.hash('password123', 10);
      const userRepo = dataSource.getRepository(UserEntity);
      const user = userRepo.create({
        username: 'testuser',
        passwordHash,
        orgId: 'org-1',
        status: 'ENABLED',
      });
      await userRepo.save(user);

      // Create a role
      const roleRepo = dataSource.getRepository(RoleEntity);
      const role = roleRepo.create({
        name: 'Test Role',
        code: 'test-role',
        enabled: true,
      });
      await roleRepo.save(role);

      // Assign role to user
      const userRoleRepo = dataSource.getRepository(UserRoleEntity);
      const userRole = userRoleRepo.create({
        userId: user.id,
        roleId: role.id,
      });
      await userRoleRepo.save(userRole);

      const result = await service.login({
        username: 'testuser',
        password: 'password123',
      });

      expect(result.token).toBeDefined();
      expect(result.user.username).toBe('testuser');
      expect(result.roles).toContain('test-role');
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      await expect(
        service.login({ username: 'nonexistent', password: 'password' })
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for disabled user', async () => {
      const passwordHash = await bcrypt.hash('password123', 10);
      const userRepo = dataSource.getRepository(UserEntity);
      const user = userRepo.create({
        username: 'disableduser',
        passwordHash,
        orgId: 'org-1',
        status: 'DISABLED',
      });
      await userRepo.save(user);

      await expect(
        service.login({ username: 'disableduser', password: 'password123' })
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      const passwordHash = await bcrypt.hash('correctpassword', 10);
      const userRepo = dataSource.getRepository(UserEntity);
      const user = userRepo.create({
        username: 'testuser',
        passwordHash,
        orgId: 'org-1',
        status: 'ENABLED',
      });
      await userRepo.save(user);

      await expect(
        service.login({ username: 'testuser', password: 'wrongpassword' })
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for user without password', async () => {
      const userRepo = dataSource.getRepository(UserEntity);
      const user = userRepo.create({
        username: 'nopassworduser',
        orgId: 'org-1',
        status: 'ENABLED',
      });
      await userRepo.save(user);

      await expect(
        service.login({ username: 'nopassworduser', password: 'password' })
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should generate valid JWT token', async () => {
      const passwordHash = await bcrypt.hash('password123', 10);
      const userRepo = dataSource.getRepository(UserEntity);
      const user = userRepo.create({
        username: 'jwtuser',
        passwordHash,
        orgId: 'org-1',
        status: 'ENABLED',
      });
      await userRepo.save(user);

      const result = await service.login({
        username: 'jwtuser',
        password: 'password123',
      });

      // Verify token can be decoded
      const decoded = jwt.verify(result.token, 'dev-secret') as jwt.JwtPayload;
      expect(decoded.userId).toBe(user.id);
      expect(decoded.username).toBe('jwtuser');
    });
  });

  describe('validateToken', () => {
    it('should validate a valid token and return user', async () => {
      const passwordHash = await bcrypt.hash('password123', 10);
      const userRepo = dataSource.getRepository(UserEntity);
      const user = userRepo.create({
        username: 'validateuser',
        passwordHash,
        orgId: 'org-1',
        status: 'ENABLED',
      });
      await userRepo.save(user);

      // Create role and permission
      const roleRepo = dataSource.getRepository(RoleEntity);
      const role = roleRepo.create({
        name: 'Test Role',
        code: 'test-role',
        enabled: true,
      });
      await roleRepo.save(role);

      const permRepo = dataSource.getRepository(PermissionEntity);
      const perm = permRepo.create({
        type: 'URI',
        name: 'Test Permission',
        code: 'read:users',
        resource: '/api/users',
      });
      await permRepo.save(perm);

      // Assign role to user and permission to role
      const userRoleRepo = dataSource.getRepository(UserRoleEntity);
      await userRoleRepo.save({ userId: user.id, roleId: role.id });

      const rolePermRepo = dataSource.getRepository(RolePermissionEntity);
      await rolePermRepo.save({ roleId: role.id, permissionId: perm.id });

      // Generate token
      const token = jwt.sign(
        { userId: user.id, username: user.username, roles: ['test-role'] },
        'dev-secret',
        { expiresIn: '24h' }
      );

      const authUser = await service.validateToken(token);

      expect(authUser).toBeDefined();
      expect(authUser?.username).toBe('validateuser');
      expect(authUser?.roles).toContain('test-role');
      expect(authUser?.permissions).toContain('read:users');
    });

    it('should return null for invalid token', async () => {
      const result = await service.validateToken('invalid-token');
      expect(result).toBeNull();
    });

    it('should return null for disabled user', async () => {
      const passwordHash = await bcrypt.hash('password123', 10);
      const userRepo = dataSource.getRepository(UserEntity);
      const user = userRepo.create({
        username: 'disabledtokenuser',
        passwordHash,
        orgId: 'org-1',
        status: 'DISABLED',
      });
      await userRepo.save(user);

      const token = jwt.sign(
        { userId: user.id, username: user.username, roles: [] },
        'dev-secret',
        { expiresIn: '24h' }
      );

      const result = await service.validateToken(token);
      expect(result).toBeNull();
    });
  });

  describe('getPermissionsForUser', () => {
    it('should return permissions for user with roles', async () => {
      const passwordHash = await bcrypt.hash('password123', 10);
      const userRepo = dataSource.getRepository(UserEntity);
      const user = userRepo.create({
        username: 'permuser',
        passwordHash,
        orgId: 'org-1',
        status: 'ENABLED',
      });
      await userRepo.save(user);

      const roleRepo = dataSource.getRepository(RoleEntity);
      const role = roleRepo.create({
        name: 'Perm Role',
        code: 'perm-role',
        enabled: true,
      });
      await roleRepo.save(role);

      const permRepo = dataSource.getRepository(PermissionEntity);
      const perm1 = permRepo.create({
        type: 'URI',
        name: 'Read Users',
        code: 'read:users',
        resource: '/api/users',
      });
      const perm2 = permRepo.create({
        type: 'URI',
        name: 'Create Users',
        code: 'create:users',
        resource: '/api/users',
      });
      await permRepo.save([perm1, perm2]);

      const userRoleRepo = dataSource.getRepository(UserRoleEntity);
      await userRoleRepo.save({ userId: user.id, roleId: role.id });

      const rolePermRepo = dataSource.getRepository(RolePermissionEntity);
      await rolePermRepo.save([
        { roleId: role.id, permissionId: perm1.id },
        { roleId: role.id, permissionId: perm2.id },
      ]);

      const permissions = await service.getPermissionsForUser(user.id);

      expect(permissions).toContain('read:users');
      expect(permissions).toContain('create:users');
    });

    it('should return empty array for user without roles', async () => {
      const userRepo = dataSource.getRepository(UserEntity);
      const user = userRepo.create({
        username: 'noroleuser',
        orgId: 'org-1',
        status: 'ENABLED',
      });
      await userRepo.save(user);

      const permissions = await service.getPermissionsForUser(user.id);
      expect(permissions).toEqual([]);
    });
  });
});

describe('CaslAbilityFactory', () => {
  let factory: CaslAbilityFactory;

  beforeEach(() => {
    factory = new CaslAbilityFactory();
  });

  describe('createForUser', () => {
    it('should grant full access to admin user', () => {
      const user = {
        id: 'user-id',
        username: 'admin',
        orgId: 'org-1',
        roles: ['admin'],
        permissions: [],
      };

      const ability = factory.createForUser(user);

      expect(ability.can(Action.Manage, 'all')).toBe(true);
    });

    it('should grant full access to admin user even without permissions', () => {
      const user = {
        id: 'user-id',
        username: 'admin',
        orgId: 'org-1',
        roles: ['admin'],
        permissions: [], // Empty permissions, but still admin
      };

      const ability = factory.createForUser(user);

      expect(ability.can(Action.Create, 'users')).toBe(true);
      expect(ability.can(Action.Read, 'roles')).toBe(true);
      expect(ability.can(Action.Update, 'permissions')).toBe(true);
      expect(ability.can(Action.Delete, 'organizations')).toBe(true);
    });

    it('should NOT grant full access to super-admin role (only admin is checked)', () => {
      const user = {
        id: 'user-id',
        username: 'superadmin',
        orgId: 'org-1',
        roles: ['super-admin'],
        permissions: [],
      };

      const ability = factory.createForUser(user);

      // super-admin is NOT recognized as admin in current implementation
      expect(ability.can(Action.Manage, 'all')).toBe(false);
      // But can still read User by default
      expect(ability.can(Action.Read, 'User')).toBe(true);
    });

    it('should grant permissions based on permission codes', () => {
      const user = {
        id: 'user-id',
        username: 'regularuser',
        orgId: 'org-1',
        roles: ['user'],
        permissions: ['read:users', 'create:roles'],
      };

      const ability = factory.createForUser(user);

      expect(ability.can(Action.Read, 'users')).toBe(true);
      expect(ability.can(Action.Create, 'roles')).toBe(true);
      expect(ability.can(Action.Delete, 'users')).toBe(false);
    });

    it('should allow users to read their own profile by default', () => {
      const user = {
        id: 'user-id',
        username: 'regularuser',
        orgId: 'org-1',
        roles: ['user'],
        permissions: [],
      };

      const ability = factory.createForUser(user);

      expect(ability.can(Action.Read, 'User')).toBe(true);
    });

    it('should handle all action types', () => {
      const user = {
        id: 'user-id',
        username: 'allactions',
        orgId: 'org-1',
        roles: ['user'],
        permissions: [
          'manage:all',
          'create:resource',
          'read:resource',
          'update:resource',
          'delete:resource',
        ],
      };

      const ability = factory.createForUser(user);

      expect(ability.can(Action.Manage, 'all')).toBe(true);
      expect(ability.can(Action.Create, 'resource')).toBe(true);
      expect(ability.can(Action.Read, 'resource')).toBe(true);
      expect(ability.can(Action.Update, 'resource')).toBe(true);
      expect(ability.can(Action.Delete, 'resource')).toBe(true);
    });

    it('should ignore invalid permission code formats', () => {
      const user = {
        id: 'user-id',
        username: 'invalidperms',
        orgId: 'org-1',
        roles: ['user'],
        permissions: [
          'invalidformat', // No colon
          'read:', // Empty subject
          ':users', // Empty action
          'unknown:resource', // Unknown action
          'read:valid', // Valid
        ],
      };

      const ability = factory.createForUser(user);

      // Only valid permission should be granted
      expect(ability.can(Action.Read, 'valid')).toBe(true);
      // Invalid formats should not crash
      expect(ability.can(Action.Read, '')).toBe(false);
    });

    it('should handle case-insensitive actions', () => {
      const user = {
        id: 'user-id',
        username: 'caseuser',
        orgId: 'org-1',
        roles: ['user'],
        permissions: ['READ:users', 'Create:roles', 'UPDATE:permissions'],
      };

      const ability = factory.createForUser(user);

      expect(ability.can(Action.Read, 'users')).toBe(true);
      expect(ability.can(Action.Create, 'roles')).toBe(true);
      expect(ability.can(Action.Update, 'permissions')).toBe(true);
    });

    it('should grant multiple permissions on same subject', () => {
      const user = {
        id: 'user-id',
        username: 'multiuser',
        orgId: 'org-1',
        roles: ['user'],
        permissions: ['read:users', 'create:users', 'update:users'],
      };

      const ability = factory.createForUser(user);

      expect(ability.can(Action.Read, 'users')).toBe(true);
      expect(ability.can(Action.Create, 'users')).toBe(true);
      expect(ability.can(Action.Update, 'users')).toBe(true);
      expect(ability.can(Action.Delete, 'users')).toBe(false);
    });

    it('should handle empty roles array', () => {
      const user = {
        id: 'user-id',
        username: 'norole',
        orgId: 'org-1',
        roles: [],
        permissions: ['read:users'],
      };

      const ability = factory.createForUser(user);

      expect(ability.can(Action.Read, 'users')).toBe(true);
      expect(ability.can(Action.Read, 'User')).toBe(true);
    });

    it('should handle user with both admin role and explicit permissions', () => {
      const user = {
        id: 'user-id',
        username: 'adminwithperms',
        orgId: 'org-1',
        roles: ['admin'],
        permissions: ['read:users', 'create:roles'],
      };

      const ability = factory.createForUser(user);

      // Admin role grants full access, explicit permissions are ignored
      expect(ability.can(Action.Manage, 'all')).toBe(true);
      expect(ability.can(Action.Delete, 'anything')).toBe(true);
    });

    it('should deny all actions except default for user without permissions', () => {
      const user = {
        id: 'user-id',
        username: 'noperms',
        orgId: 'org-1',
        roles: ['guest'],
        permissions: [],
      };

      const ability = factory.createForUser(user);

      expect(ability.can(Action.Read, 'User')).toBe(true); // Default
      expect(ability.can(Action.Read, 'users')).toBe(false);
      expect(ability.can(Action.Create, 'roles')).toBe(false);
      expect(ability.can(Action.Update, 'organizations')).toBe(false);
      expect(ability.can(Action.Delete, 'permissions')).toBe(false);
    });
  });
});
