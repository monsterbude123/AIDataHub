# 阶段 3：`data-service` 模块 SDK 契约

## 1) 模块定位

- 负责“技术层”通用数据 API 服务：服务发布/下线、授权与频控、调用日志与统计监控。
- 不包含跨机构共享交换的“业务流程与门户”（归属 `data-sharing`）。

## 2) 依赖的共享实体

来自 `00-shared-entities.md`：

- `DataAsset`
- `User`
- `RequestMeta`
- `Result<T>`
- `PageRequest` / `PageResult<T>`

## 3) 错误码（本模块）

```ts
export type DataServiceErrorCode =
  | 'DATA_ASSET_NOT_FOUND'
  | 'SERVICE_NOT_FOUND'
  | 'SERVICE_NAME_DUPLICATE'
  | 'SERVICE_DIRECTORY_NOT_FOUND'
  | 'SERVICE_NOT_PUBLISHED'
  | 'SERVICE_PUBLISHED_IMMUTABLE' // 已发布禁止改核心配置
  | 'SERVICE_OFFLINE'
  | 'AUTHORIZATION_INVALID'
  | 'AUTHORIZATION_NOT_FOUND'
  | 'RATE_LIMIT_EXCEEDED'
  | 'PERMISSION_DENIED'
  | 'INVALID_ARGUMENT'
  | 'DOWNLOAD_JOB_NOT_FOUND'
  | 'DOWNLOAD_JOB_FAILED'
  | 'EXECUTION_FAILED';
```

## 4) DTO 定义（入参/出参）

```ts
import type {
  ID,
  ISODateTime,
  PageRequest,
  PageResult,
  RequestMeta,
  Result,
} from './00-shared-entities';

export type DataServiceType = 'QUERY' | 'DOWNLOAD' | 'COMPARE';

export type ServiceDirectoryNode = {
  id: ID;
  parentId?: ID;
  name: string;
  code: string;
  sort?: number;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};

export type FieldInfo = {
  name: string;
  type?: string;
  description?: string;
};

export type DataServiceInfo = {
  id: ID;
  code: string;
  name: string;
  type: DataServiceType;
  published: boolean;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};

export type DataServiceDetail = DataServiceInfo & {
  dataAssetId: ID;
  queryConfig: Record<string, unknown>;
  responseFields: FieldInfo[];
  directoryId?: ID;
  description?: string;
};

export type CreateDataServiceRequest = {
  meta?: RequestMeta;
  dataAssetId: ID;
  name: string;
  type: DataServiceType;
  queryConfig: Record<string, unknown>;
  responseFields: FieldInfo[];
};

export type CreateDataServiceResponse = {
  serviceId: ID;
  serviceCode: string;
};

export type UpdateDataServiceRequest = {
  meta?: RequestMeta;
  serviceId: ID;
  name?: string;
  queryConfig?: Record<string, unknown>;
  responseFields?: FieldInfo[];
  directoryId?: ID;
  description?: string;
};

export type PublishDataServiceRequest = {
  meta?: RequestMeta;
  serviceId: ID;
  publish: boolean;
};

export type GetDataServiceRequest = {
  meta?: RequestMeta;
  serviceId: ID;
};

export type SearchDataServiceRequest = {
  meta?: RequestMeta;
  keyword?: string;
  page: PageRequest;
};

export type AddAuthorizationRequest = {
  meta?: RequestMeta;
  serviceId: ID;
  userId: ID;
  maxDailyCalls: number;
  expireAt: ISODateTime;
};

export type AddAuthorizationResponse = {
  authorizationId: ID;
  accessKey: string;
};

export type AuthorizationCategoryNode = {
  id: ID;
  parentId?: ID;
  name: string;
  code: string;
  sort?: number;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};

export type ServiceAuthorization = {
  id: ID;
  serviceId: ID;
  userId: ID;
  categoryId?: ID;
  maxDailyCalls: number;
  expireAt: ISODateTime;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};

export type UpdateAuthorizationRequest = {
  meta?: RequestMeta;
  authorization: Omit<ServiceAuthorization, 'createdAt' | 'updatedAt'>;
};

export type SearchAuthorizationsRequest = {
  meta?: RequestMeta;
  keyword?: string;
  categoryId?: ID;
  serviceId?: ID;
  userId?: ID;
  page: PageRequest;
};

export type CheckAuthorizationRequest = {
  meta?: RequestMeta;
  serviceCode: string;
  accessKey: string;
};

export type CheckAuthorizationResponse = {
  allowed: boolean;
  message: string;
  expireAt?: ISODateTime;
};

export type InvokeDataServiceRequest = {
  meta?: RequestMeta;
  serviceCode: string;
  params: Record<string, unknown>;
  accessKey: string;
};

export type InvokeDataServiceResponse = {
  rows: Array<Record<string, unknown>>;
  total?: number;
};

export type TestDataServiceRequest = {
  meta?: RequestMeta;
  serviceId: ID;
  params: Record<string, unknown>;
};

export type DownloadOutputTarget = 'FTP' | 'HDFS' | 'OBJECT_STORAGE';

export type CreateDownloadJobRequest = {
  meta?: RequestMeta;
  serviceCode: string;
  params: Record<string, unknown>;
  accessKey: string;
  output: { target: DownloadOutputTarget; targetRef: string; path?: string };
  format: 'CSV';
  compress?: boolean;
  encrypt?: boolean;
  shard?: { enabled: boolean; shardSizeMb?: number };
  resumable?: boolean;
};

export type DownloadJobStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'SUCCESS'
  | 'FAILED'
  | 'CANCELED';

export type DownloadJob = {
  id: ID;
  serviceId?: ID;
  serviceCode: string;
  status: DownloadJobStatus;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  outputRef?: string;
  errorMessage?: string;
};

export type GetDownloadJobRequest = { meta?: RequestMeta; jobId: ID };
export type CancelDownloadJobRequest = { meta?: RequestMeta; jobId: ID };

export type GetApiDocRequest = {
  meta?: RequestMeta;
  serviceId: ID;
  format: 'WORD';
};
export type GetApiDocResponse = { downloadUrl: string; expireAt: ISODateTime };

export type ServiceMonitorConfig = {
  serviceId: ID;
  enabled: boolean;
  config?: Record<string, unknown>;
  updatedAt: ISODateTime;
};

export type UpsertServiceMonitorConfigRequest = {
  meta?: RequestMeta;
  config: Omit<ServiceMonitorConfig, 'updatedAt'>;
};

export type ServiceStats = {
  totalCalls?: number;
  todayCalls?: number;
  totalServices?: number;
  totalUsers?: number;
  hotServicesTop10?: Array<{ serviceId: ID; name: string; calls: number }>;
  topUsersTop5?: Array<{ userId: ID; calls: number }>;
  trend?: Array<{ time: ISODateTime; calls: number }>;
  generatedAt: ISODateTime;
};

export type GetServiceStatsRequest = {
  meta?: RequestMeta;
  startAt: ISODateTime;
  endAt: ISODateTime;
};

export type ServiceCallLog = {
  id: ID;
  serviceId: ID;
  userId?: ID;
  ip?: string;
  mac?: string;
  durationMs: number;
  calledAt: ISODateTime;
  success: boolean;
  errorCode?: string;
};

export type GetServiceCallLogsRequest = {
  meta?: RequestMeta;
  serviceId: ID;
  startAt: ISODateTime;
  endAt: ISODateTime;
};
```

