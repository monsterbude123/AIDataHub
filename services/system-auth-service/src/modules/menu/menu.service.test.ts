import 'reflect-metadata';
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { Test } from '@nestjs/testing';
import { MenuService } from './menu.service';
import {
  prisma,
  setupTestDatabase,
  resetTestDatabase,
  teardownTestDatabase,
} from '../../../test/prisma';

describe('MenuService', () => {
  let service: MenuService;

  beforeEach(async () => {
    await setupTestDatabase();
    await resetTestDatabase();

    const moduleRef = await Test.createTestingModule({
      providers: [
        MenuService,
        {
          provide: 'PRISMA_CLIENT',
          useValue: prisma,
        },
      ],
    }).compile();

    service = moduleRef.get(MenuService);
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  describe('upsertMenuNode', () => {
    it('should create a new menu node', async () => {
      const result = await service.upsertMenuNode({
        node: {
          type: 'DIRECTORY',
          name: 'System',
          enabled: true,
        },
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.nodeId).toBeDefined();
      }
    });

    it('should create a menu node with all fields', async () => {
      const result = await service.upsertMenuNode({
        node: {
          type: 'MENU',
          name: 'User Management',
          path: '/system/users',
          icon: 'user',
          permissionCode: 'system:user:view',
          enabled: true,
          sort: 1,
        },
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.nodeId).toBeDefined();
      }
    });

    it('should create a child menu node', async () => {
      // Create parent
      const parentResult = await service.upsertMenuNode({
        node: {
          type: 'DIRECTORY',
          name: 'System',
          enabled: true,
        },
      });
      expect(parentResult.ok).toBe(true);
      const parentId = parentResult.ok ? parentResult.data.nodeId : '';

      // Create child
      const childResult = await service.upsertMenuNode({
        node: {
          parentId,
          type: 'MENU',
          name: 'Users',
          path: '/system/users',
          enabled: true,
        },
      });

      expect(childResult.ok).toBe(true);
      if (childResult.ok) {
        expect(childResult.data.nodeId).toBeDefined();
      }
    });

    it('should update an existing menu node (idempotent)', async () => {
      // Create
      const createResult = await service.upsertMenuNode({
        node: {
          type: 'DIRECTORY',
          name: 'System',
          enabled: true,
        },
      });
      expect(createResult.ok).toBe(true);
      const nodeId = createResult.ok ? createResult.data.nodeId : '';

      // Update with same id
      const updateResult = await service.upsertMenuNode({
        node: {
          id: nodeId,
          type: 'DIRECTORY',
          name: 'System Management',
          enabled: false,
          sort: 10,
        },
      });

      expect(updateResult.ok).toBe(true);
      if (updateResult.ok) {
        expect(updateResult.data.nodeId).toBe(nodeId);
      }

      // Verify update
      const nodes = await service.listMenuTree({});
      expect(nodes.ok).toBe(true);
      if (nodes.ok) {
        expect(nodes.data.find((n) => n.id === nodeId)?.name).toBe(
          'System Management'
        );
        expect(nodes.data.find((n) => n.id === nodeId)?.enabled).toBe(false);
        expect(nodes.data.find((n) => n.id === nodeId)?.sort).toBe(10);
      }
    });

    it('should create button type menu node', async () => {
      const result = await service.upsertMenuNode({
        node: {
          type: 'BUTTON',
          name: 'Create User',
          permissionCode: 'system:user:create',
          enabled: true,
        },
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.nodeId).toBeDefined();
      }
    });
  });

  describe('listMenuTree', () => {
    it('should return empty array when no menu nodes exist', async () => {
      const result = await service.listMenuTree({});

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data).toEqual([]);
      }
    });

    it('should list all menu nodes', async () => {
      await service.upsertMenuNode({
        node: { type: 'DIRECTORY', name: 'System', enabled: true },
      });
      await service.upsertMenuNode({
        node: { type: 'DIRECTORY', name: 'Settings', enabled: true },
      });

      const result = await service.listMenuTree({});

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.length).toBe(2);
      }
    });
  });

  describe('deleteMenuNode', () => {
    it('should delete an existing menu node', async () => {
      const createResult = await service.upsertMenuNode({
        node: { type: 'DIRECTORY', name: 'System', enabled: true },
      });
      expect(createResult.ok).toBe(true);
      const nodeId = createResult.ok ? createResult.data.nodeId : '';

      const result = await service.deleteMenuNode({ nodeId });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.success).toBe(true);
      }

      // Verify deletion
      const nodes = await service.listMenuTree({});
      expect(nodes.ok).toBe(true);
      if (nodes.ok) {
        expect(nodes.data.find((n) => n.id === nodeId)).toBeUndefined();
      }
    });

    it('should be idempotent when deleting non-existent node', async () => {
      const result = await service.deleteMenuNode({
        nodeId: 'non-existent-id',
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.success).toBe(true);
      }
    });

    it('should recursively delete child nodes', async () => {
      // Create parent
      const parentResult = await service.upsertMenuNode({
        node: { type: 'DIRECTORY', name: 'System', enabled: true },
      });
      expect(parentResult.ok).toBe(true);
      const parentId = parentResult.ok ? parentResult.data.nodeId : '';

      // Create children
      const child1Result = await service.upsertMenuNode({
        node: {
          parentId,
          type: 'MENU',
          name: 'Users',
          path: '/system/users',
          enabled: true,
        },
      });
      expect(child1Result.ok).toBe(true);
      const child1Id = child1Result.ok ? child1Result.data.nodeId : '';

      // Create grandchild
      const grandchildResult = await service.upsertMenuNode({
        node: {
          parentId: child1Id,
          type: 'BUTTON',
          name: 'Create User',
          permissionCode: 'system:user:create',
          enabled: true,
        },
      });
      expect(grandchildResult.ok).toBe(true);
      const grandchildId = grandchildResult.ok
        ? grandchildResult.data.nodeId
        : '';

      // Delete parent
      await service.deleteMenuNode({ nodeId: parentId });

      // Verify all are deleted
      const nodes = await service.listMenuTree({});
      expect(nodes.ok).toBe(true);
      if (nodes.ok) {
        expect(nodes.data.find((n) => n.id === parentId)).toBeUndefined();
        expect(nodes.data.find((n) => n.id === child1Id)).toBeUndefined();
        expect(nodes.data.find((n) => n.id === grandchildId)).toBeUndefined();
        expect(nodes.data.length).toBe(0);
      }
    });
  });
});
