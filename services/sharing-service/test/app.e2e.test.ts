import { describe, expect, it } from 'vitest';
import { Test } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

import { AppModule } from '../src/AppModule';

describe('sharing-service (e2e)', () => {
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
      url: '/portal/stats?orgId=org_1',
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
      data: { service: 'sharing-service' },
    });

    await app.close();
  });

  it('should support portal/directories/resources/services/applications/exchange (MVP)', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    const app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter()
    );
    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    // portal
    const portal = await app.inject({
      method: 'GET',
      url: '/portal/stats?orgId=org_1',
    });
    expect(portal.statusCode).toBe(200);
    expect(portal.json().ok).toBe(true);

    // directories CRUD
    const createDir = await app.inject({
      method: 'POST',
      url: '/directories',
      payload: { node: { name: 'root', code: 'root' } },
    });
    expect(createDir.statusCode).toBe(201);
    const dirId = createDir.json().data.directoryId as string;

    const listDir = await app.inject({ method: 'GET', url: '/directories' });
    expect(listDir.statusCode).toBe(200);
    expect(listDir.json().data.length).toBe(1);

    const updateDir = await app.inject({
      method: 'PUT',
      url: '/directories',
      payload: { node: { id: dirId, name: 'root2', code: 'root' } },
    });
    expect(updateDir.statusCode).toBe(200);
    expect(updateDir.json().ok).toBe(true);

    // registered resource
    const createReg = await app.inject({
      method: 'POST',
      url: '/resources/registered',
      payload: {
        resource: {
          type: 'API',
          name: 'api-1',
          ownerOrgId: 'org_1',
          description: 'd',
          method: 'GET',
          endpoint: 'http://example',
        },
      },
    });
    expect(createReg.statusCode).toBe(201);
    const rrId = createReg.json().data.resourceId as string;

    const testApi = await app.inject({
      method: 'POST',
      url: `/resources/registered/${rrId}/test`,
      payload: {},
    });
    expect(testApi.statusCode).toBe(200);
    expect(testApi.json().ok).toBe(true);

    const listReg = await app.inject({
      method: 'GET',
      url: '/resources/registered?page=1&pageSize=10&keyword=api',
    });
    expect(listReg.statusCode).toBe(200);
    expect(listReg.json().data.total).toBe(1);

    // compiled resource
    const createComp = await app.inject({
      method: 'POST',
      url: '/resources/compiled',
      payload: {
        resource: {
          directoryId: dirId,
          name: 'comp-1',
          type: 'API',
          shareType: 'UNCONDITIONAL',
          dataItems: [],
        },
      },
    });
    expect(createComp.statusCode).toBe(201);
    const crId = createComp.json().data.compiledResourceId as string;

    const publishComp = await app.inject({
      method: 'POST',
      url: `/resources/compiled/${crId}/publish`,
      payload: { action: 'SUBMIT' },
    });
    expect(publishComp.statusCode).toBe(200);
    expect(publishComp.json().ok).toBe(true);

    // mapping
    const attach = await app.inject({
      method: 'POST',
      url: '/mappings',
      payload: {
        compiledResourceId: crId,
        registeredResourceId: rrId,
        mode: 'AUTO',
      },
    });
    expect(attach.statusCode).toBe(200);
    const mappingId = attach.json().data.mappingId as string;
    expect(typeof mappingId).toBe('string');

    const getMap = await app.inject({
      method: 'GET',
      url: `/mappings?compiledResourceId=${encodeURIComponent(crId)}`,
    });
    expect(getMap.statusCode).toBe(200);
    expect(getMap.json().ok).toBe(true);

    // sharing service
    const createSvc = await app.inject({
      method: 'POST',
      url: '/services',
      payload: {
        service: {
          compiledResourceId: crId,
          name: 'svc-1',
          type: 'API_PROXY',
        },
      },
    });
    expect(createSvc.statusCode).toBe(201);
    const svcId = createSvc.json().data.serviceId as string;

    const publishSvc = await app.inject({
      method: 'POST',
      url: `/services/${svcId}/publish`,
      payload: { publish: true },
    });
    expect(publishSvc.statusCode).toBe(200);
    expect(publishSvc.json().ok).toBe(true);

    // application
    const createApp = await app.inject({
      method: 'POST',
      url: '/applications',
      payload: {
        serviceId: svcId,
        applicantUserId: 'u_1',
        applicantOrgId: 'org_2',
        payload: { x: 1 },
        submit: true,
      },
    });
    expect(createApp.statusCode).toBe(200);
    expect(createApp.json().ok).toBe(true);
    const appId = createApp.json().data.applicationId as string;

    const listMy = await app.inject({
      method: 'GET',
      url: '/applications?page=1&pageSize=10&applicantUserId=u_1',
    });
    expect(listMy.statusCode).toBe(200);
    expect(listMy.json().ok).toBe(true);

    const urge = await app.inject({
      method: 'POST',
      url: `/applications/${appId}/urge`,
      payload: { message: 'please' },
    });
    expect(urge.statusCode).toBe(200);
    expect(urge.json().ok).toBe(true);

    // exchange
    const exList = await app.inject({
      method: 'GET',
      url: '/exchange/executions?page=1&pageSize=10',
    });
    expect(exList.statusCode).toBe(200);
    expect(exList.json().ok).toBe(true);

    const rerun = await app.inject({
      method: 'POST',
      url: '/exchange/executions/ex_1/rerun',
      payload: {},
    });
    expect(rerun.statusCode).toBe(200);
    expect(rerun.json().ok).toBe(true);

    const schedule = await app.inject({
      method: 'POST',
      url: '/exchange/schedule',
      payload: { executionId: 'ex_1', enabled: true },
    });
    expect(schedule.statusCode).toBe(200);
    expect(schedule.json().ok).toBe(true);

    await app.close();
  });
});
