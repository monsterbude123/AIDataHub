import 'reflect-metadata';
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { Test } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { AuthService } from './auth.service';
import { CaslAbilityFactory, Action } from './casl-ability.factory';
import {
  prisma,
  setupTestDatabase,
  resetTestDatabase,
  teardownTestDatabase,
} from '../../../test/prisma';

// Helper to generate unique codes for test isolation
const uniqueId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    await setupTestDatabase();
    await resetTestDatabase();

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: 'PRISMA_CLIENT',
          useValue: prisma,
        },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const id = uniqueId();
      const org = await prisma.organization.create({
        data: { name: 'Test Org', code: `test-org-${id}`, status: 'ENABLED' },
      });

      const passwordHash = await bcrypt.hash('password123', 10);
      const user = await prisma.user.create({
        data: {
          username: `testuser-${id}`,
          passwordHash,
          orgId: org.id,
          status: 'ENABLED',
        },
      });

      const role = await prisma.role.create({
        data: { name: 'Test Role', code: `test-role-${id}`, enabled: true },
      });

      await prisma.userRole.create({
        data: { userId: user.id, roleId: role.id },
      });

      const result = await service.login({
        username: `testuser-${id}`,
        password: 'password123',
      });

      expect(result.token).toBeDefined();
      expect(result.user.username).toBe(`testuser-${id}`);
      expect(result.roles).toContain(`test-role-${id}`);
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      await expect(
        service.login({ username: 'nonexistent', password: 'password' })
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for disabled user', async () => {
      const id = uniqueId();
      const org = await prisma.organization.create({
        data: { name: 'Test Org', code: `test-org-${id}`, status: 'ENABLED' },
      });

      const passwordHash = await bcrypt.hash('password123', 10);
      await prisma.user.create({
        data: {
          username: `disableduser-${id}`,
          passwordHash,
          orgId: org.id,
          status: 'DISABLED',
        },
      });

      await expect(
        service.login({
          username: `disableduser-${id}`,
          password: 'password123',
        })
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      const id = uniqueId();
      const org = await prisma.organization.create({
        data: { name: 'Test Org', code: `test-org-${id}`, status: 'ENABLED' },
      });

      const passwordHash = await bcrypt.hash('correctpassword', 10);
      await prisma.user.create({
        data: {
          username: `testuser-${id}`,
          passwordHash,
          orgId: org.id,
          status: 'ENABLED',
        },
      });

      await expect(
        service.login({ username: `testuser-${id}`, password: 'wrongpassword' })
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for user without password', async () => {
      const id = uniqueId();
      const org = await prisma.organization.create({
        data: { name: 'Test Org', code: `test-org-${id}`, status: 'ENABLED' },
      });

      await prisma.user.create({
        data: {
          username: `nopassworduser-${id}`,
          orgId: org.id,
          status: 'ENABLED',
        },
      });

      await expect(
        service.login({
          username: `nopassworduser-${id}`,
          password: 'password',
        })
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should generate valid JWT token', async () => {
      const id = uniqueId();
      const org = await prisma.organization.create({
        data: { name: 'Test Org', code: `test-org-${id}`, status: 'ENABLED' },
      });

      const passwordHash = await bcrypt.hash('password123', 10);
      const user = await prisma.user.create({
        data: {
          username: `jwtuser-${id}`,
          passwordHash,
          orgId: org.id,
          status: 'ENABLED',
        },
      });

      const result = await service.login({
        username: `jwtuser-${id}`,
        password: 'password123',
      });

      const decoded = jwt.verify(result.token, 'dev-secret') as jwt.JwtPayload;
      expect(decoded.userId).toBe(user.id);
      expect(decoded.username).toBe(`jwtuser-${id}`);
    });
  });

  describe('validateToken', () => {
    it('should validate a valid token and return user', async () => {
      const id = uniqueId();
      const org = await prisma.organization.create({
        data: { name: 'Test Org', code: `test-org-${id}`, status: 'ENABLED' },
      });

      const passwordHash = await bcrypt.hash('password123', 10);
      const user = await prisma.user.create({
        data: {
          username: `validateuser-${id}`,
          passwordHash,
          orgId: org.id,
          status: 'ENABLED',
        },
      });

      const role = await prisma.role.create({
        data: { name: 'Test Role', code: `test-role-${id}`, enabled: true },
      });

      const perm = await prisma.permission.create({
        data: {
          type: 'URI',
          name: 'Test Permission',
          code: `read:users-${id}`,
          resource: '/api/users',
        },
      });

      await prisma.userRole.create({
        data: { userId: user.id, roleId: role.id },
      });

      await prisma.rolePermission.create({
        data: { roleId: role.id, permissionId: perm.id },
      });

      const token = jwt.sign(
        {
          userId: user.id,
          username: user.username,
          roles: [`test-role-${id}`],
        },
        'dev-secret',
        { expiresIn: '24h' }
      );

      const authUser = await service.validateToken(token);

      expect(authUser).toBeDefined();
      expect(authUser?.username).toBe(`validateuser-${id}`);
      expect(authUser?.roles).toContain(`test-role-${id}`);
      expect(authUser?.permissions).toContain(`read:users-${id}`);
    });

    it('should return null for invalid token', async () => {
      const result = await service.validateToken('invalid-token');
      expect(result).toBeNull();
    });

    it('should return null for disabled user', async () => {
      const id = uniqueId();
      const org = await prisma.organization.create({
        data: { name: 'Test Org', code: `test-org-${id}`, status: 'ENABLED' },
      });

      const passwordHash = await bcrypt.hash('password123', 10);
      const user = await prisma.user.create({
        data: {
          username: `disabledtokenuser-${id}`,
          passwordHash,
          orgId: org.id,
          status: 'DISABLED',
        },
      });

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
      const id = uniqueId();
      const org = await prisma.organization.create({
        data: { name: 'Test Org', code: `test-org-${id}`, status: 'ENABLED' },
      });

      const passwordHash = await bcrypt.hash('password123', 10);
      const user = await prisma.user.create({
        data: {
          username: `permuser-${id}`,
          passwordHash,
          orgId: org.id,
          status: 'ENABLED',
        },
      });

      const role = await prisma.role.create({
        data: { name: 'Perm Role', code: `perm-role-${id}`, enabled: true },
      });

      const perm1 = await prisma.permission.create({
        data: {
          type: 'URI',
          name: 'Read Users',
          code: `read:users-${id}`,
          resource: '/api/users',
        },
      });
      const perm2 = await prisma.permission.create({
        data: {
          type: 'URI',
          name: 'Create Users',
          code: `create:users-${id}`,
          resource: '/api/users',
        },
      });

      await prisma.userRole.create({
        data: { userId: user.id, roleId: role.id },
      });

      await prisma.rolePermission.create({
        data: { roleId: role.id, permissionId: perm1.id },
      });
      await prisma.rolePermission.create({
        data: { roleId: role.id, permissionId: perm2.id },
      });

      const permissions = await service.getPermissionsForUser(user.id);

      expect(permissions).toContain(`read:users-${id}`);
      expect(permissions).toContain(`create:users-${id}`);
    });

    it('should return empty array for user without roles', async () => {
      const id = uniqueId();
      const org = await prisma.organization.create({
        data: { name: 'Test Org', code: `test-org-${id}`, status: 'ENABLED' },
      });

      const user = await prisma.user.create({
        data: {
          username: `noroleuser-${id}`,
          orgId: org.id,
          status: 'ENABLED',
        },
      });

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
        permissions: [],
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

      expect(ability.can(Action.Manage, 'all')).toBe(false);
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
          'invalidformat',
          'read:',
          ':users',
          'unknown:resource',
          'read:valid',
        ],
      };

      const ability = factory.createForUser(user);

      expect(ability.can(Action.Read, 'valid')).toBe(true);
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

      expect(ability.can(Action.Read, 'User')).toBe(true);
      expect(ability.can(Action.Read, 'users')).toBe(false);
      expect(ability.can(Action.Create, 'roles')).toBe(false);
      expect(ability.can(Action.Update, 'organizations')).toBe(false);
      expect(ability.can(Action.Delete, 'permissions')).toBe(false);
    });
  });
});
