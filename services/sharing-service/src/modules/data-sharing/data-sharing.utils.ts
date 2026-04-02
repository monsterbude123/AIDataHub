import type { ISODateTime, Result } from '@ai-datahub/contract';

export function nowIso(): ISODateTime {
  return new Date().toISOString();
}

export function invalidArgument(message: string): Result<never> {
  return {
    ok: false,
    error: { code: 'INVALID_ARGUMENT', message, level: 'ERROR' },
  };
}
