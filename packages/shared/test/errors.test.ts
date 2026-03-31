import { describe, expect, it } from 'vitest';

import { toSdkError } from '../src/errors';

describe('toSdkError', () => {
  it('should map unknown error to CRITICAL SdkError', () => {
    const err = toSdkError({ any: 'thing' }, { traceId: 't1' });
    expect(err.code).toBe('INTERNAL_ERROR');
    expect(err.level).toBe('CRITICAL');
    expect(err.traceId).toBe('t1');
  });

  it('should preserve SdkError-like objects', () => {
    const err = toSdkError(
      { code: 'X', message: 'bad', level: 'ERROR', traceId: 't2' },
      { traceId: 't1' }
    );
    expect(err.code).toBe('X');
    expect(err.level).toBe('ERROR');
    expect(err.traceId).toBe('t2');
  });
});
