import type {
  StandardTypeMapping,
  PageResult,
  PageRequest,
} from '@ai-datahub/contract';
import type { ID } from '@ai-datahub/contract';

export interface StandardTypeMappingRepository {
  upsert(
    mapping: Omit<StandardTypeMapping, 'createdAt'> & { id?: ID }
  ): Promise<{ mappingId: ID }>;
  list(
    sourceSystem: string | undefined,
    page: PageRequest
  ): Promise<PageResult<StandardTypeMapping>>;
}

export class InMemoryStandardTypeMappingRepository implements StandardTypeMappingRepository {
  private mappings: StandardTypeMapping[] = [];
  private nextId = 1;

  async upsert(
    mapping: Omit<StandardTypeMapping, 'createdAt'> & { id?: ID }
  ): Promise<{ mappingId: ID }> {
    const now = new Date().toISOString();

    if (mapping.id) {
      const idx = this.mappings.findIndex((m) => m.id === mapping.id);
      if (idx >= 0) {
        this.mappings[idx] = {
          ...this.mappings[idx],
          ...mapping,
        };
        return { mappingId: mapping.id };
      }
    }

    const id = `stm-${this.nextId++}`;
    this.mappings.push({
      ...mapping,
      id,
      createdAt: now,
    });
    return { mappingId: id };
  }

  async list(
    sourceSystem: string | undefined,
    { page, pageSize }: PageRequest
  ): Promise<PageResult<StandardTypeMapping>> {
    let filtered = this.mappings;
    if (sourceSystem) {
      filtered = filtered.filter((m) => m.sourceSystem === sourceSystem);
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
