# @ai-datahub/data-service-service

数据治理核心微服务，提供成本管理、数据治理核心、数据治理运营、数据集成等功能。

## 功能模块

| 模块                     | 说明                                  |
| ------------------------ | ------------------------------------- |
| **Cost Management**      | 成本管理（配额、优化建议、成本统计）  |
| **Data Governance Core** | 数据治理核心（数据标准、字典、模型）  |
| **Data Governance Ops**  | 数据治理运营（质量管理、标签、血缘）  |
| **Data Integration**     | 数据集成（数据源管理、采集、SQL执行） |

## 快速开始

```bash
# 安装依赖
npm install

# 构建
npm run build

# 开发模式运行
npm run dev

# 运行测试
npm run test

# 类型检查
npm run build:check
```

服务默认监听端口 `3002`，可通过 `PORT` 环境变量配置。

## API 文档

启动服务后访问 Swagger API 文档: http://localhost:3002/api

所有 API 已自动生成文档，可以在线测试请求。

## SDK 使用

使用 `@ai-datahub/sdk` 包调用服务：

### 认证流程

数据服务本身不做认证，认证由 `system-auth-service` 统一处理，请求需要携带有效的 JWT Token：

```typescript
import { DataIntegrationHttpClient } from '@ai-datahub/sdk';
import { FetchHttpClient, AuthenticatedHttpClient } from '@ai-datahub/sdk';

// 创建基础 HTTP 客户端
const http = new FetchHttpClient('http://localhost:3002');
// 使用从 system-auth-service 获取的 token
const authedHttp = new AuthenticatedHttpClient(http, 'your-jwt-token');
const client = new DataIntegrationHttpClient(authedHttp);

// 调用 API
const result = await client.listDataSources({
  orgId: 'org-001',
});

if (!result.ok) {
  throw new Error(result.error.message);
}

console.log('Data sources:', result.data);
```

## 环境变量

| 变量   | 默认值 | 说明         |
| ------ | ------ | ------------ |
| `PORT` | `3002` | 服务监听端口 |

## API 端点

### 成本管理模块 `/api/cost-management`

| 方法 | 端点                      | 说明         |
| ---- | ------------------------- | ------------ |
| POST | `get-quota`               | 获取配额信息 |
| POST | `update-quota`            | 更新配额配置 |
| POST | `list-quotas`             | 列出所有配额 |
| POST | `get-cost-report`         | 获取成本报告 |
| POST | `list-optimization-hints` | 获取优化建议 |

### 数据治理运营模块 `/api/governance-ops`

#### 质量管理

| 方法 | 端点                          | 说明             |
| ---- | ----------------------------- | ---------------- |
| POST | `get-quality-approval-switch` | 获取质量审批开关 |
| POST | `set-quality-approval-switch` | 设置质量审批开关 |
| POST | `create-quality-rule`         | 创建质量规则     |
| POST | `update-quality-rule`         | 更新质量规则     |
| POST | `delete-quality-rule`         | 删除质量规则     |
| POST | `list-quality-rules`          | 列出质量规则     |
| POST | `create-quality-task`         | 创建质量任务     |
| POST | `update-quality-task`         | 更新质量任务     |
| POST | `delete-quality-task`         | 删除质量任务     |
| POST | `run-quality-task`            | 运行质量任务     |
| POST | `list-quality-tasks`          | 列出质量任务     |
| POST | `get-quality-report`          | 获取质量报告     |
| POST | `list-quality-reports`        | 列出质量报告     |
| POST | `preview-quality-issues`      | 预览质量问题     |
| POST | `create-quality-ticket`       | 创建质量工单     |
| POST | `update-quality-ticket`       | 更新质量工单     |
| POST | `list-my-quality-tickets`     | 列出我的质量工单 |
| POST | `get-quality-stats`           | 获取质量统计     |

#### 标签管理

| 方法 | 端点                  | 说明           |
| ---- | --------------------- | -------------- |
| POST | `list-tag-categories` | 列出标签分类   |
| POST | `create-tag-category` | 创建标签分类   |
| POST | `update-tag-category` | 更新标签分类   |
| POST | `delete-tag-category` | 删除标签分类   |
| POST | `create-tag`          | 创建标签       |
| POST | `update-tag`          | 更新标签       |
| POST | `delete-tag`          | 删除标签       |
| POST | `query-tags`          | 查询标签       |
| POST | `create-tag-rule`     | 创建标签规则   |
| POST | `update-tag-rule`     | 更新标签规则   |
| POST | `delete-tag-rule`     | 删除标签规则   |
| POST | `list-tag-rules`      | 列出标签规则   |
| POST | `create-tag-task`     | 创建标签任务   |
| POST | `update-tag-task`     | 更新标签任务   |
| POST | `delete-tag-task`     | 删除标签任务   |
| POST | `run-tag-task`        | 运行标签任务   |
| POST | `list-tag-tasks`      | 列出标签任务   |
| POST | `query-tag-data`      | 查询打标签数据 |
| POST | `upsert-tag-subject`  | 更新标签主体   |
| POST | `list-tag-subjects`   | 列出标签主体   |
| POST | `get-subject-tags`    | 获取主体标签   |

#### 血缘分析

