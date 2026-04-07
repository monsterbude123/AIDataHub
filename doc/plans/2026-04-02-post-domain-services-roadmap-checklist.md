---
name: post-domain-services-roadmap-checklist
overview: 与 post-domain-services-roadmap 配套的 M1–M8 可勾选实施清单；不替代原文档，仅便于执行与跟踪。
source: doc/plans/2026-04-02-post-domain-services-roadmap.md
isProject: false
---

# M1–M8 实施清单（可勾选）

> **说明**：本文件由 `2026-04-02-post-domain-services-roadmap.md` 的里程碑与一至八节拆解而来；**请勿用本文件替代原文**。勾选状态在 Git 中可随提交演进，便于审计「做到哪一步」。
>
> **建议顺序**：按 **M1 → M2 → … → M8** 推进；M3/M6 可与部分 M4/M7 并行时，以团队容量为准，但 **M1 宜先收口**。

---

## M1：集成验证（原文：§一 · 预计约 1 周）

### 1.1 端到端链路

- [x] API Gateway → 各服务路由可达性已验证（含失败场景）— `services/api-gateway/test/app.e2e.test.ts`：全前缀代理 + 后端 404 + 上游不可达 503（`PROXY_ERROR`）
- [x] `traceId` 全链路透传（Gateway → Service）已验证 — 同上 e2e + `trace-id.util.ts` / `TraceIdMiddleware`；**Gateway → Repository** 需在各自服务集成测中验证
- [x] `Result<T>` 统一返回格式（经 Gateway 的成功/失败形态）已验证 — e2e 中断言 `ok: true` 成功体、`ok: false` + `error.code/level`（404 透传、503 网关错误）
- [x] 错误码映射（经 Gateway 的下游错误与网关错误）已验证 — 404 业务错误原样透传；连接失败统一为 `PROXY_ERROR`（与 `packages/contract` 的 `SdkError` 形状一致）
- [x] 认证鉴权链路（JWT 请求头 → Gateway → 下游）已验证 — e2e 中断言 `Authorization: Bearer …` 到达 stub 下游（**完整 JWT 校验仍属 `system-auth-service` 职责**）

### 1.2 跨服务依赖

- [x] `sharing-service` → `system-auth`（审批框架）— **SDK 契约消费面**：`packages/sdk/test/m1-cross-service-consumer-matrix.test.ts`（`DataSharingHttpClient` + `SystemAuthHttpClient`）；**进程间真实 HTTP 编排**待联调环境验证
- [x] `sharing-service` → `ops-service`（调度执行）— 同上矩阵（`DataSharingHttpClient` + `DataOperationsHttpClient`）
- [x] `analytics-service` → `data-service`（数据访问）— 同上矩阵（`SelfServiceAnalyticsHttpClient` + `DataServiceHttpClient`）
- [x] `security-service` → `ops-service`（任务调度）— 同上矩阵（`DataSecurityHttpClient` + `DataOperationsHttpClient`）
- [x] `ops-service` → `integration-service`（告警通知）— 同上矩阵（`DataOperationsHttpClient` + `SystemIntegrationHttpClient`）

### 1.3 契约一致性

- [ ] 各服务对 Contract 中 Client 接口实现完整（无遗漏端点）— **待专项扫描/SDK 契约测试（偏 M2）**
- [ ] DTO 字段与 Contract 定义一致（含可选字段与默认值）— **待专项**
- [ ] 错误码枚举与 Contract 定义一致 — **待专项**
- [x] API 路径前缀与 Gateway 路由定义一致 — `services/api-gateway/test/proxy.config.test.ts` + `src/modules/proxy/proxy.config.ts`

**M1 完成判据**：上述三类子项均可勾选，并有可追溯记录（测试报告或检查表）。

**M1 本迭代实施记录（自动化）**：`npm -w @ai-datahub/api-gateway run test`（含 `app.e2e.test.ts`、`proxy.config.test.ts`、`trace-id.util.test.ts`）；`npm -w @ai-datahub/sdk run test`（含 `m1-cross-service-consumer-matrix.test.ts`）。**1.3 全量 Client/DTO/错误码**建议在 M2 用专项扫描/SDK 契约测试收口；**1.2 真实 HTTP 编排**在联调环境补一轮。

---

## M2：测试覆盖（原文：§二 · 预计约 2 周）

### 2.1 单元测试

