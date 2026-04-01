import { describe, it, expect } from 'vitest';

import {
  TaskEntity,
  TaskStatus,
  TaskType,
} from '../../src/modules/scheduler/entities/task.entity';

describe('TaskEntity', () => {
  it('should create a task with required fields', () => {
    const task = new TaskEntity();
    task.id = 'task-1';
    task.name = 'Test Task';
    task.module = 'data-integration';
    task.type = TaskType.ONE_TIME;
    task.status = TaskStatus.READY;
    task.config = { sql: 'SELECT 1' };
    task.createdAt = new Date();
    task.updatedAt = new Date();

    expect(task.id).toBe('task-1');
    expect(task.name).toBe('Test Task');
    expect(task.module).toBe('data-integration');
    expect(task.type).toBe(TaskType.ONE_TIME);
    expect(task.status).toBe(TaskStatus.READY);
  });

  it('should support cron expression for scheduled tasks', () => {
    const task = new TaskEntity();
    task.id = 'task-2';
    task.name = 'Scheduled Task';
    task.module = 'metadata';
    task.type = TaskType.SCHEDULED;
    task.status = TaskStatus.READY;
    task.cronExpression = '0 0 * * *'; // 每天凌晨
    task.config = {};
    task.createdAt = new Date();
    task.updatedAt = new Date();

    expect(task.cronExpression).toBe('0 0 * * *');
    expect(task.type).toBe(TaskType.SCHEDULED);
  });

  it('should have retry policy', () => {
    const task = new TaskEntity();
    task.id = 'task-3';
    task.name = 'Task with Retry';
    task.module = 'data-governance';
    task.type = TaskType.ONE_TIME;
    task.status = TaskStatus.READY;
    task.retryPolicy = {
      maxRetries: 3,
      retryDelayMs: 1000,
      backoffMultiplier: 2,
    };
    task.config = {};
    task.createdAt = new Date();
    task.updatedAt = new Date();

    expect(task.retryPolicy?.maxRetries).toBe(3);
    expect(task.retryPolicy?.backoffMultiplier).toBe(2);
  });
});
