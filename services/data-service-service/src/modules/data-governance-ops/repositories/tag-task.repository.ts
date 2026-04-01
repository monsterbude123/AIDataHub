import type { TagTask, PageResult, PageRequest } from '@ai-datahub/contract';
import type { ID } from '@ai-datahub/contract';

export interface TagTaskRepository {
  create(
    task: Omit<TagTask, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<{ taskId: ID }>;
  update(task: Omit<TagTask, 'createdAt' | 'updatedAt'>): Promise<boolean>;
  delete(taskId: ID): Promise<boolean>;
  list(tagId: ID | undefined, page: PageRequest): Promise<PageResult<TagTask>>;
}

export class InMemoryTagTaskRepository implements TagTaskRepository {
  private tasks: TagTask[] = [];
  private nextId = 1;

  async create(
    task: Omit<TagTask, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<{ taskId: ID }> {
    const now = new Date().toISOString();
    const id = `tt-${this.nextId++}`;
    this.tasks.push({
      ...task,
      id,
      createdAt: now,
      updatedAt: now,
    });
    return { taskId: id };
  }

  async update(
    task: Omit<TagTask, 'createdAt' | 'updatedAt'>
  ): Promise<boolean> {
    const idx = this.tasks.findIndex((t) => t.id === task.id);
    if (idx < 0) return false;
    this.tasks[idx] = {
      ...this.tasks[idx],
      ...task,
      updatedAt: new Date().toISOString(),
    };
    return true;
  }

  async delete(taskId: ID): Promise<boolean> {
    const len = this.tasks.length;
    this.tasks = this.tasks.filter((t) => t.id !== taskId);
    return this.tasks.length < len;
  }

  async list(
    tagId: ID | undefined,
    { page, pageSize }: PageRequest
  ): Promise<PageResult<TagTask>> {
    let filtered = this.tasks;
    if (tagId !== undefined) {
      filtered = filtered.filter((t) => t.tagId === tagId);
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
