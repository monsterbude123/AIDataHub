# @ai-datahub/sharing-service

数据共享服务（SharingDomain），负责资源目录、资源登记/编制、资源挂接、共享服务登记、服务申请与交换任务监控的对外 REST API。

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

服务默认监听端口 `3012`，可通过 `PORT` 环境变量配置。

## API 网关前缀

通过 API Gateway 访问时，统一前缀为：

- `/api/sharing/*`

说明：网关会 stripPrefix，因此本服务内部路由使用相对路径（例如 `/portal/stats`）。

## 鉴权与审计（统一基线）

- 除 `GET /health` 外，所有端点要求 `Authorization: Bearer <token>`
- 支持可选请求头 `x-user-id`（未传时回退 `system-user`，测试环境回退 `test-user`）
- `POST/PUT/DELETE` 自动输出审计日志（成功/失败、traceId、userId、耗时）
- 行为级验收已覆盖：强制 `x-require-auth: true` 且缺少 token 返回 `401`

## 已实现能力（MVP）

- `GET /portal/stats`
- `directories`：GET/POST/PUT/DELETE
- `resources/registered`：CRUD + list + `POST /:id/test`（MVP：模拟）
- `resources/compiled`：CRUD + search + import/export + publish（MVP：轻量状态流转）
- `mappings`：attach/detach/get
- `services`：CRUD + search + publish
- `applications`：create/get/list/urge
- `exchange`：executions list + rerun + schedule（MVP：模拟）

## 响应格式

所有 API 返回统一的 `Result<T>`：

- 成功：`{ ok: true, data: T }`
- 失败：`{ ok: false, error: { code, message, level, traceId? } }`

## 技术栈

- NestJS + Fastify
- TypeScript（strict）
- Vitest（E2E）
