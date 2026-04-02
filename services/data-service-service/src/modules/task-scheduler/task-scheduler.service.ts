import { Injectable } from '@nestjs/common';
import type {
  TaskSchedulerClient,
  CreateDagRequest,
  UpdateDagRequest,
  DeleteDagRequest,
  ListDagsRequest,
  TriggerDagRequest,
  TriggerDagResponse,
  QueueConfig,
  UpdateQueueRequest,
  DeleteQueueRequest,
  ListExecutionsRequest,
  StopExecutionRequest,
  GetExecutionLogRequest,
  ExecutionLog,
  TaskExecution,
  Result,
  PageResult,
  ID,
  DagDefinition,
  TaskStatus,
  TriggerType,
} from '@ai-datahub/contract';
import { okResult, errResult } from '@ai-datahub/contract';
import { InMemoryDagRepository } from './repositories/dag.repository';
import { InMemoryQueueRepository } from './repositories/queue.repository';
import { InMemoryExecutionRepository } from './repositories/execution.repository';

@Injectable()
export class TaskSchedulerService implements TaskSchedulerClient {
  constructor(
    private readonly dagRepo: InMemoryDagRepository,
    private readonly queueRepo: InMemoryQueueRepository,
    private readonly executionRepo: InMemoryExecutionRepository
  ) {}

  // -------------------------
  // DAG Management
  // -------------------------

  async createDag(req: CreateDagRequest): Promise<Result<{ dagId: ID }>> {
    const traceId = req.meta?.traceId;
    const result = await this.dagRepo.create(req.dag);
    return okResult(result, traceId);
  }

  async updateDag(
    req: UpdateDagRequest
  ): Promise<Result<{ success: boolean }>> {
    const traceId = req.meta?.traceId;
    const success = await this.dagRepo.update(req.dag);
    if (!success) {
      return errResult(
        {
          code: 'DAG_NOT_FOUND',
          message: 'DAG not found',
          level: 'ERROR',
        },
        traceId
      );
    }
    return okResult({ success }, traceId);
  }

  async deleteDag(
    req: DeleteDagRequest
  ): Promise<Result<{ success: boolean }>> {
    const traceId = req.meta?.traceId;
    const success = await this.dagRepo.delete(req.dagId);
    if (!success) {
      return errResult(
        {
          code: 'DAG_NOT_FOUND',
          message: 'DAG not found',
          level: 'ERROR',
        },
        traceId
      );
    }
    return okResult({ success }, traceId);
  }

  async listDags(
    req: ListDagsRequest
  ): Promise<Result<PageResult<DagDefinition>>> {
    const traceId = req.meta?.traceId;
    const result = await this.dagRepo.list(req.keyword, req.page);
    return okResult(result, traceId);
  }

  async triggerDag(
    req: TriggerDagRequest
  ): Promise<Result<TriggerDagResponse>> {
    const traceId = req.meta?.traceId;
    // In-memory implementation: trigger each node in sequence
    const dag = await this.dagRepo.findById(req.dagId);
    if (!dag) {
      return errResult(
        {
          code: 'DAG_NOT_FOUND',
          message: 'DAG not found',
          level: 'ERROR',
        },
        traceId
      );
    }

    const executionIds: ID[] = [];
    for (const node of dag.nodes) {
      // Create an execution for each node
      const exec = {
        taskId: node.taskId,
        triggerType: req.triggerType,
        status: 'RUNNING' as TaskStatus,
        startedAt: new Date().toISOString(),
      };
      const result = await this.executionRepo.create(exec);
      executionIds.push(result.id);
    }

    return okResult({ executionIds }, traceId);
  }

  async triggerTask(req: {
    meta?: { traceId?: string };
    taskId: ID;
    triggerType: TriggerType;
  }): Promise<Result<{ executionId: ID }>> {
    const traceId = req.meta?.traceId;
    const execution: Omit<TaskExecution, 'id'> = {
      taskId: req.taskId,
      triggerType: req.triggerType,
      status: 'RUNNING' as TaskStatus,
      startedAt: new Date().toISOString(),
    };
    const result = await this.executionRepo.create(execution);
    return okResult({ executionId: result.id }, traceId);
  }

  // -------------------------
  // Queue Management
  // -------------------------

  async createQueue(req: {
    meta?: { traceId?: string };
    queue: Omit<QueueConfig, 'queueId'>;
  }): Promise<Result<{ queueId: ID }>> {
    const traceId = req.meta?.traceId;
    const result = await this.queueRepo.create(req.queue);
    return okResult(result, traceId);
  }

  async updateQueue(
    req: UpdateQueueRequest
  ): Promise<Result<{ success: boolean }>> {
    const traceId = req.meta?.traceId;
    const success = await this.queueRepo.update(req.queue);
    if (!success) {
      return errResult(
        {
          code: 'QUEUE_NOT_FOUND',
          message: 'Queue not found',
          level: 'ERROR',
        },
        traceId
      );
    }
    return okResult({ success }, traceId);
  }

  async deleteQueue(
    req: DeleteQueueRequest
  ): Promise<Result<{ success: boolean }>> {
    const traceId = req.meta?.traceId;
    const success = await this.queueRepo.delete(req.queueId);
    if (!success) {
      return errResult(
        {
          code: 'QUEUE_NOT_FOUND',
          message: 'Queue not found',
          level: 'ERROR',
        },
        traceId
      );
    }
    return okResult({ success }, traceId);
  }

  async listQueues(req: {
    meta?: { traceId?: string };
  }): Promise<Result<QueueConfig[]>> {
    const traceId = req.meta?.traceId;
    const result = await this.queueRepo.list();
    return okResult(result, traceId);
  }

  // -------------------------
  // Execution Management
  // -------------------------

  async listExecutions(
    req: ListExecutionsRequest
  ): Promise<Result<PageResult<TaskExecution>>> {
    const traceId = req.meta?.traceId;
    const result = await this.executionRepo.list({
      status: req.status,
      page: req.page,
    });
    return okResult(result, traceId);
  }

  async getExecution(req: {
    meta?: { traceId?: string };
    executionId: ID;
  }): Promise<Result<TaskExecution>> {
    const traceId = req.meta?.traceId;
    const execution = await this.executionRepo.getById(req.executionId);
    if (!execution) {
      return errResult(
        {
          code: 'TASK_NOT_FOUND',
          message: 'Execution not found',
          level: 'ERROR',
        },
        traceId
      );
    }
    return okResult(execution, traceId);
  }

  async stopExecution(
    req: StopExecutionRequest
  ): Promise<Result<{ success: boolean }>> {
    const traceId = req.meta?.traceId;
    const success = await this.executionRepo.stop(req.executionId, req.reason);
    if (!success) {
      return errResult(
        {
          code: 'TASK_NOT_FOUND',
          message: 'Execution not found',
          level: 'ERROR',
        },
        traceId
      );
    }
    return okResult({ success }, traceId);
  }

  async getExecutionLog(
    req: GetExecutionLogRequest
  ): Promise<Result<ExecutionLog>> {
    const traceId = req.meta?.traceId;
    const log = await this.executionRepo.getLog(req.executionId);
    if (!log) {
      return errResult(
        {
          code: 'LOG_NOT_FOUND',
          message: 'Execution log not found',
          level: 'ERROR',
        },
        traceId
      );
    }
    return okResult(log, traceId);
  }
}
