# @ai-datahub/admin-service

系统管理服务（AdminDomain），负责项目管理、项目分组等系统治理类能力的对外 REST API。

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

服务默认监听端口 `3003`，可通过 `PORT` 环境变量配置。

## API 网关前缀

通过 API Gateway 访问时，统一前缀为：

- `/api/admin/*`

说明：网关会 stripPrefix，因此本服务内部路由使用相对路径（例如 `/projects`）。

## 鉴权与审计（统一基线）

- 除 `GET /health` 外，所有端点要求 `Authorization: Bearer <token>`
- 支持可选请求头 `x-user-id`（未传时回退 `system-user`，测试环境回退 `test-user`）
- `POST/PUT/DELETE` 自动输出审计日志（成功/失败、traceId、userId、耗时）
- 行为级验收已覆盖：强制 `x-require-auth: true` 且缺少 token 返回 `401`

## 已实现能力（MVP）

### 项目（projects）

| 方法   | 路径            | 返回结构                        | 说明                  |
| ------ | --------------- | ------------------------------- | --------------------- |
| POST   | `/projects`     | `Result<{ projectId: string }>` | 创建项目              |
| PUT    | `/projects`     | `Result<{ success: boolean }>`  | 更新项目              |
| DELETE | `/projects/:id` | `Result<{ success: boolean }>`  | 删除项目              |
| GET    | `/projects`     | `Result<PageResult<Project>>`   | 列出项目（分页/过滤） |

### 项目分组（project-groups）

| 方法   | 路径                                | 返回结构                           | 说明                  |
| ------ | ----------------------------------- | ---------------------------------- | --------------------- |
| POST   | `/project-groups`                   | `Result<{ groupId: string }>`      | 创建分组              |
| PUT    | `/project-groups`                   | `Result<{ success: boolean }>`     | 更新分组              |
| DELETE | `/project-groups/:id`               | `Result<{ success: boolean }>`     | 删除分组              |
| GET    | `/project-groups`                   | `Result<PageResult<ProjectGroup>>` | 列出分组（分页/过滤） |
| POST   | `/project-groups/:id/bind-projects` | `Result<{ success: boolean }>`     | 绑定项目到分组        |
| POST   | `/project-groups/:id/bind-users`    | `Result<{ success: boolean }>`     | 绑定用户到分组        |

## SDK 使用

请参考 `admin-service-sdk-integration.md`。

## 响应格式

所有 API 返回统一的 `Result<T>`：

- 成功：`{ ok: true, data: T }`
- 失败：`{ ok: false, error: { code, message, level, traceId? } }`

## 技术栈

- NestJS + Fastify
- TypeScript（strict）
- Vitest（E2E）
