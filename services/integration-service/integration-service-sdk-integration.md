# Integration Service SDK 集成指南

## 概述

本指南介绍如何使用 `@ai-datahub/sdk` 集成 `integration-service`（system-integration）。

## 安装

```bash
npm install @ai-datahub/sdk
```

## 初始化 HTTP Client

```typescript
import { FetchHttpClient, SystemIntegrationHttpClient } from '@ai-datahub/sdk';

// 通过网关访问（推荐）
const http = new FetchHttpClient({
  baseUrl: 'http://localhost:3100/api/integration',
});

// 直接访问服务（本地调试）
// const http = new FetchHttpClient({ baseUrl: 'http://localhost:3011' });

const integration = new SystemIntegrationHttpClient(http);
```

## 连接器管理

```typescript
const upsert = await integration.upsertConnector({
  meta: { traceId: 't_upsert' },
  connector: {
    type: 'NOTIFICATION',
    name: 'notifier-1',
    provider: 'smtp',
    enabled: true,
    config: { smtpRef: 'ref_1' },
  },
});
if (!upsert.ok) throw new Error(upsert.error.message);

const list = await integration.listConnectors({
  meta: { traceId: 't_list' },
  type: 'NOTIFICATION',
});
```

## 发送通知

```typescript
await integration.sendNotification({
  meta: { traceId: 't_notify' },
  connectorId: 'cn_1',
  channel: 'EMAIL',
  to: ['a@test'],
  subject: 'hello',
  content: 'message',
});
```

## 发布消息

```typescript
await integration.publishMessage({
  meta: { traceId: 't_publish' },
  connectorId: 'cn_2',
  topic: 'topic-1',
  payload: { a: 1 },
});
```

## 文件上传与下载链接

```typescript
const upload = await integration.uploadFile({
  meta: { traceId: 't_upload' },
  connectorId: 'cn_3',
  fileName: 'a.txt',
  contentRef: 'mem://a',
});
if (!upload.ok) throw new Error(upload.error.message);

const dl = await integration.getFileDownloadUrl({
  meta: { traceId: 't_dl' },
  connectorId: 'cn_3',
  fileRef: upload.data.fileRef,
});
```

## 错误处理

```typescript
if (!res.ok) {
  console.error(res.error.code, res.error.message, res.error.traceId);
}
```
