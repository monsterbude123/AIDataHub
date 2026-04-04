import { describe, expect, it } from 'vitest';
import { Test } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

import { AppModule } from '../src/AppModule';

describe('integration-service (e2e)', () => {
  it('should return 401 when force auth and missing token', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    const app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter()
    );
    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    const res = await app.inject({
      method: 'GET',
      url: '/connectors',
      headers: { 'x-require-auth': 'true' },
    });
    expect(res.statusCode).toBe(401);
    expect(res.json().message).toContain('Authorization header missing');

    await app.close();
  });

  it('GET /health should return ok Result', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    const app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter()
    );
    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    const res = await app.inject({ method: 'GET', url: '/health' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      ok: true,
      data: { service: 'integration-service' },
    });

    await app.close();
  });

  it('should upsert/list/test connector and support notify/publish/files', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    const app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter()
    );
    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    const upsert = await app.inject({
      method: 'POST',
      url: '/connectors',
      payload: {
        connector: {
          type: 'NOTIFICATION',
          name: 'notifier-1',
          provider: 'smtp',
          enabled: true,
          config: { smtpRef: 'ref_1' },
        },
      },
    });
    expect(upsert.statusCode).toBe(200);
    const connectorId = upsert.json().data.connectorId as string;

    const list = await app.inject({
      method: 'GET',
      url: '/connectors?type=NOTIFICATION',
    });
    expect(list.statusCode).toBe(200);
    expect(list.json().ok).toBe(true);
    expect(list.json().data.length).toBe(1);

    const testConn = await app.inject({
      method: 'POST',
      url: `/connectors/${connectorId}/test`,
    });
    expect(testConn.statusCode).toBe(200);
    expect(testConn.json().ok).toBe(true);

    const notify = await app.inject({
      method: 'POST',
      url: '/notify',
      payload: {
        connectorId,
        channel: 'EMAIL',
        to: ['a@test'],
        subject: 's',
        content: 'hello',
      },
    });
    expect(notify.statusCode).toBe(200);
    expect(notify.json().ok).toBe(true);

    const publish = await app.inject({
      method: 'POST',
      url: '/publish',
      payload: {
        connectorId,
        topic: 't1',
        payload: { a: 1 },
      },
    });
    expect(publish.statusCode).toBe(200);
    expect(publish.json().ok).toBe(true);

    const upload = await app.inject({
      method: 'POST',
      url: '/files/upload',
      payload: {
        connectorId,
        fileName: 'a.txt',
        contentRef: 'mem://a',
      },
    });
    expect(upload.statusCode).toBe(200);
    const fileRef = upload.json().data.fileRef as string;

    const downloadUrl = await app.inject({
      method: 'GET',
      url: `/files/download-url?connectorId=${encodeURIComponent(
        connectorId
      )}&fileRef=${encodeURIComponent(fileRef)}`,
    });
    expect(downloadUrl.statusCode).toBe(200);
    expect(downloadUrl.json().ok).toBe(true);

    await app.close();
  });

  it('covers validation and not-found branches', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    const app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter()
    );
    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    const missingConnector = await app.inject({
      method: 'POST',
      url: '/connectors',
      payload: {},
    });
    expect(missingConnector.json().ok).toBe(false);

    const missingFields = await app.inject({
      method: 'POST',
      url: '/connectors',
      payload: { connector: { type: 'NOTIFICATION' } },
    });
    expect(missingFields.json().ok).toBe(false);

    const upsert = await app.inject({
      method: 'POST',
      url: '/connectors',
      payload: {
        connector: {
          type: 'NOTIFICATION',
          name: 'n1',
          provider: 'smtp',
          enabled: true,
          config: { a: 1 },
        },
      },
    });
    const connectorId = upsert.json().data.connectorId as string;

    const updateSame = await app.inject({
      method: 'POST',
      url: '/connectors',
      payload: {
        connector: {
          id: connectorId,
          type: 'NOTIFICATION',
          name: 'n1-upd',
          provider: 'smtp',
          enabled: false,
          config: { a: 2 },
        },
      },
    });
    expect(updateSame.json().ok).toBe(true);
    expect(updateSame.json().data.connectorId).toBe(connectorId);

    const testMissing = await app.inject({
      method: 'POST',
      url: '/connectors/cn_missing/test',
    });
    expect(testMissing.json().error.code).toBe('CONNECTOR_NOT_FOUND');

    const notifyBad = await app.inject({
      method: 'POST',
      url: '/notify',
      payload: { connectorId, to: [], content: 'c' },
    });
    expect(notifyBad.json().ok).toBe(false);

    const publishBad = await app.inject({
      method: 'POST',
      url: '/publish',
      payload: { connectorId, topic: 't', payload: null },
    });
    expect(publishBad.json().ok).toBe(false);

    const uploadBad = await app.inject({
      method: 'POST',
      url: '/files/upload',
      payload: { connectorId },
    });
    expect(uploadBad.json().ok).toBe(false);

    const dlMissing = await app.inject({
      method: 'GET',
      url: '/files/download-url',
    });
    expect(dlMissing.json().ok).toBe(false);

    const uploadOk = await app.inject({
      method: 'POST',
      url: '/files/upload',
      payload: {
        connectorId,
        fileName: 'f.txt',
        contentRef: 'mem://x',
      },
    });
    const fileRef = uploadOk.json().data.fileRef as string;

    const dlWrong = await app.inject({
      method: 'GET',
      url: `/files/download-url?connectorId=${encodeURIComponent(
        connectorId
      )}&fileRef=${encodeURIComponent('file_wrong')}`,
    });
    expect(dlWrong.json().error.code).toBe('FILE_NOT_FOUND');

    const dlOk = await app.inject({
      method: 'GET',
      url: `/files/download-url?connectorId=${encodeURIComponent(
        connectorId
      )}&fileRef=${encodeURIComponent(fileRef)}`,
    });
    expect(dlOk.json().ok).toBe(true);

    await app.close();
  });
});
