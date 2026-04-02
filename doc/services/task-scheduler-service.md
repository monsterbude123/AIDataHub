# task-scheduler-service（统一任务调度中心）

## 模块定位

统一任务调度中心，负责 DAG 编排、调度策略、队列与优先级、统一日志管理。

## 归属服务

| 项目     | 值                     |
| -------- | ---------------------- |
| 所属服务 | task-scheduler-service |
| 网关前缀 | `/api/tasks/*`         |
| 实现状态 | ✅ 已实现              |

## 实现位置

```
services/task-scheduler-service/src/modules/scheduler/
├── scheduler.module.ts
├── scheduler.controller.ts
├── scheduler.service.ts
├── entities/
└── repositories/
```

## Wave 0（归属冲突修正）

**问题**：历史上 `data-service-service/src/modules/task-scheduler/` 与独立的 `services/task-scheduler-service/` 同时存在，导致调度能力重复实现、边界不清晰。

**处理**：

1. ✅ 从 `data-service-service` 移除 `TaskSchedulerModule` 注册
2. ✅ 删除 `data-service-service/src/modules/task-scheduler/` 目录下的实现代码
3. ✅ 统一调度能力归口到 `task-scheduler-service`（由 API Gateway 通过 `/api/tasks/*` 转发）

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
