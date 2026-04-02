# metadata-service（元数据管理服务）

> **当前状态**：✅ 已实现。
>
> - **代码位置**：`services/metadata-service/src/modules/metadata/`
> - **API 前缀**：`/api/metadata`

## 1. 职责边界

- 对应 bounded context：`metadata`
- 范围：元数据**全生命周期管理**（采集、导入导出、同步、版本、变更订阅）
- 不包含：接入时“初始元数据采集”（归 `data-integration`）

## 2. 依赖

- **契约**：`@ai-datahub/contract` 的 `MetadataClient` 与相关 DTO
- **共享基础设施**：`@ai-datahub/shared`（traceId、错误映射）
- **上游/下游**：
  - 下游数据源连接能力：由实现层适配（JDBC/Hive/ES/File 等），不进入 contract
  - 与 `data-governance-*` 的关系：提供资产/字段元数据来源

## 3. API（第一阶段 MVP）

- `POST /metadata/collect` → `collectMetadata`
- `POST /metadata/import` → `importMetadata`
- `POST /metadata/export` → `exportMetadata`
- `POST /metadata/sync` → `syncMetadata`
- `GET /metadata/assets/:dataAssetId/versions` → `getMetadataVersions`
- `POST /metadata/versions/compare` → `compareMetadataVersions`
- `POST /metadata/changes/subscribe` → `subscribeMetadataChange`

## 4. 数据存储（建议）

- 元数据主库：PostgreSQL（资产、字段、版本、订阅）
- 大字段（导入/导出 payload、差异快照）：对象存储（MinIO/OSS）+ 引用

## 5. 里程碑

- M1：服务模板跑通（health + traceId 透传 + Result 响应）✅
- M2：collect/sync 跑通（dryRun 支持）✅
- M3：版本与比对（versions + compare）✅
- M4：变更订阅（EMAIL/WEBHOOK）

## 6. 架构规范化

### 6.1 当前实现差异

与 `system-auth-service` 相比，当前 `metadata-service` 实现存在以下差异：

| 维度         | 当前实现              | 规范要求                |
| ------------ | --------------------- | ----------------------- |
| **项目结构** | 单模块简化结构        | 按业务领域模块化        |
| **数据库**   | 内存仓库 + 直连连接器 | Prisma ORM + 持久化存储 |
| **认证**     | 无认证机制            | JWT + CASL RBAC         |
| **错误处理** | 基础处理              | 自定义异常类统一处理    |
| **API 文档** | 无 Swagger            | 完整 Swagger 装饰器     |
| **测试覆盖** | 基础测试              | 满足 80% 覆盖率要求     |

### 6.2 统一规范标准

所有微服务必须遵循以下统一规范（以 `system-auth-service` 为基准）：

**目录结构标准：**

```
services/{service-name}/
├── src/
│   ├── common/              # 共享组件（数据库、错误、守卫、装饰器）
│   ├── controllers/         # 全局控制器（健康检查等）
│   ├── modules/             # 业务模块（按领域拆分）
│   │   └── {domain}/        # 每个领域一个模块
│   │       ├── entities/
│   │       ├── {domain}.controller.ts
│   │       ├── {domain}.module.ts
│   │       └── {domain}.service.ts
│   ├── app.module.ts
│   └── main.ts
└── ...
```

**技术栈统一：**

- **ORM**：Prisma（通过 `@ai-datahub/database` 共享包）
- **认证**：JWT + CASL（全局启用，`@Public()` 开放例外）
- **验证**：Zod
- **错误处理**：自定义异常继承 `@ai-datahub/shared` 基类
- **API 文档**：Swagger 装饰器
- **日志**：共享 `@ai-datahub/shared` logger

### 6.3 重构计划

**阶段 1：结构重构**

- 创建 `common/` 目录（errors、database、guards）
- 拆分为多领域模块：
  - `modules/data-connection/` - 数据源连接管理
  - `modules/data-asset/` - 数据资产管理
  - `modules/metadata-collection/` - 元数据采集
  - `modules/metadata-version/` - 版本管理

