# @ai-datahub/system-auth-service

统一认证与审批框架微服务，提供用户管理、角色权限、组织架构、菜单配置、审批流程、数据权限等功能。

## 功能模块

| 模块                  | 说明                              |
| --------------------- | --------------------------------- |
| **Auth**              | JWT 认证登录，权限校验            |
| **User**              | 用户 CRUD，角色分配               |
| **Role**              | 角色 CRUD                         |
| **Permission**        | 权限定义，角色绑定                |
| **Organization**      | 组织架构管理                      |
| **Menu**              | 菜单树配置（目录/菜单/按钮）      |
| **Directory**         | 系统树目录统一管理                |
| **Approval Template** | 审批模板定义                      |
| **Approval**          | 审批流程发起、审批、待办/已办查询 |
| **Data Permission**   | 数据权限配置                      |

## 快速开始

```bash
# 安装依赖
npm install

# 构建
npm run build

# 开发模式运行
npm run dev

# 运行测试
npm run test

# 类型检查
npm run build:check
```

服务默认监听端口 `3000`，可通过 `PORT` 环境变量配置。

## API 文档

启动服务后访问 Swagger API 文档: http://localhost:3000/api/docs

## SDK 使用

使用 `@ai-datahub/sdk` 包调用服务：

```typescript
import { SystemAuthHttpClient, FetchHttpClient } from '@ai-datahub/sdk';

const http = new FetchHttpClient('http://localhost:3000');
const client = new SystemAuthHttpClient(http);

// 用户登录
const loginResult = await client.login({
  username: 'admin',
  password: 'password123',
});

// 获取组织列表
const orgs = await client.listOrganizations({ keyword: 'test' });

// 创建用户
const userResult = await client.createUser({
  user: {
    username: 'john',
    email: 'john@example.com',
    realName: 'John Doe',
  },
});

// 分配角色
await client.assignRoles({
  userId: 'user-001',
  roleIds: ['role-001', 'role-002'],
});
```

## 环境变量

| 变量         | 默认值       | 说明                             |
| ------------ | ------------ | -------------------------------- |
| `PORT`       | `3000`       | 服务监听端口                     |
| `JWT_SECRET` | `dev-secret` | JWT 签名密钥（生产环境必须配置） |

## API 端点

### 认证模块 `/auth`

| 方法 | 路径          | 说明                     |
| ---- | ------------- | ------------------------ |
| POST | `/auth/login` | 用户登录，返回 JWT Token |

**登录请求示例：**

```json
{
  "username": "admin",
  "password": "password123"
}
```

