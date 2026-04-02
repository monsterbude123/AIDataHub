# @ai-datahub/integration-service

系统集成服务（IntegrationDomain），统一管理外部系统连接器（IDP/通知/消息队列/文件存储），并提供通知发送、消息发布、文件上传下载等 REST API。

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

服务默认监听端口 `3011`，可通过 `PORT` 环境变量配置。

## API 网关前缀

通过 API Gateway 访问时，统一前缀为：

- `/api/integration/*`

说明：网关会 stripPrefix，因此本服务内部路由使用相对路径（例如 `/connectors`）。

## 鉴权与审计（统一基线）

- 除 `GET /health` 外，所有端点要求 `Authorization: Bearer <token>`
- 支持可选请求头 `x-user-id`（未传时回退 `system-user`，测试环境回退 `test-user`）
- `POST/PUT/DELETE` 自动输出审计日志（成功/失败、traceId、userId、耗时）
- 行为级验收已覆盖：强制 `x-require-auth: true` 且缺少 token 返回 `401`

## 已实现能力（MVP）

| 模块       | 方法 | 路径                   | 说明                              |
| ---------- | ---- | ---------------------- | --------------------------------- |
| connectors | POST | `/connectors`          | 创建/更新连接器                   |
| connectors | GET  | `/connectors`          | 列出连接器（可按 type 过滤）      |
| connectors | POST | `/connectors/:id/test` | 测试连接器                        |
| notify     | POST | `/notify`              | 发送通知（MVP：模拟发送）         |
| publish    | POST | `/publish`             | 发布消息（MVP：模拟发布）         |
| files      | POST | `/files/upload`        | 上传文件（MVP：生成 fileRef）     |
| files      | GET  | `/files/download-url`  | 获取下载链接（MVP：生成临时 URL） |

## SDK 使用

请参考 `integration-service-sdk-integration.md`。

## 响应格式

所有 API 返回统一的 `Result<T>`：

- 成功：`{ ok: true, data: T }`
- 失败：`{ ok: false, error: { code, message, level, traceId? } }`

## 技术栈

- NestJS + Fastify
- TypeScript（strict）
- Vitest（E2E）
