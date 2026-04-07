# 2026-04-02 共享鉴权/审计基线批量接入记录

## 目标

将统一安全基线批量接入以下服务，并完成行为级验收：

- `ops-service`
- `admin-service`
- `integration-service`
- `sharing-service`
- `analytics-service`

## 接入内容

### 1) 共享模板统一

基于 `@ai-datahub/shared`：

- `BearerAuthGuard`
- `WriteAuditLogInterceptor`
- `Public` 装饰器

### 2) 服务内规则

- 除 `GET /health` 外，所有业务端点必须携带 `Authorization: Bearer <token>`
- 支持 `x-user-id`（未传时回退 `system-user`，测试环境回退 `test-user`）
- 所有写操作（`POST/PUT/DELETE`）统一输出审计日志

### 3) 行为级验收

五个服务均新增 1 条 401 未授权 E2E：

- 强制头：`x-require-auth: true`
- 缺失 `Authorization`
- 断言：返回 `401` + 错误消息 `Authorization header missing`

## 验证结果

已通过：

- `npm test -w services/ops-service`
- `npm test -w services/admin-service`
- `npm test -w services/integration-service`
- `npm test -w services/sharing-service`
- `npm test -w services/analytics-service`

## 影响与收益

- 从“构建接入”提升到“行为验收”级别
- 鉴权策略和审计输出在 5 个业务服务达成一致
- 后续新增服务可直接复用 `@ai-datahub/shared` 模板，降低重复实现成本
