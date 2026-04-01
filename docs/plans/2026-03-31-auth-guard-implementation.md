# Authentication Guard Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add global JWT authentication guard, admin initialization script, and SDK auth middleware support.

**Architecture:** Use NestJS global APP_GUARD with @Public() decorator for endpoint豁免. Initialize admin user on application bootstrap with auto-generated credentials. Extend SDK with login method and AuthenticatedHttpClient wrapper.

**Tech Stack:** NestJS, TypeORM, JWT, CASL, TypeScript

---

## Task 1: Create @Public() Decorator

**Files:**

- Create: `services/system-auth-service/src/modules/auth/public.decorator.ts`

**Step 1: Create the decorator file**

```typescript
// services/system-auth-service/src/modules/auth/public.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorator to mark endpoints as public (no authentication required).
 * Use on controller methods or classes to bypass JWT authentication.
 *
 * @example
 * @Public()
 * @Get('public-data')
 * getPublicData() {}
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

**Step 2: Commit**

```bash
git add services/system-auth-service/src/modules/auth/public.decorator.ts
git commit -m "$(cat <<'EOF'
feat(auth): add @Public() decorator for bypassing authentication

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Update JwtAuthGuard to Support @Public()

**Files:**

- Modify: `services/system-auth-service/src/modules/auth/jwt-auth.guard.ts`

**Step 1: Update the guard to check for @Public() decorator**

```typescript
// services/system-auth-service/src/modules/auth/jwt-auth.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from './auth.service';
import type { AuthenticatedUser } from './auth.service';
import { IS_PUBLIC_KEY } from './public.decorator';

declare global {
  interface Request {
    user?: AuthenticatedUser;
  }
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if endpoint is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    // Get token from Authorization header
    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header missing');
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedException('Invalid authorization header format');
    }

    const token = parts[1];
    if (!token) {
      throw new UnauthorizedException('Token missing');
    }

    // Validate token and get user
    const user = await this.authService.validateToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Attach user to request
    request.user = user;

    return true;
  }
}
```

**Step 2: Commit**

```bash
git add services/system-auth-service/src/modules/auth/jwt-auth.guard.ts
git commit -m "$(cat <<'EOF'
feat(auth): update JwtAuthGuard to support @Public() decorator

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Register Global Guard in AuthModule

**Files:**

- Modify: `services/system-auth-service/src/modules/auth/auth.module.ts`

**Step 1: Update AuthModule to register global guard**

```typescript
// services/system-auth-service/src/modules/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../../entities/User.entity';
import { UserRoleEntity } from '../../entities/UserRole.entity';
import { RoleEntity } from '../../entities/Role.entity';
import { RolePermissionEntity } from '../../entities/RolePermission.entity';
import { PermissionEntity } from '../../entities/Permission.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CaslAbilityFactory } from './casl-ability.factory';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      UserRoleEntity,
      RoleEntity,
      RolePermissionEntity,
      PermissionEntity,
    ]),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    AuthService,
    CaslAbilityFactory,
  ],
  exports: [AuthService, CaslAbilityFactory],
})
export class AuthModule {}
```

**Step 2: Commit**

```bash
git add services/system-auth-service/src/modules/auth/auth.module.ts
git commit -m "$(cat <<'EOF'
feat(auth): register JwtAuthGuard as global APP_GUARD

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Add @Public() to AuthController

**Files:**

- Modify: `services/system-auth-service/src/modules/auth/auth.controller.ts`

**Step 1: Add @Public() decorator to login endpoint**

```typescript
// services/system-auth-service/src/modules/auth/auth.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import type { LoginRequest, LoginResponse } from './auth.service';
import { Public } from './public.decorator';

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '用户登录',
    description: '使用用户名密码登录，返回JWT令牌',
  })
  @ApiResponse({ status: 200, description: '登录成功，返回JWT令牌' })
  @ApiResponse({ status: 401, description: '用户名或密码错误' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string', description: '用户名' },
        password: { type: 'string', description: '密码' },
      },
      required: ['username', 'password'],
    },
  })
  async login(@Body() body: LoginRequest): Promise<LoginResponse> {
    return this.authService.login(body);
  }
}
```

