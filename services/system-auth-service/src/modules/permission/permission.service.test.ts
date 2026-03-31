import 'reflect-metadata';
import { describe, it, expect, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionService } from './permission.service';
import { PermissionEntity } from '../../entities/Permission.entity';
import { RolePermissionEntity } from '../../entities/RolePermission.entity';
import { RoleEntity } from '../../entities/Role.entity';
import { UserEntity } from '../../entities/User.entity';
import { UserRoleEntity } from '../../entities/UserRole.entity';
import { OrganizationEntity } from '../../entities/Organization.entity';
import { DataSource } from 'typeorm';

describe('PermissionService', () => {
  let service: PermissionService;
  let dataSource: DataSource;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [
            PermissionEntity,
            RolePermissionEntity,
            RoleEntity,
            UserEntity,
            UserRoleEntity,
            OrganizationEntity,
          ],
          synchronize: true,
          logging: false,
        }),
        TypeOrmModule.forFeature([
          PermissionEntity,
          RolePermissionEntity,
          RoleEntity,
        ]),
      ],
      providers: [PermissionService],
    }).compile();

    service = moduleRef.get(PermissionService);
    dataSource = moduleRef.get(DataSource);

    await dataSource.dropDatabase();
    await dataSource.synchronize(true);
  });

  describe('createPermission', () => {
    it('should create a permission with URI type', async () => {
      const result = await service.createPermission({
        permission: {
          type: 'URI',
          name: 'Read Users',
          code: 'users:read',
          resource: '/api/users',
        },
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.permissionId).toBeDefined();
      }
    });

    it('should create a permission with PAGE_ELEMENT type', async () => {
      const result = await service.createPermission({
        permission: {
          type: 'PAGE_ELEMENT',
          name: 'Delete Button',
          code: 'button:delete',
          resource: '#delete-btn',
        },
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.permissionId).toBeDefined();
      }
    });

    it('should not allow duplicate permission codes', async () => {
      await service.createPermission({
        permission: {
          type: 'URI',
          name: 'Read Users',
          code: 'users:read',
          resource: '/api/users',
        },
      });

      const result = await service.createPermission({
        permission: {
          type: 'URI',
          name: 'Read Users 2',
          code: 'users:read',
          resource: '/api/users',
        },
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe('INVALID_ARGUMENT');
      }
    });
  });

  describe('listPermissions', () => {
    it('should list all permissions', async () => {
      await service.createPermission({
        permission: {
          type: 'URI',
          name: 'Read Users',
          code: 'users:read',
          resource: '/api/users',
        },
      });
      await service.createPermission({
        permission: {
          type: 'URI',
          name: 'Write Users',
          code: 'users:write',
          resource: '/api/users',
        },
      });

      const result = await service.listPermissions({
        page: { page: 1, pageSize: 10 },
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.items.length).toBe(2);
        expect(result.data.total).toBe(2);
      }
    });

    it('should filter permissions by keyword', async () => {
      await service.createPermission({
        permission: {
          type: 'URI',
          name: 'Read Users',
          code: 'users:read',
          resource: '/api/users',
        },
      });
      await service.createPermission({
        permission: {
          type: 'URI',
          name: 'Read Products',
          code: 'products:read',
          resource: '/api/products',
        },
      });

      const result = await service.listPermissions({
        keyword: 'users',
        page: { page: 1, pageSize: 10 },
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.items.length).toBe(1);
        expect(result.data.items[0].name).toBe('Read Users');
      }
    });

    it('should filter permissions by code', async () => {
      await service.createPermission({
        permission: {
          type: 'URI',
          name: 'Read Users',
          code: 'users:read',
          resource: '/api/users',
        },
      });
      await service.createPermission({
        permission: {
          type: 'URI',
          name: 'Read Products',
          code: 'products:read',
          resource: '/api/products',
        },
      });

      const result = await service.listPermissions({
        keyword: 'products:read',
        page: { page: 1, pageSize: 10 },
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.items.length).toBe(1);
        expect(result.data.items[0].code).toBe('products:read');
      }
    });

    it('should support pagination', async () => {
      // Create 15 permissions
      for (let i = 0; i < 15; i++) {
        await service.createPermission({
          permission: {
            type: 'URI',
            name: `Permission ${i}`,
            code: `perm:${i}`,
            resource: `/api/resource/${i}`,
          },
        });
      }

      const page1 = await service.listPermissions({
        page: { page: 1, pageSize: 10 },
      });
      expect(page1.ok).toBe(true);
      if (page1.ok) {
        expect(page1.data.items.length).toBe(10);
        expect(page1.data.total).toBe(15);
      }

      const page2 = await service.listPermissions({
        page: { page: 2, pageSize: 10 },
      });
      expect(page2.ok).toBe(true);
      if (page2.ok) {
        expect(page2.data.items.length).toBe(5);
      }
    });

    it('should return empty result when no permissions exist', async () => {
      const result = await service.listPermissions({
        page: { page: 1, pageSize: 10 },
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.items.length).toBe(0);
        expect(result.data.total).toBe(0);
      }
    });

    it('should return empty result when no permissions match keyword', async () => {
      await service.createPermission({
        permission: {
          type: 'URI',
          name: 'Read Users',
          code: 'users:read',
          resource: '/api/users',
        },
      });

      const result = await service.listPermissions({
        keyword: 'nonexistent',
        page: { page: 1, pageSize: 10 },
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.items.length).toBe(0);
      }
    });
  });

  describe('bindPermissionsToRole', () => {
    let roleId: string;
    let permId1: string;
    let permId2: string;

    beforeEach(async () => {
      const roleRepo = dataSource.getRepository(RoleEntity);
      const role = roleRepo.create({
        name: 'Test Role',
        code: 'test-role',
        enabled: true,
      });
      await roleRepo.save(role);
      roleId = role.id;

      const permResult1 = await service.createPermission({
        permission: {
          type: 'URI',
          name: 'Read Users',
          code: 'users:read',
          resource: '/api/users',
        },
      });
      expect(permResult1.ok).toBe(true);
      permId1 = permResult1.ok ? permResult1.data.permissionId : '';

      const permResult2 = await service.createPermission({
        permission: {
          type: 'URI',
          name: 'Write Users',
          code: 'users:write',
          resource: '/api/users',
        },
      });
      expect(permResult2.ok).toBe(true);
      permId2 = permResult2.ok ? permResult2.data.permissionId : '';
    });

    it('should bind permissions to a role', async () => {
      const result = await service.bindPermissionsToRole({
        roleId,
        permissionIds: [permId1, permId2],
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.success).toBe(true);
      }
    });

    it('should be idempotent - binding same permissions twice is fine', async () => {
      // First bind
      await service.bindPermissionsToRole({
        roleId,
        permissionIds: [permId1, permId2],
      });

      // Second bind (should not fail)
      const result = await service.bindPermissionsToRole({
        roleId,
        permissionIds: [permId1, permId2],
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.success).toBe(true);
      }
    });

    it('should throw ROLE_NOT_FOUND for non-existent role', async () => {
      await expect(
        service.bindPermissionsToRole({
          roleId: 'non-existent-id',
          permissionIds: [permId1],
        })
      ).rejects.toThrow('Role not found');
    });

    it('should throw PERMISSION_NOT_FOUND for non-existent permission', async () => {
      await expect(
        service.bindPermissionsToRole({
          roleId,
          permissionIds: ['non-existent-perm-id'],
        })
      ).rejects.toThrow('One or more permissions not found');
    });

    it('should replace existing permissions with new ones', async () => {
      const permResult3 = await service.createPermission({
        permission: {
          type: 'URI',
          name: 'Delete Users',
          code: 'users:delete',
          resource: '/api/users',
        },
      });
      expect(permResult3.ok).toBe(true);
      const permId3 = permResult3.ok ? permResult3.data.permissionId : '';

      // Bind initial permissions
      await service.bindPermissionsToRole({
        roleId,
        permissionIds: [permId1, permId2],
      });

      // Bind different permissions (should replace)
      await service.bindPermissionsToRole({
        roleId,
        permissionIds: [permId3],
      });

      // Verify only permId3 is bound
      const rolePermRepo = dataSource.getRepository(RolePermissionEntity);
      const bindings = await rolePermRepo.find({ where: { roleId } });
      expect(bindings.length).toBe(1);
      expect(bindings[0].permissionId).toBe(permId3);
    });

    it('should allow binding empty array to clear all permissions', async () => {
      // Bind initial permissions
      await service.bindPermissionsToRole({
        roleId,
        permissionIds: [permId1, permId2],
      });

      // Clear all permissions
      const result = await service.bindPermissionsToRole({
        roleId,
        permissionIds: [],
      });

      expect(result.ok).toBe(true);

      const rolePermRepo = dataSource.getRepository(RolePermissionEntity);
      const bindings = await rolePermRepo.find({ where: { roleId } });
      expect(bindings.length).toBe(0);
    });
  });

  describe('findById', () => {
    it('should find a permission by id', async () => {
      const createResult = await service.createPermission({
        permission: {
          type: 'URI',
          name: 'Read Users',
          code: 'users:read',
          resource: '/api/users',
        },
      });
      expect(createResult.ok).toBe(true);
      const permissionId = createResult.ok
        ? createResult.data.permissionId
        : '';

      const permission = await service.findById(permissionId);

      expect(permission).not.toBeNull();
      expect(permission?.name).toBe('Read Users');
      expect(permission?.code).toBe('users:read');
    });

    it('should return null for non-existent permission', async () => {
      const permission = await service.findById('non-existent-id');

      expect(permission).toBeNull();
    });
  });
});
