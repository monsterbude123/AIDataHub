# Ops Service SDK 集成指南

## 概述

本指南介绍如何使用 `@ai-datahub/sdk` 集成 `ops-service` 的告警规则能力。

## 安装

```bash
npm install @ai-datahub/sdk
```

## 初始化 HTTP Client

```typescript
import { FetchHttpClient, DataOperationsHttpClient } from '@ai-datahub/sdk';

// 通过网关访问（推荐）
const http = new FetchHttpClient({ baseUrl: 'http://localhost:3100/api/ops' });

// 直接访问服务（本地调试）
// const http = new FetchHttpClient({ baseUrl: 'http://localhost:3001' });

const ops = new DataOperationsHttpClient(http);
```

## 告警规则：list vs search（契约对齐说明）

- `listAlertRules`：返回 `AlertRule[]`（**不分页**，用于“全量拉取/本地再筛选”的简单场景）
- `searchAlertRules`：返回 `PageResult<AlertRule>`（**分页/过滤**，用于列表页/检索场景）

## 调用示例

### 1) 列出全部告警规则（数组）

```typescript
const res = await ops.listAlertRules({ meta: { traceId: 't_list' } });
if (!res.ok) throw new Error(res.error.message);
console.log(res.data); // AlertRule[]
```

### 2) 分页查询告警规则（过滤 enabled + keyword）

```typescript
const res = await ops.searchAlertRules({
  meta: { traceId: 't_search' },
  enabled: true,
  keyword: 'timeout',
  page: { page: 1, pageSize: 20 },
});

if (!res.ok) throw new Error(res.error.message);
console.log(res.data.items, res.data.total);
```

## 错误处理

所有 API 返回 `Result<T>`，失败时：

```typescript
if (!res.ok) {
  console.error(res.error.code, res.error.message, res.error.traceId);
}
```
