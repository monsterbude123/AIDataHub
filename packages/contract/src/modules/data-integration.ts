import type {
  ColumnMetadata,
  DataSource,
  ID,
  ISODateTime,
  RequestMeta,
  Result,
  TaskExecution,
} from '../types';

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