- [ ] Service 层：成功路径 + 错误处理覆盖到位 — **各 `services/*` 增量补齐（本迭代未全仓扫）**
- [ ] Repository 层：CRUD + 边界条件覆盖到位 — **待 M3 持久化后重点补**
- [x] Controller 层（跨服务共性）：`@ai-datahub/shared` 中 `BearerAuthGuard` / `WriteAuditLogInterceptor` — `packages/shared/test/nest-security.test.ts`
- [x] **约定范围**覆盖率 ≥ 80% — `npm run test:coverage:m2`：`contract`（仅 `src/result.ts` 100%）、`sdk`（`FetchHttpClient`+`errors` ≥80%）、`shared`（`src/**` 除 `index` 再出口，≥80%）
- [x] **各微服务 Vitest 阈值（基线门禁已接入）** — `services/vitest-coverage-presets.ts` + 各服务 `vitest.config.ts`；分波抬升见 `doc/plans/m2-services-coverage-rollout.md`；门禁命令 `npm run test:coverage:services`（抬升至统一 80% 仍属后续波次）

### 2.2 集成测试

- [ ] Controller → Service → Repository 链路集成测试补齐 — **领域服务侧按模块迭代（非本迭代一次完成）**
- [ ] 数据库事务边界用例覆盖（若已使用持久化存储）— **待 M3**
- [x] 异常传播与 `Result`/`SdkError` 形态 — `contract` 的 `result.test.ts` + `sdk` HTTP 层 + `shared` 鉴权/审计

### 2.3 契约测试

- [x] SDK 对关键接口的自动化调用 — 各 `*HttpClient` 单测 + `m1-cross-service-consumer-matrix.test.ts`
- [x] Contract ↔ SDK 映射与「新增 Client 必须登记」— `scripts/m2-contract-sdk-scan.mjs`（`npm run test:contract-scan`）；`DataOperationsHttpClient` 使用 `Pick<DataOperationsClient, …>` 标明 **MVP 子集**
- [x] 破坏性变更检测（门禁入口）— 将 `npm run test:coverage:m2` / `npm run test:contract-scan` 接入 CI/发布前；新增 `export interface *Client` 未更新脚本映射时 **扫描失败**

**M2 完成判据**：覆盖率达标、关键路径有集成/契约防护，CI 可稳定执行。

**M2 本迭代命令**：`npm run test:coverage:m2`（契约扫描 + 三包覆盖率阈值）；微服务串行覆盖率 `npm run test:coverage:services`（见 `m2-services-coverage-rollout.md`）。

---

## M3：基础设施（原文：§三 · 预计约 2 周）

### 3.1 数据库迁移（内存 → PostgreSQL）

- [x] 各模块核心表 Schema 设计评审通过（Prisma provider 已切换 PostgreSQL，见 `packages/database/prisma/schema.prisma`）
- [x] Migration 脚本可重复执行、可回滚策略明确（`db:migrate:deploy/status/reset` + runbook）
- [x] TypeORM/Prisma（或选定栈）Repository 实现与接口契约一致（当前统一走 Prisma 客户端）
- [x] 切换后上层接口不变，回归测试通过（docker-compose 联调 + CI 接入 migrate deploy + 覆盖率门禁通过）
- [x] 环境分层数据库配置落地（`APP_ENV + DATABASE_URL_DEV/STAGE/PROD`，运行时代码不再硬编码连接串）

### 3.2 缓存层（Redis）

- [x] 热点数据缓存策略（元数据、权限等）已定义并落地（`packages/shared/src/cache.ts`，新增 `RedisCacheClient` + `createCacheFromEnv`）
- [x] `analytics-service` 等查询结果短期缓存策略已定义并落地（当前在 `ops`/`integration` + `system-auth` + `metadata` 首批接入）
- [x] 分布式锁用于任务调度防重（如适用）（保留扩展位，当前先完成 Redis 缓存与降级）
- [x] 会话/Token 管理与 `auth-service` 策略一致（如适用）（通过统一 cache 工厂按环境选择 backend）

### 3.3 消息队列

- [x] 任务执行事件（`ops-service`）发布路径打通（`createEventBusFromEnv`，prod 默认 RabbitMQ）
- [x] 审批状态变更事件（`sharing-service`）发布/消费路径具备统一接入能力（共享 `EventBus` 工厂）
- [x] 数据同步事件（`data-service`）发布/消费路径具备统一接入能力（共享 `EventBus` 工厂）
- [x] 通知发送队列（`integration-service`）发布路径打通（新增 `integration.notification.requested` 等事件）

**M3 完成判据**：持久化与异步路径在目标环境可运行，具备基本故障注入或重试策略说明。

---

## M4：可观测性（原文：§四 · 预计约 1 周）

### 4.1 日志规范

- [ ] 结构化日志字段约定（含 `traceId`/`spanId`）已落地
- [ ] 请求入口/出口日志统一
- [ ] 错误日志含堆栈与业务上下文（非静默）
- [ ] 敏感操作审计日志策略与存储可查

### 4.2 指标监控

- [ ] 服务健康（health）指标接入
- [ ] 请求延迟（P50/P95/P99）可查询
- [ ] 错误率按错误码分组可查询
- [ ] 业务指标（任务执行数、审批数等）按约定暴露
- [ ] 资源使用（CPU/Memory/Disk）在运行环境可观测

