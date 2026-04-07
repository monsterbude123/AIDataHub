---
name: left-works-domain-services
overview: ✅ 已完成 - 6个领域服务已创建（ops/integration/admin/sharing/analytics/security），task-scheduler 归属冲突已修正，网关路由已配置。
todos:
  - id: fix-task-scheduler-conflict
    content: 修正 task-scheduler 归属冲突：删除 data-service-service/src/modules/task-scheduler，统一归口到独立 services/task-scheduler-service，并通过网关 /api/tasks/* 转发
    status: completed
  - id: create-ops-service
    content: 创建 ops-service（data-operations），网关前缀 /api/ops
    status: completed
  - id: create-integration-service
    content: 创建 integration-service（system-integration），网关前缀 /api/integration
    status: completed
  - id: create-admin-service
    content: 创建 admin-service（system-admin），网关前缀 /api/admin
    status: completed
  - id: create-sharing-service
    content: 创建 sharing-service（data-sharing），网关前缀 /api/sharing
    status: completed
  - id: create-analytics-service
    content: 创建 analytics-service（self-service-analytics），网关前缀 /api/analytics
    status: completed
  - id: create-security-service
    content: 创建 security-service（data-security + data-lifecycle），网关前缀 /api/security
    status: completed
  - id: update-gateway-routes
    content: 更新 api-gateway 路由配置，添加6个新服务的代理规则
    status: completed
  - id: update-service-docs
    content: 更新 doc/services/*.md 文档，修正 API 前缀与实现状态
    status: completed
isProject: false
completedAt: 2026-04-02
---

# Left-works 领域服务落地计划 ✅ 已完成

## 服务边界划分（按领域聚合）

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              API Gateway (:3000)                                 │
│  /api/ops/*  /api/integration/*  /api/admin/*  /api/sharing/*  /api/analytics/* │
│                              /api/security/*                                     │
└─────────────────────────────────────────────────────────────────────────────────┘
        │              │                │              │              │
        ▼              ▼                ▼              ▼              ▼
┌────────────┐ ┌───────────────┐ ┌────────────┐ ┌─────────────┐ ┌─────────────┐
│ ops-service│ │integration-svc│ │admin-service│ │sharing-svc │ │analytics-svc│
│  :3010     │ │    :3011      │ │   :3012    │ │   :3013    │ │   :3014     │
├────────────┤ ├───────────────┤ ├────────────┤ ├─────────────┤ ├─────────────┤
│data-ops    │ │system-        │ │system-admin│ │data-sharing│ │self-service │
│task-sched  │ │integration    │ │            │ │            │ │-analytics   │
└────────────┘ └───────────────┘ └────────────┘ └─────────────┘ └─────────────┘
                                                              │
                                                    ┌─────────┴─────────┐
                                                    │ security-service  │
                                                    │      :3015        │
                                                    ├───────────────────┤
                                                    │ data-security     │
                                                    │ data-lifecycle    │
                                                    └───────────────────┘
```

## 服务清单

| 服务                    | 端口 | 包含模块                        | 网关前缀             | Contract 来源                             |
| ----------------------- | ---- | ------------------------------- | -------------------- | ----------------------------------------- |
| **ops-service**         | 3001 | data-operations, task-scheduler | `/api/ops/*`         | `data-operations.ts`, `task-scheduler.ts` |
| **integration-service** | 3002 | system-integration              | `/api/integration/*` | `system-integration.ts`                   |
| **admin-service**       | 3003 | system-admin                    | `/api/admin/*`       | `system-admin.ts`                         |
| **sharing-service**     | 3004 | data-sharing                    | `/api/sharing/*`     | `data-sharing.ts`                         |
| **analytics-service**   | 3005 | self-service-analytics          | `/api/analytics/*`   | `self-service-analytics.ts`               |
| **security-service**    | 3006 | data-security, data-lifecycle   | `/api/security/*`    | `data-security.ts`, `data-lifecycle.ts`   |

## 现有服务（保持不变）

| 服务                       | 端口 | 网关前缀          | 说明                                           |
| -------------------------- | ---- | ----------------- | ---------------------------------------------- |
| **system-auth-service**    | 3000 | `/api/auth/*`     | 认证授权 + 审批框架                            |
| **metadata-service**       | 3001 | `/api/metadata/*` | 元数据管理                                     |
| **data-service-service**   | 3002 | `/api/data/*`     | 数据资产 + 数据集成 + 成本管理 + 治理核心/运营 |
| **task-scheduler-service** | 3003 | `/api/tasks/*`    | 统一任务调度中心                               |

## 优先修正项：task-scheduler 归属冲突 ✅ 已完成

### 现状问题（已解决）

- ~~`services/task-scheduler-service/` 已存在实现与测试（独立服务形态）~~
- ~~`data-service-service/src/modules/task-scheduler/` 也曾存在实现（聚合服务内重复）~~
- **已解决**：task-scheduler 模块已从 data-service-service 删除，统一归口

### 修正方案（已完成）

1. ✅ **删除** `data-service-service/src/modules/task-scheduler/`（去重）
2. ✅ **保留并归口** `services/task-scheduler-service/` 为唯一调度实现
3. ✅ **统一网关路由**：使用 `/api/tasks/*` → `TASK_SERVICE_URL/*`（stripPrefix=true）
4. ✅ **更新文档**：`doc/services/task-scheduler-service.md` 反映”已实现 + 独立服务归口”

## 开发波次与依赖

### Wave 0（优先修正）✅ 已完成

```
修正 task-scheduler 归属冲突
├── ✅ 从 data-service-service 删除 task-scheduler 模块
├── ✅ 创建 ops-service 骨架
├── ✅ 保留 task-scheduler-service 独立运行
└── ✅ 更新网关路由 + 文档
```

### Wave 1（并行）✅ 已完成

```
┌─────────────────┐     ┌─────────────────┐
│   ops-service   │     │ admin-service   │
│  data-operations│     │  system-admin   │
│  ✅ MVP 实现    │     │  ✅ MVP 实现    │
└─────────────────┘     └─────────────────┘
```

### Wave 2（并行）✅ 已完成

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ sharing-service │  │analytics-service│  │integration-svc  │
│  data-sharing   │  │self-service-    │  │system-          │
│  ✅ MVP 实现    │  │  analytics ✅   │  │integration ✅   │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

### Wave 3（顺序）✅ 已完成

```
┌─────────────────┐
│ security-service│
│ data-security   │
│ data-lifecycle  │
│ ✅ MVP 实现     │
└─────────────────┘
```

## 每个服务的内部结构

### ops-service

```
services/ops-service/
├── src/
│   ├── main.ts
│   ├── AppModule.ts
│   ├── common/
│   │   ├── errors/
│   │   ├── guards/
│   │   └── database/
│   └── modules/
│       ├── data-operations/
│       │   ├── data-operations.module.ts
│       │   ├── data-operations.controller.ts  # @Controller('api/ops')
│       │   ├── data-operations.service.ts
│       │   └── repositories/
│       │       ├── alert-rule.repository.ts
│       │       ├── alert-channel.repository.ts
│       │       ├── etl-connection.repository.ts
│       │       └── dataset-sync.repository.ts
│       └── task-scheduler/
│           ├── task-scheduler.module.ts
│           ├── task-scheduler.controller.ts    # @Controller('api/ops/scheduler')
│           ├── task-scheduler.service.ts
│           └── repositories/
│               ├── dag.repository.ts
│               ├── queue.repository.ts
│               └── execution.repository.ts
├── test/
├── package.json
└── tsconfig.json
```

说明：本次 Wave 0 已将调度能力归口到独立 `task-scheduler-service`，因此 `ops-service` 不再内置 `task-scheduler` 模块；`ops-service` 通过 `/api/ops/*` 提供 data-operations 领域能力即可。

### integration-service

```
services/integration-service/
├── src/
│   ├── main.ts
│   ├── AppModule.ts
│   └── modules/
│       └── system-integration/
│           ├── system-integration.module.ts
│           ├── system-integration.controller.ts  # @Controller('api/integration')
│           ├── system-integration.service.ts
│           └── repositories/
│               └── connector.repository.ts
└── ...
```

### admin-service

```
services/admin-service/
├── src/
│   ├── main.ts
│   ├── AppModule.ts
│   └── modules/
│       └── system-admin/
│           ├── system-admin.module.ts
│           ├── system-admin.controller.ts  # @Controller('api/admin')
│           ├── system-admin.service.ts
│           └── repositories/
│               ├── project.repository.ts
│               ├── project-group.repository.ts
│               ├── function-def.repository.ts
│               ├── driver-def.repository.ts
│               ├── package-def.repository.ts
│               ├── operation-log.repository.ts
│               └── work-ticket.repository.ts
└── ...
```

### sharing-service

```
services/sharing-service/
├── src/
│   ├── main.ts
│   ├── AppModule.ts
│   └── modules/
│       └── data-sharing/
│           ├── data-sharing.module.ts
│           ├── data-sharing.controller.ts  # @Controller('api/sharing')
│           ├── data-sharing.service.ts
│           └── repositories/
│               ├── resource-directory.repository.ts
│               ├── registered-resource.repository.ts
│               ├── compiled-resource.repository.ts
│               ├── resource-mapping.repository.ts
│               ├── sharing-service.repository.ts
│               └── service-application.repository.ts
└── ...
```

### analytics-service

```
services/analytics-service/
├── src/
│   ├── main.ts
│   ├── AppModule.ts
│   └── modules/
│       └── self-service-analytics/
│           ├── self-service-analytics.module.ts
│           ├── self-service-analytics.controller.ts  # @Controller('api/analytics')
│           ├── self-service-analytics.service.ts
│           └── repositories/
│               ├── saved-query.repository.ts
│               └── visualization.repository.ts
└── ...
```

### security-service

```
services/security-service/
├── src/
│   ├── main.ts
│   ├── AppModule.ts
│   └── modules/
│       ├── data-security/
│       │   ├── data-security.module.ts
│       │   ├── data-security.controller.ts  # @Controller('api/security')
│       │   ├── data-security.service.ts
│       │   └── repositories/
│       │       ├── masking-algorithm.repository.ts
│       │       ├── masking-rule.repository.ts
│       │       ├── masking-config.repository.ts
│       │       ├── classification.repository.ts
│       │       ├── row-level-policy.repository.ts
│       │       ├── watermark-task.repository.ts
│       │       └── encryption-task.repository.ts
│       └── data-lifecycle/
│           ├── data-lifecycle.module.ts
│           ├── data-lifecycle.controller.ts  # @Controller('api/security/lifecycle')
│           ├── data-lifecycle.service.ts
│           └── repositories/
│               ├── lifecycle-policy.repository.ts
│               └── archive-record.repository.ts
└── ...
```

## API 端点清单（从 Contract 提取）

### data-operations (20 个端点)

| 端点                                | 方法                | 功能                |
| ----------------------------------- | ------------------- | ------------------- |
| `/api/ops/alerts/rules`             | POST                | 创建告警规则        |
| `/api/ops/alerts/rules`             | PUT                 | 更新告警规则        |
| `/api/ops/alerts/rules`             | GET                 | 列出告警规则        |
| `/api/ops/alerts/channels`          | GET                 | 列出告警渠道配置    |
| `/api/ops/alerts/channels`          | POST                | 更新告警渠道配置    |
| `/api/ops/executions`               | GET                 | 列出执行记录        |
| `/api/ops/executions/:id`           | GET                 | 获取执行详情        |
| `/api/ops/executions/:id/rerun`     | POST                | 重跑执行            |
| `/api/ops/reconcile`                | POST                | 数据对账            |
| `/api/ops/executor-strategy`        | POST                | 设置执行器策略      |
| `/api/ops/retry-policy`             | POST                | 设置重试策略        |
| `/api/ops/offline`                  | POST                | 离线任务            |
| `/api/ops/priority`                 | POST                | 设置任务优先级      |
| `/api/ops/report`                   | GET                 | 获取运营报表        |
| `/api/ops/health`                   | GET                 | 列出数据源健康状态  |
| `/api/ops/etl-connections`          | POST/GET/PUT/DELETE | ETL 连接管理        |
| `/api/ops/sync-records`             | GET                 | 列出数据集同步记录  |
| `/api/ops/sync-records/:id/compare` | POST                | 比较数据集版本      |
| `/api/ops/sync-records/:id/publish` | POST                | 发布/回滚数据集版本 |

### system-integration (6 个端点)

| 端点                                   | 方法     | 功能         |
| -------------------------------------- | -------- | ------------ |
| `/api/integration/connectors`          | POST/GET | 连接器管理   |
| `/api/integration/connectors/:id/test` | POST     | 测试连接器   |
| `/api/integration/notify`              | POST     | 发送通知     |
| `/api/integration/publish`             | POST     | 发布消息     |
| `/api/integration/files/upload`        | POST     | 上传文件     |
| `/api/integration/files/download-url`  | GET      | 获取下载链接 |

### system-admin (15+ 个端点)

| 端点                                          | 方法                | 功能           |
| --------------------------------------------- | ------------------- | -------------- |
| `/api/admin/projects`                         | POST/GET/PUT/DELETE | 项目管理       |
| `/api/admin/project-groups`                   | POST/GET/PUT/DELETE | 项目分组管理   |
| `/api/admin/project-groups/:id/bind-projects` | POST                | 绑定项目到分组 |
| `/api/admin/project-groups/:id/bind-users`    | POST                | 绑定用户到分组 |
| `/api/admin/functions`                        | POST/GET/PUT/DELETE | 自定义函数管理 |
| `/api/admin/packages`                         | POST/GET/DELETE     | 包管理         |
| `/api/admin/drivers`                          | POST/GET/DELETE     | 驱动管理       |
| `/api/admin/logs`                             | GET                 | 操作日志列表   |
| `/api/admin/tickets`                          | GET                 | 工单列表       |
| `/api/admin/tickets/:id`                      | GET/PUT             | 工单详情/更新  |

### data-sharing (25+ 个端点)

| 端点                                          | 方法                | 功能             |
| --------------------------------------------- | ------------------- | ---------------- |
| `/api/sharing/portal/stats`                   | GET                 | 门户首页统计     |
| `/api/sharing/directories`                    | POST/GET/PUT/DELETE | 资源目录管理     |
| `/api/sharing/resources/registered`           | POST/GET/PUT/DELETE | 登记资源管理     |
| `/api/sharing/resources/registered/:id/test`  | POST                | 测试 API 资源    |
| `/api/sharing/resources/compiled`             | POST/GET/PUT/DELETE | 编制资源管理     |
| `/api/sharing/resources/compiled/import`      | POST                | 导入编制资源     |
| `/api/sharing/resources/compiled/export`      | GET                 | 导出编制资源     |
| `/api/sharing/resources/compiled/:id/publish` | POST                | 发布编制资源     |
| `/api/sharing/mappings`                       | POST/GET/DELETE     | 资源挂接         |
| `/api/sharing/services`                       | POST/GET/PUT/DELETE | 共享服务管理     |
| `/api/sharing/services/:id/publish`           | POST                | 发布共享服务     |
| `/api/sharing/applications`                   | POST/GET            | 服务申请管理     |
| `/api/sharing/applications/:id/urge`          | POST                | 催办审批         |
| `/api/sharing/exchange/executions`            | GET                 | 交换任务执行列表 |

### self-service-analytics (9 个端点)

| 端点                                 | 方法                | 功能         |
| ------------------------------------ | ------------------- | ------------ |
| `/api/analytics/queries`             | POST/GET/PUT/DELETE | 查询管理     |
| `/api/analytics/queries/:id/execute` | POST                | 执行查询     |
| `/api/analytics/queries/:id/export`  | POST                | 导出查询结果 |
| `/api/analytics/visualizations`      | POST/GET/PUT        | 可视化配置   |
| `/api/analytics/explore`             | POST                | 数据探索     |
| `/api/analytics/queries/:id/share`   | POST                | 分享查询     |

### data-security (14 个端点)

| 端点                                      | 方法            | 功能         |
| ----------------------------------------- | --------------- | ------------ |
| `/api/security/masking/algorithms`        | POST/GET        | 脱敏算法管理 |
| `/api/security/masking/rules`             | POST/GET        | 脱敏规则管理 |
| `/api/security/masking/configs`           | POST/GET        | 脱敏配置管理 |
| `/api/security/masking/configs/:id/run`   | POST            | 执行静态脱敏 |
| `/api/security/classification`            | POST/GET        | 数据分级分类 |
| `/api/security/classification/levels`     | GET             | 分级字典     |
| `/api/security/classification/categories` | GET             | 分类字典     |
| `/api/security/row-level-policies`        | POST/GET/DELETE | 行级权限策略 |
| `/api/security/watermark/tasks`           | POST/GET        | 水印任务管理 |
| `/api/security/watermark/parse`           | POST            | 解析水印     |
| `/api/security/encryption/tasks`          | POST/GET        | 加密任务管理 |
| `/api/security/encryption/tasks/:id/run`  | POST            | 执行加密任务 |

### data-lifecycle (6 个端点)

| 端点                               | 方法     | 功能             |
| ---------------------------------- | -------- | ---------------- |
| `/api/security/lifecycle/policies` | POST/GET | 生命周期策略管理 |
| `/api/security/lifecycle/archive`  | POST     | 归档数据         |
| `/api/security/lifecycle/restore`  | POST     | 恢复数据         |
| `/api/security/lifecycle/records`  | GET      | 归档记录列表     |
| `/api/security/lifecycle/expired`  | POST     | 删除过期数据     |
| `/api/security/lifecycle/report`   | GET      | 生命周期报表     |

## 网关路由配置更新

```typescript
// services/api-gateway/src/modules/proxy/proxy.config.ts
//
// 注意：网关通过环境变量装配路由（loadRouteConfig），并且 stripPrefix=true：
// - /api/auth/*     -> AUTH_SERVICE_URL/*
// - /api/metadata/* -> METADATA_SERVICE_URL/*
// - /api/data/*     -> DATA_SERVICE_URL/*
// - /api/tasks/*    -> TASK_SERVICE_URL/*
// - /api/ops/*      -> OPS_SERVICE_URL/*
// - /api/admin/*    -> ADMIN_SERVICE_URL/*
// - /api/integration/* -> INTEGRATION_SERVICE_URL/*
// - /api/sharing/*  -> SHARING_SERVICE_URL/*
// - /api/analytics/*-> ANALYTICS_SERVICE_URL/*
// - /api/security/* -> SECURITY_SERVICE_URL/*
//
// 因此“新增路由”的落点不是 src/routes/index.ts，而是在 proxy.config.ts 里按 env var push routes。
```

同时需要扩展 `services/api-gateway/.env.example`：

```env
# Existing services (保持默认端口，避免大范围改动)
AUTH_SERVICE_URL=http://localhost:3000
METADATA_SERVICE_URL=http://localhost:3001
DATA_SERVICE_URL=http://localhost:3002
TASK_SERVICE_URL=http://localhost:3003

# New domain services (建议从 3010 开始，避免与现有服务冲突)
OPS_SERVICE_URL=http://localhost:3010
INTEGRATION_SERVICE_URL=http://localhost:3011
ADMIN_SERVICE_URL=http://localhost:3012
SHARING_SERVICE_URL=http://localhost:3013
ANALYTICS_SERVICE_URL=http://localhost:3014
SECURITY_SERVICE_URL=http://localhost:3015

# API Gateway port（避免与 AUTH_SERVICE 冲突）
PORT=3100
```

## 验收标准

### Wave 0（task-scheduler 迁移）✅ 已完成

- [x] data-service-service 中无 task-scheduler 模块
- [x] task-scheduler-service 独立启动、测试通过
- [x] 网关路由 `/api/tasks/*` 可用（转发到 task-scheduler-service）
- [x] 文档更新：task-scheduler 归属于 task-scheduler-service

### Wave 1 ✅ 已完成

- [x] ops-service：data-operations 20 个端点可用
- [x] admin-service：system-admin 15 个端点可用
- [x] 两个服务各自独立启动、独立测试
- [x] 网关路由 `/api/ops/*` 和 `/api/admin/*` 可用

### Wave 2 ✅ 已完成

- [x] sharing-service：data-sharing 25 个端点可用
- [x] analytics-service：self-service-analytics 9 个端点可用
- [x] integration-service：system-integration 6 个端点可用
- [x] 网关路由全部可用

### Wave 3 ✅ 已完成

- [x] security-service：data-security + data-lifecycle 全部端点可用
- [x] 与 system-auth 审批框架集成验证
- [x] 全链路 traceId 透传验证

## 文件清单

### 需要创建的服务目录 ✅ 已完成

```
services/
├── ops-service/           ✅ 已创建
├── integration-service/   ✅ 已创建
├── admin-service/         ✅ 已创建
├── sharing-service/       ✅ 已创建
├── analytics-service/     ✅ 已创建
└── security-service/      ✅ 已创建
```

### 需要修改的文件 ✅ 已完成

```
services/data-service-service/src/AppModule.ts  ✅ 已删除 TaskSchedulerModule
services/api-gateway/src/modules/proxy/proxy.config.ts ✅ 已添加新服务路由
services/api-gateway/.env.example                      ✅ 已更新端口表
doc/services/task-scheduler-service.md          ✅ 已更新归属说明
doc/services/README.md                          ✅ 已添加新服务说明
```

### 需要创建的文档 ✅ 已完成

```
doc/services/ops-service.md           ✅ 已创建
doc/services/integration-service.md   ✅ 已创建
doc/services/admin-service.md         ✅ 已创建
doc/services/sharing-service.md       ✅ 已创建
doc/services/analytics-service.md     ✅ 已创建
doc/services/security-service.md      ✅ 已创建
```
