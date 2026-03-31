export type ID = string;
export type ISODateTime = string;

export type PageRequest = {
  page: number; // 1-based
  pageSize: number;
};

export type PageResult<T> = {
  page: number;
  pageSize: number;
  total: number;
  items: T[];
};

export type ErrorLevel = 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';

export type ErrorDetail = {
  field?: string;
  reason?: string;
  hint?: string;
};

export type SdkError = {
  code: string;
  message: string;
  level: ErrorLevel;
  details?: ErrorDetail[];
  traceId?: string;
};

export type Result<T> =
  | { ok: true; data: T; traceId?: string }
  | { ok: false; error: SdkError; traceId?: string };

export type RequestMeta = {
  traceId?: string;
  idempotencyKey?: string;
  requestTime?: ISODateTime;
};

export type UserStatus = 'ENABLED' | 'DISABLED';
export type User = {
  id: ID;
  username: string;
  realName?: string;
  orgId: ID;
  phone?: string;
  email?: string;
  level?: number;
  status: UserStatus;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};

export type OrganizationStatus = 'ENABLED' | 'DISABLED';
export type Organization = {
  id: ID;
  name: string;
  code: string;
  parentId?: ID;
  sort?: number;
  status: OrganizationStatus;
};

export type Role = {
  id: ID;
  name: string;
  code: string;
  description?: string;
  permissions: string[];
};

export type ProjectStatus = 'ENABLED' | 'DISABLED';
export type Project = {
  id: ID;
  name: string;
  code: string;
  orgId: ID;
  description?: string;
  status: ProjectStatus;
};

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
  jdbcUrl?: string;
  username?: string;
  passwordRef?: string;
  driverClass?: string;
  orgId: ID;
  projectId?: ID;
  description?: string;
  status: DataSourceStatus;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};

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

export type TaskStatus = 'READY' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'STOPPED';
export type TriggerType = 'SCHEDULED' | 'MANUAL' | 'DEPENDENCY' | 'EVENT';

export type Task = {
  id: ID;
  name: string;
  module: string;
  type: string;
  creatorId: ID;
  schedule?: string;
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
  logsRef?: string;
};

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
