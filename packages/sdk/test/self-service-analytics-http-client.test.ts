import { describe, expect, it } from 'vitest';

import type { Result } from '@ai-datahub/contract';
import type { HttpClient, HttpClientRequest } from '../src/http/HttpClient';
import { SelfServiceAnalyticsHttpClient } from '../src/clients/SelfServiceAnalyticsHttpClient';

function ok<T>(data: T): Result<T> {
  return { ok: true, data };
}

describe('SelfServiceAnalyticsHttpClient', () => {
  it('listQueries should map pagination query', async () => {
    const calls: HttpClientRequest[] = [];
    const http: HttpClient = {
      request: async <T>(req: HttpClientRequest) => {
        calls.push(req);
        return ok({ page: 1, pageSize: 10, total: 0, items: [] }) as Result<T>;
      },
    };
    const client = new SelfServiceAnalyticsHttpClient(http);
    const res = await client.listQueries({
      meta: { traceId: 't1' },
      createdBy: 'u_1',
      page: { page: 1, pageSize: 10 },
    });
    expect(res.ok).toBe(true);
    expect(calls[0]).toEqual({
      path: '/queries',
      method: 'GET',
      meta: { traceId: 't1' },
      query: { createdBy: 'u_1', page: 1, pageSize: 10 },
    });
  });

  it('executeSavedQuery should call POST /queries/:id/execute', async () => {
    const calls: HttpClientRequest[] = [];
    const http: HttpClient = {
      request: async <T>(req: HttpClientRequest) => {
        calls.push(req);
        return ok({ columns: [], rows: [], rowCount: 0 }) as Result<T>;
      },
    };
    const client = new SelfServiceAnalyticsHttpClient(http);
    const res = await client.executeSavedQuery({
      meta: { traceId: 't2' },
      queryId: 'q_1',
      params: { a: 1 },
    });
    expect(res.ok).toBe(true);
    expect(calls[0]).toEqual({
      path: '/queries/q_1/execute',
      method: 'POST',
      meta: { traceId: 't2' },
      body: { meta: { traceId: 't2' }, queryId: 'q_1', params: { a: 1 } },
    });
  });
});
