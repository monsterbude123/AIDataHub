# SDK 使用指南

## 推荐初始化方式

```ts
import {
  FetchHttpClient,
  SystemAuthHttpClient,
  MetadataHttpClient,
  DataServiceHttpClient,
  DataOperationsHttpClient,
  SystemAdminHttpClient,
  DataSharingHttpClient,
  SelfServiceAnalyticsHttpClient,
  SystemIntegrationHttpClient,
  DataSecurityHttpClient,
  DataLifecycleHttpClient,
} from '@ai-datahub/sdk';
```

为每个域创建对应 `baseUrl`：

```ts
const metadata = new MetadataHttpClient(
  new FetchHttpClient({ baseUrl: '/api/metadata', defaultHeaders })
);
```

## 按服务映射

| 服务        | SDK Client                                           |
| ----------- | ---------------------------------------------------- |
| auth        | `SystemAuthHttpClient`                               |
| metadata    | `MetadataHttpClient`                                 |
| data        | `DataServiceHttpClient`                              |
| ops         | `DataOperationsHttpClient`                           |
| admin       | `SystemAdminHttpClient`                              |
| sharing     | `DataSharingHttpClient`                              |
| analytics   | `SelfServiceAnalyticsHttpClient`                     |
| integration | `SystemIntegrationHttpClient`                        |
| security    | `DataSecurityHttpClient` + `DataLifecycleHttpClient` |

## 推荐封装

- 在 BFF/前端服务层二次封装 Client
- 统一处理 `Result` 错误分支
- 将 `Authorization` 和 `x-trace-id` 作为默认头注入
