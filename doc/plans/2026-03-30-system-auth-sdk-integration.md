# System Auth Service SDK 集成指南

## 概述

本指南介绍如何使用 `@ai-datahub/sdk` 与 system-auth-service 进行集成。

## 安装

```bash
npm install @ai-datahub/sdk
```

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

## 模块功能

### 组织管理

```typescript
// 创建组织
const orgResult = await client.createOrganization({
  org: { name: 'My Org', code: 'my-org', status: 'ENABLED' },
});

// 列出组织
const orgs = await client.listOrganizations({});
```

### 用户管理

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

### 角色管理

```typescript
// 创建角色
const roleResult = await client.createRole({
  role: { name: 'Admin', code: 'admin', permissions: [] },
});

// 列出角色
const roles = await client.listRoles({});
```

### 权限管理

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

### 菜单管理

```typescript
// 创建菜单节点
const menuResult = await client.upsertMenuNode({
  node: { type: 'MENU', name: 'Dashboard', enabled: true },
});

// 获取菜单树
const menuTree = await client.listMenuTree({});
```

### 目录管理

```typescript
// 创建目录节点
const dirResult = await client.upsertDirectoryNode({
  node: { name: 'Root', code: 'root' },
});

// 获取目录树
const dirTree = await client.listDirectoryTree({});
```

### 审批模板

```typescript
// 创建审批模板
const templateResult = await client.createApprovalTemplate({
  template: { businessType: 'leave', name: '请假审批', definition: {} },
});
```

### 审批流程

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

### 数据权限

```typescript
// 设置数据权限
const permResult = await client.upsertDataPermission({
  permission: { roleId: roleId, scope: { level: 'read' } },
});
```

## 错误处理

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

## 类型定义

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
