# Security Service SDK 集成指南

## 初始化

```typescript
import {
  FetchHttpClient,
  DataSecurityHttpClient,
  DataLifecycleHttpClient,
} from '@ai-datahub/sdk';

const http = new FetchHttpClient({
  baseUrl: 'http://localhost:3100/api/security',
});
const security = new DataSecurityHttpClient(http);
const lifecycle = new DataLifecycleHttpClient(http);
```

## 示例

```typescript
const alg = await security.createMaskingAlgorithm({
  meta: { traceId: 't_alg' },
  algorithm: { name: 'hash', type: 'HASH', config: {} },
});

const policy = await lifecycle.configurePolicy({
  meta: { traceId: 't_policy' },
  policy: {
    name: 'cold-30d',
    tier: 'COLD',
    rules: { days: 30 },
    enabled: true,
  },
});
```

## 错误处理

```typescript
if (!res.ok) {
  console.error(res.error.code, res.error.message, res.error.traceId);
}
```
