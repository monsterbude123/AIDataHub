import type { Result, SdkError } from './types';

export function okResult<T>(data: T, traceId?: string): Result<T> {
  return { ok: true, data, traceId };
}

export function errResult<T = never>(
  error: SdkError,
  traceId?: string
): Result<T> {
  return { ok: false, error, traceId };
}

export function isOk<T>(
  res: Result<T>
): res is { ok: true; data: T; traceId?: string } {
  return res.ok;
}

export function isErr<T>(
  res: Result<T>
): res is { ok: false; error: SdkError; traceId?: string } {
  return !res.ok;
}
