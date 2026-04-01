import type {
  QualityTask,
  PageResult,
  PageRequest,
} from '@ai-datahub/contract';
import type { ID } from '@ai-datahub/contract';

export interface QualityTaskRepository {
  create(
    task: Omit<QualityTask, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<{ taskId: ID }>;
  update(task: Omit<QualityTask, 'createdAt' | 'updatedAt'>): Promise<boolean>;
  delete(taskId: ID): Promise<boolean>;
  list(page: PageRequest): Promise<PageResult<QualityTask>>;
}

export class InMemoryQualityTaskRepository implements QualityTaskRepository {
  private tasks: QualityTask[] = [];
  private nextId = 1;

  async create(
    task: Omit<QualityTask, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<{ taskId: ID }> {
    const now = new Date().toISOString();
    const id = `qt-${this.nextId++}`;
    this.tasks.push({
      ...task,
      id,
      createdAt: now,
      updatedAt: now,
    });
    return { taskId: id };
  }

  async update(
    task: Omit<QualityTask, 'createdAt' | 'updatedAt'>
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

  async list({
    page,
    pageSize,
  }: PageRequest): Promise<PageResult<QualityTask>> {
    const filtered = this.tasks;
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
