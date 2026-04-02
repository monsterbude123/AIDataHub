import type {
  ID,
  ISODateTime,
  PageRequest,
  PageResult,
  RequestMeta,
  Result,
  TaskExecution,
} from '../types';

export type DataOperationsErrorCode =
  | 'INVALID_ARGUMENT'
  | 'PERMISSION_DENIED'
  | 'NOTIFICATION_CHANNEL_NOT_CONFIGURED'
  | 'ALERT_RULE_NOT_FOUND'
  | 'EXECUTION_NOT_FOUND'
  | 'DATA_SOURCE_NOT_FOUND'
  | 'ETL_CONNECTION_NOT_FOUND'
  | 'DATASET_SYNC_NOT_FOUND';

export type AlertChannel = 'EMAIL' | 'SMS' | 'DINGTALK' | 'WECHAT_WORK';

export type AlertChannelConfig = {
  channel: AlertChannel;
  enabled: boolean;
  // 例如：smtpRef / smsProviderRef / webhookRef 等，由实现层解释
  config: Record<string, unknown>;
  updatedAt: ISODateTime;
};

export type AlertRule = {
  id: ID;
  name: string;
  type: 'TIMEOUT' | 'INCREMENT_ANOMALY' | 'SCHEDULE_TIMEOUT';
  enabled: boolean;
  channels: AlertChannel[];
  config: Record<string, unknown>;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};

export type CreateAlertRuleRequest = {
  meta?: RequestMeta;
  rule: Omit<AlertRule, 'id' | 'createdAt' | 'updatedAt'>;
};
export type UpdateAlertRuleRequest = {
  meta?: RequestMeta;
  rule: Omit<AlertRule, 'createdAt' | 'updatedAt'>;
};

export type ListExecutionsForOpsRequest = {
  meta?: RequestMeta;
  keyword?: string;
  status?: string;
  page: PageRequest;
};

export type ReRunExecutionRequest = { meta?: RequestMeta; executionId: ID };
export type ReRunExecutionResponse = { newExecutionId: ID };

export type GetExecutionForOpsRequest = { meta?: RequestMeta; executionId: ID };

export type ReconcileDataRequest = {
  meta?: RequestMeta;
  sourceAssetId: ID;
  targetAssetId: ID;
  // 对账策略由实现层解释
  config?: Record<string, unknown>;
};

export type ReconcileDataResponse = {
  success: boolean;
  diffCount?: number;
  checkedAt: ISODateTime;
};

export type ExecutorStrategy = {
  memoryMb?: number;
  cores?: number;
  // 引擎/队列/资源隔离键等
  config?: Record<string, unknown>;
};

export type SetExecutorStrategyRequest = {
  meta?: RequestMeta;
  // 可以按“任务定义”或“运行执行”维度设置，契约层允许二选一
  taskId?: ID;
  executionId?: ID;
  strategy: ExecutorStrategy;
};

export type RetryPolicy = {
  enabled: boolean;
  // 实现层可按错误类型分类重试，这里仅保留可扩展结构
  maxAttempts?: number;
  backoffMs?: number;
  errorTypeRules?: Record<string, { maxAttempts?: number; backoffMs?: number }>;
};

export type SetRetryPolicyRequest = {
  meta?: RequestMeta;
  taskId?: ID;
  executionId?: ID;
  policy: RetryPolicy;
};

export type OfflineJobRequest = {
  meta?: RequestMeta;
  taskId?: ID;
  executionId?: ID;
  reason?: string;
};

export type SetJobPriorityRequest = {
  meta?: RequestMeta;
  taskId?: ID;
  executionId?: ID;
  priority: number;
};

export type OpsReportPoint = { time: ISODateTime; value: number };

export type OpsReport = {
  successRate?: number;
  totalExecutions?: number;
  failedExecutions?: number;
  byType?: Array<{ type: string; count: number }>;
  trend?: OpsReportPoint[];
  generatedAt: ISODateTime;
};

export type GetOpsReportRequest = {
  meta?: RequestMeta;
  startAt: ISODateTime;
  endAt: ISODateTime;
  module?: string;
};

export type DataSourceHealthStatus = 'HEALTHY' | 'UNHEALTHY' | 'UNKNOWN';

export type DataSourceHealth = {
  dataSourceId: ID;
  status: DataSourceHealthStatus;
  message?: string;
  checkedAt: ISODateTime;
};

export type ListDataSourceHealthRequest = {
  meta?: RequestMeta;
  orgId?: ID;
  page: PageRequest;
};

export type EtlConnection = {
  id: ID;
  name: string;
  // 实现层连接信息引用（避免在 SDK 明文存储）
  connectionRef: string;
  status?: 'ENABLED' | 'DISABLED';
  lastCheckedAt?: ISODateTime;
  lastErrorMessage?: string;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};

