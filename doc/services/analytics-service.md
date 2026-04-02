# AnalyticsService - 自助分析服务

## 服务定位

自助分析平台，负责查询保存、查询执行、结果导出、可视化配置、数据探索。

## 服务信息

| 项目     | 值                   |
| -------- | -------------------- |
| 服务名称 | analytics-service    |
| 端口     | 3005                 |
| 网关前缀 | `/api/analytics/*`   |
| 实现状态 | 🟡 部分已实现（MVP） |

## 包含模块

| 模块                       | 职责                                     | Contract 来源                                     |
| -------------------------- | ---------------------------------------- | ------------------------------------------------- |
| **self-service-analytics** | 查询管理、查询执行、可视化配置、数据探索 | `@ai-datahub/contract/SelfServiceAnalyticsClient` |

## API 端点清单

### 查询管理 (`/api/analytics/queries/*`)

| 方法   | 端点                         | 功能             |
| ------ | ---------------------------- | ---------------- |
| POST   | `/api/analytics/queries`     | 保存查询         |
| PUT    | `/api/analytics/queries`     | 更新查询         |
| DELETE | `/api/analytics/queries/:id` | 删除查询         |
| GET    | `/api/analytics/queries`     | 列出查询（分页） |

**查询定义**：

```typescript
{
  name: string;
  description?: string;
  definition: Record<string, unknown>;  // 逻辑查询定义，由UI生成
  tags?: string[];
  createdBy: ID;
}
```

### 查询执行 (`/api/analytics/queries/:id/execute`)

| 方法 | 端点                                 | 功能           |
| ---- | ------------------------------------ | -------------- |
| POST | `/api/analytics/queries/:id/execute` | 执行保存的查询 |
| POST | `/api/analytics/queries/:id/export`  | 导出查询结果   |

**执行请求**：

```typescript
{
  queryId: ID;
  params?: Record<string, unknown>;  // 参数化查询参数
}
```

**执行结果**：

```typescript
{
  columns: string[];
  rows: Array<Record<string, unknown>>;
  rowCount: number;
}
```

**导出格式**：`CSV` | `XLSX`

### 可视化配置 (`/api/analytics/visualizations/*`)

| 方法 | 端点                            | 功能                   |
| ---- | ------------------------------- | ---------------------- |
| POST | `/api/analytics/visualizations` | 创建可视化配置         |
| PUT  | `/api/analytics/visualizations` | 更新可视化配置         |
| GET  | `/api/analytics/visualizations` | 列出可视化配置（分页） |

**可视化类型**：`BAR` | `LINE` | `PIE` | `MAP` | `TABLE`

**可视化配置**：

```typescript
{
  queryId: ID;
  type: 'BAR' | 'LINE' | 'PIE' | 'MAP' | 'TABLE';
  config: Record<string, unknown>; // 图表配置
  createdBy: ID;
}
```

### 数据探索 (`/api/analytics/explore`)

| 方法 | 端点                     | 功能     |
| ---- | ------------------------ | -------- |
| POST | `/api/analytics/explore` | 数据探索 |

**探索请求**：

```typescript
{
  dataAssetId: ID;
  sampleSize?: number;       // 采样行数
  options?: Record<string, unknown>;  // 探索维度选项
}
```

**探索结果**：

```typescript
{
  metrics: Array<{ name: string; value: number | string | boolean }>;
  sampleRows: Array<Record<string, unknown>>;
}
```

### 查询分享 (`/api/analytics/queries/:id/share`)

| 方法 | 端点                               | 功能               |
| ---- | ---------------------------------- | ------------------ |
| POST | `/api/analytics/queries/:id/share` | 分享查询给其他用户 |

## 依赖服务

| 服务                 | 依赖原因           |
| -------------------- | ------------------ |
| system-auth-service  | 用户认证、权限校验 |
| metadata-service     | 数据资产元数据查询 |
| data-service-service | 数据访问执行       |

## 当前实现补充（统一安全基线）

- 已接入共享鉴权与审计模板（`@ai-datahub/shared`）
- 除 `GET /health` 外，所有接口要求 `Authorization: Bearer <token>`
- 写操作（`POST/PUT/DELETE`）自动记录审计日志（含 traceId/userId/耗时）
- 已补充行为级 E2E：强制 `x-require-auth: true` 且缺少 token 返回 `401`

## 目录结构

```
services/analytics-service/
├── src/
│   ├── main.ts
│   ├── AppModule.ts
│   ├── common/
│   │   ├── errors/
│   │   └── guards/
│   └── modules/
│       └── self-service-analytics/
│           ├── self-service-analytics.module.ts
│           ├── self-service-analytics.controller.ts
│           ├── self-service-analytics.service.ts
│           └── repositories/
│               ├── saved-query.repository.ts
│               └── visualization.repository.ts
├── test/
├── package.json
└── tsconfig.json
```

## 数据存储建议

| 数据类型     | 存储选型   | 说明           |
| ------------ | ---------- | -------------- |
| 保存的查询   | PostgreSQL | 结构化业务数据 |
| 可视化配置   | PostgreSQL | JSON配置       |
| 查询结果缓存 | Redis      | 短期缓存       |
| 导出文件     | MinIO      | 临时文件存储   |

## 开发注意事项

1. **查询引擎集成**：需要对接底层查询引擎（ClickHouse/Spark等）
2. **权限控制**：查询执行需要校验数据资产访问权限
3. **结果缓存**：相同查询结果可短期缓存
4. **导出限流**：大量数据导出需要限流保护
