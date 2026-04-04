import { describe, expect, it } from 'vitest';

import { httpError } from '../src/http/errors';

describe('httpError', () => {
  it('builds SdkError with optional traceId', () => {
    expect(httpError('bad')).toEqual({
      code: 'HTTP_ERROR',
      message: 'bad',
      level: 'ERROR',
      traceId: undefined,
    });
    expect(httpError('bad', 'tid')).toEqual({
      code: 'HTTP_ERROR',
      message: 'bad',
      level: 'ERROR',
      traceId: 'tid',
    });
  });
});
