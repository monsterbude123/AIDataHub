import { describe, it, expect, beforeEach } from 'vitest';

import {
  TaskExecutionEntity,
  TaskExecutionStatus,
} from '../../src/modules/scheduler/entities/task-execution.entity';
import { InMemoryTaskExecutionRepository } from '../../src/modules/scheduler/repositories/task-execution.repository';

describe('InMemoryTaskExecutionRepository', () => {
  let repository: InMemoryTaskExecutionRepository;

  beforeEach(() => {
    repository = new InMemoryTaskExecutionRepository();
  });

  describe('create', () => {
    it('should create an execution and return id', async () => {
      const execution = new TaskExecutionEntity();
      execution.taskId = 'task-1';
      execution.status = TaskExecutionStatus.PENDING;
      execution.triggerType = 'MANUAL';
      execution.retryCount = 0;

      const result = await repository.create(execution);

      expect(result.id).toBeDefined();
    });
  });

  describe('findById', () => {
    it('should return execution by id', async () => {
      const execution = new TaskExecutionEntity();
      execution.taskId = 'task-1';
      execution.status = TaskExecutionStatus.RUNNING;
      execution.triggerType = 'MANUAL';
      execution.retryCount = 0;

      const created = await repository.create(execution);
      const found = await repository.findById(created.id);

      expect(found).toBeDefined();
      expect(found?.taskId).toBe('task-1');
    });
  });

  describe('findByTaskId', () => {
    it('should return executions by task id', async () => {
      const exec1 = new TaskExecutionEntity();
      exec1.taskId = 'task-1';
      exec1.status = TaskExecutionStatus.SUCCESS;
      exec1.triggerType = 'MANUAL';
      exec1.retryCount = 0;

      const exec2 = new TaskExecutionEntity();
      exec2.taskId = 'task-1';
      exec2.status = TaskExecutionStatus.FAILED;
      exec2.triggerType = 'SCHEDULED';
      exec2.retryCount = 1;

      const exec3 = new TaskExecutionEntity();
      exec3.taskId = 'task-2';
      exec3.status = TaskExecutionStatus.RUNNING;
      exec3.triggerType = 'MANUAL';
      exec3.retryCount = 0;

      await repository.create(exec1);
      await repository.create(exec2);
      await repository.create(exec3);

      const task1Executions = await repository.findByTaskId('task-1');

      expect(task1Executions).toHaveLength(2);
    });
  });

  describe('findByStatus', () => {
    it('should return executions by status', async () => {
      const execution = new TaskExecutionEntity();
      execution.taskId = 'task-1';
      execution.status = TaskExecutionStatus.RUNNING;
      execution.triggerType = 'MANUAL';
      execution.retryCount = 0;

      await repository.create(execution);

      const runningExecutions = await repository.findByStatus(
        TaskExecutionStatus.RUNNING
      );

      expect(runningExecutions).toHaveLength(1);
    });
  });

  describe('updateStatus', () => {
    it('should update execution status', async () => {
      const execution = new TaskExecutionEntity();
      execution.taskId = 'task-1';
      execution.status = TaskExecutionStatus.PENDING;
      execution.triggerType = 'MANUAL';
      execution.retryCount = 0;

      const created = await repository.create(execution);
      const success = await repository.updateStatus(
        created.id,
        TaskExecutionStatus.RUNNING,
        { startedAt: new Date() }
      );
      const found = await repository.findById(created.id);

      expect(success).toBe(true);
      expect(found?.status).toBe(TaskExecutionStatus.RUNNING);
      expect(found?.startedAt).toBeDefined();
    });
  });
});
