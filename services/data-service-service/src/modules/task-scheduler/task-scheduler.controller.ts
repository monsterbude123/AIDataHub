import { Controller, Post, Body } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import type {
  Result,
  DagDefinition,
  QueueConfig,
  TaskExecution,
  PageResult,
  ExecutionLog,
  TriggerDagResponse,
  TriggerTaskResponse,
} from '@ai-datahub/contract';
import type {
  CreateDagRequest,
  UpdateDagRequest,
  DeleteDagRequest,
  ListDagsRequest,
  TriggerDagRequest,
  TriggerTaskRequest,
  UpdateQueueRequest,
  DeleteQueueRequest,
  ListExecutionsRequest,
  StopExecutionRequest,
  GetExecutionLogRequest,
} from '@ai-datahub/contract';
import { TaskSchedulerService } from './task-scheduler.service';

@ApiTags('TaskScheduler')
@Controller('api/scheduler')
export class TaskSchedulerController {
  constructor(private readonly service: TaskSchedulerService) {}

  @Post('dag/create')
  @ApiBody({})
  async createDag(
    @Body() req: CreateDagRequest
  ): Promise<Result<{ dagId: string }>> {
    return this.service.createDag(req);
  }

  @Post('dag/update')
  @ApiBody({})
  async updateDag(
    @Body() req: UpdateDagRequest
  ): Promise<Result<{ success: boolean }>> {
    return this.service.updateDag(req);
  }

  @Post('dag/delete')
  @ApiBody({})
  async deleteDag(
    @Body() req: DeleteDagRequest
  ): Promise<Result<{ success: boolean }>> {
    return this.service.deleteDag(req);
  }

  @Post('dag/list')
  @ApiBody({})
  async listDags(
    @Body() req: ListDagsRequest
  ): Promise<Result<PageResult<DagDefinition>>> {
    return this.service.listDags(req);
  }

  @Post('dag/trigger')
  @ApiBody({})
  async triggerDag(
    @Body() req: TriggerDagRequest
  ): Promise<Result<TriggerDagResponse>> {
    return this.service.triggerDag(req);
  }

  @Post('task/trigger')
  @ApiBody({})
  async triggerTask(
    @Body() req: TriggerTaskRequest
  ): Promise<Result<TriggerTaskResponse>> {
    return this.service.triggerTask(req);
  }

  @Post('queue/create')
  @ApiBody({})
  async createQueue(
    @Body()
    req: {
      meta?: { traceId?: string };
      queue: Omit<QueueConfig, 'queueId'>;
    }
  ): Promise<Result<{ queueId: string }>> {
    return this.service.createQueue({
      meta: req.meta,
      queue: req.queue,
    });
  }

  @Post('queue/update')
  @ApiBody({})
  async updateQueue(
    @Body() req: UpdateQueueRequest
  ): Promise<Result<{ success: boolean }>> {
    return this.service.updateQueue(req);
  }

  @Post('queue/delete')
  @ApiBody({})
  async deleteQueue(
    @Body() req: DeleteQueueRequest
  ): Promise<Result<{ success: boolean }>> {
    return this.service.deleteQueue(req);
  }

  @Post('queue/list')
  @ApiBody({})
  async listQueues(
    @Body() req: { meta?: { traceId?: string } }
  ): Promise<Result<QueueConfig[]>> {
    return this.service.listQueues({
      meta: req.meta,
    });
  }

  @Post('execution/list')
  @ApiBody({})
  async listExecutions(
    @Body() req: ListExecutionsRequest
  ): Promise<Result<PageResult<TaskExecution>>> {
    return this.service.listExecutions(req);
  }

  @Post('execution/get')
  @ApiBody({})
  async getExecution(
    @Body() req: { meta?: { traceId?: string }; executionId: string }
  ): Promise<Result<TaskExecution>> {
    return this.service.getExecution({
      meta: req.meta,
      executionId: req.executionId,
    });
  }

  @Post('execution/stop')
  @ApiBody({})
  async stopExecution(
    @Body() req: StopExecutionRequest
  ): Promise<Result<{ success: boolean }>> {
    return this.service.stopExecution(req);
  }

  @Post('execution/log')
  @ApiBody({})
  async getExecutionLog(
    @Body() req: GetExecutionLogRequest
  ): Promise<Result<ExecutionLog>> {
    return this.service.getExecutionLog(req);
  }
}
