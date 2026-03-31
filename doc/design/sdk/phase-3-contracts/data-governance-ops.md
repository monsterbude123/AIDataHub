# 阶段 3：`data-governance-ops` 模块 SDK 契约

## 1) 模块定位

- 数据治理运行操作：质量管理闭环（规则/任务/报告/工单）、标签运行（规则/任务/查询）、血缘采集与影响分析等。

## 2) 依赖的共享实体

来自 `00-shared-entities.md`：

- `DataAsset`
- `Task` / `TaskExecution`
- `RequestMeta`
- `Result<T>`
- `PageRequest` / `PageResult<T>`

## 3) 错误码（本模块）

```ts
export type GovernanceOpsErrorCode =
  | 'INVALID_ARGUMENT'
  | 'PERMISSION_DENIED'
  | 'QUALITY_RULE_NOT_FOUND'
  | 'QUALITY_TASK_NOT_FOUND'
  | 'QUALITY_REPORT_NOT_FOUND'
  | 'QUALITY_TICKET_NOT_FOUND'
  | 'QUALITY_APPROVAL_REQUIRED'
  | 'TAG_NOT_FOUND'
  | 'TAG_RULE_NOT_FOUND'
  | 'TAG_TASK_NOT_FOUND'
  | 'TAG_SUBJECT_NOT_FOUND'
  | 'LINEAGE_NOT_FOUND'
  | 'IMPACT_ANALYSIS_FAILED'
  | 'COLLECTION_FAILED';
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
  TaskExecution,
} from './00-shared-entities';

export type QualityRule = {
  id: ID;
  name: string;
  type: 'CONSISTENCY' | 'ACCURACY' | 'COMPLETENESS' | 'STANDARD' | 'RELATION';
  definition: Record<string, unknown>;
  enabled: boolean;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};

export type QualityApprovalSwitch = {
  // true=开启审批（新增规则/任务需审批）；false=关闭审批
  ruleApprovalEnabled: boolean;
  taskApprovalEnabled: boolean;
  updatedAt: ISODateTime;
};

export type QualityTask = {
  id: ID;
  name: string;
  dataAssetId: ID;
  ruleIds: ID[];
  schedule?: string;
  enabled: boolean;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};

export type QualityIssue = {
  id: ID;
  taskId: ID;
  ruleId: ID;
  dataAssetId: ID;
  // 问题数据定位信息（行号/主键/字段等由实现层决定）
  locator?: Record<string, unknown>;
  description?: string;
  createdAt: ISODateTime;
};

export type QualityReport = {
  id: ID;
  taskId: ID;
  executionId: ID;
  summary: {
    totalRecords?: number;
    problemRecords?: number;
    problemRatio?: number;
  };
  issuesSample?: QualityIssue[];
  suggestions?: string[];
  generatedAt: ISODateTime;
};

export type QualityTicketStatus = 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'CANCELED';

export type QualityTicket = {
  id: ID;
  reportId: ID;
  title: string;
  description?: string;
  assigneeUserId: ID;
  status: QualityTicketStatus;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};

export type Tag = {
  id: ID;
  code: string;
  name: string;
  level?: number;
  description?: string;
  createdAt: ISODateTime;
};

export type TagCategoryNode = {
  id: ID;
  parentId?: ID;
  name: string;
  code: string;
  sort?: number;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};

export type TagRule = {
  id: ID;
  tagId: ID;
  sourceType: 'DATA_ASSET' | 'SQL';
  // 当 sourceType=DATA_ASSET 时，指定资产范围；当 SQL 时由 sql 提取
  dataAssetIds?: ID[];
  sql?: string;
  mode: 'FULL' | 'INCREMENTAL';
  config?: Record<string, unknown>;
  enabled: boolean;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};

export type TagTask = {
  id: ID;
  name: string;
  tagId: ID;
  ruleIds: ID[];
  schedule?: string;
  enabled: boolean;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};

export type TagSubject = {
  id: ID;
  // 主体可以是人员/组织/资产等，先抽象为可扩展结构
  type: 'PERSON' | 'ORG' | 'ASSET' | 'CUSTOM';
  externalId: string;
  name?: string;
  attributes?: Record<string, unknown>;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};

export type TagQueryOperator = 'INTERSECT' | 'UNION';

export type TagQuery = {
  operator: TagQueryOperator;
  tagIds: ID[];
  // 可选：限定主体类型
  subjectType?: TagSubject['type'];
};

export type TagQueryResultItem = {
  subjectId: ID;
  subjectType: TagSubject['type'];
  externalId: string;
  name?: string;
};

export type LineageGraph = {
  nodes: Array<{ id: ID; name: string; type: 'TABLE' | 'TASK' | 'SERVICE' }>;
  edges: Array<{ from: ID; to: ID; type: 'READS' | 'WRITES' | 'DERIVES' }>;
};

export type ImpactAnalysisItem = {
  id: ID;
  type: 'TABLE' | 'TASK' | 'SERVICE' | 'REPORT' | 'INDICATOR';
  name: string;
  reason?: string;
};
```

