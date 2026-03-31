# 阶段 3：`data-governance-core` 模块 SDK 契约

## 1) 模块定位

- 数据治理核心基础设施：数据地图/资产视图、数据资产搜索/标签（资产层面）、数据标准（数据元/字典）、数据模型管理。
- 运行操作类（质量/血缘/标签提取任务）归属 `data-governance-ops`。

## 2) 依赖的共享实体

来自 `00-shared-entities.md`：

- `DataAsset`
- `ColumnMetadata`
- `RequestMeta`
- `Result<T>`
- `PageRequest` / `PageResult<T>`

## 3) 错误码（本模块）

```ts
export type GovernanceCoreErrorCode =
  | 'INVALID_ARGUMENT'
  | 'PERMISSION_DENIED'
  | 'DATA_ASSET_NOT_FOUND'
  | 'ASSET_TAG_NOT_FOUND'
  | 'STANDARD_ELEMENT_NOT_FOUND'
  | 'TYPE_MAPPING_NOT_FOUND'
  | 'DICTIONARY_NOT_FOUND'
  | 'DICTIONARY_CATEGORY_NOT_FOUND'
  | 'DICTIONARY_CACHE_NOT_READY'
  | 'MODEL_NOT_FOUND';
```

## 4) DTO 定义

```ts
import type {
  DataAsset,
  ID,
  ISODateTime,
  PageRequest,
  PageResult,
  RequestMeta,
  Result,
} from './00-shared-entities';

export type AssetTag = { id: ID; name: string; createdAt: ISODateTime };

export type SearchAssetsRequest = {
  meta?: RequestMeta;
  keyword?: string;
  tags?: string[];
  filters?: Record<string, unknown>; // 分层/地区/行业等
  page: PageRequest;
};

export type ExportLedgerRequest = {
  meta?: RequestMeta;
  type: 'ASSET_LEDGER' | 'LINEAGE_LEDGER';
  filters?: Record<string, unknown>;
  format: 'CSV' | 'XLSX';
};

export type ExportLedgerResponse = {
  downloadUrl: string;
  expireAt: ISODateTime;
};

export type StandardDataElement = {
  id: ID;
  name: string;
  identifier: string;
  type: string;
  length?: number;
  description?: string;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};

export type StandardTypeMapping = {
  id: ID;
  // e.g. "mysql", "postgres", "oracle", "hive"
  sourceSystem: string;
  sourceType: string;
  standardType: string;
  createdAt: ISODateTime;
};

export type DictionaryCategoryNode = {
  id: ID;
  parentId?: ID;
  name: string;
  code: string;
  sort?: number;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};

export type Dictionary = {
  id: ID;
  name: string;
  type: 'CUSTOM' | 'DATASET';
  config: Record<string, unknown>;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};

export type DictionaryItem = {
  id: ID;
  dictionaryId: ID;
  key: string;
  value: string;
  description?: string;
};

export type GetDictionaryDataRequest = {
  meta?: RequestMeta;
  dictionaryId: ID;
  // 支持缓存读取
  useCache?: boolean;
  page: PageRequest;
};

export type ImportDictionaryRequest = {
  meta?: RequestMeta;
  dictionaryId: ID;
  format: 'TEMPLATE_V1';
  payload: Record<string, unknown>;
};

export type DataModel = {
  id: ID;
  name: string;
  version: string;
  status: 'DRAFT' | 'APPROVED' | 'ONLINE' | 'OFFLINE';
  definition: Record<string, unknown>;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};

export type CreatePhysicalTablesRequest = {
  meta?: RequestMeta;
  modelId: ID;
  dataSourceId: ID;
  // 目标 schema/库名等由实现层解释
  options?: Record<string, unknown>;
};

export type AuditTask = {
  id: ID;
  // 稽核任务执行：检测异常/僵尸/孤立模型
  type: 'MODEL_AUDIT';
  enabled: boolean;
  schedule?: string;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};

export type AuditRun = {
  id: ID;
  taskId: ID;
  startedAt: ISODateTime;
  endedAt?: ISODateTime;
  status: 'RUNNING' | 'SUCCESS' | 'FAILED';
  summary?: Record<string, unknown>;
};
```

## 5) 对外 SDK 接口（`DataGovernanceCoreClient`）

