# 阶段 3：`data-sharing` 模块 SDK 契约

## 1) 模块定位

- 跨机构数据共享交换“业务域”：资源登记/编制、服务申请、审批、门户使用、调度监控等完整流程。
- 技术层 API 发布与调用能力依赖 `data-service`；统一审批框架依赖 `system-auth`。

## 2) 依赖的共享实体

来自 `00-shared-entities.md`：

- `User` / `Organization` / `Project`
- `DataAsset`
- `Approval`
- `TaskExecution`
- `RequestMeta`
- `Result<T>`
- `PageRequest` / `PageResult<T>`

## 3) 错误码（本模块）

```ts
export type DataSharingErrorCode =
  | 'DIRECTORY_NOT_FOUND'
  | 'RESOURCE_NOT_FOUND'
  | 'COMPILED_RESOURCE_NOT_FOUND'
  | 'COMPILED_RESOURCE_STATE_INVALID'
  | 'REGISTERED_RESOURCE_IN_USE'
  | 'SERVICE_NOT_FOUND'
  | 'SERVICE_STATE_INVALID'
  | 'APPLICATION_NOT_FOUND'
  | 'APPROVAL_REQUIRED'
  | 'APPROVAL_REJECTED'
  | 'PERMISSION_DENIED'
  | 'INVALID_ARGUMENT'
  | 'DUPLICATE_NAME'
  | 'MAPPING_FAILED';
```

## 4) DTO 定义（覆盖完整业务闭环）

