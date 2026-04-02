# @ai-datahub/ops-service

运维调度服务（OpsDomain），负责告警管理、执行运维与运营报表等能力的对外 REST API。

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

服务默认监听端口 `3001`，可通过 `PORT` 环境变量配置。

## API 网关前缀

通过 API Gateway 访问时，统一前缀为：

- `/api/ops/*`

说明：网关会 stripPrefix，因此本服务内部路由使用相对路径（例如 `/alerts/rules`）。

## 鉴权与审计（统一基线）

- 除 `GET /health` 外，所有端点要求 `Authorization: Bearer <token>`
- 支持可选请求头 `x-user-id`（未传时回退 `system-user`，测试环境回退 `test-user`）
- `POST/PUT/DELETE` 自动输出审计日志（成功/失败、traceId、userId、耗时）
- 行为级验收已覆盖：强制 `x-require-auth: true` 且缺少 token 返回 `401`

## 已实现能力（MVP）

### 告警规则（alerts/rules）

| 方法   | 路径                   | 返回结构                        | 说明                              |
| ------ | ---------------------- | ------------------------------- | --------------------------------- |
| POST   | `/alerts/rules`        | `Result<{ ruleId: string }>`    | 创建告警规则                      |
| PUT    | `/alerts/rules`        | `Result<{ success: boolean }>`  | 更新告警规则                      |
| DELETE | `/alerts/rules/:id`    | `Result<{ success: boolean }>`  | 删除告警规则                      |
| GET    | `/alerts/rules`        | `Result<AlertRule[]>`           | **列出**告警规则（数组，不分页）  |
| GET    | `/alerts/rules/search` | `Result<PageResult<AlertRule>>` | **查询**告警规则（支持分页/过滤） |

## SDK 使用

请参考 `ops-service-sdk-integration.md`。

## 响应格式

所有 API 返回统一的 `Result<T>`：

- 成功：`{ ok: true, data: T }`
- 失败：`{ ok: false, error: { code, message, level, traceId? } }`

## 技术栈

- NestJS + Fastify
- TypeScript（strict）
- Vitest（E2E）
