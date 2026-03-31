# 阶段 3：`system-admin` 模块 SDK 契约

## 1) 模块定位

- 系统工具与运营管理类能力：函数管理、项目管理、驱动管理、操作日志、我的工单等。
- 不包含认证授权与审批框架（归属 `system-auth`）。

## 2) 依赖的共享实体

来自 `00-shared-entities.md`：

- `Project`
- `RequestMeta`
- `Result<T>`
- `PageRequest` / `PageResult<T>`

## 3) 错误码（本模块）

```ts
export type SystemAdminErrorCode =
  | 'INVALID_ARGUMENT'
  | 'PERMISSION_DENIED'
  | 'DUPLICATE_NAME'
  | 'PROJECT_NOT_FOUND'
  | 'PROJECT_GROUP_NOT_FOUND'
  | 'DRIVER_NOT_FOUND'
  | 'FUNCTION_NOT_FOUND'
  | 'PACKAGE_NOT_FOUND'
  | 'TICKET_NOT_FOUND';
```

## 4) DTO 定义

```ts
import type {
  ID,
  ISODateTime,
  PageRequest,
  PageResult,
  Project,
  RequestMeta,
  Result,
} from './00-shared-entities';

export type FunctionDef = {
  id: ID;
  category: string;
  name: string;
  description?: string;
  parameters: Array<{
    name: string;
    type: string;
    description?: string;
    required?: boolean;
  }>;
  implementationRef?: string;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};

export type DriverDef = {
  id: ID;
  name: string;
  version: string;
  // jar/package 存储引用，由实现层解释
  artifactRef: string;
  createdAt: ISODateTime;
};

export type PackageDef = {
  id: ID;
  name: string;
  version?: string;
  artifactRef: string;
  description?: string;
  createdAt: ISODateTime;
};

export type ProjectGroup = {
  id: ID;
  name: string;
  description?: string;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};

export type OperationLog = {
  id: ID;
  actorUserId: ID;
  action: string;
  target?: string;
  success: boolean;
  ip?: string;
  traceId?: string;
  createdAt: ISODateTime;
};

export type WorkTicketStatus = 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'CANCELED';

export type WorkTicket = {
  id: ID;
  title: string;
  description?: string;
  assigneeUserId: ID;
  status: WorkTicketStatus;
  resolution?: string;
  attachmentsRef?: string[];
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};

export type UpdateWorkTicketRequest = {
  meta?: RequestMeta;
  ticketId: ID;
  status?: WorkTicketStatus;
  resolution?: string;
};
```

## 5) 对外 SDK 接口（`SystemAdminClient`）

