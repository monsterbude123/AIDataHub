import type {
  ColumnMetadata,
  DataAsset,
  ID,
  ISODateTime,
  PageRequest,
  PageResult,
  RequestMeta,
  Result,
} from '../types';

export type MetadataErrorCode =
  | 'DATA_SOURCE_NOT_FOUND'
  | 'DATA_ASSET_NOT_FOUND'
  | 'COLLECTION_FAILED'
  | 'SYNC_CONFLICT'
  | 'VERSION_NOT_FOUND'
  | 'INVALID_ARGUMENT'
  | 'PERMISSION_DENIED'
  | 'EXPORT_FAILED'
  | 'IMPORT_FAILED';

export type MetadataCollectionMode = 'AUTO' | 'SUBSCRIPTION' | 'MANUAL';

export type CollectMetadataRequest = {
  meta?: RequestMeta;
  mode: MetadataCollectionMode;
  dataSourceId: ID;
  includeTables?: string[];
  excludeTables?: string[];
};

export type CollectMetadataResponse = {
  dataAssets: DataAsset[];
  columns: ColumnMetadata[];
  collectedAt: ISODateTime;
};

export type ImportMetadataRequest = {
  meta?: RequestMeta;
  format: 'TEMPLATE_V1';
  payload: Record<string, unknown>;
};

export type ExportMetadataRequest = {
  meta?: RequestMeta;
  scope: 'ALL' | 'BY_DATA_SOURCE' | 'BY_ASSET';
  dataSourceId?: ID;
  dataAssetIds?: ID[];
  format: 'TEMPLATE_V1';
};

export type ExportMetadataResponse = {
  downloadUrl: string;
  expireAt: ISODateTime;
};

export type SyncMetadataRequest = {
  meta?: RequestMeta;
  dataSourceId: ID;
  dryRun?: boolean;
};

export type SyncAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'NOOP';

export type SyncDiff = {
  dataAssetId?: ID;
  tableName?: string;
  action: SyncAction;
  reason?: string;
};

export type SyncMetadataResponse = {
  dryRun: boolean;
  diffs: SyncDiff[];
};

export type GetMetadataVersionsRequest = {
  meta?: RequestMeta;
  dataAssetId: ID;
  page: PageRequest;
};

export type MetadataVersion = {
  id: ID;
  dataAssetId: ID;
  version: string;
  createdAt: ISODateTime;
  createdBy?: ID;
  summary?: string;
};

export type CompareMetadataVersionsRequest = {
  meta?: RequestMeta;
  leftVersionId: ID;
  rightVersionId: ID;
};

export type MetadataVersionDiff = {
  field: string;
  left?: unknown;
  right?: unknown;
  changeType: 'ADDED' | 'REMOVED' | 'MODIFIED';
};

export type SubscribeMetadataChangeRequest = {
  meta?: RequestMeta;
  dataAssetId?: ID;
  dataSourceId?: ID;
  channels: Array<'EMAIL' | 'WEBHOOK'>;
  target: string;
};

export type SubscribeMetadataChangeResponse = {
  subscriptionId: ID;
};

export interface MetadataClient {
  collectMetadata(
    req: CollectMetadataRequest
  ): Promise<Result<CollectMetadataResponse>>;
  importMetadata(
    req: ImportMetadataRequest
  ): Promise<Result<{ success: boolean }>>;
  exportMetadata(
    req: ExportMetadataRequest
  ): Promise<Result<ExportMetadataResponse>>;
  syncMetadata(req: SyncMetadataRequest): Promise<Result<SyncMetadataResponse>>;
  getMetadataVersions(
    req: GetMetadataVersionsRequest
  ): Promise<Result<PageResult<MetadataVersion>>>;
  compareMetadataVersions(
    req: CompareMetadataVersionsRequest
  ): Promise<Result<{ diffs: MetadataVersionDiff[] }>>;
  subscribeMetadataChange(
    req: SubscribeMetadataChangeRequest
  ): Promise<Result<SubscribeMetadataChangeResponse>>;
}
