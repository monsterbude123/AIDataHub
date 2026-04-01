import { Injectable } from '@nestjs/common';
import type { ID } from '@ai-datahub/contract';

import type { TaskEntity, TaskStatus } from '../entities/task.entity';

/**
 * 任务仓储接口
 */
export interface ITaskRepository {
  create(
    task: Omit<TaskEntity, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<TaskEntity>;
  findById(id: ID): Promise<TaskEntity | null>;
  findByStatus(status: TaskStatus): Promise<TaskEntity[]>;
  findAll(): Promise<TaskEntity[]>;
  update(task: TaskEntity): Promise<boolean>;
  delete(id: ID): Promise<boolean>;
}

/**
 * InMemory 任务仓储实现（MVP 阶段）
 */
@Injectable()
export class InMemoryTaskRepository implements ITaskRepository {
  private readonly tasks: Map<ID, TaskEntity> = new Map();
  private idCounter = 0;

  async create(
    task: Omit<TaskEntity, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<TaskEntity> {
    const id = `task-${++this.idCounter}`;
    const now = new Date();
    const newTask: TaskEntity = {
      ...task,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.tasks.set(id, newTask);
    return newTask;
  }

  async findById(id: ID): Promise<TaskEntity | null> {
    return this.tasks.get(id) ?? null;
  }

  async findByStatus(status: TaskStatus): Promise<TaskEntity[]> {
    return Array.from(this.tasks.values()).filter((t) => t.status === status);
  }

  async findAll(): Promise<TaskEntity[]> {
    return Array.from(this.tasks.values());
  }

  async update(task: TaskEntity): Promise<boolean> {
    if (!this.tasks.has(task.id)) {
      return false;
    }
    this.tasks.set(task.id, {
      ...task,
      updatedAt: new Date(),
    });
    return true;
  }

  async delete(id: ID): Promise<boolean> {
    return this.tasks.delete(id);
  }
}
