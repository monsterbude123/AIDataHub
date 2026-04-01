# Metadata Service SDK Integration Guide

本文档说明如何通过 `@ai-datahub/sdk` 与 `metadata-service` 进行集成。

## 安装

```bash
npm install @ai-datahub/sdk @ai-datahub/contract
```

## 初始化客户端

```typescript
import { createMetadataClient } from '@ai-datahub/sdk';

const client = createMetadataClient({
  baseUrl: 'http://localhost:3001',
  // 可选：自定义请求头（包含认证 token）
  headers: {
    Authorization: 'Bearer <jwt-token>',
  },
  // 可选：超时配置
  timeout: 5000,
});
```

## API 使用示例

### 采集元数据

从数据源采集元数据：

```typescript
const result = await client.collectMetadata({
  mode: 'AUTO',
  dataSourceId: 'ds-001',
  includeTables: ['public.*'],
  excludeTables: ['public.temp_*'],
});

if (result.success) {
  const { dataAssets, columns, collectedAt } = result.data;
  console.log(`采集完成，共 ${dataAssets.length} 个表，${columns.length} 个列`);
  console.log(`采集时间: ${collectedAt}`);
}
```

### 导入元数据

从模板导入元数据：

```typescript
const result = await client.importMetadata({
  format: 'TEMPLATE_V1',
  payload: {
    dataSourceId: 'ds-001',
    assets: [
      {
        name: 'users',
        displayName: '用户表',
        columns: [
          { name: 'id', type: 'int', primaryKey: true },
          { name: 'username', type: 'varchar' },
        ],
      },
    ],
  },
});

if (result.success) {
  console.log('导入成功');
}
```

### 导出元数据

导出元数据为模板格式：

```typescript
const result = await client.exportMetadata({
  scope: 'BY_DATA_SOURCE',
  dataSourceId: 'ds-001',
  format: 'TEMPLATE_V1',
});

if (result.success) {
  const { downloadUrl, expireAt } = result.data;
  console.log(`下载链接: ${downloadUrl}`);
  console.log(`过期时间: ${expireAt}`);
  // 使用下载链接下载文件
  window.open(downloadUrl);
}
```

### 同步元数据

增量同步元数据，对比差异：

```typescript
// 先试运行查看差异，不实际修改
const dryRunResult = await client.syncMetadata({
  dataSourceId: 'ds-001',
  dryRun: true,
});

if (dryRunResult.success) {
  const { diffs } = dryRunResult.data;
  console.log('同步差异:');
  diffs.forEach((diff) => {
    console.log(`${diff.action}: ${diff.tableName} - ${diff.reason}`);
  });

  // 确认差异后执行实际同步
  const syncResult = await client.syncMetadata({
    dataSourceId: 'ds-001',
    dryRun: false,
  });
}
```

### 获取元数据版本列表

查询数据资产的版本历史：

```typescript
const result = await client.getMetadataVersions({
  dataAssetId: 'asset-001',
  page: {
    page: 1,
    pageSize: 10,
  },
});

if (result.success) {
  const { items, total, page, pageSize } = result.data;
  console.log(`共 ${total} 个版本`);
  items.forEach((version) => {
    console.log(
      `${version.version} - ${version.summary} (${version.createdAt})`
    );
  });
}
```

### 对比两个版本的差异

对比两个元数据版本的具体差异：

```typescript
const result = await client.compareMetadataVersions({
  leftVersionId: 'ver-1',
  rightVersionId: 'ver-2',
});

if (result.success) {
  const { diffs } = result.data;
  console.log('发现差异:');
  diffs.forEach((diff) => {
    console.log(
      `${diff.changeType} ${diff.field}: ${diff.left} → ${diff.right}`
    );
  });
}
```

### 订阅元数据变更

订阅数据源或数据资产的元数据变更：

```typescript
// 邮件订阅
const result = await client.subscribeMetadataChange({
  dataSourceId: 'ds-001',
  channels: ['EMAIL'],
  target: 'user@example.com',
});

if (result.success) {
  const { subscriptionId } = result.data;
  console.log(`订阅成功，订阅ID: ${subscriptionId}`);
}

// Webhook 订阅
const webhookResult = await client.subscribeMetadataChange({
  dataAssetId: 'asset-001',
  dataSourceId: 'ds-001',
  channels: ['WEBHOOK'],
  target: 'https://your-service.com/webhook/metadata-change',
});
```

## 完整工作流示例

### 采集 → 导入 → 版本管理完整流程

