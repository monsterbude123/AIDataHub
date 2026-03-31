# System Auth Service SDK Integration Guide

本文档说明如何通过 `@ai-datahub/sdk` 与 `system-auth-service` 进行集成。

## 安装

```bash
npm install @ai-datahub/sdk @ai-datahub/contract
```

## 初始化客户端

```typescript
import { createSystemAuthClient } from '@ai-datahub/sdk';

const client = createSystemAuthClient({
  baseUrl: 'http://localhost:3000',
  // 可选：自定义请求头
  headers: {
    Authorization: 'Bearer <jwt-token>',
  },
  // 可选：超时配置
  timeout: 5000,
});
```

## 认证流程

### 用户登录

```typescript
import { createSystemAuthClient } from '@ai-datahub/sdk';

const client = createSystemAuthClient({ baseUrl: 'http://localhost:3000' });

// 登录获取 JWT Token
const loginResult = await client.login({
  username: 'admin',
  password: 'password123',
});

if (loginResult.success) {
  const { token, user, roles } = loginResult.data;

  // 存储 token 用于后续请求
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));

  // 创建带认证的客户端
  const authClient = createSystemAuthClient({
    baseUrl: 'http://localhost:3000',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
```

## 用户管理

### 创建用户

```typescript
const result = await client.createUser({
  user: {
    username: 'newuser',
    email: 'newuser@example.com',
    realName: '新用户',
    orgId: 'org-001',
    status: 'ENABLED',
  },
});

if (result.success) {
  console.log('创建成功，用户ID:', result.data.userId);
}
```

### 查询用户列表

```typescript
const result = await client.listUsers({
  orgId: 'org-001',
  keyword: 'admin',
  page: { page: 1, pageSize: 10 },
});

if (result.success) {
  const { items, total, page, pageSize } = result.data;
  console.log(`共 ${total} 条记录，当前第 ${page} 页`);
}
```

### 更新用户

```typescript
const result = await client.updateUser({
  user: {
    id: 'user-001',
    username: 'admin',
    email: 'admin@example.com',
    realName: '管理员',
    orgId: 'org-001',
    status: 'ENABLED',
  },
});
```

### 删除用户

```typescript
const result = await client.deleteUser({
  userId: 'user-001',
});
```

### 为用户分配角色

```typescript
const result = await client.assignRoles({
  userId: 'user-001',
  roleIds: ['role-001', 'role-002'],
});
```

## 角色管理

### 创建角色

```typescript
const result = await client.createRole({
  role: {
    name: '数据管理员',
    code: 'data-admin',
    orgId: 'org-001',
    enabled: true,
  },
});
```

### 查询角色列表

```typescript
const result = await client.listRoles({
  keyword: 'admin',
});
```

### 更新角色

```typescript
const result = await client.updateRole({
  role: {
    id: 'role-001',
    name: '数据管理员',
    code: 'data-admin',
    orgId: 'org-001',
    enabled: true,
  },
});
```

### 删除角色

```typescript
const result = await client.deleteRole({
  roleId: 'role-001',
});
```

## 权限管理

### 创建权限

```typescript
const result = await client.createPermission({
  permission: {
    type: 'URI',
    name: '用户管理-查看',
    code: 'user:read',
    resource: '/api/users',
  },
});
```

### 查询权限列表

```typescript
const result = await client.listPermissions({
  keyword: 'user',
  page: { page: 1, pageSize: 20 },
});
```

### 将权限绑定到角色

```typescript
const result = await client.bindPermissionsToRole({
  roleId: 'role-001',
  permissionIds: ['perm-001', 'perm-002', 'perm-003'],
});
```

## 组织管理

### 创建组织

```typescript
const result = await client.createOrganization({
  org: {
    name: '技术部门',
    code: 'tech-dept',
    parentId: 'org-root',
  },
});
```

### 查询组织列表

```typescript
const result = await client.listOrganizations({
  keyword: '技术',
});
```

### 更新组织

```typescript
const result = await client.updateOrganization({
  org: {
    id: 'org-001',
    name: '技术部门',
    code: 'tech-dept',
    parentId: 'org-root',
  },
});
```

### 删除组织

```typescript
const result = await client.deleteOrganization({
  orgId: 'org-001',
});
```

## 菜单管理

### 查询菜单树

```typescript
const result = await client.listMenuTree();

if (result.success) {
  const menuNodes = result.data;
  // 构建菜单树结构
  const tree = buildMenuTree(menuNodes);
}

function buildMenuTree(nodes: MenuNode[]): MenuNode[] {
  const map = new Map(nodes.map((n) => [n.id, n]));
  const roots: MenuNode[] = [];

  for (const node of nodes) {
    if (node.parentId) {
      const parent = map.get(node.parentId);
      if (parent) {
        (parent as any).children = [...((parent as any).children || []), node];
      }
    } else {
      roots.push(node);
    }
  }

  return roots.sort((a, b) => (a.sort || 0) - (b.sort || 0));
}
```

