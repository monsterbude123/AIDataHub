# Data Service Service SDK Integration Guide

本文档说明如何通过 `@ai-datahub/sdk` 与 `data-service-service` 进行集成。

## 安装

```bash
npm install @ai-datahub/sdk @ai-datahub/contract
```

## 初始化客户端

```typescript
import {
  CostManagementClient,
  DataGovernanceCoreClient,
  DataGovernanceOpsClient,
  DataIntegrationClient,
  createDataServiceClients,
} from '@ai-datahub/sdk';

// 创建所有数据服务客户端
const { costManagement, governanceCore, governanceOps, dataIntegration } =
  createDataServiceClients({
    baseUrl: 'http://localhost:3002',
    // 可选：带认证的请求头
    headers: {
      Authorization: 'Bearer <jwt-token>',
    },
    // 可选：超时配置
    timeout: 5000,
  });
```

## 成本管理 (Cost Management)

### 获取配额信息

```typescript
const result = await costManagement.getQuota({
  resourceType: 'storage',
  resourceId: 'project-001',
});

if (result.success) {
  const { used, limit, unit } = result.data;
  console.log(`使用量: ${used}/${limit} ${unit}`);
}
```

### 更新配额配置

```typescript
const result = await costManagement.updateQuota({
  resourceType: 'storage',
  resourceId: 'project-001',
  limit: 1000,
  unit: 'GB',
});
```

### 列出所有配额

```typescript
const result = await costManagement.listQuotas({
  orgId: 'org-001',
  keyword: 'storage',
  page: { page: 1, pageSize: 10 },
});
```

### 获取成本报告

```typescript
const result = await costManagement.getCostReport({
  orgId: 'org-001',
  startAt: '2024-01-01T00:00:00Z',
  endAt: '2024-01-31T23:59:59Z',
});
```

### 获取优化建议

```typescript
const result = await costManagement.listOptimizationHints({
  orgId: 'org-001',
  status: 'PENDING',
  page: { page: 1, pageSize: 10 },
});

if (result.success) {
  const hints = result.data.items;
  hints.forEach((hint) => {
    console.log(
      `优化建议: ${hint.description}, 预估节省: ${hint.estimatedSavings}`
    );
  });
}
```

## 数据治理运营 - 质量管理 (Quality Governance)

### 获取质量审批开关

```typescript
const result = await governanceOps.getQualityApprovalSwitch();
```

### 设置质量审批开关

```typescript
const result = await governanceOps.setQualityApprovalSwitch({
  ruleApprovalEnabled: true,
  taskApprovalEnabled: true,
});
```

### 创建质量规则

```typescript
const result = await governanceOps.createQualityRule({
  rule: {
    name: '非空检查',
    description: '检查关键字段不能为空',
    type: 'NOT_NULL',
    severity: 'ERROR',
    enabled: true,
    target: {
      dataAssetId: 'asset-001',
      fieldName: 'user_id',
    },
    expression: '{{value}} IS NOT NULL',
  },
});

if (result.success) {
  console.log('规则创建成功，ID:', result.data.ruleId);
}
```

### 列出质量规则

```typescript
const result = await governanceOps.listQualityRules({
  keyword: '非空',
  page: { page: 1, pageSize: 20 },
});
```

### 创建质量任务

```typescript
const result = await governanceOps.createQualityTask({
  task: {
    name: '月度用户数据质量检查',
    ruleIds: ['rule-001', 'rule-002'],
    targetAssetId: 'asset-001',
    schedule: '0 0 1 * *',
    enabled: true,
  },
});
```

### 运行质量任务

```typescript
const result = await governanceOps.runQualityTask({
  taskId: 'task-001',
});

if (result.success) {
  console.log('任务已启动，执行ID:', result.data.executionId);
}
```

### 获取质量报告

```typescript
const result = await governanceOps.getQualityReport({
  reportId: 'report-001',
});
```

### 预览质量问题

```typescript
const result = await governanceOps.previewQualityIssues({
  reportId: 'report-001',
  page: { page: 1, pageSize: 20 },
});
```

### 创建质量工单