```typescript
import { createMetadataClient } from '@ai-datahub/sdk';

const client = createMetadataClient({
  baseUrl: 'http://localhost:3001',
  headers: { Authorization: 'Bearer <token>' },
});

// 1. 自动采集
const collectResult = await client.collectMetadata({
  mode: 'AUTO',
  dataSourceId: 'ds-001',
});

if (!collectResult.success) {
  console.error('采集失败:', collectResult.error?.message);
  return;
}

console.log(`采集到 ${collectResult.data.dataAssets.length} 个数据资产`);

// 2. 查看版本
const versionsResult = await client.getMetadataVersions({
  dataAssetId: collectResult.data.dataAssets[0].id,
  page: { page: 1, pageSize: 10 },
});

if (versionsResult.success) {
  console.log(`当前版本数: ${versionsResult.data.total}`);
}

// 3. 导出用于备份
const exportResult = await client.exportMetadata({
  scope: 'BY_DATA_SOURCE',
  dataSourceId: 'ds-001',
  format: 'TEMPLATE_V1',
});

if (exportResult.success) {
  console.log(`备份下载链接: ${exportResult.data.downloadUrl}`);
}
```

## 错误处理

所有 API 返回统一的 `Result<T>` 结构：

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

### 错误处理示例

```typescript
const result = await client.collectMetadata({
  mode: 'AUTO',
  dataSourceId: 'non-existent-id',
});

if (!result.success) {
  const { code, message } = result.error!;

  switch (code) {
    case 'DATA_SOURCE_NOT_FOUND':
      console.error('数据源不存在，请检查 ID');
      break;
    case 'COLLECTION_FAILED':
      console.error('元数据采集失败:', message);
      break;
    case 'PERMISSION_DENIED':
      console.error('没有数据源访问权限');
      break;
    default:
      console.error(`错误: ${message}`);
  }

  // traceId 可用于日志追踪
  console.log('TraceId:', result.traceId);
}
```

## 类型定义

所有类型定义来自 `@ai-datahub/contract`：

```typescript
import type {
  DataAsset,
  ColumnMetadata,
  MetadataVersion,
  CollectMetadataRequest,
  CollectMetadataResponse,
  ImportMetadataRequest,
  ExportMetadataRequest,
  ExportMetadataResponse,
  SyncMetadataRequest,
  SyncMetadataResponse,
  GetMetadataVersionsRequest,
  CompareMetadataVersionsRequest,
  MetadataVersionDiff,
  SubscribeMetadataChangeRequest,
  SubscribeMetadataChangeResponse,
  Result,
  PageResult,
  PageRequest,
} from '@ai-datahub/contract';
```

## 最佳实践

### 1. 分页加载版本历史

```typescript
async function loadAllVersions(
  client: MetadataClient,
  dataAssetId: string
): Promise<MetadataVersion[]> {
  const allVersions: MetadataVersion[] = [];
  let page = 1;
  const pageSize = 20;

  while (true) {
    const result = await client.getMetadataVersions({
      dataAssetId,
      page: { page, pageSize },
    });

    if (!result.success) break;

    allVersions.push(...result.data.items);

    if (allVersions.length >= result.data.total) break;
    page++;
  }

  return allVersions;
}
```

### 2. TraceId 追踪

```typescript
// 请求时传递 traceId，便于跨服务追踪
const result = await client.collectMetadata({
  meta: { traceId: 'my-trace-id-123' },
  mode: 'AUTO',
  dataSourceId: 'ds-001',
});

// 响应包含 traceId
console.log('Response traceId:', result.traceId);
```

### 3. 差异同步先试运行

```typescript
// 同步之前先试运行查看差异
const dryRun = await client.syncMetadata({
  dataSourceId: 'ds-001',
  dryRun: true,
});

if (dryRun.success) {
  const changes = dryRun.data.diffs.length;
  console.log(`同步将带来 ${changes} 处变更`);

  // 确认后再执行实际同步
  if (changes > 0 && confirm('确认执行同步?')) {
    await client.syncMetadata({
      dataSourceId: 'ds-001',
      dryRun: false,
    });
  }
}
```

## HTTP 端点映射

| SDK 方法                  | HTTP 端点                      |
| ------------------------- | ------------------------------ |
| `collectMetadata`         | `POST /api/metadata/collect`   |
| `importMetadata`          | `POST /api/metadata/import`    |
| `exportMetadata`          | `POST /api/metadata/export`    |
| `syncMetadata`            | `POST /api/metadata/sync`      |
| `getMetadataVersions`     | `POST /api/metadata/versions`  |
| `compareMetadataVersions` | `POST /api/metadata/compare`   |
| `subscribeMetadataChange` | `POST /api/metadata/subscribe` |

## 相关文档

- [metadata-service README](./README.md)
- [Contract 类型定义](../../packages/contract/src/modules/metadata.ts)
- [SDK 源码](../../packages/sdk/src/clients/MetadataHttpClient.ts)
