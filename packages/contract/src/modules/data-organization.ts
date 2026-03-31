import type {
  DataAsset,
  ID,
  ISODateTime,
  PageRequest,
  PageResult,
  RequestMeta,
  Result,
  TaskExecution,
} from '../types';

export type DataOrganizationErrorCode =
  | 'DATA_ASSET_NOT_FOUND'
  | 'MAPPING_NOT_FOUND'
  | 'DIRECTORY_NOT_FOUND'
  | 'DUPLICATE_NAME'
  | 'INVALID_ARGUMENT'
  | 'PERMISSION_DENIED'
  | 'TASK_SUBMIT_FAILED';

export type DataLayerNode = 'BUSINESS' | 'RAW' | 'RESOURCE' | 'THEME';

export type LayerDirectoryNode = {
  id: ID;
  layer: DataLayerNode;
  parentId?: ID;
  name: string;
  code: string;
  sort?: number;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
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
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
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