```ts
import type {
  ID,
  ISODateTime,
  PageRequest,
  PageResult,
  RequestMeta,
  Result,
} from './00-shared-entities';

export type ShareResourceType = 'TABLE' | 'API' | 'FILE';
export type ShareType = 'UNCONDITIONAL' | 'CONDITIONAL' | 'NOT_SHARED';

// -------------------------
// 资源分类目录（树）
// -------------------------
export type ResourceDirectoryNode = {
  id: ID;
  parentId?: ID;
  name: string;
  code: string;
  sort?: number;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};

// -------------------------
// 登记资源（Register）- 对应“库表/接口/文件数据登记”
// -------------------------
export type RegisteredResourceStatus = 'ACTIVE' | 'DELETED';

export type RegisteredResourceBase = {
  id: ID;
  type: ShareResourceType;
  name: string;
  description?: string;
  ownerOrgId: ID;
  status: RegisteredResourceStatus;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};

export type RegisteredTableResource = RegisteredResourceBase & {
  type: 'TABLE';
  dataSourceId: ID;
  schema?: string;
  tableName: string;
  // 可选：若由自定义 SQL 生成登记资源
  customSql?: string;
};

export type RegisteredApiResource = RegisteredResourceBase & {
  type: 'API';
  // 代理/封装接口都抽象为 endpoint + method + headersTemplate
  method: 'GET' | 'POST';
  endpoint: string;
  headersTemplate?: Record<string, string>;
  // 存储认证引用，不在契约中放明文
  authRef?: string;
};

export type RegisteredFileResource = RegisteredResourceBase & {
  type: 'FILE';
  // 文件存储引用（HDFS/OSS/MinIO/... 由实现层决定）
  fileRef: string;
  fileName: string;
  contentType?: string;
  sizeBytes?: number;
};

export type RegisteredResource =
  | RegisteredTableResource
  | RegisteredApiResource
  | RegisteredFileResource;

export type TestRegisteredApiRequest = {
  meta?: RequestMeta;
  resourceId: ID;
  payload?: Record<string, unknown>;
};

export type TestRegisteredApiResponse = {
  success: boolean;
  statusCode?: number;
  // 兼容不同接口的返回
  response?: unknown;
  testedAt: ISODateTime;
};

// -------------------------
// 编制资源（Compile）- 对应“新增编制资源/发布/取消发布/修改删除/导入导出”
// -------------------------
export type CompiledResourceStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'PUBLISHED'
  | 'CANCELED'
  | 'DELETED';

export type CompiledDataItem = {
  name: string;
  type?: string;
  description?: string;
  shareable?: boolean; // 仅 shareable=true 的字段可用于服务登记
};

export type CompiledResource = {
  id: ID;
  directoryId: ID;
  name: string;
  type: ShareResourceType;
  shareType: ShareType;
  status: CompiledResourceStatus;
  dataItems: CompiledDataItem[];
  // 资源的基本信息与外部标识扩展
  tags?: string[];
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};

export type PublishCompiledResourceRequest = {
  meta?: RequestMeta;
  compiledResourceId: ID;
  action: 'SUBMIT' | 'CANCEL_PUBLISH';
};

// -------------------------
// 挂接（Mapping）- 对应“资源挂接/取消挂接/挂接详情”
// -------------------------
export type ResourceMappingMode = 'AUTO' | 'MANUAL';

export type ResourceMapping = {
  id: ID;
  compiledResourceId: ID;
  registeredResourceId: ID;
  mode: ResourceMappingMode;
  // 字段映射：compiledItem -> registered column/field
  fieldMappings?: Array<{ compiledField: string; registeredField: string }>;
  createdAt: ISODateTime;
};

export type AttachResourceRequest = {
  meta?: RequestMeta;
  compiledResourceId: ID;
  registeredResourceId: ID;
  mode: ResourceMappingMode;
  fieldMappings?: Array<{ compiledField: string; registeredField: string }>;
};

export type AttachResourceResponse = { mappingId: ID };

// -------------------------
// 服务登记（Service）- 对应“服务登记/已登记服务管理/发布取消/申请”
// -------------------------
export type SharingServiceType =
  | 'TABLE_EXCHANGE'
  | 'API_PROXY'
  | 'FILE_DOWNLOAD'
  | 'ONLINE_QUERY';
export type SharingServiceStatus = 'DRAFT' | 'PUBLISHED' | 'OFFLINE';

export type SharingService = {
  id: ID;
  compiledResourceId: ID;
  name: string;
  type: SharingServiceType;
  status: SharingServiceStatus;
  // 参数与返回字段（仅可选 shareable 项）
  queryFields?: Array<{
    name: string;
    required?: boolean;
    description?: string;
  }>;
  responseFields?: Array<{ name: string; description?: string }>;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};

export type CreateSharingServiceRequest = {
  meta?: RequestMeta;
  service: Omit<SharingService, 'id' | 'status' | 'createdAt' | 'updatedAt'> & {
    status?: SharingServiceStatus;
  };
};

export type UpdateSharingServiceRequest = {
  meta?: RequestMeta;
  service: Partial<Omit<SharingService, 'createdAt' | 'updatedAt'>> & {
    id: ID;
  };
};

export type PublishSharingServiceRequest = {
  meta?: RequestMeta;
  serviceId: ID;
  publish: boolean;
};

export type ServiceApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'REJECTED';

export type ServiceApplication = {
  id: ID;
  serviceId: ID;
  applicantUserId: ID;
  applicantOrgId: ID;
  status: ServiceApplicationStatus;
  approvalId?: ID;
  accessKeyRef?: string; // 审批通过后生成访问密钥引用（不返回明文）
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};

export type CreateServiceApplicationRequest = {
  meta?: RequestMeta;
  serviceId: ID;
  applicantUserId: ID;
  payload: Record<string, unknown>;
  submit?: boolean; // true=直接提交，false=暂存草稿
};

export type CreateServiceApplicationResponse = {
  applicationId: ID;
  status: ServiceApplicationStatus;
  approvalId?: ID;
};

export type UrgeApprovalRequest = {
  meta?: RequestMeta;
  applicationId: ID;
  message?: string;
};
export type GetPortalHomeStatsRequest = { meta?: RequestMeta; orgId: ID };

export type PortalRankItem = { id: ID; name: string; count: number };

export type PortalHomeStats = {
  todoCount: number;
  hotResourcesTop10: Array<{ id: ID; name: string; visits: number }>;
  resourceApplyRankTop10?: PortalRankItem[];
  resourceDirectoryStats?: Array<{ type: ShareResourceType; count: number }>;
};

// -------------------------
// 调度监控（交换任务执行）- 对应“任务运行监控”
// -------------------------
export type ListExchangeExecutionsRequest = {
  meta?: RequestMeta;
  serviceId?: ID;
  status?: string;
  page: PageRequest;
};

export type ReRunExchangeExecutionRequest = {
  meta?: RequestMeta;
  executionId: ID;
};
export type UpdateExchangeScheduleRequest = {
  meta?: RequestMeta;
  executionId: ID;
  schedule?: string;
  enabled?: boolean;
};
```

## 5) 对外 SDK 接口（`DataSharingClient`）

