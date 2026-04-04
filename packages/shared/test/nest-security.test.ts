import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import { firstValueFrom, of, throwError } from 'rxjs';

import { IS_PUBLIC_KEY } from '../src/auth';
import {
  BearerAuthGuard,
  WriteAuditLogInterceptor,
} from '../src/nest-security';

function makeExecutionContext(
  headers: Record<string, string | undefined>,
  method = 'GET',
  url = '/x'
): ExecutionContext {
  const req = {
    headers,
    method,
    url,
    traceId: 't1',
    userId: undefined as string | undefined,
  };
  return {
    switchToHttp: () => ({
      getRequest: () => req,
      getResponse: () => ({ statusCode: 200 }),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

describe('BearerAuthGuard', () => {
  let guard: BearerAuthGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: (key: unknown) =>
        key === IS_PUBLIC_KEY ? false : undefined,
    } as unknown as Reflector;
    guard = new BearerAuthGuard(reflector);
  });

  afterEach(() => {
    delete process.env.VITEST;
    delete process.env.NODE_ENV;
  });

  it('allows @Public when reflector marks public', () => {
    const r = {
      getAllAndOverride: (key: unknown) =>
        key === IS_PUBLIC_KEY ? true : false,
    } as unknown as Reflector;
    const g = new BearerAuthGuard(r);
    const ctx = makeExecutionContext({});
    expect(g.canActivate(ctx)).toBe(true);
  });

  it('in test env without Authorization and without x-require-auth, injects test user', () => {
    process.env.VITEST = 'true';
    const ctx = makeExecutionContext({
      'x-user-id': 'u-from-header',
    });
    const req = ctx.switchToHttp().getRequest() as {
      headers: Record<string, string | undefined>;
      userId?: string;
    };
    expect(guard.canActivate(ctx)).toBe(true);
    expect(req.userId).toBe('u-from-header');
  });

  it('throws when x-require-auth true and no Authorization', () => {
    process.env.VITEST = 'true';
    const ctx = makeExecutionContext({
      'x-require-auth': 'true',
    });
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('throws when not test env and no Authorization', () => {
    delete process.env.VITEST;
    process.env.NODE_ENV = 'production';
    const ctx = makeExecutionContext({});
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('accepts Bearer token and sets userId fallback', () => {
    delete process.env.VITEST;
    process.env.NODE_ENV = 'production';
    const ctx = makeExecutionContext({
      authorization: 'Bearer tok',
    });
    const req = ctx.switchToHttp().getRequest() as {
      headers: Record<string, string | undefined>;
      userId?: string;
    };
    expect(guard.canActivate(ctx)).toBe(true);
    expect(req.userId).toBe('system-user');
  });

  it('rejects malformed Authorization', () => {
    delete process.env.VITEST;
    process.env.NODE_ENV = 'production';
    const ctx = makeExecutionContext({
      authorization: 'Basic x',
    });
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });
});

describe('WriteAuditLogInterceptor', () => {
  it('does not audit GET', async () => {
    const interceptor = new WriteAuditLogInterceptor();
    const ctx = makeExecutionContext({}, 'GET', '/r');
    const next = { handle: () => of({ ok: true }) };
    await firstValueFrom(interceptor.intercept(ctx, next));
  });

  it('logs on POST success', async () => {
    const interceptor = new WriteAuditLogInterceptor();
    const ctx = makeExecutionContext({}, 'POST', '/w');
    const next = { handle: () => of({ created: true }) };
    await firstValueFrom(interceptor.intercept(ctx, next));
  });

  it('logs on POST failure', async () => {
    const interceptor = new WriteAuditLogInterceptor();
    const ctx = makeExecutionContext({}, 'POST', '/w');
    const err = new Error('fail');
    const next = {
      handle: () => throwError(() => err),
    };
    await expect(firstValueFrom(interceptor.intercept(ctx, next))).rejects.toBe(
      err
    );
  });
});