### 创建/更新菜单节点

```typescript
// 创建新菜单
const result = await client.upsertMenuNode({
  node: {
    parentId: 'menu-001',
    type: 'MENU',
    name: '用户管理',
    path: '/users',
    icon: 'user',
    permissionCode: 'menu:user',
    enabled: true,
    sort: 1,
  },
});

// 更新已有菜单
const updateResult = await client.upsertMenuNode({
  node: {
    id: 'menu-002',
    parentId: 'menu-001',
    type: 'MENU',
    name: '用户管理',
    path: '/users',
    icon: 'user',
    permissionCode: 'menu:user',
    enabled: true,
    sort: 2,
  },
});
```

### 删除菜单节点

```typescript
// 删除菜单节点及其所有子节点
const result = await client.deleteMenuNode({
  nodeId: 'menu-001',
});
```

## 目录管理

### 查询目录树

```typescript
const result = await client.listDirectoryTree({
  parentId: 'dir-root', // 可选，查询指定节点下的子目录
  keyword: '系统', // 可选，关键词搜索
});
```

### 创建/更新目录节点

```typescript
const result = await client.upsertDirectoryNode({
  node: {
    parentId: 'dir-root',
    name: '系统配置',
    code: 'sys-config',
    attributes: {
      level: 1,
      category: 'system',
    },
  },
});
```

### 删除目录节点

```typescript
const result = await client.deleteDirectoryNode({
  nodeId: 'dir-001',
});
```

## 审批模板管理

### 创建审批模板

```typescript
const result = await client.createApprovalTemplate({
  template: {
    businessType: 'data-export',
    name: '数据导出审批',
    definition: {
      nodes: [
        { id: 'node-1', name: '部门经理审批', type: 'single' },
        { id: 'node-2', name: '数据管理员审批', type: 'single' },
      ],
      rules: {
        order: ['node-1', 'node-2'],
      },
    },
  },
});
```

### 查询审批模板列表

```typescript
const result = await client.listApprovalTemplates({
  businessType: 'data-export',
});
```

### 更新审批模板

```typescript
const result = await client.updateApprovalTemplate({
  template: {
    id: 'template-001',
    businessType: 'data-export',
    name: '数据导出审批',
    definition: {
      // 更新的定义
    },
  },
});
```

### 删除审批模板

```typescript
const result = await client.deleteApprovalTemplate({
  templateId: 'template-001',
});
```

## 审批流程管理

### 发起审批

```typescript
const result = await client.createApproval({
  businessType: 'data-export',
  businessId: 'export-task-001',
  title: '导出用户数据申请',
  applicantId: 'user-001',
  payload: {
    reason: '数据分析需要',
    dataType: 'user',
    range: 'org-001',
  },
});

if (result.success) {
  console.log('审批已创建，审批ID:', result.data.approvalId);
}
```

### 审批操作（通过/拒绝）

```typescript
// 通过审批
const approveResult = await client.approve({
  approvalId: 'approval-001',
  action: 'APPROVE',
  comment: '同意导出，请按规范处理数据',
});

// 拒绝审批
const rejectResult = await client.approve({
  approvalId: 'approval-001',
  action: 'REJECT',
  comment: '数据范围过大，请缩小范围后重新申请',
});
```

### 查询待办审批

```typescript
const result = await client.listMyTodoApprovals({
  userId: 'user-001',
  page: { page: 1, pageSize: 10 },
});

if (result.success) {
  const approvals = result.data.items;
  console.log('待办审批:', approvals.length);
}
```

### 查询已办审批

```typescript
const result = await client.listMyDoneApprovals({
  userId: 'user-001',
  page: { page: 1, pageSize: 10 },
});
```

### 催办提醒

```typescript
const result = await client.remindApproval({
  approvalId: 'approval-001',
  message: '请尽快处理此审批',
});
```

## 数据权限管理

### 创建/更新数据权限

```typescript
const result = await client.upsertDataPermission({
  permission: {
    roleId: 'role-001',
    scope: {
      type: 'org',
      orgIds: ['org-001', 'org-002'],
      level: 'self-and-children',
    },
  },
});
```

### 查询角色的数据权限

```typescript
const result = await client.listDataPermissions({
  roleId: 'role-001',
  page: { page: 1, pageSize: 20 },
});

if (result.success) {
  const permissions = result.data.items;
  // 每个权限定义了该角色可访问的数据范围
}
```

## 错误处理

所有 API 返回统一的 `Result<T>` 结构：

```typescript
interface Result<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    level: 'ERROR' | 'WARN';
  };
  traceId?: string;
}
```

### 错误处理示例

```typescript
const result = await client.createUser({ user: userData });

if (!result.success) {
  const { code, message } = result.error;

  switch (code) {
    case 'USERNAME_DUPLICATE':
      console.error('用户名已存在');
      break;
    case 'ORG_NOT_FOUND':
      console.error('组织不存在');
      break;
    case 'PERMISSION_DENIED':
      console.error('权限不足');
      break;
    default:
      console.error(`错误: ${message}`);
  }

  // traceId 可用于日志追踪
  console.log('TraceId:', result.traceId);
}
```

