# 阶段 3：`data-integration` 模块 SDK 契约

## 1) 模块定位

- 负责数据从数据源进入中台的接入加工全流程：数据源管理、接入策略、初始元数据采集、数据探查、标准化执行、自助 SQL 开发执行等。
- 本模块 **仅负责接入时初始元数据采集**；元数据全生命周期归属 `metadata`。

## 2) 依赖的共享实体

来自 `00-shared-entities.md`：

- `DataSource`
- `DataAsset`
- `ColumnMetadata`
- `Task`
- `TaskExecution`
- `Project`
- `RequestMeta`
- `Result<T>`

## 3) 错误码（本模块）

```ts
export type DataIntegrationErrorCode =
  | 'DATA_SOURCE_NOT_FOUND'
  | 'DATA_SOURCE_NAME_DUPLICATE'
  | 'DATA_SOURCE_IN_USE'
  | 'DATA_SOURCE_CONNECTION_TEST_FAILED'
  | 'PERMISSION_DENIED'
  | 'INVALID_ARGUMENT'
  | 'SQL_SYNTAX_ERROR'
  | 'EXECUTION_TIMEOUT'
  | 'READ_FAILED';
```

## 4) DTO 定义（入参/出参）

```ts
import type {
  ColumnMetadata,
  DataSource,
  ID,
  ISODateTime,
  Project,
  RequestMeta,
  Result,
  TaskExecution,
} from './00-shared-entities';

export type CreateDataSourceRequest = {
  meta?: RequestMeta;
  dataSource: Omit<DataSource, 'id' | 'createdAt' | 'updatedAt'>;
};

export type UpdateDataSourceRequest = {
  meta?: RequestMeta;
  dataSource: Omit<DataSource, 'createdAt' | 'updatedAt'>;
};

export type DeleteDataSourceRequest = {
  meta?: RequestMeta;
  dataSourceId: ID;
};

export type TestConnectionRequest = {
  meta?: RequestMeta;
  dataSource: Omit<DataSource, 'id' | 'createdAt' | 'updatedAt'>;
};

export type TestConnectionResponse = {
  success: boolean;
  message: string;
  checkedAt: ISODateTime;
};

export type ListDataSourcesRequest = {
  meta?: RequestMeta;
  orgId: ID;
  keyword?: string;
  projectId?: ID;
};

export type CollectInitialMetadataRequest = {
  meta?: RequestMeta;
  dataSourceId: ID;
};

export type SubmitAccessTaskRequest = {
  meta?: RequestMeta;
  task: {
    name: string;
    orgId: ID;
    projectId?: ID;
    dataSourceId: ID;
    // 说明：具体任务配置由实现层解释，但契约层必须保证结构可扩展
    config: Record<string, unknown>;
    schedule?: string;
    priority?: number;
  };
};

export type SubmitAccessTaskResponse = {
  taskExecutionId: ID;
};

export type ProfileDataRequest = {
  meta?: RequestMeta;
  dataSourceId: ID;
  tableName: string;
  sampleSize?: number;
};

export type ProfilingMetric = {
  name: string;
  value: number | string | boolean;
};

export type ProfilingResult = {
  tableName: string;
  metrics: ProfilingMetric[];
  sampleRows?: Array<Record<string, unknown>>;
};

export type PreviewDataRequest = {
  meta?: RequestMeta;
  dataAssetId: ID;
  limit: number;
};

export type PreviewDataResponse = {
  columns: string[];
  rows: Array<Record<string, unknown>>;
};

export type ExecuteSqlRequest = {
  meta?: RequestMeta;
  sql: string;
  projectId: ID;
  isTest?: boolean;
};

export type ExecuteSqlResponse = {
  columns: string[];
  rows: Array<Record<string, unknown>>;
  rowCount: number;
  isTruncated: boolean;
};

export type GetTaskExecutionRequest = {
  meta?: RequestMeta;
  taskExecutionId: ID;
};
```

## 5) 对外 SDK 接口（`DataIntegrationClient`）

```ts
export interface DataIntegrationClient {
  createDataSource(req: CreateDataSourceRequest): Promise<Result<DataSource>>;
  updateDataSource(req: UpdateDataSourceRequest): Promise<Result<DataSource>>;
  deleteDataSource(
    req: DeleteDataSourceRequest
  ): Promise<Result<{ success: boolean }>>;

  testConnection(
    req: TestConnectionRequest
  ): Promise<Result<TestConnectionResponse>>;
  listDataSources(req: ListDataSourcesRequest): Promise<Result<DataSource[]>>;

  collectInitialMetadata(
    req: CollectInitialMetadataRequest
  ): Promise<Result<ColumnMetadata[]>>;

  submitAccessTask(
    req: SubmitAccessTaskRequest
  ): Promise<Result<SubmitAccessTaskResponse>>;

  profileData(req: ProfileDataRequest): Promise<Result<ProfilingResult>>;
  previewData(req: PreviewDataRequest): Promise<Result<PreviewDataResponse>>;

  executeSql(req: ExecuteSqlRequest): Promise<Result<ExecuteSqlResponse>>;

  getTaskExecution(
    req: GetTaskExecutionRequest
  ): Promise<Result<TaskExecution>>;
}
```

## 6) 幂等性要求

- `createDataSource`：**非幂等**（默认）。若提供 `idempotencyKey`，建议实现为**幂等创建**（同 key 返回同一结果）。\n- `updateDataSource`：幂等（同入参多次调用结果一致）。\n- `deleteDataSource`：幂等（重复删除返回成功）。\n- `testConnection` / `listDataSources` / `collectInitialMetadata` / `profileData` / `previewData`：查询/探查类，幂等。\n- `submitAccessTask`：**非幂等**（默认）。若提供 `idempotencyKey`，建议实现为“同 key 不重复创建执行”。\n- `executeSql`：非幂等（每次执行会消耗资源并产生新执行上下文）。

## 7) Mock 服务规则（用于并行开发）

> Mock 必须覆盖：成功路径 + 关键失败路径（至少 1 个可复现错误码）。

- `createDataSource`\n - 默认：返回 `id="ds_1"` 的数据源对象\n - 可模拟异常：`DATA_SOURCE_NAME_DUPLICATE`\n- `updateDataSource`\n - 默认：回显更新后的对象\n - 可模拟异常：`DATA_SOURCE_IN_USE`\n- `deleteDataSource`\n - 默认：`{ success: true }`\n - 可模拟异常：`DATA_SOURCE_IN_USE`\n- `testConnection`\n - 默认：`{ success: true, message: "连接成功", checkedAt: now }`\n - 可模拟异常：`DATA_SOURCE_CONNECTION_TEST_FAILED`\n- `listDataSources`\n - 默认：返回 3 条样例数据源\n- `collectInitialMetadata`\n - 默认：返回 5 个样例字段元数据\n - 可模拟异常：`READ_FAILED`\n- `profileData`\n - 默认：返回包含空值率/样例行的结果\n- `previewData`\n - 默认：返回 10 行样例数据（含 columns）\n- `executeSql`\n - 默认：返回 20 行样例数据\n - 可模拟异常：`SQL_SYNTAX_ERROR`、`EXECUTION_TIMEOUT`
