import type { FastifyRequest } from 'fastify';

/**
 * Read x-trace-id from Fastify request (string or string[]), with raw fallback.
 */
export function readIncomingTraceId(req: FastifyRequest): string | undefined {
  const h = req.headers['x-trace-id'];
  if (typeof h === 'string' && h.length > 0) {
    return h;
  }
  if (Array.isArray(h) && h[0]) {
    return h[0];
  }
  const raw = req.raw?.headers?.['x-trace-id'];
  if (typeof raw === 'string' && raw.length > 0) {
    return raw;
  }
  if (Array.isArray(raw) && raw[0]) {
    return raw[0];
  }
  return undefined;
}
