import type {
  Connector,
  ConnectorType,
  GetFileDownloadUrlRequest,
  GetFileDownloadUrlResponse,
  PublishMessageRequest,
  PublishMessageResponse,
  Result,
  SendNotificationRequest,
  SendNotificationResponse,
  TestConnectorRequest,
  TestConnectorResponse,
  UpsertConnectorRequest,
  UploadFileRequest,
  UploadFileResponse,
} from '@ai-datahub/contract';

import type { HttpClient } from '../http/HttpClient';

export class SystemIntegrationHttpClient {
  constructor(private readonly http: HttpClient) {}

  upsertConnector(
    req: UpsertConnectorRequest
  ): Promise<Result<{ connectorId: string }>> {
    return this.http.request({
      path: '/connectors',
      method: 'POST',
      meta: req.meta,
      body: req,
    });
  }

  listConnectors(req: {
    meta?: UpsertConnectorRequest['meta'];
    type?: ConnectorType;
  }): Promise<Result<Connector[]>> {
    return this.http.request({
      path: '/connectors',
      method: 'GET',
      meta: req.meta,
      query: { type: req.type },
    });
  }

  testConnector(
    req: TestConnectorRequest
  ): Promise<Result<TestConnectorResponse>> {
    return this.http.request({
      path: `/connectors/${req.connectorId}/test`,
      method: 'POST',
      meta: req.meta,
      body: req,
    });
  }

  sendNotification(
    req: SendNotificationRequest
  ): Promise<Result<SendNotificationResponse>> {
    return this.http.request({
      path: '/notify',
      method: 'POST',
      meta: req.meta,
      body: req,
    });
  }

  publishMessage(
    req: PublishMessageRequest
  ): Promise<Result<PublishMessageResponse>> {
    return this.http.request({
      path: '/publish',
      method: 'POST',
      meta: req.meta,
      body: req,
    });
  }

  uploadFile(req: UploadFileRequest): Promise<Result<UploadFileResponse>> {
    return this.http.request({
      path: '/files/upload',
      method: 'POST',
      meta: req.meta,
      body: req,
    });
  }

  getFileDownloadUrl(
    req: GetFileDownloadUrlRequest
  ): Promise<Result<GetFileDownloadUrlResponse>> {
    return this.http.request({
      path: '/files/download-url',
      method: 'GET',
      meta: req.meta,
      query: { connectorId: req.connectorId, fileRef: req.fileRef },
    });
  }
}
