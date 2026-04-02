# AI DataHub 架构全景

## 系统定位

AI DataHub 是一个以 **DDD + Contract First** 为核心的数据中台工程，采用"SDK 独立发布 + 微服务实现 + 前端门户"的分层架构，支持并行开发与长期演进。

## 标准调用链（必须遵循）

```text
Next.js UI
    -> SDK/BFF 调用层
        -> NestJS Services（按 bounded context 划分）
            -> 数据与计算基础设施（DB/对象存储/消息/调度/计算引擎）
```

该链路用于约束后续 AI 开发者：

- 前端不直接访问数据库或计算引擎
- 业务能力必须通过服务层暴露
- 服务接口必须先对齐 `@ai-datahub/contract`
- SDK 负责调用封装，不承载业务状态

---

## 架构全景图

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              API Gateway (:3000)                                 │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │ Domain-Grouped Routes                                                       │ │
│  │                                                                             │ │
│  │  /api/auth      /api/metadata    /api/data                                │ │
│  │  /api/ops       /api/integration /api/admin                                │ │
│  │  /api/sharing   /api/analytics   /api/security                            │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
        │           │              │            │             │            │
        ▼           ▼              ▼            ▼             ▼            ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                              NestJS Services Layer                               │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐                    │
│  │ Infrastructure  │ │ Business Layer  │ │ Governance      │                    │
│  │ Services        │ │ Services        │ │ Services        │                    │
│  ├─────────────────┤ ├─────────────────┤ ├─────────────────┤                    │
│  │ auth-service    │ │ ops-service     │ │ security-service│                    │
│  │ :4001           │ │ :3001           │ │ :3006           │                    │
│  │                 │ │                 │ │                 │                    │
│  │ metadata-service│ │ admin-service   │ │                 │                    │
│  │ :4002           │ │ :3003           │ │                 │                    │
│  │                 │ │                 │ │                 │                    │
│  │ data-service    │ │ sharing-service │ │                 │                    │
│  │ :4003           │ │ :3004           │ │                 │                    │
│  │                 │ │                 │ │                 │                    │
│  │                 │ │ analytics-svc   │ │                 │                    │
│  │                 │ │ :3005           │ │                 │                    │
│  │                 │ │                 │ │                 │                    │
│  │                 │ │ integration-svc │ │                 │                    │
│  │                 │ │ :3002           │ │                 │                    │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘                    │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                              Data & Infrastructure Layer                         │
├──────────────────────────────────────────────────────────────────────────────────┤
│  PostgreSQL    Redis    MinIO/OSS    Kafka    ClickHouse    Spark/Flink        │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 服务清单

### 基础设施层服务

| 服务                     | 端口 | 网关前缀          | 包含模块                                                                                        | 职责                                       |
| ------------------------ | ---- | ----------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------ |
| **system-auth-service**  | 4001 | `/api/auth/*`     | auth, user, role, permission, organization, menu, approval                                      | 认证授权、审批框架                         |
| **metadata-service**     | 4002 | `/api/metadata/*` | metadata                                                                                        | 元数据管理                                 |
| **data-service-service** | 4003 | `/api/data/*`     | data-organization, data-integration, cost-management, data-governance-core, data-governance-ops | 数据资产管理、数据集成、成本管理、数据治理 |

### 业务能力层服务

| 服务                    | 端口 | 网关前缀             | 包含模块                        | 职责                   |
| ----------------------- | ---- | -------------------- | ------------------------------- | ---------------------- |
| **ops-service**         | 3001 | `/api/ops/*`         | data-operations, task-scheduler | 运维监控、任务调度     |
| **integration-service** | 3002 | `/api/integration/*` | system-integration              | 系统集成、连接器管理   |
| **admin-service**       | 3003 | `/api/admin/*`       | system-admin                    | 系统管理、项目管理     |
| **sharing-service**     | 3004 | `/api/sharing/*`     | data-sharing                    | 数据共享、交换门户     |
| **analytics-service**   | 3005 | `/api/analytics/*`   | self-service-analytics          | 自助分析、查询可视化   |
| **security-service**    | 3006 | `/api/security/*`    | data-security, data-lifecycle   | 数据安全、生命周期管理 |

---

## 分层职责

### 1) Next.js UI（交互层）

- 负责页面、交互、可视化、用户会话
- 可包含轻量 BFF（聚合多个服务调用）
- 不承载核心领域规则

### 2) SDK/BFF（调用编排层）

- SDK：提供稳定类型化调用入口（Result/Error/Trace 统一）
- BFF：按页面/场景聚合服务接口，减少前端复杂度
- 仅做编排、鉴权透传、错误统一，不做领域持久化

### 3) NestJS Services（领域能力层）

- 按**领域聚合**划分服务（非"一模块一服务"）
- 负责领域规则、权限控制、幂等、审计、任务编排
- 统一输出契约定义的返回模型

### 4) 数据与计算基础设施（资源层）

- 数据库（PostgreSQL/ClickHouse 等）
- 对象存储（MinIO/OSS）
- 调度与任务执行（Task Scheduler / Worker / Spark 等）
- 消息与集成（Kafka/RocketMQ/通知渠道）

---

## 技术栈基线

- 前端：Next.js（React）
- 后端：NestJS（REST/JSON）
- 语言：TypeScript（strict）
- 包管理：npm workspaces
- 构建：tsup（包） + TypeScript
- 测试：Vitest（当前），后续可按服务引入 Jest/Nest testing 体系
- 契约：`packages/contract`
- SDK：`packages/sdk`
- 服务模板：`services/*`

---

## 领域边界说明

### OpsDomain（运维调度域）

- **ops-service**：运维监控 + 任务调度
- 核心能力：告警管理、执行运维、运营报表、ETL连接、数据集同步、DAG调度

### IntegrationDomain（集成域）

- **integration-service**：外部系统连接器
- 核心能力：IDP集成、通知发送、消息发布、文件存储

### AdminDomain（管理域）

- **admin-service**：系统管理
- 核心能力：项目管理、函数管理、驱动管理、操作日志、工单管理

### SharingDomain（共享域）

- **sharing-service**：数据共享交换
- 核心能力：资源目录、资源登记/编制、共享服务、服务申请审批

### AnalyticsDomain（分析域）

- **analytics-service**：自助分析
- 核心能力：查询管理、查询执行、可视化配置、数据探索

### SecurityDomain（安全域）

- **security-service**：数据安全与生命周期
- 核心能力：脱敏、分级分类、行级权限、水印、加密、生命周期管理

---

## AI 开发者执行提示

1. 先确认变更所在层级（UI / SDK/BFF / Service / Infra），禁止跨层偷实现。
2. 修改接口前先更新 Contract，再同步 SDK 与 Service。
3. Service 发生异常时必须返回结构化错误（不可静默吞错）。
4. 所有写操作优先支持 `idempotencyKey`，全链路透传 `traceId`。
5. 新增服务时先在 `doc/services/` 创建开发计划，再开始代码实现。
6. 每个模块必须有对应的文档（`doc/services/*.md`），无文档不算完成。

---

## 相关文档

- 架构决策：`doc/DECISIONS.md`
- 服务规划：`doc/services/README.md`
- 设计手册入口：`doc/design/sdk/README.md`
- 领域服务计划：`doc/plans/2026-04-02-domain-services-plan.md`
- 规划文档索引：`doc/plans/README.md`
- SDK 开发计划：`doc/plans/2026-04-02-sdk-development-plan.md`