| 方法 | 端点                      | 说明             |
| ---- | ------------------------- | ---------------- |
| POST | `collect-lineage`         | 采集血缘         |
| POST | `get-lineage-graph`       | 获取血缘图       |
| POST | `get-field-lineage-graph` | 获取字段血缘图   |
| POST | `impact-analysis`         | 影响分析         |
| POST | `export-impact-analysis`  | 导出影响分析     |
| POST | `get-execution`           | 获取任务执行信息 |

### 数据集成模块 `/api/data-integration`

| 方法 | 端点                       | 说明             |
| ---- | -------------------------- | ---------------- |
| POST | `create-data-source`       | 创建数据源       |
| POST | `update-data-source`       | 更新数据源       |
| POST | `delete-data-source`       | 删除数据源       |
| POST | `test-connection`          | 测试数据源连接   |
| POST | `list-data-sources`        | 列出数据源       |
| POST | `collect-initial-metadata` | 收集初始元数据   |
| POST | `submit-access-task`       | 提交数据接入任务 |
| POST | `profile-data`             | 数据概览分析     |
| POST | `preview-data`             | 预览数据         |
| POST | `execute-sql`              | 执行即席SQL查询  |
| POST | `get-task-execution`       | 获取任务执行信息 |

## 数据类型

所有数据类型定义来自 `@ai-datahub/contract`：

```typescript
import type {
  // 成本管理
  Quota,
  OptimizationHint,
  // 数据质量管理
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
  // 数据源
  DataSource,
  ColumnMetadata,
  TaskExecution,
  // 通用
  Result,
  PageResult,
  PageRequest,
  ID,
  ISODateTime,
} from '@ai-datahub/contract';
```

### DataSource

```typescript
interface DataSource {
  id: ID;
  name: string;
  type:
    | 'JDBC'
    | 'HIVE'
    | 'ELASTICSEARCH'
    | 'FILE'
    | 'OBJECT_STORAGE'
    | 'CUSTOM';
  jdbcUrl?: string;
  username?: string;
  passwordRef?: string;
  driverClass?: string;
  orgId: ID;
  projectId?: ID;
  description?: string;
  status: 'ENABLED' | 'DISABLED';
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}
```

## 响应格式

所有 API 返回统一的 `Result<T>` 格式：

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

## 错误码

| 错误码                               | 说明             |
| ------------------------------------ | ---------------- |
| `DATA_SOURCE_NOT_FOUND`              | 数据源不存在     |
| `DATA_SOURCE_NAME_DUPLICATE`         | 数据源名称重复   |
| `DATA_SOURCE_IN_USE`                 | 数据源正在被使用 |
| `DATA_SOURCE_CONNECTION_TEST_FAILED` | 连接测试失败     |
| `PERMISSION_DENIED`                  | 权限不足         |
| `INVALID_ARGUMENT`                   | 参数错误         |
| `SQL_SYNTAX_ERROR`                   | SQL语法错误      |
| `EXECUTION_TIMEOUT`                  | 执行超时         |
| `READ_FAILED`                        | 读取失败         |
| `QUALITY_RULE_NOT_FOUND`             | 质量规则不存在   |
| `QUALITY_TASK_NOT_FOUND`             | 质量任务不存在   |
| `QUALITY_REPORT_NOT_FOUND`           | 质量报告不存在   |
| `QUALITY_TICKET_NOT_FOUND`           | 质量工单不存在   |
| `TAG_NOT_FOUND`                      | 标签不存在       |
| `TAG_RULE_NOT_FOUND`                 | 标签规则不存在   |
| `TAG_TASK_NOT_FOUND`                 | 标签任务不存在   |
| `EXECUTION_NOT_FOUND`                | 任务执行不存在   |

## 架构说明

### 开发模式：InMemory 实现

当前所有仓储都使用 **InMemory** 实现，目的：

1. **快速完成API骨架开发** - 验证API设计合理性
2. **提前提供可测试API** - 可以通过Swagger审阅和测试接口
3. **延迟持久化决策** - 待API设计确认后再进行ORM集成
4. **架构隔离** - 遵循 Repository 模式，后续切换 TypeORM 只需要重写仓储层，service/controller 无需修改

### 未来计划：持久化

选型：**TypeORM**

- 原因：NestJS官方集成好，符合装饰器开发风格，社区成熟
- 工作：将所有 `InMemory*Repository` 替换为 TypeORM 实现

## 技术栈

- **框架**: NestJS 11 + Fastify
- **API 文档**: @nestjs/swagger
- **验证**: class-validator + class-transformer
- **开发模式**: Repository Pattern + InMemory 实现
- **未来ORM**: TypeORM (待实现)

## 项目结构

```
services/data-service-service/
├── src/
│   ├── main.ts                 # 入口文件 + Swagger配置
│   ├── AppModule.ts            # 根模块
│   ├── controllers/
│   │   └── HealthController.ts # 健康检查
│   └── modules/                # 功能模块
│       ├── cost-management/    # 成本管理
│       ├── data-governance-core/ # 数据治理核心
│       ├── data-governance-ops/ # 数据治理运营
│       └── data-integration/   # 数据集成
├── test/                       # E2E 测试
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── vitest.config.ts
```

## 测试

```bash
# 运行所有测试
npm run test

# 运行特定模块测试
npm run test data-integration

# 测试覆盖率
npm run test -- coverage
```

## License

MIT
