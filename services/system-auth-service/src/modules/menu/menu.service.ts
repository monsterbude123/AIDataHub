import { Injectable, Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
  okResult,
  errResult,
  type Result,
  type MenuNode,
  type MenuNodeType,
  type UpsertMenuNodeRequest,
} from '@ai-datahub/contract';

@Injectable()
export class MenuService {
  constructor(@Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient) {}

  async listMenuTree(_req: { meta?: unknown }): Promise<Result<MenuNode[]>> {
    const nodes = await this.prisma.menuNode.findMany({
      orderBy: [{ sort: 'asc' }, { createdAt: 'asc' }],
    });

    return okResult(
      nodes.map((n) => ({
        id: n.id,
        parentId: n.parentId ?? undefined,
        type: n.type as MenuNodeType,
        name: n.name,
        path: n.path ?? undefined,
        icon: n.icon ?? undefined,
        permissionCode: n.permissionCode ?? undefined,
        enabled: n.enabled,
        sort: n.sort ?? undefined,
        createdAt: n.createdAt.toISOString(),
        updatedAt: n.updatedAt.toISOString(),
      }))
    );
  }

  async upsertMenuNode(
    req: UpsertMenuNodeRequest
  ): Promise<Result<{ nodeId: string }>> {
    if (req.node.id) {
      // Update existing node
      const existing = await this.prisma.menuNode.findUnique({
        where: { id: req.node.id },
      });
      if (!existing) {
        return errResult({
          code: 'INVALID_ARGUMENT',
          message: 'Menu node not found',
          level: 'ERROR',
        });
      }

      const node = await this.prisma.menuNode.update({
        where: { id: req.node.id },
        data: {
          parentId: req.node.parentId,
          type: req.node.type,
          name: req.node.name,
          path: req.node.path,
          icon: req.node.icon,
          permissionCode: req.node.permissionCode,
          enabled: req.node.enabled,
          sort: req.node.sort,
        },
      });

      return okResult({ nodeId: node.id });
    }

    // Create new node
    const node = await this.prisma.menuNode.create({
      data: {
        parentId: req.node.parentId,
        type: req.node.type,
        name: req.node.name,
        path: req.node.path,
        icon: req.node.icon,
        permissionCode: req.node.permissionCode,
        enabled: req.node.enabled,
        sort: req.node.sort,
      },
    });

    return okResult({ nodeId: node.id });
  }

  async deleteMenuNode(req: {
    nodeId: string;
  }): Promise<Result<{ success: boolean }>> {
    const existing = await this.prisma.menuNode.findUnique({
      where: { id: req.nodeId },
    });
    if (!existing) {
      // Idempotent - already deleted
      return okResult({ success: true });
    }

    // Find all descendant nodes recursively
    const descendantIds = await this.findAllDescendants(req.nodeId);
    const allIdsToDelete = [req.nodeId, ...descendantIds];

    // Delete all nodes
    await this.prisma.menuNode.deleteMany({
      where: { id: { in: allIdsToDelete } },
    });

    return okResult({ success: true });
  }

  /**
   * Find all descendant node IDs recursively
   */
  private async findAllDescendants(nodeId: string): Promise<string[]> {
    const children = await this.prisma.menuNode.findMany({
      where: { parentId: nodeId },
      select: { id: true },
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
