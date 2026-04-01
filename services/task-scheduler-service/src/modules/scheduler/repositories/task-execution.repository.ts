import { Injectable } from '@nestjs/common';
import type { ID } from '@ai-datahub/contract';

import type {
  TaskExecutionEntity,
  TaskExecutionStatus,
} from '../entities/task-execution.entity';

/**
 * 任务执行仓储接口
 */
export interface ITaskExecutionRepository {
  create(
    execution: Omit<TaskExecutionEntity, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<TaskExecutionEntity>;
  findById(id: ID): Promise<TaskExecutionEntity | null>;
  findByTaskId(taskId: ID): Promise<TaskExecutionEntity[]>;
  findByStatus(status: TaskExecutionStatus): Promise<TaskExecutionEntity[]>;
  updateStatus(
    id: ID,
    status: TaskExecutionStatus,
    updates?: Partial<TaskExecutionEntity>
  ): Promise<boolean>;
}

/**
 * InMemory 任务执行仓储实现（MVP 阶段）
 */
@Injectable()
export class InMemoryTaskExecutionRepository implements ITaskExecutionRepository {
  private readonly executions: Map<ID, TaskExecutionEntity> = new Map();
  private idCounter = 0;

  async create(
    execution: Omit<TaskExecutionEntity, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<TaskExecutionEntity> {
    const id = `exec-${++this.idCounter}`;
    const now = new Date();
    const newExecution: TaskExecutionEntity = {
      ...execution,
      id,
      retryCount: execution.retryCount ?? 0,
      createdAt: now,
      updatedAt: now,
    };
    this.executions.set(id, newExecution);
    return newExecution;
  }

  async findById(id: ID): Promise<TaskExecutionEntity | null> {
    return this.executions.get(id) ?? null;
  }

  async findByTaskId(taskId: ID): Promise<TaskExecutionEntity[]> {
    return Array.from(this.executions.values()).filter(
      (e) => e.taskId === taskId
    );
  }

  async findByStatus(
    status: TaskExecutionStatus
  ): Promise<TaskExecutionEntity[]> {
    return Array.from(this.executions.values()).filter(
      (e) => e.status === status
    );
  }

  async updateStatus(
    id: ID,
    status: TaskExecutionStatus,
    updates?: Partial<TaskExecutionEntity>
  ): Promise<boolean> {
    const execution = this.executions.get(id);
    if (!execution) {
      return false;
    }
    this.executions.set(id, {
      ...execution,
      ...updates,
      status,
      updatedAt: new Date(),
    });
    return true;
  }
}