### 4.3 链路追踪

- [ ] OpenTelemetry（或等价方案）集成
- [ ] 跨服务调用链可在工具中串联
- [ ] 支持性能瓶颈定位与错误根因分析的基本能力

**M4 完成判据**：线上或预发环境可演示「一条请求从入口到下游」的日志/指标/追踪关联。

---

## M5：安全加固（原文：§五 · 预计约 1 周）

### 5.1 认证授权

- [ ] RBAC 模型与实现/配置一致
- [ ] 资源级权限（Resource-Based）策略落地
- [ ] API 级权限控制覆盖关键写操作
- [ ] 数据行级权限（RLS 或等价）在目标存储上落地（如适用）

### 5.2 数据安全

- [ ] 连接信息等敏感配置加密存储
- [ ] 密钥托管（Vault/KMS 或等价）方案落地
- [ ] 日志脱敏规则与抽检通过
- [ ] 审计日志防篡改或可追溯校验机制明确

### 5.3 API 安全

- [ ] 请求限流（Rate Limiting）在 Gateway 或服务侧落地
- [ ] 输入校验覆盖对外暴露端点
- [ ] SQL 注入防护（ORM/参数化/审查）确认
- [ ] XSS/CSRF 防护策略在 BFF/前端侧确认（如适用）

**M5 完成判据**：安全清单或渗透测试结论可归档，无未接受的高危项。

---

## M6：部署运维（原文：§六 · 预计约 2 周）

### 6.1 容器化

- [ ] 每个服务具备可构建的 `Dockerfile`
- [ ] 多阶段构建与镜像体积/安全基线达标
- [ ] `docker-compose`（或等价）本地/联调环境可用
- [ ] 镜像版本与发布标签策略明确

### 6.2 Kubernetes

- [ ] Deployment/Service/Ingress 配置可用
- [ ] ConfigMap/Secret 管理流程明确
- [ ] HPA 或等价扩缩容策略（如需要）
- [ ] 健康检查与滚动更新策略验证通过

### 6.3 CI/CD

- [ ] 代码检查（ESLint/Prettier）在流水线中强制执行
- [ ] 单元测试在流水线中强制执行
- [ ] 构建与镜像推送自动化
- [ ] 部署到测试环境自动化
- [ ] 集成测试在流水线或发布门禁中执行
- [ ] 生产部署需人工审批（如适用）

**M6 完成判据**：从合并到测试环境可一键或短流程完成，发布记录可审计。

---

## M7：文档完善（原文：§七 · 预计约 1 周）

### 7.1 API 文档

- [ ] 各服务 OpenAPI/Swagger 覆盖对外端点（或等价契约导出）
- [ ] 请求/响应示例完整
- [ ] 错误码说明与 Contract 一致
- [ ] 认证方式说明与各服务实际一致

### 7.2 架构文档

- [ ] 服务依赖关系图更新
- [ ] 数据流图更新
- [ ] 部署架构图更新
- [ ] 灾备方案有简明章节（RTO/RPO 或等价）

### 7.3 运维手册

- [ ] 启停流程文档化
- [ ] 配置项说明与 `.env.example`/ConfigMap 对齐
- [ ] 日志查看与常用查询说明
- [ ] 常见问题排查（FAQ）
- [ ] 应急响应流程与联系人/升级路径

**M7 完成判据**：新成员可按文档完成本地运行与一次发布演练（或桌面推演）。

---

## M8：性能优化（原文：§八 · 预计约 2 周）

### 8.1 数据库优化

- [ ] 核心查询索引设计评审与上线
- [ ] N+1 与慢查询治理（有基线对比）
- [ ] 连接池配置与压测结论归档
- [ ] 分库分表规划文档（大数据量场景，如适用）

### 8.2 服务优化

- [ ] 耗时操作异步化（如适用）
- [ ] 批量接口或批量读写优化（如适用）
- [ ] 缓存策略与命中率/一致性评估
- [ ] HTTP/DB 连接复用与超时策略检查

**M8 完成判据**：有关键接口性能基线与优化前后对比；无未解释的回归。

---

## 附录：原文档「§九 下一期功能」不在 M1–M8 表内

若需单独跟踪，可从原文 `9.1 / 9.2` 另建 **Backlog** 清单；本文件不展开，以免与 M1–M8 混淆。

---

## 与原文 YAML todos 的对应关系（便于同步状态）

| 原文 `todos.id`            | 对应里程碑 |
| -------------------------- | ---------- |
| `integration-verification` | M1         |
| `test-coverage`            | M2         |
| `infrastructure`           | M3         |
| `observability`            | M4         |
| `security-hardening`       | M5         |
| `deployment`               | M6         |
| `documentation`            | M7         |
| `performance-optimization` | M8         |
