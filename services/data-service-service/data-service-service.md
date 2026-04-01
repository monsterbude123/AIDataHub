# Data Service Service (数据治理服务)

## 概述

`data-service-service` 是 AIDataHub 项目的数据治理核心服务，基于 **NestJS 11 + Fastify** 构建，提供数据治理相关的各项功能。

## 模块结构

```
src/
├── main.ts                    # 入口文件，启动服务 + Swagger 配置
├── AppModule.ts               # 根模块
├── controllers/
│   └── HealthController.ts    # 健康检查
└── modules/
    ├── cost-management/       # 成本管理模块
    ├── data-governance-core/  # 数据治理核心模块（元数据、数据标准、字典）
    ├── data-governance-ops/   # 数据治理运营模块（质量、标签）
    └── data-integration/      # 数据集成模块（数据源、任务）
```

## 已实现模块

### 1. 成本管理 (cost-management)

**功能：** 数据存储成本管理、配额管理、优化建议

**API 端点：** `/api/cost-management/*`

| 方法 | 端点                      | 功能         |
| ---- | ------------------------- | ------------ |
| POST | `get-quota`               | 获取配额信息 |
| POST | `update-quota`            | 更新配额配置 |
| POST | `list-quotas`             | 列出所有配额 |
| POST | `get-cost-report`         | 获取成本报告 |
| POST | `list-optimization-hints` | 获取优化建议 |

### 2. 数据治理核心 (data-governance-core)

**功能：** 数据标准、数据字典、数据模型、审计

**实体：**

- `standard-data-element.entity` - 标准数据元
- `standard-type-mapping.entity` - 标准类型映射
- `dictionary.entity` - 数据字典
- `dictionary-category.entity` - 数据字典分类
- `dictionary-item.entity` - 数据字典项
- `data-model.entity` - 数据模型
- `asset-tag.entity` - 资产标签
- `audit-task.entity` - 审计任务
- `audit-run.entity` - 审计执行

### 3. 数据治理运营 (data-governance-ops)

**功能：** 质量管理、标签管理、数据血缘

**API 端点：** `/api/governance-ops/*`

#### 质量管理

| 方法 | 端点                          | 功能             |
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

| 方法 | 端点                  | 功能         |
| ---- | --------------------- | ------------ |
| POST | `list-tag-categories` | 列出标签分类 |
| POST | `create-tag-category` | 创建标签分类 |
| POST | `update-tag-category` | 更新标签分类 |
| POST | `delete-tag-category` | 删除标签分类 |
| POST | `create-tag`          | 创建标签     |
| POST | `update-tag`          | 更新标签     |
| POST | `delete-tag`          | 删除标签     |
| POST | `query-tags`          | 查询标签     |
| POST | `create-tag-rule`     | 创建标签规则 |
| POST | `update-tag-rule`     | 更新标签规则 |
| POST | `delete-tag-rule`     | 删除标签规则 |
| POST | `list-tag-rules`      | 列出标签规则 |
| POST | `create-tag-task`     | 创建标签任务 |
| POST | `update-tag-task`     | 更新标签任务 |
| POST | `delete-tag-task`     | 删除标签任务 |
| POST | `run-tag-task`        | 运行标签任务 |
| POST | `list-tag-tasks`      | 列出标签任务 |
| POST | `query-tag-data`      | 查询标签数据 |
| POST | `upsert-tag-subject`  | 更新标签主体 |
| POST | `list-tag-subjects`   | 列出标签主体 |
| POST | `get-subject-tags`    | 获取主体标签 |

#### 血缘分析

| 方法 | 端点                      | 功能             |
| ---- | ------------------------- | ---------------- |
| POST | `collect-lineage`         | 采集血缘         |
| POST | `get-lineage-graph`       | 获取血缘图       |
| POST | `get-field-lineage-graph` | 获取字段血缘图   |
| POST | `impact-analysis`         | 影响分析         |
| POST | `export-impact-analysis`  | 导出影响分析     |
| POST | `get-execution`           | 获取任务执行信息 |

总计 **44** 个API端点。

### 4. 数据集成 (data-integration)

**功能：** 数据源管理、数据采集、SQL执行

**API 端点：** `/api/data-integration/*`

| 方法 | 端点                       | 功能             |
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

总计 **11** 个API端点。

## API 文档

启动服务后访问：`http://localhost:3002/api`

**Swagger UI** 提供：

- 完整的API文档
- 在线请求测试
- 请求/响应schema查看

## 配置

| 环境变量 | 说明         | 默认值 |
| -------- | ------------ | ------ |
| `PORT`   | 服务监听端口 | `3002` |

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

## 运行

```bash
# 开发模式
npm -w @ai-datahub/data-service-service run dev

# 构建
npm -w @ai-datahub/data-service-service run build

# 启动
node dist/main.js
```

## 端口

- `data-service-service`: `3002`
- `metadata-service`: `3001`

## 测试

```bash
# 运行所有测试
npm -w @ai-datahub/data-service-service run test

# 运行特定模块测试
npm -w @ai-datahub/data-service-service run test data-integration
```
