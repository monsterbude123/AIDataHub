# M2：微服务单测覆盖率门禁（分波抬升）

本文档与 `services/vitest-coverage-presets.ts` **必须同步维护**：调整任一服务的阈值时，更新本表中的「目标 / 说明」。

## 目标

- 每个 `services/*` 在 `vitest run --coverage` 下执行 **Vitest 覆盖率阈值**（lines / statements / branches / functions）。
- **默认测试集**与 `vitest.config.ts` 中 `include` / `exclude` 一致；依赖 DB / Prisma 全量的用例见各服务注释，本地全量回归请设 **`VITEST_FULL=1`**。
- 根目录一键串行：`npm run test:coverage:services`（`scripts/run-services-coverage.mjs`）。

## 前置条件

- 根目录已安装依赖；涉及 Prisma 的包需已执行 **`npm -w @ai-datahub/database run db:generate`**（若单测或构建依赖生成物）。
- 覆盖率提供器：`@vitest/coverage-v8`（根 `devDependencies` 提升，子 workspace 运行 `vitest --coverage` 时可解析）。

## 各服务阈值（当前基线）

| 服务目录                 | 预设 key                 | 行/语句 | 分支 | 函数 | 备注                                                                    |
| ------------------------ | ------------------------ | ------- | ---- | ---- | ----------------------------------------------------------------------- |
| `api-gateway`            | `api-gateway`            | 80      | 65   | 75   | 主链路已较高                                                            |
| `ops-service`            | `ops-service`            | 80      | 55   | 90   | Wave C：补 report/etl/alerts 校验用例后上调                             |
| `sharing-service`        | `sharing-service`        | 68      | 50   | 62   | Wave C：补校验/非 API test/发布分支                                     |
| `integration-service`    | `integration-service`    | 80      | 72   | 88   | Wave C：补连接器/文件校验与更新分支                                     |
| `security-service`       | `security-service`       | 62      | 55   | 58   | Wave C：补各子域 INVALID_ARGUMENT 用例                                  |
| `analytics-service`      | `analytics-service`      | 65      | 55   | 82   | Wave C：补 query/list/explore 校验用例                                  |
| `admin-service`          | `admin-service`          | 72      | 50   | 68   | 下一迭代可补无效入参再收紧分支                                          |
| `task-scheduler-service` | `task-scheduler-service` | 80      | 65   | 75   |                                                                         |
| `metadata-service`       | `metadata-service`       | 15      | 12   | 14   | 默认排除 e2e；抬升需补单测                                              |
| `data-service-service`   | `data-service-service`   | 28      | 22   | 10   | 大量实体/仓储函数未执行，抬升需分模块补测                               |
| `system-auth-service`    | `system-auth-service`    | 15      | 10   | 15   | 覆盖率 **仅统计** `src/modules/auth/**`（与默认跳过 DB 的测试范围一致） |

## 分波任务（建议）

1. **Wave A（门禁落地）**：各服务 `vitest.config.ts` 接入 `presets`；`package.json` 增加 `test:coverage`；根 `test:coverage:services` 可绿。
2. **Wave B（低覆盖服务）**：`metadata-service`、`data-service-service`、`system-auth-service`（auth 子树）按模块补单测，**同步调高** `vitest-coverage-presets.ts` 与上表。（进行中：优先 data/auth 可测模块。）
3. **Wave C（向 80% 靠拢）**：`ops`、`sharing`、`integration`、`security`、`analytics`、`admin` 分服务抬阈值并补测。（**已完成首轮回路**：ops/integration 行覆盖 ≥80%；sharing 等已抬分支/行阈值，详见上表。）
4. **Wave D（统一高标准）**：在稳定 CI 与测试数据前提下，将更多服务拉到 **lines/statements ≥ 80%**（`sharing`/`security`/`analytics`/`admin` 等仍低于 80% 行覆盖，需继续补测）。

## 变更检查清单

- [ ] 修改 `services/vitest-coverage-presets.ts`
- [ ] 更新本文件表格与「分波」说明（若适用）
- [ ] 运行 `npm run test:coverage:services` 确认全绿
