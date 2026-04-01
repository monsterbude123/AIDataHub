# system-auth-service（统一认证授权与审批框架）

> **当前状态**：有完整 README 文档，但无代码实现。
>
> - **优先级**：高（其他服务需要认证支持）
> - **文档位置**：`services/system-auth-service/README.md`
> - **代码位置**：待实现 `services/system-auth-service/src/`

## 1. 职责边界

- 对应 bounded context：`system-auth`
- 范围：身份认证、角色权限、数据权限、统一审批流程框架
- 不包含：系统工具管理（归 `system-admin`）

## 2. 依赖

- 契约：`@ai-datahub/contract`（system-auth 相关 client/DTO）
- 下游：LDAP/AD/OAuth2（可选集成，MVP 先本地用户）
- 审批通知：邮件/钉钉/企业微信（通过 `system-integration` 适配）
- 数据库：使用 `@ai-datahub/database` 共享 Prisma 单例

## 3. 模块定位

统一身份认证与访问控制（组织/用户/角色/权限/数据权限）。
统一审批流程框架（模板、待办/已办、流程跟踪、提醒）。

## 4. 架构设计

### 4.1 认证守卫设计

**目标**：所有 API 端点默认需要认证，公开端点例外。

```text
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

### 4.2 关键组件

#### @Public() Decorator

标记无需认证的公开端点。

```typescript
// src/modules/auth/public.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

#### JwtAuthGuard

支持公开端点跳过认证。

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

#### 全局守卫注册

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

#### 初始化服务

启动时自动创建管理员用户。

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

**控制台输出格式**：

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

### 4.3 数据库重构设计

**目标**：使用 `@ai-datahub/database` 共享 Prisma 单例。

**修改方案**：仅修改 `DatabaseModule`：

```typescript
// 修改前
import { Module, Global } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
});

@Global()
@Module({
  providers: [
    {
      provide: 'PRISMA_CLIENT',
      useValue: prisma,
    },
  ],
  exports: ['PRISMA_CLIENT'],
})
export class DatabaseModule {}

// 修改后
import { Module, Global } from '@nestjs/common';
import { prisma } from '@ai-datahub/database';

@Global()
@Module({
  providers: [
    {
      provide: 'PRISMA_CLIENT',
      useValue: prisma,
    },
  ],
  exports: ['PRISMA_CLIENT'],
})
export class DatabaseModule {}
```

**决策记录**：

- 保留 NestJS DI 模式便于测试 mock
- 最小改动方案，风险最低

## 5. 认证流程

### 5.1 概述

system-auth-service 使用 JWT (JSON Web Token) 基于令牌的认证。所有 API 端点默认需要认证，除了登录和健康检查端点。

### 5.2 认证流程

1. **登录**：发送凭证到 `/auth/login` 获取 JWT token
2. **使用 Token**：在后续请求的 `Authorization: Bearer <token>` 头中包含 token
3. **Token 过期**：Token 24 小时后过期

### 5.3 公开端点

| Endpoint           | Description               |
| ------------------ | ------------------------- |
| `POST /auth/login` | User login                |
| `GET /health`      | Service health check      |
| `GET /api/docs`    | Swagger API documentation |

### 5.4 初始管理员用户

首次启动时，服务自动创建管理员用户：

- **用户名**：`admin`
- **密码**：自动生成（16 字符，输出到控制台）

**安全提示**：首次登录后立即修改管理员密码。

### 5.5 Token 结构

JWT token 包含：

```json
{
  "userId": "user-uuid",
  "username": "admin",
  "roles": ["super-admin"],
  "iat": 1234567890,
  "exp": 1234654290
}
```

### 5.6 环境变量

| Variable       | Default                    | Description                       |
| -------------- | -------------------------- | --------------------------------- |
| `JWT_SECRET`   | `dev-secret`               | Secret key for signing JWT tokens |
| `PORT`         | `3000`                     | Server port                       |
| `DATABASE_URL` | `file:data/system-auth.db` | SQLite 数据库文件                 |

