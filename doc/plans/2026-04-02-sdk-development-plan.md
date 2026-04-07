---
name: sdk-development-plan
overview: 规划各服务 SDK 的开发、测试和验收流程，确保前端团队可以类型安全地调用后端服务。
todos:
  - id: sdk-infrastructure
    content: 搭建 SDK 基础设施（HTTP 客户端、认证、错误处理、重试）
    status: completed
  - id: auth-sdk
    content: 开发认证服务 SDK
    status: completed
  - id: metadata-sdk
    content: 开发元数据服务 SDK
    status: completed
  - id: data-sdk
    content: 开发数据服务 SDK
    status: completed
  - id: ops-sdk
    content: 开发运维服务 SDK
    status: completed
  - id: admin-sdk
    content: 开发管理服务 SDK
    status: completed
  - id: sharing-sdk
    content: 开发共享服务 SDK
    status: completed
  - id: analytics-sdk
    content: 开发分析服务 SDK
    status: completed
  - id: integration-sdk
    content: 开发集成服务 SDK
    status: completed
  - id: security-sdk
    content: 开发安全服务 SDK
    status: completed
  - id: sdk-testing
    content: SDK 单元测试和集成测试
    status: completed
  - id: sdk-publish
    content: 发布 SDK 到 npm
    status: pending
isProject: false
---

# SDK 开发计划

> 目标：为前端团队提供类型安全的 TypeScript SDK，覆盖所有后端服务。

> 执行进度（2026-04-02）：
>
> - 已完成 Wave 0~Wave 3 对应的 SDK 客户端实现与单元测试
> - 已覆盖 auth/metadata/data/ops/admin/sharing/analytics/integration/security
> - 发布步骤（`sdk-publish`）待执行

---

## 一、SDK 架构设计

### 1.1 包结构

```
packages/sdk/
├── src/
│   ├── index.ts                    # 统一导出入口
│   ├── client.ts                   # 基础 HTTP 客户端
│   ├── auth.ts                     # 认证拦截器
│   ├── errors.ts                   # 错误处理
│   ├── types.ts                    # 公共类型
│   └── modules/
│       ├── auth/
│       │   ├── index.ts            # AuthClient
│       │   └── types.ts            # 类型定义（从 contract 导入）
│       ├── metadata/
│       │   ├── index.ts            # MetadataClient
│       │   └── types.ts
│       ├── data/
│       │   ├── index.ts            # DataClient
│       │   └── types.ts
│       ├── ops/
│       │   ├── index.ts            # OpsClient
│       │   └── types.ts
│       ├── admin/
│       │   ├── index.ts            # AdminClient
│       │   └── types.ts
│       ├── sharing/
│       │   ├── index.ts            # SharingClient
│       │   └── types.ts
│       ├── analytics/
│       │   ├── index.ts            # AnalyticsClient
│       │   └── types.ts
│       ├── integration/
│       │   ├── index.ts            # IntegrationClient
│       │   └── types.ts
│       └── security/
│           ├── index.ts            # SecurityClient
│           └── types.ts
├── test/
│   └── modules/
│       └── *.test.ts
├── package.json
├── tsconfig.json
└── tsup.config.ts
```

### 1.2 依赖关系

```
@ai-datahub/sdk
├── @ai-datahub/contract    # 类型定义来源
├── axios                   # HTTP 客户端
└── zod                     # 运行时校验（可选）
```

### 1.3 导出设计

```typescript
// 统一入口
export { createClient } from './client';
export { AuthClient } from './modules/auth';
export { MetadataClient } from './modules/metadata';
export { DataClient } from './modules/data';
export { OpsClient } from './modules/ops';
export { AdminClient } from './modules/admin';
export { SharingClient } from './modules/sharing';
export { AnalyticsClient } from './modules/analytics';
export { IntegrationClient } from './modules/integration';
export { SecurityClient } from './modules/security';

// 类型重导出
export type * from '@ai-datahub/contract';
```

---

## 二、基础设施开发

### 2.1 HTTP 客户端核心

