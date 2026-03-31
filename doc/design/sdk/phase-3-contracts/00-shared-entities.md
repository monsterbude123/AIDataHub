# 阶段 3：共享实体与通用契约（跨模块）

本文件定义跨模块共享实体与通用契约规则，确保全平台术语统一、接口风格统一、便于 Mock 与并行开发。

## 0. 契约总则（TypeScript / npm 生态）

### 0.1 SDK 形态

- SDK 以 TypeScript 类型与接口表达，不绑定具体网络协议实现。
- 每个模块对外暴露：
  - `*Client`：对外 SDK 客户端接口（方法列表）
  - `DTO`：入参/出参结构（请求/响应）
  - `Mock`：Mock 行为规则（在模块契约文件中定义）

### 0.2 通用类型

```ts
export type ID = string;
export type ISODateTime = string; // e.g. "2026-03-30T12:34:56.789Z"

export type PageRequest = {
  page: number; // 1-based
  pageSize: number; // 1..N
};

export type PageResult<T> = {
  page: number;
  pageSize: number;
  total: number;
  items: T[];
};
```

### 0.3 统一错误模型（禁止静默异常）

所有 SDK 方法 **必须**以“显式错误”方式返回（建议使用 `Result<T>`），不得吞掉错误。

```ts
export type ErrorLevel = 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';

export type ErrorDetail = {
  field?: string;
  reason?: string;
  hint?: string;
};

export type SdkError = {
  code: string; // 例如 "DATA_SOURCE_NAME_DUPLICATE"
  message: string;
  level: ErrorLevel;
  details?: ErrorDetail[];
  traceId?: string;
};

export type Result<T> =
  | { ok: true; data: T; traceId?: string }
  | { ok: false; error: SdkError; traceId?: string };
```

### 0.4 幂等与请求追踪（并行联调关键）

- 所有“创建/提交/触发执行类”接口建议支持 `idempotencyKey`（同一调用方在一定时间窗口内重复提交不产生重复副作用）。
- 所有接口建议接受 `traceId`（或由实现层生成并回传），用于端到端排障。

```ts
export type RequestMeta = {
  traceId?: string;
  idempotencyKey?: string;
  requestTime?: ISODateTime;
};
```

### 0.5 版本兼容（字段层面）

- 共享实体允许新增字段（可选），旧客户端必须“忽略未知字段”。
- 共享实体禁止：
  - 删除既有字段（先废弃再移除，见附录规则）
  - 修改字段类型或语义（必须新增字段或新增接口）

---

## 1. 共享实体定义（全平台统一术语）

> 说明：为适配多存储/多引擎，本处以“逻辑模型”为准，物理实现可由各模块自行映射。

### 1.1 `User`（用户）

```ts
export type UserStatus = 'ENABLED' | 'DISABLED';

export type User = {
  id: ID;
  username: string;
  realName?: string;
  orgId: ID;
  phone?: string;
  email?: string;
  level?: number; // 安全分级
  status: UserStatus;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};
```

### 1.2 `Organization`（组织机构）

```ts
export type OrganizationStatus = 'ENABLED' | 'DISABLED';

export type Organization = {
  id: ID;
  name: string;
  code: string;
  parentId?: ID;
  sort?: number;
  status: OrganizationStatus;
};
```

### 1.3 `Role`（角色）

```ts
export type Role = {
  id: ID;
  name: string;
  code: string;
  description?: string;
  permissions: string[];
};
```

### 1.4 `Project`（项目）

```ts
export type ProjectStatus = 'ENABLED' | 'DISABLED';

export type Project = {
  id: ID;
  name: string;
  code: string;
  orgId: ID;
  description?: string;
  status: ProjectStatus;
};
```

### 1.5 `DataSource`（数据源）

```ts
export type DataSourceType =
  | 'JDBC'
  | 'HIVE'
  | 'ELASTICSEARCH'
  | 'FILE'
  | 'OBJECT_STORAGE'
  | 'CUSTOM';

export type DataSourceStatus = 'ENABLED' | 'DISABLED';

export type DataSource = {
  id: ID;
  name: string;
  type: DataSourceType;

  // JDBC/连接类数据源
  jdbcUrl?: string;
  username?: string;
  passwordRef?: string; // 仅引用，不在 SDK 中明文传输密码
  driverClass?: string;

  orgId: ID;
  projectId?: ID;
  description?: string;
  status: DataSourceStatus;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};
```

### 1.6 `DataAsset`（数据资产）

```ts
export type DataAssetType = 'TABLE' | 'VIEW' | 'SQL' | 'FILE';
export type DataLayer = 'BUSINESS' | 'RAW' | 'RESOURCE' | 'THEME' | 'UNKNOWN';

export type DataAsset = {
  id: ID;
  name: string;
  code: string;
  dataSourceId: ID;
  type: DataAssetType;
  layer: DataLayer;
  description?: string;
  ownerId?: ID;
  securityLevel?: number;
  securityCategory?: string;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};
```

### 1.7 `ColumnMetadata`（字段元数据）

```ts
export type ColumnMetadata = {
  id: ID;
  dataAssetId: ID;
  name: string;
  code?: string;
  dataType: string;
  precision?: number;
  scale?: number;
  description?: string;
  isPrimaryKey?: boolean;
  standardDataElementId?: ID;
  dictionaryId?: ID;
};
```

### 1.8 `Task`（任务）与 `TaskExecution`（执行记录）

```ts
export type TaskStatus = 'READY' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'STOPPED';
export type TriggerType = 'SCHEDULED' | 'MANUAL' | 'DEPENDENCY' | 'EVENT';

export type Task = {
  id: ID;
  name: string;
  module: string; // 归属模块，例如 "data-integration"
  type: string; // 模块内任务类型，例如 "profiling"
  creatorId: ID;
  schedule?: string; // cron 或其他表达式
  status: TaskStatus;
  priority?: number;
  config: Record<string, unknown>;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};

export type TaskExecution = {
  id: ID;
  taskId: ID;
  status: TaskStatus;
  triggerType: TriggerType;
  startedAt?: ISODateTime;
  endedAt?: ISODateTime;
  durationMs?: number;
  rowsProcessed?: number;
  errorMessage?: string;
  logsRef?: string; // 日志引用
};
```

### 1.9 `Approval`（审批单）

```ts
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELED';

export type Approval = {
  id: ID;
  businessType: string;
  businessId: ID;
  title: string;
  applicantId: ID;
  currentNode?: number;
  status: ApprovalStatus;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};
```
