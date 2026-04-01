import 'reflect-metadata';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthService } from './auth.service';
import type { AuthenticatedUser } from './auth.service';
import { IS_PUBLIC_KEY } from './public.decorator';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let authService: AuthService;
  let reflector: Reflector;

  const mockUser: AuthenticatedUser = {
    id: 'user-1',
    username: 'testuser',
    orgId: 'org-1',
    roles: ['user'],
    permissions: ['read:users'],
  };

  const createMockExecutionContext = (
    url: string,
    headers: Record<string, string> = {}
  ): ExecutionContext => {
    const request = {
      url,
      headers,
      user: undefined,
    } as Request & { user?: AuthenticatedUser };

    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
      getHandler: vi.fn(),
      getClass: vi.fn(),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    authService = {
      validateToken: vi.fn(),
    } as unknown as AuthService;
    reflector = new Reflector();
    guard = new JwtAuthGuard(reflector, authService);
  });

  describe('@Public() decorator', () => {
    it('should allow access to public endpoints', async () => {
      const context = createMockExecutionContext('/public');
      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(authService.validateToken).not.toHaveBeenCalled();
    });

    it('should check both handler and class for @Public()', async () => {
      const context = createMockExecutionContext('/any');
      const spy = vi
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue(true);

      await guard.canActivate(context);

      expect(spy).toHaveBeenCalledWith(IS_PUBLIC_KEY, expect.any(Array));
    });
  });

  describe('Swagger UI access', () => {
    it('should allow access to /api/docs', async () => {
      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      const context = createMockExecutionContext('/api/docs');

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow access to /api/docs-json', async () => {
      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      const context = createMockExecutionContext('/api/docs-json');

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow access to /api/docs-yaml', async () => {
      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      const context = createMockExecutionContext('/api/docs-yaml');

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });
  });

  describe('Authorization header validation', () => {
    beforeEach(() => {
      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    });

    it('should throw UnauthorizedException when Authorization header is missing', async () => {
      const context = createMockExecutionContext('/protected', {});

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'Authorization header missing'
      );
    });

    it('should throw UnauthorizedException for invalid Authorization format (no Bearer)', async () => {
      const context = createMockExecutionContext('/protected', {
        authorization: 'Basic dXNlcjpwYXNz',
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        'Invalid authorization header format'
      );
    });

    it('should throw UnauthorizedException for malformed Authorization header (only Bearer)', async () => {
      const context = createMockExecutionContext('/protected', {
        authorization: 'Bearer',
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        'Invalid authorization header format'
      );
    });

    it('should throw UnauthorizedException for empty token', async () => {
      const context = createMockExecutionContext('/protected', {
        authorization: 'Bearer ',
      });

      await expect(guard.canActivate(context)).rejects.toThrow('Token missing');
    });

    it('should throw UnauthorizedException for token with extra parts', async () => {
      const context = createMockExecutionContext('/protected', {
        authorization: 'Bearer token extra',
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        'Invalid authorization header format'
      );
    });
  });

  describe('Token validation', () => {
    beforeEach(() => {
      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    });

    it('should validate token and attach user to request', async () => {
      const context = createMockExecutionContext('/protected', {
        authorization: 'Bearer valid-token',
      });
      vi.mocked(authService.validateToken).mockResolvedValue(mockUser);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(authService.validateToken).toHaveBeenCalledWith('valid-token');
      const request = context.switchToHttp().getRequest();
      expect(request.user).toEqual(mockUser);
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      const context = createMockExecutionContext('/protected', {
        authorization: 'Bearer invalid-token',
      });
      vi.mocked(authService.validateToken).mockResolvedValue(null);

      await expect(guard.canActivate(context)).rejects.toThrow(
        'Invalid or expired token'
      );
    });

    it('should throw UnauthorizedException for expired token', async () => {
      const context = createMockExecutionContext('/protected', {
        authorization: 'Bearer expired-token',
      });
      vi.mocked(authService.validateToken).mockResolvedValue(null);

      await expect(guard.canActivate(context)).rejects.toThrow(
        'Invalid or expired token'
      );
    });

    it('should handle token validation errors', async () => {
      const context = createMockExecutionContext('/protected', {
        authorization: 'Bearer error-token',
      });
      vi.mocked(authService.validateToken).mockRejectedValue(
        new Error('JWT error')
      );

      await expect(guard.canActivate(context)).rejects.toThrow();
    });
  });

  describe('User attachment to request', () => {
    beforeEach(() => {
      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    });

    it('should attach user with roles and permissions', async () => {
      const userWithRoles: AuthenticatedUser = {
        id: 'user-2',
        username: 'admin',
        orgId: 'org-1',
        roles: ['admin', 'super-admin'],
        permissions: ['manage:all', 'read:users', 'create:users'],
      };
      const context = createMockExecutionContext('/protected', {
        authorization: 'Bearer admin-token',
      });
      vi.mocked(authService.validateToken).mockResolvedValue(userWithRoles);

      await guard.canActivate(context);

      const request = context.switchToHttp().getRequest();
      expect(request.user).toEqual(userWithRoles);
      expect(request.user?.roles).toHaveLength(2);
      expect(request.user?.permissions).toHaveLength(3);
    });

    it('should attach user with empty roles and permissions', async () => {
      const minimalUser: AuthenticatedUser = {
        id: 'user-3',
        username: 'minimal',
        orgId: 'org-1',
        roles: [],
        permissions: [],
      };
      const context = createMockExecutionContext('/protected', {
        authorization: 'Bearer minimal-token',
      });
      vi.mocked(authService.validateToken).mockResolvedValue(minimalUser);

      await guard.canActivate(context);

      const request = context.switchToHttp().getRequest();
      expect(request.user).toEqual(minimalUser);
    });
  });
});
