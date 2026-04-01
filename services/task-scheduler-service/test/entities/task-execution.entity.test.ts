import { describe, it, expect } from 'vitest';

import {
  TaskExecutionEntity,
  TaskExecutionStatus,
} from '../../src/modules/scheduler/entities/task-execution.entity';

describe('TaskExecutionEntity', () => {
  it('should create an execution with required fields', () => {
    const execution = new TaskExecutionEntity();
    execution.id = 'exec-1';
    execution.taskId = 'task-1';
    execution.status = TaskExecutionStatus.RUNNING;
    execution.triggerType = 'MANUAL';
    execution.startedAt = new Date();

    expect(execution.id).toBe('exec-1');
    expect(execution.taskId).toBe('task-1');
    expect(execution.status).toBe(TaskExecutionStatus.RUNNING);
    expect(execution.triggerType).toBe('MANUAL');
  });

  it('should track execution duration', () => {
    const startTime = new Date('2024-01-01T10:00:00Z');
    const endTime = new Date('2024-01-01T10:00:30Z');

    const execution = new TaskExecutionEntity();
    execution.id = 'exec-2';
    execution.taskId = 'task-1';
    execution.status = TaskExecutionStatus.SUCCESS;
    execution.triggerType = 'SCHEDULED';
    execution.startedAt = startTime;
    execution.endedAt = endTime;
    execution.durationMs = 30000;

    expect(execution.durationMs).toBe(30000);
    expect(execution.status).toBe(TaskExecutionStatus.SUCCESS);
  });

  it('should record error information on failure', () => {
    const execution = new TaskExecutionEntity();
    execution.id = 'exec-3';
    execution.taskId = 'task-1';
    execution.status = TaskExecutionStatus.FAILED;
    execution.triggerType = 'MANUAL';
    execution.startedAt = new Date();
    execution.endedAt = new Date();
    execution.errorMessage = 'Connection timeout';
    execution.errorStack = 'Error: Connection timeout\n  at ...';

    expect(execution.status).toBe(TaskExecutionStatus.FAILED);
    expect(execution.errorMessage).toBe('Connection timeout');
  });

  it('should support retry count tracking', () => {
    const execution = new TaskExecutionEntity();
    execution.id = 'exec-4';
    execution.taskId = 'task-1';
    execution.status = TaskExecutionStatus.RUNNING;
    execution.triggerType = 'MANUAL';
    execution.retryCount = 2;
    execution.startedAt = new Date();

    expect(execution.retryCount).toBe(2);
  });
});
