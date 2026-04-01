# system-auth-service 数据库重构实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将 system-auth-service 的 DatabaseModule 重构为使用 @ai-datahub/database 共享单例 prisma 客户端

**Architecture:** 仅修改 DatabaseModule，保留 NestJS DI 模式，服务通过 @Inject('PRISMA_CLIENT') 注入使用共享单例

**Tech Stack:** NestJS, Prisma, TypeScript, @ai-datahub/database

---

## Task 1: 修改 DatabaseModule 使用共享 prisma 单例

**Files:**

- Modify: `services/system-auth-service/src/common/database/database.module.ts`

**Step 1: 修改 DatabaseModule 导入**

将 `database.module.ts` 的导入从本地创建改为使用共享单例：

```typescript
import { Module, Global } from '@nestjs/common';
import { prisma } from '@ai-datahub/database';

@Global()
@Module({
  providers: [
    {
      provide: 'PRISMA_CLIENT',
      useValue: prisma,
    },
  ],
  exports: ['PRISMA_CLIENT'],
})
export class DatabaseModule {}
```

**Step 2: 运行类型检查**

Run: `npm run build:check`
Expected: PASS - 无类型错误

**Step 3: 运行构建**

Run: `npm run build`
Expected: PASS - 构建成功

---

## Task 2: 验证测试通过

**Files:**

- Test: `services/system-auth-service/src/**/*.test.ts`

**Step 1: 运行所有单元测试**

Run: `npm run test`
Expected: PASS - 所有测试继续通过（测试使用独立的 test/prisma.ts 实例）

**Step 2: 检查测试覆盖率未下降**

Run: `npm run test` 查看输出
Expected: 测试覆盖率保持不变

---

## Task 3: 更新环境配置说明

**Files:**

- Modify: `services/system-auth-service/.env.example`

**Step 1: 确保 .env.example 包含 DATABASE_URL**

检查 `.env.example` 是否包含正确的数据库配置说明：

```env
# Database URL for Prisma (relative path from packages/database/prisma/schema.prisma)
DATABASE_URL="file:data/system-auth.db"
```

如果已存在则无需修改。

---

## Task 4: 提交变更

**Step 1: 查看变更状态**

Run: `git status`
Expected: 仅显示 `database.module.ts` 有变更（可能还有设计文档）

**Step 2: 提交变更**

```bash
git add services/system-auth-service/src/common/database/database.module.ts docs/plans/2026-04-01-database-refactor-design.md docs/plans/2026-04-01-database-refactor-implementation.md
git commit -m "$(cat <<'EOF'
refactor(system-auth): use shared prisma singleton from @ai-datahub/database

- Modify DatabaseModule to import prisma from @ai-datahub/database
- Remove local PrismaClient instantiation
- Keep NestJS DI pattern for test mockability

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## 验收标准

1. ✅ DatabaseModule 使用 `import { prisma } from '@ai-datahub/database'`
2. ✅ 类型检查通过 (`npm run build:check`)
3. ✅ 构建通过 (`npm run build`)
4. ✅ 所有测试通过 (`npm run test`)
5. ✅ 变更已提交

---

## 注意事项

- **测试隔离**: 测试使用 `test/prisma.ts` 创建的独立测试数据库实例，不受此重构影响
- **DI 保留**: 服务仍使用 `@Inject('PRISMA_CLIENT')`，便于测试 mock
- **环境变量**: `DATABASE_URL` 需在 `.env` 中正确配置
