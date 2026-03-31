# 阶段 3：`data-security` 模块 SDK 契约

## 1) 模块定位

- 数据安全防护：脱敏、分级分类、行级权限控制、水印、加密。

## 2) 依赖的共享实体

来自 `00-shared-entities.md`：

- `DataAsset`
- `ColumnMetadata`
- `User` / `Role`
- `RequestMeta`
- `Result<T>`

## 3) 错误码（本模块）

```ts
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
```

## 4) DTO 定义

```ts
import type {
  ID,
  ISODateTime,
  RequestMeta,
  Result,
} from './00-shared-entities';

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
```

## 5) 对外 SDK 接口（`DataSecurityClient`）

```ts
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
    page: { page: number; pageSize: number };
  }): Promise<
    Result<{
      page: number;
      pageSize: number;
      total: number;
      items: WatermarkTask[];
    }>
  >;
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
```

## 6) 幂等性要求

- `setClassification` / `upsertRowLevelPolicy`：幂等。\n- 创建类：默认非幂等，建议支持 `idempotencyKey`。\n- `parseWatermark`：幂等。\n- `encryptColumns`：非幂等（会产生新数据或覆盖），建议通过 `dryRun` 或“输出目标”策略控制（后续实现阶段细化）。

## 7) Mock 服务规则

- `createMaskingRule`\n - 默认：返回 `ruleId="mr_1"`\n- `upsertRowLevelPolicy`\n - 默认：返回 `policyId="rlp_1"`\n- `parseWatermark`\n - 默认：返回 `{ found: true, target: "demo-org" }`\n - 可模拟异常：`WATERMARK_PARSE_FAILED`
