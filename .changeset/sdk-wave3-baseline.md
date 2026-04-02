---
'@ai-datahub/sdk': minor
---

补齐并统一 SDK 能力基线，支持前端按领域模块稳定接入。

### 新增

- 新增 `SystemAdminHttpClient`，完整映射 `SystemAdminClient` 契约端点
- 新增发布准备脚本 `scripts/sdk-publish-prepare.mjs`
- 新增根命令：
  - `release:sdk:prepare`
  - `release:sdk:prepare:beta`
  - `release:sdk:pack`
  - `release:sdk:publish:alpha|beta|latest`

### 改进

- `@ai-datahub/sdk` 统一导出补齐（包含 `SystemAdminHttpClient`）
- SDK 发布前流程标准化：构建、测试、dry-run 打包、发布说明模板生成

### 测试

- 新增并通过以下单测：
  - `system-admin-http-client.test.ts`
  - `system-auth-http-client.test.ts`
  - `metadata-http-client.test.ts`
  - `data-service-http-client.test.ts`
