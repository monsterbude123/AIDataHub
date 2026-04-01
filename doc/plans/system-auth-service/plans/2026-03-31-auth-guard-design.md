# Authentication Guard and SDK Auth Middleware Design

Date: 2026-03-31

## Overview

为 system-auth-service 添加全局认证守卫，确保所有 API 端点默认需要认证，同时提供初始化脚本创建管理员用户，并扩展 SDK 支持认证流程。

## Requirements

1. 所有 API 端点默认需要认证
2. 公开端点：`/auth/login`、`/health`、`/api/docs`（Swagger）
3. 初始化脚本创建超级管理员，密码自动生成
4. SDK 提供认证包装器，自动注入 Bearer token

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    system-auth-service                       │
├─────────────────────────────────────────────────────────────┤
│  Global: APP_GUARD (JwtAuthGuard)                           │
│  ├── @Public() routes (skip auth)                           │
│  │   ├── POST /auth/login                                   │
│  │   ├── GET  /health                                       │
│  │   └── GET  /api/docs (Swagger)                          │
│  └── All other routes require Bearer token                  │
├─────────────────────────────────────────────────────────────┤
│  Initialization Script (runs on startup)                    │
│  ├── Check if admin user exists                             │
│  ├── Create super-admin role if not exists                  │
│  ├── Create admin user with auto-generated password         │
│  └── Log credentials to console (one-time)                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                        @ai-datahub/sdk                       │
├─────────────────────────────────────────────────────────────┤
│  SystemAuthHttpClient                                       │
│  ├── login() - 新增，返回 token                             │
│  └── 其他方法不变                                            │
├─────────────────────────────────────────────────────────────┤
│  AuthenticatedHttpClient (新增)                             │
│  ├── 包装任意 HttpClient                                    │
│  ├── 自动注入 Authorization: Bearer {token}                 │
│  └── 提供 getToken()/setToken() 方法                        │
└─────────────────────────────────────────────────────────────┘
```

## Components

### 1. @Public() Decorator

创建装饰器标记无需认证的公开端点。

```typescript
// src/modules/auth/public.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

### 2. JwtAuthGuard Modification

修改现有 Guard 以支持公开端点跳过认证。

```typescript
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    // Existing token validation logic
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    // ... validation
  }
}
```

### 3. Global Guard Registration

在 AuthModule 中注册全局 Guard。

```typescript
// auth.module.ts
providers: [
  {
    provide: APP_GUARD,
    useClass: JwtAuthGuard,
  },
  AuthService,
  // ...
];
```

### 4. Initialization Service

创建初始化服务，在应用启动时检查并创建管理员。

```typescript
// src/modules/init/init.service.ts
@Injectable()
export class InitService implements OnApplicationBootstrap {
  async onApplicationBootstrap() {
    await this.initializeAdmin();
  }

  private async initializeAdmin() {
    // 1. Check if admin exists
    // 2. Create super-admin role with all permissions
    // 3. Generate secure random password (16 chars)
    // 4. Create admin user and assign role
    // 5. Output credentials to console
  }
}
```

#### Console Output

```
┌─────────────────────────────────────────────────────────────┐
│  🔐 Initial Admin Credentials (save this securely!)         │
├─────────────────────────────────────────────────────────────┤
│  Username: admin                                             │
│  Password: xK9#mP2$vL5@nQ8w                                  │
│                                                             │
│  ⚠️  Please change the password after first login!          │
└─────────────────────────────────────────────────────────────┘
```

### 5. SDK AuthenticatedHttpClient

创建认证包装器自动注入 token。

```typescript
// packages/sdk/src/auth/AuthenticatedHttpClient.ts
export class AuthenticatedHttpClient implements HttpClient {
  private token: string | null = null;

  constructor(
    private readonly inner: HttpClient,
    initialToken?: string
  ) {
    this.token = initialToken ?? null;
  }

  setToken(token: string): void {
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }

  async request<T>(req: HttpRequest): Promise<T> {
    if (!this.token) {
      throw new Error('No authentication token set. Call setToken() first.');
    }

    return this.inner.request({
      ...req,
      headers: {
        ...req.headers,
        Authorization: `Bearer ${this.token}`,
      },
    });
  }
}
```

### 6. SDK Login Method

在 SystemAuthHttpClient 添加 login 方法。

```typescript
login(req: { username: string; password: string }): Promise<{
  token: string;
  user: { id: string; username: string; email?: string; realName?: string; orgId: string };
  roles: string[];
}> {
  return this.http.request({
    path: '/auth/login',
    method: 'POST',
    body: req,
  });
}
```

## File Changes

| File                                               | Action                     |
| -------------------------------------------------- | -------------------------- |
| `src/modules/auth/public.decorator.ts`             | Create                     |
| `src/modules/auth/jwt-auth.guard.ts`               | Modify                     |
| `src/modules/auth/auth.module.ts`                  | Modify                     |
| `src/modules/init/init.module.ts`                  | Create                     |
| `src/modules/init/init.service.ts`                 | Create                     |
| `src/AppModule.ts`                                 | Modify                     |
| `src/modules/auth/auth.controller.ts`              | Modify (add @Public())     |
| `src/controllers/HealthController.ts`              | Modify (add @Public())     |
| `src/main.ts`                                      | Modify (Swagger @Public()) |
| `packages/sdk/src/auth/AuthenticatedHttpClient.ts` | Create                     |
| `packages/sdk/src/clients/SystemAuthHttpClient.ts` | Modify                     |
| `packages/sdk/src/index.ts`                        | Modify                     |
| `packages/contract/src/modules/system-auth.ts`     | Modify                     |
| `docs/authentication.md`                           | Create                     |
| `docs/system-auth-sdk-integration.md`              | Update                     |

## Testing Strategy

1. **Unit Tests**
   - Test @Public() decorator detection in Guard
   - Test InitService admin creation logic
   - Test AuthenticatedHttpClient token injection

2. **E2E Tests**
   - Test protected endpoint returns 401 without token
   - Test protected endpoint works with valid token
   - Test public endpoints work without token
   - Test login flow and token usage

3. **Integration Tests**
   - Test full authentication flow with SDK
   - Test admin initialization on fresh database

## Security Considerations

1. Auto-generated password is 16 characters with mixed case, numbers, and special characters
2. Password is only logged once on initial creation
3. Warning to change password is displayed
4. Token expiry is 24 hours (existing behavior)
