# @ai-datahub/security-service

数据安全服务（SecurityDomain），覆盖 data-security 与 data-lifecycle 的 REST 能力。

## 快速开始

```bash
npm install
npm run build
npm run dev
npm run test
npm run build:check
```

服务默认监听端口 `3006`，可通过 `PORT` 环境变量配置。

## API 网关前缀

- `/api/security/*`

## 鉴权与审计（MVP）

- 除 `GET /health` 外，所有端点要求 `Authorization: Bearer <token>`
- 支持可选请求头 `x-user-id`（未传则回退 `system-user`）
- 对 `POST/PUT/DELETE` 自动输出审计日志（成功/失败、traceId、userId、耗时）

## 已实现能力（MVP）

- `masking/*`：算法、规则、配置、静态执行
- `classification/*`：分级分类查询与字典
- `row-level-policies/*`：策略维护
- `watermark/*`：任务创建/查询/列表/解析
- `encryption/*`：任务创建/查询/执行
- `lifecycle/*`：策略、归档、恢复、记录、过期清理、报表

## SDK 使用

请参考 `security-service-sdk-integration.md`。