```typescript
// packages/sdk/src/client.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import type { Result } from '@ai-datahub/contract';

export interface SdkConfig {
  baseUrl: string;
  getToken: () => string | null;
  timeout?: number;
  onUnauthorized?: () => void;
}

export class HttpClient {
  private axios: AxiosInstance;

  constructor(config: SdkConfig) {
    this.axios = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout ?? 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 请求拦截器：注入 Token
    this.axios.interceptors.request.use((req) => {
      const token = config.getToken();
      if (token) {
        req.headers.Authorization = `Bearer ${token}`;
      }
      return req;
    });

    // 响应拦截器：统一错误处理
    this.axios.interceptors.response.use(
      (res) => res,
      (error) => {
        if (error.response?.status === 401) {
          config.onUnauthorized?.();
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(
    url: string,
    params?: Record<string, unknown>
  ): Promise<Result<T>> {
    const response = await this.axios.get<Result<T>>(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: unknown): Promise<Result<T>> {
    const response = await this.axios.post<Result<T>>(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: unknown): Promise<Result<T>> {
    const response = await this.axios.put<Result<T>>(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<Result<T>> {
    const response = await this.axios.delete<Result<T>>(url);
    return response.data;
  }
}

// 工厂函数
export function createClient(config: SdkConfig) {
  const http = new HttpClient(config);

  return {
    auth: new AuthClient(http),
    metadata: new MetadataClient(http),
    data: new DataClient(http),
    ops: new OpsClient(http),
    admin: new AdminClient(http),
    sharing: new SharingClient(http),
    analytics: new AnalyticsClient(http),
    integration: new IntegrationClient(http),
    security: new SecurityClient(http),
  };
}
```

### 2.2 错误处理

```typescript
// packages/sdk/src/errors.ts
import type { SdkError } from '@ai-datahub/contract';

export class SdkException extends Error {
  constructor(
    public readonly error: SdkError,
    public readonly traceId?: string
  ) {
    super(error.message);
    this.name = `SdkException:${error.code}`;
  }

  get code() {
    return this.error.code;
  }
  get level() {
    return this.error.level;
  }
}

// 辅助函数
export function throwIfError<T>(result: Result<T>): T {
  if (result.ok) {
    return result.data;
  }
  throw new SdkException(result.error, result.traceId);
}
```

---

## 三、各服务 SDK 开发计划

### 3.1 AuthClient（认证服务）

**开发内容**：

```typescript
// packages/sdk/src/modules/auth/index.ts
import type { HttpClient } from '../../client';
import type {
  AuthClient,
  LoginRequest,
  LoginResponse,
  User,
  Result,
} from '@ai-datahub/contract';

export class AuthClientImpl implements AuthClient {
  constructor(private http: HttpClient) {}

  async login(req: LoginRequest): Promise<Result<LoginResponse>> {
    return this.http.post('/auth/login', req);
  }

  async logout(): Promise<Result<void>> {
    return this.http.post('/auth/logout');
  }

  async getCurrentUser(): Promise<Result<User>> {
    return this.http.get('/auth/me');
  }

  async refreshToken(): Promise<Result<{ token: string }>> {
    return this.http.post('/auth/refresh');
  }

  async changePassword(req: {
    oldPassword: string;
    newPassword: string;
  }): Promise<Result<void>> {
    return this.http.post('/auth/change-password', req);
  }
}
```

**验收标准**：

- [ ] 实现所有 `AuthClient` 接口方法
- [ ] 单元测试覆盖率 ≥ 80%
- [ ] 类型定义与 `@ai-datahub/contract` 一致

---

### 3.2 MetadataClient（元数据服务）

**开发内容**：

```typescript
// packages/sdk/src/modules/metadata/index.ts
export class MetadataClientImpl implements MetadataClient {
  constructor(private http: HttpClient) {}

  // 数据源管理
  async listDataSources(
    req: ListDataSourcesRequest
  ): Promise<Result<PageResult<DataSource>>> {
    return this.http.get('/metadata/data-sources', req);
  }

  async getDataSource(req: { id: ID }): Promise<Result<DataSource>> {
    return this.http.get(`/metadata/data-sources/${req.id}`);
  }

  async createDataSource(
    req: CreateDataSourceRequest
  ): Promise<Result<{ id: ID }>> {
    return this.http.post('/metadata/data-sources', req);
  }

  async testConnection(req: { id: ID }): Promise<Result<ConnectionTestResult>> {
    return this.http.post(`/metadata/data-sources/${req.id}/test`);
  }

  async syncMetadata(req: { id: ID }): Promise<Result<SyncResult>> {
    return this.http.post(`/metadata/data-sources/${req.id}/sync`);
  }

  // 数据库/表管理
  async listDatabases(req: { dataSourceId: ID }): Promise<Result<Database[]>> {
    return this.http.get('/metadata/databases', req);
  }

  async listTables(req: ListTablesRequest): Promise<Result<PageResult<Table>>> {
    return this.http.get('/metadata/tables', req);
  }

  async getTableDetail(req: { id: ID }): Promise<Result<TableDetail>> {
    return this.http.get(`/metadata/tables/${req.id}`);
  }

  // 字段管理
  async listColumns(req: { tableId: ID }): Promise<Result<Column[]>> {
    return this.http.get(`/metadata/tables/${req.tableId}/columns`);
  }
}
```

