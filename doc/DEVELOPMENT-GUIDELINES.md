# AIDataHub 开发规范

本文档定义了 AIDataHub 项目的**统一开发规范**，所有新服务和重构必须遵循。

---

## 目录

1. [项目结构规范](#1-项目结构规范)
2. [代码风格规范](#2-代码风格规范)
3. [错误处理规范](#3-错误处理规范)
4. [日志规范](#4-日志规范)
5. [认证授权规范](#5-认证授权规范)
   - 5.1 [JWT 全局认证](#51-jwt-全局认证)
   - 5.2 [公开端点约定](#52-公开端点约定)
   - 5.3 [权限控制](#53-权限控制)
6. [API 文档规范](#6-api-文档规范)
   - 6.1 [DTO 文件组织](#61-dto-文件组织)
   - 6.2 [Swagger 装饰器要求](#62-swagger-装饰器要求)
   - 6.3 [必须提供的信息](#63-必须提供的信息)
7. [数据库与持久化规范](#7-数据库与持久化规范)
8. [测试规范](#8-测试规范)
9. [文档规范](#9-文档规范)
10. [Git 提交规范](#10-git-提交规范)
11. [链路追踪与幂等性规范](#11-链路追踪与幂等性规范)
12. [本地开发环境规范](#12-本地开发环境规范)
13. [API 网关规范](#13-api-网关规范)

---

## 1. 项目结构规范

### 1.1 微服务目录结构

所有微服务必须遵循以下结构：

```
services/{service-name}/
├── src/
│   ├── common/                    # 共享基础设施组件
│   │   ├── database/              # 数据库模块（DatabaseModule）
│   │   ├── errors/                # 自定义异常
│   │   ├── filters/               # 全局过滤器
│   │   └── middleware/            # 全局中间件
│   ├── controllers/               # 全局控制器
│   │   └── HealthController.ts   # 健康检查（必须）
│   ├── modules/                   # 业务模块（按领域拆分）
│   │   └── {domain}/              # 每个领域一个模块
│   │       ├── {domain}.dtos.ts    # 请求/响应 DTO 类（带 Swagger 装饰）
│   │       ├── {domain}.controller.ts
│   │       ├── {domain}.module.ts
│   │       └── {domain}.service.ts
│   ├── AppModule.ts              # 根模块
│   └── main.ts                   # 入口文件
├── prisma/                        # Prisma schema（如果使用数据库）
│   └── schema.prisma
├── test/                          # 单元/集成测试
├── package.json
└── tsconfig.json
```

### 1.2 命名规范

| 元素     | 命名方式         | 示例                         |
| -------- | ---------------- | ---------------------------- |
| 文件     | kebab-case       | `global-exception.filter.ts` |
| 类       | PascalCase       | `GlobalExceptionFilter`      |
| 接口     | PascalCase       | `UserData`                   |
| 函数     | camelCase        | `getUserById`                |
| 变量     | camelCase        | `currentUser`                |
| 常量     | UPPER_SNAKE_CASE | `MAX_PAGE_SIZE`              |
| 环境变量 | UPPER_SNAKE_CASE | `JWT_SECRET`                 |

### 1.3 模块拆分原则

- **按领域拆分**：每个业务领域一个独立模块
- **单一职责**：一个模块只做一件事
- **避免大模块**：超过 800 行的文件考虑拆分
- **高内聚低耦合**：相关逻辑放一起，不相关逻辑分开

---

## 2. 代码风格规范

### 2.1 TypeScript 严格模式

- 必须开启 `strict: true`
- **禁止使用 `any`**，零 `any` 是目标
- 优先使用类型推断，不必要不写显式类型注解
- 优先使用接口/类型别名，减少class

### 2.2 不可变性

- 优先创建新对象，不要就地修改原有对象

```typescript
// 正确
const newUser = { ...user, name: 'newName' };

// 避免
user.name = 'newName';
```

### 2.3 函数大小

- 单个函数不超过 **50 行**
- 嵌套深度不超过 **4 层**
- 超过就拆分出小函数

### 2.4 错误处理

- 所有可能失败的操作都要处理错误
- 不要静默吞掉错误

```typescript
// 正确
try {
  await operation();
} catch (err) {
  logger.error('Operation failed', { err });
  throw new BusinessError('OPERATION_FAILED', err.message);
}

// 避免
try {
  await operation();
} catch (err) {
  // 什么都不做
}
```

---

## 3. 错误处理规范

### 3.1 统一返回格式

所有 API 必须返回统一的 `Result<T>` 格式（来自 `@ai-datahub/contract`）：

```typescript
// 成功
{
  ok: true,
  data: T,
  traceId: string
}

// 失败
{
  ok: false,
  error: {
    code: string,
    message: string,
    level: ErrorLevel
  },
  traceId: string
}
```

### 3.2 全局异常过滤器

所有服务**必须**注册全局异常过滤器：

- 捕获所有未处理异常
- 转换为上述 `Result` 格式
- 自动注入 `traceId`
- 记录错误日志

位置：`src/common/filters/global-exception.filter.ts`

### 3.3 自定义异常

业务异常必须继承 `BaseException`（来自 `@ai-datahub/shared`）：

```typescript
import { BaseException } from '@ai-datahub/shared';

export class UserNotFoundException extends BaseException {
  constructor(userId: string) {
    super('USER_NOT_FOUND', `User not found: ${userId}`, 'WARN');
  }
}
```

### 3. 错误级别

| 级别       | 说明 | 适用场景                         |
| ---------- | ---- | -------------------------------- |
| `WARN`     | 警告 | 业务错误（用户不存在、权限不足） |
| `ERROR`    | 错误 | 操作失败、数据库错误             |
| `CRITICAL` | 严重 | 系统级错误、无法继续             |

---

## 4. 日志规范

### 4.1 统一使用共享 logger

必须使用 `@ai-datahub/shared` 提供的结构化日志：

```typescript
import { logger } from '@ai-datahub/shared';

logger.info('User logged in', { userId, traceId });
logger.error('Login failed', { error, username });
```

**禁止**使用 `console.log`。

### 4.2 日志必须包含 traceId

所有请求处理链路必须透传 `traceId`，并在日志中带上。

### 4.3 日志级别约定

| 级别    | 使用场景                         |
| ------- | -------------------------------- |
| `debug` | 开发调试信息（生产默认关闭）     |
| `info`  | 正常业务流程（登录、创建成功等） |
| `warn`  | 不影响主流程的异常               |
| `error` | 影响操作的错误                   |
| `fatal` | 系统级严重错误                   |

---

## 5. 认证授权规范

### 5.1 JWT 全局认证

所有服务**默认开启全局认证**：

- 所有端点需要认证，除非标记为公开
- 使用 `JwtAuthGuard` 全局守卫
- 使用 `@Public()` 装饰器标记公开端点

```typescript
import { Public } from '../auth/public.decorator';

@Public()
@Get('health')
getHealth() {
  // ...
}
```

### 5.2 公开端点约定

以下端点必须是公开的：

- `GET /health` - 健康检查
- `POST /auth/login` - 用户登录
- `GET /api/docs` - Swagger 文档
- `GET /api-json` - OpenAPI schema

### 5.3 权限控制

#### 5.3.1 单点职责架构（核心原则）

**唯一完整认证权限服务**：只有 `system-auth-service` 负责：

- 用户登录/登出、JWT 签发
- 组织/角色/权限/用户管理
- RBAC/ACL 权限决策

**其他服务职责**：只做 JWT 令牌签名验证，不负责权限决策：

- 验证令牌签名是否有效
- 从令牌中提取用户信息（userId、roles、permissions）
- 将用户信息附加到请求上下文
- **不**调用本地权限检查
- 需要权限决策时，调用 `system-auth-service` 远程检查

#### 5.3.2 权限检查流程

```
服务接收到请求 → 验证 JWT 令牌 → 调用 system-auth-service 检查权限 → 执行业务逻辑
```

这样避免了重复实现认证逻辑，保证权限规则全局一致性。

#### 5.3.3 权限检查实现

使用 CASL 进行基于能力的权限控制（仅 `system-auth-service`）：

```typescript
// 检查用户是否有权限
const isAllowed = this.caslAbilityFactory.can(user, 'read', dataAsset);
```

---

## 6. API 文档规范

### 6.1 DTO 文件组织

**所有 DTO 类必须放在单独文件**：

- 每个模块一个 DTO 文件：`{domain}.dtos.ts`
- 所有请求/响应 DTO 都在这里定义
- 控制器只导入使用，不直接定义 DTO

### 6.2 Swagger 装饰器要求

所有控制器、DTO、方法必须添加完整的 Swagger 装饰：

```typescript
// user.dtos.ts - DTO 必须每个属性都有 @ApiProperty
export class CreateUserData {
  @ApiProperty({ description: '用户名' })
  username: string = undefined!;

  @ApiProperty({ description: '邮箱' })
  email: string = undefined!;
}

export class CreateUserRequest {
  @ApiProperty({ description: '用户信息', type: () => CreateUserData })
  user: CreateUserData = undefined!;
}

// user.controller.ts - 控制器方法必须
@ApiOperation({ summary: '创建用户' })
@ApiResponse({ status: 201, description: '创建成功' })
@Post()
createUser(@Body() dto: CreateUserRequest) {
  // ...
}
```

**TypeScript 严格模式要求**：

- 所有非可选 DTO 属性必须提供初始值：`field: Type = undefined!;`
- 可选属性保留 `?`：`field?: Type;`

### 6.3 必须提供的信息

- `@ApiProperty` 每个 DTO 字段必须有 `description`
- `@ApiOperation` 每个方法必须有 `summary`
- `@ApiResponse` 至少定义成功和常见失败响应

### 6.3 文档访问

Swagger UI 统一在 `/api/docs`，OpenAPI schema 在 `/api-json`。

---

## 7. 数据库与持久化规范

### 7.1 ORM 选择

使用 **Prisma** 作为 ORM，通过 `@ai-datahub/database` 共享客户端单例。

### 7.2 依赖注入

通过 Nest DI 提供 Prisma 客户端：

```typescript
// database.module.ts
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

### 7.3 事务

需要事务时，必须使用 Prisma 事务：

```typescript
await prisma.$transaction(async (tx) => {
  await tx.user.create(...);
  await tx.profile.create(...);
});
```

---

## 8. 测试规范

### 8.1 测试覆盖率要求

**最低 80% 覆盖率**，核心业务争取 90%+。

### 8.2 测试类型

| 类型     | 位置                     | 说明                   |
| -------- | ------------------------ | ---------------------- |
| 单元测试 | 与源码同目录 `*.test.ts` | 测试独立函数/类        |
| 集成测试 | `test/` 目录             | 测试模块集成、API 端点 |
| E2E 测试 | `test/e2e/` 目录         | 端到端全流程测试       |

### 8.3 测试命名

测试文件名：`{source}.test.ts`，例如：`auth.service.test.ts`

测试描述：应该描述**行为**而不是描述函数：

```typescript
// 正确
it('should return 401 when password is wrong', () => { ... });

// 避免
it('should call login', () => { ... });
```

### 8.4 测试隔离

- 每个测试用例必须独立，不依赖其他测试用例的状态
- 测试完成后清理数据库（事务回滚或清理测试数据）
- 外部依赖必须 mock，不依赖真实外部服务（除非是集成测试）

### 8.5 Mock 原则

- 单元测试：mock 所有外部依赖，只测试当前单元
- 集成测试：真实依赖尽量使用测试容器（testcontainers），保证真实性
- 不 mock 自身方法，不测试 mock

---

## 9. 文档规范

### 9.1 文档目录

| 文档类型 | 位置                              | 说明                                |
| -------- | --------------------------------- | ----------------------------------- |
| 服务设计 | `doc/services/{service}.md`       | 职责边界、API、依赖、环境变量       |
| 实施计划 | `doc/plans/YYYY-MM-DD-{topic}.md` | 重构/新功能怎么做，分几步，验收标准 |
| 专项设计 | `doc/design/{topic}/`             | 跨服务主题设计                      |
| 架构决策 | `doc/DECISIONS.md`                | 为什么这么选，决策背景              |
| 架构全景 | `doc/ARCHITECTURE.md`             | 整体架构、分层、原则                |

### 9.2 职责

- `services/` → **what**（这个服务是什么）
- `plans/` → **how**（这个任务怎么做）
- `DECISIONS.md` → **why**（为什么这么决策）

### 9.3 更新原则

- 修改代码必须同步更新相关文档
- 删除功能必须删除相关文档
- 过期文档要么更新要么删除

---

## 10. Git 提交规范

### 10.1 提交格式

```
<type>: <description>

[optional body]
```

### 10.2 type 可选值

| type       | 说明               |
| ---------- | ------------------ |
| `feat`     | 新功能             |
| `fix`      | 修复 bug           |
| `refactor` | 重构（不改变功能） |
| `docs`     | 文档更新           |
| `test`     | 测试更新           |
| `chore`    | 构建/工具/依赖更新 |
| `perf`     | 性能优化           |
| `ci`       | CI/CD 相关         |

### 10.3 示例

```
feat: 添加全局异常过滤器

实现了统一的异常处理，自动转换为 Result<T> 格式，包含 traceId。
```

---

## 11. 链路追踪与幂等性规范

### 11.1 traceId 透传

- `traceId` 必须从入口全链路透传到所有下游
- 所有日志必须包含 `traceId`
- 所有错误响应必须包含 `traceId`

### 11.2 幂等性

所有写操作（POST/PUT/DELETE）**建议支持** `idempotencyKey`：

- 由客户端生成 UUID
- 服务端保证同一个 `idempotencyKey` 只执行一次
- 重复请求返回相同结果，不产生副作用

---

## 12. 本地开发环境规范

### 12.1 基础设施

基础设施（PostgreSQL、Redis）通过 Docker 运行，应用服务在本地运行：

```bash
# 启动所有基础设施（PostgreSQL + Redis）
docker-compose up -d

# 查看日志
docker-compose logs -f postgres

# 停止所有基础设施
docker-compose down
```

### 12.2 快捷启动脚本

根目录 `package.json` 提供了快捷启动单个服务开发：

```bash
# 开发模式启动（自动编译监听）
npm run dev:auth      # system-auth-service
npm run dev:metadata  # metadata-service
npm run dev:data      # data-service-service
npm run dev:gateway   # api-gateway
npm run dev:tasks     # task-scheduler-service

# 生产模式启动（编译后运行）
npm run start:auth
npm run start:metadata
npm run start:data
```

这样你可以在不同终端窗口同时启动多个服务进行开发测试。

---

## 🔍 自查清单（提交前检查）

- [ ] 项目结构符合本规范
- [ ] 没有隐式 `any` 类型
- [ ] 所有 DTO 提取到单独 `*.dtos.ts` 文件
- [ ] 每个 DTO 属性都有 `@ApiProperty` 装饰和描述
- [ ] 全局异常过滤器已注册
- [ ] 使用共享 logger，没有 `console.log`（启动日志除外）
- [ ] 全局认证已配置，`@Public()` 正确使用
- [ ] 遵循单点职责认证架构（只有 system-auth-service 做权限决策）
- [ ] 单元测试覆盖核心逻辑，覆盖率 >= 80%
- [ ] 服务设计文档已更新 `doc/services/`
- [ ] 实施计划已创建 `doc/plans/`
- [ ] 重要架构决策已追加到 `doc/DECISIONS.md`

---

## 总结

遵循本规范可以保证：

1. **一致性**：所有服务结构一致，新人容易上手
2. **可维护性**：文档和代码同步，找得到看得懂
3. **可追溯性**：决策有记录，问题好排查
4. **可扩展性**：新增服务复制模板即可，不需要重新设计结构

---

## 13. API 网关规范

### 13.1 网关职责

API 网关是**统一入口**，负责：

- 统一入口，对外暴露单一 API 地址
- 基于路径路由转发到后端微服务
- CORS 处理（浏览器跨域请求）
- `traceId` 生成并透传给后端服务
- 请求日志记录

### 13.2 路由规则

路由基于路径前缀转发：

```
Gateway: http://gateway:port/
  /api/auth/*      → http://system-auth-service:port/*
  /api/metadata/*  → http://metadata-service:port/*
  /api/data/*      → http://data-service:port/*
  /api/tasks/*     → http://task-scheduler:port/*
```

路由规则通过环境变量配置，不硬编码。

### 13.3 traceId 生成

- 请求进入网关时生成 `traceId`（UUID）
- 通过 HTTP 头 `X-Trace-Id` 透传给后端
- 后端服务必须从请求头提取并继续透传给下游
- 所有日志和错误响应必须包含 `traceId`

---

## 总结

遵循本规范可以保证：

1. **一致性**：所有服务结构一致，新人容易上手
2. **可维护性**：文档和代码同步，找得到看得懂
3. **可追溯性**：决策有记录，问题好排查
4. **可扩展性**：新增服务复制模板即可，不需要重新设计结构

> 规范是给大家省力的，不是束缚。有更好的想法，通过 ADR 修改规范。
