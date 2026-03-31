# data-integration-service（数据接入集成）开发计划

## 1. 职责边界

- 对应 bounded context：`data-integration`
- 范围：数据源管理、连接测试、接入任务提交、初始元数据采集、探查、SQL 开发执行（实现层）
- 不包含：元数据全生命周期管理（归 `metadata-service`）

## 2. 依赖

- 契约：`@ai-datahub/contract`
- 下游：JDBC/Hive/ES/File/ObjectStorage 连接器（实现层）
- 调度：`task-scheduler-service`（统一调度与日志）
- 标准：`data-governance-core`（标准定义），此服务负责执行映射/清洗

## 3. MVP 建议

- 数据源 CRUD + testConnection
- 初始元数据采集（表/字段）
- 提交接入任务 → 调度中心执行
