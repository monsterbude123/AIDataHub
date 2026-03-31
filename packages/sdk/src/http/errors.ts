import type { SdkError } from '@ai-datahub/contract';

export function httpError(message: string, traceId?: string): SdkError {
  return {
    code: 'HTTP_ERROR',
    message,
    level: 'ERROR',
    traceId,
  };
}
