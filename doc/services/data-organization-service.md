# data-organization-service（数据分层组织）

> **当前状态**：已作为模块在 `data-service-service` 中实现。
>
> - **代码位置**：`services/data-service-service/src/modules/data-organization/`
> - **Contract 来源**：`@ai-datahub/contract/DataOrganizationClient`
> - **网关路由**：`/api/data/organization/*`（通过 data-service-service 代理）

## 1. 职责边界

- 对应 bounded context：`data-organization`
- 范围：业务库/原始库/资源库/主题库四级分层组织、入库映射与任务管理
- 不包含：治理标准定义（归 `data-governance-core`）

## 2. 依赖

- 契约：`@ai-datahub/contract`
- 上游：`data-integration-service`（接入产物/标准化产物）
- 调度：`task-scheduler-service`

## 3. MVP 建议

- 分层目录树 + 资源登记
- 最小字段映射（标准表→资源库表）
- 入库任务提交与监控（委托调度中心）
