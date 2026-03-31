# 阶段 3：`data-organization` 模块 SDK 契约

## 1) 模块定位

- 管理数据在中台内部的分层组织（业务库/原始库/资源库/主题库）与入层映射规则。
- 提供“入库任务”的定义与查询入口，实际调度执行归口 `task-scheduler`。

## 2) 依赖的共享实体

来自 `00-shared-entities.md`：

- `DataAsset`
- `ColumnMetadata`
- `Task` / `TaskExecution`
- `RequestMeta`
- `Result<T>`
- `PageRequest` / `PageResult<T>`

## 3) 错误码（本模块）

```ts
export type DataOrganizationErrorCode =
  | 'DATA_ASSET_NOT_FOUND'
  | 'MAPPING_NOT_FOUND'
  | 'DIRECTORY_NOT_FOUND'
  | 'DUPLICATE_NAME'
  | 'INVALID_ARGUMENT'
  | 'PERMISSION_DENIED'
  | 'TASK_SUBMIT_FAILED';
```

## 4) DTO 定义（入参/出参）

```ts
import type {
  ColumnMetadata,
  DataAsset,
  ID,
  PageRequest,
  PageResult,
  RequestMeta,
  Result,
  TaskExecution,
} from './00-shared-entities';

export type DataLayerNode = 'BUSINESS' | 'RAW' | 'RESOURCE' | 'THEME';

export type LayerDirectoryNode = {
  id: ID;
  layer: DataLayerNode;
  parentId?: ID;
  name: string;
  code: string;
  sort?: number;
  createdAt: string;
  updatedAt: string;
};

export type ListAssetsByLayerRequest = {
  meta?: RequestMeta;
  layer: DataLayerNode;
  keyword?: string;
  page: PageRequest;
};

export type AssetMapping = {
  id: ID;
  fromAssetId: ID; // 标准/上游
  toAssetId: ID; // 下游分层目标
  fieldMappings: Array<{
    fromField: string;
    toField: string;
    transform?: string;
  }>;
  createdAt: string;
  updatedAt: string;
};

export type CreateMappingRequest = {
  meta?: RequestMeta;
  mapping: Omit<AssetMapping, 'id' | 'createdAt' | 'updatedAt'>;
};

export type UpdateMappingRequest = {
  meta?: RequestMeta;
  mapping: Omit<AssetMapping, 'createdAt' | 'updatedAt'>;
};

export type DeleteMappingRequest = { meta?: RequestMeta; mappingId: ID };

export type ListMappingsRequest = {
  meta?: RequestMeta;
  fromAssetId?: ID;
  toAssetId?: ID;
  page: PageRequest;
};

export type GetMappingRequest = {
  meta?: RequestMeta;
  mappingId: ID;
};

export type SubmitIngestionTaskRequest = {
  meta?: RequestMeta;
  mappingId: ID;
  schedule?: string;
  priority?: number;
  config?: Record<string, unknown>;
};

export type SubmitIngestionTaskResponse = {
  taskExecutionId: ID;
};

export type MappingPreviewRequest = {
  meta?: RequestMeta;
  mappingId: ID;
  limit?: number;
};
export type MappingPreviewResponse = {
  columns: string[];
  rows: Array<Record<string, unknown>>;
};
```

## 5) 对外 SDK 接口（`DataOrganizationClient`）

```ts
export interface DataOrganizationClient {
  // 分层目录（对应“数据资源分类/目录管理”）
  listLayerDirectories(req: {
    meta?: RequestMeta;
    layer: DataLayerNode;
    parentId?: ID;
  }): Promise<Result<LayerDirectoryNode[]>>;
  createLayerDirectory(req: {
    meta?: RequestMeta;
    node: Omit<LayerDirectoryNode, 'id' | 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ directoryId: ID }>>;
  updateLayerDirectory(req: {
    meta?: RequestMeta;
    node: Omit<LayerDirectoryNode, 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ success: boolean }>>;
  deleteLayerDirectory(req: {
    meta?: RequestMeta;
    directoryId: ID;
  }): Promise<Result<{ success: boolean }>>;

  listAssetsByLayer(
    req: ListAssetsByLayerRequest
  ): Promise<Result<PageResult<DataAsset>>>;

  createMapping(req: CreateMappingRequest): Promise<Result<{ mappingId: ID }>>;
  updateMapping(
    req: UpdateMappingRequest
  ): Promise<Result<{ success: boolean }>>;
  deleteMapping(
    req: DeleteMappingRequest
  ): Promise<Result<{ success: boolean }>>;
  listMappings(
    req: ListMappingsRequest
  ): Promise<Result<PageResult<AssetMapping>>>;
  getMapping(req: GetMappingRequest): Promise<Result<AssetMapping>>;
  previewMapping(
    req: MappingPreviewRequest
  ): Promise<Result<MappingPreviewResponse>>;

  submitIngestionTask(
    req: SubmitIngestionTaskRequest
  ): Promise<Result<SubmitIngestionTaskResponse>>;

  getTaskExecution(req: {
    meta?: RequestMeta;
    taskExecutionId: ID;
  }): Promise<Result<TaskExecution>>;
}
```

## 6) 幂等性要求

- `listAssetsByLayer` / `getMapping` / `getTaskExecution`：幂等。\n- `createMapping`：非幂等（默认），建议支持 `idempotencyKey`。\n- `submitIngestionTask`：非幂等（默认），建议支持 `idempotencyKey`。
- `updateMapping` / `deleteMapping` / `updateLayerDirectory` / `deleteLayerDirectory`：幂等。\n- `previewMapping`：幂等。\n- 创建目录与创建映射：建议支持 `idempotencyKey`（避免重复创建）。

## 7) Mock 服务规则

- `listAssetsByLayer`\n - 默认：返回分页资产（10 条）\n- `createMapping`\n - 默认：返回 `mappingId="map_1"`\n- `getMapping`\n - 默认：返回 `map_1` 的字段映射\n- `submitIngestionTask`\n - 默认：返回 `taskExecutionId="exe_1"`\n - 可模拟异常：`TASK_SUBMIT_FAILED`
