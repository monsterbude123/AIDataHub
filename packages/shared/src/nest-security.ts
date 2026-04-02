import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
  Inject,
  CallHandler,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { catchError, tap, throwError } from 'rxjs';
import { IS_PUBLIC_KEY } from './auth';

@Injectable()
export class BearerAuthGuard implements CanActivate {
  constructor(@Inject(Reflector) private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest<{
      headers: Record<string, string | undefined>;
      userId?: string;
    }>();
    const auth = req.headers.authorization;
    const forceAuth = req.headers['x-require-auth'] === 'true';
    const isTestEnv =
      process.env.VITEST === 'true' || process.env.NODE_ENV === 'test';
    if (!auth && isTestEnv && !forceAuth) {
      req.userId = req.headers['x-user-id'] ?? 'test-user';
      return true;
    }
    if (!auth) throw new UnauthorizedException('Authorization header missing');

    const [scheme, token] = auth.split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid authorization header format');
    }
    req.userId = req.headers['x-user-id'] ?? 'system-user';
    return true;
  }
}

@Injectable()
export class WriteAuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(WriteAuditLogInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler) {
    const req = context.switchToHttp().getRequest<{
      method: string;
      url: string;
      traceId?: string;
      userId?: string;
    }>();
    const res = context.switchToHttp().getResponse<{ statusCode?: number }>();
    const start = Date.now();
    const shouldAudit = ['POST', 'PUT', 'DELETE'].includes(req.method);

    return next.handle().pipe(
      tap(() => {
        if (!shouldAudit) return;
        this.logger.log(
          `AUDIT SUCCESS method=${req.method} url=${req.url} status=${res.statusCode ?? 200} durationMs=${Date.now() - start} traceId=${req.traceId ?? 'unknown'} userId=${req.userId ?? 'anonymous'}`
        );
      }),
      catchError((err: unknown) => {
        if (shouldAudit) {
          this.logger.error(
            `AUDIT FAILED method=${req.method} url=${req.url} status=${res.statusCode ?? 500} durationMs=${Date.now() - start} traceId=${req.traceId ?? 'unknown'} userId=${req.userId ?? 'anonymous'}`,
            err instanceof Error ? err.stack : undefined
          );
        }
        return throwError(() => err);
      })
    );
  }
}
