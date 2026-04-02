import { describe, expect, it } from 'vitest';
import type { Result } from '@ai-datahub/contract';
import type { HttpClient, HttpClientRequest } from '../src/http/HttpClient';
import { DataSecurityHttpClient } from '../src/clients/DataSecurityHttpClient';

function ok<T>(data: T): Result<T> {
  return { ok: true, data };
}

describe('DataSecurityHttpClient', () => {
  it('createMaskingAlgorithm should call POST /masking/algorithms', async () => {
    const calls: HttpClientRequest[] = [];
    const http: HttpClient = {
      request: async (req) => {
        calls.push(req);
        return ok({ algorithmId: 'alg_1' });
      },
    };
    const client = new DataSecurityHttpClient(http);
    const res = await client.createMaskingAlgorithm({
      meta: { traceId: 't1' },
      algorithm: { name: 'hash', type: 'HASH', config: {} },
    });
    expect(res.ok).toBe(true);
    expect(calls[0]).toEqual({
      path: '/masking/algorithms',
      method: 'POST',
      meta: { traceId: 't1' },
      body: {
        meta: { traceId: 't1' },
        algorithm: { name: 'hash', type: 'HASH', config: {} },
      },
    });
  });
});