```ts
export interface DataGovernanceCoreClient {
  // 资产
  searchAssets(
    req: SearchAssetsRequest
  ): Promise<Result<PageResult<DataAsset>>>;
  tagAsset(req: {
    meta?: RequestMeta;
    dataAssetId: ID;
    tags: string[];
  }): Promise<Result<{ success: boolean }>>;
  listAssetTags(req: {
    meta?: RequestMeta;
    keyword?: string;
  }): Promise<Result<AssetTag[]>>;
  exportLedger(req: ExportLedgerRequest): Promise<Result<ExportLedgerResponse>>;

  // 标准
  createStandardDataElement(req: {
    meta?: RequestMeta;
    element: Omit<StandardDataElement, 'id' | 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ elementId: ID }>>;
  updateStandardDataElement(req: {
    meta?: RequestMeta;
    element: Omit<StandardDataElement, 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ success: boolean }>>;
  deleteStandardDataElement(req: {
    meta?: RequestMeta;
    elementId: ID;
  }): Promise<Result<{ success: boolean }>>;
  listStandardDataElements(req: {
    meta?: RequestMeta;
    keyword?: string;
    page: PageRequest;
  }): Promise<Result<PageResult<StandardDataElement>>>;

  // 标准类型映射
  upsertStandardTypeMapping(req: {
    meta?: RequestMeta;
    mapping: Omit<StandardTypeMapping, 'createdAt'> & { id?: ID };
  }): Promise<Result<{ mappingId: ID }>>;
  listStandardTypeMappings(req: {
    meta?: RequestMeta;
    sourceSystem?: string;
    page: PageRequest;
  }): Promise<Result<PageResult<StandardTypeMapping>>>;

  // 字典
  createDictionary(req: {
    meta?: RequestMeta;
    dictionary: Omit<Dictionary, 'id' | 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ dictionaryId: ID }>>;
  updateDictionary(req: {
    meta?: RequestMeta;
    dictionary: Omit<Dictionary, 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ success: boolean }>>;
  deleteDictionary(req: {
    meta?: RequestMeta;
    dictionaryId: ID;
  }): Promise<Result<{ success: boolean }>>;
  listDictionaries(req: {
    meta?: RequestMeta;
    keyword?: string;
    page: PageRequest;
  }): Promise<Result<PageResult<Dictionary>>>;
  getDictionaryData(
    req: GetDictionaryDataRequest
  ): Promise<Result<PageResult<DictionaryItem>>>;
  importDictionary(
    req: ImportDictionaryRequest
  ): Promise<Result<{ success: boolean }>>;

  // 字典目录（树）
  listDictionaryCategories(req: {
    meta?: RequestMeta;
    parentId?: ID;
  }): Promise<Result<DictionaryCategoryNode[]>>;
  createDictionaryCategory(req: {
    meta?: RequestMeta;
    node: Omit<DictionaryCategoryNode, 'id' | 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ categoryId: ID }>>;
  updateDictionaryCategory(req: {
    meta?: RequestMeta;
    node: Omit<DictionaryCategoryNode, 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ success: boolean }>>;
  deleteDictionaryCategory(req: {
    meta?: RequestMeta;
    categoryId: ID;
  }): Promise<Result<{ success: boolean }>>;

  // 数据模型
  createModel(req: {
    meta?: RequestMeta;
    model: Omit<DataModel, 'id' | 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ modelId: ID }>>;
  approveModel(req: {
    meta?: RequestMeta;
    modelId: ID;
  }): Promise<Result<{ success: boolean }>>;
  publishModel(req: {
    meta?: RequestMeta;
    modelId: ID;
    online: boolean;
  }): Promise<Result<{ success: boolean }>>;
  createPhysicalTables(
    req: CreatePhysicalTablesRequest
  ): Promise<Result<{ success: boolean }>>;
  listModels(req: {
    meta?: RequestMeta;
    keyword?: string;
    page: PageRequest;
  }): Promise<Result<PageResult<DataModel>>>;

  // 稽核
  upsertAuditTask(req: {
    meta?: RequestMeta;
    task: Omit<AuditTask, 'createdAt' | 'updatedAt'> & { id?: ID };
  }): Promise<Result<{ taskId: ID }>>;
  listAuditTasks(req: { meta?: RequestMeta }): Promise<Result<AuditTask[]>>;
  runAuditTask(req: {
    meta?: RequestMeta;
    taskId: ID;
  }): Promise<Result<{ runId: ID }>>;
  listAuditRuns(req: {
    meta?: RequestMeta;
    taskId: ID;
    page: PageRequest;
  }): Promise<Result<PageResult<AuditRun>>>;
}
```

## 6) 幂等性要求

- 查询类：幂等。\n- `tagAsset`：幂等（相同 tags 重复提交结果一致）。\n- 创建类：默认非幂等，建议支持 `idempotencyKey`。\n- `approveModel` / `publishModel`：幂等（重复操作不重复产生副作用）。

## 7) Mock 服务规则

- `searchAssets`\n - 默认：返回分页资产 10 条\n- `tagAsset`\n - 默认：`{ success: true }`\n- `listStandardDataElements`\n - 默认：返回 5 条数据元\n- `listModels`\n - 默认：返回 3 个模型\n - 可模拟异常：`MODEL_NOT_FOUND`
