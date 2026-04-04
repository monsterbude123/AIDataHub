import { describe, expect, it } from 'vitest';
import type { Result } from '@ai-datahub/contract';
import type { HttpClient, HttpClientRequest } from '../src/http/HttpClient';
import { DataLifecycleHttpClient } from '../src/clients/DataLifecycleHttpClient';

function ok<T>(data: T): Result<T> {
  return { ok: true, data };
}

describe('DataLifecycleHttpClient', () => {
  it('getLifecycleReport should map GET query params', async () => {
    const calls: HttpClientRequest[] = [];
    const http: HttpClient = {
      request: async <T>(req: HttpClientRequest) => {
        calls.push(req);
        return ok({ points: [] }) as Result<T>;
      },
    };
    const client = new DataLifecycleHttpClient(http);
    const res = await client.getLifecycleReport({
      meta: { traceId: 't1' },
      startAt: '2026-01-01T00:00:00.000Z',
      endAt: '2026-01-02T00:00:00.000Z',
    });
    expect(res.ok).toBe(true);
    expect(calls[0]).toEqual({
      path: '/lifecycle/report',
      method: 'GET',
      meta: { traceId: 't1' },
      query: {
        orgId: undefined,
        projectId: undefined,
        startAt: '2026-01-01T00:00:00.000Z',
        endAt: '2026-01-02T00:00:00.000Z',
      },
    });
  });
});