**验收标准**：

- [ ] 实现所有 `MetadataClient` 接口方法
- [ ] 分页请求/响应类型正确
- [ ] 单元测试覆盖率 ≥ 80%

---

### 3.3 DataClient（数据服务）

**开发内容**：

```typescript
// packages/sdk/src/modules/data/index.ts
export class DataClientImpl implements DataClient {
  constructor(private http: HttpClient) {}

  // 分层管理
  async listLayers(): Promise<Result<Layer[]>> {
    return this.http.get('/data/organization/layers');
  }

  async createLayer(req: CreateLayerRequest): Promise<Result<{ id: ID }>> {
    return this.http.post('/data/organization/layers', req);
  }

  // 资产映射
  async listAssetMappings(
    req: ListAssetMappingsRequest
  ): Promise<Result<PageResult<AssetMapping>>> {
    return this.http.get('/data/organization/mappings', req);
  }

  async createAssetMapping(
    req: CreateAssetMappingRequest
  ): Promise<Result<{ id: ID }>> {
    return this.http.post('/data/organization/mappings', req);
  }

  // 数据集成
  async executeQuery(req: ExecuteQueryRequest): Promise<Result<QueryResult>> {
    return this.http.post('/data/integration/query', req);
  }

  async getQueryHistory(
    req: PageRequest
  ): Promise<Result<PageResult<QueryHistory>>> {
    return this.http.get('/data/integration/query/history', req);
  }
}
```

**验收标准**：

- [ ] 实现所有 `DataClient` 接口方法
- [ ] 大结果集分页正确处理
- [ ] 单元测试覆盖率 ≥ 80%

---

### 3.4 OpsClient（运维服务）

**开发内容**：

```typescript
// packages/sdk/src/modules/ops/index.ts
export class OpsClientImpl implements OpsClient {
  constructor(private http: HttpClient) {}

  // 告警规则
  async listAlertRules(): Promise<Result<AlertRule[]>> {
    return this.http.get('/ops/alerts/rules');
  }

  async createAlertRule(
    req: CreateAlertRuleRequest
  ): Promise<Result<{ id: ID }>> {
    return this.http.post('/ops/alerts/rules', req);
  }

  async updateAlertRule(
    req: UpdateAlertRuleRequest
  ): Promise<Result<{ success: boolean }>> {
    return this.http.put('/ops/alerts/rules', req);
  }

  // 执行管理
  async listExecutions(
    req: ListExecutionsRequest
  ): Promise<Result<PageResult<TaskExecution>>> {
    return this.http.get('/ops/executions', req);
  }

  async rerunExecution(req: {
    executionId: ID;
  }): Promise<Result<{ newExecutionId: ID }>> {
    return this.http.post(`/ops/executions/${req.executionId}/rerun`);
  }

  // 运营报表
  async getOpsReport(req: GetOpsReportRequest): Promise<Result<OpsReport>> {
    return this.http.get('/ops/report', req);
  }

  // DAG 调度
  async listDags(
    req: ListDagsRequest
  ): Promise<Result<PageResult<DagDefinition>>> {
    return this.http.post('/ops/scheduler/dag/list', req);
  }

  async createDag(req: CreateDagRequest): Promise<Result<{ dagId: ID }>> {
    return this.http.post('/ops/scheduler/dag/create', req);
  }

  async triggerDag(
    req: TriggerDagRequest
  ): Promise<Result<{ executionIds: ID[] }>> {
    return this.http.post('/ops/scheduler/dag/trigger', req);
  }
}
```

**验收标准**：

