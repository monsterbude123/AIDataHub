import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
  okResult,
  errResult,
  type Result,
  type MenuNode,
  type UpsertMenuNodeRequest,
} from '@ai-datahub/contract';
import { MenuNodeEntity } from '../../entities/MenuNode.entity';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(MenuNodeEntity)
    private readonly menuRepo: Repository<MenuNodeEntity>
  ) {}

  async listMenuTree(_req: { meta?: unknown }): Promise<Result<MenuNode[]>> {
    const nodes = await this.menuRepo.find({
      order: { sort: 'ASC', createdAt: 'ASC' },
    });
    return okResult(nodes.map((n) => n.toDTO()));
  }

  async upsertMenuNode(
    req: UpsertMenuNodeRequest
  ): Promise<Result<{ nodeId: string }>> {
    let node: MenuNodeEntity;

    if (req.node.id) {
      // Update existing node
      const existing = await this.menuRepo.findOneBy({ id: req.node.id });
      if (!existing) {
        return errResult({
          code: 'INVALID_ARGUMENT',
          message: 'Menu node not found',
          level: 'ERROR',
        });
      }

      // Update fields
      existing.parentId = req.node.parentId;
      existing.type = req.node.type;
      existing.name = req.node.name;
      existing.path = req.node.path;
      existing.icon = req.node.icon;
      existing.permissionCode = req.node.permissionCode;
      existing.enabled = req.node.enabled;
      existing.sort = req.node.sort;

      node = await this.menuRepo.save(existing);
    } else {
      // Create new node
      const newEntity = this.menuRepo.create({
        parentId: req.node.parentId,
        type: req.node.type,
        name: req.node.name,
        path: req.node.path,
        icon: req.node.icon,
        permissionCode: req.node.permissionCode,
        enabled: req.node.enabled,
        sort: req.node.sort,
      });

      node = await this.menuRepo.save(newEntity);
    }

    return okResult({ nodeId: node.id });
  }

  async deleteMenuNode(req: {
    nodeId: string;
  }): Promise<Result<{ success: boolean }>> {
    const existing = await this.menuRepo.findOneBy({ id: req.nodeId });
    if (!existing) {
      // Idempotent - already deleted
      return okResult({ success: true });
    }

    // Find all descendant nodes recursively
    const descendantIds = await this.findAllDescendants(req.nodeId);
    const allIdsToDelete = [req.nodeId, ...descendantIds];

    // Delete all nodes (parent first, then descendants are deleted by cascade or manually)
    await this.menuRepo.delete({ id: In(allIdsToDelete) });

    return okResult({ success: true });
  }

  /**
   * Find all descendant node IDs recursively
   */
  private async findAllDescendants(nodeId: string): Promise<string[]> {
    const children = await this.menuRepo.find({
      where: { parentId: nodeId },
      select: ['id'],
    });

    if (children.length === 0) {
      return [];
    }

    const childIds = children.map((c) => c.id);
    const grandChildIds: string[] = [];

    for (const childId of childIds) {
      const descendants = await this.findAllDescendants(childId);
      grandChildIds.push(...descendants);
    }

    return [...childIds, ...grandChildIds];
  }
}
