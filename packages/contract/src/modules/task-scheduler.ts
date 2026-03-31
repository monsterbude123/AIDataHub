import type {
  ID,
  ISODateTime,
  PageRequest,
  PageResult,
  RequestMeta,
  Result,
  TaskExecution,
} from '../types';

export type TaskSchedulerErrorCode =
  | 'TASK_NOT_FOUND'
  | 'INVALID_DAG'
  | 'QUEUE_NOT_FOUND'
  | 'DAG_NOT_FOUND'
  | 'LOG_NOT_FOUND'
  | 'INVALID_ARGUMENT'
  | 'PERMISSION_DENIED'
  | 'SCHEDULE_FAILED'
  | 'TRIGGER_FAILED';

export type DagNode = {
  nodeId: ID;
  taskId: ID;
  dependsOn?: ID[];
};

export type DagDefinition = {
  dagId: ID;
  name: string;
  nodes: DagNode[];
};

export type CreateDagRequest = {
  meta?: RequestMeta;
  dag: Omit<DagDefinition, 'dagId'>;
};

export type UpdateDagRequest = {
  meta?: RequestMeta;
  dag: DagDefinition;
};

export type DeleteDagRequest = { meta?: RequestMeta; dagId: ID };

export type ListDagsRequest = {
  meta?: RequestMeta;
  keyword?: string;
  page: PageRequest;
};

export type TriggerDagRequest = {
  meta?: RequestMeta;
  dagId: ID;
  triggerType: 'MANUAL' | 'SCHEDULED' | 'EVENT';
  input?: Record<string, unknown>;
};

export type TriggerDagResponse = {
  executionIds: ID[]; // 节点对应的 TaskExecution
};

export type QueueConfig = {
  queueId: ID;
  name: string;
  priority: number;
  resourceIsolationKey?: string;
};

export type UpdateQueueRequest = { meta?: RequestMeta; queue: QueueConfig };
export type DeleteQueueRequest = { meta?: RequestMeta; queueId: ID };

export type TriggerTaskRequest = {
  meta?: RequestMeta;
  taskId: ID;
  triggerType: 'MANUAL' | 'SCHEDULED' | 'EVENT';
  input?: Record<string, unknown>;
};

export type TriggerTaskResponse = { executionId: ID };

export type ListExecutionsRequest = {
  meta?: RequestMeta;
  module?: string;
  status?: string;
  page: PageRequest;
};

export type StopExecutionRequest = {
  meta?: RequestMeta;
  executionId: ID;
  reason?: string;
};

export type ExecutionLog = {
  executionId: ID;
  // 日志引用（全文/分片/流式）由实现层决定
  logRef: string;
  updatedAt?: ISODateTime;
};

export type GetExecutionLogRequest = { meta?: RequestMeta; executionId: ID };

export interface TaskSchedulerClient {
  createDag(req: CreateDagRequest): Promise<Result<{ dagId: ID }>>;
  updateDag(req: UpdateDagRequest): Promise<Result<{ success: boolean }>>;
  deleteDag(req: DeleteDagRequest): Promise<Result<{ success: boolean }>>;
  listDags(req: ListDagsRequest): Promise<Result<PageResult<DagDefinition>>>;

  triggerDag(req: TriggerDagRequest): Promise<Result<TriggerDagResponse>>;
  triggerTask(req: TriggerTaskRequest): Promise<Result<TriggerTaskResponse>>;

  createQueue(req: {
    meta?: RequestMeta;
    queue: Omit<QueueConfig, 'queueId'>;
  }): Promise<Result<{ queueId: ID }>>;
  updateQueue(req: UpdateQueueRequest): Promise<Result<{ success: boolean }>>;
  deleteQueue(req: DeleteQueueRequest): Promise<Result<{ success: boolean }>>;
  listQueues(req: { meta?: RequestMeta }): Promise<Result<QueueConfig[]>>;

  listExecutions(
    req: ListExecutionsRequest
  ): Promise<Result<PageResult<TaskExecution>>>;
  getExecution(req: {
    meta?: RequestMeta;
    executionId: ID;
  }): Promise<Result<TaskExecution>>;
  stopExecution(
    req: StopExecutionRequest
  ): Promise<Result<{ success: boolean }>>;
  getExecutionLog(req: GetExecutionLogRequest): Promise<Result<ExecutionLog>>;
}