- [ ] 实现所有 `OpsClient` 接口方法
- [ ] 调度相关方法正确处理异步状态
- [ ] 单元测试覆盖率 ≥ 80%

---

### 3.5 AdminClient（管理服务）

**开发内容**：

```typescript
// packages/sdk/src/modules/admin/index.ts
export class AdminClientImpl implements AdminClient {
  constructor(private http: HttpClient) {}

  // 项目管理
  async listProjects(
    req: ListProjectsRequest
  ): Promise<Result<PageResult<Project>>> {
    return this.http.get('/admin/projects', req);
  }

  async createProject(
    req: CreateProjectRequest
  ): Promise<Result<{ projectId: ID }>> {
    return this.http.post('/admin/projects', req);
  }

  async updateProject(
    req: UpdateProjectRequest
  ): Promise<Result<{ success: boolean }>> {
    return this.http.put('/admin/projects', req);
  }

  async deleteProject(req: {
    projectId: ID;
  }): Promise<Result<{ success: boolean }>> {
    return this.http.delete(`/admin/projects/${req.projectId}`);
  }

  // 项目分组
  async listProjectGroups(
    req: ListProjectGroupsRequest
  ): Promise<Result<PageResult<ProjectGroup>>> {
    return this.http.get('/admin/project-groups', req);
  }

  async bindProjectsToGroup(req: {
    groupId: ID;
    projectIds: ID[];
  }): Promise<Result<{ success: boolean }>> {
    return this.http.post(
      `/admin/project-groups/${req.groupId}/bind-projects`,
      req
    );
  }

  // 函数管理
  async listFunctions(
    req: ListFunctionsRequest
  ): Promise<Result<PageResult<FunctionDef>>> {
    return this.http.get('/admin/functions', req);
  }

  async createFunction(
    req: CreateFunctionRequest
  ): Promise<Result<{ functionId: ID }>> {
    return this.http.post('/admin/functions', req);
  }

  // 驱动/包管理
  async listDrivers(req: PageRequest): Promise<Result<PageResult<DriverDef>>> {
    return this.http.get('/admin/drivers', req);
  }

  async listPackages(
    req: PageRequest
  ): Promise<Result<PageResult<PackageDef>>> {
    return this.http.get('/admin/packages', req);
  }

  // 操作日志
  async listOperationLogs(
    req: ListOperationLogsRequest
  ): Promise<Result<PageResult<OperationLog>>> {
    return this.http.get('/admin/logs', req);
  }

  // 工单管理
  async listMyTickets(
    req: ListMyTicketsRequest
  ): Promise<Result<PageResult<WorkTicket>>> {
    return this.http.get('/admin/tickets', req);
  }

  async updateWorkTicket(
    req: UpdateWorkTicketRequest
  ): Promise<Result<{ success: boolean }>> {
    return this.http.put(`/admin/tickets/${req.ticketId}`, req);
  }
}
```

**验收标准**：

- [ ] 实现所有 `AdminClient` 接口方法
- [ ] 单元测试覆盖率 ≥ 80%

---

### 3.6 SharingClient（共享服务）

**开发内容**：

