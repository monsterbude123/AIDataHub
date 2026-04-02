import type { DagDefinition, ID } from '@ai-datahub/contract';
import type { PageRequest, PageResult } from '@ai-datahub/contract';

export interface DagRepository {
  create(dag: Omit<DagDefinition, 'dagId'>): Promise<{ dagId: ID }>;
  update(dag: DagDefinition): Promise<boolean>;
  delete(dagId: ID): Promise<boolean>;
  list(
    keyword: string | undefined,
    page: PageRequest
  ): Promise<PageResult<DagDefinition>>;
  findById(dagId: ID): Promise<DagDefinition | null>;
}

export class InMemoryDagRepository implements DagRepository {
  private dags: DagDefinition[] = [];
  private nextId = 1;

  async create(dag: Omit<DagDefinition, 'dagId'>): Promise<{ dagId: ID }> {
    const dagId = `dag-${this.nextId++}`;
    this.dags.push({
      ...dag,
      dagId,
    });
    return { dagId };
  }

  async update(dag: DagDefinition): Promise<boolean> {
    const idx = this.dags.findIndex((d) => d.dagId === dag.dagId);
    if (idx < 0) return false;
    this.dags = [...this.dags.slice(0, idx), dag, ...this.dags.slice(idx + 1)];
    return true;
  }

  async delete(dagId: ID): Promise<boolean> {
    const len = this.dags.length;
    this.dags = this.dags.filter((d) => d.dagId !== dagId);
    return this.dags.length < len;
  }

  async list(
    keyword: string | undefined,
    { page, pageSize }: PageRequest
  ): Promise<PageResult<DagDefinition>> {
    let filtered = this.dags;
    if (keyword) {
      const lower = keyword.toLowerCase();
      filtered = filtered.filter((d) => d.name.toLowerCase().includes(lower));
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

  async findById(dagId: ID): Promise<DagDefinition | null> {
    return this.dags.find((d) => d.dagId === dagId) || null;
  }
}
