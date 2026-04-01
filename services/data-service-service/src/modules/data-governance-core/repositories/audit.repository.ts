import type {
  AuditTask,
  AuditRun,
  PageResult,
  PageRequest,
} from '@ai-datahub/contract';
import type { ID } from '@ai-datahub/contract';

export interface AuditRepository {
  upsert(
    task: Omit<AuditTask, 'createdAt' | 'updatedAt'> & { id?: ID }
  ): Promise<{ taskId: ID }>;
  list(): Promise<AuditTask[]>;
  createRun(taskId: ID): Promise<{ runId: ID }>;
  listRuns(taskId: ID, page: PageRequest): Promise<PageResult<AuditRun>>;
}

export class InMemoryAuditRepository implements AuditRepository {
  private tasks: AuditTask[] = [];
  private runs: AuditRun[] = [];
  private nextTaskId = 1;
  private nextRunId = 1;

  async upsert(
    task: Omit<AuditTask, 'createdAt' | 'updatedAt'> & { id?: ID }
  ): Promise<{ taskId: ID }> {
    const now = new Date().toISOString();

    if (task.id) {
      const idx = this.tasks.findIndex((t) => t.id === task.id);
      if (idx >= 0) {
        this.tasks[idx] = {
          ...this.tasks[idx],
          ...task,
          updatedAt: now,
        };
        return { taskId: task.id };
      }
    }

    const id = `at-${this.nextTaskId++}`;
    this.tasks.push({
      ...task,
      id,
      createdAt: now,
      updatedAt: now,
    });
    return { taskId: id };
  }

  async list(): Promise<AuditTask[]> {
    return this.tasks;
  }

  async createRun(taskId: ID): Promise<{ runId: ID }> {
    const now = new Date().toISOString();
    const id = `ar-${this.nextRunId++}`;
    this.runs.push({
      id,
      taskId,
      startedAt: now,
      status: 'RUNNING',
    });
    return { runId: id };
  }

  async listRuns(
    taskId: ID,
    { page, pageSize }: PageRequest
  ): Promise<PageResult<AuditRun>> {
    const filtered = this.runs.filter((r) => r.taskId === taskId);
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
