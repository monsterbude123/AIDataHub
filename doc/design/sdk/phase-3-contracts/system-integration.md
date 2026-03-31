# 阶段 3：`system-integration` 模块 SDK 契约

## 1) 模块定位

- 外部系统集成适配层：统一身份认证（OAuth2/LDAP/AD）、消息通知渠道、消息中间件、文件存储。
- 以“连接器/适配器”方式提供能力，不在此模块承载业务规则。

## 2) 依赖的共享实体

来自 `00-shared-entities.md`：

- `RequestMeta`
- `Result<T>`

## 3) 错误码（本模块）

```ts
export type SystemIntegrationErrorCode =
  | 'INVALID_ARGUMENT'
  | 'PERMISSION_DENIED'
  | 'CONNECTOR_NOT_FOUND'
  | 'CONNECTOR_CONFIG_INVALID'
  | 'CONNECTOR_TEST_FAILED'
  | 'SEND_FAILED'
  | 'PUBLISH_FAILED'
  | 'FILE_NOT_FOUND';
```

## 4) DTO 定义

```ts
import type {
  ID,
  ISODateTime,
  RequestMeta,
  Result,
} from './00-shared-entities';

export type ConnectorType =
  | 'IDP'
  | 'NOTIFICATION'
  | 'MESSAGE_QUEUE'
  | 'FILE_STORAGE';

export type Connector = {
  id: ID;
  type: ConnectorType;
  name: string;
  provider: string; // e.g. "oauth2", "ldap", "kafka", "minio"
  enabled: boolean;
  config: Record<string, unknown>;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};

export type UpsertConnectorRequest = {
  meta?: RequestMeta;
  connector: Omit<Connector, 'createdAt' | 'updatedAt'> & { id?: ID };
};

export type TestConnectorRequest = { meta?: RequestMeta; connectorId: ID };
export type TestConnectorResponse = {
  success: boolean;
  message: string;
  testedAt: ISODateTime;
};

export type SendNotificationRequest = {
  meta?: RequestMeta;
  connectorId: ID;
  channel: 'EMAIL' | 'SMS' | 'DINGTALK' | 'WECHAT_WORK';
  to: string[];
  subject?: string;
  content: string;
  // 扩展字段（模板、变量等）
  options?: Record<string, unknown>;
};

export type SendNotificationResponse = {
  success: boolean;
  messageId?: ID;
  sentAt: ISODateTime;
};

export type PublishMessageRequest = {
  meta?: RequestMeta;
  connectorId: ID;
  topic: string;
  key?: string;
  payload: Record<string, unknown>;
  headers?: Record<string, string>;
};

export type PublishMessageResponse = {
  success: boolean;
  offset?: string;
  publishedAt: ISODateTime;
};

export type UploadFileRequest = {
  meta?: RequestMeta;
  connectorId: ID;
  // 文件内容由实现层决定传输方式；契约层只约定引用
  fileName: string;
  contentType?: string;
  // 内容引用（例如本地路径/bytesRef/streamRef）
  contentRef: string;
  targetPath?: string;
};

export type UploadFileResponse = { fileRef: string; uploadedAt: ISODateTime };

export type GetFileDownloadUrlRequest = {
  meta?: RequestMeta;
  connectorId: ID;
  fileRef: string;
};
export type GetFileDownloadUrlResponse = {
  downloadUrl: string;
  expireAt: ISODateTime;
};
```

## 5) 对外 SDK 接口（`SystemIntegrationClient`）

```ts
export interface SystemIntegrationClient {
  upsertConnector(
    req: UpsertConnectorRequest
  ): Promise<Result<{ connectorId: ID }>>;
  listConnectors(req: {
    meta?: RequestMeta;
    type?: ConnectorType;
  }): Promise<Result<Connector[]>>;
  testConnector(
    req: TestConnectorRequest
  ): Promise<Result<TestConnectorResponse>>;

  // 通知
  sendNotification(
    req: SendNotificationRequest
  ): Promise<Result<SendNotificationResponse>>;

  // 消息中间件
  publishMessage(
    req: PublishMessageRequest
  ): Promise<Result<PublishMessageResponse>>;

  // 文件存储
  uploadFile(req: UploadFileRequest): Promise<Result<UploadFileResponse>>;
  getFileDownloadUrl(
    req: GetFileDownloadUrlRequest
  ): Promise<Result<GetFileDownloadUrlResponse>>;
}
```

## 6) 幂等性要求

- `upsertConnector`：幂等。\n- `testConnector` / `listConnectors`：幂等。

## 7) Mock 服务规则

- `listConnectors`\n - 默认：返回 2 个连接器（oauth2、minio）\n- `testConnector`\n - 默认：success=true\n - 可模拟异常：`CONNECTOR_TEST_FAILED`
