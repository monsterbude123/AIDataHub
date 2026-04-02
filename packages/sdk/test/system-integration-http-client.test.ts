import { describe, expect, it } from 'vitest';

import type {
  Connector,
  Result,
  TestConnectorResponse,
} from '@ai-datahub/contract';
import type { HttpClient, HttpClientRequest } from '../src/http/HttpClient';
import { SystemIntegrationHttpClient } from '../src/clients/SystemIntegrationHttpClient';

function ok<T>(data: T): Result<T> {
  return { ok: true, data };
}

describe('SystemIntegrationHttpClient', () => {
  it('should map listConnectors to GET /connectors', async () => {
    const calls: HttpClientRequest[] = [];
    const http: HttpClient = {
      request: async (req) => {
        calls.push(req);
        return ok<Connector[]>([]);
      },
    };
    const client = new SystemIntegrationHttpClient(http);

    const res = await client.listConnectors({
      meta: { traceId: 't1' },
      type: 'NOTIFICATION',
    });
    expect(res.ok).toBe(true);
    expect(calls).toHaveLength(1);
    expect(calls[0]).toEqual({
      path: '/connectors',
      method: 'GET',
      meta: { traceId: 't1' },
      query: { type: 'NOTIFICATION' },
    });
  });

  it('should map testConnector to POST /connectors/:id/test', async () => {
    const calls: HttpClientRequest[] = [];
    const http: HttpClient = {
      request: async (req) => {
        calls.push(req);
        return ok<TestConnectorResponse>({
          success: true,
          message: 'ok',
          testedAt: new Date().toISOString(),
        });
      },
    };
    const client = new SystemIntegrationHttpClient(http);

    const res = await client.testConnector({
      meta: { traceId: 't2' },
      connectorId: 'cn_1',
    });
    expect(res.ok).toBe(true);
    expect(calls).toHaveLength(1);
    expect(calls[0]).toEqual({
      path: '/connectors/cn_1/test',
      method: 'POST',
      meta: { traceId: 't2' },
      body: { meta: { traceId: 't2' }, connectorId: 'cn_1' },
    });
  });
});
