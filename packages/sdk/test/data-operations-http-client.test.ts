import { describe, expect, it } from 'vitest';

import type {
  AlertRule,
  PageResult,
  Result,
  SearchAlertRulesRequest,
} from '@ai-datahub/contract';

import type { HttpClient, HttpClientRequest } from '../src/http/HttpClient';
import { DataOperationsHttpClient } from '../src/clients/DataOperationsHttpClient';

function ok<T>(data: T): Result<T> {
  return { ok: true, data };
}

describe('DataOperationsHttpClient', () => {
  it('listAlertRules should call GET /alerts/rules', async () => {
    const calls: HttpClientRequest[] = [];
    const http: HttpClient = {
      request: async (req) => {
        calls.push(req);
        return ok<AlertRule[]>([]);
      },
    };
    const client = new DataOperationsHttpClient(http);

    const res = await client.listAlertRules({ meta: { traceId: 't1' } });
    expect(res.ok).toBe(true);
    expect(calls).toHaveLength(1);
    expect(calls[0]).toEqual({
      path: '/alerts/rules',
      method: 'GET',
      meta: { traceId: 't1' },
    });
  });

  it('searchAlertRules should call GET /alerts/rules/search with query', async () => {
    const calls: HttpClientRequest[] = [];
    const http: HttpClient = {
      request: async (req) => {
        calls.push(req);
        return ok<PageResult<AlertRule>>({
          page: 1,
          pageSize: 10,
          total: 0,
          items: [],
        });
      },
    };
    const client = new DataOperationsHttpClient(http);

    const req: SearchAlertRulesRequest = {
      meta: { traceId: 't2' },
      keyword: 'x',
      enabled: true,
      type: 'TIMEOUT',
      page: { page: 1, pageSize: 10 },
    };
    const res = await client.searchAlertRules(req);
    expect(res.ok).toBe(true);
    expect(calls).toHaveLength(1);
    expect(calls[0]).toEqual({
      path: '/alerts/rules/search',
      method: 'GET',
      meta: { traceId: 't2' },
      query: {
        keyword: 'x',
        enabled: true,
        type: 'TIMEOUT',
        page: 1,
        pageSize: 10,
      },
    });
  });
});
