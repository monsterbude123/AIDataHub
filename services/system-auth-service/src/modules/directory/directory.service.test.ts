import 'reflect-metadata';
import { describe, it, expect, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DirectoryService } from './directory.service';
import { DirectoryTreeNodeEntity } from '../../entities/DirectoryTreeNode.entity';
import { DataSource } from 'typeorm';

describe('DirectoryService', () => {
  let service: DirectoryService;
  let dataSource: DataSource;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [DirectoryTreeNodeEntity],
          synchronize: true,
          logging: false,
        }),
        TypeOrmModule.forFeature([DirectoryTreeNodeEntity]),
      ],
      providers: [DirectoryService],
    }).compile();

    service = moduleRef.get(DirectoryService);
    dataSource = moduleRef.get(DataSource);

    await dataSource.dropDatabase();
    await dataSource.synchronize(true);
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
      expect(result.data?.nodeId).toBeDefined();
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
      expect(result.data?.nodeId).toBeDefined();
    });

    it('should create a child directory node', async () => {
      // Create parent
      const parentResult = await service.upsertDirectoryNode({
        node: {
          name: 'Root',
          code: 'ROOT',
        },
      });
      const parentId = parentResult.data!.nodeId;

      // Create child
      const childResult = await service.upsertDirectoryNode({
        node: {
          parentId,
          name: 'Child',
          code: 'CHILD',
        },
      });

      expect(childResult.ok).toBe(true);
      expect(childResult.data?.nodeId).toBeDefined();
    });

    it('should update an existing directory node by id', async () => {
      // Create
      const createResult = await service.upsertDirectoryNode({
        node: {
          name: 'Original',
          code: 'ORIGINAL',
        },
      });
      const nodeId = createResult.data!.nodeId;

      // Update with same id
      const updateResult = await service.upsertDirectoryNode({
        node: {
          id: nodeId,
          name: 'Updated',
          code: 'UPDATED',
        },
      });

      expect(updateResult.ok).toBe(true);
      expect(updateResult.data?.nodeId).toBe(nodeId);

      // Verify update
      const nodes = await service.listDirectoryTree({});
      const updatedNode = nodes.data?.find((n) => n.id === nodeId);
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
      const firstId = createResult.data!.nodeId;

      // Upsert with same code (no id) - should update existing
      const upsertResult = await service.upsertDirectoryNode({
        node: {
          name: 'Second',
          code: 'UNIQUE_CODE',
        },
      });

      expect(upsertResult.ok).toBe(true);
      expect(upsertResult.data?.nodeId).toBe(firstId);

      // Verify only one node exists
      const nodes = await service.listDirectoryTree({});
      const codeNodes = nodes.data?.filter((n) => n.code === 'UNIQUE_CODE');
      expect(codeNodes?.length).toBe(1);
      expect(codeNodes?.[0].name).toBe('Second');
    });

    it('should update attributes', async () => {
      // Create
      const createResult = await service.upsertDirectoryNode({
        node: {
          name: 'Test',
          code: 'TEST',
          attributes: { key: 'value' },
        },
      });
      const nodeId = createResult.data!.nodeId;

      // Update attributes
      await service.upsertDirectoryNode({
        node: {
          id: nodeId,
          name: 'Test',
          code: 'TEST',
          attributes: { key: 'updated', newKey: 'newValue' },
        },
      });

      // Verify update
      const nodes = await service.listDirectoryTree({});
      const updatedNode = nodes.data?.find((n) => n.id === nodeId);
      expect(updatedNode?.attributes).toEqual({
        key: 'updated',
        newKey: 'newValue',
      });
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
      expect(result.error?.code).toBe('DIRECTORY_NOT_FOUND');
    });
  });

  describe('listDirectoryTree', () => {
    it('should return empty array when no directory nodes exist', async () => {
      const result = await service.listDirectoryTree({});

      expect(result.ok).toBe(true);
      expect(result.data).toEqual([]);
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
      expect(result.data?.length).toBe(2);
    });

    it('should return directory nodes with correct structure', async () => {
      const createResult = await service.upsertDirectoryNode({
        node: {
          name: 'System',
          code: 'SYSTEM',
          attributes: { description: 'System settings' },
        },
      });

      const result = await service.listDirectoryTree({});
      const node = result.data?.find((n) => n.id === createResult.data!.nodeId);

      expect(node).toBeDefined();
      expect(node?.name).toBe('System');
      expect(node?.code).toBe('SYSTEM');
      expect(node?.attributes).toEqual({ description: 'System settings' });
      expect(node?.createdAt).toBeDefined();
      expect(node?.updatedAt).toBeDefined();
    });

    it('should filter by parentId', async () => {
      // Create root nodes
      const root1Result = await service.upsertDirectoryNode({
        node: { name: 'Root1', code: 'ROOT1' },
      });
      const root1Id = root1Result.data!.nodeId;

      const root2Result = await service.upsertDirectoryNode({
        node: { name: 'Root2', code: 'ROOT2' },
      });
      const root2Id = root2Result.data!.nodeId;

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
      expect(root1Children.data?.length).toBe(2);
      expect(root1Children.data?.every((n) => n.parentId === root1Id)).toBe(
        true
      );

      // Filter by root2
      const root2Children = await service.listDirectoryTree({
        parentId: root2Id,
      });
      expect(root2Children.data?.length).toBe(1);
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
      expect(result.data?.length).toBe(2);
      expect(result.data?.every((n) => n.name.includes('System'))).toBe(true);
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
      expect(result.data?.length).toBe(2);
      expect(result.data?.every((n) => n.code.includes('PANEL'))).toBe(true);
    });

    it('should combine parentId and keyword filters', async () => {
      // Create root
      const rootResult = await service.upsertDirectoryNode({
        node: { name: 'Root', code: 'ROOT' },
      });
      const rootId = rootResult.data!.nodeId;

      // Create children
      await service.upsertDirectoryNode({
        node: { parentId: rootId, name: 'System Child', code: 'SYS_CHILD' },
      });
      await service.upsertDirectoryNode({
        node: { parentId: rootId, name: 'Other Child', code: 'OTHER_CHILD' },
      });

      // Create another root with similar name
      await service.upsertDirectoryNode({
        node: { name: 'System Root', code: 'SYS_ROOT' },
      });

      const result = await service.listDirectoryTree({
        parentId: rootId,
        keyword: 'System',
      });

      expect(result.ok).toBe(true);
      expect(result.data?.length).toBe(1);
      expect(result.data?.[0].name).toBe('System Child');
    });
  });

  describe('deleteDirectoryNode', () => {
    it('should delete an existing directory node', async () => {
      const createResult = await service.upsertDirectoryNode({
        node: { name: 'ToDelete', code: 'TO_DELETE' },
      });
      const nodeId = createResult.data!.nodeId;

      const result = await service.deleteDirectoryNode({ nodeId });

      expect(result.ok).toBe(true);
      expect(result.data?.success).toBe(true);

      // Verify deletion
      const nodes = await service.listDirectoryTree({});
      expect(nodes.data?.find((n) => n.id === nodeId)).toBeUndefined();
    });

    it('should be idempotent when deleting non-existent node', async () => {
      const result = await service.deleteDirectoryNode({
        nodeId: 'non-existent-id',
      });

      expect(result.ok).toBe(true);
      expect(result.data?.success).toBe(true);
    });

    it('should recursively delete child nodes', async () => {
      // Create parent
      const parentResult = await service.upsertDirectoryNode({
        node: { name: 'Parent', code: 'PARENT' },
      });
      const parentId = parentResult.data!.nodeId;

      // Create children
      const child1Result = await service.upsertDirectoryNode({
        node: { parentId, name: 'Child1', code: 'CHILD1' },
      });
      const child1Id = child1Result.data!.nodeId;

      // Create grandchild
      const grandchildResult = await service.upsertDirectoryNode({
        node: { parentId: child1Id, name: 'Grandchild', code: 'GRANDCHILD' },
      });
      const grandchildId = grandchildResult.data!.nodeId;

      // Create another child of parent
      const child2Result = await service.upsertDirectoryNode({
        node: { parentId, name: 'Child2', code: 'CHILD2' },
      });
      const child2Id = child2Result.data!.nodeId;

      // Delete parent
      await service.deleteDirectoryNode({ nodeId: parentId });

      // Verify all are deleted
      const nodes = await service.listDirectoryTree({});
      expect(nodes.data?.find((n) => n.id === parentId)).toBeUndefined();
      expect(nodes.data?.find((n) => n.id === child1Id)).toBeUndefined();
      expect(nodes.data?.find((n) => n.id === grandchildId)).toBeUndefined();
      expect(nodes.data?.find((n) => n.id === child2Id)).toBeUndefined();
      expect(nodes.data?.length).toBe(0);
    });

    it('should not delete unrelated nodes when deleting a node', async () => {
      // Create two separate trees
      const tree1Result = await service.upsertDirectoryNode({
        node: { name: 'Tree1', code: 'TREE1' },
      });

      const tree2Result = await service.upsertDirectoryNode({
        node: { name: 'Tree2', code: 'TREE2' },
      });

      // Delete tree1
      await service.deleteDirectoryNode({ nodeId: tree1Result.data!.nodeId });

      // Verify tree2 still exists
      const nodes = await service.listDirectoryTree({});
      expect(nodes.data?.length).toBe(1);
      expect(nodes.data?.[0].name).toBe('Tree2');
    });

    it('should delete a node with deep hierarchy', async () => {
      // Create a deep hierarchy
      let currentId: string | undefined;
      const allIds: string[] = [];

      for (let i = 0; i < 5; i++) {
        const result = await service.upsertDirectoryNode({
          node: {
            parentId: currentId,
            name: `Level${i}`,
            code: `LEVEL${i}`,
          },
        });
        currentId = result.data!.nodeId;
        allIds.push(currentId);
      }

      // Delete the root
      await service.deleteDirectoryNode({ nodeId: allIds[0] });

      // Verify all are deleted
      const nodes = await service.listDirectoryTree({});
      expect(nodes.data?.length).toBe(0);
    });
  });
});
