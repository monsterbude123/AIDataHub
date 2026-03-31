# 阶段 3：`task-scheduler` 模块 SDK 契约

## 1) 模块定位

- 统一任务调度中心：DAG 编排、触发策略、队列与优先级、资源隔离、集群负载均衡、统一日志。
- 所有模块的“任务定义/配置”可在本模块注册并由本模块统一触发执行。

## 2) 依赖的共享实体

来自 `00-shared-entities.md`：

- `Task`
- `TaskExecution`
- `RequestMeta`
- `Result<T>`
- `PageRequest` / `PageResult<T>`

## 3) 错误码（本模块）

```ts
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
```

## 4) DTO 定义

```ts
import type {
  ID,
  PageRequest,
  PageResult,
  RequestMeta,
  Result,
  Task,
  TaskExecution,
} from './00-shared-entities';

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
  updatedAt?: string;
};

export type GetExecutionLogRequest = { meta?: RequestMeta; executionId: ID };
```

## 5) 对外 SDK 接口（`TaskSchedulerClient`）

```ts
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
```

## 6) 幂等性要求

- `createDag` / `createQueue`：非幂等（默认），建议支持 `idempotencyKey`。\n- `triggerDag`：非幂等（默认），建议支持 `idempotencyKey`。\n- 查询类：幂等。
- `updateDag` / `deleteDag` / `updateQueue` / `deleteQueue` / `stopExecution`：幂等。\n- `triggerTask`：非幂等（默认），建议支持 `idempotencyKey`。\n- `getExecutionLog`：幂等。

## 7) Mock 服务规则

- `createDag`\n - 默认：返回 `dagId="dag_1"`\n - 可模拟异常：`INVALID_DAG`\n- `triggerDag`\n - 默认：返回 `executionIds=["exe_1","exe_2"]`\n - 可模拟异常：`TRIGGER_FAILED`\n- `listExecutions`\n - 默认：返回分页执行记录（items 10 条）