```typescript
const result = await governanceOps.createQualityTicket({
  reportId: 'report-001',
  assigneeUserId: 'user-001',
  title: '修复用户ID为空问题',
  description: '发现多条记录user_id为空，需要修复',
});
```

### 更新质量工单

```typescript
const result = await governanceOps.updateQualityTicket({
  ticketId: 'ticket-001',
  status: 'IN_PROGRESS',
  description: '正在修复中',
});
```

### 获取质量统计

```typescript
const result = await governanceOps.getQualityStats({
  startAt: '2024-01-01T00:00:00Z',
  endAt: '2024-01-31T23:59:59Z',
});
```

## 数据治理运营 - 标签管理 (Tag Management)

### 创建标签分类

```typescript
const result = await governanceOps.createTagCategory({
  node: {
    name: '业务域',
    parentId: null,
  },
});
```

### 列出标签分类

```typescript
const result = await governanceOps.listTagCategories({
  parentId: 'category-001',
});
```

### 创建标签

```typescript
const result = await governanceOps.createTag({
  tag: {
    name: '用户数据',
    categoryId: 'category-001',
    description: '用户相关数据资产',
    color: '#FF0000',
  },
});
```

### 查询标签

```typescript
const result = await governanceOps.queryTags({
  keyword: '用户',
  page: { page: 1, pageSize: 20 },
});
```

### 创建标签规则

```typescript
const result = await governanceOps.createTagRule({
  rule: {
    name: '自动标记敏感数据',
    description: '根据字段名称自动标记敏感数据',
    condition: 'column_name LIKE %password%',
    tagIds: ['tag-001'],
    enabled: true,
  },
});
```

### 创建标签任务

```typescript
const result = await governanceOps.createTagTask({
  task: {
    name: '批量标记用户数据',
    ruleIds: ['rule-001'],
    targetAssetId: 'asset-001',
    enabled: true,
  },
});
```

### 查询标签主体

```typescript
const result = await governanceOps.listTagSubjects({
  keyword: 'user',
  type: 'TABLE',
  page: { page: 1, pageSize: 20 },
});
```

### 获取主体标签

```typescript
const result = await governanceOps.getSubjectTags({
  subjectId: 'asset-001',
});

if (result.success) {
  console.log('标签ID列表:', result.data.tagIds);
}
```

## 数据治理运营 - 血缘分析 (Lineage)

### 采集血缘

```typescript
const result = await governanceOps.collectLineage({
  scope: 'ETL',
  since: '2024-01-01T00:00:00Z',
});
```

### 获取血缘图

```typescript
const result = await governanceOps.getLineageGraph({
  dataAssetId: 'asset-001',
});

if (result.success) {
  const { nodes, edges } = result.data;
  // 绘制血缘图
  console.log(`节点数: ${nodes.length}, 边数: ${edges.length}`);
}
```

### 影响分析

```typescript
const result = await governanceOps.impactAnalysis({
  dataAssetId: 'asset-001',
});
```

## 数据治理核心 - 资产搜索与标签 (Data Governance Core)

### 搜索资产

```typescript
const result = await governanceCore.searchAssets({
  keyword: '用户',
  tags: ['user-data'],
  page: { page: 1, pageSize: 20 },
});

if (result.success) {
  const { items, total } = result.data;
  console.log(`找到 ${total} 个资产`);
}
```

### 给资产打标签

```typescript
const result = await governanceCore.tagAsset({
  dataAssetId: 'asset-001',
  tags: ['sensitive', 'user'],
});
```

### 列出所有资产标签

```typescript
const result = await governanceCore.listAssetTags({
  keyword: 'sensitive',
});
```

### 导出资产台账

```typescript
const result = await governanceCore.exportLedger({
  type: 'ASSET_LEDGER',
  filters: { orgId: 'org-001' },
  format: 'CSV',
});

if (result.success) {
  const { downloadUrl, expireAt } = result.data;
  console.log(`下载链接: ${downloadUrl}`);
}
```

## 数据治理核心 - 标准数据元 (Standard Data Element)

### 创建标准数据元