```ts
export interface DataSharingClient {
  // 门户首页
  getPortalHomeStats(
    req: GetPortalHomeStatsRequest
  ): Promise<Result<PortalHomeStats>>;

  // 事项任务（审批代办视角：对接 system-auth 的审批框架）
  // 注：具体待办/已办列表在 system-auth；data-sharing 提供“业务详情聚合”
  getApplicationDetailForApproval(req: {
    meta?: RequestMeta;
    applicationId: ID;
  }): Promise<Result<ServiceApplication>>;

  // 资源分类目录
  listResourceDirectories(req: {
    meta?: RequestMeta;
    parentId?: ID;
  }): Promise<Result<ResourceDirectoryNode[]>>;
  createResourceDirectory(req: {
    meta?: RequestMeta;
    node: Omit<ResourceDirectoryNode, 'id' | 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ directoryId: ID }>>;
  updateResourceDirectory(req: {
    meta?: RequestMeta;
    node: Omit<ResourceDirectoryNode, 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ success: boolean }>>;
  deleteResourceDirectory(req: {
    meta?: RequestMeta;
    directoryId: ID;
  }): Promise<Result<{ success: boolean }>>;

  // 资源登记（库表 / 接口 / 文件）
  createRegisteredResource(req: {
    meta?: RequestMeta;
    resource: Omit<
      RegisteredResource,
      'id' | 'status' | 'createdAt' | 'updatedAt'
    >;
  }): Promise<Result<{ resourceId: ID }>>;
  updateRegisteredResource(req: {
    meta?: RequestMeta;
    resource: Partial<Omit<RegisteredResource, 'createdAt' | 'updatedAt'>> & {
      id: ID;
    };
  }): Promise<Result<{ success: boolean }>>;
  deleteRegisteredResource(req: {
    meta?: RequestMeta;
    resourceId: ID;
  }): Promise<Result<{ success: boolean }>>;
  getRegisteredResource(req: {
    meta?: RequestMeta;
    resourceId: ID;
  }): Promise<Result<RegisteredResource>>;
  listRegisteredResources(req: {
    meta?: RequestMeta;
    ownerOrgId?: ID;
    type?: ShareResourceType;
    keyword?: string;
    page: PageRequest;
  }): Promise<Result<PageResult<RegisteredResource>>>;

  testRegisteredApi(
    req: TestRegisteredApiRequest
  ): Promise<Result<TestRegisteredApiResponse>>;

  // 编制资源
  createCompiledResource(req: {
    meta?: RequestMeta;
    resource: Omit<
      CompiledResource,
      'id' | 'status' | 'createdAt' | 'updatedAt'
    > & { status?: CompiledResourceStatus };
  }): Promise<Result<{ compiledResourceId: ID }>>;
  updateCompiledResource(req: {
    meta?: RequestMeta;
    resource: Partial<Omit<CompiledResource, 'createdAt' | 'updatedAt'>> & {
      id: ID;
    };
  }): Promise<Result<{ success: boolean }>>;
  deleteCompiledResource(req: {
    meta?: RequestMeta;
    compiledResourceId: ID;
  }): Promise<Result<{ success: boolean }>>;
  getCompiledResource(req: {
    meta?: RequestMeta;
    compiledResourceId: ID;
  }): Promise<Result<CompiledResource>>;
  searchCompiledResources(req: {
    meta?: RequestMeta;
    directoryId?: ID;
    type?: ShareResourceType;
    status?: CompiledResourceStatus;
    keyword?: string;
    page: PageRequest;
  }): Promise<Result<PageResult<CompiledResource>>>;

  importCompiledResources(req: {
    meta?: RequestMeta;
    format: 'TEMPLATE_V1';
    payload: Record<string, unknown>;
  }): Promise<Result<{ success: boolean }>>;
  exportCompiledResources(req: {
    meta?: RequestMeta;
    directoryId?: ID;
    format: 'TEMPLATE_V1';
  }): Promise<Result<{ downloadUrl: string; expireAt: ISODateTime }>>;

  publishCompiledResource(
    req: PublishCompiledResourceRequest
  ): Promise<Result<{ success: boolean }>>;

  // 挂接（编制资源 <-> 登记资源）
  attachResource(
    req: AttachResourceRequest
  ): Promise<Result<AttachResourceResponse>>;
  detachResource(req: {
    meta?: RequestMeta;
    compiledResourceId: ID;
  }): Promise<Result<{ success: boolean }>>;
  getResourceMapping(req: {
    meta?: RequestMeta;
    compiledResourceId: ID;
  }): Promise<Result<ResourceMapping>>;

  // 可登记资源管理（已发布且已挂接）
  listRegistrableCompiledResources(req: {
    meta?: RequestMeta;
    directoryId?: ID;
    keyword?: string;
    page: PageRequest;
  }): Promise<Result<PageResult<CompiledResource>>>;

  // 服务登记与管理
  createSharingService(
    req: CreateSharingServiceRequest
  ): Promise<Result<{ serviceId: ID }>>;
  updateSharingService(
    req: UpdateSharingServiceRequest
  ): Promise<Result<{ success: boolean }>>;
  deleteSharingService(req: {
    meta?: RequestMeta;
    serviceId: ID;
  }): Promise<Result<{ success: boolean }>>;
  getSharingService(req: {
    meta?: RequestMeta;
    serviceId: ID;
  }): Promise<Result<SharingService>>;
  searchSharingServices(req: {
    meta?: RequestMeta;
    compiledResourceId?: ID;
    status?: SharingServiceStatus;
    keyword?: string;
    page: PageRequest;
  }): Promise<Result<PageResult<SharingService>>>;
  publishSharingService(
    req: PublishSharingServiceRequest
  ): Promise<Result<{ success: boolean }>>;

  // 服务申请
  createServiceApplication(
    req: CreateServiceApplicationRequest
  ): Promise<Result<CreateServiceApplicationResponse>>;
  getServiceApplication(req: {
    meta?: RequestMeta;
    applicationId: ID;
  }): Promise<Result<ServiceApplication>>;
  listMyApplications(req: {
    meta?: RequestMeta;
    applicantUserId: ID;
    page: PageRequest;
  }): Promise<Result<PageResult<ServiceApplication>>>;
  listApplicationsForProvider(req: {
    meta?: RequestMeta;
    ownerOrgId: ID;
    status?: ServiceApplicationStatus;
    page: PageRequest;
  }): Promise<Result<PageResult<ServiceApplication>>>;

  // 催办
  urgeApproval(req: UrgeApprovalRequest): Promise<Result<{ success: boolean }>>;

  // 调度监控（库表交换类服务）
  listExchangeExecutions(
    req: ListExchangeExecutionsRequest
  ): Promise<Result<PageResult<TaskExecution>>>;
  reRunExchangeExecution(
    req: ReRunExchangeExecutionRequest
  ): Promise<Result<{ newExecutionId: ID }>>;
  updateExchangeSchedule(
    req: UpdateExchangeScheduleRequest
  ): Promise<Result<{ success: boolean }>>;
}
```

