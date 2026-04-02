import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { FastifyRequest, FastifyReply } from 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    traceId?: string;
  }
}

/**
 * Trace ID generation and propagation middleware
 *
 * Generates a new traceId if none is provided in the request headers,
 * and adds it to the response headers for debugging.
 */
@Injectable()
export class TraceIdMiddleware implements NestMiddleware {
  use(req: FastifyRequest, res: FastifyReply, next: () => void): void {
    // Get traceId from request header or generate a new one
    const traceId = (req.headers['x-trace-id'] as string) || randomUUID();

    // Attach traceId to request object for downstream use
    req.traceId = traceId;

    // Add traceId to response headers
    res.header('x-trace-id', traceId);

    next();
  }
}
