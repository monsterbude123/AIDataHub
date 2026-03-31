import 'reflect-metadata';
import { describe, it, expect, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuService } from './menu.service';
import { MenuNodeEntity } from '../../entities/MenuNode.entity';
import { DataSource } from 'typeorm';

describe('MenuService', () => {
  let service: MenuService;
  let dataSource: DataSource;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [MenuNodeEntity],
          synchronize: true,
          logging: false,
        }),
        TypeOrmModule.forFeature([MenuNodeEntity]),
      ],
      providers: [MenuService],
    }).compile();

    service = moduleRef.get(MenuService);
    dataSource = moduleRef.get(DataSource);

    await dataSource.dropDatabase();
    await dataSource.synchronize(true);
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
      expect(result.data?.nodeId).toBeDefined();
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
      expect(result.data?.nodeId).toBeDefined();
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
      const parentId = parentResult.data!.nodeId;

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
      expect(childResult.data?.nodeId).toBeDefined();
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
      const nodeId = createResult.data!.nodeId;

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
      expect(updateResult.data?.nodeId).toBe(nodeId);

      // Verify update
      const nodes = await service.listMenuTree({});
      expect(nodes.data?.find((n) => n.id === nodeId)?.name).toBe(
        'System Management'
      );
      expect(nodes.data?.find((n) => n.id === nodeId)?.enabled).toBe(false);
      expect(nodes.data?.find((n) => n.id === nodeId)?.sort).toBe(10);
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
      expect(result.data?.nodeId).toBeDefined();
    });
  });

  describe('listMenuTree', () => {
    it('should return empty array when no menu nodes exist', async () => {
      const result = await service.listMenuTree({});

      expect(result.ok).toBe(true);
      expect(result.data).toEqual([]);
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
      expect(result.data?.length).toBe(2);
    });

    it('should return menu nodes with correct structure', async () => {
      const createResult = await service.upsertMenuNode({
        node: {
          type: 'MENU',
          name: 'Users',
          path: '/users',
          icon: 'user-icon',
          permissionCode: 'users:view',
          enabled: true,
          sort: 5,
        },
      });

      const result = await service.listMenuTree({});
      const node = result.data?.find((n) => n.id === createResult.data!.nodeId);

      expect(node).toBeDefined();
      expect(node?.type).toBe('MENU');
      expect(node?.name).toBe('Users');
      expect(node?.path).toBe('/users');
      expect(node?.icon).toBe('user-icon');
      expect(node?.permissionCode).toBe('users:view');
      expect(node?.enabled).toBe(true);
      expect(node?.sort).toBe(5);
      expect(node?.createdAt).toBeDefined();
      expect(node?.updatedAt).toBeDefined();
    });

    it('should include parent-child relationships', async () => {
      const parentResult = await service.upsertMenuNode({
        node: { type: 'DIRECTORY', name: 'System', enabled: true },
      });
      const parentId = parentResult.data!.nodeId;

      await service.upsertMenuNode({
        node: {
          parentId,
          type: 'MENU',
          name: 'Users',
          path: '/system/users',
          enabled: true,
        },
      });

      const result = await service.listMenuTree({});
      const childNode = result.data?.find((n) => n.parentId === parentId);

      expect(childNode).toBeDefined();
      expect(childNode?.name).toBe('Users');
    });
  });

  describe('deleteMenuNode', () => {
    it('should delete an existing menu node', async () => {
      const createResult = await service.upsertMenuNode({
        node: { type: 'DIRECTORY', name: 'System', enabled: true },
      });
      const nodeId = createResult.data!.nodeId;

      const result = await service.deleteMenuNode({ nodeId });

      expect(result.ok).toBe(true);
      expect(result.data?.success).toBe(true);

      // Verify deletion
      const nodes = await service.listMenuTree({});
      expect(nodes.data?.find((n) => n.id === nodeId)).toBeUndefined();
    });

    it('should be idempotent when deleting non-existent node', async () => {
      const result = await service.deleteMenuNode({
        nodeId: 'non-existent-id',
      });

      expect(result.ok).toBe(true);
      expect(result.data?.success).toBe(true);
    });

    it('should recursively delete child nodes', async () => {
      // Create parent
      const parentResult = await service.upsertMenuNode({
        node: { type: 'DIRECTORY', name: 'System', enabled: true },
      });
      const parentId = parentResult.data!.nodeId;

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
      const child1Id = child1Result.data!.nodeId;

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
      const grandchildId = grandchildResult.data!.nodeId;

      // Create another child of parent
      const child2Result = await service.upsertMenuNode({
        node: {
          parentId,
          type: 'MENU',
          name: 'Roles',
          path: '/system/roles',
          enabled: true,
        },
      });
      const child2Id = child2Result.data!.nodeId;

      // Delete parent
      await service.deleteMenuNode({ nodeId: parentId });

      // Verify all are deleted
      const nodes = await service.listMenuTree({});
      expect(nodes.data?.find((n) => n.id === parentId)).toBeUndefined();
      expect(nodes.data?.find((n) => n.id === child1Id)).toBeUndefined();
      expect(nodes.data?.find((n) => n.id === grandchildId)).toBeUndefined();
      expect(nodes.data?.find((n) => n.id === child2Id)).toBeUndefined();
      expect(nodes.data?.length).toBe(0);
    });

    it('should not delete unrelated nodes when deleting a node', async () => {
      // Create two separate trees
      const tree1Result = await service.upsertMenuNode({
        node: { type: 'DIRECTORY', name: 'System', enabled: true },
      });

      const tree2Result = await service.upsertMenuNode({
        node: { type: 'DIRECTORY', name: 'Settings', enabled: true },
      });

      // Delete tree1
      await service.deleteMenuNode({ nodeId: tree1Result.data!.nodeId });

      // Verify tree2 still exists
      const nodes = await service.listMenuTree({});
      expect(nodes.data?.length).toBe(1);
      expect(nodes.data?.[0].name).toBe('Settings');
    });
  });
});
