import type { AssetMapping } from '@ai-datahub/contract';
import type { ID, PageRequest, PageResult } from '@ai-datahub/contract';

export interface AssetMappingRepository {
  create(
    mapping: Omit<AssetMapping, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<{ id: ID }>;
  update(
    mapping: Omit<AssetMapping, 'createdAt' | 'updatedAt'>
  ): Promise<boolean>;
  delete(id: ID): Promise<boolean>;
  findById(id: ID): Promise<AssetMapping | null>;
  list(
    fromAssetId?: ID,
    toAssetId?: ID,
    page?: PageRequest
  ): Promise<PageResult<AssetMapping>>;
}

export class InMemoryAssetMappingRepository implements AssetMappingRepository {
  private mappings: AssetMapping[] = [];
  private nextId = 1;

  async create(
    mapping: Omit<AssetMapping, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<{ id: ID }> {
    const id = `map-${this.nextId++}`;
    const now = new Date().toISOString();
    this.mappings.push({
      ...mapping,
      id,
      createdAt: now,
      updatedAt: now,
    });
    return { id };
  }

  async update(
    mapping: Omit<AssetMapping, 'createdAt' | 'updatedAt'>
  ): Promise<boolean> {
    const index = this.mappings.findIndex((m) => m.id === mapping.id);
    if (index === -1) return false;
    const existing = this.mappings[index];
    this.mappings[index] = {
      ...existing,
      ...mapping,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };
    return true;
  }

  async delete(id: ID): Promise<boolean> {
    const index = this.mappings.findIndex((m) => m.id === id);
    if (index === -1) return false;
    this.mappings.splice(index, 1);
    return true;
  }

  async findById(id: ID): Promise<AssetMapping | null> {
    return this.mappings.find((m) => m.id === id) || null;
  }

  async list(
    fromAssetId?: ID,
    toAssetId?: ID,
    page?: PageRequest
  ): Promise<PageResult<AssetMapping>> {
    let filtered = this.mappings;
    if (fromAssetId !== undefined) {
      filtered = filtered.filter((m) => m.fromAssetId === fromAssetId);
    }
    if (toAssetId !== undefined) {
      filtered = filtered.filter((m) => m.toAssetId === toAssetId);
    }

    const total = filtered.length;
    if (page) {
      const skip = (page.page - 1) * page.pageSize;
      const end = skip + page.pageSize;
      filtered = filtered.slice(skip, end);
    }

    return {
      items: filtered,
      total,
      page: page?.page || 1,
      pageSize: page?.pageSize || total,
    };
  }
}