## 5) 对外 SDK 接口（`DataGovernanceOpsClient`）

```ts
export interface DataGovernanceOpsClient {
  // -------------------------
  // 质量管理（规则/任务/报告/工单/统计）
  // -------------------------
  getQualityApprovalSwitch(req: {
    meta?: RequestMeta;
  }): Promise<Result<QualityApprovalSwitch>>;
  setQualityApprovalSwitch(req: {
    meta?: RequestMeta;
    ruleApprovalEnabled?: boolean;
    taskApprovalEnabled?: boolean;
  }): Promise<Result<{ success: boolean }>>;

  // 质量
  createQualityRule(req: {
    meta?: RequestMeta;
    rule: Omit<QualityRule, 'id' | 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ ruleId: ID }>>;
  updateQualityRule(req: {
    meta?: RequestMeta;
    rule: Omit<QualityRule, 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ success: boolean }>>;
  deleteQualityRule(req: {
    meta?: RequestMeta;
    ruleId: ID;
  }): Promise<Result<{ success: boolean }>>;
  listQualityRules(req: {
    meta?: RequestMeta;
    keyword?: string;
    page: PageRequest;
  }): Promise<Result<PageResult<QualityRule>>>;

  createQualityTask(req: {
    meta?: RequestMeta;
    task: Omit<QualityTask, 'id' | 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ taskId: ID }>>;
  updateQualityTask(req: {
    meta?: RequestMeta;
    task: Omit<QualityTask, 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ success: boolean }>>;
  deleteQualityTask(req: {
    meta?: RequestMeta;
    taskId: ID;
  }): Promise<Result<{ success: boolean }>>;
  runQualityTask(req: {
    meta?: RequestMeta;
    taskId: ID;
  }): Promise<Result<{ executionId: ID }>>;
  listQualityTasks(req: {
    meta?: RequestMeta;
    page: PageRequest;
  }): Promise<Result<PageResult<QualityTask>>>;

  getQualityReport(req: {
    meta?: RequestMeta;
    reportId: ID;
  }): Promise<Result<QualityReport>>;
  listQualityReports(req: {
    meta?: RequestMeta;
    taskId?: ID;
    page: PageRequest;
  }): Promise<Result<PageResult<QualityReport>>>;
  previewQualityIssues(req: {
    meta?: RequestMeta;
    reportId: ID;
    page: PageRequest;
  }): Promise<Result<PageResult<QualityIssue>>>;

  createQualityTicket(req: {
    meta?: RequestMeta;
    reportId: ID;
    assigneeUserId: ID;
    title: string;
    description?: string;
  }): Promise<Result<{ ticketId: ID }>>;
  updateQualityTicket(req: {
    meta?: RequestMeta;
    ticketId: ID;
    status?: QualityTicketStatus;
    description?: string;
  }): Promise<Result<{ success: boolean }>>;
  listMyQualityTickets(req: {
    meta?: RequestMeta;
    assigneeUserId: ID;
    page: PageRequest;
  }): Promise<Result<PageResult<QualityTicket>>>;

  getQualityStats(req: {
    meta?: RequestMeta;
    startAt: ISODateTime;
    endAt: ISODateTime;
  }): Promise<
    Result<{
      totalAssets?: number;
      totalRecords?: number;
      problemRecords?: number;
      problemRatio?: number;
    }>
  >;

  // -------------------------
  // 标签管理（分类/标签/规则/任务/查询/主体）
  // -------------------------
  listTagCategories(req: {
    meta?: RequestMeta;
    parentId?: ID;
  }): Promise<Result<TagCategoryNode[]>>;
  createTagCategory(req: {
    meta?: RequestMeta;
    node: Omit<TagCategoryNode, 'id' | 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ categoryId: ID }>>;
  updateTagCategory(req: {
    meta?: RequestMeta;
    node: Omit<TagCategoryNode, 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ success: boolean }>>;
  deleteTagCategory(req: {
    meta?: RequestMeta;
    categoryId: ID;
  }): Promise<Result<{ success: boolean }>>;

  // 标签（运行侧）
  createTag(req: {
    meta?: RequestMeta;
    tag: Omit<Tag, 'id' | 'createdAt'>;
  }): Promise<Result<{ tagId: ID }>>;
  updateTag(req: {
    meta?: RequestMeta;
    tag: Omit<Tag, 'createdAt'>;
  }): Promise<Result<{ success: boolean }>>;
  deleteTag(req: {
    meta?: RequestMeta;
    tagId: ID;
  }): Promise<Result<{ success: boolean }>>;
  queryTags(req: {
    meta?: RequestMeta;
    keyword?: string;
    page: PageRequest;
  }): Promise<Result<PageResult<Tag>>>;

  // 标签规则与任务
  createTagRule(req: {
    meta?: RequestMeta;
    rule: Omit<TagRule, 'id' | 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ ruleId: ID }>>;
  updateTagRule(req: {
    meta?: RequestMeta;
    rule: Omit<TagRule, 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ success: boolean }>>;
  deleteTagRule(req: {
    meta?: RequestMeta;
    ruleId: ID;
  }): Promise<Result<{ success: boolean }>>;
  listTagRules(req: {
    meta?: RequestMeta;
    tagId?: ID;
    page: PageRequest;
  }): Promise<Result<PageResult<TagRule>>>;

  createTagTask(req: {
    meta?: RequestMeta;
    task: Omit<TagTask, 'id' | 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ taskId: ID }>>;
  updateTagTask(req: {
    meta?: RequestMeta;
    task: Omit<TagTask, 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ success: boolean }>>;
  deleteTagTask(req: {
    meta?: RequestMeta;
    taskId: ID;
  }): Promise<Result<{ success: boolean }>>;
  runTagTask(req: {
    meta?: RequestMeta;
    taskId: ID;
  }): Promise<Result<{ executionId: ID }>>;
  listTagTasks(req: {
    meta?: RequestMeta;
    tagId?: ID;
    page: PageRequest;
  }): Promise<Result<PageResult<TagTask>>>;

  // 标签数据查询（交并集）
  queryTagData(req: {
    meta?: RequestMeta;
    query: TagQuery;
    page: PageRequest;
  }): Promise<Result<PageResult<TagQueryResultItem>>>;

  // 标签主体管理
  upsertTagSubject(req: {
    meta?: RequestMeta;
    subject: Omit<TagSubject, 'createdAt' | 'updatedAt'> & { id?: ID };
  }): Promise<Result<{ subjectId: ID }>>;
  listTagSubjects(req: {
    meta?: RequestMeta;
    keyword?: string;
    type?: TagSubject['type'];
    page: PageRequest;
  }): Promise<Result<PageResult<TagSubject>>>;
  getSubjectTags(req: {
    meta?: RequestMeta;
    subjectId: ID;
  }): Promise<Result<{ tagIds: ID[] }>>;

  // -------------------------
  // 血缘（采集/图/影响分析/导出）
  // -------------------------
  // 血缘
  collectLineage(req: {
    meta?: RequestMeta;
    scope: 'ETL' | 'SQL' | 'SERVICE';
    since?: ISODateTime;
  }): Promise<Result<{ success: boolean }>>;
  getLineageGraph(req: {
    meta?: RequestMeta;
    dataAssetId: ID;
  }): Promise<Result<LineageGraph>>;
  getFieldLineageGraph(req: {
    meta?: RequestMeta;
    dataAssetId: ID;
    fieldName: string;
  }): Promise<Result<LineageGraph>>;
  impactAnalysis(req: {
    meta?: RequestMeta;
    dataAssetId: ID;
  }): Promise<Result<{ items: ImpactAnalysisItem[] }>>;
  exportImpactAnalysis(req: {
    meta?: RequestMeta;
    dataAssetId: ID;
  }): Promise<Result<{ downloadUrl: string }>>;

  // 执行查询
  getExecution(req: {
    meta?: RequestMeta;
    executionId: ID;
  }): Promise<Result<TaskExecution>>;
}
```

## 6) 幂等性要求

- 创建类：默认非幂等，建议支持 `idempotencyKey`。\n- `runQualityTask`：非幂等（触发新执行）。\n- `collectLineage`：幂等（同 since + scope 重复采集结果一致/可覆盖）。\n- 查询类：幂等。
- `update*` / `delete*` / `setQualityApprovalSwitch`：幂等。\n- `runTagTask`：非幂等（触发新执行）。\n- `impactAnalysis` / `getLineageGraph` / `getFieldLineageGraph`：幂等。

## 7) Mock 服务规则

- `createQualityRule`\n - 默认：返回 `ruleId="qr_1"`\n- `runQualityTask`\n - 默认：返回 `executionId="exe_1"`\n - 可模拟异常：`QUALITY_TASK_NOT_FOUND`\n- `getLineageGraph`\n - 默认：返回 5 节点/4 边的小图\n - 可模拟异常：`LINEAGE_NOT_FOUND`

- `queryTagData`\n - 默认：返回分页主体 10 条\n - 可模拟异常：`INVALID_ARGUMENT`\n- `impactAnalysis`\n - 默认：返回 5 条影响项\n - 可模拟异常：`IMPACT_ANALYSIS_FAILED`