export type CreateEtlConnectionRequest = {
  meta?: RequestMeta;
  connection: Omit<EtlConnection, 'id' | 'createdAt' | 'updatedAt'>;
};
export type UpdateEtlConnectionRequest = {
  meta?: RequestMeta;
  connection: Omit<EtlConnection, 'createdAt' | 'updatedAt'>;
};

export type DatasetSyncStatus = 'OK' | 'OUT_OF_SYNC' | 'ERROR';

export type DatasetSyncRecord = {
  id: ID;
  dataAssetId: ID;
  status: DatasetSyncStatus;
  currentVersion?: string;
  targetVersion?: string;
  lastSyncAt?: ISODateTime;
  message?: string;
};

export type ListDatasetSyncRecordsRequest = {
  meta?: RequestMeta;
  dataSourceId?: ID;
  status?: DatasetSyncStatus;
  page: PageRequest;
};

export type CompareDatasetVersionRequest = { meta?: RequestMeta; recordId: ID };
export type PublishDatasetVersionRequest = {
  meta?: RequestMeta;
  recordId: ID;
  action: 'PUBLISH' | 'ROLLBACK';
};

export interface DataOperationsClient {
  // Alerts
  createAlertRule(req: CreateAlertRuleRequest): Promise<Result<{ ruleId: ID }>>;
  updateAlertRule(
    req: UpdateAlertRuleRequest
  ): Promise<Result<{ success: boolean }>>;
  listAlertRules(req: { meta?: RequestMeta }): Promise<Result<AlertRule[]>>;
  searchAlertRules(
    req: SearchAlertRulesRequest
  ): Promise<Result<PageResult<AlertRule>>>;
  listAlertChannelConfigs(req: {
    meta?: RequestMeta;
  }): Promise<Result<AlertChannelConfig[]>>;
  upsertAlertChannelConfig(req: {
    meta?: RequestMeta;
    config: Omit<AlertChannelConfig, 'updatedAt'>;
  }): Promise<Result<{ success: boolean }>>;

  // Executions ops
  listExecutions(
    req: ListExecutionsForOpsRequest
  ): Promise<Result<PageResult<TaskExecution>>>;
  getExecution(req: GetExecutionForOpsRequest): Promise<Result<TaskExecution>>;
  reRunExecution(
    req: ReRunExecutionRequest
  ): Promise<Result<ReRunExecutionResponse>>;

  // Reconciliation
  reconcileData(
    req: ReconcileDataRequest
  ): Promise<Result<ReconcileDataResponse>>;

  // Execution tuning / policies
  setExecutorStrategy(
    req: SetExecutorStrategyRequest
  ): Promise<Result<{ success: boolean }>>;
  setRetryPolicy(
    req: SetRetryPolicyRequest
  ): Promise<Result<{ success: boolean }>>;
  offlineJob(req: OfflineJobRequest): Promise<Result<{ success: boolean }>>;
  setJobPriority(
    req: SetJobPriorityRequest
  ): Promise<Result<{ success: boolean }>>;

  // Reports
  getOpsReport(req: GetOpsReportRequest): Promise<Result<OpsReport>>;

  // Data source health
  listDataSourceHealth(
    req: ListDataSourceHealthRequest
  ): Promise<Result<PageResult<DataSourceHealth>>>;

  // ETL connections
  createEtlConnection(
    req: CreateEtlConnectionRequest
  ): Promise<Result<{ connectionId: ID }>>;
  updateEtlConnection(
    req: UpdateEtlConnectionRequest
  ): Promise<Result<{ success: boolean }>>;
  deleteEtlConnection(req: {
    meta?: RequestMeta;
    connectionId: ID;
  }): Promise<Result<{ success: boolean }>>;
  listEtlConnections(req: {
    meta?: RequestMeta;
    keyword?: string;
    page: PageRequest;
  }): Promise<Result<PageResult<EtlConnection>>>;

  // Dataset sync monitor
  listDatasetSyncRecords(
    req: ListDatasetSyncRecordsRequest
  ): Promise<Result<PageResult<DatasetSyncRecord>>>;
  compareDatasetVersion(
    req: CompareDatasetVersionRequest
  ): Promise<
    Result<{ diffs: Array<{ field: string; left?: unknown; right?: unknown }> }>
  >;
  publishDatasetVersion(
    req: PublishDatasetVersionRequest
  ): Promise<Result<{ success: boolean }>>;
}

export type SearchAlertRulesRequest = {
  meta?: RequestMeta;
  keyword?: string;
  enabled?: boolean;
  type?: AlertRule['type'];
  page: PageRequest;
};
