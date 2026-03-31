import type {
  ID,
  ISODateTime,
  PageRequest,
  PageResult,
  RequestMeta,
  Result,
} from '../types';

export type DataLifecycleErrorCode =
  | 'INVALID_ARGUMENT'
  | 'PERMISSION_DENIED'
  | 'POLICY_NOT_FOUND'
  | 'ARCHIVE_NOT_FOUND'
  | 'ARCHIVE_FAILED'
  | 'RESTORE_FAILED'
  | 'DELETE_FAILED';

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
