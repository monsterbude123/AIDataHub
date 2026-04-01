import 'reflect-metadata';
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { Test } from '@nestjs/testing';
import { RoleService } from './role.service';
import {
  prisma,
  setupTestDatabase,
  resetTestDatabase,
  teardownTestDatabase,
} from '../../../test/prisma';

describe('RoleService', () => {
  let service: RoleService;

  beforeEach(async () => {
    await setupTestDatabase();
    await resetTestDatabase();

    const moduleRef = await Test.createTestingModule({
      providers: [
        RoleService,
        {
          provide: 'PRISMA_CLIENT',
          useValue: prisma,
        },
      ],
    }).compile();

    service = moduleRef.get(RoleService);
  });

  afterAll(async () => {
    await teardownTestDatabase();
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
      // Create permission
      const perm = await prisma.permission.create({
        data: {
          type: 'URI',
          name: 'Test Permission',
          code: 'test-perm',
          resource: '/test',
        },
      });

      // Create role
      const createResult = await service.createRole({
        role: { name: 'Admin', code: 'admin', permissions: [] },
      });
      expect(createResult.ok).toBe(true);
      const roleId = createResult.ok ? createResult.data.roleId : '';

      // Add role permission manually
      await prisma.rolePermission.create({
        data: { roleId, permissionId: perm.id },
      });

      // Delete role
      await service.deleteRole({ roleId });

      // Verify role permissions are deleted
      const remainingRolePerms = await prisma.rolePermission.findMany({
        where: { roleId },
      });
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
      // Create permissions
      const perm1 = await prisma.permission.create({
        data: {
          type: 'URI',
          name: 'Read Users',
          code: 'users:read',
          resource: '/users',
        },
      });
      const perm2 = await prisma.permission.create({
        data: {
          type: 'URI',
          name: 'Write Users',
          code: 'users:write',
          resource: '/users',
        },
      });

      // Create role
      const createResult = await service.createRole({
        role: { name: 'Admin', code: 'admin', permissions: [] },
      });
      expect(createResult.ok).toBe(true);
      const roleId = createResult.ok ? createResult.data.roleId : '';

      // Add role permissions
      await prisma.rolePermission.create({
        data: { roleId, permissionId: perm1.id },
      });
      await prisma.rolePermission.create({
        data: { roleId, permissionId: perm2.id },
      });

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