```typescript
const result = await governanceCore.createStandardDataElement({
  element: {
    name: '用户ID',
    identifier: 'user_id',
    type: 'bigint',
    description: '用户唯一标识',
  },
});

if (result.success) {
  console.log('创建成功，ID:', result.data.elementId);
}
```

### 更新标准数据元

```typescript
const result = await governanceCore.updateStandardDataElement({
  element: {
    id: 'se-001',
    name: '用户ID',
    identifier: 'user_id',
    type: 'bigint',
    description: '用户唯一标识',
  },
});
```

### 删除标准数据元

```typescript
const result = await governanceCore.deleteStandardDataElement({
  elementId: 'se-001',
});
```

### 列出标准数据元

```typescript
const result = await governanceCore.listStandardDataElements({
  keyword: '用户',
  page: { page: 1, pageSize: 20 },
});
```

## 数据治理核心 - 标准类型映射 (Standard Type Mapping)

### 创建/更新标准类型映射

```typescript
const result = await governanceCore.upsertStandardTypeMapping({
  mapping: {
    id: 'stm-001',
    sourceSystem: 'mysql',
    sourceType: 'int',
    standardType: 'bigint',
  },
});

if (result.success) {
  console.log('映射ID:', result.data.mappingId);
}
```

### 列出标准类型映射

```typescript
const result = await governanceCore.listStandardTypeMappings({
  sourceSystem: 'mysql',
  page: { page: 1, pageSize: 20 },
});
```

## 数据治理核心 - 数据字典 (Dictionary)

### 创建字典

```typescript
const result = await governanceCore.createDictionary({
  dictionary: {
    name: '性别字典',
    type: 'CUSTOM',
    config: {},
  },
});

if (result.success) {
  console.log('字典ID:', result.data.dictionaryId);
}
```

### 更新字典

```typescript
const result = await governanceCore.updateDictionary({
  dictionary: {
    id: 'dict-001',
    name: '性别字典',
    type: 'CUSTOM',
    config: {},
  },
});
```

### 删除字典

```typescript
const result = await governanceCore.deleteDictionary({
  dictionaryId: 'dict-001',
});
```

### 列出字典

```typescript
const result = await governanceCore.listDictionaries({
  keyword: '性别',
  page: { page: 1, pageSize: 20 },
});
```

### 获取字典数据

```typescript
const result = await governanceCore.getDictionaryData({
  dictionaryId: 'dict-001',
  page: { page: 1, pageSize: 50 },
});
```

### 导入字典数据

```typescript
const result = await governanceCore.importDictionary({
  dictionaryId: 'dict-001',
  format: 'TEMPLATE_V1',
  payload: {
    items: [
      { key: 'M', value: '男' },
      { key: 'F', value: '女' },
    ],
  },
});
```

## 数据治理核心 - 字典目录 (Dictionary Categories)

### 列出字典分类

```typescript
const result = await governanceCore.listDictionaryCategories({
  parentId: 'cat-root',
});
```

### 创建字典分类

```typescript
const result = await governanceCore.createDictionaryCategory({
  node: {
    name: '业务分类',
    parentId: 'cat-root',
    code: 'business',
  },
});

if (result.success) {
  console.log('分类ID:', result.data.categoryId);
}
```

### 更新字典分类

```typescript
const result = await governanceCore.updateDictionaryCategory({
  node: {
    id: 'cat-001',
    name: '业务分类',
    parentId: 'cat-root',
    code: 'business',
  },
});
```

### 删除字典分类

```typescript
const result = await governanceCore.deleteDictionaryCategory({
  categoryId: 'cat-001',
});
```

## 数据治理核心 - 数据模型 (Data Model)

### 创建数据模型

```typescript
const result = await governanceCore.createModel({
  model: {
    name: '用户中心数据模型',
    version: 'v1.0',
    status: 'DRAFT',
    definition: {},
  },
});

if (result.success) {
  console.log('模型ID:', result.data.modelId);
}
```

### 审批数据模型

```typescript
const result = await governanceCore.approveModel({
  modelId: 'model-001',
});
```

