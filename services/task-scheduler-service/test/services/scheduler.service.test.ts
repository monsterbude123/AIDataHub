import { describe, it, expect, beforeEach } from 'vitest';

import {
  TaskStatus,
  TaskType,
} from '../../src/modules/scheduler/entities/task.entity';
import { TaskExecutionStatus } from '../../src/modules/scheduler/entities/task-execution.entity';
import { InMemoryTaskRepository } from '../../src/modules/scheduler/repositories/task.repository';
import { InMemoryTaskExecutionRepository } from '../../src/modules/scheduler/repositories/task-execution.repository';
import { SchedulerService } from '../../src/modules/scheduler/scheduler.service';

describe('SchedulerService', () => {
  let service: SchedulerService;
  let taskRepository: InMemoryTaskRepository;
  let executionRepository: InMemoryTaskExecutionRepository;

  beforeEach(() => {
    taskRepository = new InMemoryTaskRepository();
    executionRepository = new InMemoryTaskExecutionRepository();
    service = new SchedulerService(taskRepository, executionRepository);
  });

  describe('triggerTask', () => {
    it('should create a new execution when triggering a task', async () => {
      // 准备：创建任务
      const task = await taskRepository.create({
        name: 'Test Task',
        module: 'data-integration',
        type: TaskType.ONE_TIME,
        status: TaskStatus.READY,
        config: { sql: 'SELECT 1' },
        priority: 0,
        enabled: true,
      });

      // 执行：触发任务
      const result = await service.triggerTask(task.id, 'MANUAL');

      // 断言
      expect(result.success).toBe(true);
      expect(result.executionId).toBeDefined();
    });

    it('should return error when task not found', async () => {
      const result = await service.triggerTask('non-existent', 'MANUAL');

      expect(result.success).toBe(false);
      expect(result.error).toBe('TASK_NOT_FOUND');
    });

    it('should set execution status to PENDING initially', async () => {
      const task = await taskRepository.create({
        name: 'Test Task',
        module: 'test',
        type: TaskType.ONE_TIME,
        status: TaskStatus.READY,
        config: {},
        priority: 0,
        enabled: true,
      });

      const result = await service.triggerTask(task.id, 'MANUAL');
      const execution = await executionRepository.findById(result.executionId!);

      expect(execution?.status).toBe(TaskExecutionStatus.PENDING);
    });

    it('should pass input to execution', async () => {
      const task = await taskRepository.create({
        name: 'Test Task',
        module: 'test',
        type: TaskType.ONE_TIME,
        status: TaskStatus.READY,
        config: {},
        priority: 0,
        enabled: true,
      });

      const input = { param1: 'value1' };
      const result = await service.triggerTask(task.id, 'MANUAL', input);
      const execution = await executionRepository.findById(result.executionId!);

      expect(execution?.input).toEqual(input);
    });
  });

  describe('processNextTask', () => {
    it('should return null when no pending executions', async () => {
      const result = await service.processNextTask();

      expect(result).toBeNull();
    });

    it('should return pending execution with highest priority', async () => {
      // 创建两个任务
      const task1 = await taskRepository.create({
        name: 'Low Priority Task',
        module: 'test',
        type: TaskType.ONE_TIME,
        status: TaskStatus.READY,
        config: {},
        priority: 0,
        enabled: true,
      });

      const task2 = await taskRepository.create({
        name: 'High Priority Task',
        module: 'test',
        type: TaskType.ONE_TIME,
        status: TaskStatus.READY,
        config: {},
        priority: 100,
        enabled: true,
      });

      // 触发两个任务
      await service.triggerTask(task1.id, 'MANUAL');
      await service.triggerTask(task2.id, 'MANUAL');

      // 处理下一个任务
      const result = await service.processNextTask();

      // 应该返回高优先级任务的执行
      expect(result).not.toBeNull();
      expect(result?.taskId).toBe(task2.id);
    });

    it('should transition execution to READY status', async () => {
      const task = await taskRepository.create({
        name: 'Test Task',
        module: 'test',
        type: TaskType.ONE_TIME,
        status: TaskStatus.READY,
        config: {},
        priority: 0,
        enabled: true,
      });

      await service.triggerTask(task.id, 'MANUAL');
      const result = await service.processNextTask();

      expect(result?.status).toBe(TaskExecutionStatus.READY);
    });
  });

  describe('handleTaskResult', () => {
    it('should mark execution as SUCCESS', async () => {
      const task = await taskRepository.create({
        name: 'Test Task',
        module: 'test',
        type: TaskType.ONE_TIME,
        status: TaskStatus.READY,
        config: {},
        priority: 0,
        enabled: true,
      });

      const triggerResult = await service.triggerTask(task.id, 'MANUAL');
      await service.processNextTask();

      const result = await service.handleTaskResult({
        executionId: triggerResult.executionId!,
        success: true,
        output: { rows: 10 },
      });

      expect(result.success).toBe(true);

      const execution = await executionRepository.findById(
        triggerResult.executionId!
      );
      expect(execution?.status).toBe(TaskExecutionStatus.SUCCESS);
      expect(execution?.output).toEqual({ rows: 10 });
    });

    it('should mark execution as FAILED on error', async () => {
      const task = await taskRepository.create({
        name: 'Test Task',
        module: 'test',
        type: TaskType.ONE_TIME,
        status: TaskStatus.READY,
        config: {},
        priority: 0,
        enabled: true,
      });

      const triggerResult = await service.triggerTask(task.id, 'MANUAL');
      await service.processNextTask();

      const result = await service.handleTaskResult({
        executionId: triggerResult.executionId!,
        success: false,
        errorMessage: 'Connection timeout',
      });

      expect(result.success).toBe(true);

      const execution = await executionRepository.findById(
        triggerResult.executionId!
      );
      expect(execution?.status).toBe(TaskExecutionStatus.FAILED);
      expect(execution?.errorMessage).toBe('Connection timeout');
    });

    it('should record duration', async () => {
      const task = await taskRepository.create({
        name: 'Test Task',
        module: 'test',
        type: TaskType.ONE_TIME,
        status: TaskStatus.READY,
        config: {},
        priority: 0,
        enabled: true,
      });

      const triggerResult = await service.triggerTask(task.id, 'MANUAL');
      await service.processNextTask();

      await service.handleTaskResult({
        executionId: triggerResult.executionId!,
        success: true,
        durationMs: 1500,
      });

      const execution = await executionRepository.findById(
        triggerResult.executionId!
      );
      expect(execution?.durationMs).toBe(1500);
    });
  });

  describe('retryTask', () => {
    it('should create new execution for retry', async () => {
      const task = await taskRepository.create({
        name: 'Test Task',
        module: 'test',
        type: TaskType.ONE_TIME,
        status: TaskStatus.READY,
        config: {},
        priority: 0,
        enabled: true,
        retryPolicy: {
          maxRetries: 3,
          retryDelayMs: 1000,
        },
      });

      const triggerResult = await service.triggerTask(task.id, 'MANUAL');
      await service.processNextTask();

      await service.handleTaskResult({
        executionId: triggerResult.executionId!,
        success: false,
        errorMessage: 'Temporary error',
      });

      const retryResult = await service.retryTask(triggerResult.executionId!);

      expect(retryResult.success).toBe(true);
      expect(retryResult.executionId).toBeDefined();
      expect(retryResult.executionId).not.toBe(triggerResult.executionId);
    });

    it('should not retry if max retries exceeded', async () => {
      const task = await taskRepository.create({
        name: 'Test Task',
        module: 'test',
        type: TaskType.ONE_TIME,
        status: TaskStatus.READY,
        config: {},
        priority: 0,
        enabled: true,
        retryPolicy: {
          maxRetries: 2,
          retryDelayMs: 1000,
        },
      });

      // 第一次执行
      const exec1 = await service.triggerTask(task.id, 'MANUAL');
      await service.processNextTask();
      await service.handleTaskResult({
        executionId: exec1.executionId!,
        success: false,
        errorMessage: 'Error 1',
      });

      // 第一次重试
      const retry1 = await service.retryTask(exec1.executionId!);
      await service.processNextTask();
      await service.handleTaskResult({
        executionId: retry1.executionId!,
        success: false,
        errorMessage: 'Error 2',
      });

      // 第二次重试
      const retry2 = await service.retryTask(retry1.executionId!);
      await service.processNextTask();
      await service.handleTaskResult({
        executionId: retry2.executionId!,
        success: false,
        errorMessage: 'Error 3',
      });

      // 尝试第三次重试（应该失败）
      const retry3 = await service.retryTask(retry2.executionId!);

      expect(retry3.success).toBe(false);
      expect(retry3.error).toBe('MAX_RETRIES_EXCEEDED');
    });

    it('should increment retry count', async () => {
      const task = await taskRepository.create({
        name: 'Test Task',
        module: 'test',
        type: TaskType.ONE_TIME,
        status: TaskStatus.READY,
        config: {},
        priority: 0,
        enabled: true,
        retryPolicy: {
          maxRetries: 3,
          retryDelayMs: 1000,
        },
      });

      const triggerResult = await service.triggerTask(task.id, 'MANUAL');
      await service.processNextTask();
      await service.handleTaskResult({
        executionId: triggerResult.executionId!,
        success: false,
        errorMessage: 'Error',
      });

      const retryResult = await service.retryTask(triggerResult.executionId!);
      const retryExecution = await executionRepository.findById(
        retryResult.executionId!
      );

      expect(retryExecution?.retryCount).toBe(1);
    });
  });
});
