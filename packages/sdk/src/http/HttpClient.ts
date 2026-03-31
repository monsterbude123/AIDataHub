import type { RequestMeta, Result } from '@ai-datahub/contract';

export type HttpClientRequest = {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  meta?: RequestMeta;
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  headers?: Record<string, string>;
};

export type HttpClient = {
  request<T>(req: HttpClientRequest): Promise<Result<T>>;
};