### 发布/下架数据模型

```typescript
const result = await governanceCore.publishModel({
  modelId: 'model-001',
  online: true,
});
```

### 创建物理表

```typescript
const result = await governanceCore.createPhysicalTables({
  modelId: 'model-001',
  dataSourceId: 'ds-001',
});
```

### 列出数据模型

```typescript
const result = await governanceCore.listModels({
  keyword: '用户',
  page: { page: 1, pageSize: 20 },
});
```

## 数据治理核心 - 稽核 (Audit)

### 创建/更新稽核任务

```typescript
const result = await governanceCore.upsertAuditTask({
  task: {
    type: 'MODEL_AUDIT',
    enabled: true,
    schedule: '0 0 1 * *',
  },
});

if (result.success) {
  console.log('任务ID:', result.data.taskId);
}
```

### 列出稽核任务

```typescript
const result = await governanceCore.listAuditTasks({});
```

### 运行稽核任务

```typescript
const result = await governanceCore.runAuditTask({
  taskId: 'task-001',
});

if (result.success) {
  console.log('运行ID:', result.data.runId);
}
```

### 列出稽核运行记录

```typescript
const result = await governanceCore.listAuditRuns({
  taskId: 'task-001',
  page: { page: 1, pageSize: 10 },
});
```

## 数据集成 (Data Integration)

### 创建数据源

```typescript
const result = await dataIntegration.createDataSource({
  dataSource: {
    name: '生产MySQL',
    type: 'JDBC',
    jdbcUrl: 'jdbc:mysql://localhost:3306/mydb',
    username: 'root',
    passwordRef: 'secret/mysql-password',
    driverClass: 'com.mysql.cj.jdbc.Driver',
    orgId: 'org-001',
    projectId: 'project-001',
    description: '生产环境MySQL数据库',
    status: 'ENABLED',
  },
});

if (result.success) {
  console.log('数据源创建成功:', result.data.id);
}
```

### 更新数据源

```typescript
const result = await dataIntegration.updateDataSource({
  dataSource: {
    id: 'ds-001',
    name: '生产MySQL',
    type: 'JDBC',
    jdbcUrl: 'jdbc:mysql://localhost:3306/mydb',
    username: 'root',
    passwordRef: 'secret/mysql-password',
    driverClass: 'com.mysql.cj.jdbc.Driver',
    orgId: 'org-001',
    projectId: 'project-001',
    description: '生产环境MySQL数据库',
    status: 'ENABLED',
  },
});
```

### 测试数据源连接

```typescript
const result = await dataIntegration.testConnection({
  dataSource: {
    name: '测试MySQL',
    type: 'JDBC',
    jdbcUrl: 'jdbc:mysql://localhost:3306/mydb',
    username: 'root',
    passwordRef: 'secret/mysql-password',
    driverClass: 'com.mysql.cj.jdbc.Driver',
    orgId: 'org-001',
    status: 'ENABLED',
  },
});

if (result.success) {
  const { success, message, checkedAt } = result.data;
  console.log(`连接测试: ${success ? '成功' : '失败'}, ${message}`);
}
```

### 列出数据源

```typescript
const result = await dataIntegration.listDataSources({
  orgId: 'org-001',
  keyword: 'MySQL',
  projectId: 'project-001',
});
```

### 收集初始元数据

```typescript
const result = await dataIntegration.collectInitialMetadata({
  dataSourceId: 'ds-001',
});

if (result.success) {
  const columns = result.data;
  console.log(`发现 ${columns.length} 列`);
}
```

### 提交数据接入任务

```typescript
const result = await dataIntegration.submitAccessTask({
  task: {
    name: '接入用户表',
    orgId: 'org-001',
    projectId: 'project-001',
    dataSourceId: 'ds-001',
    config: {
      tableName: 'users',
    },
    schedule: '0 0 2 * *',
  },
});

if (result.success) {
  console.log('任务已提交，执行ID:', result.data.taskExecutionId);
}
```

### 数据概览