**Step 2: Commit**

```bash
git add services/system-auth-service/src/modules/auth/auth.controller.ts
git commit -m "$(cat <<'EOF'
feat(auth): add @Public() decorator to login endpoint

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Add @Public() to HealthController

**Files:**

- Modify: `services/system-auth-service/src/controllers/HealthController.ts`

**Step 1: Add @Public() decorator**

```typescript
// services/system-auth-service/src/controllers/HealthController.ts
import { Controller, Get } from '@nestjs/common';
import { okResult } from '@ai-datahub/contract';
import { Public } from '../modules/auth/public.decorator';

@Controller()
export class HealthController {
  @Public()
  @Get('/health')
  health() {
    return okResult({ service: 'system-auth-service' });
  }
}
```

**Step 2: Commit**

```bash
git add services/system-auth-service/src/controllers/HealthController.ts
git commit -m "$(cat <<'EOF'
feat: add @Public() decorator to health endpoint

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Add Swagger Public Access in main.ts

**Files:**

- Modify: `services/system-auth-service/src/main.ts`

**Step 1: Use fastify-swagger with public access**

The Swagger UI serves static files from `/api/docs`. We need to exclude this path from authentication. Update main.ts to configure Swagger with a custom route that doesn't conflict:

```typescript
// services/system-auth-service/src/main.ts
import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { FastifyInstance } from 'fastify';
import { createTraceId, getTraceIdFromHeaders } from '@ai-datahub/shared';

import { AppModule } from './AppModule';

function registerTraceMiddleware(fastify: FastifyInstance) {
  fastify.addHook('onRequest', async (req, reply) => {
    const traceId =
      getTraceIdFromHeaders(
        req.headers as Record<string, string | string[] | undefined>
      ) ?? createTraceId();
    reply.header('x-trace-id', traceId);
    (req as unknown as { traceId?: string }).traceId = traceId;
  });
}

function setupSwagger(app: NestFastifyApplication) {
  const config = new DocumentBuilder()
    .setTitle('System Auth Service')
    .setDescription(
      '统一身份认证与访问控制服务 - 组织/用户/角色/权限管理，审批流程框架'
    )
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
}

async function bootstrap() {
  const adapter = new FastifyAdapter();
  registerTraceMiddleware(adapter.getInstance());

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    adapter,
    { logger: ['error', 'warn', 'log'] }
  );

  // Setup Swagger API documentation
  setupSwagger(app);

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, '0.0.0.0');
  // eslint-disable-next-line no-console
  console.log(`system-auth-service listening on port ${port}`);
  // eslint-disable-next-line no-console
  console.log(`Swagger documentation: http://localhost:${port}/api/docs`);
}

