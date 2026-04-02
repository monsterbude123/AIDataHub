# @ai-datahub/sdk 1.0.0-alpha.3 发布说明

## 发布标签

- dist-tag: `alpha`

## 变更摘要

- feat: 新增 `SystemAdminHttpClient`，补齐 `SystemAdminClient` 全量接口映射（projects/project-groups/functions/drivers/packages/logs/tickets）
- feat: 补齐 SDK 对外导出，新增 `SystemAdminHttpClient` 到 `@ai-datahub/sdk` 统一出口
- feat: 新增发布准备自动化脚本 `scripts/sdk-publish-prepare.mjs`（构建、测试、dry-run、发布说明模板生成）
- fix: 统一 SDK 发布前命令入口，降低人工漏项风险（`release:sdk:prepare*`、`release:sdk:pack`、`release:sdk:publish:*`）
- test: 新增 4 组客户端映射单测（system-admin/system-auth/metadata/data-service）
- docs: 更新 `doc/plans/2026-04-02-sdk-development-plan.md`，补齐可执行发布步骤与检查清单

## 详细变更

### 新增客户端

- `packages/sdk/src/clients/SystemAdminHttpClient.ts`
  - 覆盖 `SystemAdminClient` 全量契约方法：
    - `create/update/delete/list/get project`
    - `create/update/delete/list project-group` + `bindProjectsToGroup` + `bindUsersToGroup`
    - `list/get/create/update/delete function`
    - `list/create/delete package`
    - `list/create/delete driver`
    - `list operation logs`
    - `list/get/update tickets`

### 单测增强

- `packages/sdk/test/system-admin-http-client.test.ts`
- `packages/sdk/test/system-auth-http-client.test.ts`
- `packages/sdk/test/metadata-http-client.test.ts`
- `packages/sdk/test/data-service-http-client.test.ts`

### 发布自动化

- 新增脚本：`scripts/sdk-publish-prepare.mjs`
  - 自动执行：
    - `npm run build -w packages/contract`
    - `npm run build -w packages/shared`
    - `npm test -w packages/sdk`
    - `npm run build -w packages/sdk`
    - `npm pack --dry-run -w packages/sdk`
  - 自动生成发布模板：
    - `doc/releases/sdk-<version>.md`
- 根命令新增：
  - `release:sdk:prepare`
  - `release:sdk:prepare:beta`
  - `release:sdk:pack`
  - `release:sdk:publish:alpha`
  - `release:sdk:publish:beta`
  - `release:sdk:publish:latest`

## 兼容性

- 与 `@ai-datahub/contract` 对齐版本：`0.1.0`
- 与 `@ai-datahub/shared` 对齐版本：`0.1.0`
- Node.js：建议 `18+`
- 发布标签：`alpha`（预发布，不建议直接用于生产）

## 升级建议

1. 前端/BFF 若需系统管理能力，请从 `@ai-datahub/sdk` 直接使用 `SystemAdminHttpClient`。
2. 建议统一通过 `FetchHttpClient` 注入 `baseUrl` 与 `traceId`，保持链路可观测性一致。
3. 建议先在测试环境使用 `alpha` 标签进行联调，再升级到后续 `beta/latest`。

## 已知限制

- 当前发布为 `alpha`，接口语义已稳定但仍可能随后续服务演进做小幅非破坏调整。
- 发布流程依赖 changeset；未执行 `npm run change && npm run version` 前，不会自动推进实际版本号。

## 验证记录

- [x] npm run build -w packages/contract
- [x] npm run build -w packages/shared
- [x] npm test -w packages/sdk
- [x] npm run build -w packages/sdk
- [x] npm pack --dry-run -w packages/sdk

## 发布命令

```bash
# 0) 一键发布准备（推荐先执行）
npm run release:sdk:prepare

# 1) 生成 changeset（交互）
npm run change

# 2) 落版本号 + changelog
npm run version

# 3) 发布
npm run release

# 或仅发布 sdk（如需精确控制）
npm run release:sdk:publish:alpha
```