```typescript
const result = await dataIntegration.profileData({
  dataSourceId: 'ds-001',
  tableName: 'users',
  sampleSize: 1000,
});

if (result.success) {
  const { tableName, metrics, sampleRows } = result.data;
  console.log(`表: ${tableName}, 指标数: ${metrics.length}`);
}
```

### 预览数据

```typescript
const result = await dataIntegration.previewData({
  dataAssetId: 'asset-001',
  limit: 100,
});

if (result.success) {
  const { columns, rows } = result.data;
  console.log(`预览 ${rows.length} 行, 列: ${columns.join(', ')}`);
}
```

### 执行即席SQL查询

```typescript
const result = await dataIntegration.executeSql({
  sql: 'SELECT * FROM users LIMIT 100',
  projectId: 'project-001',
  isTest: true,
});

if (result.success) {
  const { columns, rows, rowCount, isTruncated } = result.data;
  console.log(`返回 ${rowCount} 行`);
}
```

### 获取任务执行信息

```typescript
const result = await dataIntegration.getTaskExecution({
  taskExecutionId: 'exec-001',
});

if (result.success) {
  const { status, startedAt, endedAt } = result.data;
  console.log(`执行状态: ${status}`);
}
```

## 错误处理

所有 API 返回统一的 `Result<T>` 结构：

```typescript
interface Result<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    level: 'ERROR' | 'WARN';
  };
  traceId?: string;
}
```

### 错误处理示例

```typescript
const result = await dataIntegration.createDataSource({ dataSource });

if (!result.success) {
  const { code, message } = result.error!;

  switch (code) {
    case 'DATA_SOURCE_NAME_DUPLICATE':
      console.error('数据源名称已存在');
      break;
    case 'PERMISSION_DENIED':
      console.error('权限不足');
      break;
    default:
      console.error(`错误: ${message}`);
  }

  // traceId 可用于日志追踪
  console.log('TraceId:', result.traceId);
}
```

## 类型定义

所有类型定义来自 `@ai-datahub/contract`：

```typescript
import type {
  // 成本管理
  Quota,
  OptimizationHint,
  // 数据治理核心
  AssetTag,
  StandardDataElement,
  StandardTypeMapping,
  Dictionary,
  DictionaryItem,
  DictionaryCategoryNode,
  DataModel,
  AuditTask,
  AuditRun,
  // 质量管理
  QualityRule,
  QualityTask,
  QualityReport,
  QualityIssue,
  QualityTicket,
  // 标签管理
  Tag,
  TagCategoryNode,
  TagRule,
  TagTask,
  TagSubject,
  // 血缘
  LineageGraph,
  ImpactAnalysisItem,
  // 数据集成
  DataSource,
  ColumnMetadata,
  TaskExecution,
  // 通用
  Result,
  PageResult,
  PageRequest,
  ID,
  ISODateTime,
  DataAsset,
} from '@ai-datahub/contract';
```

## HTTP 端点映射

