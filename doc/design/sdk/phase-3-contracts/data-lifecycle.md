# 阶段 3：`data-lifecycle` 模块 SDK 契约

## 1) 模块定位

- 数据生命周期管理：冷热温分层策略、归档、恢复、过期删除、生命周期统计报表。

## 2) 依赖的共享实体

来自 `00-shared-entities.md`：

- `DataAsset`
- `RequestMeta`
- `Result<T>`
- `PageRequest` / `PageResult<T>`

## 3) 错误码（本模块）

```ts
export type DataLifecycleErrorCode =
  | 'INVALID_ARGUMENT'
  | 'PERMISSION_DENIED'
  | 'POLICY_NOT_FOUND'
  | 'ARCHIVE_NOT_FOUND'
  | 'ARCHIVE_FAILED'
  | 'RESTORE_FAILED'
  | 'DELETE_FAILED';
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

export type LifecycleTier = 'HOT' | 'WARM' | 'COLD';

export type LifecyclePolicy = {
  id: ID;
  name: string;
  tier: LifecycleTier;
  // 规则：例如热->温->冷的天数阈值等
  rules: Record<string, unknown>;
  enabled: boolean;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};

export type ConfigureLifecyclePolicyRequest = {
  meta?: RequestMeta;
  policy: Omit<LifecyclePolicy, 'id' | 'createdAt' | 'updatedAt'> & { id?: ID };
};

export type ArchiveDataRequest = {
  meta?: RequestMeta;
  dataAssetId: ID;
  policyId: ID;
};
export type RestoreDataRequest = { meta?: RequestMeta; archiveId: ID };
export type DeleteExpiredDataRequest = {
  meta?: RequestMeta;
  policyId: ID;
  dryRun?: boolean;
};

export type ArchiveRecordStatus = 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED';

export type ArchiveRecord = {
  id: ID;
  dataAssetId: ID;
  policyId: ID;
  status: ArchiveRecordStatus;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  archiveRef?: string;
  errorMessage?: string;
};

export type ListArchiveRecordsRequest = {
  meta?: RequestMeta;
  dataAssetId?: ID;
  policyId?: ID;
  status?: ArchiveRecordStatus;
  page: PageRequest;
};

export type LifecycleReportPoint = {
  time: ISODateTime;
  hot: number;
  warm: number;
  cold: number;
};
export type GetLifecycleReportRequest = {
  meta?: RequestMeta;
  orgId?: ID;
  projectId?: ID;
  startAt: ISODateTime;
  endAt: ISODateTime;
};
```

## 5) 对外 SDK 接口（`DataLifecycleClient`）

```ts
export interface DataLifecycleClient {
  configurePolicy(
    req: ConfigureLifecyclePolicyRequest
  ): Promise<Result<{ policyId: ID }>>;
  listPolicies(req: {
    meta?: RequestMeta;
    enabled?: boolean;
  }): Promise<Result<LifecyclePolicy[]>>;

  archiveData(req: ArchiveDataRequest): Promise<Result<{ archiveId: ID }>>;
  restoreData(req: RestoreDataRequest): Promise<Result<{ success: boolean }>>;
  listArchiveRecords(
    req: ListArchiveRecordsRequest
  ): Promise<Result<PageResult<ArchiveRecord>>>;
  getArchiveRecord(req: {
    meta?: RequestMeta;
    archiveId: ID;
  }): Promise<Result<ArchiveRecord>>;

  deleteExpiredData(
    req: DeleteExpiredDataRequest
  ): Promise<Result<{ dryRun: boolean; deletedCount: number }>>;

  getLifecycleReport(
    req: GetLifecycleReportRequest
  ): Promise<Result<{ points: LifecycleReportPoint[] }>>;
}
```

## 6) 幂等性要求

- `configurePolicy`：幂等（upsert）。\n- `archiveData`：非幂等（默认），建议支持 `idempotencyKey`。\n- `restoreData`：幂等（重复恢复不重复产生副作用）。\n- `deleteExpiredData`：当 `dryRun=true` 幂等；真实删除建议以“批次”语义控制幂等性。

## 7) Mock 服务规则

- `configurePolicy`\n - 默认：返回 `policyId="lp_1"`\n- `archiveData`\n - 默认：返回 `archiveId="ar_1"`\n - 可模拟异常：`ARCHIVE_FAILED`\n- `getLifecycleReport`\n - 默认：返回 7 个点的曲线
