# system-auth-service 数据库重构设计

## 背景

`system-auth-service` 当前在 `DatabaseModule` 中创建自己的 `PrismaClient` 实例，而 `@ai-datahub/database` 包已提供共享的单例 `prisma` 客户端。需要重构为使用共享包的单例，统一数据库访问方式。

## 目标

将 `system-auth-service` 重构为使用 `import { prisma } from '@ai-datahub/database';`

## 设计方案

### 方案选择

采用**最小改动方案**：仅修改 `DatabaseModule`，保留 NestJS DI 模式。

**理由**：

- 改动最小，风险最低
- 服务文件无需变更
- 测试无需修改
- 统一使用共享包的单例

### 架构变更

仅修改 `database.module.ts`：

```typescript
// 修改前
import { Module, Global } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
});

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

// 修改后
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

### 数据流

1. `@ai-datahub/database` 包创建单例 `prisma` 客户端（基于 `DATABASE_URL` 环境变量）
2. `DatabaseModule` 导入此单例并通过 NestJS DI 提供
3. 服务通过 `@Inject('PRISMA_CLIENT')` 注入使用
4. 测试继续使用 `test/prisma.ts` 提供独立的测试数据库实例

### 环境配置

需要确保 `system-auth-service` 的 `.env` 配置正确的 `DATABASE_URL`：

```env
DATABASE_URL="file:data/system-auth.db"
```

`@ai-datahub/database` 包的 `prisma` 单例会读取此环境变量。

### 测试策略

- 单元测试：无需修改，继续使用 `test/prisma.ts` 的测试数据库
- 测试在 DI 中提供测试专用的 `prisma` 实例，覆盖生产实例

### 影响范围

| 文件                 | 变更                                    |
| -------------------- | --------------------------------------- |
| `database.module.ts` | 导入 `prisma` 替代本地创建              |
| 其他服务文件         | 无变更                                  |
| 测试文件             | 无变更                                  |
| `package.json`       | 无变更（已依赖 `@ai-datahub/database`） |

## 决策记录

- **保留 DI 模式**：用户确认保留 NestJS 依赖注入模式，便于测试 mock
- **最小改动**：用户确认采用最小改动方案（方案 A）

## 相关文档

- [auth-guard-design.md](2026-03-31-auth-guard-design.md) - 认证守卫设计