```ts
export interface SystemAdminClient {
  // Project
  createProject(req: {
    meta?: RequestMeta;
    project: Omit<Project, 'id'>;
  }): Promise<Result<{ projectId: ID }>>;
  updateProject(req: {
    meta?: RequestMeta;
    project: Project;
  }): Promise<Result<{ success: boolean }>>;
  deleteProject(req: {
    meta?: RequestMeta;
    projectId: ID;
  }): Promise<Result<{ success: boolean }>>;
  listProjects(req: {
    meta?: RequestMeta;
    orgId?: ID;
    keyword?: string;
    page: PageRequest;
  }): Promise<Result<PageResult<Project>>>;
  getProject(req: {
    meta?: RequestMeta;
    projectId: ID;
  }): Promise<Result<Project>>;

  // Project groups
  createProjectGroup(req: {
    meta?: RequestMeta;
    group: Omit<ProjectGroup, 'id' | 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ groupId: ID }>>;
  updateProjectGroup(req: {
    meta?: RequestMeta;
    group: Omit<ProjectGroup, 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ success: boolean }>>;
  deleteProjectGroup(req: {
    meta?: RequestMeta;
    groupId: ID;
  }): Promise<Result<{ success: boolean }>>;
  listProjectGroups(req: {
    meta?: RequestMeta;
    orgId?: ID;
    keyword?: string;
    page: PageRequest;
  }): Promise<Result<PageResult<ProjectGroup>>>;
  bindProjectsToGroup(req: {
    meta?: RequestMeta;
    groupId: ID;
    projectIds: ID[];
  }): Promise<Result<{ success: boolean }>>;
  bindUsersToGroup(req: {
    meta?: RequestMeta;
    groupId: ID;
    userIds: ID[];
  }): Promise<Result<{ success: boolean }>>;

  // Functions
  listFunctions(req: {
    meta?: RequestMeta;
    keyword?: string;
    page: PageRequest;
  }): Promise<Result<PageResult<FunctionDef>>>;
  getFunction(req: {
    meta?: RequestMeta;
    functionId: ID;
  }): Promise<Result<FunctionDef>>;
  createFunction(req: {
    meta?: RequestMeta;
    func: Omit<FunctionDef, 'id' | 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ functionId: ID }>>;
  updateFunction(req: {
    meta?: RequestMeta;
    func: Omit<FunctionDef, 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ success: boolean }>>;
  deleteFunction(req: {
    meta?: RequestMeta;
    functionId: ID;
  }): Promise<Result<{ success: boolean }>>;

  // Custom packages
  listPackages(req: {
    meta?: RequestMeta;
    keyword?: string;
    page: PageRequest;
  }): Promise<Result<PageResult<PackageDef>>>;
  createPackage(req: {
    meta?: RequestMeta;
    pkg: Omit<PackageDef, 'id' | 'createdAt'>;
  }): Promise<Result<{ packageId: ID }>>;
  deletePackage(req: {
    meta?: RequestMeta;
    packageId: ID;
  }): Promise<Result<{ success: boolean }>>;

  // Drivers
  listDrivers(req: {
    meta?: RequestMeta;
    page: PageRequest;
  }): Promise<Result<PageResult<DriverDef>>>;
  createDriver(req: {
    meta?: RequestMeta;
    driver: Omit<DriverDef, 'id' | 'createdAt'>;
  }): Promise<Result<{ driverId: ID }>>;
  deleteDriver(req: {
    meta?: RequestMeta;
    driverId: ID;
  }): Promise<Result<{ success: boolean }>>;

  // Operation logs
  listOperationLogs(req: {
    meta?: RequestMeta;
    actorUserId?: ID;
    page: PageRequest;
  }): Promise<Result<PageResult<OperationLog>>>;

  // Tickets
  listMyTickets(req: {
    meta?: RequestMeta;
    assigneeUserId: ID;
    page: PageRequest;
  }): Promise<Result<PageResult<WorkTicket>>>;
  getWorkTicket(req: {
    meta?: RequestMeta;
    ticketId: ID;
  }): Promise<Result<WorkTicket>>;
  updateWorkTicket(
    req: UpdateWorkTicketRequest
  ): Promise<Result<{ success: boolean }>>;
}
```

## 6) 幂等性要求

- `updateProject` / `deleteProject` / `updateFunction` / `deleteFunction` / `updateWorkTicket`：幂等。\n- 绑定关系类（bind）：幂等（同集合重复提交结果一致）。\n- 查询类：幂等。\n- 创建类：默认非幂等，建议支持 `idempotencyKey`。

## 7) Mock 服务规则

- `listProjects`\n - 默认：返回 5 个项目\n- `listOperationLogs`\n - 默认：返回 10 条日志\n- `listMyTickets`\n - 默认：返回 3 条工单\n - 可模拟异常：`PERMISSION_DENIED`

- `createFunction`\n - 默认：返回 `functionId="fn_1"`\n - 可模拟异常：`DUPLICATE_NAME`\n- `createDriver`\n - 默认：返回 `driverId="drv_1"`\n - 可模拟异常：`INVALID_ARGUMENT`\n- `updateWorkTicket`\n - 默认：返回 `{ success: true }`\n - 可模拟异常：`TICKET_NOT_FOUND`
