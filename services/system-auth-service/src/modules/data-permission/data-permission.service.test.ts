import 'reflect-metadata';
import { describe, it, expect, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataPermissionService } from './data-permission.service';
import { DataPermissionEntity } from '../../entities/DataPermission.entity';
import { RoleEntity } from '../../entities/Role.entity';
import { RolePermissionEntity } from '../../entities/RolePermission.entity';
import { PermissionEntity } from '../../entities/Permission.entity';
import { UserEntity } from '../../entities/User.entity';
import { UserRoleEntity } from '../../entities/UserRole.entity';
import { OrganizationEntity } from '../../entities/Organization.entity';
import { DataSource } from 'typeorm';
import { SystemAuthException } from '../../common/errors/system-auth.exception';

describe('DataPermissionService', () => {
  let service: DataPermissionService;
  let dataSource: DataSource;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [
            DataPermissionEntity,
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
        TypeOrmModule.forFeature([DataPermissionEntity, RoleEntity]),
      ],
      providers: [DataPermissionService],
    }).compile();

    service = moduleRef.get(DataPermissionService);
    dataSource = moduleRef.get(DataSource);

    await dataSource.dropDatabase();
    await dataSource.synchronize(true);
  });

  describe('upsertDataPermission', () => {
    let roleId: string;

    beforeEach(async () => {
      const roleRepo = dataSource.getRepository(RoleEntity);
      const role = roleRepo.create({
        name: 'Test Role',
        code: 'test-role',
        enabled: true,
      });
      await roleRepo.save(role);
      roleId = role.id;
    });

    it('should create a new data permission', async () => {
      const result = await service.upsertDataPermission({
        permission: {
          roleId,
          scope: { organization: 'org-1', projects: ['proj-1', 'proj-2'] },
        },
      });

      expect(result.ok).toBe(true);
      expect(result.data?.permissionId).toBeDefined();
    });

    it('should be idempotent - upserting same role updates existing permission', async () => {
      // First upsert
      const result1 = await service.upsertDataPermission({
        permission: {
          roleId,
          scope: { organization: 'org-1' },
        },
      });
      const permissionId = result1.data!.permissionId;

      // Second upsert for same role - should update existing
      const result2 = await service.upsertDataPermission({
        permission: {
          roleId,
          scope: { organization: 'org-2', projects: ['proj-1'] },
        },
      });

      // Should return same permission id (idempotent)
      expect(result2.ok).toBe(true);
      expect(result2.data?.permissionId).toBe(permissionId);

      // Verify scope was updated
      const permRepo = dataSource.getRepository(DataPermissionEntity);
      const perm = await permRepo.findOneBy({ id: permissionId });
      expect(perm?.scope).toEqual({
        organization: 'org-2',
        projects: ['proj-1'],
      });
    });

    it('should update existing permission when id is provided', async () => {
      // Create permission first
      const result1 = await service.upsertDataPermission({
        permission: {
          roleId,
          scope: { organization: 'org-1' },
        },
      });
      const permissionId = result1.data!.permissionId;

      // Update with explicit id
      const result2 = await service.upsertDataPermission({
        permission: {
          id: permissionId,
          roleId,
          scope: { organization: 'org-updated' },
        },
      });

      expect(result2.ok).toBe(true);
      expect(result2.data?.permissionId).toBe(permissionId);

      const permRepo = dataSource.getRepository(DataPermissionEntity);
      const perm = await permRepo.findOneBy({ id: permissionId });
      expect(perm?.scope).toEqual({ organization: 'org-updated' });
    });

    it('should throw ROLE_NOT_FOUND for non-existent role', async () => {
      await expect(
        service.upsertDataPermission({
          permission: {
            roleId: 'non-existent-role-id',
            scope: { organization: 'org-1' },
          },
        })
      ).rejects.toThrow('Role not found');
    });

    it('should throw DATA_PERMISSION_NOT_FOUND for non-existent permission id', async () => {
      await expect(
        service.upsertDataPermission({
          permission: {
            id: 'non-existent-perm-id',
            roleId,
            scope: { organization: 'org-1' },
          },
        })
      ).rejects.toThrow('Data permission not found');
    });

    it('should allow complex scope objects', async () => {
      const result = await service.upsertDataPermission({
        permission: {
          roleId,
          scope: {
            organization: 'org-1',
            projects: ['proj-1', 'proj-2'],
            classificationLevel: 'confidential',
            departments: ['dept-1', 'dept-2'],
            customField: { nested: { value: 123 } },
          },
        },
      });

      expect(result.ok).toBe(true);

      const permRepo = dataSource.getRepository(DataPermissionEntity);
      const perm = await permRepo.findOneBy({ id: result.data!.permissionId });
      expect(perm?.scope).toEqual({
        organization: 'org-1',
        projects: ['proj-1', 'proj-2'],
        classificationLevel: 'confidential',
        departments: ['dept-1', 'dept-2'],
        customField: { nested: { value: 123 } },
      });
    });
  });

  describe('listDataPermissions', () => {
    let roleId: string;

    beforeEach(async () => {
      const roleRepo = dataSource.getRepository(RoleEntity);
      const role = roleRepo.create({
        name: 'Test Role',
        code: 'test-role',
        enabled: true,
      });
      await roleRepo.save(role);
      roleId = role.id;
    });

    it('should list data permissions for a role', async () => {
      // Create multiple data permissions
      await service.upsertDataPermission({
        permission: {
          roleId,
          scope: { organization: 'org-1' },
        },
      });

      const result = await service.listDataPermissions({
        roleId,
        page: { page: 1, size: 10 },
      });

      expect(result.ok).toBe(true);
      expect(result.data?.items?.length).toBe(1);
      expect(result.data?.total).toBe(1);
      expect(result.data?.items?.[0].roleId).toBe(roleId);
    });

    it('should support pagination', async () => {
      // Create a data permission for the role
      await service.upsertDataPermission({
        permission: {
          roleId,
          scope: { organization: 'org-1' },
        },
      });

      // Test pagination for the role with data permission
      const result = await service.listDataPermissions({
        roleId,
        page: { page: 1, size: 10 },
      });

      expect(result.ok).toBe(true);
      expect(result.data?.items?.length).toBe(1);
      expect(result.data?.total).toBe(1);
    });

    it('should return empty result when no permissions exist for role', async () => {
      const result = await service.listDataPermissions({
        roleId,
        page: { page: 1, size: 10 },
      });

      expect(result.ok).toBe(true);
      expect(result.data?.items?.length).toBe(0);
      expect(result.data?.total).toBe(0);
    });

    it('should throw ROLE_NOT_FOUND for non-existent role', async () => {
      await expect(
        service.listDataPermissions({
          roleId: 'non-existent-role-id',
          page: { page: 1, size: 10 },
        })
      ).rejects.toThrow('Role not found');
    });

    it('should return correct pagination metadata', async () => {
      await service.upsertDataPermission({
        permission: {
          roleId,
          scope: { organization: 'org-1' },
        },
      });

      const result = await service.listDataPermissions({
        roleId,
        page: { page: 2, size: 5 },
      });

      expect(result.ok).toBe(true);
      expect(result.data?.page).toBe(2);
      expect(result.data?.size).toBe(5);
    });
  });

  describe('findById', () => {
    let roleId: string;

    beforeEach(async () => {
      const roleRepo = dataSource.getRepository(RoleEntity);
      const role = roleRepo.create({
        name: 'Test Role',
        code: 'test-role',
        enabled: true,
      });
      await roleRepo.save(role);
      roleId = role.id;
    });

    it('should find a data permission by id', async () => {
      const createResult = await service.upsertDataPermission({
        permission: {
          roleId,
          scope: { organization: 'org-1' },
        },
      });
      const permissionId = createResult.data!.permissionId;

      const permission = await service.findById(permissionId);

      expect(permission).not.toBeNull();
      expect(permission?.roleId).toBe(roleId);
      expect(permission?.scope).toEqual({ organization: 'org-1' });
    });

    it('should return null for non-existent permission', async () => {
      const permission = await service.findById('non-existent-id');

      expect(permission).toBeNull();
    });
  });
});
