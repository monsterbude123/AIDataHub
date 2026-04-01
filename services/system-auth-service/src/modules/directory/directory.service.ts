import { Injectable, Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
  okResult,
  errResult,
  type Result,
  type DirectoryTreeNode,
  type UpsertDirectoryNodeRequest,
} from '@ai-datahub/contract';

@Injectable()
export class DirectoryService {
  constructor(@Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient) {}

  /**
   * List directory tree nodes with optional filtering
   * @param req.filter.parentId - Filter by parent ID (undefined for root nodes)
   * @param req.filter.keyword - Filter by name or code (case-insensitive partial match)
   */
  async listDirectoryTree(req: {
    meta?: unknown;
    parentId?: string;
    keyword?: string;
  }): Promise<Result<DirectoryTreeNode[]>> {
    if (req.keyword) {
      // Search by name or code (case-insensitive)
      const nodes = await this.prisma.directoryTreeNode.findMany({
        where: {
          OR: [
            { name: { contains: req.keyword } },
            { code: { contains: req.keyword } },
          ],
        },
        orderBy: { createdAt: 'asc' },
      });

      // Remove duplicates based on id (already unique from Prisma)
      return okResult(
        nodes.map((n) => ({
          id: n.id,
          parentId: n.parentId ?? undefined,
          name: n.name,
          code: n.code,
          attributes: n.attributes ? JSON.parse(n.attributes) : undefined,
          createdAt: n.createdAt.toISOString(),
          updatedAt: n.updatedAt.toISOString(),
        }))
      );
    }

    // If parentId filter (or no filter)
    const where = req.parentId !== undefined ? { parentId: req.parentId } : {};

    const nodes = await this.prisma.directoryTreeNode.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });

    return okResult(
      nodes.map((n) => ({
        id: n.id,
        parentId: n.parentId ?? undefined,
        name: n.name,
        code: n.code,
        attributes: n.attributes ? JSON.parse(n.attributes) : undefined,
        createdAt: n.createdAt.toISOString(),
        updatedAt: n.updatedAt.toISOString(),
      }))
    );
  }

  /**
   * Upsert a directory node (idempotent)
   * - If id is provided and exists, update the node
   * - If id is not provided or doesn't exist, create a new node
   */
  async upsertDirectoryNode(
    req: UpsertDirectoryNodeRequest
  ): Promise<Result<{ nodeId: string }>> {
    if (req.node.id) {
      // Update existing node
      const existing = await this.prisma.directoryTreeNode.findUnique({
        where: { id: req.node.id },
      });
      if (!existing) {
        return errResult({
          code: 'DIRECTORY_NOT_FOUND',
          message: 'Directory node not found',
          level: 'ERROR',
        });
      }

      const node = await this.prisma.directoryTreeNode.update({
        where: { id: req.node.id },
        data: {
          parentId: req.node.parentId,
          name: req.node.name,
          code: req.node.code,
          attributes: req.node.attributes
            ? JSON.stringify(req.node.attributes)
            : null,
        },
      });

      return okResult({ nodeId: node.id });
    }

    // Check if code already exists (code is unique)
    const existingByCode = await this.prisma.directoryTreeNode.findUnique({
      where: { code: req.node.code },
    });

    if (existingByCode) {
      // Update existing node with same code (idempotent)
      const node = await this.prisma.directoryTreeNode.update({
        where: { code: req.node.code },
        data: {
          parentId: req.node.parentId,
          name: req.node.name,
          attributes: req.node.attributes
            ? JSON.stringify(req.node.attributes)
            : null,
        },
      });
      return okResult({ nodeId: node.id });
    }

    // Create new node
    const node = await this.prisma.directoryTreeNode.create({
      data: {
        parentId: req.node.parentId,
        name: req.node.name,
        code: req.node.code,
        attributes: req.node.attributes
          ? JSON.stringify(req.node.attributes)
          : null,
      },
    });

    return okResult({ nodeId: node.id });
  }

  /**
   * Delete a directory node and all its descendants (idempotent)
   * If the node doesn't exist, returns success anyway
   */
  async deleteDirectoryNode(req: {
    meta?: unknown;
    nodeId: string;
  }): Promise<Result<{ success: boolean }>> {
    const existing = await this.prisma.directoryTreeNode.findUnique({
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
    await this.prisma.directoryTreeNode.deleteMany({
      where: { id: { in: allIdsToDelete } },
    });

    return okResult({ success: true });
  }

  /**
   * Find all descendant node IDs recursively
   */
  private async findAllDescendants(nodeId: string): Promise<string[]> {
    const children = await this.prisma.directoryTreeNode.findMany({
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
