import { describe, expect, it } from 'vitest';
import { Test } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

import { AppModule } from '../src/AppModule';

describe('ops-service (e2e)', () => {
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
      url: '/alerts/rules',
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
    const body = res.json();
    expect(body).toEqual({ ok: true, data: { service: 'ops-service' } });

    await app.close();
  });

  it('should CRUD alert rules with pagination/filtering', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    const app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter()
    );
    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    // create
    const create1 = await app.inject({
      method: 'POST',
      url: '/alerts/rules',
      payload: {
        rule: {
          name: 'timeout-1',
          type: 'TIMEOUT',
          enabled: true,
          channels: ['EMAIL'],
          config: { thresholdMs: 1000 },
        },
      },
    });
    expect(create1.statusCode).toBe(201);
    const body1 = create1.json();
    expect(body1.ok).toBe(true);
    const id1 = body1.data.ruleId as string;
    expect(typeof id1).toBe('string');

    const create2 = await app.inject({
      method: 'POST',
      url: '/alerts/rules',
      payload: {
        rule: {
          name: 'anomaly-1',
          type: 'INCREMENT_ANOMALY',
          enabled: false,
          channels: ['SMS'],
          config: { windowMin: 5 },
        },
      },
    });
    expect(create2.statusCode).toBe(201);
    const body2 = create2.json();
    expect(body2.ok).toBe(true);
    const id2 = body2.data.ruleId as string;
    expect(typeof id2).toBe('string');

    // list (contract: listAlertRules returns AlertRule[])
    const listAll = await app.inject({
      method: 'GET',
      url: '/alerts/rules',
    });
    expect(listAll.statusCode).toBe(200);
    const listAllBody = listAll.json();
    expect(listAllBody.ok).toBe(true);
    expect(Array.isArray(listAllBody.data)).toBe(true);
    expect(listAllBody.data.length).toBe(2);

    // search (new contract: paged + filtering)
    const searchEnabled = await app.inject({
      method: 'GET',
      url: '/alerts/rules/search?page=1&pageSize=1&enabled=true',
    });
    expect(searchEnabled.statusCode).toBe(200);
    const searchBody = searchEnabled.json();
    expect(searchBody.ok).toBe(true);
    expect(searchBody.data.page).toBe(1);
    expect(searchBody.data.pageSize).toBe(1);
    expect(searchBody.data.total).toBe(1);
    expect(searchBody.data.items.length).toBe(1);
    expect(searchBody.data.items[0].id).toBe(id1);

    // update
    const update = await app.inject({
      method: 'PUT',
      url: '/alerts/rules',
      payload: {
        rule: {
          id: id1,
          name: 'timeout-1-updated',
          type: 'TIMEOUT',
          enabled: true,
          channels: ['EMAIL'],
          config: { thresholdMs: 2000 },
        },
      },
    });
    expect(update.statusCode).toBe(200);
    const updateBody = update.json();
    expect(updateBody.ok).toBe(true);
    expect(updateBody.data.success).toBe(true);

    // keyword filter should match updated name
    const searchKeyword = await app.inject({
      method: 'GET',
      url: '/alerts/rules/search?page=1&pageSize=10&keyword=updated',
    });
    expect(searchKeyword.statusCode).toBe(200);
    const keywordBody = searchKeyword.json();
    expect(keywordBody.ok).toBe(true);
    expect(keywordBody.data.total).toBe(1);
    expect(keywordBody.data.items[0].name).toBe('timeout-1-updated');

    // delete
    const del = await app.inject({
      method: 'DELETE',
      url: `/alerts/rules/${id2}`,
    });
    expect(del.statusCode).toBe(200);
    const delBody = del.json();
    expect(delBody.ok).toBe(true);
    expect(delBody.data.success).toBe(true);

    // update not found
    const updateNotFound = await app.inject({
      method: 'PUT',
      url: '/alerts/rules',
      payload: {
        rule: {
          id: 'ar_missing',
          name: 'missing',
          type: 'TIMEOUT',
          enabled: true,
          channels: ['EMAIL'],
          config: {},
        },
      },
    });
    expect(updateNotFound.statusCode).toBe(200);
    const unfBody = updateNotFound.json();
    expect(unfBody.ok).toBe(false);
    expect(unfBody.error.code).toBe('ALERT_RULE_NOT_FOUND');

    // delete not found
    const deleteNotFound = await app.inject({
      method: 'DELETE',
      url: `/alerts/rules/ar_missing2`,
    });
    expect(deleteNotFound.statusCode).toBe(200);
    const dnfBody = deleteNotFound.json();
    expect(dnfBody.ok).toBe(false);
    expect(dnfBody.error.code).toBe('ALERT_RULE_NOT_FOUND');

    // invalid channels should return INVALID_ARGUMENT
    const invalidChannel = await app.inject({
      method: 'POST',
      url: '/alerts/rules',
      payload: {
        rule: {
          name: 'bad',
          type: 'TIMEOUT',
          enabled: true,
          channels: ['EMAIL', 'INVALID'],
          config: {},
        },
      },
    });
    expect(invalidChannel.statusCode).toBe(200);
    const icBody = invalidChannel.json();
    expect(icBody.ok).toBe(false);
    expect(icBody.error.code).toBe('INVALID_ARGUMENT');

    await app.close();
  });

  it('should upsert/list alert channel configs', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    const app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter()
    );
    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    const listEmpty = await app.inject({
      method: 'GET',
      url: '/alerts/channels',
    });
    expect(listEmpty.statusCode).toBe(200);
    const emptyBody = listEmpty.json();
    expect(emptyBody.ok).toBe(true);
    expect(Array.isArray(emptyBody.data)).toBe(true);

    const upsert = await app.inject({
      method: 'POST',
      url: '/alerts/channels',
      payload: {
        config: {
          channel: 'EMAIL',
          enabled: true,
          config: { smtpRef: 'ref_1' },
        },
      },
    });
    expect(upsert.statusCode).toBe(200);
    const upsertBody = upsert.json();
    expect(upsertBody.ok).toBe(true);
    expect(upsertBody.data.success).toBe(true);

    const listAfter = await app.inject({
      method: 'GET',
      url: '/alerts/channels',
    });
    expect(listAfter.statusCode).toBe(200);
    const afterBody = listAfter.json();
    expect(afterBody.ok).toBe(true);
    expect(afterBody.data.length).toBe(1);
    expect(afterBody.data[0].channel).toBe('EMAIL');
    expect(afterBody.data[0].enabled).toBe(true);

    await app.close();
  });

  it('should support executions ops and etl/sync/report/health endpoints (MVP)', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    const app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter()
    );
    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    // report
    const report = await app.inject({
      method: 'GET',
      url: '/report?startAt=2026-01-01T00:00:00.000Z&endAt=2026-01-02T00:00:00.000Z',
    });
    expect(report.statusCode).toBe(200);
    expect(report.json().ok).toBe(true);

    // data source health list
    const health = await app.inject({
      method: 'GET',
      url: '/health/data-sources?page=1&pageSize=10',
    });
    expect(health.statusCode).toBe(200);
    expect(health.json().ok).toBe(true);

    // etl connections CRUD
    const createConn = await app.inject({
      method: 'POST',
      url: '/etl/connections',
      payload: {
        connection: { name: 'c1', connectionRef: 'ref_c1', status: 'ENABLED' },
      },
    });
    expect(createConn.statusCode).toBe(201);
    const connId = createConn.json().data.connectionId as string;

    const listConn = await app.inject({
      method: 'GET',
      url: '/etl/connections?page=1&pageSize=10&keyword=c1',
    });
    expect(listConn.statusCode).toBe(200);
    expect(listConn.json().data.total).toBe(1);

    const updateConn = await app.inject({
      method: 'PUT',
      url: '/etl/connections',
      payload: {
        connection: {
          id: connId,
          name: 'c1-updated',
          connectionRef: 'ref_c1',
          status: 'DISABLED',
        },
      },
    });
    expect(updateConn.statusCode).toBe(200);
    expect(updateConn.json().ok).toBe(true);

    const deleteConn = await app.inject({
      method: 'DELETE',
      url: `/etl/connections/${connId}`,
    });
    expect(deleteConn.statusCode).toBe(200);
    expect(deleteConn.json().ok).toBe(true);

    // sync records list
    const syncList = await app.inject({
      method: 'GET',
      url: '/sync/records?page=1&pageSize=10',
    });
    expect(syncList.statusCode).toBe(200);
    expect(syncList.json().ok).toBe(true);

    // executions list (empty OK)
    const execList = await app.inject({
      method: 'GET',
      url: '/executions?page=1&pageSize=10',
    });
    expect(execList.statusCode).toBe(200);
    expect(execList.json().ok).toBe(true);

    await app.close();
  });
});
