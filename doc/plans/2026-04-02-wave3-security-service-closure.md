# 2026-04-02 Wave 3 收口记录（security-service）

## 目标

一次性完成 `security-service` 的 MVP 交付与工程化收尾，覆盖：

- data-security + data-lifecycle 业务端点
- SDK 客户端与单测
- 服务内鉴权与审计
- 文档与回归验证

## 完成清单

### 1) 业务能力交付（MVP）

- 已交付 `services/security-service`：
  - `masking/*`
  - `classification/*`
  - `row-level-policies/*`
  - `watermark/*`
  - `encryption/*`
  - `lifecycle/*`

### 2) 控制器拆分（原子化）

- 从单一控制器拆分为：
  - `data-security.controller.ts`
  - `data-lifecycle.controller.ts`
- 提取共享状态：
  - `security.store.ts`
- 修复 ID 复用风险：
  - 改为 `SecurityStore.nextId()` 单调递增序列

### 3) SDK 交付

- 新增：
  - `DataSecurityHttpClient`
  - `DataLifecycleHttpClient`
- 新增对应单测并通过。

### 4) 可复用安全模板（共享）

- 在 `@ai-datahub/shared` 新增：
  - `BearerAuthGuard`
  - `WriteAuditLogInterceptor`
- `security-service` 已切换到共享模板实现，删除本地重复 Guard/Interceptor。

### 5) 鉴权与审计

- 除 `GET /health` 外全部端点要求 `Authorization: Bearer <token>`
- `POST/PUT/DELETE` 自动输出审计日志（成功/失败 + traceId/userId/耗时）

### 6) 文档更新

- `services/security-service/README.md`
- `services/security-service/security-service-sdk-integration.md`
- `doc/services/security-service.md`
- `doc/services/README.md`

## 验证结果

已通过：

- `npm run build -w packages/contract`
- `npm test -w packages/sdk`
- `npm test -w services/security-service`
- `npm run build -w packages/shared`
- `ReadLints`（相关目录）无错误

## 后续建议（Wave 4 前）

- 将 `BearerAuthGuard` 接入 `ops/admin/integration/sharing/analytics`，统一服务内认证基线
- 将审计日志下沉到统一日志通道（ELK/OpenSearch）并关联 `traceId`
- 在 `security-service` 引入 DTO + ValidationPipe（当前为 MVP 手写校验）