## 6) 幂等性要求

- 创建类：默认非幂等，建议支持 `idempotencyKey`。\n- `update*` / `delete*`：幂等（重复提交结果一致）。\n- `publishCompiledResource` / `publishSharingService`：幂等。\n- `createServiceApplication`：若 `submit=true` 强烈建议支持 `idempotencyKey`（避免重复提交造成重复审批/重复密钥）。\n- 查询类：幂等。\n- 催办：幂等（同一 applicationId + 时间窗口可去重）。\n- `reRunExchangeExecution`：非幂等（触发新执行）。

## 7) Mock 服务规则

- `getPortalHomeStats`\n - 默认：返回 `todoCount=3` 与 TOP10 列表\n- `createServiceApplication`\n - 默认：返回 `applicationId="app_1"`，若 `submit=true` 返回 `approvalId="ap_1"`\n - 可模拟异常：`APPROVAL_REQUIRED` / `APPROVAL_REJECTED`\n- `urgeApproval`\n - 默认：`{ success: true }`

- `createResourceDirectory`\n - 默认：返回 `directoryId="dir_1"`\n - 可模拟异常：`DUPLICATE_NAME`\n- `createRegisteredResource`\n - 默认：返回 `resourceId="reg_1"`\n - 可模拟异常：`INVALID_ARGUMENT`\n- `testRegisteredApi`\n - 默认：返回 `{ success: true, statusCode: 200, testedAt: now }`\n - 可模拟异常：`RESOURCE_NOT_FOUND`\n- `createCompiledResource`\n - 默认：返回 `compiledResourceId="cr_1"`\n - 可模拟异常：`DUPLICATE_NAME`\n- `publishCompiledResource`\n - 默认：`{ success: true }`\n - 可模拟异常：`COMPILED_RESOURCE_STATE_INVALID`\n- `attachResource`\n - 默认：返回 `mappingId="map_1"`\n - 可模拟异常：`MAPPING_FAILED`\n- `createSharingService`\n - 默认：返回 `serviceId="svc_1"`\n - 可模拟异常：`SERVICE_STATE_INVALID`\n- `listExchangeExecutions`\n - 默认：分页返回 10 条执行记录\n- `reRunExchangeExecution`\n - 默认：返回 `newExecutionId="exe_2"`\n - 可模拟异常：`INVALID_ARGUMENT`
