# OpsService - 运维调度服务

## 服务定位

运维监控与任务调度中心，负责告警管理、执行运维、运营报表、ETL连接管理、数据集同步监控以及统一任务调度。

## 服务信息

| 项目     | 值                   |
| -------- | -------------------- |
| 服务名称 | ops-service          |
| 端口     | 3001                 |
| 网关前缀 | `/api/ops/*`         |
| 实现状态 | 🟡 部分已实现（MVP） |

## 包含模块

| 模块                | 职责                                                          | Contract 来源                               |
| ------------------- | ------------------------------------------------------------- | ------------------------------------------- |
| **data-operations** | 告警规则、执行运维、运营报表、数据源健康、ETL连接、数据集同步 | `@ai-datahub/contract/DataOperationsClient` |
| **task-scheduler**  | DAG定义、队列管理、执行调度                                   | `@ai-datahub/contract/TaskSchedulerClient`  |

## API 端点清单

### 告警管理 (`/api/ops/alerts/*`)

| 方法   | 端点                           | 功能                      |
| ------ | ------------------------------ | ------------------------- |
| POST   | `/api/ops/alerts/rules`        | 创建告警规则              |
| PUT    | `/api/ops/alerts/rules`        | 更新告警规则              |
| DELETE | `/api/ops/alerts/rules/:id`    | 删除告警规则              |
| GET    | `/api/ops/alerts/rules`        | 列出告警规则（数组）      |
| GET    | `/api/ops/alerts/rules/search` | 查询告警规则（分页/过滤） |
| GET    | `/api/ops/alerts/channels`     | 列出告警渠道配置          |
| POST   | `/api/ops/alerts/channels`     | 更新告警渠道配置          |

### 执行运维 (`/api/ops/executions/*`)

| 方法 | 端点                            | 功能                 |
| ---- | ------------------------------- | -------------------- |
| GET  | `/api/ops/executions`           | 列出执行记录（分页） |
| GET  | `/api/ops/executions/:id`       | 获取执行详情         |
| POST | `/api/ops/executions/:id/rerun` | 重跑执行             |
| POST | `/api/ops/reconcile`            | 数据对账             |
| POST | `/api/ops/executor-strategy`    | 设置执行器策略       |
| POST | `/api/ops/retry-policy`         | 设置重试策略         |
| POST | `/api/ops/offline`              | 离线任务             |
| POST | `/api/ops/priority`             | 设置任务优先级       |

### 运营报表 (`/api/ops/report/*`)

| 方法 | 端点              | 功能            |
| ---- | ----------------- | --------------- |
| GET  | `/api/ops/report` | 获取运营报表 ✅ |

### 数据源健康 (`/api/ops/health/*`)

| 方法 | 端点              | 功能                          |
| ---- | ----------------- | ----------------------------- |
| GET  | `/api/ops/health` | 列出数据源健康状态（分页） ✅ |

### ETL 连接管理 (`/api/ops/etl/*`)

| 方法   | 端点                           | 功能                   |
| ------ | ------------------------------ | ---------------------- |
| POST   | `/api/ops/etl/connections`     | 创建ETL连接 ✅         |
| PUT    | `/api/ops/etl/connections`     | 更新ETL连接 ✅         |
| DELETE | `/api/ops/etl/connections/:id` | 删除ETL连接 ✅         |
| GET    | `/api/ops/etl/connections`     | 列出ETL连接（分页） ✅ |

### 数据集同步监控 (`/api/ops/sync/*`)

| 方法 | 端点                                | 功能                          |
| ---- | ----------------------------------- | ----------------------------- |
| GET  | `/api/ops/sync/records`             | 列出数据集同步记录（分页） ✅ |
| POST | `/api/ops/sync/records/:id/compare` | 比较数据集版本                |
| POST | `/api/ops/sync/records/:id/publish` | 发布/回滚数据集版本           |

### 任务调度 (`/api/ops/scheduler/*`)

| 方法 | 端点                                | 功能         |
| ---- | ----------------------------------- | ------------ |
| POST | `/api/ops/scheduler/dag/create`     | 创建DAG      |
| POST | `/api/ops/scheduler/dag/update`     | 更新DAG      |
| POST | `/api/ops/scheduler/dag/delete`     | 删除DAG      |
| POST | `/api/ops/scheduler/dag/list`       | 列出DAG      |
| POST | `/api/ops/scheduler/dag/trigger`    | 触发DAG      |
| POST | `/api/ops/scheduler/task/trigger`   | 触发任务     |
| POST | `/api/ops/scheduler/queue/create`   | 创建队列     |
| POST | `/api/ops/scheduler/queue/update`   | 更新队列     |
| POST | `/api/ops/scheduler/queue/delete`   | 删除队列     |
| POST | `/api/ops/scheduler/queue/list`     | 列出队列     |
| POST | `/api/ops/scheduler/execution/list` | 列出执行     |
| POST | `/api/ops/scheduler/execution/get`  | 获取执行详情 |
| POST | `/api/ops/scheduler/execution/stop` | 停止执行     |
| POST | `/api/ops/scheduler/execution/log`  | 获取执行日志 |

## 依赖服务

| 服务                | 依赖原因           |
| ------------------- | ------------------ |
| system-auth-service | 用户认证、权限校验 |
| metadata-service    | 数据源元数据查询   |
| integration-service | 告警通知发送       |

## 当前实现补充（统一安全基线）

- 已接入共享鉴权与审计模板（`@ai-datahub/shared`）
- 除 `GET /health` 外，所有接口要求 `Authorization: Bearer <token>`
- 写操作（`POST/PUT/DELETE`）自动记录审计日志（含 traceId/userId/耗时）
- 已补充行为级 E2E：强制 `x-require-auth: true` 且缺少 token 返回 `401`

## 目录结构

```
services/ops-service/
├── src/
│   ├── main.ts
│   ├── AppModule.ts
│   ├── common/
│   │   ├── errors/
│   │   ├── guards/
│   │   └── database/
│   └── modules/
│       ├── data-operations/
│       │   ├── data-operations.module.ts
│       │   ├── data-operations.controller.ts
│       │   ├── data-operations.service.ts
│       │   └── repositories/
│       │       ├── alert-rule.repository.ts
│       │       ├── alert-channel.repository.ts
│       │       ├── etl-connection.repository.ts
│       │       └── dataset-sync.repository.ts
│       └── task-scheduler/
│           ├── task-scheduler.module.ts
│           ├── task-scheduler.controller.ts
│           ├── task-scheduler.service.ts
│           └── repositories/
│               ├── dag.repository.ts
│               ├── queue.repository.ts
│               └── execution.repository.ts
├── test/
├── package.json
└── tsconfig.json
```

## 数据存储建议

| 数据类型          | 存储选型                | 说明                       |
| ----------------- | ----------------------- | -------------------------- |
| 告警规则/渠道配置 | PostgreSQL              | 结构化配置数据             |
| 执行记录          | PostgreSQL + ClickHouse | 热数据PG，历史数据分析用CH |
| DAG定义           | PostgreSQL              | 结构化配置                 |
| 执行日志          | ClickHouse              | 高吞吐日志写入             |

## 开发注意事项

1. **迁移 task-scheduler**：从 `data-service-service/src/modules/task-scheduler/` 迁移现有实现
2. **告警通知集成**：复用 `integration-service` 的通知能力
3. **调度幂等**：所有调度操作支持幂等键
4. **traceId 透传**：全链路追踪标识
