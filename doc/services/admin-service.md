# AdminService - 系统管理服务

## 服务定位

系统管理与项目治理服务，负责项目管理、项目分组、自定义函数管理、驱动管理、包管理、操作日志查询、工单管理。

## 服务信息

| 项目     | 值             |
| -------- | -------------- |
| 服务名称 | admin-service  |
| 端口     | 3003           |
| 网关前缀 | `/api/admin/*` |
| 实现状态 | 📋 规划中      |

## 包含模块

| 模块             | 职责                                         | Contract 来源                            |
| ---------------- | -------------------------------------------- | ---------------------------------------- |
| **system-admin** | 项目管理、函数管理、驱动管理、操作日志、工单 | `@ai-datahub/contract/SystemAdminClient` |

## API 端点清单

### 项目管理 (`/api/admin/projects/*`)

| 方法   | 端点                      | 功能             |
| ------ | ------------------------- | ---------------- |
| POST   | `/api/admin/projects`     | 创建项目         |
| PUT    | `/api/admin/projects`     | 更新项目         |
| DELETE | `/api/admin/projects/:id` | 删除项目         |
| GET    | `/api/admin/projects`     | 列出项目（分页） |
| GET    | `/api/admin/projects/:id` | 获取项目详情     |

### 项目分组 (`/api/admin/project-groups/*`)

| 方法   | 端点                                          | 功能                 |
| ------ | --------------------------------------------- | -------------------- |
| POST   | `/api/admin/project-groups`                   | 创建项目分组         |
| PUT    | `/api/admin/project-groups`                   | 更新项目分组         |
| DELETE | `/api/admin/project-groups/:id`               | 删除项目分组         |
| GET    | `/api/admin/project-groups`                   | 列出项目分组（分页） |
| POST   | `/api/admin/project-groups/:id/bind-projects` | 绑定项目到分组       |
| POST   | `/api/admin/project-groups/:id/bind-users`    | 绑定用户到分组       |

### 自定义函数管理 (`/api/admin/functions/*`)

| 方法   | 端点                       | 功能                   |
| ------ | -------------------------- | ---------------------- |
| GET    | `/api/admin/functions`     | 列出自定义函数（分页） |
| GET    | `/api/admin/functions/:id` | 获取函数详情           |
| POST   | `/api/admin/functions`     | 创建自定义函数         |
| PUT    | `/api/admin/functions`     | 更新自定义函数         |
| DELETE | `/api/admin/functions/:id` | 删除自定义函数         |

### 驱动管理 (`/api/admin/drivers/*`)

| 方法   | 端点                     | 功能             |
| ------ | ------------------------ | ---------------- |
| GET    | `/api/admin/drivers`     | 列出驱动（分页） |
| POST   | `/api/admin/drivers`     | 创建驱动         |
| DELETE | `/api/admin/drivers/:id` | 删除驱动         |

### 包管理 (`/api/admin/packages/*`)

| 方法   | 端点                      | 功能           |
| ------ | ------------------------- | -------------- |
| GET    | `/api/admin/packages`     | 列出包（分页） |
| POST   | `/api/admin/packages`     | 创建包         |
| DELETE | `/api/admin/packages/:id` | 删除包         |

### 操作日志 (`/api/admin/logs/*`)

| 方法 | 端点              | 功能                 |
| ---- | ----------------- | -------------------- |
| GET  | `/api/admin/logs` | 列出操作日志（分页） |

### 工单管理 (`/api/admin/tickets/*`)

| 方法 | 端点                     | 功能                 |
| ---- | ------------------------ | -------------------- |
| GET  | `/api/admin/tickets`     | 列出我的工单（分页） |
| GET  | `/api/admin/tickets/:id` | 获取工单详情         |
| PUT  | `/api/admin/tickets/:id` | 更新工单状态         |

## 依赖服务

| 服务                | 依赖原因                         |
| ------------------- | -------------------------------- |
| system-auth-service | 用户认证、权限校验、用户信息查询 |

## 目录结构

```
services/admin-service/
├── src/
│   ├── main.ts
│   ├── AppModule.ts
│   ├── common/
│   │   ├── errors/
│   │   └── guards/
│   └── modules/
│       └── system-admin/
│           ├── system-admin.module.ts
│           ├── system-admin.controller.ts
│           ├── system-admin.service.ts
│           └── repositories/
│               ├── project.repository.ts
│               ├── project-group.repository.ts
│               ├── function-def.repository.ts
│               ├── driver-def.repository.ts
│               ├── package-def.repository.ts
│               ├── operation-log.repository.ts
│               └── work-ticket.repository.ts
├── test/
├── package.json
└── tsconfig.json
```

## 数据存储建议

| 数据类型         | 存储选型                | 说明                    |
| ---------------- | ----------------------- | ----------------------- |
| 项目/分组        | PostgreSQL              | 结构化配置数据          |
| 函数/驱动/包定义 | PostgreSQL + MinIO      | 元数据PG，二进制包MinIO |
| 操作日志         | PostgreSQL + ClickHouse | 热数据PG，历史日志CH    |
| 工单             | PostgreSQL              | 结构化业务数据          |

## 开发注意事项

1. **操作日志审计**：所有写操作需记录操作日志
2. **项目分组权限**：项目分组与用户绑定关系需要缓存优化
3. **函数执行隔离**：自定义函数执行需要沙箱隔离
4. **驱动版本管理**：驱动需要支持多版本共存
