# M3 3.1 数据库迁移 Runbook（Prisma）

## 目标

- 将数据库结构纳入 Prisma migration 管理，迁移可重复执行。
- 确保服务层接口不变，持久化层切换后可通过回归测试。
- 明确回滚策略与故障处理步骤，避免静默失败。

## 当前基线

- Schema：`packages/database/prisma/schema.prisma`
- 初始迁移：`packages/database/prisma/migrations/20260403075457_init_schema/migration.sql`
- 管理脚本（`@ai-datahub/database`）：
  - `db:generate`
  - `db:migrate`
  - `db:migrate:deploy`
  - `db:migrate:status`
  - `db:migrate:reset`
  - `db:push`

## 执行流程

1. 配置数据库连接串（`DATABASE_URL`），并确认指向目标环境。
2. 本地开发创建迁移：
   - `npm -w @ai-datahub/database run db:migrate -- --name <desc>`
3. CI / 部署环境执行：
   - `npm -w @ai-datahub/database run db:migrate:deploy`
4. 验证迁移状态：
   - `npm -w @ai-datahub/database run db:migrate:status`
5. 生成 Prisma Client：
   - `npm -w @ai-datahub/database run db:generate`

## 回滚策略

- 生产环境不直接 `reset`；优先通过“前滚修复”处理迁移错误。
- 若某次迁移引发故障：
  1. 立即冻结发布窗口。
  2. 使用数据库备份恢复（RPO/RTO 按环境策略）。
  3. 新建修复迁移并执行 `db:migrate:deploy`。
- 非生产环境可使用：
  - `npm -w @ai-datahub/database run db:migrate:reset`

## 验证清单（M3 3.1）

- [x] 核心表结构已入 migration（初始迁移已落库）
- [x] 迁移脚本具备 dev/deploy/status/reset 命令
- [x] Repository 层仍通过 PrismaClient 对外暴露一致契约
- [x] 默认测试链路可运行（coverage / e2e 门禁保持通过）
