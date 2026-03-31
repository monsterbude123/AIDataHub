import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Like } from 'typeorm';
import {
  okResult,
  errResult,
  type Result,
  type DirectoryTreeNode,
  type UpsertDirectoryNodeRequest,
} from '@ai-datahub/contract';
import { DirectoryTreeNodeEntity } from '../../entities/DirectoryTreeNode.entity';

@Injectable()
export class DirectoryService {
  constructor(
    @InjectRepository(DirectoryTreeNodeEntity)
    private readonly directoryRepo: Repository<DirectoryTreeNodeEntity>
  ) {}

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
    const whereConditions: Record<string, unknown>[] = [];

    // Build filter conditions
    if (req.parentId !== undefined) {
      // If parentId is provided, filter by it (can be null for root nodes)
      whereConditions.push({ parentId: req.parentId });
    }

    if (req.keyword) {
      // Search by name or code (case-insensitive)
      const keywordPattern = `%${req.keyword}%`;
      const keywordConditions =
        whereConditions.length > 0
          ? whereConditions.map((cond) => ({
              ...cond,
              name: Like(keywordPattern),
            }))
          : [{ name: Like(keywordPattern) }];

      // Also search by code
      const codeConditions =
        whereConditions.length > 0
          ? whereConditions.map((cond) => ({
              ...cond,
              code: Like(keywordPattern),
            }))
          : [{ code: Like(keywordPattern) }];

      // Combine name and code searches
      const nodes = await this.directoryRepo.find({
        where: [...keywordConditions, ...codeConditions],
        order: { createdAt: 'ASC' },
      });

      // Remove duplicates based on id
      const uniqueNodes = Array.from(
        new Map(nodes.map((n) => [n.id, n])).values()
      );
      return okResult(uniqueNodes.map((n) => n.toDTO()));
    }

    // If only parentId filter (or no filter)
    const nodes = await this.directoryRepo.find({
      where: whereConditions.length > 0 ? whereConditions : undefined,
      order: { createdAt: 'ASC' },
    });

    return okResult(nodes.map((n) => n.toDTO()));
  }

  /**
   * Upsert a directory node (idempotent)
   * - If id is provided and exists, update the node
   * - If id is not provided or doesn't exist, create a new node
   */
  async upsertDirectoryNode(
    req: UpsertDirectoryNodeRequest
  ): Promise<Result<{ nodeId: string }>> {
    let node: DirectoryTreeNodeEntity;

    if (req.node.id) {
      // Update existing node
      const existing = await this.directoryRepo.findOneBy({ id: req.node.id });
      if (!existing) {
        return errResult({
          code: 'DIRECTORY_NOT_FOUND',
          message: 'Directory node not found',
          level: 'ERROR',
        });
      }

      // Update fields
      existing.parentId = req.node.parentId;
      existing.name = req.node.name;
      existing.code = req.node.code;
      existing.attributes = req.node.attributes;

      node = await this.directoryRepo.save(existing);
    } else {
      // Check if code already exists (code is unique)
      const existingByCode = await this.directoryRepo.findOneBy({
        code: req.node.code,
      });
      if (existingByCode) {
        // Update existing node with same code (idempotent)
        existingByCode.parentId = req.node.parentId;
        existingByCode.name = req.node.name;
        existingByCode.attributes = req.node.attributes;
        node = await this.directoryRepo.save(existingByCode);
      } else {
        // Create new node
        const newEntity = this.directoryRepo.create({
          parentId: req.node.parentId,
          name: req.node.name,
          code: req.node.code,
          attributes: req.node.attributes,
        });

        node = await this.directoryRepo.save(newEntity);
      }
    }

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
    const existing = await this.directoryRepo.findOneBy({ id: req.nodeId });
    if (!existing) {
      // Idempotent - already deleted
      return okResult({ success: true });
    }

    // Find all descendant nodes recursively
    const descendantIds = await this.findAllDescendants(req.nodeId);
    const allIdsToDelete = [req.nodeId, ...descendantIds];

    // Delete all nodes
    await this.directoryRepo.delete({ id: In(allIdsToDelete) });

    return okResult({ success: true });
  }

  /**
   * Find all descendant node IDs recursively
   */
  private async findAllDescendants(nodeId: string): Promise<string[]> {
    const children = await this.directoryRepo.find({
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
