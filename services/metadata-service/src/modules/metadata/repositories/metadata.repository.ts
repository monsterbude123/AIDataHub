import type {
  DataAsset,
  ColumnMetadata,
  MetadataVersion,
} from '@ai-datahub/contract';
import type { ID } from '@ai-datahub/contract';
import type { PageRequest, PageResult } from '@ai-datahub/contract';

export interface DataAssetRepository {
  create(
    dataAsset: Omit<DataAsset, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<{ id: ID }>;
  update(
    dataAsset: Omit<DataAsset, 'createdAt' | 'updatedAt'>
  ): Promise<boolean>;
  findById(id: ID): Promise<DataAsset | null>;
  search(keyword?: string, page?: PageRequest): Promise<PageResult<DataAsset>>;
}

export class InMemoryDataAssetRepository implements DataAssetRepository {
  private dataAssets: DataAsset[] = [];
  private nextId = 1;

  async create(
    dataAsset: Omit<DataAsset, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<{ id: ID }> {
    const id = `asset-${this.nextId++}`;
    const now = new Date().toISOString();
    this.dataAssets.push({
      ...dataAsset,
      id,
      createdAt: now,
      updatedAt: now,
    });
    return { id };
  }

  async update(
    dataAsset: Omit<DataAsset, 'createdAt' | 'updatedAt'>
  ): Promise<boolean> {
    const index = this.dataAssets.findIndex((d) => d.id === dataAsset.id);
    if (index === -1) return false;
    const existing = this.dataAssets[index];
    this.dataAssets[index] = {
      ...existing,
      ...dataAsset,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };
    return true;
  }

  async findById(id: ID): Promise<DataAsset | null> {
    return this.dataAssets.find((d) => d.id === id) || null;
  }

  async search(
    keyword?: string,
    page?: PageRequest
  ): Promise<PageResult<DataAsset>> {
    let filtered = this.dataAssets;
    if (keyword) {
      const lowerKeyword = keyword.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.name.toLowerCase().includes(lowerKeyword) ||
          d.code.toLowerCase().includes(lowerKeyword) ||
          (d.description?.toLowerCase() || '').includes(lowerKeyword)
      );
    }
    if (!page) {
      return {
        items: filtered,
        total: filtered.length,
        page: 1,
        pageSize: filtered.length,
      };
    }
    const start = (page.page - 1) * page.pageSize;
    const end = start + page.pageSize;
    return {
      items: filtered.slice(start, end),
      total: filtered.length,
      page: page.page,
      pageSize: page.pageSize,
    };
  }
}

// --- Column Metadata ---

export interface ColumnMetadataRepository {
  create(column: Omit<ColumnMetadata, 'id'>): Promise<{ id: ID }>;
  findByDataAssetId(dataAssetId: ID): Promise<ColumnMetadata[]>;
  deleteByDataAssetId(dataAssetId: ID): Promise<void>;
}

export class InMemoryColumnMetadataRepository implements ColumnMetadataRepository {
  private columns: ColumnMetadata[] = [];
  private nextId = 1;

  async create(column: Omit<ColumnMetadata, 'id'>): Promise<{ id: ID }> {
    const id = `col-${this.nextId++}`;
    this.columns.push({ ...column, id });
    return { id };
  }

  async findByDataAssetId(dataAssetId: ID): Promise<ColumnMetadata[]> {
    return this.columns.filter((c) => c.dataAssetId === dataAssetId);
  }

  async deleteByDataAssetId(dataAssetId: ID): Promise<void> {
    this.columns = this.columns.filter((c) => c.dataAssetId !== dataAssetId);
  }
}

// --- Metadata Version ---

export interface MetadataVersionRepository {
  create(
    version: Omit<MetadataVersion, 'id' | 'createdAt'>
  ): Promise<{ id: ID }>;
  findById(id: ID): Promise<MetadataVersion | null>;
  listByDataAssetId(
    dataAssetId: ID,
    page: PageRequest
  ): Promise<PageResult<MetadataVersion>>;
}

export class InMemoryMetadataVersionRepository implements MetadataVersionRepository {
  private versions: MetadataVersion[] = [];
  private nextId = 1;

  async create(
    version: Omit<MetadataVersion, 'id' | 'createdAt'>
  ): Promise<{ id: ID }> {
    const id = `ver-${this.nextId++}`;
    const now = new Date().toISOString();
    this.versions.push({ ...version, id, createdAt: now });
    return { id };
  }

  async findById(id: ID): Promise<MetadataVersion | null> {
    return this.versions.find((v) => v.id === id) || null;
  }

  async listByDataAssetId(
    dataAssetId: ID,
    page: PageRequest
  ): Promise<PageResult<MetadataVersion>> {
    const filtered = this.versions.filter((v) => v.dataAssetId === dataAssetId);
    const start = (page.page - 1) * page.pageSize;
    const end = start + page.pageSize;
    return {
      items: filtered.slice(start, end),
      total: filtered.length,
      page: page.page,
      pageSize: page.pageSize,
    };
  }
}
