# @ai-datahub/sdk 1.0.0-beta.1 预发布公告（草稿）

## 发布标签

- dist-tag: `beta`
- 发布类型：预发布（Release Candidate 前阶段）

## 发布目标

`1.0.0-beta.1` 的目标是将已在 `alpha` 阶段验证通过的 SDK 能力推进到“准稳定”状态，供前端/BFF 团队进行更大范围联调与回归。

## 变更摘要（相对 alpha）

- feat: `SystemAdminHttpClient` 已纳入稳定对接范围，覆盖 `SystemAdminClient` 全量契约方法
- feat: 统一发布准备流程（`release:sdk:prepare*`）作为 beta 前置标准
- test: SDK 客户端映射单测继续保持全绿（含 system-admin/system-auth/metadata/data-service）
- docs: 发布说明、执行计划与发布命令链路已对齐

## 重点能力清单

### 1) 客户端覆盖

- `SystemAuthHttpClient`
- `MetadataHttpClient`
- `DataServiceHttpClient`
- `DataOperationsHttpClient`
- `SystemAdminHttpClient`
- `DataSharingHttpClient`
- `SelfServiceAnalyticsHttpClient`
- `SystemIntegrationHttpClient`
- `DataSecurityHttpClient`
- `DataLifecycleHttpClient`

### 2) 发布自动化

- 一键准备：
  - `npm run release:sdk:prepare`
  - `npm run release:sdk:prepare:beta`
- 按 tag 发布：
  - `npm run release:sdk:publish:beta`

## 兼容性

- `@ai-datahub/contract`: `0.1.0`
- `@ai-datahub/shared`: `0.1.0`
- Node.js: 建议 `18+`

## Beta 门禁条件（发布前必须满足）

- [ ] `npm run build -w packages/contract`
- [ ] `npm run build -w packages/shared`
- [ ] `npm test -w packages/sdk`
- [ ] `npm run build -w packages/sdk`
- [ ] `npm pack --dry-run -w packages/sdk`
- [ ] 前端/BFF 至少 2 条核心链路联调通过（建议：Admin + Sharing）
- [ ] 无 P0/P1 阻断缺陷（类型不匹配、关键接口路径错误、鉴权头丢失）

## 回归范围（建议）

### A. SDK 核心

- `FetchHttpClient`：
  - query 参数拼装
  - `traceId` 透传
  - 非 2xx 错误标准化返回

### B. 领域客户端映射

- `SystemAdminHttpClient`：
  - projects / project-groups / functions / drivers / packages / logs / tickets
- `DataSharingHttpClient`：
  - resources / mappings / services / applications / exchange
- `SelfServiceAnalyticsHttpClient`：
  - queries / visualizations / explore

### C. 行为一致性

- 路径、HTTP 方法、分页参数（`page/pageSize`）与 Contract 一致
- `Result<T>` 解包策略与错误处理策略一致

## 已知风险与缓解

- 风险：beta 期间仍可能出现少量非破坏性接口细节调整  
  缓解：固定 `contract` 版本并对 SDK 映射测试做增量补齐

- 风险：联调环境差异导致鉴权与网关前缀配置不一致  
  缓解：在接入文档中提供标准 `baseUrl`/token 注入范式，统一 smoke case

## 发布步骤（可执行）

```bash
# 0) Beta 预检（推荐）
npm run release:sdk:prepare:beta

# 1) 生成 changeset（交互）
npm run change

# 2) 更新版本与 changelog
npm run version

# 3) 发布（workspace）
npm run release

# 4) 或仅发布 sdk 到 beta tag
npm run release:sdk:publish:beta
```

## 对外沟通建议（草稿）

- `@ai-datahub/sdk@1.0.0-beta.1` 已进入准稳定阶段，推荐新接入团队优先使用。
- 若你当前使用 alpha 版本，可直接升级到 beta 并按联调清单完成回归。
- 正式版 `1.0.0` 将在 beta 回归与缺陷收敛后发布。