| 模块                            | SDK 方法                    | HTTP 端点                            |
| ------------------------------- | --------------------------- | ------------------------------------ |
| **成本管理**                    |                             | `/api/cost-management`               |
|                                 | `getQuota`                  | `POST /get-quota`                    |
|                                 | `updateQuota`               | `POST /update-quota`                 |
|                                 | `listQuotas`                | `POST /list-quotas`                  |
|                                 | `getCostReport`             | `POST /get-cost-report`              |
|                                 | `listOptimizationHints`     | `POST /list-optimization-hints`      |
| **数据治理运营 - 质量**         |                             | `/api/governance-ops`                |
|                                 | `getQualityApprovalSwitch`  | `POST /get-quality-approval-switch`  |
|                                 | `setQualityApprovalSwitch`  | `POST /set-quality-approval-switch`  |
|                                 | `createQualityRule`         | `POST /create-quality-rule`          |
|                                 | `updateQualityRule`         | `POST /update-quality-rule`          |
|                                 | `deleteQualityRule`         | `POST /delete-quality-rule`          |
|                                 | `listQualityRules`          | `POST /list-quality-rules`           |
|                                 | `createQualityTask`         | `POST /create-quality-task`          |
|                                 | `updateQualityTask`         | `POST /update-quality-task`          |
|                                 | `deleteQualityTask`         | `POST /delete-quality-task`          |
|                                 | `runQualityTask`            | `POST /run-quality-task`             |
|                                 | `listQualityTasks`          | `POST /list-quality-tasks`           |
|                                 | `getQualityReport`          | `POST /get-quality-report`           |
|                                 | `listQualityReports`        | `POST /list-quality-reports`         |
|                                 | `previewQualityIssues`      | `POST /preview-quality-issues`       |
|                                 | `createQualityTicket`       | `POST /create-quality-ticket`        |
|                                 | `updateQualityTicket`       | `POST /update-quality-ticket`        |
|                                 | `listMyQualityTickets`      | `POST /list-my-quality-tickets`      |
|                                 | `getQualityStats`           | `POST /get-quality-stats`            |
| **数据治理运营 - 标签**         |                             |                                      |
|                                 | `listTagCategories`         | `POST /list-tag-categories`          |
|                                 | `createTagCategory`         | `POST /create-tag-category`          |
|                                 | `updateTagCategory`         | `POST /update-tag-category`          |
|                                 | `deleteTagCategory`         | `POST /delete-tag-category`          |
|                                 | `createTag`                 | `POST /create-tag`                   |
|                                 | `updateTag`                 | `POST /update-tag`                   |
|                                 | `deleteTag`                 | `POST /delete-tag`                   |
|                                 | `queryTags`                 | `POST /query-tags`                   |
|                                 | `createTagRule`             | `POST /create-tag-rule`              |
|                                 | `updateTagRule`             | `POST /update-tag-rule`              |
|                                 | `deleteTagRule`             | `POST /delete-tag-rule`              |
|                                 | `listTagRules`              | `POST /list-tag-rules`               |
|                                 | `createTagTask`             | `POST /create-tag-task`              |
|                                 | `updateTagTask`             | `POST /update-tag-task`              |
|                                 | `deleteTagTask`             | `POST /delete-tag-task`              |
|                                 | `runTagTask`                | `POST /run-tag-task`                 |
|                                 | `listTagTasks`              | `POST /list-tag-tasks`               |
|                                 | `queryTagData`              | `POST /query-tag-data`               |
|                                 | `upsertTagSubject`          | `POST /upsert-tag-subject`           |
|                                 | `listTagSubjects`           | `POST /list-tag-subjects`            |
|                                 | `getSubjectTags`            | `POST /get-subject-tags`             |
| **数据治理运营 - 血缘**         |                             |                                      |
|                                 | `collectLineage`            | `POST /collect-lineage`              |
|                                 | `getLineageGraph`           | `POST /get-lineage-graph`            |
|                                 | `getFieldLineageGraph`      | `POST /get-field-lineage-graph`      |
|                                 | `impactAnalysis`            | `POST /impact-analysis`              |
|                                 | `exportImpactAnalysis`      | `POST /export-impact-analysis`       |
|                                 | `getExecution`              | `POST /get-execution`                |
| **数据治理核心 - 资产**         |                             | `/api/governance-core`               |
|                                 | `searchAssets`              | `POST /search-assets`                |
|                                 | `tagAsset`                  | `POST /tag-asset`                    |
|                                 | `listAssetTags`             | `POST /list-asset-tags`              |
|                                 | `exportLedger`              | `POST /export-ledger`                |
| **数据治理核心 - 标准数据元**   |                             |                                      |
|                                 | `createStandardDataElement` | `POST /create-standard-data-element` |
|                                 | `updateStandardDataElement` | `POST /update-standard-data-element` |
|                                 | `deleteStandardDataElement` | `POST /delete-standard-data-element` |
|                                 | `listStandardDataElements`  | `POST /list-standard-data-elements`  |
| **数据治理核心 - 标准类型映射** |                             |                                      |
|                                 | `upsertStandardTypeMapping` | `POST /upsert-standard-type-mapping` |
|                                 | `listStandardTypeMappings`  | `POST /list-standard-type-mappings`  |
| **数据治理核心 - 字典**         |                             |                                      |
|                                 | `createDictionary`          | `POST /create-dictionary`            |
|                                 | `updateDictionary`          | `POST /update-dictionary`            |
|                                 | `deleteDictionary`          | `POST /delete-dictionary`            |
|                                 | `listDictionaries`          | `POST /list-dictionaries`            |
|                                 | `getDictionaryData`         | `POST /get-dictionary-data`          |
|                                 | `importDictionary`          | `POST /import-dictionary`            |
| **数据治理核心 - 字典分类**     |                             |                                      |
|                                 | `listDictionaryCategories`  | `POST /list-dictionary-categories`   |
|                                 | `createDictionaryCategory`  | `POST /create-dictionary-category`   |
|                                 | `updateDictionaryCategory`  | `POST /update-dictionary-category`   |
|                                 | `deleteDictionaryCategory`  | `POST /delete-dictionary-category`   |
| **数据治理核心 - 数据模型**     |                             |                                      |
|                                 | `createModel`               | `POST /create-model`                 |
|                                 | `approveModel`              | `POST /approve-model`                |
|                                 | `publishModel`              | `POST /publish-model`                |
|                                 | `createPhysicalTables`      | `POST /create-physical-tables`       |
|                                 | `listModels`                | `POST /list-models`                  |
| **数据治理核心 - 稽核**         |                             |                                      |
|                                 | `upsertAuditTask`           | `POST /upsert-audit-task`            |
|                                 | `listAuditTasks`            | `POST /list-audit-tasks`             |
|                                 | `runAuditTask`              | `POST /run-audit-task`               |
|                                 | `listAuditRuns`             | `POST /list-audit-runs`              |
| **数据集成**                    |                             | `/api/data-integration`              |
|                                 | `createDataSource`          | `POST /create-data-source`           |
|                                 | `updateDataSource`          | `POST /update-data-source`           |
|                                 | `deleteDataSource`          | `POST /delete-data-source`           |
|                                 | `testConnection`            | `POST /test-connection`              |
|                                 | `listDataSources`           | `POST /list-data-sources`            |
|                                 | `collectInitialMetadata`    | `POST /collect-initial-metadata`     |
|                                 | `submitAccessTask`          | `POST /submit-access-task`           |
|                                 | `profileData`               | `POST /profile-data`                 |
|                                 | `previewData`               | `POST /preview-data`                 |
|                                 | `executeSql`                | `POST /execute-sql`                  |
|                                 | `getTaskExecution`          | `POST /get-task-execution`           |

