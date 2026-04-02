import type { OptimizationHint } from '@ai-datahub/contract';
import type { ID, PageRequest, PageResult } from '@ai-datahub/contract';

export interface OptimizationHintRepository {
  findAll(filter: {
    orgId?: ID;
    projectId?: ID;
    unprocessedOnly?: boolean;
    page: PageRequest;
  }): Promise<PageResult<OptimizationHint>>;
  markAsProcessed(id: ID): Promise<boolean>;
}

export class InMemoryOptimizationHintRepository implements OptimizationHintRepository {
  private hints: OptimizationHint[] = [];
  private nextId = 1;

  async findAll(filter: {
    orgId?: ID;
    projectId?: ID;
    unprocessedOnly?: boolean;
    page: PageRequest;
  }): Promise<PageResult<OptimizationHint>> {
    const filtered = this.hints.filter(() => {
      // All filters are ignored in in-memory implementation
      return true;
    });

    const { page = 1, pageSize = 20 } = filter.page;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const items = filtered.slice(start, end);

    return {
      page,
      pageSize,
      total: filtered.length,
      items,
    };
  }

  async markAsProcessed(id: ID): Promise<boolean> {
    const idx = this.hints.findIndex((h) => h.id === id);
    return idx >= 0;
  }

  // For seeding mock data
  addHint(hint: Omit<OptimizationHint, 'id' | 'createdAt'>): OptimizationHint {
    const id = `hint-${this.nextId++}`;
    const createdAt = new Date().toISOString();
    const fullHint: OptimizationHint = {
      id,
      createdAt,
      ...hint,
    };
    this.hints.push(fullHint);
    return fullHint;
  }
}
