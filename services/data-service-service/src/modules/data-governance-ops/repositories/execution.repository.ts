import type { TaskExecution, ID } from '@ai-datahub/contract';

export interface ExecutionRepository {
  getById(executionId: ID): Promise<TaskExecution | null>;
  create(execution: Omit<TaskExecution, 'id'>): Promise<{ executionId: ID }>;
}

export class InMemoryExecutionRepository implements ExecutionRepository {
  private executions: TaskExecution[] = [];
  private nextId = 1;

  async getById(executionId: ID): Promise<TaskExecution | null> {
    return this.executions.find((e) => e.id === executionId) || null;
  }

  async create(
    execution: Omit<TaskExecution, 'id'>
  ): Promise<{ executionId: ID }> {
    const id = `exec-${this.nextId++}`;
    this.executions.push({
      ...execution,
      id,
    });
    return { executionId: id };
  }
}