**阶段 2：认证集成**

- 导入 `AuthModule` 并配置 JWT
- 注册全局 `JwtAuthGuard`
- 添加 CASL 权限控制

**阶段 3：数据层重构**

- 添加 Prisma schema 定义元数据模型
  - `DataConnection` - 数据源连接配置
  - `DataAsset` - 数据资产
  - `TableMetadata` - 表元数据
  - `ColumnMetadata` - 列元数据
  - `MetadataVersion` - 版本记录
- 替换内存仓库为 Prisma 持久化存储
- 保留连接器用于外部数据库元数据采集

**阶段 4：代码质量提升**

- 添加 Swagger 文档装饰器
- 统一错误处理
- 补充单元测试达到 80% 覆盖率

### 6.4 设计原则

- **DDD + Bounded Context**：每个业务领域一个独立模块
- **Strict Layering**：UI → SDK → Service → Infrastructure，不越层访问
- **Contract First**：接口定义在 `@ai-datahub/contract` 优先
- **TypeScript Strict**：零 `any`，完整类型推断

## 7. SDK 集成指南

### 7.1 安装

```bash
npm install @ai-datahub/sdk
```

### 7.2 基本使用

```typescript
import { MetadataClient, FetchHttpClient } from '@ai-datahub/sdk';

// 创建客户端
const http = new FetchHttpClient('http://localhost:3000');
const client = new MetadataClient(http);

// 采集元数据
const collectResult = await client.collectMetadata({
  meta: { traceId: 'your-trace-id' },
  dataAssetId: 'asset-123',
  connectionId: 'conn-456',
});

if (collectResult.ok) {
  console.log('Metadata collected successfully:', collectResult.data);
} else {
  console.log('Error:', collectResult.error.message);
}
```

### 7.3 完整 API 示例

```typescript
// 获取元数据版本
const versionsResult = await client.getMetadataVersions({
  meta: { traceId: 'trace-123' },
  dataAssetId: 'asset-123',
});

// 比较元数据版本
const compareResult = await client.compareMetadataVersions({
  meta: { traceId: 'trace-123' },
  leftVersionId: 'v1',
  rightVersionId: 'v2',
});

// 订阅元数据变更
const subscribeResult = await client.subscribeMetadataChange({
  meta: { traceId: 'trace-123' },
  dataAssetId: 'asset-123',
  callbackUrl: 'https://your-webhook.com/notify',
  type: 'WEBHOOK',
});
```

## 8. 错误处理

所有 API 返回统一的 `Result<T>` 类型：

```typescript
interface Result<T> {
  ok: true;
  data: T;
}

interface Result<T> {
  ok: false;
  error: {
    code: string;
    message: string;
  };
}
```

常见错误码示例：

| Error Code                   | Description    |
| ---------------------------- | -------------- |
| `INVALID_ARGUMENT`           | 参数错误       |
| `DATA_ASSET_NOT_FOUND`       | 数据资产不存在 |
| `METADATA_COLLECTION_FAILED` | 元数据采集失败 |
| `PERMISSION_DENIED`          | 权限不足       |

## 9. 环境变量

| Variable           | Default | Description                    |
| ------------------ | ------- | ------------------------------ |
| `PORT`             | `3000`  | 服务端口                       |
| `DATABASE_URL`     | -       | PostgreSQL 数据库连接字符串    |
| `MINIO_ENDPOINT`   | -       | 对象存储端点（用于大字段存储） |
| `MINIO_ACCESS_KEY` | -       | 对象存储访问密钥               |
| `MINIO_SECRET_KEY` | -       | 对象存储秘密密钥               |

## 10. 健康检查

服务提供标准健康检查端点：

```
GET /health
```

响应示例：

```json
{
  "status": "healthy",
  "timestamp": "2026-04-01T12:00:00Z",
  "dependencies": {
    "database": "healthy",
    "objectStorage": "healthy"
  }
}
```
