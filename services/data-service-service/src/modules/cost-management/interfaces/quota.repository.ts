import type { Quota } from '@ai-datahub/contract';
import type { CostDimension } from '@ai-datahub/contract';
import type { ID } from '@ai-datahub/contract';

export interface QuotaRepository {
  findAll(filter: {
    dimension?: CostDimension;
    orgId?: ID;
    projectId?: ID;
  }): Promise<Quota[]>;
  upsert(
    data: Omit<Quota, 'id' | 'createdAt' | 'updatedAt'> & { id?: ID }
  ): Promise<{ quotaId: ID }>;
}

export class InMemoryQuotaRepository implements QuotaRepository {
  private quotas: Quota[] = [];
  private nextId = 1;

  async findAll(filter: {
    dimension?: CostDimension;
    orgId?: ID;
    projectId?: ID;
  }): Promise<Quota[]> {
    return this.quotas.filter((q) => {
      if (filter.dimension && q.dimension !== filter.dimension) return false;
      if (filter.orgId !== undefined && q.orgId !== filter.orgId) return false;
      if (filter.projectId !== undefined && q.projectId !== filter.projectId)
        return false;
      return true;
    });
  }

  async upsert(
    data: Omit<Quota, 'id' | 'createdAt' | 'updatedAt'> & { id?: ID }
  ): Promise<{ quotaId: ID }> {
    const now = new Date().toISOString();

    if (data.id) {
      // Update existing
      const idx = this.quotas.findIndex((q) => q.id === data.id);
      if (idx >= 0) {
        this.quotas[idx] = {
          ...this.quotas[idx],
          ...data,
          updatedAt: now,
        };
        return { quotaId: data.id };
      }
    }

    // Create new
    const id = `q-${this.nextId++}`;
    this.quotas.push({
      id,
      ...data,
      createdAt: now,
      updatedAt: now,
    });
    return { quotaId: id };
  }
}
