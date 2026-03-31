import type {
  ID,
  ISODateTime,
  PageRequest,
  PageResult,
  RequestMeta,
  Result,
} from '../types';

export type CostManagementErrorCode =
  | 'INVALID_ARGUMENT'
  | 'PERMISSION_DENIED'
  | 'QUOTA_NOT_FOUND'
  | 'COST_DATA_NOT_READY';

export type CostDimension = 'PROJECT' | 'ORG';
export type ResourceType = 'STORAGE' | 'COMPUTE';

export type CostQuery = {
  dimension: CostDimension;
  orgId?: ID;
  projectId?: ID;
  startAt: ISODateTime;
  endAt: ISODateTime;
};

export type CostPoint = {
  time: ISODateTime;
  amount: number; // 成本金额或成本点（单位由实现层定义）
};

export type CostSeries = {
  resourceType: ResourceType;
  points: CostPoint[];
};

export type GetCostSeriesRequest = { meta?: RequestMeta; query: CostQuery };

export type Quota = {
  id: ID;
  dimension: CostDimension;
  orgId?: ID;
  projectId?: ID;
  resourceType: ResourceType;
  limit: number;
  enabled: boolean;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};

export type UpsertQuotaRequest = {
  meta?: RequestMeta;
  quota: Omit<Quota, 'id' | 'createdAt' | 'updatedAt'> & { id?: ID };
};

export type OptimizationHint = {
  id: ID;
  type: 'ZOMBIE_TABLE' | 'UNUSED_DATA' | 'OVER_QUOTA';
  title: string;
  detail: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: ISODateTime;
};

export interface CostManagementClient {
  getCostSeries(req: GetCostSeriesRequest): Promise<Result<CostSeries[]>>;
  upsertQuota(req: UpsertQuotaRequest): Promise<Result<{ quotaId: ID }>>;
  listQuotas(req: {
    meta?: RequestMeta;
    dimension?: CostDimension;
    orgId?: ID;
    projectId?: ID;
  }): Promise<Result<Quota[]>>;
  listOptimizationHints(req: {
    meta?: RequestMeta;
    orgId?: ID;
    projectId?: ID;
    page: PageRequest;
  }): Promise<Result<PageResult<OptimizationHint>>>;
}
