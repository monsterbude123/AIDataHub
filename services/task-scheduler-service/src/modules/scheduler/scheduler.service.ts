import { Injectable } from '@nestjs/common';

import type { ID } from '@ai-datahub/contract';

import {
  TaskExecutionStatus,
  type TaskExecutionEntity,
  type TriggerType,
} from './entities/task-execution.entity';
import { InMemoryTaskRepository } from './repositories/task.repository';
import { InMemoryTaskExecutionRepository } from './repositories/task-execution.repository';

/**
 * 触发任务结果
 */
export interface TriggerResult {
  success: boolean;
  executionId?: ID;
  error?: string;
}

/**
 * 处理任务结果参数
 */
export interface HandleResultParams {
  executionId: ID;
  success: boolean;
  output?: Record<string, unknown>;
  errorMessage?: string;
  errorStack?: string;
  durationMs?: number;
  rowsProcessed?: number;
}

@Injectable()
export class SchedulerService {
  constructor(
    private readonly taskRepository: InMemoryTaskRepository,
    private readonly executionRepository: InMemoryTaskExecutionRepository
  ) {}

  getStatus(): { status: string } {
    return { status: 'ready' };
  }

  /**
   * 触发任务执行
   */
  async triggerTask(
    taskId: ID,
    triggerType: TriggerType,
    input?: Record<string, unknown>
  ): Promise<TriggerResult> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      return { success: false, error: 'TASK_NOT_FOUND' };
    }

    const execution = await this.executionRepository.create({
      taskId,
      status: TaskExecutionStatus.PENDING,
      triggerType,
      input,
      retryCount: 0,
    });

    return { success: true, executionId: execution.id };
  }

  /**
   * 获取下一个待处理的执行（按优先级排序）
   */
  async processNextTask(): Promise<TaskExecutionEntity | null> {
    // 获取所有 PENDING 状态的执行
    const pendingExecutions = await this.executionRepository.findByStatus(
      TaskExecutionStatus.PENDING
    );

    if (pendingExecutions.length === 0) {
      return null;
    }

    // 按任务优先级排序（需要获取关联的任务）
    const executionsWithTasks = await Promise.all(
      pendingExecutions.map(async (exec) => {
        const task = await this.taskRepository.findById(exec.taskId);
        return { execution: exec, priority: task?.priority ?? 0 };
      })
    );

    // 排序并选择最高优先级
    executionsWithTasks.sort((a, b) => b.priority - a.priority);
    const selected = executionsWithTasks[0].execution;

    // 更新状态为 READY
    await this.executionRepository.updateStatus(
      selected.id,
      TaskExecutionStatus.READY,
      { startedAt: new Date() }
    );

    const updated = await this.executionRepository.findById(selected.id);
    return updated;
  }

  /**
   * 处理任务执行结果
   */
  async handleTaskResult(
    params: HandleResultParams
  ): Promise<{ success: boolean }> {
    const {
      executionId,
      success,
      output,
      errorMessage,
      errorStack,
      durationMs,
      rowsProcessed,
    } = params;

    const status = success
      ? TaskExecutionStatus.SUCCESS
      : TaskExecutionStatus.FAILED;
    const updates: Partial<TaskExecutionEntity> = {
      endedAt: new Date(),
      durationMs,
      rowsProcessed,
    };

    if (success) {
      updates.output = output;
    } else {
      updates.errorMessage = errorMessage;
      updates.errorStack = errorStack;
    }

    await this.executionRepository.updateStatus(executionId, status, updates);

    return { success: true };
  }

  /**
   * 重试失败的任务
   */
  async retryTask(executionId: ID): Promise<TriggerResult> {
    const execution = await this.executionRepository.findById(executionId);
    if (!execution) {
      return { success: false, error: 'EXECUTION_NOT_FOUND' };
    }

    const task = await this.taskRepository.findById(execution.taskId);
    if (!task) {
      return { success: false, error: 'TASK_NOT_FOUND' };
    }

    // 检查重试策略
    const maxRetries = task.retryPolicy?.maxRetries ?? 0;
    if (execution.retryCount >= maxRetries) {
      return { success: false, error: 'MAX_RETRIES_EXCEEDED' };
    }

    // 创建新的执行记录
    const newExecution = await this.executionRepository.create({
      taskId: execution.taskId,
      status: TaskExecutionStatus.PENDING,
      triggerType: 'MANUAL',
      input: execution.input,
      retryCount: execution.retryCount + 1,
    });

    return { success: true, executionId: newExecution.id };
  }
}
