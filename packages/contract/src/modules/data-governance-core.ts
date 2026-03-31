import type {
  DataAsset,
  ID,
  ISODateTime,
  PageRequest,
  PageResult,
  RequestMeta,
  Result,
} from '../types';

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