## 5) 对外 SDK 接口（`DataServiceClient`）

```ts
export interface DataServiceClient {
  // 目录管理
  listServiceDirectories(req: {
    meta?: RequestMeta;
    parentId?: ID;
  }): Promise<Result<ServiceDirectoryNode[]>>;
  createServiceDirectory(req: {
    meta?: RequestMeta;
    node: Omit<ServiceDirectoryNode, 'id' | 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ directoryId: ID }>>;
  updateServiceDirectory(req: {
    meta?: RequestMeta;
    node: Omit<ServiceDirectoryNode, 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ success: boolean }>>;
  deleteServiceDirectory(req: {
    meta?: RequestMeta;
    directoryId: ID;
  }): Promise<Result<{ success: boolean }>>;

  createDataService(
    req: CreateDataServiceRequest
  ): Promise<Result<CreateDataServiceResponse>>;
  updateDataService(
    req: UpdateDataServiceRequest
  ): Promise<Result<{ success: boolean }>>;
  publishDataService(
    req: PublishDataServiceRequest
  ): Promise<Result<{ success: boolean }>>;
  deleteDataService(req: {
    meta?: RequestMeta;
    serviceId: ID;
  }): Promise<Result<{ success: boolean }>>;

  getDataService(
    req: GetDataServiceRequest
  ): Promise<Result<DataServiceDetail>>;
  searchDataService(
    req: SearchDataServiceRequest
  ): Promise<Result<PageResult<DataServiceInfo>>>;
  testDataService(
    req: TestDataServiceRequest
  ): Promise<Result<InvokeDataServiceResponse>>;

  addAuthorization(
    req: AddAuthorizationRequest
  ): Promise<Result<AddAuthorizationResponse>>;
  updateAuthorization(
    req: UpdateAuthorizationRequest
  ): Promise<Result<{ success: boolean }>>;
  deleteAuthorization(req: {
    meta?: RequestMeta;
    authorizationId: ID;
  }): Promise<Result<{ success: boolean }>>;
  searchAuthorizations(
    req: SearchAuthorizationsRequest
  ): Promise<Result<PageResult<ServiceAuthorization>>>;
  // 授权分类
  listAuthorizationCategories(req: {
    meta?: RequestMeta;
    parentId?: ID;
  }): Promise<Result<AuthorizationCategoryNode[]>>;
  createAuthorizationCategory(req: {
    meta?: RequestMeta;
    node: Omit<AuthorizationCategoryNode, 'id' | 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ categoryId: ID }>>;
  updateAuthorizationCategory(req: {
    meta?: RequestMeta;
    node: Omit<AuthorizationCategoryNode, 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ success: boolean }>>;
  deleteAuthorizationCategory(req: {
    meta?: RequestMeta;
    categoryId: ID;
  }): Promise<Result<{ success: boolean }>>;

  checkAuthorization(
    req: CheckAuthorizationRequest
  ): Promise<Result<CheckAuthorizationResponse>>;

  invokeDataService(
    req: InvokeDataServiceRequest
  ): Promise<Result<InvokeDataServiceResponse>>;
  getServiceCallLogs(
    req: GetServiceCallLogsRequest
  ): Promise<Result<ServiceCallLog[]>>;

  // 下载增强（离线）
  createDownloadJob(
    req: CreateDownloadJobRequest
  ): Promise<Result<{ jobId: ID }>>;
  getDownloadJob(req: GetDownloadJobRequest): Promise<Result<DownloadJob>>;
  cancelDownloadJob(
    req: CancelDownloadJobRequest
  ): Promise<Result<{ success: boolean }>>;

  // 接口文档
  getApiDoc(req: GetApiDocRequest): Promise<Result<GetApiDocResponse>>;

  // 监控/统计
  upsertServiceMonitorConfig(
    req: UpsertServiceMonitorConfigRequest
  ): Promise<Result<{ success: boolean }>>;
  getServiceStats(req: GetServiceStatsRequest): Promise<Result<ServiceStats>>;
}
```

