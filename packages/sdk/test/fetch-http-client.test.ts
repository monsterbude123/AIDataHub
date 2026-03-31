import { describe, expect, it } from 'vitest';

import { FetchHttpClient } from '../src/http/FetchHttpClient';

describe('FetchHttpClient', () => {
  it('should return ok Result on 200 json', async () => {
    const client = new FetchHttpClient({
      baseUrl: 'http://example.test',
      fetchImpl: (async () =>
        ({
          ok: true,
          status: 200,
          json: async () => ({ ok: true }),
        }) as unknown as Response) as typeof fetch,
    });

    const res = await client.request<{ ok: boolean }>({
      path: '/x',
      method: 'GET',
    });
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.data.ok).toBe(true);
  });

  it('should return err Result on non-2xx', async () => {
    const client = new FetchHttpClient({
      baseUrl: 'http://example.test',
      fetchImpl: (async () =>
        ({
          ok: false,
          status: 500,
          json: async () => ({ message: 'nope' }),
        }) as unknown as Response) as typeof fetch,
    });

    const res = await client.request<{ ok: boolean }>({
      path: '/x',
      method: 'GET',
    });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.code).toBe('HTTP_STATUS_ERROR');
  });
});
