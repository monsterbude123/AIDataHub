import type { LayerDirectoryNode, DataLayerNode } from '@ai-datahub/contract';
import type { ID } from '@ai-datahub/contract';

export interface LayerDirectoryRepository {
  create(
    node: Omit<LayerDirectoryNode, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<{ id: ID }>;
  update(
    node: Omit<LayerDirectoryNode, 'createdAt' | 'updatedAt'>
  ): Promise<boolean>;
  delete(id: ID): Promise<boolean>;
  findById(id: ID): Promise<LayerDirectoryNode | null>;
  listByLayer(
    layer: DataLayerNode,
    parentId?: ID
  ): Promise<LayerDirectoryNode[]>;
  existsByCode(
    code: string,
    layer: DataLayerNode,
    parentId?: ID,
    excludeId?: ID
  ): Promise<boolean>;
}

export class InMemoryLayerDirectoryRepository implements LayerDirectoryRepository {
  private directories: LayerDirectoryNode[] = [];
  private nextId = 1;

  async create(
    node: Omit<LayerDirectoryNode, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<{ id: ID }> {
    const id = `dir-${this.nextId++}`;
    const now = new Date().toISOString();
    this.directories.push({
      ...node,
      id,
      createdAt: now,
      updatedAt: now,
    });
    return { id };
  }

  async update(
    node: Omit<LayerDirectoryNode, 'createdAt' | 'updatedAt'>
  ): Promise<boolean> {
    const index = this.directories.findIndex((d) => d.id === node.id);
    if (index === -1) return false;
    const existing = this.directories[index];
    this.directories[index] = {
      ...existing,
      ...node,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };
    return true;
  }

  async delete(id: ID): Promise<boolean> {
    const index = this.directories.findIndex((d) => d.id === id);
    if (index === -1) return false;
    this.directories.splice(index, 1);
    return true;
  }

  async findById(id: ID): Promise<LayerDirectoryNode | null> {
    return this.directories.find((d) => d.id === id) || null;
  }

  async listByLayer(
    layer: DataLayerNode,
    parentId?: ID
  ): Promise<LayerDirectoryNode[]> {
    let filtered = this.directories.filter((d) => d.layer === layer);
    if (parentId !== undefined) {
      filtered = filtered.filter((d) => d.parentId === parentId);
    }
    return filtered.sort((a, b) => (a.sort || 0) - (b.sort || 0));
  }

  async existsByCode(
    code: string,
    layer: DataLayerNode,
    parentId?: ID,
    excludeId?: ID
  ): Promise<boolean> {
    return this.directories.some(
      (d) =>
        d.code === code &&
        d.layer === layer &&
        d.parentId === parentId &&
        d.id !== excludeId
    );
  }
}
