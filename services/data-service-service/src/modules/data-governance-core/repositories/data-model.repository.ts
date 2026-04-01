import type { DataModel, PageResult, PageRequest } from '@ai-datahub/contract';
import type { ID } from '@ai-datahub/contract';

export interface DataModelRepository {
  create(
    model: Omit<DataModel, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<{ modelId: ID }>;
  list(
    keyword: string | undefined,
    page: PageRequest
  ): Promise<PageResult<DataModel>>;
}

export class InMemoryDataModelRepository implements DataModelRepository {
  private models: DataModel[] = [];
  private nextId = 1;

  async create(
    model: Omit<DataModel, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<{ modelId: ID }> {
    const now = new Date().toISOString();
    const id = `dm-${this.nextId++}`;
    this.models.push({
      ...model,
      id,
      createdAt: now,
      updatedAt: now,
    });
    return { modelId: id };
  }

  async list(
    keyword: string | undefined,
    { page, pageSize }: PageRequest
  ): Promise<PageResult<DataModel>> {
    let filtered = this.models;
    if (keyword) {
      const lower = keyword.toLowerCase();
      filtered = filtered.filter((m) => m.name.toLowerCase().includes(lower));
    }
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);
    return {
      page,
      pageSize,
      total: filtered.length,
      items,
    };
  }
}