## 6) 幂等性要求

- `createDataService`：非幂等（默认）。建议支持 `idempotencyKey`。\n- `updateDataService`：幂等。\n- `publishDataService`：幂等。\n- `getDataService` / `searchDataService` / `checkAuthorization` / `getServiceCallLogs`：幂等。\n- `addAuthorization`：非幂等（默认）。如需“重复授权覆盖”，应通过新增 `upsertAuthorization` 接口实现。\n- `invokeDataService`：取决于服务类型（通常查询类幂等；下载类可能触发离线任务）。
- `deleteDataService` / `updateAuthorization` / `deleteAuthorization` / `upsertServiceMonitorConfig`：幂等。\n- `createDownloadJob`：非幂等（默认），强烈建议支持 `idempotencyKey`（防重复提交）。\n- `cancelDownloadJob`：幂等。\n- 目录树 CRUD：更新/删除幂等；创建建议支持 `idempotencyKey`。

## 7) Mock 服务规则（用于并行开发）

- `createDataService`\n - 默认：`{ serviceId: "svc_1", serviceCode: "demo-service" }`\n - 可模拟异常：`SERVICE_NAME_DUPLICATE`\n- `getDataService`\n - 默认：返回样例详情\n - 可模拟异常：`SERVICE_NOT_FOUND`\n- `searchDataService`\n - 默认：返回分页结果（3 条样例）\n- `checkAuthorization`\n - 默认：`{ allowed: true, message: "ok", expireAt: future }`\n - 可模拟异常：`AUTHORIZATION_INVALID`（allowed=false）\n- `invokeDataService`\n - 默认：返回 10 行样例数据\n - 可模拟异常：`RATE_LIMIT_EXCEEDED` / `EXECUTION_FAILED`\n- `getServiceCallLogs`\n - 默认：返回 10 条日志样例\n- `createDownloadJob`\n - 默认：返回 `jobId="job_1"`\n - 可模拟异常：`DOWNLOAD_JOB_FAILED`\n- `getApiDoc`\n - 默认：返回 Word 下载链接\n- `getServiceStats`\n - 默认：返回 TOP 与趋势曲线
