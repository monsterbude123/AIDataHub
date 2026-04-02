# 微服务规划（doc/services）

本目录用于规划基于 **AI DataHub Contract/SDK** 的微服务落地路径。

约定：

- 以 **领域聚合** 为边界划分服务（非"一个模块一个服务"）
- 服务端技术栈：**Node.js + NestJS + REST/JSON**
- 契约唯一真源：`doc/design/sdk/phase-3-contracts/` 与生成的 `packages/contract`

## 全链路位置说明（面向 AI 开发者）

```text
Next.js UI -> SDK/BFF 调用层 -> NestJS Services -> 数据与计算基础设施
```

- 本目录只负责 **NestJS Services 层** 的服务规划。
- UI 层需求与页面交互，请在前端工程文档处理。
- SDK/BFF 的调用约定，请以 `packages/sdk` 与 `packages/contract` 为准。
- 基础设施选型（数据库、对象存储、计算引擎）由各服务文档的"数据存储建议"约束。

---

## 服务架构总览

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              API Gateway (:3000)                                 │
│  /api/ops  /api/integration  /api/admin  /api/sharing  /api/analytics          │
│  /api/security  /api/auth  /api/metadata  /api/data                            │
└─────────────────────────────────────────────────────────────────────────────────┘
      │           │              │            │             │            │
      ▼           ▼              ▼            ▼             ▼            ▼
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ops-service│ │integration│ │admin-svc │ │sharing-svc│ │analytics│ │security │
│  :3001   │ │  :3002   │ │  :3003   │ │  :3004   │ │  :3005   │ │  :3006  │
└──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘
      │                                                        │
      │           ┌──────────┐ ┌──────────┐ ┌──────────┐       │
      │           │auth-svc  │ │metadata  │ │data-svc  │       │
      │           │  :4001   │ │  :4002   │ │  :4003   │       │
      │           └──────────┘ └──────────┘ └──────────┘       │
      │                 │            │            │            │
      └─────────────────┴────────────┴────────────┴────────────┘
                           PostgreSQL + Redis + MinIO
