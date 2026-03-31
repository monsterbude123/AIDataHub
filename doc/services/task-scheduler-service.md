# task-scheduler-service（统一任务调度中心）开发计划

## 1. 职责边界

- 对应 bounded context：`task-scheduler`
- 范围：DAG 编排、调度策略、队列与优先级、统一日志中心
- 不包含：各模块任务定义与业务逻辑（由各模块服务提供）

## 2. 依赖

- 契约：`@ai-datahub/contract`（task-scheduler 相关 client/DTO）
- 执行器：K8s Job / Yarn / Spark / 自研 worker（实现层适配）
- 存储：PostgreSQL（任务、运行、依赖）+ 对象存储（日志）

## 3. MVP 建议

- Cron 调度 + 手动触发
- 任务状态机（READY/RUNNING/SUCCESS/FAILED）
- 最小 DAG（线性依赖）+ 失败重试策略
