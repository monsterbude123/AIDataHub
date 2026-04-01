import type { DataSource } from '@ai-datahub/contract';
import type { ID } from '@ai-datahub/contract';

export interface DataSourceRepository {
  create(
    dataSource: Omit<DataSource, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<{ id: ID }>;
  update(
    dataSource: Omit<DataSource, 'createdAt' | 'updatedAt'>
  ): Promise<boolean>;
  delete(id: ID): Promise<boolean>;
  findById(id: ID): Promise<DataSource | null>;
  list(orgId: ID, keyword?: string, projectId?: ID): Promise<DataSource[]>;
  existsByName(name: string, orgId: ID, excludeId?: ID): Promise<boolean>;
}

export class InMemoryDataSourceRepository implements DataSourceRepository {
  private dataSources: DataSource[] = [];
  private nextId = 1;

  async create(
    dataSource: Omit<DataSource, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<{ id: ID }> {
    const id = `ds-${this.nextId++}`;
    const now = new Date().toISOString();
    this.dataSources.push({
      ...dataSource,
      id,
      createdAt: now,
      updatedAt: now,
    });
    return { id };
  }

  async update(
    dataSource: Omit<DataSource, 'createdAt' | 'updatedAt'>
  ): Promise<boolean> {
    const index = this.dataSources.findIndex((ds) => ds.id === dataSource.id);
    if (index === -1) return false;
    const existing = this.dataSources[index];
    this.dataSources[index] = {
      ...existing,
      ...dataSource,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };
    return true;
  }

  async delete(id: ID): Promise<boolean> {
    const index = this.dataSources.findIndex((ds) => ds.id === id);
    if (index === -1) return false;
    this.dataSources.splice(index, 1);
    return true;
  }

  async findById(id: ID): Promise<DataSource | null> {
    return this.dataSources.find((ds) => ds.id === id) || null;
  }

  async list(
    orgId: ID,
    keyword?: string,
    projectId?: ID
  ): Promise<DataSource[]> {
    let filtered = this.dataSources.filter((ds) => ds.orgId === orgId);
    if (projectId !== undefined) {
      filtered = filtered.filter((ds) => ds.projectId === projectId);
    }
    if (keyword) {
      const lowerKeyword = keyword.toLowerCase();
      filtered = filtered.filter(
        (ds) =>
          ds.name.toLowerCase().includes(lowerKeyword) ||
          (ds.description?.toLowerCase() || '').includes(lowerKeyword)
      );
    }
    return filtered;
  }

  async existsByName(
    name: string,
    orgId: ID,
    excludeId?: ID
  ): Promise<boolean> {
    return this.dataSources.some(
      (ds) => ds.name === name && ds.orgId === orgId && ds.id !== excludeId
    );
  }
}
