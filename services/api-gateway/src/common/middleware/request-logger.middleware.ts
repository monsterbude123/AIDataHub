import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import type { ServerResponse } from 'http';

declare module 'fastify' {
  interface FastifyRequest {
    traceId?: string;
  }
}

/**
 * Request logging middleware
 *
 * Logs request method, path, status code, and response time.
 * Includes traceId in all log entries for tracing.
 */
@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RequestLoggerMiddleware.name);

  use(req: FastifyRequest, res: ServerResponse, next: () => void): void {
    const startTime = Date.now();
    const traceId = req.traceId || 'unknown';
    const { method, url } = req;

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const statusCode = res.statusCode;

      this.logger.log(
        `${method} ${url} ${statusCode} - ${duration}ms - traceId=${traceId}`
      );
    });

    next();
  }
}
