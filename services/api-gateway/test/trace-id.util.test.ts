import { describe, expect, it } from 'vitest';
import type { FastifyRequest } from 'fastify';

import { readIncomingTraceId } from '../src/common/middleware/trace-id.util';

describe('readIncomingTraceId', () => {
  it('reads string header', () => {
    const req = {
      headers: { 'x-trace-id': 'abc' },
      raw: { headers: {} },
    } as unknown as FastifyRequest;
    expect(readIncomingTraceId(req)).toBe('abc');
  });

  it('reads first element when header is array', () => {
    const req = {
      headers: { 'x-trace-id': ['x', 'y'] },
      raw: { headers: {} },
    } as unknown as FastifyRequest;
    expect(readIncomingTraceId(req)).toBe('x');
  });

  it('falls back to raw.headers', () => {
    const req = {
      headers: {},
      raw: { headers: { 'x-trace-id': 'raw-id' } },
    } as unknown as FastifyRequest;
    expect(readIncomingTraceId(req)).toBe('raw-id');
  });
});
