import type { NestMiddleware } from '@nestjs/common';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { createLogger } from '@ai-datahub/shared';
import { getTraceIdFromHeaders, createTraceId } from '@ai-datahub/shared';

const logger = createLogger({ module: 'RequestLogger' });

/**
 * 请求日志中间件
 * 记录每个请求的方法、路径、状态码和响应时间
 * 确保 traceId 贯穿整个请求生命周期
 */
export class RequestLoggerMiddleware implements NestMiddleware {
  use(
    req: FastifyRequest & { traceId?: string },
    res: FastifyReply,
    next: () => void
  ): void {
    const startTime = Date.now();

    // 获取 traceId 或创建新的
    const traceId =
      getTraceIdFromHeaders(
        req.headers as Record<string, string | string[] | undefined>
      ) ?? createTraceId();
    req.traceId = traceId;

    // 添加 traceId 到响应头
    res.header('x-trace-id', traceId);

    // 请求完成后记录日志
    res.raw.on('finish', () => {
      const duration = Date.now() - startTime;
      const statusCode = res.statusCode;

      const level = statusCode >= 400 ? 'warn' : 'info';

      logger[level](`${req.method} ${req.url} ${statusCode} ${duration}ms`, {
        method: req.method,
        url: req.url,
        statusCode,
        duration,
        traceId,
      });
    });

    next();
  }
}