```

---

## 服务清单（按领域聚合）

### 基础设施层服务（已实现）

| 服务                     | 端口 | 网关前缀          | 包含模块                                                                                        | 状态      |
| ------------------------ | ---- | ----------------- | ----------------------------------------------------------------------------------------------- | --------- |
| **system-auth-service**  | 4001 | `/api/auth/*`     | auth, user, role, permission, organization, menu, approval                                      | ✅ 已实现 |
| **metadata-service**     | 4002 | `/api/metadata/*` | metadata                                                                                        | ✅ 已实现 |
| **data-service-service** | 4003 | `/api/data/*`     | data-organization, data-integration, cost-management, data-governance-core, data-governance-ops | ✅ 已实现 |

### 业务能力层服务（规划中）

| 服务                    | 端口 | 网关前缀             | 包含模块                        | 依赖服务                  |
| ----------------------- | ---- | -------------------- | ------------------------------- | ------------------------- |
| **ops-service**         | 3001 | `/api/ops/*`         | data-operations, task-scheduler | system-auth, metadata     |
| **integration-service** | 3002 | `/api/integration/*` | system-integration              | system-auth               |
| **admin-service**       | 3003 | `/api/admin/*`       | system-admin                    | system-auth               |
| **sharing-service**     | 3004 | `/api/sharing/*`     | data-sharing                    | system-auth, ops-service  |
| **analytics-service**   | 3005 | `/api/analytics/*`   | self-service-analytics          | metadata, data-service    |
| **security-service**    | 3006 | `/api/security/*`    | data-security, data-lifecycle   | system-auth, data-service |

---

## 领域聚合边界说明

### OpsDomain（ops-service）

**定位**：运维监控与任务调度中心

| 模块            | 职责                                                          | Contract 来源        |
| --------------- | ------------------------------------------------------------- | -------------------- |
| data-operations | 告警规则、执行运维、运营报表、数据源健康、ETL连接、数据集同步 | `data-operations.ts` |
| task-scheduler  | DAG 定义、队列管理、执行调度                                  | `task-scheduler.ts`  |

**网关路由**：

- `/api/ops/alerts/*` - 告警管理
- `/api/ops/executions/*` - 执行运维
- `/api/ops/scheduler/*` - 任务调度
- `/api/ops/etl/*` - ETL 连接管理
- `/api/ops/sync/*` - 数据集同步

### IntegrationDomain（integration-service）

**定位**：外部系统连接器管理

| 模块               | 职责                                     | Contract 来源           |
| ------------------ | ---------------------------------------- | ----------------------- |
| system-integration | 连接器管理、通知发送、消息发布、文件存储 | `system-integration.ts` |

**网关路由**：

- `/api/integration/connectors/*` - 连接器管理
- `/api/integration/notify` - 发送通知
- `/api/integration/publish` - 发布消息
- `/api/integration/files/*` - 文件上传下载

### AdminDomain（admin-service）

**定位**：系统管理与项目治理

| 模块         | 职责                                         | Contract 来源     |
| ------------ | -------------------------------------------- | ----------------- |
| system-admin | 项目管理、函数管理、驱动管理、操作日志、工单 | `system-admin.ts` |

**网关路由**：

- `/api/admin/projects/*` - 项目管理
- `/api/admin/project-groups/*` - 项目分组
- `/api/admin/functions/*` - 自定义函数
- `/api/admin/drivers/*` - 驱动管理
- `/api/admin/packages/*` - 包管理
- `/api/admin/logs/*` - 操作日志
- `/api/admin/tickets/*` - 工单管理

### SharingDomain（sharing-service）

**定位**：数据共享交换门户

| 模块         | 职责                                                       | Contract 来源     |
| ------------ | ---------------------------------------------------------- | ----------------- |
| data-sharing | 资源目录、资源登记、资源编制、资源挂接、共享服务、服务申请 | `data-sharing.ts` |

**网关路由**：

- `/api/sharing/portal/*` - 门户首页
- `/api/sharing/directories/*` - 资源目录
- `/api/sharing/resources/*` - 资源登记/编制
- `/api/sharing/mappings/*` - 资源挂接
- `/api/sharing/services/*` - 共享服务
- `/api/sharing/applications/*` - 服务申请

### AnalyticsDomain（analytics-service）

**定位**：自助分析平台

| 模块                   | 职责                                     | Contract 来源               |
| ---------------------- | ---------------------------------------- | --------------------------- |
| self-service-analytics | 查询保存、查询执行、可视化配置、数据探索 | `self-service-analytics.ts` |

**网关路由**：

- `/api/analytics/queries/*` - 查询管理
- `/api/analytics/visualizations/*` - 可视化配置
- `/api/analytics/explore` - 数据探索

### SecurityDomain（security-service）

**定位**：数据安全与生命周期治理

| 模块           | 职责                                               | Contract 来源       |
| -------------- | -------------------------------------------------- | ------------------- |
| data-security  | 脱敏算法/规则/配置、分级分类、行级权限、水印、加密 | `data-security.ts`  |
| data-lifecycle | 冷热温分层策略、归档恢复、过期删除、生命周期报表   | `data-lifecycle.ts` |

**网关路由**：

- `/api/security/masking/*` - 脱敏管理
- `/api/security/classification/*` - 分级分类
- `/api/security/row-level-policies/*` - 行级权限
- `/api/security/watermark/*` - 水印任务
- `/api/security/encryption/*` - 加密任务
- `/api/security/lifecycle/*` - 生命周期管理

---

## 服务目录结构

```
services/
├── api-gateway/              # API 网关（统一入口）
├── system-auth-service/      # 认证授权服务
├── metadata-service/         # 元数据服务
├── data-service-service/     # 数据服务（核心业务）
├── ops-service/              # 运维调度服务（规划中）
├── integration-service/      # 系统集成服务（规划中）
├── admin-service/            # 系统管理服务（规划中）
├── sharing-service/          # 数据共享服务（规划中）
├── analytics-service/        # 自助分析服务（规划中）
└── security-service/         # 数据安全服务（规划中）
```

---

## 开发优先级与波次

### Wave 0（优先修正）

- 修正 task-scheduler 归属冲突（从 data-service-service 迁移到 ops-service）

### Wave 1（并行）

- ops-service（data-operations + task-scheduler）
- admin-service（system-admin）

### Wave 2（并行，依赖 Wave 1）

- sharing-service（data-sharing）
- analytics-service（self-service-analytics）
- integration-service（system-integration）

### Wave 3（顺序）

- security-service（data-security → data-lifecycle）

---

## 文档索引

| 服务                 | 文档路径                                             | 实现状态             |
| -------------------- | ---------------------------------------------------- | -------------------- |
| system-auth-service  | [system-auth-service.md](./system-auth-service.md)   | ✅ 已实现            |
| metadata-service     | [metadata-service.md](./metadata-service.md)         | ✅ 已实现            |
| data-service-service | [data-service-service.md](./data-service-service.md) | ✅ 已实现            |
| ops-service          | [ops-service.md](./ops-service.md)                   | 🟡 部分已实现（MVP） |
| integration-service  | [integration-service.md](./integration-service.md)   | 🟡 部分已实现（MVP） |
| admin-service        | [admin-service.md](./admin-service.md)               | 🟡 部分已实现（MVP） |
| sharing-service      | [sharing-service.md](./sharing-service.md)           | 🟡 部分已实现（MVP） |
| analytics-service    | [analytics-service.md](./analytics-service.md)       | 🟡 部分已实现（MVP） |
| security-service     | [security-service.md](./security-service.md)         | 🟡 部分已实现（MVP） |

---

## 相关文档

- 架构全景：`doc/ARCHITECTURE.md`
- 架构决策：`doc/DECISIONS.md`
- 设计手册：`doc/design/sdk/README.md`
- 领域服务计划：`doc/plans/2026-04-02-domain-services-plan.md`
- 规划文档索引：`doc/plans/README.md`
- SDK 开发计划：`doc/plans/2026-04-02-sdk-development-plan.md`

## 统一安全基线（2026-04-02）

- `ops-service`、`admin-service`、`integration-service`、`sharing-service`、`analytics-service` 已统一接入共享鉴权/审计模板（`@ai-datahub/shared`）。
- 除 `GET /health` 外均要求 `Authorization: Bearer <token>`。
- 写接口统一输出审计日志（成功/失败、traceId、userId、耗时）。
- 五个服务均已补充行为级 401 未授权 E2E（`x-require-auth: true`）。