**登录响应示例：**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user-001",
    "username": "admin",
    "email": "admin@example.com",
    "realName": "管理员",
    "orgId": "org-001"
  },
  "roles": ["admin", "user"]
}
```

### 用户模块 `/users`

| 方法   | 路径               | 说明                             |
| ------ | ------------------ | -------------------------------- |
| GET    | `/users`           | 用户列表（支持分页、关键词搜索） |
| POST   | `/users`           | 创建用户                         |
| PUT    | `/users`           | 更新用户                         |
| DELETE | `/users/:id`       | 删除用户                         |
| POST   | `/users/:id/roles` | 为用户分配角色                   |

### 角色模块 `/roles`

| 方法   | 路径         | 说明     |
| ------ | ------------ | -------- |
| GET    | `/roles`     | 角色列表 |
| POST   | `/roles`     | 创建角色 |
| PUT    | `/roles`     | 更新角色 |
| DELETE | `/roles/:id` | 删除角色 |

### 权限模块 `/permissions`

| 方法 | 路径                        | 说明             |
| ---- | --------------------------- | ---------------- |
| GET  | `/permissions`              | 权限列表（分页） |
| POST | `/permissions`              | 创建权限         |
| POST | `/permissions/bind-to-role` | 将权限绑定到角色 |

### 组织模块 `/organizations`

| 方法   | 路径                 | 说明     |
| ------ | -------------------- | -------- |
| GET    | `/organizations`     | 组织列表 |
| POST   | `/organizations`     | 创建组织 |
| PUT    | `/organizations`     | 更新组织 |
| DELETE | `/organizations/:id` | 删除组织 |

### 菜单模块 `/menus`

| 方法   | 路径            | 说明                           |
| ------ | --------------- | ------------------------------ |
| GET    | `/menus/tree`   | 获取菜单树                     |
| POST   | `/menus/upsert` | 创建/更新菜单节点              |
| DELETE | `/menus/:id`    | 删除菜单节点（级联删除子节点） |

### 目录模块 `/directory`

| 方法   | 路径                | 说明              |
| ------ | ------------------- | ----------------- |
| GET    | `/directory/tree`   | 获取目录树        |
| POST   | `/directory/upsert` | 创建/更新目录节点 |
| DELETE | `/directory/:id`    | 删除目录节点      |

### 审批模板模块 `/approval-templates`

| 方法   | 路径                      | 说明         |
| ------ | ------------------------- | ------------ |
| GET    | `/approval-templates`     | 审批模板列表 |
| POST   | `/approval-templates`     | 创建审批模板 |
| PUT    | `/approval-templates`     | 更新审批模板 |
| DELETE | `/approval-templates/:id` | 删除审批模板 |

### 审批模块 `/approvals`

| 方法 | 路径                     | 说明                  |
| ---- | ------------------------ | --------------------- |
| POST | `/approvals`             | 发起审批              |
| POST | `/approvals/:id/approve` | 审批操作（通过/拒绝） |
| GET  | `/approvals/todo`        | 待办审批列表          |
| GET  | `/approvals/done`        | 已办审批列表          |
| POST | `/approvals/:id/remind`  | 催办提醒              |

### 数据权限模块 `/data-permissions`

| 方法 | 路径                             | 说明                   |
| ---- | -------------------------------- | ---------------------- |
| POST | `/data-permissions`              | 创建/更新数据权限      |
| GET  | `/data-permissions/role/:roleId` | 查询角色的数据权限列表 |

## 数据类型

### User

```typescript
interface User {
  id: string;
  username: string;
  passwordHash?: string; // 仅内部使用
  email?: string;
  realName?: string;
  orgId: string;
  status: 'ENABLED' | 'DISABLED';
  createdAt: string; // ISO DateTime
  updatedAt: string; // ISO DateTime
}
```

### Role

```typescript
interface Role {
  id: string;
  name: string;
  code: string;
  orgId?: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Permission

```typescript
interface Permission {
  id: string;
  type: 'URI' | 'PAGE_ELEMENT';
  name: string;
  code: string;
  resource: string; // URI / selector / element-id
  createdAt: string;
}
```

### MenuNode

```typescript
interface MenuNode {
  id: string;
  parentId?: string;
  type: 'DIRECTORY' | 'MENU' | 'BUTTON';
  name: string;
  path?: string;
  icon?: string;
  permissionCode?: string;
  enabled: boolean;
  sort?: number;
  createdAt: string;
  updatedAt: string;
}
```

### ApprovalTemplate

```typescript
interface ApprovalTemplate {
  id: string;
  businessType: string;
  name: string;
  definition: Record<string, unknown>; // 审批节点与规则定义
  createdAt: string;
  updatedAt: string;
}
```

### Approval

```typescript
interface Approval {
  id: string;
  businessType: string;
  businessId: string;
  title: string;
  applicantId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  currentNode?: string;
  payload?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}
```

### DataPermission

```typescript
interface DataPermission {
  id: string;
  roleId: string;
  scope: Record<string, unknown>; // 数据范围定义
  createdAt: string;
}
```

## 响应格式

所有 API 返回统一的 `Result<T>` 格式：

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

## 错误码

| 错误码                        | 说明           |
| ----------------------------- | -------------- |
| `USER_NOT_FOUND`              | 用户不存在     |
| `ORG_NOT_FOUND`               | 组织不存在     |
| `ROLE_NOT_FOUND`              | 角色不存在     |
| `PERMISSION_NOT_FOUND`        | 权限不存在     |
| `APPROVAL_NOT_FOUND`          | 审批不存在     |
| `APPROVAL_TEMPLATE_NOT_FOUND` | 审批模板不存在 |
| `DIRECTORY_NOT_FOUND`         | 目录节点不存在 |
| `DATA_PERMISSION_NOT_FOUND`   | 数据权限不存在 |
| `USERNAME_DUPLICATE`          | 用户名重复     |
| `APPROVAL_STATE_INVALID`      | 审批状态无效   |
| `INVALID_ARGUMENT`            | 参数错误       |
| `PERMISSION_DENIED`           | 权限不足       |
| `REMIND_FAILED`               | 催办失败       |

## 技术栈

- **框架**: NestJS + Fastify
- **ORM**: TypeORM
- **数据库**: SQLite（开发）/ PostgreSQL（生产推荐）
- **认证**: JWT + bcrypt
- **权限**: CASL Ability
- **验证**: Zod

## 项目结构

```
services/system-auth-service/
├── src/
│   ├── main.ts                 # 入口文件
│   ├── AppModule.ts            # 根模块
│   ├── common/
│   │   ├── database/           # 数据库配置
│   │   └── errors/             # 异常定义
│   ├── entities/               # TypeORM 实体
│   │   ├── User.entity.ts
│   │   ├── Role.entity.ts
│   │   ├── Permission.entity.ts
│   │   ├── Organization.entity.ts
│   │   ├── MenuNode.entity.ts
│   │   ├── DirectoryTreeNode.entity.ts
│   │   ├── ApprovalTemplate.entity.ts
│   │   ├── Approval.entity.ts
│   │   ├── DataPermission.entity.ts
│   │   └── ...
│   └── modules/                # 功能模块
│       ├── auth/
│       ├── user/
│       ├── role/
│       ├── permission/
│       ├── organization/
│       ├── menu/
│       ├── directory/
│       ├── approval-template/
│       ├── approval/
│       └── data-permission/
├── test/                       # E2E 测试
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── vitest.config.ts
```

## 测试

```bash
# 运行单元测试
npm run test

# 运行 E2E 测试
npm run test -- run test/

# 测试覆盖率
npm run test -- coverage
```

## License

MIT
