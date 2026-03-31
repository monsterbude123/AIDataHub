import { describe, expect, it } from 'vitest';

import { errResult, isErr, isOk, okResult } from '../src/result';

describe('Result helpers', () => {
  it('okResult should produce ok Result', () => {
    const res = okResult({ a: 1 }, 't1');
    expect(isOk(res)).toBe(true);
    expect(isErr(res)).toBe(false);
    if (res.ok) {
      expect(res.data).toEqual({ a: 1 });
      expect(res.traceId).toBe('t1');
    }
  });

  it('errResult should produce err Result', () => {
    const res = errResult(
      { code: 'X', message: 'bad', level: 'ERROR', traceId: 't2' },
      't2'
    );
    expect(isOk(res)).toBe(false);
    expect(isErr(res)).toBe(true);
    if (!res.ok) {
      expect(res.error.code).toBe('X');
      expect(res.traceId).toBe('t2');
    }
  });
});
