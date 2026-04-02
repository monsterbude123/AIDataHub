# Admin Service SDK 集成指南

## 概述

本指南介绍如何使用 `@ai-datahub/sdk` 集成 `admin-service` 的项目与项目分组能力。

## 安装

```bash
npm install @ai-datahub/sdk
```

## 初始化 HTTP Client

```typescript
import { FetchHttpClient, SystemAdminHttpClient } from '@ai-datahub/sdk';

// 通过网关访问（推荐）
const http = new FetchHttpClient({
  baseUrl: 'http://localhost:3100/api/admin',
});

// 直接访问服务（本地调试）
// const http = new FetchHttpClient({ baseUrl: 'http://localhost:3003' });

const admin = new SystemAdminHttpClient(http);
```

## 调用示例

### 1) 创建项目 → 列表查询 → 更新 → 删除

```typescript
const created = await admin.createProject({
  meta: { traceId: 't_create_project' },
  project: { name: 'p1', code: 'p1', orgId: 'org_1', status: 'ENABLED' },
});
if (!created.ok) throw new Error(created.error.message);

const list = await admin.listProjects({
  meta: { traceId: 't_list_projects' },
  keyword: 'p1',
  page: { page: 1, pageSize: 10 },
});
if (!list.ok) throw new Error(list.error.message);

const updated = await admin.updateProject({
  meta: { traceId: 't_update_project' },
  project: {
    id: created.data.projectId,
    name: 'p1-updated',
    code: 'p1',
    orgId: 'org_1',
    status: 'ENABLED',
  },
});
if (!updated.ok) throw new Error(updated.error.message);

const deleted = await admin.deleteProject({
  meta: { traceId: 't_delete_project' },
  projectId: created.data.projectId,
});
if (!deleted.ok) throw new Error(deleted.error.message);
```

### 2) 创建项目分组 → 绑定项目/用户

```typescript
const group = await admin.createProjectGroup({
  meta: { traceId: 't_create_group' },
  group: { name: 'g1', description: 'desc' },
});
if (!group.ok) throw new Error(group.error.message);

await admin.bindProjectsToGroup({
  meta: { traceId: 't_bind_projects' },
  groupId: group.data.groupId,
  projectIds: ['p_1'],
});

await admin.bindUsersToGroup({
  meta: { traceId: 't_bind_users' },
  groupId: group.data.groupId,
  userIds: ['u_1', 'u_2'],
});
```

## 错误处理

所有 API 返回 `Result<T>`，失败时：

```typescript
if (!res.ok) {
  console.error(res.error.code, res.error.message, res.error.traceId);
}
```