```typescript
// packages/sdk/src/modules/sharing/index.ts
export class SharingClientImpl implements SharingClient {
  constructor(private http: HttpClient) {}

  // 门户统计
  async getPortalHomeStats(req: {
    orgId: ID;
  }): Promise<Result<PortalHomeStats>> {
    return this.http.get('/sharing/portal/stats', req);
  }

  // 资源目录
  async listResourceDirectories(req: {
    parentId?: ID;
  }): Promise<Result<ResourceDirectoryNode[]>> {
    return this.http.get('/sharing/directories', req);
  }

  async createResourceDirectory(
    req: CreateDirectoryRequest
  ): Promise<Result<{ directoryId: ID }>> {
    return this.http.post('/sharing/directories', req);
  }

  // 登记资源
  async listRegisteredResources(
    req: ListRegisteredResourcesRequest
  ): Promise<Result<PageResult<RegisteredResource>>> {
    return this.http.get('/sharing/resources/registered', req);
  }

  async createRegisteredResource(
    req: CreateRegisteredResourceRequest
  ): Promise<Result<{ resourceId: ID }>> {
    return this.http.post('/sharing/resources/registered', req);
  }

  async testRegisteredApi(
    req: TestRegisteredApiRequest
  ): Promise<Result<TestRegisteredApiResponse>> {
    return this.http.post(
      `/sharing/resources/registered/${req.resourceId}/test`
    );
  }

  // 编制资源
  async listCompiledResources(
    req: ListCompiledResourcesRequest
  ): Promise<Result<PageResult<CompiledResource>>> {
    return this.http.get('/sharing/resources/compiled', req);
  }

  async createCompiledResource(
    req: CreateCompiledResourceRequest
  ): Promise<Result<{ compiledResourceId: ID }>> {
    return this.http.post('/sharing/resources/compiled', req);
  }

  async publishCompiledResource(
    req: PublishCompiledResourceRequest
  ): Promise<Result<{ success: boolean }>> {
    return this.http.post(
      `/sharing/resources/compiled/${req.compiledResourceId}/publish`,
      req
    );
  }

  // 资源挂接
  async attachResource(
    req: AttachResourceRequest
  ): Promise<Result<{ mappingId: ID }>> {
    return this.http.post('/sharing/mappings', req);
  }

  async getResourceMapping(req: {
    compiledResourceId: ID;
  }): Promise<Result<ResourceMapping>> {
    return this.http.get('/sharing/mappings', req);
  }

  // 共享服务
  async listSharingServices(
    req: ListSharingServicesRequest
  ): Promise<Result<PageResult<SharingService>>> {
    return this.http.get('/sharing/services', req);
  }

  async createSharingService(
    req: CreateSharingServiceRequest
  ): Promise<Result<{ serviceId: ID }>> {
    return this.http.post('/sharing/services', req);
  }

  async publishSharingService(
    req: PublishSharingServiceRequest
  ): Promise<Result<{ success: boolean }>> {
    return this.http.post(`/sharing/services/${req.serviceId}/publish`, req);
  }

  // 服务申请
  async createServiceApplication(
    req: CreateServiceApplicationRequest
  ): Promise<Result<CreateServiceApplicationResponse>> {
    return this.http.post('/sharing/applications', req);
  }

  async listMyApplications(
    req: ListMyApplicationsRequest
  ): Promise<Result<PageResult<ServiceApplication>>> {
    return this.http.get('/sharing/applications', req);
  }

  async urgeApproval(
    req: UrgeApprovalRequest
  ): Promise<Result<{ success: boolean }>> {
    return this.http.post(`/sharing/applications/${req.applicationId}/urge`);
  }
}
```

**验收标准**：

- [ ] 实现所有 `SharingClient` 接口方法（25+）
- [ ] 复杂业务流程测试覆盖
- [ ] 单元测试覆盖率 ≥ 80%

---

### 3.7 AnalyticsClient（分析服务）

**开发内容**：

```typescript
// packages/sdk/src/modules/analytics/index.ts
export class AnalyticsClientImpl implements AnalyticsClient {
  constructor(private http: HttpClient) {}

  // 查询管理
  async listQueries(
    req: ListQueriesRequest
  ): Promise<Result<PageResult<SavedQuery>>> {
    return this.http.get('/analytics/queries', req);
  }

  async saveQuery(req: SaveQueryRequest): Promise<Result<{ queryId: ID }>> {
    return this.http.post('/analytics/queries', req);
  }

  async updateQuery(
    req: UpdateQueryRequest
  ): Promise<Result<{ success: boolean }>> {
    return this.http.put('/analytics/queries', req);
  }

  async deleteQuery(req: {
    queryId: ID;
  }): Promise<Result<{ success: boolean }>> {
    return this.http.delete(`/analytics/queries/${req.queryId}`);
  }

  // 执行查询
  async executeSavedQuery(
    req: ExecuteSavedQueryRequest
  ): Promise<Result<QueryResult>> {
    return this.http.post(`/analytics/queries/${req.queryId}/execute`);
  }

  async exportQueryResult(
    req: ExportQueryResultRequest
  ): Promise<Result<ExportQueryResultResponse>> {
    return this.http.post(`/analytics/queries/${req.queryId}/export`);
  }

  // 可视化
  async listVisualizations(
    req: { queryId: ID } & PageRequest
  ): Promise<Result<PageResult<VisualizationSpec>>> {
    return this.http.get('/analytics/visualizations', req);
  }

  async createVisualization(
    req: CreateVisualizationRequest
  ): Promise<Result<{ visualizationId: ID }>> {
    return this.http.post('/analytics/visualizations', req);
  }

  // 数据探索
  async exploreData(
    req: DataExploreRequest
  ): Promise<Result<DataExploreResponse>> {
    return this.http.post('/analytics/explore', req);
  }

  // 分享
  async shareQuery(
    req: ShareQueryRequest
  ): Promise<Result<{ success: boolean }>> {
    return this.http.post(`/analytics/queries/${req.queryId}/share`);
  }
}
```

