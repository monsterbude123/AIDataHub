# task-scheduler-service（统一任务调度中心）

## 模块定位

统一任务调度中心，负责 DAG 编排、调度策略、队列与优先级、统一日志管理。

## 归属服务

| 项目     | 值                                                |
| -------- | ------------------------------------------------- |
| 所属服务 | **ops-service**（规划中）                         |
| 当前实现 | `services/task-scheduler-service/`                |
| 网关前缀 | `/api/tasks/*` → 将迁移至 `/api/ops/scheduler/*`  |
| 实现状态 | ✅ 已实现（独立服务） → 📋 规划迁移到 ops-service |

## 实现位置

```
services/task-scheduler-service/src/modules/scheduler/
├── scheduler.module.ts
├── scheduler.controller.ts
├── scheduler.service.ts
├── entities/
└── repositories/
```

## Wave 0（归属迁移计划）

**决策**：将 `task-scheduler` 能力聚合到 `ops-service`，形成统一的运维调度中心。

**原因**：

- `data-operations`（告警、执行运维）与 `task-scheduler`（DAG 调度）同属运维领域
- 避免调度能力碎片化，统一入口便于监控和运维

**迁移计划**：

1. 📋 在 `ops-service` 中创建 `task-scheduler` 模块
2. 📋 迁移现有调度逻辑到 `ops-service/src/modules/task-scheduler/`
3. 📋 更新 API Gateway 路由：`/api/tasks/*` → `/api/ops/scheduler/*`
4. 📋 保留原 `task-scheduler-service` 作为过渡，完成后下线

## 职责边界

- 对应 bounded context：`task-scheduler`
- 范围：DAG 编排、调度策略、队列与优先级、统一日志中心
- 不包含：各模块任务定义与业务逻辑（由各模块服务提供）

## 依赖

- 契约：`@ai-datahub/contract`（task-scheduler 相关 client/DTO）
- 执行器：K8s Job / Yarn / Spark / 自研 worker（实现层适配）
- 存储：PostgreSQL（任务、运行、依赖）+ 对象存储（日志）

## API 端点

- `GET /scheduler/status`

说明：经 API Gateway 访问为 `GET /api/tasks/scheduler/status`（网关会 stripPrefix）。
