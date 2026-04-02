import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import type {
  Connector,
  ConnectorType,
  GetFileDownloadUrlResponse,
  PublishMessageResponse,
  Result,
  SendNotificationResponse,
  TestConnectorResponse,
  UploadFileResponse,
} from '@ai-datahub/contract';

type UpsertConnectorBody = {
  connector: Omit<Connector, 'createdAt' | 'updatedAt'> & { id?: string };
};
type ListConnectorsQuery = {
  type?: ConnectorType;
};

type SendNotificationBody = {
  connectorId: string;
  channel: 'EMAIL' | 'SMS' | 'DINGTALK' | 'WECHAT_WORK';
  to: string[];
  subject?: string;
  content: string;
  options?: Record<string, unknown>;
};

type PublishMessageBody = {
  connectorId: string;
  topic: string;
  key?: string;
  payload: Record<string, unknown>;
  headers?: Record<string, string>;
};

type UploadFileBody = {
  connectorId: string;
  fileName: string;
  contentType?: string;
  contentRef: string;
  targetPath?: string;
};

type GetDownloadUrlQuery = {
  connectorId?: string;
  fileRef?: string;
};

function nowIso(): string {
  return new Date().toISOString();
}

function invalidArgument(message: string): Result<never> {
  return {
    ok: false,
    error: { code: 'INVALID_ARGUMENT', message, level: 'ERROR' },
  };
}

@Controller()
export class SystemIntegrationController {
  private connectors: Connector[] = [];
  private files = new Map<string, { connectorId: string; fileName: string }>();

  @Post('connectors')
  @HttpCode(HttpStatus.OK)
  upsertConnector(
    @Body() body: UpsertConnectorBody
  ): Result<{ connectorId: string }> {
    if (!body?.connector) return invalidArgument('Missing connector');
    const c = body.connector;
    if (!c.type) return invalidArgument('connector.type is required');
    if (!c.name) return invalidArgument('connector.name is required');
    if (!c.provider) return invalidArgument('connector.provider is required');
    if (typeof c.enabled !== 'boolean')
      return invalidArgument('connector.enabled is required');
    if (!c.config || typeof c.config !== 'object')
      return invalidArgument('connector.config is required');

    const ts = nowIso();
    if (c.id) {
      const idx = this.connectors.findIndex((x) => x.id === c.id);
      if (idx >= 0) {
        const existing = this.connectors[idx];
        this.connectors[idx] = { ...existing, ...c, updatedAt: ts };
        return { ok: true, data: { connectorId: existing.id } };
      }
    }
    const id = `cn_${this.connectors.length + 1}`;
    this.connectors.push({
      id,
      type: c.type,
      name: c.name,
      provider: c.provider,
      enabled: c.enabled,
      config: c.config,
      createdAt: ts,
      updatedAt: ts,
    });
    return { ok: true, data: { connectorId: id } };
  }

  @Get('connectors')
  listConnectors(@Query() q: ListConnectorsQuery): Result<Connector[]> {
    let items = [...this.connectors];
    if (q.type) items = items.filter((c) => c.type === q.type);
    return { ok: true, data: items };
  }

  @Post('connectors/:id/test')
  @HttpCode(HttpStatus.OK)
  testConnector(@Param('id') id: string): Result<TestConnectorResponse> {
    const c = this.connectors.find((x) => x.id === id);
    if (!c) {
      return {
        ok: false,
        error: {
          code: 'CONNECTOR_NOT_FOUND',
          message: 'Connector not found',
          level: 'ERROR',
        },
      };
    }
    return {
      ok: true,
      data: { success: true, message: 'ok', testedAt: nowIso() },
    };
  }

  @Post('notify')
  @HttpCode(HttpStatus.OK)
  sendNotification(
    @Body() body: SendNotificationBody
  ): Result<SendNotificationResponse> {
    if (!body?.connectorId) return invalidArgument('connectorId is required');
    if (!Array.isArray(body.to) || body.to.length === 0)
      return invalidArgument('to is required');
    if (!body.content) return invalidArgument('content is required');
    // MVP：不真正发送，返回模拟 messageId
    return {
      ok: true,
      data: { success: true, messageId: `msg_${Date.now()}`, sentAt: nowIso() },
    };
  }

  @Post('publish')
  @HttpCode(HttpStatus.OK)
  publishMessage(
    @Body() body: PublishMessageBody
  ): Result<PublishMessageResponse> {
    if (!body?.connectorId) return invalidArgument('connectorId is required');
    if (!body.topic) return invalidArgument('topic is required');
    if (!body.payload || typeof body.payload !== 'object')
      return invalidArgument('payload is required');
    return {
      ok: true,
      data: { success: true, offset: '0', publishedAt: nowIso() },
    };
  }

  @Post('files/upload')
  @HttpCode(HttpStatus.OK)
  uploadFile(@Body() body: UploadFileBody): Result<UploadFileResponse> {
    if (!body?.connectorId) return invalidArgument('connectorId is required');
    if (!body.fileName) return invalidArgument('fileName is required');
    if (!body.contentRef) return invalidArgument('contentRef is required');
    const fileRef = `file_${Date.now()}`;
    this.files.set(fileRef, {
      connectorId: body.connectorId,
      fileName: body.fileName,
    });
    return { ok: true, data: { fileRef, uploadedAt: nowIso() } };
  }

  @Get('files/download-url')
  getFileDownloadUrl(
    @Query() q: GetDownloadUrlQuery
  ): Result<GetFileDownloadUrlResponse> {
    if (!q.connectorId) return invalidArgument('connectorId is required');
    if (!q.fileRef) return invalidArgument('fileRef is required');
    const f = this.files.get(q.fileRef);
    if (!f || f.connectorId !== q.connectorId) {
      return {
        ok: false,
        error: {
          code: 'FILE_NOT_FOUND',
          message: 'File not found',
          level: 'ERROR',
        },
      };
    }
    const expireAt = new Date(Date.now() + 10 * 60_000).toISOString();
    return {
      ok: true,
      data: {
        downloadUrl: `https://download.local/${encodeURIComponent(q.fileRef)}`,
        expireAt,
      },
    };
  }
}