## 类型定义

所有类型定义来自 `@ai-datahub/contract`：

```typescript
import type {
  User,
  Role,
  Permission,
  Organization,
  MenuNode,
  DirectoryTreeNode,
  ApprovalTemplate,
  Approval,
  DataPermission,
  Result,
  PageResult,
  PageRequest,
} from '@ai-datahub/contract';
```

## 最佳实践

### 1. Token 管理

```typescript
// 推荐的 token 管理方式
class AuthService {
  private token: string | null = null;
  private client: SystemAuthClient;

  async login(username: string, password: string) {
    const result = await this.client.login({ username, password });
    if (result.success) {
      this.token = result.data.token;
      this.updateClientHeaders();
    }
    return result;
  }

  private updateClientHeaders() {
    this.client = createSystemAuthClient({
      baseUrl: this.baseUrl,
      headers: { Authorization: `Bearer ${this.token}` },
    });
  }

  isAuthenticated(): boolean {
    return this.token !== null;
  }
}
```

### 2. 分页查询

```typescript
// 通用的分页查询封装
async function fetchAllUsers(client: SystemAuthClient, orgId: string) {
  const allUsers: User[] = [];
  let page = 1;
  const pageSize = 50;

  while (true) {
    const result = await client.listUsers({
      orgId,
      page: { page, pageSize },
    });

    if (!result.success) break;

    allUsers.push(...result.data.items);

    if (allUsers.length >= result.data.total) break;
    page++;
  }

  return allUsers;
}
```

### 3. 菜单权限控制

```typescript
// 前端菜单渲染时的权限过滤
function filterMenusByPermission(
  menus: MenuNode[],
  userPermissions: string[]
): MenuNode[] {
  return menus.filter((menu) => {
    // 检查菜单是否有权限要求
    if (menu.permissionCode) {
      return userPermissions.includes(menu.permissionCode);
    }
    return true;
  });
}
```

### 4. TraceId 追踪

```typescript
// 请求时传递 traceId，便于跨服务追踪
const result = await client.createUser({
  meta: { traceId: 'custom-trace-id' },
  user: userData,
});

// 所有响应都包含 traceId
console.log('Response traceId:', result.traceId);
```

## HTTP 端点映射

| SDK 方法                 | HTTP 端点                            |
| ------------------------ | ------------------------------------ |
| `login`                  | `POST /auth/login`                   |
| `createUser`             | `POST /users`                        |
| `updateUser`             | `PUT /users`                         |
| `deleteUser`             | `DELETE /users/:id`                  |
| `listUsers`              | `GET /users`                         |
| `assignRoles`            | `POST /users/:id/roles`              |
| `createRole`             | `POST /roles`                        |
| `updateRole`             | `PUT /roles`                         |
| `deleteRole`             | `DELETE /roles/:id`                  |
| `listRoles`              | `GET /roles`                         |
| `createPermission`       | `POST /permissions`                  |
| `listPermissions`        | `GET /permissions`                   |
| `bindPermissionsToRole`  | `POST /permissions/bind-to-role`     |
| `createOrganization`     | `POST /organizations`                |
| `updateOrganization`     | `PUT /organizations`                 |
| `deleteOrganization`     | `DELETE /organizations/:id`          |
| `listOrganizations`      | `GET /organizations`                 |
| `listMenuTree`           | `GET /menus/tree`                    |
| `upsertMenuNode`         | `POST /menus/upsert`                 |
| `deleteMenuNode`         | `DELETE /menus/:id`                  |
| `listDirectoryTree`      | `GET /directory/tree`                |
| `upsertDirectoryNode`    | `POST /directory/upsert`             |
| `deleteDirectoryNode`    | `DELETE /directory/:id`              |
| `createApprovalTemplate` | `POST /approval-templates`           |
| `updateApprovalTemplate` | `PUT /approval-templates`            |
| `deleteApprovalTemplate` | `DELETE /approval-templates/:id`     |
| `listApprovalTemplates`  | `GET /approval-templates`            |
| `createApproval`         | `POST /approvals`                    |
| `approve`                | `POST /approvals/:id/approve`        |
| `listMyTodoApprovals`    | `GET /approvals/todo`                |
| `listMyDoneApprovals`    | `GET /approvals/done`                |
| `remindApproval`         | `POST /approvals/:id/remind`         |
| `upsertDataPermission`   | `POST /data-permissions`             |
| `listDataPermissions`    | `GET /data-permissions/role/:roleId` |

## 相关文档

- [system-auth-service README](../../services/system-auth-service/README.md)
- [Contract 类型定义](../../packages/contract/src/modules/system-auth.ts)
- [SDK 源码](../../packages/sdk/)
