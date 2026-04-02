# 快速开始

## 安装依赖

```bash
npm install @ai-datahub/sdk @ai-datahub/contract
```

## 初始化 SDK

```ts
import { FetchHttpClient, MetadataHttpClient } from '@ai-datahub/sdk';

const http = new FetchHttpClient({
  baseUrl: 'http://localhost:3000/api/metadata',
  defaultHeaders: {
    authorization: 'Bearer <token>',
  },
});

const metadata = new MetadataHttpClient(http);
```

## 第一个调用

```ts
const res = await metadata.getMetadataVersions({
  dataAssetId: 'asset_1',
  page: { page: 1, pageSize: 20 },
});

if (res.ok) {
  console.log(res.data.items);
} else {
  console.error(res.error.code, res.error.message);
}
```
