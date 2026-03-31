# 微服务规划（doc/services）

本目录用于规划基于 **AI DataHub Contract/SDK** 的微服务落地路径。

约定：

- 先以 **MVP** 方式确定“服务模板 + 端到端样板服务”，再复制到其余 bounded context。
- 服务端技术栈：**Node.js + NestJS + REST/JSON**。
- 契约唯一真源：`doc/design/sdk/phase-3-contracts/` 与生成的 `packages/contract`。

## 全链路位置说明（面向 AI 开发者）

```text
Next.js UI -> SDK/BFF 调用层 -> NestJS Services -> 数据与计算基础设施
```

- 本目录只负责 **NestJS Services 层** 的服务规划。
- UI 层需求与页面交互，请在前端工程文档处理。
- SDK/BFF 的调用约定，请以 `packages/sdk` 与 `packages/contract` 为准。
- 基础设施选型（数据库、对象存储、计算引擎）由各服务文档的“数据存储建议”约束。

## 基础核心层（建议优先）

- `metadata-service`
- `data-service-service`
- `system-auth-service`
- `task-scheduler-service`
- `data-integration-service`
- `data-organization-service`

> 说明：命名暂以 `*-service` 结尾，后续可在 ADR 中统一命名规范（例如去掉重复的 `service`）。
