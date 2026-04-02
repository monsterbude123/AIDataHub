# data-integration-service（数据接入集成）

> **当前状态**：已作为模块在 `data-service-service` 中实现。
>
> - **代码位置**：`services/data-service-service/src/modules/data-integration/`
> - **Contract 来源**：`@ai-datahub/contract/DataIntegrationClient`
> - **网关路由**：`/api/data/integration/*`（通过 data-service-service 代理）
> - **规划文档**：本文档保留作为独立服务拆分参考
> - **拆分条件**：数据接入规模增长、需要独立部署扩展时

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
