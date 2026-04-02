# DataService - 数据服务聚合服务

> **MVP 架构说明**：此服务当前聚合了多个 bounded context，采用"先合并后拆分"策略。各模块可按需独立拆分为微服务。

## 服务信息

| 项目     | 值                   |
| -------- | -------------------- |
| 服务名称 | data-service-service |
| 端口     | 4003                 |
| 网关前缀 | `/api/data/*`        |
| 实现状态 | ✅ 已实现            |

## 包含模块

| 模块                     | 职责                                             | API 前缀                      | Contract 来源             |
| ------------------------ | ------------------------------------------------ | ----------------------------- | ------------------------- |
| **data-organization**    | 数据分层组织、资产映射                           | `/api/data/organization/*`    | `data-organization.ts`    |
| **data-integration**     | 数据源管理、连接测试、元数据采集、SQL 执行       | `/api/data/integration/*`     | `data-integration.ts`     |
| **cost-management**      | 成本管理、配额、优化建议                         | `/api/data/cost/*`            | `cost-management.ts`      |
| **data-governance-core** | 数据治理核心：标准定义、字典、数据模型、审计任务 | `/api/data/governance-core/*` | `data-governance-core.ts` |
| **data-governance-ops**  | 数据治理运营：质量规则、标签、执行任务           | `/api/data/governance-ops/*`  | `data-governance-ops.ts`  |

## 职责边界

### data-organization 模块

- 范围：数据分层组织管理（分层目录、资产映射）
- 不包含：数据共享交换业务流程（归 `sharing-service`）

### data-integration 模块

- 范围：数据源管理、连接测试、接入任务提交、初始元数据采集、探查、SQL 开发执行
- 不包含：元数据全生命周期管理（归 `metadata-service`）

### cost-management 模块

- 范围：成本分析、配额管理、优化建议
- 不包含：任务调度执行（归 `ops-service`）

### data-governance-core 模块

- 范围：数据标准定义、数据字典、数据模型管理、审计任务定义
- 不包含：质量规则执行（归 `data-governance-ops`）

### data-governance-ops 模块

- 范围：数据质量规则、数据标签、治理执行任务
- 不包含：安全策略管理（归 `security-service`）

## 依赖服务

| 服务                | 依赖原因                 |
| ------------------- | ------------------------ |
| system-auth-service | 用户认证、权限校验       |
| metadata-service    | 元数据查询、数据源元信息 |
| ops-service         | 任务调度执行             |

## API 端点清单

### data-organization 端点

| 方法 | 端点                              | 功能         |
| ---- | --------------------------------- | ------------ |
| GET  | `/api/data/organization/layers`   | 列出分层目录 |
| POST | `/api/data/organization/layers`   | 创建分层目录 |
| GET  | `/api/data/organization/mappings` | 列出资产映射 |
| POST | `/api/data/organization/mappings` | 创建资产映射 |

### data-integration 端点

| 方法 | 端点                                          | 功能           |
| ---- | --------------------------------------------- | -------------- |
| POST | `/api/data/integration/data-sources`          | 创建数据源     |
| GET  | `/api/data/integration/data-sources`          | 列出数据源     |
| POST | `/api/data/integration/data-sources/:id/test` | 测试数据源连接 |
| POST | `/api/data/integration/sync-jobs`             | 创建同步任务   |

### cost-management 端点

| 方法 | 端点                                | 功能         |
| ---- | ----------------------------------- | ------------ |
| POST | `/api/data/cost/series`             | 获取成本序列 |
| GET  | `/api/data/cost/quotas`             | 获取配额列表 |
| POST | `/api/data/cost/optimization-hints` | 获取优化建议 |

### data-governance-core 端点

| 方法 | 端点                                     | 功能         |
| ---- | ---------------------------------------- | ------------ |
| GET  | `/api/data/governance-core/standards`    | 列出数据标准 |
| POST | `/api/data/governance-core/standards`    | 创建数据标准 |
| GET  | `/api/data/governance-core/dictionaries` | 列出数据字典 |
| POST | `/api/data/governance-core/audit-tasks`  | 创建审计任务 |

### data-governance-ops 端点

| 方法 | 端点                                       | 功能         |
| ---- | ------------------------------------------ | ------------ |
| GET  | `/api/data/governance-ops/quality-rules`   | 列出质量规则 |
| POST | `/api/data/governance-ops/quality-rules`   | 创建质量规则 |
| GET  | `/api/data/governance-ops/tags`            | 列出数据标签 |
| POST | `/api/data/governance-ops/execution-tasks` | 创建执行任务 |

## 目录结构

```
services/data-service-service/
├── src/
│   ├── main.ts
│   ├── AppModule.ts
│   ├── controllers/
│   │   └── HealthController.ts
│   └── modules/
│       ├── data-organization/
│       ├── data-integration/
│       ├── cost-management/
│       ├── data-governance-core/
│       └── data-governance-ops/
├── test/
├── package.json
└── tsconfig.json
```

## 数据存储建议

| 数据类型   | 存储选型                | 说明                 |
| ---------- | ----------------------- | -------------------- |
| 数据源配置 | PostgreSQL              | 加密存储连接信息     |
| 成本数据   | PostgreSQL + ClickHouse | 热数据PG，历史分析CH |
| 治理规则   | PostgreSQL              | 结构化配置数据       |
| 审计日志   | ClickHouse              | 高吞吐日志写入       |

## 变更历史

### 2026-04-02

- 从服务中移除 `task-scheduler` 模块（已迁移到 `ops-service`）
- 当前包含 5 个模块：data-organization, data-integration, cost-management, data-governance-core, data-governance-ops
