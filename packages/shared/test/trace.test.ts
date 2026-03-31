import { describe, expect, it } from 'vitest';

import { createTraceId, getTraceIdFromHeaders } from '../src/trace';

describe('trace helpers', () => {
  it('createTraceId should be non-empty and reasonably unique', () => {
    const a = createTraceId();
    const b = createTraceId();
    expect(typeof a).toBe('string');
    expect(a.length).toBeGreaterThan(10);
    expect(a).not.toBe(b);
  });

  it('getTraceIdFromHeaders should read x-trace-id', () => {
    const id = getTraceIdFromHeaders({ 'x-trace-id': 't1' });
    expect(id).toBe('t1');
  });

  it('getTraceIdFromHeaders should be undefined when not present', () => {
    const id = getTraceIdFromHeaders({});
    expect(id).toBeUndefined();
  });
});
