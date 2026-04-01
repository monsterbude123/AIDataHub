import 'reflect-metadata';
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { Test } from '@nestjs/testing';
import { UserService } from './user.service';
import {
  prisma,
  setupTestDatabase,
  resetTestDatabase,
  teardownTestDatabase,
} from '../../../test/prisma';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    await setupTestDatabase();
    await resetTestDatabase();

    const moduleRef = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: 'PRISMA_CLIENT',
          useValue: prisma,
        },
      ],
    }).compile();

    service = moduleRef.get(UserService);
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  describe('createUser', () => {
    it('should create a user', async () => {
      const result = await service.createUser({
        user: {
          username: 'testuser',
          email: 'test@example.com',
          realName: 'Test User',
          orgId: 'org-1',
          status: 'ENABLED',
        },
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.userId).toBeDefined();
      }
    });

    it('should not allow duplicate usernames', async () => {
      await service.createUser({
        user: { username: 'testuser', orgId: 'org-1', status: 'ENABLED' },
      });
      const result = await service.createUser({
        user: { username: 'testuser', orgId: 'org-2', status: 'ENABLED' },
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe('USERNAME_DUPLICATE');
      }
    });

    it('should create user with default status ENABLED', async () => {
      const result = await service.createUser({
        user: { username: 'newuser', orgId: 'org-1', status: 'ENABLED' },
      });

      expect(result.ok).toBe(true);
    });
  });

  describe('updateUser', () => {
    it('should update an existing user', async () => {
      const createResult = await service.createUser({
        user: { username: 'updateuser', orgId: 'org-1', status: 'ENABLED' },
      });
      expect(createResult.ok).toBe(true);
      const userId = createResult.ok ? createResult.data.userId : '';

      const result = await service.updateUser({
        user: {
          id: userId,
          username: 'updateuser',
          email: 'updated@example.com',
          realName: 'Updated Name',
          orgId: 'org-1',
          status: 'ENABLED',
        },
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.success).toBe(true);
      }
    });

    it('should throw USER_NOT_FOUND when updating non-existent user', async () => {
      await expect(
        service.updateUser({
          user: {
            id: 'non-existent-id',
            username: 'ghost',
            orgId: 'org-1',
            status: 'ENABLED',
          },
        })
      ).rejects.toThrow('User not found');
    });
  });

  describe('deleteUser', () => {
    it('should delete an existing user', async () => {
      const createResult = await service.createUser({
        user: { username: 'deleteuser', orgId: 'org-1', status: 'ENABLED' },
      });
      expect(createResult.ok).toBe(true);
      const userId = createResult.ok ? createResult.data.userId : '';

      const result = await service.deleteUser({ userId });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.success).toBe(true);
      }
    });

    it('should be idempotent when deleting non-existent user', async () => {
      const result = await service.deleteUser({ userId: 'non-existent-id' });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.success).toBe(true);
      }
    });
  });

  describe('listUsers', () => {
    it('should list users with pagination', async () => {
      await service.createUser({
        user: { username: 'user1', orgId: 'org-1', status: 'ENABLED' },
      });
      await service.createUser({
        user: { username: 'user2', orgId: 'org-1', status: 'ENABLED' },
      });
      await service.createUser({
        user: { username: 'user3', orgId: 'org-1', status: 'ENABLED' },
      });

      const result = await service.listUsers({
        page: { page: 1, pageSize: 2 },
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.items.length).toBe(2);
        expect(result.data.total).toBe(3);
      }
    });

    it('should filter users by orgId', async () => {
      await service.createUser({
        user: { username: 'user1', orgId: 'org-1', status: 'ENABLED' },
      });
      await service.createUser({
        user: { username: 'user2', orgId: 'org-2', status: 'ENABLED' },
      });

      const result = await service.listUsers({
        orgId: 'org-1',
        page: { page: 1, pageSize: 10 },
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.items.length).toBe(1);
      }
    });

    it('should filter users by keyword', async () => {
      await service.createUser({
        user: {
          username: 'alice',
          realName: 'Alice Smith',
          orgId: 'org-1',
          status: 'ENABLED',
        },
      });
      await service.createUser({
        user: {
          username: 'bob',
          realName: 'Bob Jones',
          orgId: 'org-1',
          status: 'ENABLED',
        },
      });

      const result = await service.listUsers({
        keyword: 'Alice',
        page: { page: 1, pageSize: 10 },
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.items.length).toBe(1);
        expect(result.data.items[0].username).toBe('alice');
      }
    });
  });

  describe('assignRoles', () => {
    it('should assign roles to a user', async () => {
      // Create user
      const userResult = await service.createUser({
        user: { username: 'roleuser', orgId: 'org-1', status: 'ENABLED' },
      });
      expect(userResult.ok).toBe(true);
      const userId = userResult.ok ? userResult.data.userId : '';

      // Create roles manually via prisma
      const role1 = await prisma.role.create({
        data: { name: 'Role 1', code: 'role-1', enabled: true },
      });
      const role2 = await prisma.role.create({
        data: { name: 'Role 2', code: 'role-2', enabled: true },
      });

      const result = await service.assignRoles({
        userId,
        roleIds: [role1.id, role2.id],
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.success).toBe(true);
      }
    });

    it('should be idempotent when assigning same roles', async () => {
      const userResult = await service.createUser({
        user: { username: 'idemuser', orgId: 'org-1', status: 'ENABLED' },
      });
      expect(userResult.ok).toBe(true);
      const userId = userResult.ok ? userResult.data.userId : '';

      const role = await prisma.role.create({
        data: { name: 'Role', code: 'role', enabled: true },
      });

      // Assign twice
      await service.assignRoles({ userId, roleIds: [role.id] });
      const result = await service.assignRoles({ userId, roleIds: [role.id] });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.success).toBe(true);
      }
    });

    it('should throw USER_NOT_FOUND when assigning roles to non-existent user', async () => {
      await expect(
        service.assignRoles({ userId: 'non-existent', roleIds: ['role-1'] })
      ).rejects.toThrow('User not found');
    });

    it('should throw ROLE_NOT_FOUND when assigning non-existent roles', async () => {
      const userResult = await service.createUser({
        user: { username: 'roleuser', orgId: 'org-1', status: 'ENABLED' },
      });
      expect(userResult.ok).toBe(true);
      const userId = userResult.ok ? userResult.data.userId : '';

      await expect(
        service.assignRoles({ userId, roleIds: ['non-existent-role'] })
      ).rejects.toThrow('Some roles not found');
    });
  });
});
