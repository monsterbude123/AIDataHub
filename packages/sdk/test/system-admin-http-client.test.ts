import { describe, expect, it } from 'vitest';
import type { Result } from '@ai-datahub/contract';
import type { HttpClient, HttpClientRequest } from '../src/http/HttpClient';
import { SystemAdminHttpClient } from '../src/clients/SystemAdminHttpClient';

function ok<T>(data: T): Result<T> {
  return { ok: true, data };
}

describe('SystemAdminHttpClient', () => {
  it('listProjects should map query params', async () => {
    const calls: HttpClientRequest[] = [];
    const http: HttpClient = {
      request: async <T>(req: HttpClientRequest) => {
        calls.push(req);
        return ok({ page: 1, pageSize: 10, total: 0, items: [] }) as Result<T>;
      },
    };
    const client = new SystemAdminHttpClient(http);
    const res = await client.listProjects({
      meta: { traceId: 't1' },
      orgId: 'org_1',
      keyword: 'kw',
      page: { page: 1, pageSize: 10 },
    });
    expect(res.ok).toBe(true);
    expect(calls[0]).toEqual({
      path: '/projects',
      method: 'GET',
      meta: { traceId: 't1' },
      query: { orgId: 'org_1', keyword: 'kw', page: 1, pageSize: 10 },
    });
  });
});
