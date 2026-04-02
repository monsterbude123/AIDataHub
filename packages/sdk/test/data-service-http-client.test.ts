import { describe, expect, it } from 'vitest';
import type { Result } from '@ai-datahub/contract';
import type { HttpClient, HttpClientRequest } from '../src/http/HttpClient';
import { DataServiceHttpClient } from '../src/clients/DataServiceHttpClient';

function ok<T>(data: T): Result<T> {
  return { ok: true, data };
}

describe('DataServiceHttpClient', () => {
  it('searchDataService should call GET /data-services/search', async () => {
    const calls: HttpClientRequest[] = [];
    const http: HttpClient = {
      request: async (req) => {
        calls.push(req);
        return ok({ page: 1, pageSize: 10, total: 0, items: [] });
      },
    };
    const client = new DataServiceHttpClient(http);
    const res = await client.searchDataService({
      meta: { traceId: 't1' },
      keyword: 'k',
      page: { page: 1, pageSize: 10 },
    });
    expect(res.ok).toBe(true);
    expect(calls[0]).toEqual({
      path: '/data-services/search',
      method: 'GET',
      meta: { traceId: 't1' },
      query: { keyword: 'k', page: 1, pageSize: 10 },
    });
  });
});
