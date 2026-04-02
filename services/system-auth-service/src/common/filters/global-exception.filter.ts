import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { toSdkError } from '@ai-datahub/shared';
import type { Result, SdkError } from '@ai-datahub/contract';
import { createTraceId, getTraceIdFromHeaders } from '@ai-datahub/shared';

/**
 * 全局异常过滤器
 * 将所有异常统一转换为 Result<T> 格式输出
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<{
      headers: Record<string, string | string[] | undefined>;
      traceId?: string;
    }>();

    // 获取或创建 traceId
    const traceId =
      request.traceId ??
      getTraceIdFromHeaders(request.headers) ??
      createTraceId();

    // 确定 HTTP 状态码
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // 转换为 SdkError
    const error = toSdkError(exception, { traceId });

    // 构造统一输出
    const response: Result<never> = this.buildResponse(error, traceId);

    reply.status(status).send(response);
  }

  private buildResponse(error: SdkError, traceId: string): Result<never> {
    return {
      ok: false,
      error,
      traceId,
    };
  }
}
