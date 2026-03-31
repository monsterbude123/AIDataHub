import type { ID, ISODateTime, RequestMeta, Result } from '../types';

export type SystemIntegrationErrorCode =
  | 'INVALID_ARGUMENT'
  | 'PERMISSION_DENIED'
  | 'CONNECTOR_NOT_FOUND'
  | 'CONNECTOR_CONFIG_INVALID'
  | 'CONNECTOR_TEST_FAILED'
  | 'SEND_FAILED'
  | 'PUBLISH_FAILED'
  | 'FILE_NOT_FOUND';

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
