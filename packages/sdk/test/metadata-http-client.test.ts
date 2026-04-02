import { describe, expect, it } from 'vitest';
import type { Result } from '@ai-datahub/contract';
import type { HttpClient, HttpClientRequest } from '../src/http/HttpClient';
import { MetadataHttpClient } from '../src/clients/MetadataHttpClient';

function ok<T>(data: T): Result<T> {
  return { ok: true, data };
}

describe('MetadataHttpClient', () => {
  it('getMetadataVersions should map asset path and pagination', async () => {
    const calls: HttpClientRequest[] = [];
    const http: HttpClient = {
      request: async (req) => {
        calls.push(req);
        return ok({ page: 1, pageSize: 10, total: 0, items: [] });
      },
    };
    const client = new MetadataHttpClient(http);
    const res = await client.getMetadataVersions({
      meta: { traceId: 't1' },
      dataAssetId: 'asset_1',
      page: { page: 1, pageSize: 10 },
    });
    expect(res.ok).toBe(true);
    expect(calls[0]).toEqual({
      path: '/metadata/assets/asset_1/versions',
      method: 'GET',
      meta: { traceId: 't1' },
      query: { page: 1, pageSize: 10 },
    });
  });
});
