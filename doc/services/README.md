# 微服务规划（doc/services）

本目录用于规划基于 **AI DataHub Contract/SDK** 的微服务落地路径。

约定：

- 先以 **MVP** 方式确定”服务模板 + 端到端样板服务”，再复制到其余 bounded context。
- 服务端技术栈：**Node.js + NestJS + REST/JSON**。
- 契约唯一真源：`doc/design/sdk/phase-3-contracts/` 与生成的 `packages/contract`。

## 全链路位置说明（面向 AI 开发者）

```text
Next.js UI -> SDK/BFF 调用层 -> NestJS Services -> 数据与计算基础设施
```

- 本目录只负责 **NestJS Services 层** 的服务规划。
- UI 层需求与页面交互，请在前端工程文档处理。
- SDK/BFF 的调用约定，请以 `packages/sdk` 与 `packages/contract` 为准。
- 基础设施选型（数据库、对象存储、计算引擎）由各服务文档的”数据存储建议”约束。

## 当前 MVP 架构状态

> **重要**：MVP 阶段采用”先合并后拆分”策略，多个 bounded context 合并在同一服务中实现。

### 已实现服务

| 服务                     | 状态            | 包含模块（bounded context）                                                  |
| ------------------------ | --------------- | ---------------------------------------------------------------------------- |
| **metadata-service**     | ✅ 已实现       | metadata（元数据管理）                                                       |
| **data-service-service** | ✅ 已实现       | cost-management, data-governance-core, data-governance-ops, data-integration |
| **system-auth-service**  | ⚠️ 有文档无代码 | auth, user, role, permission, organization, menu, approval 等                |

### 服务目录与模块对照

```
services/
├── metadata-service/          # 独立服务
│   └── src/modules/metadata/
├── data-service-service/      # MVP 合并服务（4个模块）
│   └── src/modules/
│       ├── cost-management/
│       ├── data-governance-core/
│       ├── data-governance-ops/
│       └── data-integration/
└── system-auth-service/       # 规划中（仅有 README）
```

### 计划拆分的服务

以下服务当前已作为模块在 `data-service-service` 中实现，未来可按需拆分为独立服务：

| 规划服务                 | 当前位置                                        | 拆分条件                 |
| ------------------------ | ----------------------------------------------- | ------------------------ |
| data-integration-service | data-service-service/modules/data-integration   | 数据接入规模增长时拆分   |
| data-governance-service  | data-service-service/modules/data-governance-\* | 治理规则复杂度增加时拆分 |
| cost-management-service  | data-service-service/modules/cost-management    | 成本核算独立运营时拆分   |

## 规划中的独立服务

| 服务                          | 优先级 | 说明                                |
| ----------------------------- | ------ | ----------------------------------- |
| **task-scheduler-service**    | 高     | 统一任务调度中心，其他服务依赖      |
| **data-organization-service** | 中     | 数据分层组织，依赖 data-integration |

> 说明：命名暂以 `*-service` 结尾，后续可在 ADR 中统一命名规范（例如去掉重复的 `service`）。
