# @ai-datahub/metadata-service

元数据管理微服务，负责技术元数据采集、存储、版本管理和同步。

## 功能模块

| 模块                | 说明                               |
| ------------------- | ---------------------------------- |
| **Collect**         | 从数据源自动采集元数据（表、字段） |
| **Import/Export**   | 元数据导入导出，支持模板格式       |
| **Sync**            | 元数据增量同步与差异比对           |
| **Versioning**      | 元数据版本管理，支持版本对比       |
| **Subscription**    | 元数据变更订阅（邮件、Webhook）    |
| **Data Asset**      | 数据资产CRUD管理                   |
| **Column Metadata** | 列元数据管理                       |

## 快速开始

```bash
# 安装依赖
npm install

# 构建
npm run build

# 开发模式运行
npm run dev

# 运行测试
npm run test

# 类型检查
npm run build:check
```

服务默认监听端口 `3001`，可通过 `PORT` 环境变量配置。

## 认证

所有 API 端点需要 JWT 认证，请求头中携带：

```bash
curl -H "Authorization: Bearer <your-token>" http://localhost:3001/api/metadata/collect
```

### 公开端点

以下端点无需认证：

| 端点            | 说明             |
| --------------- | ---------------- |
| `GET /health`   | 服务健康检查     |
| `GET /api/docs` | Swagger API 文档 |

## 环境变量

| 变量   | 默认值 | 说明         |
| ------ | ------ | ------------ |
| `PORT` | `3001` | 服务监听端口 |

## API 文档

启动服务后访问 Swagger API 文档: http://localhost:3001/api/docs

## SDK 使用

使用 `@ai-datahub/sdk` 包调用服务：

### 基本使用

```typescript
import { createMetadataClient } from '@ai-datahub/sdk';

// 创建客户端
const client = createMetadataClient({
  baseUrl: 'http://localhost:3001',
  headers: {
    Authorization: 'Bearer <jwt-token>',
  },
});
```

详细使用示例参见 [metadata-sdk-integration.md](./metadata-sdk-integration.md)

## API 端点

所有端点位于 `/api/metadata` 前缀：

| 方法 | 路径         | 说明               |
| ---- | ------------ | ------------------ |
| POST | `/collect`   | 采集元数据         |
| POST | `/import`    | 导入元数据         |
| POST | `/export`    | 导出元数据         |
| POST | `/sync`      | 同步元数据         |
| POST | `/versions`  | 获取元数据版本列表 |
| POST | `/compare`   | 对比两个版本差异   |
| POST | `/subscribe` | 订阅元数据变更     |

## 请求/响应示例

### 采集元数据

**请求示例：**

```json
{
  "mode": "AUTO",
  "dataSourceId": "ds-001",
  "includeTables": ["public.*"],
  "excludeTables": ["public.temp_*"]
}
```

**响应示例：**

```json
{
  "success": true,
  "data": {
    "dataAssets": [
      {
        "id": "asset-1",
        "name": "public.users",
        "displayName": "用户表",
        "type": "TABLE",
        "layer": "ODS",
        "dataSourceId": "ds-001",
        "qualifiedName": "public.users",
        "status": "DRAFT",
        "createdAt": "2026-04-01T10:00:00.000Z",
        "updatedAt": "2026-04-01T10:00:00.000Z"
      }
    ],
    "columns": [
      {
        "id": "col-1",
        "dataAssetId": "asset-1",
        "name": "id",
        "type": "int4",
        "nullable": false,
        "primaryKey": true,
        "autoIncrement": true,
        "ordinalPosition": 1
      }
    ],
    "collectedAt": "2026-04-01T10:00:00.000Z"
  }
}
```

### 获取版本列表

**请求示例：**

```json
{
  "dataAssetId": "asset-1",
  "page": {
    "page": 1,
    "pageSize": 10
  }
}
```

**响应示例：**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "ver-1",
        "dataAssetId": "asset-1",
        "version": "v1.0.0",
        "createdAt": "2026-04-01T10:00:00.000Z",
        "createdBy": "user-001",
        "summary": "初始化元数据"
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 10
  }
}
```

## 数据类型

### DataAsset

```typescript
interface DataAsset {
  id: ID;
  name: string;
  displayName: string;
  description?: string;
  type: DataAssetType;
  layer: DataLayer;
  dataSourceId: ID;
  tableName?: string;
  qualifiedName: string;
  owner?: string;
  status: 'DRAFT' | 'APPROVED' | 'ONLINE' | 'OFFLINE';
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}
```

### ColumnMetadata

```typescript
interface ColumnMetadata {
  id: ID;
  dataAssetId: ID;
  name: string;
  type: string;
  nullable: boolean;
  primaryKey: boolean;
  autoIncrement: boolean;
  defaultValue?: unknown;
  comment?: string;
  ordinalPosition: number;
}
```

### MetadataVersion

```typescript
interface MetadataVersion {
  id: ID;
  dataAssetId: ID;
  version: string;
  createdAt: ISODateTime;
  createdBy?: ID;
  summary?: string;
}
```

### CollectMetadataRequest

```typescript
interface CollectMetadataRequest {
  meta?: RequestMeta;
  mode: MetadataCollectionMode; // 'AUTO' | 'SUBSCRIPTION' | 'MANUAL'
  dataSourceId: ID;
  includeTables?: string[];
  excludeTables?: string[];
}
```

## 响应格式

所有 API 返回统一的 `Result<T>` 格式：

```typescript
interface Result<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    level: 'ERROR' | 'WARN';
  };
  traceId?: string;
}
```

## 错误码

| 错误码                  | 说明           |
| ----------------------- | -------------- |
| `DATA_SOURCE_NOT_FOUND` | 数据源不存在   |
| `DATA_ASSET_NOT_FOUND`  | 数据资产不存在 |
| `COLLECTION_FAILED`     | 采集失败       |
| `SYNC_CONFLICT`         | 同步冲突       |
| `VERSION_NOT_FOUND`     | 版本不存在     |
| `INVALID_ARGUMENT`      | 参数错误       |
| `PERMISSION_DENIED`     | 权限不足       |
| `EXPORT_FAILED`         | 导出失败       |
| `IMPORT_FAILED`         | 导入失败       |

## 技术栈

- **框架**: NestJS + Fastify
- **存储**: InMemory（开发）/ PostgreSQL（生产推荐）
- **验证**: Zod
- **文档**: Swagger

## 项目结构

```
services/metadata-service/
├── src/
│   ├── main.ts                 # 入口文件
│   ├── AppModule.ts            # 根模块
│   ├── controllers/
│   │   └── HealthController.ts # 健康检查
│   └── modules/                # 功能模块
│       └── metadata/           # 元数据模块
│           ├── entities/       # 实体定义
│           ├── repositories/   # 仓储层
│           ├── metadata.service.ts
│           ├── metadata.controller.ts
│           └── metadata.module.ts
├── test/                       # E2E 测试
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── vitest.config.ts
```

## 测试

```bash
# 运行单元测试
npm run test

# 运行 E2E 测试
npm run test -- run test/

# 测试覆盖率
npm run test -- coverage
```

## License

MIT
