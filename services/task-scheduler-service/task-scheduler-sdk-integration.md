# Task Scheduler SDK 集成指南

本文档说明如何使用 `@ai-datahub/contract` 中定义的 `TaskSchedulerClient` 接口与 `task-scheduler-service` 交互。

## 概述

`TaskSchedulerClient` 定义了任务调度服务的完整 API 契约，包括：

- DAG 管理
- 任务触发
- 队列管理
- 执行管理
- 日志查询

## 安装

```bash
npm install @ai-datahub/contract
```

## 使用示例

### 1. 创建 DAG

```typescript
import {
  TaskSchedulerClient,
  CreateDagRequest,
  okResult,
} from '@ai-datahub/contract';

// 创建 DAG 请求
const createDagRequest: CreateDagRequest = {
  meta: { traceId: 'trace-123' },
  dag: {
    name: '数据同步管道',
    nodes: [
      { nodeId: 'node-1', taskId: 'task-extract' },
      { nodeId: 'node-2', taskId: 'task-transform', dependsOn: ['node-1'] },
      { nodeId: 'node-3', taskId: 'task-load', dependsOn: ['node-2'] },
    ],
  },
};

const result = await client.createDag(createDagRequest);
if (result.ok) {
  console.log('DAG 创建成功:', result.data.dagId);
}
```

### 2. 触发 DAG 执行

```typescript
import { TriggerDagRequest } from '@ai-datahub/contract';

const triggerRequest: TriggerDagRequest = {
  meta: { traceId: 'trace-456' },
  dagId: 'dag-001',
  triggerType: 'MANUAL',
  input: {
    sourceTable: 'users',
    targetTable: 'users_backup',
  },
};

const result = await client.triggerDag(triggerRequest);
if (result.ok) {
  console.log('执行 ID 列表:', result.data.executionIds);
}
```

### 3. 触发单个任务

```typescript
import { TriggerTaskRequest } from '@ai-datahub/contract';

const triggerTaskRequest: TriggerTaskRequest = {
  meta: { traceId: 'trace-789' },
  taskId: 'task-001',
  triggerType: 'MANUAL',
  input: { param: 'value' },
};

const result = await client.triggerTask(triggerTaskRequest);
if (result.ok) {
  console.log('执行 ID:', result.data.executionId);
}
```

### 4. 查询执行状态

```typescript
const result = await client.getExecution({
  meta: { traceId: 'trace-abc' },
  executionId: 'exec-001',
});

if (result.ok) {
  const execution = result.data;
  console.log('状态:', execution.status);
  console.log('开始时间:', execution.startedAt);
  console.log('持续时长:', execution.durationMs, 'ms');
}
```

### 5. 列出执行记录

```typescript
import { ListExecutionsRequest } from '@ai-datahub/contract';

const listRequest: ListExecutionsRequest = {
  meta: { traceId: 'trace-def' },
  module: 'data-integration',
  status: 'RUNNING',
  page: { page: 1, pageSize: 20 },
};

const result = await client.listExecutions(listRequest);
if (result.ok) {
  console.log('总数:', result.data.total);
  console.log('执行列表:', result.data.items);
}
```

### 6. 停止执行

```typescript
const result = await client.stopExecution({
  meta: { traceId: 'trace-ghi' },
  executionId: 'exec-001',
  reason: '用户取消',
});

if (result.ok) {
  console.log('执行已停止');
}
```

### 7. 获取执行日志

```typescript
const result = await client.getExecutionLog({
  meta: { traceId: 'trace-jkl' },
  executionId: 'exec-001',
});

if (result.ok) {
  console.log('日志引用:', result.data.logRef);
}
```

### 8. 队列管理

```typescript
// 创建队列
const createQueueResult = await client.createQueue({
  meta: { traceId: 'trace-mno' },
  queue: {
    name: '高优先级队列',
    priority: 100,
    resourceIsolationKey: 'tenant-abc',
  },
});

// 列出所有队列
const listQueuesResult = await client.listQueues({
  meta: { traceId: 'trace-pqr' },
});

// 更新队列
const updateQueueResult = await client.updateQueue({
  meta: { traceId: 'trace-stu' },
  queue: {
    queueId: 'queue-001',
    name: '更新后的队列名',
    priority: 150,
  },
});

// 删除队列
const deleteQueueResult = await client.deleteQueue({
  meta: { traceId: 'trace-vwx' },
  queueId: 'queue-001',
});
```

## 错误处理

所有 API 返回 `Result<T>` 类型，包含：

- `ok`: 是否成功
- `data`: 成功时返回的数据
- `error`: 失败时的错误信息

```typescript
import { isOk, isErr } from '@ai-datahub/contract';

const result = await client.triggerTask(request);

if (isOk(result)) {
  // 处理成功
  console.log(result.data.executionId);
} else if (isErr(result)) {
  // 处理错误
  console.error('错误码:', result.error.code);
  console.error('错误消息:', result.error.message);
}
```

## 错误码

| 错误码              | 描述                       |
| ------------------- | -------------------------- |
| `TASK_NOT_FOUND`    | 任务不存在                 |
| `INVALID_DAG`       | DAG 定义无效（如循环依赖） |
| `QUEUE_NOT_FOUND`   | 队列不存在                 |
| `DAG_NOT_FOUND`     | DAG 不存在                 |
| `LOG_NOT_FOUND`     | 日志不存在                 |
| `INVALID_ARGUMENT`  | 参数无效                   |
| `PERMISSION_DENIED` | 权限不足                   |
| `SCHEDULE_FAILED`   | 调度失败                   |
| `TRIGGER_FAILED`    | 触发失败                   |

## TraceId 透传

所有请求应包含 `traceId`，用于链路追踪：

```typescript
const request = {
  meta: { traceId: 'your-trace-id' },
  // ...其他参数
};
```

响应会返回相同的 `traceId`：

```typescript
const response = await client.triggerTask(request);
console.log(response.traceId); // 'your-trace-id'
```

## 最佳实践

1. **幂等性**: 使用 `idempotencyKey` 确保操作幂等
2. **错误处理**: 始终检查 `result.ok` 并处理错误情况
3. **TraceId**: 保持 traceId 在整个调用链中透传
4. **重试策略**: 对于临时性错误，实现指数退避重试
5. **优先级**: 合理设置任务优先级，关键任务优先处理

## 相关文档

- [服务 README](./README.md)
- [API 契约定义](../../packages/contract/src/modules/task-scheduler.ts)
- [架构文档](../../doc/ARCHITECTURE.md)
