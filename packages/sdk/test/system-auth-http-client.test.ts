import { describe, expect, it } from 'vitest';
import type { Result } from '@ai-datahub/contract';
import type { HttpClient, HttpClientRequest } from '../src/http/HttpClient';
import { SystemAuthHttpClient } from '../src/clients/SystemAuthHttpClient';

function ok<T>(data: T): Result<T> {
  return { ok: true, data };
}

describe('SystemAuthHttpClient', () => {
  it('login should call POST /auth/login', async () => {
    const calls: HttpClientRequest[] = [];
    const http: HttpClient = {
      request: async <T>(req: HttpClientRequest) => {
        calls.push(req);
        return ok({
          userId: 'u1',
          username: 'a',
          token: 't',
          expiresAt: 'x',
        }) as Result<T>;
      },
    };
    const client = new SystemAuthHttpClient(http);
    const res = await client.login({
      meta: { traceId: 't1' },
      username: 'a',
      password: 'b',
    });
    expect(res.ok).toBe(true);
    expect(calls[0]).toEqual({
      path: '/auth/login',
      method: 'POST',
      meta: { traceId: 't1' },
      body: { username: 'a', password: 'b' },
    });
  });
});
