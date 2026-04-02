import { describe, expect, it } from 'vitest';
import { Test } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

import { AppModule } from '../src/AppModule';

describe('security-service (e2e)', () => {
  const authHeaders = {
    authorization: 'Bearer test-token',
    'x-user-id': 'u_test',
  };

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
      data: { service: 'security-service' },
    });

    await app.close();
  });

  it('non-public endpoint should require authorization', async () => {
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
      url: '/masking/algorithms',
      headers: { 'x-require-auth': 'true' },
    });
    expect(res.statusCode).toBe(401);
    expect(res.json().message).toContain('Authorization header missing');

    await app.close();
  });

  it('should support security+lifecycle core flows', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    const app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter()
    );
    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    const alg = await app.inject({
      method: 'POST',
      url: '/masking/algorithms',
      headers: authHeaders,
      payload: { algorithm: { name: 'hash-1', type: 'HASH', config: {} } },
    });
    expect(alg.statusCode).toBe(200);
    const algorithmId = alg.json().data.algorithmId as string;

    const rule = await app.inject({
      method: 'POST',
      url: '/masking/rules',
      headers: authHeaders,
      payload: { rule: { name: 'rule-1', pattern: '.*', algorithmId } },
    });
    expect(rule.statusCode).toBe(200);
    const ruleId = rule.json().data.ruleId as string;

    const config = await app.inject({
      method: 'POST',
      url: '/masking/configs',
      headers: authHeaders,
      payload: {
        config: {
          dataAssetId: 'asset_1',
          columnName: 'phone',
          ruleId,
          mode: 'STATIC',
          enabled: true,
        },
      },
    });
    expect(config.statusCode).toBe(200);
    const configId = config.json().data.configId as string;

    const runMask = await app.inject({
      method: 'POST',
      url: `/masking/configs/${configId}/run`,
      headers: authHeaders,
      payload: {},
    });
    expect(runMask.statusCode).toBe(200);
    expect(runMask.json().ok).toBe(true);

    const clsSet = await app.inject({
      method: 'POST',
      url: '/classification',
      headers: authHeaders,
      payload: {
        dataAssetId: 'asset_1',
        classification: { id: 'c1', level: 2, category: 'PII' },
      },
    });
    expect(clsSet.statusCode).toBe(200);
    const clsGet = await app.inject({
      method: 'GET',
      url: '/classification?dataAssetId=asset_1',
      headers: authHeaders,
    });
    expect(clsGet.statusCode).toBe(200);
    expect(clsGet.json().ok).toBe(true);

    const rlp = await app.inject({
      method: 'POST',
      url: '/row-level-policies',
      headers: authHeaders,
      payload: {
        policy: {
          roleId: 'r1',
          dataAssetId: 'asset_1',
          filterExpression: 'org_id = 1',
        },
      },
    });
    expect(rlp.statusCode).toBe(200);
    const policyId = rlp.json().data.policyId as string;

    const wm = await app.inject({
      method: 'POST',
      url: '/watermark/tasks',
      headers: authHeaders,
      payload: { task: { type: 'HIDDEN', target: 'target_1' } },
    });
    expect(wm.statusCode).toBe(200);
    const wmId = wm.json().data.taskId as string;
    const wmGet = await app.inject({
      method: 'GET',
      url: `/watermark/tasks/${wmId}`,
      headers: authHeaders,
    });
    expect(wmGet.statusCode).toBe(200);

    const enc = await app.inject({
      method: 'POST',
      url: '/encryption/tasks',
      headers: authHeaders,
      payload: {
        task: {
          type: 'ENCRYPT',
          dataAssetId: 'asset_1',
          columns: ['phone'],
          algorithm: 'AES',
        },
      },
    });
    expect(enc.statusCode).toBe(200);
    const encId = enc.json().data.taskId as string;
    const encRun = await app.inject({
      method: 'POST',
      url: `/encryption/tasks/${encId}/run`,
      headers: authHeaders,
      payload: {},
    });
    expect(encRun.statusCode).toBe(200);

    const lcp = await app.inject({
      method: 'POST',
      url: '/lifecycle/policies',
      headers: authHeaders,
      payload: {
        policy: {
          name: 'p1',
          tier: 'COLD',
          rules: { days: 30 },
          enabled: true,
        },
      },
    });
    expect(lcp.statusCode).toBe(200);
    const policyLifecycleId = lcp.json().data.policyId as string;

    const archive = await app.inject({
      method: 'POST',
      url: '/lifecycle/archive',
      headers: authHeaders,
      payload: { dataAssetId: 'asset_1', policyId: policyLifecycleId },
    });
    expect(archive.statusCode).toBe(200);
    const archiveId = archive.json().data.archiveId as string;

    const restore = await app.inject({
      method: 'POST',
      url: '/lifecycle/restore',
      headers: authHeaders,
      payload: { archiveId },
    });
    expect(restore.statusCode).toBe(200);

    const report = await app.inject({
      method: 'GET',
      headers: authHeaders,
      url: '/lifecycle/report?startAt=2026-01-01T00:00:00.000Z&endAt=2026-01-02T00:00:00.000Z',
    });
    expect(report.statusCode).toBe(200);
    expect(report.json().ok).toBe(true);

    const deletePolicy = await app.inject({
      method: 'DELETE',
      url: `/row-level-policies/${policyId}`,
      headers: authHeaders,
    });
    expect(deletePolicy.statusCode).toBe(200);

    await app.close();
  });
});
