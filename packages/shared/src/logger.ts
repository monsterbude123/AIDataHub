import type { RequestMeta } from '@ai-datahub/contract';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  traceId?: string;
  context?: Record<string, unknown>;
}

export interface Logger {
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown> | Error): void;
  withTrace(traceMeta: RequestMeta | string): Logger;
}

export class DefaultLogger implements Logger {
  private readonly traceId?: string;
  private readonly defaultContext: Record<string, unknown>;

  constructor(defaultContext: Record<string, unknown> = {}, traceId?: string) {
    this.defaultContext = defaultContext;
    this.traceId = traceId;
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context);
  }

  error(message: string, context?: Record<string, unknown> | Error): void {
    let ctx: Record<string, unknown> | undefined;
    if (context instanceof Error) {
      ctx = {
        error: context.message,
        stack: context.stack,
      };
    } else {
      ctx = context;
    }
    this.log('error', message, ctx);
  }

  withTrace(traceMeta: RequestMeta | string): Logger {
    const traceId =
      typeof traceMeta === 'string' ? traceMeta : traceMeta.traceId;
    return new DefaultLogger(this.defaultContext, traceId);
  }

  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>
  ): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      traceId: this.traceId,
      context: {
        ...this.defaultContext,
        ...context,
      },
    };

    // In production, use structured logging (pino/winston)
    // For now, output to console with level prefix
    const prefix = `[${entry.timestamp}] ${level.toUpperCase()}${entry.traceId ? ` ${entry.traceId}` : ''}: `;
    /* eslint-disable no-console */
    switch (level) {
      case 'error':
        console.error(prefix + message, entry.context);
        break;
      case 'warn':
        console.warn(prefix + message, entry.context);
        break;
      case 'debug':
        if (process.env.DEBUG === 'true') {
          console.debug(prefix + message, entry.context);
        }
        break;
      case 'info':
      default:
        console.log(prefix + message, entry.context);
        break;
    }
    /* eslint-enable no-console */
  }
}

export const globalLogger = new DefaultLogger();

export function createLogger(context: Record<string, unknown> = {}): Logger {
  return new DefaultLogger(context);
}
