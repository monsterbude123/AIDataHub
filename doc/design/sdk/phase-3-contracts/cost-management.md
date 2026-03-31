# 阶段 3：`cost-management` 模块 SDK 契约

## 1) 模块定位

- 成本管理：存储/计算成本统计、配额管理、超限告警、成本优化建议。

## 2) 依赖的共享实体

来自 `00-shared-entities.md`：

- `Project`
- `Organization`
- `RequestMeta`
- `Result<T>`
- `PageRequest` / `PageResult<T>`

## 3) 错误码（本模块）

```ts
export type CostManagementErrorCode =
  | 'INVALID_ARGUMENT'
  | 'PERMISSION_DENIED'
  | 'QUOTA_NOT_FOUND'
  | 'COST_DATA_NOT_READY';
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
```

## 5) 对外 SDK 接口（`CostManagementClient`）

```ts
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
```

## 6) 幂等性要求

- `upsertQuota`：幂等（相同 id 或幂等键重复提交不产生额外副作用）。\n- 查询类：幂等。

## 7) Mock 服务规则

- `getCostSeries`\n - 默认：返回 STORAGE/COMPUTE 两条曲线\n- `upsertQuota`\n - 默认：返回 `quotaId="q_1"`\n- `listOptimizationHints`\n - 默认：返回 3 条优化建议
