import 'reflect-metadata';
import { describe, it, expect, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleService } from './role.service';
import { RoleEntity } from '../../entities/Role.entity';
import { RolePermissionEntity } from '../../entities/RolePermission.entity';
import { PermissionEntity } from '../../entities/Permission.entity';
import { UserEntity } from '../../entities/User.entity';
import { UserRoleEntity } from '../../entities/UserRole.entity';
import { OrganizationEntity } from '../../entities/Organization.entity';
import { DataSource } from 'typeorm';

describe('RoleService', () => {
  let service: RoleService;
  let dataSource: DataSource;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [
            RoleEntity,
            RolePermissionEntity,
            PermissionEntity,
            UserEntity,
            UserRoleEntity,
            OrganizationEntity,
          ],
          synchronize: true,
          logging: false,
        }),
        TypeOrmModule.forFeature([
          RoleEntity,
          RolePermissionEntity,
          PermissionEntity,
        ]),
      ],
      providers: [RoleService],
    }).compile();

    service = moduleRef.get(RoleService);
    dataSource = moduleRef.get(DataSource);

    await dataSource.dropDatabase();
    await dataSource.synchronize(true);
  });

  describe('createRole', () => {
    it('should create a role', async () => {
      const result = await service.createRole({
        role: {
          name: 'Admin',
          code: 'admin',
          description: 'Administrator role',
          permissions: [],
        },
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.roleId).toBeDefined();
      }
    });

    it('should not allow duplicate role codes', async () => {
      await service.createRole({
        role: { name: 'Admin', code: 'admin', permissions: [] },
      });
      const result = await service.createRole({
        role: { name: 'Admin 2', code: 'admin', permissions: [] },
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe('INVALID_ARGUMENT');
      }
    });

    it('should create role without description', async () => {
      const result = await service.createRole({
        role: { name: 'User', code: 'user', permissions: [] },
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.roleId).toBeDefined();
      }
    });
  });

  describe('updateRole', () => {
    it('should update an existing role', async () => {
      const createResult = await service.createRole({
        role: { name: 'Admin', code: 'admin', permissions: [] },
      });
      expect(createResult.ok).toBe(true);
      const roleId = createResult.ok ? createResult.data.roleId : '';

      const result = await service.updateRole({
        role: {
          id: roleId,
          name: 'Super Admin',
          code: 'super-admin',
          description: 'Updated description',
          permissions: [],
        },
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.success).toBe(true);
      }
    });

    it('should throw ROLE_NOT_FOUND when updating non-existent role', async () => {
      await expect(
        service.updateRole({
          role: {
            id: 'non-existent-id',
            name: 'Admin',
            code: 'admin',
            permissions: [],
          },
        })
      ).rejects.toThrow('Role not found');
    });
  });

  describe('deleteRole', () => {
    it('should delete an existing role', async () => {
      const createResult = await service.createRole({
        role: { name: 'Admin', code: 'admin', permissions: [] },
      });
      expect(createResult.ok).toBe(true);
      const roleId = createResult.ok ? createResult.data.roleId : '';

      const result = await service.deleteRole({ roleId });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.success).toBe(true);
      }
    });

    it('should be idempotent when deleting non-existent role', async () => {
      const result = await service.deleteRole({ roleId: 'non-existent-id' });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.success).toBe(true);
      }
    });

    it('should delete role permissions when deleting role', async () => {
      const permRepo = dataSource.getRepository(PermissionEntity);
      const rolePermRepo = dataSource.getRepository(RolePermissionEntity);

      // Create permission
      const perm = permRepo.create({
        type: 'URI',
        name: 'Test Permission',
        code: 'test-perm',
        resource: '/test',
      });
      await permRepo.save(perm);

      // Create role
      const createResult = await service.createRole({
        role: { name: 'Admin', code: 'admin', permissions: [] },
      });
      expect(createResult.ok).toBe(true);
      const roleId = createResult.ok ? createResult.data.roleId : '';

      // Add role permission manually
      const rolePerm = rolePermRepo.create({ roleId, permissionId: perm.id });
      await rolePermRepo.save(rolePerm);

      // Delete role
      await service.deleteRole({ roleId });

      // Verify role permissions are deleted
      const remainingRolePerms = await rolePermRepo.find({ where: { roleId } });
      expect(remainingRolePerms.length).toBe(0);
    });
  });

  describe('listRoles', () => {
    it('should list all roles', async () => {
      await service.createRole({
        role: { name: 'Admin', code: 'admin', permissions: [] },
      });
      await service.createRole({
        role: { name: 'User', code: 'user', permissions: [] },
      });

      const result = await service.listRoles({});

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.length).toBe(2);
      }
    });

    it('should filter roles by keyword', async () => {
      await service.createRole({
        role: { name: 'Administrator', code: 'admin', permissions: [] },
      });
      await service.createRole({
        role: { name: 'User', code: 'user', permissions: [] },
      });
      await service.createRole({
        role: { name: 'Manager', code: 'manager', permissions: [] },
      });

      const result = await service.listRoles({ keyword: 'admin' });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.length).toBe(1);
        expect(result.data[0].name).toBe('Administrator');
      }
    });

    it('should filter roles by code', async () => {
      await service.createRole({
        role: { name: 'Administrator', code: 'admin', permissions: [] },
      });
      await service.createRole({
        role: { name: 'User', code: 'user', permissions: [] },
      });

      const result = await service.listRoles({ keyword: 'user' });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.length).toBe(1);
        expect(result.data[0].code).toBe('user');
      }
    });

    it('should return empty array when no roles match keyword', async () => {
      await service.createRole({
        role: { name: 'Admin', code: 'admin', permissions: [] },
      });

      const result = await service.listRoles({ keyword: 'nonexistent' });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.length).toBe(0);
      }
    });

    it('should include permissions in role list', async () => {
      const permRepo = dataSource.getRepository(PermissionEntity);
      const rolePermRepo = dataSource.getRepository(RolePermissionEntity);

      // Create permissions
      const perm1 = permRepo.create({
        type: 'URI',
        name: 'Read Users',
        code: 'users:read',
        resource: '/users',
      });
      const perm2 = permRepo.create({
        type: 'URI',
        name: 'Write Users',
        code: 'users:write',
        resource: '/users',
      });
      await permRepo.save([perm1, perm2]);

      // Create role
      const createResult = await service.createRole({
        role: { name: 'Admin', code: 'admin', permissions: [] },
      });
      expect(createResult.ok).toBe(true);
      const roleId = createResult.ok ? createResult.data.roleId : '';

      // Add role permissions
      const rolePerm1 = rolePermRepo.create({ roleId, permissionId: perm1.id });
      const rolePerm2 = rolePermRepo.create({ roleId, permissionId: perm2.id });
      await rolePermRepo.save([rolePerm1, rolePerm2]);

      // List roles
      const result = await service.listRoles({});

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data[0].permissions).toContain('users:read');
        expect(result.data[0].permissions).toContain('users:write');
      }
    });
  });

  describe('findById', () => {
    it('should find a role by id', async () => {
      const createResult = await service.createRole({
        role: { name: 'Admin', code: 'admin', permissions: [] },
      });
      expect(createResult.ok).toBe(true);
      const roleId = createResult.ok ? createResult.data.roleId : '';

      const role = await service.findById(roleId);

      expect(role).not.toBeNull();
      expect(role?.name).toBe('Admin');
      expect(role?.code).toBe('admin');
    });

    it('should return null for non-existent role', async () => {
      const role = await service.findById('non-existent-id');

      expect(role).toBeNull();
    });
  });
});
