import type {
  TaskExecution,
  ID,
  PageRequest,
  PageResult,
  ExecutionLog,
} from '@ai-datahub/contract';

export interface ExecutionRepository {
  create(execution: Omit<TaskExecution, 'id'>): Promise<{ id: ID }>;
  getById(id: ID): Promise<TaskExecution | null>;
  list(filter: {
    status?: string;
    page: PageRequest;
  }): Promise<PageResult<TaskExecution>>;
  stop(id: ID, reason?: string): Promise<boolean>;
  getLog(executionId: ID): Promise<ExecutionLog | null>;
}

export class InMemoryExecutionRepository implements ExecutionRepository {
  private executions: TaskExecution[] = [];
  private logs: Map<ID, ExecutionLog> = new Map();
  private nextId = 1;

  async create(execution: Omit<TaskExecution, 'id'>): Promise<{ id: ID }> {
    const id = `exec-${this.nextId++}`;
    this.executions.push({
      ...execution,
      id,
    });

    // Create an empty log
    this.logs.set(id, {
      executionId: id,
      logRef: `memory://${id}`,
      updatedAt: new Date().toISOString(),
    });

    return { id };
  }

  async getById(id: ID): Promise<TaskExecution | null> {
    return this.executions.find((e) => e.id === id) || null;
  }

  async list(filter: {
    status?: string;
    page: PageRequest;
  }): Promise<PageResult<TaskExecution>> {
    let filtered = this.executions;
    if (filter.status) {
      filtered = filtered.filter((e) => e.status === filter.status);
    }
    const { page, pageSize } = filter.page;
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);
    return {
      page,
      pageSize,
      total: filtered.length,
      items,
    };
  }

  async stop(id: ID, reason?: string): Promise<boolean> {
    const index = this.executions.findIndex((e) => e.id === id);
    if (index < 0) return false;
    this.executions[index] = {
      ...this.executions[index],
      status: 'STOPPED',
      endedAt: new Date().toISOString(),
      ...(reason ? { errorMessage: reason } : {}),
    };
    return true;
  }

  async getLog(executionId: ID): Promise<ExecutionLog | null> {
    return this.logs.get(executionId) || null;
  }
}
