# @ai-datahub/database

共享数据库模块，包含 Prisma schema 和 Prisma Client 封装。

## 使用方法

```typescript
import { prisma } from '@ai-datahub/database';

// 使用 Prisma Client
const user = await prisma.user.findUnique({ where: { id: 'user-id' } });
```

## 数据库模型

| 模型              | 表名               | 说明          |
| ----------------- | ------------------ | ------------- |
| Organization      | organizations      | 组织架构      |
| User              | users              | 用户          |
| Role              | roles              | 角色          |
| Permission        | permissions        | 权限          |
| UserRole          | user_roles         | 用户-角色关联 |
| RolePermission    | role_permissions   | 角色-权限关联 |
| MenuNode          | menu_nodes         | 菜单节点      |
| DirectoryTreeNode | directory_nodes    | 目录节点      |
| ApprovalTemplate  | approval_templates | 审批模板      |
| Approval          | approvals          | 审批记录      |
| DataPermission    | data_permissions   | 数据权限      |

## 环境配置

在 `.env` 文件中配置数据库连接：

```env
# SQLite 数据库路径
# 路径相对于 packages/database/prisma/schema.prisma 文件位置
DATABASE_URL="file:../../../services/system-auth-service/data/system-auth.db"
```

## 常用命令

```bash
# 推送 schema 变更到数据库（开发环境推荐）
npx prisma db push

# 创建迁移文件（生产环境推荐）
npx prisma migrate dev --name <migration-name>

# 生成 Prisma Client
npx prisma generate

# 打开 Prisma Studio 数据库管理界面
npx prisma studio

# 重置数据库（删除所有数据）
npx prisma db push --force-reset
```

## 项目结构

```
packages/database/
├── prisma/
│   └── schema.prisma    # Prisma schema 定义
├── src/
│   ├── index.ts         # 导出
│   └── client.ts        # Prisma Client 单例封装
├── package.json
└── tsconfig.json
```

## 注意事项

1. **路径解析**: `DATABASE_URL` 中的相对路径是相对于 `schema.prisma` 文件位置解析的
2. **多服务共享**: 多个服务可以共享同一个数据库包，每个服务配置自己的 `DATABASE_URL`
3. **迁移管理**: 生产环境建议使用 `prisma migrate` 管理数据库版本

## License

MIT
