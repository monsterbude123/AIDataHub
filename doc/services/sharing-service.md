# SharingService - 数据共享服务

## 服务定位

数据共享交换门户，负责资源分类目录、资源登记（库表/API/文件）、资源编制、资源挂接、共享服务登记、服务申请审批、交换任务监控。

## 服务信息

| 项目     | 值               |
| -------- | ---------------- |
| 服务名称 | sharing-service  |
| 端口     | 3004             |
| 网关前缀 | `/api/sharing/*` |
| 实现状态 | 📋 规划中        |

## 包含模块

| 模块             | 职责                                                  | Contract 来源                            |
| ---------------- | ----------------------------------------------------- | ---------------------------------------- |
| **data-sharing** | 资源目录、资源登记/编制、资源挂接、共享服务、服务申请 | `@ai-datahub/contract/DataSharingClient` |

## API 端点清单

### 门户首页 (`/api/sharing/portal/*`)

| 方法 | 端点                        | 功能             |
| ---- | --------------------------- | ---------------- |
| GET  | `/api/sharing/portal/stats` | 获取门户首页统计 |

### 资源分类目录 (`/api/sharing/directories/*`)

| 方法   | 端点                           | 功能         |
| ------ | ------------------------------ | ------------ |
| GET    | `/api/sharing/directories`     | 列出目录树   |
| POST   | `/api/sharing/directories`     | 创建目录节点 |
| PUT    | `/api/sharing/directories`     | 更新目录节点 |
| DELETE | `/api/sharing/directories/:id` | 删除目录节点 |

### 资源登记 (`/api/sharing/resources/registered/*`)

| 方法   | 端点                                         | 功能                 |
| ------ | -------------------------------------------- | -------------------- |
| POST   | `/api/sharing/resources/registered`          | 创建登记资源         |
| PUT    | `/api/sharing/resources/registered`          | 更新登记资源         |
| DELETE | `/api/sharing/resources/registered/:id`      | 删除登记资源         |
| GET    | `/api/sharing/resources/registered/:id`      | 获取登记资源详情     |
| GET    | `/api/sharing/resources/registered`          | 列出登记资源（分页） |
| POST   | `/api/sharing/resources/registered/:id/test` | 测试API资源          |

**资源类型**：

- `TABLE` - 库表资源（dataSourceId + schema + tableName）
- `API` - API资源（method + endpoint + headersTemplate）
- `FILE` - 文件资源（fileRef + fileName + contentType）

### 编制资源 (`/api/sharing/resources/compiled/*`)

| 方法   | 端点                                          | 功能                  |
| ------ | --------------------------------------------- | --------------------- |
| POST   | `/api/sharing/resources/compiled`             | 创建编制资源          |
| PUT    | `/api/sharing/resources/compiled`             | 更新编制资源          |
| DELETE | `/api/sharing/resources/compiled/:id`         | 删除编制资源          |
| GET    | `/api/sharing/resources/compiled/:id`         | 获取编制资源详情      |
| GET    | `/api/sharing/resources/compiled`             | 搜索编制资源（分页）  |
| POST   | `/api/sharing/resources/compiled/import`      | 导入编制资源          |
| GET    | `/api/sharing/resources/compiled/export`      | 导出编制资源          |
| POST   | `/api/sharing/resources/compiled/:id/publish` | 发布/取消发布编制资源 |

**编制状态**：`DRAFT` → `SUBMITTED` → `PUBLISHED` → `CANCELED` → `DELETED`

### 资源挂接 (`/api/sharing/mappings/*`)

| 方法   | 端点                    | 功能         |
| ------ | ----------------------- | ------------ |
| POST   | `/api/sharing/mappings` | 挂接资源     |
| DELETE | `/api/sharing/mappings` | 取消挂接     |
| GET    | `/api/sharing/mappings` | 获取挂接详情 |

### 共享服务 (`/api/sharing/services/*`)

| 方法   | 端点                                | 功能                 |
| ------ | ----------------------------------- | -------------------- |
| POST   | `/api/sharing/services`             | 创建共享服务         |
| PUT    | `/api/sharing/services`             | 更新共享服务         |
| DELETE | `/api/sharing/services/:id`         | 删除共享服务         |
| GET    | `/api/sharing/services/:id`         | 获取服务详情         |
| GET    | `/api/sharing/services`             | 搜索共享服务（分页） |
| POST   | `/api/sharing/services/:id/publish` | 发布/下线共享服务    |

**服务类型**：`TABLE_EXCHANGE` | `API_PROXY` | `FILE_DOWNLOAD` | `ONLINE_QUERY`

### 服务申请 (`/api/sharing/applications/*`)

| 方法 | 端点                                 | 功能           |
| ---- | ------------------------------------ | -------------- |
| POST | `/api/sharing/applications`          | 创建服务申请   |
| GET  | `/api/sharing/applications/:id`      | 获取申请详情   |
| GET  | `/api/sharing/applications`          | 我的申请列表   |
| GET  | `/api/sharing/applications/provider` | 提供方申请列表 |
| POST | `/api/sharing/applications/:id/urge` | 催办审批       |

**申请状态**：`DRAFT` → `SUBMITTED` → `APPROVED` | `REJECTED`

### 交换任务监控 (`/api/sharing/exchange/*`)

| 方法 | 端点                                         | 功能                 |
| ---- | -------------------------------------------- | -------------------- |
| GET  | `/api/sharing/exchange/executions`           | 列出交换执行（分页） |
| POST | `/api/sharing/exchange/executions/:id/rerun` | 重跑交换执行         |
| POST | `/api/sharing/exchange/schedule`             | 更新交换调度         |

## 依赖服务

| 服务                | 依赖原因                     |
| ------------------- | ---------------------------- |
| system-auth-service | 用户认证、权限校验、审批框架 |
| ops-service         | 任务调度、执行监控           |
| metadata-service    | 数据源元数据查询             |
| integration-service | 通知发送                     |

## 目录结构

```
services/sharing-service/
├── src/
│   ├── main.ts
│   ├── AppModule.ts
│   ├── common/
│   │   ├── errors/
│   │   └── guards/
│   └── modules/
│       └── data-sharing/
│           ├── data-sharing.module.ts
│           ├── data-sharing.controller.ts
│           ├── data-sharing.service.ts
│           └── repositories/
│               ├── resource-directory.repository.ts
│               ├── registered-resource.repository.ts
│               ├── compiled-resource.repository.ts
│               ├── resource-mapping.repository.ts
│               ├── sharing-service.repository.ts
│               └── service-application.repository.ts
├── test/
├── package.json
└── tsconfig.json
```

## 数据存储建议

| 数据类型           | 存储选型                | 说明                 |
| ------------------ | ----------------------- | -------------------- |
| 资源目录/登记/编制 | PostgreSQL              | 结构化业务数据       |
| 服务申请/审批记录  | PostgreSQL              | 关联审批框架         |
| 交换执行记录       | PostgreSQL + ClickHouse | 热数据PG，历史分析CH |
| 登记文件           | MinIO                   | 文件存储             |

## 开发注意事项

1. **审批框架集成**：服务申请复用 `system-auth-service` 的审批能力
2. **资源版本管理**：编制资源支持版本管理
3. **访问密钥管理**：服务申请通过后生成访问密钥
4. **调度集成**：库表交换类服务依赖 `ops-service` 调度能力