**验收标准**：

- [ ] 实现所有 `AnalyticsClient` 接口方法
- [ ] 查询执行结果类型正确
- [ ] 单元测试覆盖率 ≥ 80%

---

### 3.8 IntegrationClient（集成服务）

**开发内容**：

```typescript
// packages/sdk/src/modules/integration/index.ts
export class IntegrationClientImpl implements IntegrationClient {
  constructor(private http: HttpClient) {}

  // 连接器管理
  async listConnectors(req: {
    type?: ConnectorType;
  }): Promise<Result<Connector[]>> {
    return this.http.get('/integration/connectors', req);
  }

  async upsertConnector(
    req: UpsertConnectorRequest
  ): Promise<Result<{ connectorId: ID }>> {
    return this.http.post('/integration/connectors', req);
  }

  async testConnector(
    req: TestConnectorRequest
  ): Promise<Result<TestConnectorResponse>> {
    return this.http.post(`/integration/connectors/${req.connectorId}/test`);
  }

  // 通知发送
  async sendNotification(
    req: SendNotificationRequest
  ): Promise<Result<SendNotificationResponse>> {
    return this.http.post('/integration/notify', req);
  }

  // 消息发布
  async publishMessage(
    req: PublishMessageRequest
  ): Promise<Result<PublishMessageResponse>> {
    return this.http.post('/integration/publish', req);
  }

  // 文件存储
  async uploadFile(
    req: UploadFileRequest
  ): Promise<Result<UploadFileResponse>> {
    // 特殊处理：multipart/form-data
    const formData = new FormData();
    formData.append('file', req.contentRef as Blob);
    formData.append('fileName', req.fileName);
    if (req.contentType) formData.append('contentType', req.contentType);
    if (req.targetPath) formData.append('targetPath', req.targetPath);

    return this.http.post(
      `/integration/files/upload?connectorId=${req.connectorId}`,
      formData
    );
  }

  async getFileDownloadUrl(
    req: GetFileDownloadUrlRequest
  ): Promise<Result<GetFileDownloadUrlResponse>> {
    return this.http.get('/integration/files/download-url', req);
  }
}
```

**验收标准**：

- [ ] 实现所有 `IntegrationClient` 接口方法
- [ ] 文件上传正确处理 multipart
- [ ] 单元测试覆盖率 ≥ 80%

---

### 3.9 SecurityClient（安全服务）

**开发内容**：