bootstrap().catch((e) => {
  // 进程启动失败不能静默
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
```

**Step 2: Create a wrapper to exclude swagger routes from auth**

We need to add swagger paths to the guard's exclusion list. Update the guard to also check for swagger paths:

```typescript
// Update jwt-auth.guard.ts to include swagger path check
// Add this after the isPublic check:

// Allow Swagger UI and API docs
const request = context.switchToHttp().getRequest();
const url = request.url;
if (url.startsWith('/api/docs') || url.startsWith('/api/docs-json')) {
  return true;
}
```

**Step 3: Commit**

```bash
git add services/system-auth-service/src/main.ts
git commit -m "$(cat <<'EOF'
feat: configure swagger to be accessible without authentication

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Create Initialization Module

**Files:**

- Create: `services/system-auth-service/src/modules/init/init.module.ts`
- Create: `services/system-auth-service/src/modules/init/init.service.ts`

**Step 1: Create InitService**

```typescript
// services/system-auth-service/src/modules/init/init.service.ts
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UserEntity } from '../../entities/User.entity';
import { RoleEntity } from '../../entities/Role.entity';
import { UserRoleEntity } from '../../entities/UserRole.entity';
import { OrganizationEntity } from '../../entities/Organization.entity';

function generateSecurePassword(length: number = 16): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  const allChars = uppercase + lowercase + numbers + special;

  let password = '';
  // Ensure at least one of each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}

@Injectable()
export class InitService implements OnApplicationBootstrap {
  private readonly logger = new Logger(InitService.name);
  private initialized = false;

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepo: Repository<RoleEntity>,
    @InjectRepository(UserRoleEntity)
    private readonly userRoleRepo: Repository<UserRoleEntity>,
    @InjectRepository(OrganizationEntity)
    private readonly orgRepo: Repository<OrganizationEntity>
  ) {}

  async onApplicationBootstrap() {
    if (this.initialized) return;
    await this.initializeAdmin();
    this.initialized = true;
  }

  private async initializeAdmin() {
    try {
      // Check if admin user already exists
      const existingAdmin = await this.userRepo.findOne({
        where: { username: 'admin' },
      });

      if (existingAdmin) {
        this.logger.log('Admin user already exists, skipping initialization');
        return;
      }

      // Create default organization if not exists
      let org = await this.orgRepo.findOne({ where: { code: 'default' } });
      if (!org) {
        org = this.orgRepo.create({
          name: 'Default Organization',
          code: 'default',
        });
        await this.orgRepo.save(org);
      }

      // Create super-admin role
      let superAdminRole = await this.roleRepo.findOne({
        where: { code: 'super-admin' },
      });
      if (!superAdminRole) {
        superAdminRole = this.roleRepo.create({
          name: '超级管理员',
          code: 'super-admin',
          orgId: org.id,
          enabled: true,
        });
        await this.roleRepo.save(superAdminRole);
      }

      // Generate secure password
      const password = generateSecurePassword(16);
      const passwordHash = await bcrypt.hash(password, 10);

      // Create admin user
      const adminUser = this.userRepo.create({
        username: 'admin',
        passwordHash,
        email: 'admin@example.com',
        realName: '系统管理员',
        orgId: org.id,
        status: 'ENABLED',
      });
      await this.userRepo.save(adminUser);

      // Assign super-admin role
      const userRole = this.userRoleRepo.create({
        userId: adminUser.id,
        roleId: superAdminRole.id,
      });
      await this.userRoleRepo.save(userRole);

      // Log credentials (one-time only)
      this.logger.log('');
      this.logger.log(
        '┌─────────────────────────────────────────────────────────────┐'
      );
      this.logger.log(
        '│  🔐 Initial Admin Credentials (save this securely!)         │'
      );
      this.logger.log(
        '├─────────────────────────────────────────────────────────────┤'
      );
      this.logger.log(
        `│  Username: admin                                             │`
      );
      this.logger.log(`│  Password: ${password.padEnd(47)}│`);
      this.logger.log(
        '│                                                             │'
      );
      this.logger.log(
        '│  ⚠️  Please change the password after first login!          │'
      );
      this.logger.log(
        '└─────────────────────────────────────────────────────────────┘'
      );
      this.logger.log('');
    } catch (error) {
      this.logger.error('Failed to initialize admin user', error);
    }
  }
}
```

**Step 2: Create InitModule**

```typescript
// services/system-auth-service/src/modules/init/init.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../../entities/User.entity';
import { RoleEntity } from '../../entities/Role.entity';
import { UserRoleEntity } from '../../entities/UserRole.entity';
import { OrganizationEntity } from '../../entities/Organization.entity';
import { InitService } from './init.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      RoleEntity,
      UserRoleEntity,
      OrganizationEntity,
    ]),
  ],
  providers: [InitService],
  exports: [InitService],
})
export class InitModule {}
```

**Step 3: Commit**

```bash
git add services/system-auth-service/src/modules/init/
git commit -m "$(cat <<'EOF'
feat: add initialization service for admin user creation

- Auto-generate secure password on first startup
- Create default organization and super-admin role
- Log credentials to console (one-time)

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Register InitModule in AppModule

**Files:**

- Modify: `services/system-auth-service/src/AppModule.ts`

**Step 1: Add InitModule import**

```typescript
// services/system-auth-service/src/AppModule.ts
import { Module } from '@nestjs/common';
import { HealthController } from './controllers/HealthController';
import { DatabaseModule } from './common/database/database.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { RoleModule } from './modules/role/role.module';
import { PermissionModule } from './modules/permission/permission.module';
import { MenuModule } from './modules/menu/menu.module';
import { DirectoryModule } from './modules/directory/directory.module';
import { AuthModule } from './modules/auth/auth.module';
import { ApprovalTemplateModule } from './modules/approval-template/approval-template.module';
import { ApprovalModule } from './modules/approval/approval.module';
import { DataPermissionModule } from './modules/data-permission/data-permission.module';
import { InitModule } from './modules/init/init.module';

@Module({
  imports: [
    DatabaseModule,
    InitModule,
    OrganizationModule,
    RoleModule,
    PermissionModule,
    MenuModule,
    DirectoryModule,
    AuthModule,
    ApprovalTemplateModule,
    ApprovalModule,
    DataPermissionModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
```

**Step 2: Commit**

```bash
git add services/system-auth-service/src/AppModule.ts
git commit -m "$(cat <<'EOF'
feat: register InitModule in AppModule

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: Add Login Method to SystemAuthClient Contract

**Files:**

- Modify: `packages/contract/src/modules/system-auth.ts`

**Step 1: Add LoginRequest and LoginResponse types, and login method to interface**

Add after line 27 (after SystemAuthErrorCode):

```typescript
// Add to packages/contract/src/modules/system-auth.ts

export type LoginRequest = {
  meta?: RequestMeta;
  username: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  user: {
    id: ID;
    username: string;
    email?: string;
    realName?: string;
    orgId: ID;
  };
  roles: string[];
};
```

Add to SystemAuthClient interface (after line 168):

```typescript
// Add to SystemAuthClient interface
  // Authentication
  login(req: LoginRequest): Promise<Result<LoginResponse>>;
```

**Step 2: Commit**

```bash
git add packages/contract/src/modules/system-auth.ts
git commit -m "$(cat <<'EOF'
feat(contract): add login method to SystemAuthClient interface

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: Add Login Method to SystemAuthHttpClient

**Files:**

- Modify: `packages/sdk/src/clients/SystemAuthHttpClient.ts`

**Step 1: Add login method to the class**

Add at the beginning of the class (after constructor):

```typescript
// Add to SystemAuthHttpClient class

import type { LoginRequest, LoginResponse } from '@ai-datahub/contract';

// ... in class body:
  // Authentication
  login(req: LoginRequest): Promise<Result<LoginResponse>> {
    return this.http.request({
      path: '/auth/login',
      method: 'POST',
      meta: req.meta,
      body: { username: req.username, password: req.password },
    });
  }
```

**Step 2: Commit**

```bash
git add packages/sdk/src/clients/SystemAuthHttpClient.ts
git commit -m "$(cat <<'EOF'
feat(sdk): add login method to SystemAuthHttpClient

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 11: Create AuthenticatedHttpClient

**Files:**

- Create: `packages/sdk/src/auth/AuthenticatedHttpClient.ts`

**Step 1: Create the authenticated HTTP client wrapper**

````typescript
// packages/sdk/src/auth/AuthenticatedHttpClient.ts
import type { HttpClient, HttpRequest } from '../http/HttpClient';

/**
 * HTTP client wrapper that automatically injects Bearer token.
 *
 * @example
 * ```typescript
 * const http = new FetchHttpClient('http://localhost:3000');
 * const authedHttp = new AuthenticatedHttpClient(http, 'my-jwt-token');
 *
 * // All requests will include Authorization: Bearer my-jwt-token
 * const result = await authedHttp.request({ path: '/users', method: 'GET' });
 * ```
 */
export class AuthenticatedHttpClient implements HttpClient {
  private token: string | null;

  /**
   * Create an authenticated HTTP client.
   *
   * @param inner - The underlying HTTP client to wrap
   * @param initialToken - Optional initial JWT token
   */
  constructor(
    private readonly inner: HttpClient,
    initialToken?: string
  ) {
    this.token = initialToken ?? null;
  }

  /**
   * Set the authentication token.
   *
   * @param token - JWT token to use for authentication
   */
  setToken(token: string): void {
    this.token = token;
  }

  /**
   * Get the current authentication token.
   *
   * @returns The current token or null if not set
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Clear the authentication token.
   */
  clearToken(): void {
    this.token = null;
  }

  /**
   * Make an authenticated HTTP request.
   *
   * @param req - The HTTP request to make
   * @returns The response data
   * @throws Error if no token is set
   */
  async request<T>(req: HttpRequest): Promise<T> {
    if (!this.token) {
      throw new Error(
        'No authentication token set. Call setToken() first or provide an initial token.'
      );
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
````

**Step 2: Commit**

```bash
git add packages/sdk/src/auth/AuthenticatedHttpClient.ts
git commit -m "$(cat <<'EOF'
feat(sdk): add AuthenticatedHttpClient wrapper

Automatically injects Bearer token into all requests.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 12: Export AuthenticatedHttpClient from SDK

**Files:**

- Modify: `packages/sdk/src/index.ts`

**Step 1: Add export for auth module**

```typescript
// packages/sdk/src/index.ts
export * from './http/HttpClient';
export * from './http/FetchHttpClient';
export * from './http/errors';

export * from './clients/DataServiceHttpClient';
export * from './clients/MetadataHttpClient';
export * from './clients/SystemAuthHttpClient';

export * from './auth/AuthenticatedHttpClient';
```

**Step 2: Commit**

```bash
git add packages/sdk/src/index.ts
git commit -m "$(cat <<'EOF'
feat(sdk): export AuthenticatedHttpClient from package

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 13: Build and Test Service

**Step 1: Build all packages**

```bash
cd c:/Users/Administrator/Desktop/AIDataHub
npm run build
```

**Step 2: Run tests**

```bash
npm run test -- services/system-auth-service
```

Expected: All tests pass (194 tests)

**Step 3: Test service startup**

```bash
cd services/system-auth-service
npm run dev
```

Expected:

- Service starts without errors
- Admin credentials are logged to console

**Step 4: Test authentication**

```bash
# Test public endpoint (should work without token)
curl http://localhost:3000/health

# Test protected endpoint (should fail without token)
curl http://localhost:3000/users

# Test login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"<password-from-console>"}'

# Test protected endpoint with token
curl http://localhost:3000/users \
  -H "Authorization: Bearer <token-from-login>"
```

---

## Task 14: Create Authentication Documentation

**Files:**

- Create: `docs/authentication.md`

**Step 1: Create the documentation file**

```markdown
# Authentication Guide

## Overview

The system-auth-service uses JWT (JSON Web Token) based authentication. All API endpoints require authentication by default, except for login and health check endpoints.

## Authentication Flow

1. **Login**: Send credentials to `/auth/login` to receive a JWT token
2. **Use Token**: Include the token in the `Authorization: Bearer <token>` header for subsequent requests
3. **Token Expiry**: Tokens expire after 24 hours

## Public Endpoints

| Endpoint           | Description               |
| ------------------ | ------------------------- |
| `POST /auth/login` | User login                |
| `GET /health`      | Service health check      |
| `GET /api/docs`    | Swagger API documentation |

## Initial Admin User

On first startup, the service automatically creates an admin user with:

- **Username**: `admin`
- **Password**: Auto-generated (16 characters, logged to console)

The credentials are logged once to the console in a formatted box:
```

┌─────────────────────────────────────────────────────────────┐
│ 🔐 Initial Admin Credentials (save this securely!) │
├─────────────────────────────────────────────────────────────┤
│ Username: admin │
│ Password: xK9#mP2$vL5@nQ8w │
│ │
│ ⚠️ Please change the password after first login! │
└─────────────────────────────────────────────────────────────┘

````

**Security Note**: Change the admin password immediately after first login.

## Using the SDK

### Basic Login Flow

```typescript
import { FetchHttpClient, SystemAuthHttpClient, AuthenticatedHttpClient } from '@ai-datahub/sdk';

// Create base client
const http = new FetchHttpClient('http://localhost:3000');
const authClient = new SystemAuthHttpClient(http);

// Login to get token
const loginResult = await authClient.login({
  username: 'admin',
  password: 'your-password',
});

if (loginResult.success) {
  console.log('Logged in as:', loginResult.data.user.username);
  console.log('Roles:', loginResult.data.roles);
  console.log('Token:', loginResult.data.token);
}
````

### Using AuthenticatedHttpClient

```typescript
import {
  FetchHttpClient,
  SystemAuthHttpClient,
  AuthenticatedHttpClient,
} from '@ai-datahub/sdk';

// Setup
const http = new FetchHttpClient('http://localhost:3000');
const authClient = new SystemAuthHttpClient(http);

// Login
const loginResult = await authClient.login({
  username: 'admin',
  password: 'your-password',
});

// Create authenticated client
const authedHttp = new AuthenticatedHttpClient(http, loginResult.data.token);
const authedClient = new SystemAuthHttpClient(authedHttp);

// Now all requests automatically include the Bearer token
const users = await authedClient.listUsers({ page: { page: 1, pageSize: 10 } });
```

### Token Management

```typescript
const authedHttp = new AuthenticatedHttpClient(http);

// Set token
authedHttp.setToken('your-jwt-token');

// Get current token
const token = authedHttp.getToken();

// Clear token (logout)
authedHttp.clearToken();
```

## Error Handling

When authentication fails, the API returns a 401 Unauthorized response:

```json
{
  "success": false,
  "error": {
    "code": "Unauthorized",
    "message": "Authorization header missing"
  }
}
```

Common error codes:

| Error                                 | Description                           |
| ------------------------------------- | ------------------------------------- |
| `Authorization header missing`        | No Authorization header provided      |
| `Invalid authorization header format` | Header not in `Bearer <token>` format |
| `Token missing`                       | Bearer token is empty                 |
| `Invalid or expired token`            | Token is invalid or has expired       |

## Token Structure

The JWT token contains:

```json
{
  "userId": "user-uuid",
  "username": "admin",
  "roles": ["super-admin"],
  "iat": 1234567890,
  "exp": 1234654290
}
```

## Environment Variables

| Variable     | Default      | Description                       |
| ------------ | ------------ | --------------------------------- |
| `JWT_SECRET` | `dev-secret` | Secret key for signing JWT tokens |
| `PORT`       | `3000`       | Server port                       |

**Important**: Set `JWT_SECRET` to a secure random value in production.

## Best Practices

1. **Store tokens securely**: Use secure storage (httpOnly cookies, secure localStorage)
2. **Handle token expiry**: Implement token refresh or re-login on 401 errors
3. **Use HTTPS**: Always use HTTPS in production to protect tokens in transit
4. **Short-lived tokens**: Consider reducing token expiry time for sensitive applications
5. **Logout on client**: Clear token from client storage on logout

````

**Step 2: Commit**

```bash
git add docs/authentication.md
git commit -m "$(cat <<'EOF'
docs: add authentication guide

Covers login flow, SDK usage, token management, and best practices.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
````

---

## Task 15: Update SDK Integration Documentation

**Files:**

- Modify: `docs/system-auth-sdk-integration.md`

**Step 1: Update the authentication section**

Update the SDK integration document to include the new authentication flow with AuthenticatedHttpClient. Add this after the "安装" section:

````markdown
## 认证流程

### 使用 AuthenticatedHttpClient（推荐）

SDK 提供了 `AuthenticatedHttpClient` 包装器，自动为所有请求添加认证头：

```typescript
import {
  FetchHttpClient,
  SystemAuthHttpClient,
  AuthenticatedHttpClient,
} from '@ai-datahub/sdk';

// 创建基础 HTTP 客户端
const http = new FetchHttpClient('http://localhost:3000');
const authClient = new SystemAuthHttpClient(http);

// 登录获取 token
const loginResult = await authClient.login({
  username: 'admin',
  password: 'your-password',
});

if (!loginResult.success) {
  throw new Error(loginResult.error.message);
}

// 创建认证客户端（自动注入 Bearer token）
const authedHttp = new AuthenticatedHttpClient(http, loginResult.data.token);
const authedClient = new SystemAuthHttpClient(authedHttp);

// 后续所有请求自动携带 Authorization 头
const users = await authedClient.listUsers({
  page: { page: 1, pageSize: 10 },
});
```
````

### Token 管理

```typescript
const authedHttp = new AuthenticatedHttpClient(http);

// 设置 token
authedHttp.setToken('your-jwt-token');

// 获取当前 token
const token = authedHttp.getToken();

// 清除 token（登出）
authedHttp.clearToken();
```

### 完整示例

```typescript
import {
  FetchHttpClient,
  SystemAuthHttpClient,
  AuthenticatedHttpClient,
} from '@ai-datahub/sdk';

class AuthService {
  private http: FetchHttpClient;
  private authedClient: SystemAuthHttpClient;
  private authedHttp: AuthenticatedHttpClient;

  constructor(baseUrl: string) {
    this.http = new FetchHttpClient(baseUrl);
    this.authedHttp = new AuthenticatedHttpClient(this.http);
    this.authedClient = new SystemAuthHttpClient(this.authedHttp);
  }

  async login(username: string, password: string) {
    const unauthClient = new SystemAuthHttpClient(this.http);
    const result = await unauthClient.login({ username, password });

    if (result.success) {
      this.authedHttp.setToken(result.data.token);
    }

    return result;
  }

  logout() {
    this.authedHttp.clearToken();
  }

  getClient(): SystemAuthHttpClient {
    return this.authedClient;
  }
}

// 使用
const auth = new AuthService('http://localhost:3000');
await auth.login('admin', 'password');
const users = await auth
  .getClient()
  .listUsers({ page: { page: 1, pageSize: 10 } });
```

````

**Step 2: Commit**

```bash
git add docs/system-auth-sdk-integration.md
git commit -m "$(cat <<'EOF'
docs: update SDK integration guide with AuthenticatedHttpClient

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
````

---

## Task 16: Update README

**Files:**

- Modify: `services/system-auth-service/README.md`

**Step 1: Add authentication section**

Add after the "快速开始" section:

````markdown
## 认证

### 公开端点

以下端点无需认证：

| 端点               | 说明             |
| ------------------ | ---------------- |
| `POST /auth/login` | 用户登录         |
| `GET /health`      | 服务健康检查     |
| `GET /api/docs`    | Swagger API 文档 |

### 初始管理员

服务首次启动时会自动创建管理员用户：

- **用户名**: `admin`
- **密码**: 自动生成（16位，打印到控制台）

密码仅在首次创建时输出到控制台，请妥善保存并在首次登录后修改。

### 使用 Token

所有其他端点需要在请求头中携带 JWT Token：

```bash
curl -H "Authorization: Bearer <your-token>" http://localhost:3000/users
```
````

### 环境变量

| 变量         | 默认值       | 说明                             |
| ------------ | ------------ | -------------------------------- |
| `JWT_SECRET` | `dev-secret` | JWT 签名密钥（生产环境必须配置） |

````

**Step 2: Commit**

```bash
git add services/system-auth-service/README.md
git commit -m "$(cat <<'EOF'
docs: add authentication section to README

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
````

---

## Task 17: Final Verification

**Step 1: Run full test suite**

```bash
cd c:/Users/Administrator/Desktop/AIDataHub
npm run test
```

**Step 2: Build all packages**

```bash
npm run build
```

**Step 3: Start service and verify**

```bash
cd services/system-auth-service
npm run dev
```

Verify:

1. Service starts without errors
2. Admin credentials are logged
3. Swagger UI accessible at `/api/docs` without auth
4. Health check accessible without auth
5. Protected endpoints return 401 without token
6. Protected endpoints work with valid token

**Step 4: Final commit (if any changes)**

```bash
git add -A
git commit -m "$(cat <<'EOF'
chore: final verification and cleanup

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```
