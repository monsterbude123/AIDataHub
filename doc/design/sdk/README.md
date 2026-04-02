# 数据中台 SDK 设计手册（分阶段·契约先行）

本目录用于承载"数据中台 / 大数据平台"的 **SDK 式渐构建设**设计手册，严格遵循：

- **DDD 限界上下文**：按业务边界拆分为可插拔 SDK 模块
- **契约先行（Contract First）**：先定义共享实体与模块接口契约，再并行实现
- **阶段隔离**：阶段 1/2/3/4 文档严格隔离，禁止前置阶段混入后置阶段内容

---

## 模块与服务映射

| 模块                       | 所属服务             | 网关前缀                    | Contract 文件               |
| -------------------------- | -------------------- | --------------------------- | --------------------------- |
| **auth**                   | system-auth-service  | `/api/auth/*`               | `system-auth.ts`            |
| **metadata**               | metadata-service     | `/api/metadata/*`           | `metadata.ts`               |
| **data-organization**      | data-service-service | `/api/data/*`               | `data-organization.ts`      |
| **data-integration**       | data-service-service | `/api/data/*`               | `data-integration.ts`       |
| **cost-management**        | data-service-service | `/api/data/*`               | `cost-management.ts`        |
| **data-governance-core**   | data-service-service | `/api/data/*`               | `data-governance-core.ts`   |
| **data-governance-ops**    | data-service-service | `/api/data/*`               | `data-governance-ops.ts`    |
| **data-operations**        | ops-service          | `/api/ops/*`                | `data-operations.ts`        |
| **task-scheduler**         | ops-service          | `/api/ops/scheduler/*`      | `task-scheduler.ts`         |
| **system-integration**     | integration-service  | `/api/integration/*`        | `system-integration.ts`     |
| **system-admin**           | admin-service        | `/api/admin/*`              | `system-admin.ts`           |
| **data-sharing**           | sharing-service      | `/api/sharing/*`            | `data-sharing.ts`           |
| **self-service-analytics** | analytics-service    | `/api/analytics/*`          | `self-service-analytics.ts` |
| **data-security**          | security-service     | `/api/security/*`           | `data-security.ts`          |
| **data-lifecycle**         | security-service     | `/api/security/lifecycle/*` | `data-lifecycle.ts`         |
| **datasource**             | metadata-service     | `/api/metadata/*`           | `datasource.ts`             |

---

## 文档导航（必须按顺序阅读）

### 阶段 1：SDK 模块划分（一级索引）

- `phase-1-modules.md`

### 阶段 2：模块功能点定义（二级索引）

- `phase-2-capabilities.md`

### 阶段 3：SDK 契约（方法级定义，按模块分卷）

- `phase-3-contracts/00-shared-entities.md`（跨模块共享实体与通用契约规则）
- `phase-3-contracts/*.md`（16 个模块的对外接口 + Mock 规则）

### 阶段 4：项目专属 Agent 角色

- `phase-4-agents.md`

---

## 附录（仅在阶段 1-4 全部完成后阅读）

- 并行开发支撑机制与版本兼容规则
  - `appendix-parallel-and-versioning.md`
- 渐构式建设路径（基础核心→业务能力→治理安全）与 MVP 交付清单
  - `appendix-roadmap.md`

---

## 目录约定（必须遵守）

### 1) "SDK"指代与落地形态

- 本手册的 SDK 指 **TypeScript / Node** 生态的 npm 包（模块化包或 monorepo package）。
- 阶段 3 的契约以 **TypeScript 类型（types）+ 接口（interface）+ 传输模型（DTO）** 为中心，不绑定具体传输协议（HTTP/gRPC/消息）实现。

### 2) 阶段隔离红线

- `phase-1-*`：只允许"模块名称 / 限界上下文边界 / 核心领域定位"
- `phase-2-*`：只允许"功能点清单 + 对外/内部能力标注"
- `phase-3-*`：只允许"实体字段 / 接口入参出参 / 错误码 / 幂等 / Mock"
- `phase-4-*`：只允许"Agent 角色职责 / 输入输出 / 门禁"

### 3) 术语与字段命名

- 共享实体的字段名、枚举、错误码在 `phase-3-contracts/00-shared-entities.md` 统一定义。
- 任何模块不得自创同义字段（例如 `orgId`/`organizationId` 只能选其一）；如需扩展，必须走"兼容规则"。

---

## 服务分层架构

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          API Gateway (:3000)                            │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
        ▼                           ▼                           ▼
┌───────────────┐         ┌───────────────┐         ┌───────────────┐
│ Infrastructure│         │ Business Layer│         │ Governance    │
│ Services      │         │ Services      │         │ Services      │
├───────────────┤         ├───────────────┤         ├───────────────┤
│ auth-service  │         │ ops-service   │         │ security-svc  │
│ metadata-svc  │         │ admin-service │         │               │
│ data-service  │         │ sharing-svc   │         │               │
│               │         │ analytics-svc │         │               │
│               │         │ integration-sv│         │               │
└───────────────┘         └───────────────┘         └───────────────┘
```

---

## 相关文档

- 架构全景：`doc/ARCHITECTURE.md`
- 服务规划：`doc/services/README.md`
- 领域服务计划：`doc/plans/2026-04-02-domain-services-plan.md`
