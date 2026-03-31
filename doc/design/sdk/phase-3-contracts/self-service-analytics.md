# 阶段 3：`self-service-analytics` 模块 SDK 契约

## 1) 模块定位

- 面向业务用户的自助分析体验：即席查询、可视化、导出、保存分享、数据探索。
- 底层 SQL 执行能力可复用 `data-integration`（自助 SQL 执行）或 `data-service`（服务化查询）。

## 2) 依赖的共享实体

来自 `00-shared-entities.md`：

- `RequestMeta`
- `Result<T>`
- `PageRequest` / `PageResult<T>`
- `DataAsset`

## 3) 错误码（本模块）

```ts
export type SelfServiceAnalyticsErrorCode =
  | 'INVALID_ARGUMENT'
  | 'PERMISSION_DENIED'
  | 'QUERY_NOT_FOUND'
  | 'VISUALIZATION_NOT_SUPPORTED'
  | 'EXPORT_FAILED';
```

## 4) DTO 定义

```ts
import type {
  ID,
  ISODateTime,
  PageRequest,
  PageResult,
  RequestMeta,
  Result,
} from './00-shared-entities';

export type SavedQuery = {
  id: ID;
  name: string;
  description?: string;
  // 逻辑查询定义，可由 UI 生成；实现层决定如何编译执行
  definition: Record<string, unknown>;
  tags?: string[];
  createdBy: ID;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};

export type SaveQueryRequest = {
  meta?: RequestMeta;
  query: Omit<SavedQuery, 'id' | 'createdAt' | 'updatedAt'>;
};
export type ExecuteSavedQueryRequest = {
  meta?: RequestMeta;
  queryId: ID;
  params?: Record<string, unknown>;
};

export type QueryResult = {
  columns: string[];
  rows: Array<Record<string, unknown>>;
  rowCount: number;
};

export type ExportQueryResultRequest = {
  meta?: RequestMeta;
  queryId: ID;
  format: 'CSV' | 'XLSX';
};
export type ExportQueryResultResponse = {
  downloadUrl: string;
  expireAt: ISODateTime;
};

export type VisualizationType = 'BAR' | 'LINE' | 'PIE' | 'MAP' | 'TABLE';

export type VisualizationSpec = {
  id: ID;
  queryId: ID;
  type: VisualizationType;
  // 图表配置（轴、维度、度量等）由实现层解释
  config: Record<string, unknown>;
  createdBy: ID;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};

export type DataExploreRequest = {
  meta?: RequestMeta;
  dataAssetId: ID;
  sampleSize?: number;
  // 可选：探索维度
  options?: Record<string, unknown>;
};

export type DataExploreResponse = {
  metrics: Array<{ name: string; value: number | string | boolean }>;
  sampleRows: Array<Record<string, unknown>>;
};

export type ShareQueryRequest = {
  meta?: RequestMeta;
  queryId: ID;
  toUserIds: ID[];
};
```

## 5) 对外 SDK 接口（`SelfServiceAnalyticsClient`）

```ts
export interface SelfServiceAnalyticsClient {
  saveQuery(req: SaveQueryRequest): Promise<Result<{ queryId: ID }>>;
  updateQuery(req: {
    meta?: RequestMeta;
    query: Partial<Omit<SavedQuery, 'createdAt' | 'updatedAt'>> & { id: ID };
  }): Promise<Result<{ success: boolean }>>;
  deleteQuery(req: {
    meta?: RequestMeta;
    queryId: ID;
  }): Promise<Result<{ success: boolean }>>;
  listQueries(req: {
    meta?: RequestMeta;
    createdBy: ID;
    page: PageRequest;
  }): Promise<Result<PageResult<SavedQuery>>>;
  executeSavedQuery(
    req: ExecuteSavedQueryRequest
  ): Promise<Result<QueryResult>>;
  exportQueryResult(
    req: ExportQueryResultRequest
  ): Promise<Result<ExportQueryResultResponse>>;

  // 可视化
  createVisualization(req: {
    meta?: RequestMeta;
    visualization: Omit<VisualizationSpec, 'id' | 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ visualizationId: ID }>>;
  updateVisualization(req: {
    meta?: RequestMeta;
    visualization: Omit<VisualizationSpec, 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ success: boolean }>>;
  listVisualizations(req: {
    meta?: RequestMeta;
    queryId: ID;
    page: PageRequest;
  }): Promise<Result<PageResult<VisualizationSpec>>>;

  // 数据探索
  exploreData(req: DataExploreRequest): Promise<Result<DataExploreResponse>>;

  // 分享
  shareQuery(req: ShareQueryRequest): Promise<Result<{ success: boolean }>>;
}
```

## 6) 幂等性要求

- `saveQuery`：非幂等（默认），建议支持 `idempotencyKey`。\n- `executeSavedQuery`：非幂等（每次执行计算）。\n- 导出：幂等（同条件可返回不同链接）。

## 7) Mock 服务规则

- `saveQuery`\n - 默认：返回 `queryId="q_1"`\n- `executeSavedQuery`\n - 默认：返回 10 行样例数据\n - 可模拟异常：`PERMISSION_DENIED`\n- `exportQueryResult`\n - 默认：返回样例下载链接\n - 可模拟异常：`EXPORT_FAILED`
