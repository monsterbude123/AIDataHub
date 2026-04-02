# Sharing Service SDK 集成指南

## 概述

本指南介绍如何使用 `@ai-datahub/sdk` 集成 `sharing-service`（data-sharing）。

## 安装

```bash
npm install @ai-datahub/sdk
```

## 初始化 HTTP Client

```typescript
import { FetchHttpClient, DataSharingHttpClient } from '@ai-datahub/sdk';

// 通过网关访问（推荐）
const http = new FetchHttpClient({
  baseUrl: 'http://localhost:3100/api/sharing',
});

// 直接访问服务（本地调试）
// const http = new FetchHttpClient({ baseUrl: 'http://localhost:3012' });

const sharing = new DataSharingHttpClient(http);
```

## 常用调用示例（MVP）

### 1) 门户首页统计

```typescript
const stats = await sharing.getPortalHomeStats({
  meta: { traceId: 't_portal' },
  orgId: 'org_1',
});
```

### 2) 创建目录节点

```typescript
const dir = await sharing.createResourceDirectory({
  meta: { traceId: 't_dir_create' },
  node: { name: 'root', code: 'root' },
});
```

### 3) 登记一个 API 资源并测试

```typescript
import type { RegisteredApiResource } from '@ai-datahub/contract';

const reg = await sharing.createRegisteredResource({
  meta: { traceId: 't_reg_create' },
  resource: {
    type: 'API',
    name: 'api-1',
    ownerOrgId: 'org_1',
    method: 'GET',
    endpoint: 'http://example',
    status: 'ACTIVE',
  } satisfies Omit<RegisteredApiResource, 'id' | 'createdAt' | 'updatedAt'>,
});

if (reg.ok) {
  await sharing.testRegisteredApi({
    meta: { traceId: 't_api_test' },
    resourceId: reg.data.resourceId,
  });
}
```

### 4) 编制资源 → 发布（提交）

```typescript
import type { CompiledResource } from '@ai-datahub/contract';

const compiled = await sharing.createCompiledResource({
  meta: { traceId: 't_compiled_create' },
  resource: {
    directoryId: 'dir_1',
    name: 'compiled-1',
    type: 'API',
    shareType: 'UNCONDITIONAL',
    dataItems: [],
    status: 'DRAFT',
  } satisfies Omit<CompiledResource, 'id' | 'createdAt' | 'updatedAt'>,
});

if (compiled.ok) {
  await sharing.publishCompiledResource({
    meta: { traceId: 't_compiled_submit' },
    compiledResourceId: compiled.data.compiledResourceId,
    action: 'SUBMIT',
  });
}
```

## 错误处理

```typescript
if (!res.ok) {
  console.error(res.error.code, res.error.message, res.error.traceId);
}
```
