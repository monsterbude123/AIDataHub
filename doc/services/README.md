# 微服务规划（doc/services）

本目录用于规划基于 **AI DataHub Contract/SDK** 的微服务落地路径。

约定：

- 先以 **MVP** 方式确定“服务模板 + 端到端样板服务”，再复制到其余 bounded context。
- 服务端技术栈：**Node.js + NestJS + REST/JSON**。
- 契约唯一真源：`doc/design/sdk/phase-3-contracts/` 与生成的 `packages/contract`。

## 基础核心层（建议优先）

- `metadata-service`
- `data-service-service`
- `system-auth-service`
- `task-scheduler-service`
- `data-integration-service`
- `data-organization-service`

> 说明：命名暂以 `*-service` 结尾，后续可在 ADR 中统一命名规范（例如去掉重复的 `service`）。
