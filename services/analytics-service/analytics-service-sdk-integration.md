# Analytics Service SDK 集成指南

## 初始化

```typescript
import {
  FetchHttpClient,
  SelfServiceAnalyticsHttpClient,
} from '@ai-datahub/sdk';

const http = new FetchHttpClient({
  baseUrl: 'http://localhost:3100/api/analytics',
});
const analytics = new SelfServiceAnalyticsHttpClient(http);
```

## 示例

```typescript
const created = await analytics.saveQuery({
  meta: { traceId: 't_save' },
  query: {
    name: 'query-1',
    createdBy: 'u_1',
    definition: { sql: 'select 1' },
  },
});

if (created.ok) {
  await analytics.executeSavedQuery({
    meta: { traceId: 't_exec' },
    queryId: created.data.queryId,
  });
}
```

## 错误处理

```typescript
if (!res.ok) {
  console.error(res.error.code, res.error.message, res.error.traceId);
}
```
