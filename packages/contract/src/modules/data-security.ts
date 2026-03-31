import type {
  ID,
  ISODateTime,
  PageRequest,
  PageResult,
  RequestMeta,
  Result,
} from '../types';

export type DataSecurityErrorCode =
  | 'INVALID_ARGUMENT'
  | 'PERMISSION_DENIED'
  | 'ASSET_NOT_FOUND'
  | 'RULE_NOT_FOUND'
  | 'ALGORITHM_NOT_FOUND'
  | 'CLASSIFICATION_NOT_FOUND'
  | 'ROW_LEVEL_POLICY_NOT_FOUND'
  | 'WATERMARK_PARSE_FAILED'
  | 'WATERMARK_TASK_NOT_FOUND'
  | 'ENCRYPTION_TASK_NOT_FOUND'
  | 'ENCRYPTION_FAILED';

export type MaskingAlgorithm = {
  id: ID;
  name: string;
  type: 'HASH' | 'REDACT' | 'CUSTOM';
  config: Record<string, unknown>;
  createdAt: ISODateTime;
};

export type MaskingRule = {
  id: ID;
  name: string;
  pattern: string;
  algorithmId: ID;
  createdAt: ISODateTime;
};

export type MaskingConfigMode = 'STATIC' | 'DYNAMIC';

export type MaskingConfig = {
  id: ID;
  dataAssetId: ID;
  columnName: string;
  ruleId: ID;
  mode: MaskingConfigMode;
  schedule?: string; // 静态脱敏调度
  enabled: boolean;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};

export type SecurityClassification = {
  id: ID;
  level: number;
  category: string;
  reason?: string;
};

export type ClassificationLevelDictItem = {
  level: number;
  name: string;
  description?: string;
};
export type ClassificationCategoryDictItem = {
  category: string;
  name: string;
  level: number;
  basis?: string;
  remark?: string;
};

export type RowLevelPolicy = {
  id: ID;
  roleId: ID;
  dataAssetId: ID;
  // 表达式语法由实现层解释（例如 SQL predicate）
  filterExpression: string;
  createdAt: ISODateTime;
};

export type WatermarkTask = {
  id: ID;
  type: 'HIDDEN' | 'FAKE_ROW' | 'FAKE_COL';
  target: string; // 接收单位/标识
  density?: number;
  outputRef?: string;
  createdAt: ISODateTime;
};

export type EncryptionTask = {
  id: ID;
  type: 'ENCRYPT' | 'DECRYPT';
  dataAssetId: ID;
  columns: string[];
  algorithm: string;
  keyRef?: string;
  outputRef?: string;
  createdAt: ISODateTime;
};

export interface DataSecurityClient {
  // 脱敏
  createMaskingAlgorithm(req: {
    meta?: RequestMeta;
    algorithm: Omit<MaskingAlgorithm, 'id' | 'createdAt'>;
  }): Promise<Result<{ algorithmId: ID }>>;
  listMaskingAlgorithms(req: {
    meta?: RequestMeta;
    keyword?: string;
  }): Promise<Result<MaskingAlgorithm[]>>;
  createMaskingRule(req: {
    meta?: RequestMeta;
    rule: Omit<MaskingRule, 'id' | 'createdAt'>;
  }): Promise<Result<{ ruleId: ID }>>;
  listMaskingRules(req: {
    meta?: RequestMeta;
    keyword?: string;
  }): Promise<Result<MaskingRule[]>>;

  upsertMaskingConfig(req: {
    meta?: RequestMeta;
    config: Omit<MaskingConfig, 'createdAt' | 'updatedAt'> & { id?: ID };
  }): Promise<Result<{ configId: ID }>>;
  listMaskingConfigs(req: {
    meta?: RequestMeta;
    dataAssetId?: ID;
  }): Promise<Result<MaskingConfig[]>>;
  runStaticMasking(req: {
    meta?: RequestMeta;
    configId: ID;
  }): Promise<Result<{ success: boolean }>>;

  // 分级分类
  setClassification(req: {
    meta?: RequestMeta;
    dataAssetId: ID;
    classification: SecurityClassification;
  }): Promise<Result<{ success: boolean }>>;
  getClassification(req: {
    meta?: RequestMeta;
    dataAssetId: ID;
  }): Promise<Result<SecurityClassification>>;
  listClassificationLevels(req: {
    meta?: RequestMeta;
  }): Promise<Result<ClassificationLevelDictItem[]>>;
  listClassificationCategories(req: {
    meta?: RequestMeta;
  }): Promise<Result<ClassificationCategoryDictItem[]>>;

  // 行级权限
  upsertRowLevelPolicy(req: {
    meta?: RequestMeta;
    policy: Omit<RowLevelPolicy, 'id' | 'createdAt'> & { id?: ID };
  }): Promise<Result<{ policyId: ID }>>;
  deleteRowLevelPolicy(req: {
    meta?: RequestMeta;
    policyId: ID;
  }): Promise<Result<{ success: boolean }>>;
  listRowLevelPolicies(req: {
    meta?: RequestMeta;
    roleId?: ID;
    dataAssetId?: ID;
  }): Promise<Result<RowLevelPolicy[]>>;

  // 水印
  createWatermarkTask(req: {
    meta?: RequestMeta;
    task: Omit<WatermarkTask, 'id' | 'createdAt'>;
  }): Promise<Result<{ taskId: ID }>>;
  getWatermarkTask(req: {
    meta?: RequestMeta;
    taskId: ID;
  }): Promise<Result<WatermarkTask>>;
  listWatermarkTasks(req: {
    meta?: RequestMeta;
    page: PageRequest;
  }): Promise<Result<PageResult<WatermarkTask>>>;
  parseWatermark(req: {
    meta?: RequestMeta;
    inputRef: string;
  }): Promise<Result<{ found: boolean; target?: string }>>;

  // 加密
  createEncryptionTask(req: {
    meta?: RequestMeta;
    task: Omit<EncryptionTask, 'id' | 'createdAt'>;
  }): Promise<Result<{ taskId: ID }>>;
  getEncryptionTask(req: {
    meta?: RequestMeta;
    taskId: ID;
  }): Promise<Result<EncryptionTask>>;
  runEncryptionTask(req: {
    meta?: RequestMeta;
    taskId: ID;
  }): Promise<Result<{ success: boolean }>>;
}
