# metadata-service（元数据管理服务）

> **当前状态**：✅ 已实现。
>
> - **代码位置**：`services/metadata-service/src/modules/metadata/`
> - **API 前缀**：`/api/metadata`

## 1. 职责边界

- 对应 bounded context：`metadata`
- 范围：元数据**全生命周期管理**（采集、导入导出、同步、版本、变更订阅）
- 不包含：接入时“初始元数据采集”（归 `data-integration`）

## 2. 依赖

- **契约**：`@ai-datahub/contract` 的 `MetadataClient` 与相关 DTO
- **共享基础设施**：`@ai-datahub/shared`（traceId、错误映射）
- **上游/下游**：
  - 下游数据源连接能力：由实现层适配（JDBC/Hive/ES/File 等），不进入 contract
  - 与 `data-governance-*` 的关系：提供资产/字段元数据来源

## 3. API（第一阶段 MVP）

- `POST /metadata/collect` → `collectMetadata`
- `POST /metadata/import` → `importMetadata`
- `POST /metadata/export` → `exportMetadata`
- `POST /metadata/sync` → `syncMetadata`
- `GET /metadata/assets/:dataAssetId/versions` → `getMetadataVersions`
- `POST /metadata/versions/compare` → `compareMetadataVersions`
- `POST /metadata/changes/subscribe` → `subscribeMetadataChange`

## 4. 数据存储（建议）

- 元数据主库：PostgreSQL（资产、字段、版本、订阅）
- 大字段（导入/导出 payload、差异快照）：对象存储（MinIO/OSS）+ 引用

## 5. 里程碑

- M1：服务模板跑通（health + traceId 透传 + Result 响应）
- M2：collect/sync 跑通（dryRun 支持）
- M3：版本与比对（versions + compare）
- M4：变更订阅（EMAIL/WEBHOOK）