**重要**：在生产环境设置 `JWT_SECRET` 为安全的随机值。

### 5.7 错误处理

认证失败时，API 返回 401 Unauthorized 响应：

```json
{
  "ok": false,
  "error": {
    "code": "Unauthorized",
    "message": "Authorization header missing"
  }
}
```

常见错误消息：

| Error                                 | Description                           |
| ------------------------------------- | ------------------------------------- |
| `Authorization header missing`        | No Authorization header provided      |
| `Invalid authorization header format` | Header not in `Bearer <token>` format |
| `Token missing`                       | Bearer token is empty                 |
| `Invalid or expired token`            | Token is invalid or has expired       |

## 6. SDK 集成指南

### 6.1 安装

```bash
npm install @ai-datahub/sdk
```

### 6.2 认证流程

#### 使用 AuthenticatedHttpClient（推荐）

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

if (!loginResult.ok) {
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

#### Token 管理

```typescript
const authedHttp = new AuthenticatedHttpClient(http);

// 设置 token
authedHttp.setToken('your-jwt-token');

// 获取当前 token
const token = authedHttp.getToken();

// 清除 token（登出）
authedHttp.clearToken();
```

#### 完整示例

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

    if (result.ok) {
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

### 6.3 模块功能示例

#### 组织管理

```typescript
// 创建组织
const orgResult = await client.createOrganization({
  org: { name: 'My Org', code: 'my-org', status: 'ENABLED' },
});

// 列出组织
const orgs = await client.listOrganizations({});
```

#### 用户管理

```typescript
// 创建用户
const userResult = await client.createUser({
  user: { username: 'newuser', orgId: orgId, status: 'ENABLED' },
});

// 列出用户
const users = await client.listUsers({
  page: { page: 1, pageSize: 10 },
});

// 分配角色
await client.assignRoles({ userId: userId, roleIds: [roleId] });
```

#### 角色管理

```typescript
// 创建角色
const roleResult = await client.createRole({
  role: { name: 'Admin', code: 'admin', permissions: [] },
});

// 列出角色
const roles = await client.listRoles({});
```

#### 权限管理

```typescript
// 创建权限
const permResult = await client.createPermission({
  permission: { type: 'URI', name: 'Read', code: 'read', resource: '/api' },
});

// 绑定权限到角色
await client.bindPermissionsToRole({
  roleId: roleId,
  permissionIds: [permId],
});
```

#### 菜单管理

```typescript
// 创建菜单节点
const menuResult = await client.upsertMenuNode({
  node: { type: 'MENU', name: 'Dashboard', enabled: true },
});

// 获取菜单树
const menuTree = await client.listMenuTree({});
```

#### 目录管理

```typescript
// 创建目录节点
const dirResult = await client.upsertDirectoryNode({
  node: { name: 'Root', code: 'root' },
});

// 获取目录树
const dirTree = await client.listDirectoryTree({});
```

#### 审批模板

```typescript
// 创建审批模板
const templateResult = await client.createApprovalTemplate({
  template: { businessType: 'leave', name: '请假审批', definition: {} },
});
```

#### 审批流程

```typescript
// 创建审批
const approvalResult = await client.createApproval({
  businessType: 'leave',
  businessId: 'leave-001',
  title: '请假申请',
  applicantId: userId,
});

// 审批操作
await client.approve({
  approvalId: approvalId,
  action: 'APPROVE',
  approverId: approverId,
});
```

#### 数据权限

```typescript
// 设置数据权限
const permResult = await client.upsertDataPermission({
  permission: { roleId: roleId, scope: { level: 'read' } },
});
```

### 6.4 错误处理

所有 API 返回 `Result<T>` 类型：

```typescript
interface Result<T> {
  ok: true;
  data: T;
}

interface Result<T> {
  ok: false;
  error: {
    code: string;
    message: string;
  };
}
```

示例：

```typescript
const result = await client.createUser({ user: { ... } });

if (result.ok) {
  console.log('User ID:', result.data.userId);
} else {
  console.log('Error:', result.error.code, result.error.message);
}
```

### 6.5 类型定义

所有类型定义来自 `@ai-datahub/contract`：

```typescript
import type {
  Organization,
  User,
  Role,
  Permission,
  MenuNode,
  DirectoryNode,
  ApprovalTemplate,
  Approval,
  DataPermission,
  LoginRequest,
  LoginResponse,
} from '@ai-datahub/contract';
```

## 7. 契约定义

### 7.1 错误码

```typescript
export type SystemAuthErrorCode =
  | 'USER_NOT_FOUND'
  | 'ORG_NOT_FOUND'
  | 'ROLE_NOT_FOUND'
  | 'APPROVAL_NOT_FOUND'
  | 'USERNAME_DUPLICATE'
  | 'DIRECTORY_NOT_FOUND'
  | 'PERMISSION_NOT_FOUND'
  | 'DATA_PERMISSION_NOT_FOUND'
  | 'INVALID_ARGUMENT'
  | 'PERMISSION_DENIED'
  | 'APPROVAL_TEMPLATE_NOT_FOUND'
  | 'APPROVAL_STATE_INVALID'
  | 'REMIND_FAILED';
```

### 7.2 DTO 定义

```typescript
import type {
  Approval,
  ID,
  Organization,
  PageRequest,
  PageResult,
  Project,
  RequestMeta,
  Result,
  Role,
  User,
} from './00-shared-entities';

export type CreateUserRequest = {
  meta?: RequestMeta;
  user: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'status'> & {
    status?: User['status'];
  };
};

export type UpdateUserRequest = {
  meta?: RequestMeta;
  user: Omit<User, 'createdAt' | 'updatedAt'>;
};

export type ListUsersRequest = {
  meta?: RequestMeta;
  orgId?: ID;
  keyword?: string;
  page: PageRequest;
};

export type AssignRolesRequest = {
  meta?: RequestMeta;
  userId: ID;
  roleIds: ID[];
};

export type Permission = {
  id: ID;
  type: 'URI' | 'PAGE_ELEMENT';
  name: string;
  code: string;
  resource: string; // uri / selector / element-id 等
  createdAt: string;
};

export type MenuNodeType = 'DIRECTORY' | 'MENU' | 'BUTTON';

export type MenuNode = {
  id: ID;
  parentId?: ID;
  type: MenuNodeType;
  name: string;
  path?: string;
  icon?: string;
  permissionCode?: string;
  enabled: boolean;
  sort?: number;
  createdAt: string;
  updatedAt: string;
};

export type UpsertMenuNodeRequest = {
  meta?: RequestMeta;
  node: Omit<MenuNode, 'createdAt' | 'updatedAt'> & { id?: ID };
};

export type DeleteMenuNodeRequest = { meta?: RequestMeta; nodeId: ID };

export type DirectoryTreeNode = {
  id: ID;
  parentId?: ID;
  name: string;
  code: string;
  // 扩展属性（用于“系统树目录统一管理”）
  attributes?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type UpsertDirectoryNodeRequest = {
  meta?: RequestMeta;
  node: Omit<DirectoryTreeNode, 'createdAt' | 'updatedAt'> & { id?: ID };
};

export type DeleteDirectoryNodeRequest = { meta?: RequestMeta; nodeId: ID };

export type DataPermission = {
  id: ID;
  roleId: ID;
  // 分级分类/项目/组织范围等由实现层解释
  scope: Record<string, unknown>;
  createdAt: string;
};

export type UpsertDataPermissionRequest = {
  meta?: RequestMeta;
  permission: Omit<DataPermission, 'createdAt'> & { id?: ID };
};

export type ApprovalReminderRequest = {
  meta?: RequestMeta;
  approvalId: ID;
  message?: string;
};

export type ApprovalTemplate = {
  id: ID;
  businessType: string;
  name: string;
  // 简化表达：节点与规则由实现层解释
  definition: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type CreateApprovalTemplateRequest = {
  meta?: RequestMeta;
  template: Omit<ApprovalTemplate, 'id' | 'createdAt' | 'updatedAt'>;
};

export type CreateApprovalRequest = {
  meta?: RequestMeta;
  businessType: string;
  businessId: ID;
  title: string;
  applicantId: ID;
  payload?: Record<string, unknown>;
};

export type ApproveRequest = {
  meta?: RequestMeta;
  approvalId: ID;
  action: 'APPROVE' | 'REJECT';
  comment?: string;
};

export type ListMyTodoApprovalsRequest = {
  meta?: RequestMeta;
  userId: ID;
  page: PageRequest;
};
```

### 7.3 对外 SDK 接口（`SystemAuthClient`）

```typescript
export interface SystemAuthClient {
  // Organization
  listOrganizations(req: {
    meta?: RequestMeta;
    keyword?: string;
  }): Promise<Result<Organization[]>>;
  createOrganization(req: {
    meta?: RequestMeta;
    org: Omit<Organization, 'id'>;
  }): Promise<Result<{ orgId: ID }>>;
  updateOrganization(req: {
    meta?: RequestMeta;
    org: Organization;
  }): Promise<Result<{ success: boolean }>>;
  deleteOrganization(req: {
    meta?: RequestMeta;
    orgId: ID;
  }): Promise<Result<{ success: boolean }>>;

  // User
  createUser(req: CreateUserRequest): Promise<Result<{ userId: ID }>>;
  updateUser(req: UpdateUserRequest): Promise<Result<{ success: boolean }>>;
  deleteUser(req: {
    meta?: RequestMeta;
    userId: ID;
  }): Promise<Result<{ success: boolean }>>;
  listUsers(req: ListUsersRequest): Promise<Result<PageResult<User>>>;
  assignRoles(req: AssignRolesRequest): Promise<Result<{ success: boolean }>>;

  // Role
  listRoles(req: {
    meta?: RequestMeta;
    keyword?: string;
  }): Promise<Result<Role[]>>;
  createRole(req: {
    meta?: RequestMeta;
    role: Omit<Role, 'id'>;
  }): Promise<Result<{ roleId: ID }>>;
  updateRole(req: {
    meta?: RequestMeta;
    role: Role;
  }): Promise<Result<{ success: boolean }>>;
  deleteRole(req: {
    meta?: RequestMeta;
    roleId: ID;
  }): Promise<Result<{ success: boolean }>>;

  // Permissions
  createPermission(req: {
    meta?: RequestMeta;
    permission: Omit<Permission, 'id' | 'createdAt'>;
  }): Promise<Result<{ permissionId: ID }>>;
  listPermissions(req: {
    meta?: RequestMeta;
    keyword?: string;
    page: PageRequest;
  }): Promise<Result<PageResult<Permission>>>;
  bindPermissionsToRole(req: {
    meta?: RequestMeta;
    roleId: ID;
    permissionIds: ID[];
  }): Promise<Result<{ success: boolean }>>;

  // Menu
  listMenuTree(req: { meta?: RequestMeta }): Promise<Result<MenuNode[]>>;
  upsertMenuNode(req: UpsertMenuNodeRequest): Promise<Result<{ nodeId: ID }>>;
  deleteMenuNode(
    req: DeleteMenuNodeRequest
  ): Promise<Result<{ success: boolean }>>;

  // Approval templates
  createApprovalTemplate(
    req: CreateApprovalTemplateRequest
  ): Promise<Result<{ templateId: ID }>>;
  updateApprovalTemplate(req: {
    meta?: RequestMeta;
    template: ApprovalTemplate;
  }): Promise<Result<{ success: boolean }>>;
  deleteApprovalTemplate(req: {
    meta?: RequestMeta;
    templateId: ID;
  }): Promise<Result<{ success: boolean }>>;
  listApprovalTemplates(req: {
    meta?: RequestMeta;
    businessType?: string;
  }): Promise<Result<ApprovalTemplate[]>>;

  // Approvals
  createApproval(
    req: CreateApprovalRequest
  ): Promise<Result<{ approvalId: ID }>>;
  approve(req: ApproveRequest): Promise<Result<{ success: boolean }>>;
  listMyTodoApprovals(
    req: ListMyTodoApprovalsRequest
  ): Promise<Result<PageResult<Approval>>>;
  listMyDoneApprovals(req: {
    meta?: RequestMeta;
    userId: ID;
    page: PageRequest;
  }): Promise<Result<PageResult<Approval>>>;
  remindApproval(
    req: ApprovalReminderRequest
  ): Promise<Result<{ success: boolean }>>;

  // Directory tree（系统树目录统一管理）
  listDirectoryTree(req: {
    meta?: RequestMeta;
    parentId?: ID;
    keyword?: string;
  }): Promise<Result<DirectoryTreeNode[]>>;
  upsertDirectoryNode(
    req: UpsertDirectoryNodeRequest
  ): Promise<Result<{ nodeId: ID }>>;
  deleteDirectoryNode(
    req: DeleteDirectoryNodeRequest
  ): Promise<Result<{ success: boolean }>>;

  // Data permission
  upsertDataPermission(
    req: UpsertDataPermissionRequest
  ): Promise<Result<{ permissionId: ID }>>;
  listDataPermissions(req: {
    meta?: RequestMeta;
    roleId: ID;
    page: PageRequest;
  }): Promise<Result<PageResult<DataPermission>>>;
}
```

## 8. 幂等性要求

- 创建类：默认非幂等，建议支持 `idempotencyKey`。
- `updateUser` / `assignRoles` / `approve`：幂等（同动作重复提交不产生额外副作用）。
- 查询类：幂等。
- `update*` / `delete*` / `bindPermissionsToRole` / `upsert*` / `remindApproval`：幂等。

## 9. Mock 服务规则

- `createUser`
  - 默认：返回 `userId="u_1"`
  - 可模拟异常：`USERNAME_DUPLICATE`
- `listUsers`
  - 默认：分页返回 10 个用户
- `createApproval`
  - 默认：返回 `approvalId="ap_1"`
- `approve`
  - 默认：`{ success: true }`
  - 可模拟异常：`APPROVAL_STATE_INVALID`

## 10. MVP 建议（先让其他服务可用）

- 用户/角色/权限最小闭环
- 审批流最小模板（线性审批 + 待办/已办）
- 统一 Guard/鉴权中间件，服务间复用

## 11. 文件变更清单

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
| `src/database/database.module.ts`                  | Modify (use shared prisma) |
| `packages/sdk/src/auth/AuthenticatedHttpClient.ts` | Create                     |
| `packages/sdk/src/clients/SystemAuthHttpClient.ts` | Modify                     |
| `packages/sdk/src/index.ts`                        | Modify                     |
| `packages/contract/src/modules/system-auth.ts`     | Modify                     |

## 12. 测试策略

### 12.1 单元测试

- 测试 @Public() decorator detection in Guard
- 测试 InitService admin creation logic
- 测试 AuthenticatedHttpClient token injection

### 12.2 E2E 测试

- 测试 protected endpoint returns 401 without token
- 测试 protected endpoint works with valid token
- 测试 public endpoints work without token
- 测试 login flow and token usage

### 12.3 集成测试

- 测试 full authentication flow with SDK
- 测试 admin initialization on fresh database

## 13. 安全最佳实践

1. **安全存储 tokens**：使用安全存储（httpOnly cookies, secure localStorage）
2. **处理 token 过期**：在 401 错误时实现 token 刷新或重新登录
3. **使用 HTTPS**：生产环境始终使用 HTTPS 保护传输中的 token
4. **短生命周期 tokens**：对于敏感应用考虑减少 token 过期时间
5. **客户端登出**：登出时从客户端存储清除 token
6. **自动生成管理员密码**：16 字符混合大小写、数字和特殊字符
7. **密码仅输出一次**：仅在初始创建时输出到控制台
