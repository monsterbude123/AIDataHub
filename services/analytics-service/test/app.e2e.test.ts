import { describe, expect, it } from 'vitest';
import { Test } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

import { AppModule } from '../src/AppModule';

describe('analytics-service (e2e)', () => {
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
      url: '/queries?page=1&pageSize=10',
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
      data: { service: 'analytics-service' },
    });

    await app.close();
  });

  it('should support queries/visualizations/explore flow', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    const app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter()
    );
    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    const create = await app.inject({
      method: 'POST',
      url: '/queries',
      payload: {
        query: {
          name: 'q1',
          createdBy: 'u_1',
          definition: { sql: 'select 1' },
        },
      },
    });
    expect(create.statusCode).toBe(201);
    const queryId = create.json().data.queryId as string;

    const list = await app.inject({
      method: 'GET',
      url: '/queries?createdBy=u_1&page=1&pageSize=10',
    });
    expect(list.statusCode).toBe(200);
    expect(list.json().data.total).toBe(1);

    const execute = await app.inject({
      method: 'POST',
      url: `/queries/${queryId}/execute`,
      payload: {},
    });
    expect(execute.statusCode).toBe(200);
    expect(execute.json().ok).toBe(true);
    expect(execute.json().data.rowCount).toBeGreaterThanOrEqual(1);

    const exportRes = await app.inject({
      method: 'POST',
      url: `/queries/${queryId}/export`,
      payload: { format: 'CSV' },
    });
    expect(exportRes.statusCode).toBe(200);
    expect(exportRes.json().ok).toBe(true);

    const share = await app.inject({
      method: 'POST',
      url: `/queries/${queryId}/share`,
      payload: { toUserIds: ['u_2'] },
    });
    expect(share.statusCode).toBe(200);
    expect(share.json().ok).toBe(true);

    const vizCreate = await app.inject({
      method: 'POST',
      url: '/visualizations',
      payload: {
        visualization: {
          queryId,
          type: 'BAR',
          config: { x: 'a', y: 'b' },
          createdBy: 'u_1',
        },
      },
    });
    expect(vizCreate.statusCode).toBe(201);
    const vizId = vizCreate.json().data.visualizationId as string;

    const vizList = await app.inject({
      method: 'GET',
      url: `/visualizations?queryId=${encodeURIComponent(queryId)}&page=1&pageSize=10`,
    });
    expect(vizList.statusCode).toBe(200);
    expect(vizList.json().data.total).toBe(1);

    const vizUpdate = await app.inject({
      method: 'PUT',
      url: '/visualizations',
      payload: {
        visualization: {
          id: vizId,
          queryId,
          type: 'LINE',
          config: { x: 'a', y: 'b' },
          createdBy: 'u_1',
        },
      },
    });
    expect(vizUpdate.statusCode).toBe(200);
    expect(vizUpdate.json().ok).toBe(true);

    const explore = await app.inject({
      method: 'POST',
      url: '/explore',
      payload: { dataAssetId: 'asset_1', sampleSize: 50 },
    });
    expect(explore.statusCode).toBe(200);
    expect(explore.json().ok).toBe(true);

    const del = await app.inject({
      method: 'DELETE',
      url: `/queries/${queryId}`,
    });
    expect(del.statusCode).toBe(200);
    expect(del.json().ok).toBe(true);

    await app.close();
  });

  it('covers validation error branches', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    const app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter()
    );
    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    const noQuery = await app.inject({
      method: 'POST',
      url: '/queries',
      payload: {},
    });
    expect(noQuery.json().ok).toBe(false);

    const listNoCreator = await app.inject({
      method: 'GET',
      url: '/queries?page=1&pageSize=10',
    });
    expect(listNoCreator.json().ok).toBe(false);

    const exploreNoAsset = await app.inject({
      method: 'POST',
      url: '/explore',
      payload: {},
    });
    expect(exploreNoAsset.json().ok).toBe(false);

    const create = await app.inject({
      method: 'POST',
      url: '/queries',
      payload: {
        query: {
          name: 'q-val',
          createdBy: 'u_1',
          definition: { sql: 'select 1' },
        },
      },
    });
    const qid = create.json().data.queryId as string;

    const exportNoFmt = await app.inject({
      method: 'POST',
      url: `/queries/${qid}/export`,
      payload: {},
    });
    expect(exportNoFmt.json().ok).toBe(false);

    const shareNoUsers = await app.inject({
      method: 'POST',
      url: `/queries/${qid}/share`,
      payload: {},
    });
    expect(shareNoUsers.json().ok).toBe(false);

    const badViz = await app.inject({
      method: 'POST',
      url: '/visualizations',
      payload: { visualization: { queryId: qid } },
    });
    expect(badViz.json().ok).toBe(false);

    await app.inject({ method: 'DELETE', url: `/queries/${qid}` });

    await app.close();
  });
});
