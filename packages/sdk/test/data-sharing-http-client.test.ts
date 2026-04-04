import { describe, expect, it } from 'vitest';

import type { Result } from '@ai-datahub/contract';
import type { HttpClient, HttpClientRequest } from '../src/http/HttpClient';
import { DataSharingHttpClient } from '../src/clients/DataSharingHttpClient';

function ok<T>(data: T): Result<T> {
  return { ok: true, data };
}

describe('DataSharingHttpClient', () => {
  it('getPortalHomeStats should call GET /portal/stats', async () => {
    const calls: HttpClientRequest[] = [];
    const http: HttpClient = {
      request: async <T>(req: HttpClientRequest) => {
        calls.push(req);
        return ok({
          todoCount: 0,
          hotResourcesTop10: [],
          resourceDirectoryStats: [],
        }) as Result<T>;
      },
    };
    const client = new DataSharingHttpClient(http);

    const res = await client.getPortalHomeStats({
      meta: { traceId: 't1' },
      orgId: 'org_1',
    });
    expect(res.ok).toBe(true);
    expect(calls[0]).toEqual({
      path: '/portal/stats',
      method: 'GET',
      meta: { traceId: 't1' },
      query: { orgId: 'org_1' },
    });
  });

  it('listRegisteredResources should map page to query', async () => {
    const calls: HttpClientRequest[] = [];
    const http: HttpClient = {
      request: async <T>(req: HttpClientRequest) => {
        calls.push(req);
        return ok({ page: 1, pageSize: 10, total: 0, items: [] }) as Result<T>;
      },
    };
    const client = new DataSharingHttpClient(http);

    const res = await client.listRegisteredResources({
      meta: { traceId: 't2' },
      ownerOrgId: 'org_1',
      type: 'API',
      keyword: 'k',
      page: { page: 1, pageSize: 10 },
    });
    expect(res.ok).toBe(true);
    expect(calls[0]).toEqual({
      path: '/resources/registered',
      method: 'GET',
      meta: { traceId: 't2' },
      query: {
        ownerOrgId: 'org_1',
        type: 'API',
        keyword: 'k',
        page: 1,
        pageSize: 10,
      },
    });
  });
});
