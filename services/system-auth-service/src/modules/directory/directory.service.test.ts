import 'reflect-metadata';
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { Test } from '@nestjs/testing';
import { DirectoryService } from './directory.service';
import {
  prisma,
  setupTestDatabase,
  resetTestDatabase,
  teardownTestDatabase,
} from '../../../test/prisma';

describe('DirectoryService', () => {
  let service: DirectoryService;

  beforeEach(async () => {
    await setupTestDatabase();
    await resetTestDatabase();

    const moduleRef = await Test.createTestingModule({
      providers: [
        DirectoryService,
        {
          provide: 'PRISMA_CLIENT',
          useValue: prisma,
        },
      ],
    }).compile();

    service = moduleRef.get(DirectoryService);
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  describe('upsertDirectoryNode', () => {
    it('should create a new directory node', async () => {
      const result = await service.upsertDirectoryNode({
        node: {
          name: 'Root',
          code: 'ROOT',
        },
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.nodeId).toBeDefined();
      }
    });

    it('should create a directory node with all fields', async () => {
      const result = await service.upsertDirectoryNode({
        node: {
          name: 'System',
          code: 'SYSTEM',
          attributes: { description: 'System directory', order: 1 },
        },
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.nodeId).toBeDefined();
      }
    });

    it('should create a child directory node', async () => {
      // Create parent
      const parentResult = await service.upsertDirectoryNode({
        node: {
          name: 'Root',
          code: 'ROOT',
        },
      });
      expect(parentResult.ok).toBe(true);
      const parentId = parentResult.ok ? parentResult.data.nodeId : '';

      // Create child
      const childResult = await service.upsertDirectoryNode({
        node: {
          parentId,
          name: 'Child',
          code: 'CHILD',
        },
      });

      expect(childResult.ok).toBe(true);
      if (childResult.ok) {
        expect(childResult.data.nodeId).toBeDefined();
      }
    });

    it('should update an existing directory node by id', async () => {
      // Create
      const createResult = await service.upsertDirectoryNode({
        node: {
          name: 'Original',
          code: 'ORIGINAL',
        },
      });
      expect(createResult.ok).toBe(true);
      const nodeId = createResult.ok ? createResult.data.nodeId : '';

      // Update with same id
      const updateResult = await service.upsertDirectoryNode({
        node: {
          id: nodeId,
          name: 'Updated',
          code: 'UPDATED',
        },
      });

      expect(updateResult.ok).toBe(true);
      if (updateResult.ok) {
        expect(updateResult.data.nodeId).toBe(nodeId);
      }

      // Verify update
      const nodes = await service.listDirectoryTree({});
      expect(nodes.ok).toBe(true);
      const updatedNode = nodes.ok
        ? nodes.data.find((n) => n.id === nodeId)
        : undefined;
      expect(updatedNode?.name).toBe('Updated');
      expect(updatedNode?.code).toBe('UPDATED');
    });

    it('should be idempotent when upserting with same code', async () => {
      // Create with code
      const createResult = await service.upsertDirectoryNode({
        node: {
          name: 'First',
          code: 'UNIQUE_CODE',
        },
      });
      expect(createResult.ok).toBe(true);
      const firstId = createResult.ok ? createResult.data.nodeId : '';

      // Upsert with same code (no id) - should update existing
      const upsertResult = await service.upsertDirectoryNode({
        node: {
          name: 'Second',
          code: 'UNIQUE_CODE',
        },
      });

      expect(upsertResult.ok).toBe(true);
      if (upsertResult.ok) {
        expect(upsertResult.data.nodeId).toBe(firstId);
      }
    });

    it('should return error when updating non-existent node by id', async () => {
      const result = await service.upsertDirectoryNode({
        node: {
          id: 'non-existent-id',
          name: 'Test',
          code: 'TEST',
        },
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe('DIRECTORY_NOT_FOUND');
      }
    });
  });

  describe('listDirectoryTree', () => {
    it('should return empty array when no directory nodes exist', async () => {
      const result = await service.listDirectoryTree({});

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data).toEqual([]);
      }
    });

    it('should list all directory nodes', async () => {
      await service.upsertDirectoryNode({
        node: { name: 'System', code: 'SYSTEM' },
      });
      await service.upsertDirectoryNode({
        node: { name: 'Settings', code: 'SETTINGS' },
      });

      const result = await service.listDirectoryTree({});

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.length).toBe(2);
      }
    });

    it('should filter by parentId', async () => {
      // Create root nodes
      const root1Result = await service.upsertDirectoryNode({
        node: { name: 'Root1', code: 'ROOT1' },
      });
      expect(root1Result.ok).toBe(true);
      const root1Id = root1Result.ok ? root1Result.data.nodeId : '';

      const root2Result = await service.upsertDirectoryNode({
        node: { name: 'Root2', code: 'ROOT2' },
      });
      expect(root2Result.ok).toBe(true);
      const root2Id = root2Result.ok ? root2Result.data.nodeId : '';

      // Create children of root1
      await service.upsertDirectoryNode({
        node: { parentId: root1Id, name: 'Child1', code: 'CHILD1' },
      });
      await service.upsertDirectoryNode({
        node: { parentId: root1Id, name: 'Child2', code: 'CHILD2' },
      });

      // Create child of root2
      await service.upsertDirectoryNode({
        node: { parentId: root2Id, name: 'Child3', code: 'CHILD3' },
      });

      // Filter by root1
      const root1Children = await service.listDirectoryTree({
        parentId: root1Id,
      });
      expect(root1Children.ok).toBe(true);
      if (root1Children.ok) {
        expect(root1Children.data.length).toBe(2);
        expect(root1Children.data.every((n) => n.parentId === root1Id)).toBe(
          true
        );
      }
    });

    it('should search by keyword in name', async () => {
      await service.upsertDirectoryNode({
        node: { name: 'System Administration', code: 'SYS_ADMIN' },
      });
      await service.upsertDirectoryNode({
        node: { name: 'User Management', code: 'USER_MGMT' },
      });
      await service.upsertDirectoryNode({
        node: { name: 'System Settings', code: 'SYS_SETTINGS' },
      });

      const result = await service.listDirectoryTree({ keyword: 'System' });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.length).toBe(2);
        expect(result.data.every((n) => n.name.includes('System'))).toBe(true);
      }
    });

    it('should search by keyword in code', async () => {
      await service.upsertDirectoryNode({
        node: { name: 'Admin Panel', code: 'ADMIN_PANEL' },
      });
      await service.upsertDirectoryNode({
        node: { name: 'User Panel', code: 'USER_PANEL' },
      });
      await service.upsertDirectoryNode({
        node: { name: 'Settings', code: 'SETTINGS' },
      });

      const result = await service.listDirectoryTree({ keyword: 'PANEL' });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.length).toBe(2);
        expect(result.data.every((n) => n.code.includes('PANEL'))).toBe(true);
      }
    });
  });

  describe('deleteDirectoryNode', () => {
    it('should delete an existing directory node', async () => {
      const createResult = await service.upsertDirectoryNode({
        node: { name: 'ToDelete', code: 'TO_DELETE' },
      });
      expect(createResult.ok).toBe(true);
      const nodeId = createResult.ok ? createResult.data.nodeId : '';

      const result = await service.deleteDirectoryNode({ nodeId });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.success).toBe(true);
      }

      // Verify deletion
      const nodes = await service.listDirectoryTree({});
      expect(nodes.ok).toBe(true);
      if (nodes.ok) {
        expect(nodes.data.find((n) => n.id === nodeId)).toBeUndefined();
      }
    });

    it('should be idempotent when deleting non-existent node', async () => {
      const result = await service.deleteDirectoryNode({
        nodeId: 'non-existent-id',
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.success).toBe(true);
      }
    });

    it('should recursively delete child nodes', async () => {
      // Create parent
      const parentResult = await service.upsertDirectoryNode({
        node: { name: 'Parent', code: 'PARENT' },
      });
      expect(parentResult.ok).toBe(true);
      const parentId = parentResult.ok ? parentResult.data.nodeId : '';

      // Create children
      const child1Result = await service.upsertDirectoryNode({
        node: { parentId, name: 'Child1', code: 'CHILD1' },
      });
      expect(child1Result.ok).toBe(true);
      const child1Id = child1Result.ok ? child1Result.data.nodeId : '';

      // Create grandchild
      const grandchildResult = await service.upsertDirectoryNode({
        node: { parentId: child1Id, name: 'Grandchild', code: 'GRANDCHILD' },
      });
      expect(grandchildResult.ok).toBe(true);
      const grandchildId = grandchildResult.ok
        ? grandchildResult.data.nodeId
        : '';

      // Delete parent
      await service.deleteDirectoryNode({ nodeId: parentId });

      // Verify all are deleted
      const nodes = await service.listDirectoryTree({});
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
