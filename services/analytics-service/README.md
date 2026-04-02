# @ai-datahub/analytics-service

自助分析服务（AnalyticsDomain），负责查询保存/执行/导出、可视化配置、数据探索与查询分享。

## 快速开始

```bash
npm install
npm run build
npm run dev
npm run test
npm run build:check
```

服务默认监听端口 `3013`，可通过 `PORT` 环境变量配置。

## API 网关前缀

- `/api/analytics/*`

## 鉴权与审计（统一基线）

- 除 `GET /health` 外，所有端点要求 `Authorization: Bearer <token>`
- 支持可选请求头 `x-user-id`（未传时回退 `system-user`，测试环境回退 `test-user`）
- `POST/PUT/DELETE` 自动输出审计日志（成功/失败、traceId、userId、耗时）
- 行为级验收已覆盖：强制 `x-require-auth: true` 且缺少 token 返回 `401`

## 已实现能力（MVP）

- `queries`：保存/更新/删除/分页列表
- `queries/:id/execute`：执行查询（MVP 模拟结果）
- `queries/:id/export`：导出查询结果（MVP 生成下载 URL）
- `queries/:id/share`：分享查询
- `visualizations`：创建/更新/分页列表
- `explore`：数据探索

## SDK 使用

请参考 `analytics-service-sdk-integration.md`。
