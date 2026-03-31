import type { HttpClient, HttpClientRequest } from './HttpClient';
import type { Result } from '@ai-datahub/contract';
import { errResult, okResult } from '@ai-datahub/contract';
import { createTraceId } from '@ai-datahub/shared';

import { httpError } from './errors';

export type FetchHttpClientOptions = {
  baseUrl: string;
  defaultHeaders?: Record<string, string>;
  fetchImpl?: typeof fetch;
};

function buildQuery(query?: HttpClientRequest['query']): string {
  if (!query) return '';
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined) continue;
    params.set(k, String(v));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export class FetchHttpClient implements HttpClient {
  private readonly baseUrl: string;
  private readonly defaultHeaders: Record<string, string>;
  private readonly fetchImpl: typeof fetch;

  constructor(opts: FetchHttpClientOptions) {
    this.baseUrl = opts.baseUrl.replace(/\/+$/, '');
    this.defaultHeaders = opts.defaultHeaders ?? {};
    this.fetchImpl = opts.fetchImpl ?? fetch;
  }

  async request<T>(req: HttpClientRequest): Promise<Result<T>> {
    const traceId = req.meta?.traceId ?? createTraceId();

    const headers: Record<string, string> = {
      ...this.defaultHeaders,
      'content-type': 'application/json',
      'x-trace-id': traceId,
    };
    if (req.meta?.idempotencyKey)
      headers['x-idempotency-key'] = req.meta.idempotencyKey;

    try {
      const url = `${this.baseUrl}${req.path}${buildQuery(req.query)}`;
      const res = await this.fetchImpl(url, {
        method: req.method,
        headers,
        body: req.body === undefined ? undefined : JSON.stringify(req.body),
      });

      const json = (await res.json().catch(() => undefined)) as unknown;
      if (!res.ok) {
        return errResult(
          {
            code: 'HTTP_STATUS_ERROR',
            message: `HTTP ${res.status}`,
            level: 'ERROR',
            traceId,
            details:
              typeof json === 'object' && json !== null
                ? [{ reason: 'response', hint: JSON.stringify(json) }]
                : undefined,
          },
          traceId
        );
      }

      return okResult(json as T, traceId);
    } catch (e) {
      return errResult(
        httpError(e instanceof Error ? e.message : 'Fetch failed', traceId),
        traceId
      );
    }
  }
}
