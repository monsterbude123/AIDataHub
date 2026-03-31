import { randomUUID } from 'node:crypto';

export type HeadersLike = Record<string, string | string[] | undefined>;

export function createTraceId(): string {
  return randomUUID();
}

export function getTraceIdFromHeaders(
  headers: HeadersLike
): string | undefined {
  const v = headers['x-trace-id'];
  if (Array.isArray(v)) return v[0];
  return v;
}