## 最佳实践

### 1. 认证

所有请求需要携带从 `system-auth-service` 获取的 JWT Token：

```typescript
import { AuthenticatedHttpClient } from '@ai-datahub/sdk';

// 创建带认证的客户端
const http = new AuthenticatedHttpClient(
  new FetchHttpClient('http://localhost:3002'),
  token
);

// 所有客户端使用这个认证http客户端
const client = new DataIntegrationClient(http);
```

### 2. 分页查询

```typescript
// 通用分页查询封装
async function fetchAllPages<T>(
  fetcher: (page: number) => Promise<Result<PageResult<T>>>,
  pageSize = 50
): Promise<T[]> {
  const allItems: T[] = [];
  let page = 1;

  while (true) {
    const result = await fetcher(page);
    if (!result.success) break;

    allItems.push(...result.data.items);
    if (allItems.length >= result.data.total) break;
    page++;
  }

  return allItems;
}

// 使用
const allDataSources = await fetchAllPages(page =>
  dataIntegration.listDataSources({ orgId: 'org-001', page: { page, pageSize: 50 } })
});
```

### 3. TraceId 追踪

```typescript
// 请求时传递 traceId，便于跨服务追踪
const result = await client.createDataSource({
  meta: { traceId: 'your-trace-id' },
  dataSource: dataSourceData,
});

// 所有响应都包含 traceId
console.log('Response traceId:', result.traceId);
```

## 相关文档

- [data-service-service README](./README.md)
- [Contract 类型定义](../../../packages/contract/src/modules/)
- [SDK 源码](../../../packages/sdk/)
