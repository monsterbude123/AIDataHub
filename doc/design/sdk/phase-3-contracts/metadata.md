# 阶段 3：`metadata` 模块 SDK 契约

## 1) 模块定位

- 元数据全生命周期管理：采集（自动/订阅/手动）、导入导出、同步、版本、变更订阅等。
- 统一纳管 ETL/数据模型/数据服务的元数据版本与变更。

## 2) 依赖的共享实体

来自 `00-shared-entities.md`：

- `DataSource`
- `DataAsset`
- `ColumnMetadata`
- `RequestMeta`
- `Result<T>`
- `PageRequest` / `PageResult<T>`

## 3) 错误码（本模块）

```ts
export type MetadataErrorCode =
  | 'DATA_SOURCE_NOT_FOUND'
  | 'DATA_ASSET_NOT_FOUND'
  | 'COLLECTION_FAILED'
  | 'SYNC_CONFLICT'
  | 'VERSION_NOT_FOUND'
  | 'SUBSCRIPTION_NOT_FOUND'
  | 'BACKUP_NOT_FOUND'
  | 'RESTORE_FAILED'
  | 'INVALID_ARGUMENT'
  | 'PERMISSION_DENIED'
  | 'EXPORT_FAILED'
  | 'IMPORT_FAILED';
```

## 4) DTO 定义（入参/出参）

```ts
import type {
  ColumnMetadata,
  DataAsset,
  DataSource,
  ID,
  ISODateTime,
  PageRequest,
  PageResult,
  RequestMeta,
  Result,
} from './00-shared-entities';

export type MetadataCollectionMode = 'AUTO' | 'SUBSCRIPTION' | 'MANUAL';

export type CollectMetadataRequest = {
  meta?: RequestMeta;
  mode: MetadataCollectionMode;
  dataSourceId: ID;
  // 可选范围过滤
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
  payload: Record<string, unknown>; // 文件内容/解析结果由实现层决定
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
  target: string; // email address / webhook url reference
};

export type SubscribeMetadataChangeResponse = {
  subscriptionId: ID;
};

export type MetadataBackupType = 'METADATA' | 'CONFIG';

export type MetadataBackup = {
  id: ID;
  type: MetadataBackupType;
  // 备份存储引用（对象存储路径/文件引用等）
  backupRef: string;
  createdAt: ISODateTime;
  createdBy?: ID;
  summary?: string;
};

export type CreateBackupRequest = {
  meta?: RequestMeta;
  type: MetadataBackupType;
  // 备份范围可扩展
  scope?: 'ALL' | 'BY_DATA_SOURCE';
  dataSourceId?: ID;
};

export type RestoreBackupRequest = {
  meta?: RequestMeta;
  backupId: ID;
  // dryRun=true 只做校验不落库
  dryRun?: boolean;
};

export type RestoreBackupResponse = {
  dryRun: boolean;
  success: boolean;
  restoredAt: ISODateTime;
  message?: string;
};

export type ListBackupsRequest = {
  meta?: RequestMeta;
  type?: MetadataBackupType;
  page: PageRequest;
};

export type AddSqlResourceRequest = {
  meta?: RequestMeta;
  name: string;
  description?: string;
  dataSourceId?: ID;
  sql: string;
  // 生成的 SQL 数据集资产信息由实现层决定
};

export type AddSqlResourceResponse = {
  dataAssetId: ID;
};

export type UpsertSubscriptionRequest = {
  meta?: RequestMeta;
  subscription: Omit<SubscribeMetadataChangeRequest, 'meta'> & { id?: ID };
};
```

## 5) 对外 SDK 接口（`MetadataClient`）

```ts
export interface MetadataClient {
  collectMetadata(
    req: CollectMetadataRequest
  ): Promise<Result<CollectMetadataResponse>>;

  addSqlResource(
    req: AddSqlResourceRequest
  ): Promise<Result<AddSqlResourceResponse>>;

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

  upsertSubscription(
    req: UpsertSubscriptionRequest
  ): Promise<Result<SubscribeMetadataChangeResponse>>;
  deleteSubscription(req: {
    meta?: RequestMeta;
    subscriptionId: ID;
  }): Promise<Result<{ success: boolean }>>;

  // 备份恢复（合并稿中的“元数据备份/恢复/配置备份”）
  createBackup(req: CreateBackupRequest): Promise<Result<{ backupId: ID }>>;
  listBackups(
    req: ListBackupsRequest
  ): Promise<Result<PageResult<MetadataBackup>>>;
  restoreBackup(
    req: RestoreBackupRequest
  ): Promise<Result<RestoreBackupResponse>>;
}
```

## 6) 幂等性要求

- `collectMetadata`：幂等（允许重复采集）。\n- `syncMetadata`：幂等（同一时刻同源重复执行结果一致；dryRun 不产生副作用）。\n- `importMetadata`：建议支持 `idempotencyKey`（避免重复导入）。\n- `exportMetadata`：幂等（同条件重复可返回不同下载链接，但等价）。\n- 版本相关查询：幂等。\n- 订阅：建议以 `(target, dataAssetId/dataSourceId)` 作为幂等键实现 upsert（或提供 `upsertSubscription`）。
- `upsertSubscription`：幂等（同幂等键/同 id 重复提交结果一致）。\n- `deleteSubscription`：幂等。\n- `createBackup`：非幂等（默认），建议支持 `idempotencyKey`。\n- `restoreBackup`：当 `dryRun=true` 幂等；实际恢复建议通过“恢复批次”或 `idempotencyKey` 控制幂等性。\n- `addSqlResource`：默认非幂等，建议支持 `idempotencyKey`（避免重复创建 SQL 资产）。

## 7) Mock 服务规则（用于并行开发）

- `collectMetadata`\n - 默认：返回 2 个 `DataAsset` 与 10 个 `ColumnMetadata`\n - 可模拟异常：`COLLECTION_FAILED`\n- `syncMetadata`\n - 默认：返回若干 `SyncDiff`\n - 可模拟异常：`SYNC_CONFLICT`\n- `getMetadataVersions`\n - 默认：返回 5 个版本\n- `compareMetadataVersions`\n - 默认：返回 3 条差异\n- `subscribeMetadataChange`\n - 默认：返回 `subscriptionId="sub_1"`\n- `createBackup`\n - 默认：返回 `backupId="bkp_1"`\n - 可模拟异常：`EXPORT_FAILED`\n- `restoreBackup`\n - 默认：返回 `{ dryRun: false, success: true }`\n - 可模拟异常：`RESTORE_FAILED`\n- `addSqlResource`\n - 默认：返回 `dataAssetId="asset_sql_1"`
