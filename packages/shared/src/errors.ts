import type { ErrorLevel, SdkError } from '@ai-datahub/contract';

export type ErrorContext = {
  traceId?: string;
};

const LEVELS: ReadonlySet<string> = new Set<ErrorLevel>([
  'INFO',
  'WARN',
  'ERROR',
  'CRITICAL',
]);

function isSdkErrorLike(v: unknown): v is SdkError {
  if (typeof v !== 'object' || v === null) return false;
  const anyV = v as Partial<SdkError>;
  return (
    typeof anyV.code === 'string' &&
    typeof anyV.message === 'string' &&
    typeof anyV.level === 'string' &&
    LEVELS.has(anyV.level)
  );
}

export function toSdkError(err: unknown, ctx: ErrorContext = {}): SdkError {
  if (isSdkErrorLike(err)) return err;

  if (err instanceof Error) {
    return {
      code: 'INTERNAL_ERROR',
      message: err.message || 'Internal error',
      level: 'CRITICAL',
      traceId: ctx.traceId,
    };
  }

  return {
    code: 'INTERNAL_ERROR',
    message: 'Internal error',
    level: 'CRITICAL',
    traceId: ctx.traceId,
  };
}