```typescript
// packages/sdk/src/modules/security/index.ts
export class SecurityClientImpl implements SecurityClient {
  constructor(private http: HttpClient) {}

  // 脱敏管理
  async listMaskingAlgorithms(req: {
    keyword?: string;
  }): Promise<Result<MaskingAlgorithm[]>> {
    return this.http.get('/security/masking/algorithms', req);
  }

  async createMaskingAlgorithm(
    req: CreateMaskingAlgorithmRequest
  ): Promise<Result<{ algorithmId: ID }>> {
    return this.http.post('/security/masking/algorithms', req);
  }

  async listMaskingRules(req: {
    keyword?: string;
  }): Promise<Result<MaskingRule[]>> {
    return this.http.get('/security/masking/rules', req);
  }

  async createMaskingRule(
    req: CreateMaskingRuleRequest
  ): Promise<Result<{ ruleId: ID }>> {
    return this.http.post('/security/masking/rules', req);
  }

  async listMaskingConfigs(req: {
    dataAssetId?: ID;
  }): Promise<Result<MaskingConfig[]>> {
    return this.http.get('/security/masking/configs', req);
  }

  async upsertMaskingConfig(
    req: UpsertMaskingConfigRequest
  ): Promise<Result<{ configId: ID }>> {
    return this.http.post('/security/masking/configs', req);
  }

  async runStaticMasking(req: {
    configId: ID;
  }): Promise<Result<{ success: boolean }>> {
    return this.http.post(`/security/masking/configs/${req.configId}/run`);
  }

  // 分级分类
  async setClassification(
    req: SetClassificationRequest
  ): Promise<Result<{ success: boolean }>> {
    return this.http.post('/security/classification', req);
  }

  async getClassification(req: {
    dataAssetId: ID;
  }): Promise<Result<SecurityClassification>> {
    return this.http.get('/security/classification', req);
  }

  async listClassificationLevels(): Promise<
    Result<ClassificationLevelDictItem[]>
  > {
    return this.http.get('/security/classification/levels');
  }

  async listClassificationCategories(): Promise<
    Result<ClassificationCategoryDictItem[]>
  > {
    return this.http.get('/security/classification/categories');
  }

  // 行级权限
  async listRowLevelPolicies(req: {
    roleId?: ID;
    dataAssetId?: ID;
  }): Promise<Result<RowLevelPolicy[]>> {
    return this.http.get('/security/row-level-policies', req);
  }

  async upsertRowLevelPolicy(
    req: UpsertRowLevelPolicyRequest
  ): Promise<Result<{ policyId: ID }>> {
    return this.http.post('/security/row-level-policies', req);
  }

  async deleteRowLevelPolicy(req: {
    policyId: ID;
  }): Promise<Result<{ success: boolean }>> {
    return this.http.delete(`/security/row-level-policies/${req.policyId}`);
  }

  // 水印任务
  async createWatermarkTask(
    req: CreateWatermarkTaskRequest
  ): Promise<Result<{ taskId: ID }>> {
    return this.http.post('/security/watermark/tasks', req);
  }

  async listWatermarkTasks(
    req: PageRequest
  ): Promise<Result<PageResult<WatermarkTask>>> {
    return this.http.get('/security/watermark/tasks', req);
  }

  async parseWatermark(req: {
    inputRef: string;
  }): Promise<Result<{ found: boolean; target?: string }>> {
    return this.http.post('/security/watermark/parse', req);
  }

  // 加密任务
  async createEncryptionTask(
    req: CreateEncryptionTaskRequest
  ): Promise<Result<{ taskId: ID }>> {
    return this.http.post('/security/encryption/tasks', req);
  }

  async runEncryptionTask(req: {
    taskId: ID;
  }): Promise<Result<{ success: boolean }>> {
    return this.http.post(`/security/encryption/tasks/${req.taskId}/run`);
  }

  // 生命周期
  async listLifecyclePolicies(req: {
    enabled?: boolean;
  }): Promise<Result<LifecyclePolicy[]>> {
    return this.http.get('/security/lifecycle/policies', req);
  }

  async configurePolicy(
    req: ConfigureLifecyclePolicyRequest
  ): Promise<Result<{ policyId: ID }>> {
    return this.http.post('/security/lifecycle/policies', req);
  }

  async archiveData(
    req: ArchiveDataRequest
  ): Promise<Result<{ archiveId: ID }>> {
    return this.http.post('/security/lifecycle/archive', req);
  }

  async restoreData(
    req: RestoreDataRequest
  ): Promise<Result<{ success: boolean }>> {
    return this.http.post('/security/lifecycle/restore', req);
  }

  async listArchiveRecords(
    req: ListArchiveRecordsRequest
  ): Promise<Result<PageResult<ArchiveRecord>>> {
    return this.http.get('/security/lifecycle/records', req);
  }

  async deleteExpiredData(
    req: DeleteExpiredDataRequest
  ): Promise<Result<{ dryRun: boolean; deletedCount: number }>> {
    return this.http.post('/security/lifecycle/expired', req);
  }

  async getLifecycleReport(
    req: GetLifecycleReportRequest
  ): Promise<Result<{ points: LifecycleReportPoint[] }>> {
    return this.http.get('/security/lifecycle/report', req);
  }
}
```

**验收标准**：

- [ ] 实现所有 `SecurityClient` 接口方法（20+）
- [ ] 脱敏/加密/生命周期各模块完整
- [ ] 单元测试覆盖率 ≥ 80%

---

## 四、SDK 开发波次

