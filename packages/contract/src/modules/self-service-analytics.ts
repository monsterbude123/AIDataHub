import type {
  ID,
  ISODateTime,
  PageRequest,
  PageResult,
  RequestMeta,
  Result,
} from '../types';

export type SelfServiceAnalyticsErrorCode =
  | 'INVALID_ARGUMENT'
  | 'PERMISSION_DENIED'
  | 'QUERY_NOT_FOUND'
  | 'VISUALIZATION_NOT_SUPPORTED'
  | 'EXPORT_FAILED';

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