```
Wave 0: 基础设施（2天）
├── HTTP 客户端核心
├── 认证拦截器
├── 错误处理
└── 测试框架搭建

Wave 1: 核心服务 SDK（3天）
├── AuthClient
├── MetadataClient
└── DataClient

Wave 2: 业务服务 SDK（4天）
├── OpsClient
├── AdminClient
└── SharingClient（最大）

Wave 3: 扩展服务 SDK（3天）
├── AnalyticsClient
├── IntegrationClient
└── SecurityClient

Wave 4: 集成验收（2天）
├── SDK 集成测试
├── 类型完整性检查
├── 文档完善
└── npm 发布
```

---

## 五、验收标准

### 5.1 每个 Client 验收清单

| 验收项     | 标准                         | 验证方式                 |
| ---------- | ---------------------------- | ------------------------ |
| 接口完整性 | 实现 Contract 定义的所有方法 | TypeScript 编译通过      |
| 类型安全   | 所有参数/返回值有类型        | 无 `any` 类型            |
| 错误处理   | 统一返回 `Result<T>`         | 代码审查                 |
| 单元测试   | 覆盖率 ≥ 80%                 | `npm test -- --coverage` |
| 集成测试   | 对后端 Mock 服务调用成功     | E2E 测试                 |

### 5.2 SDK 整体验收

```bash
# 类型检查
npm run build:check

# 单元测试
npm test

# 覆盖率报告
npm run test:coverage

# 打包验证
npm run build

# 发布前检查
npm pack --dry-run
```

---

## 六、发布计划

### 6.1 版本策略

```
@ai-datahub/sdk@1.0.0-alpha.1   # Wave 1 完成后
@ai-datahub/sdk@1.0.0-alpha.2   # Wave 2 完成后
@ai-datahub/sdk@1.0.0-alpha.3   # Wave 3 完成后
@ai-datahub/sdk@1.0.0-beta.1    # 集成测试通过
@ai-datahub/sdk@1.0.0           # 正式发布
```

发布说明索引：

- alpha 发布公告：`doc/releases/sdk-1.0.0-alpha.3.md`
- beta 预发布公告：`doc/releases/sdk-1.0.0-beta.1.md`

### 6.2 发布检查清单

- [x] 所有单元测试通过
- [x] 类型定义与 `@ai-datahub/contract` 同步
- [ ] `package.json` 版本更新（由 changeset/version 驱动）
- [ ] CHANGELOG 更新（由 changeset/version 生成）
- [x] README 文档完整
- [ ] `npm publish` 执行成功

### 6.3 可直接执行的发布准备命令

```bash
# 一键准备（编译 + 测试 + pack dry-run + 生成 release note 模板）
npm run release:sdk:prepare

# 若要准备 beta 版本
npm run release:sdk:prepare:beta

# 单独检查包内容
npm run release:sdk:pack
```

### 6.4 正式发布步骤（可执行）

```bash
# Step 1: 生成 changeset（交互）
npm run change

# Step 2: 落版本号并更新 changelog
npm run version

# Step 3: 发布（推荐 workspace 统一发布）
npm run release

# Step 4（可选）: 仅发布 sdk 到指定 tag
npm run release:sdk:publish:alpha
# 或
npm run release:sdk:publish:beta
# 或
npm run release:sdk:publish:latest
```

### 6.5 产物位置

- 发布说明模板输出目录：`doc/releases/`
- 模板文件名：`sdk-<version>.md`

---

## 七、前端团队对接

### 7.1 安装使用

```bash
npm install @ai-datahub/sdk @ai-datahub/contract
```

### 7.2 快速示例

```typescript
import { createClient } from '@ai-datahub/sdk';

const api = createClient({
  baseUrl: '/api',
  getToken: () => localStorage.getItem('token'),
  onUnauthorized: () => {
    // 跳转登录页
    window.location.href = '/login';
  },
});

// 使用
async function loadDataSources() {
  const result = await api.metadata.listDataSources({ page: 1, pageSize: 20 });

  if (result.ok) {
    return result.data.items;
  } else {
    console.error(result.error.message);
    return [];
  }
}
```

---

## 相关文档

- 契约定义：`packages/contract/`
- 前端接入交付物：`doc/plans/2026-04-02-frontend-integration-deliverables.md`
- 领域服务计划：`doc/plans/2026-04-02-domain-services-plan.md`
- SDK alpha 发布说明：`doc/releases/sdk-1.0.0-alpha.3.md`
- SDK beta 预发布公告：`doc/releases/sdk-1.0.0-beta.1.md`
