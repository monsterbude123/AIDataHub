# 架构改进计划：系统重构 + API 网关

## 概述

本次改进解决已发现的系统设计和复用问题，并新增轻量级 API 网关服务：

1. **统一共享基础设施**: 确保 `@ai-datahub/shared` 包含所有服务需要的基础组件（异常基类、日志工具、认证工具）
2. **system-auth-service 重构**: 全局异常处理、日志统一、请求日志、Swagger 文档完善
3. **metadata-service 规范化**: 统一项目结构、添加 JWT 令牌验证、Prisma 持久化存储，对齐 system-auth-service 规范
4. **新建 API 网关**: 统一入口、路由转发、CORS、traceId 透传
5. **制定开发规范**: 为后续服务开发提供准则

## 目标

- 所有异常统一返回 `Result<T>` 格式，包含 traceId
- 全服务统一使用 `@ai-datahub/shared` 的结构化日志
- 完整的 Swagger 文档可在线浏览和调试
- 所有服务通过网关统一入口访问
- 端到端 traceId 贯穿

## 实施阶段

### 阶段 1：统一共享基础设施

**预计耗时**: 30 分钟

| 步骤 | 任务                                                                  |
| ---- | --------------------------------------------------------------------- |
| 1.1  | 检查 `@ai-datahub/shared` 导出完整性                                  |
| 1.2  | 补充缺失的导出（异常基类、日志工具、JWT 认证工具、`ErrorLevel` 类型） |
| 1.3  | 运行构建验证类型正确                                                  |

### 阶段 2：重构 system-auth-service

**预计耗时**: 2-3 小时

| 步骤 | 任务                                   | 目标文件                                                                          |
| ---- | -------------------------------------- | --------------------------------------------------------------------------------- |
| 2.1  | 创建全局异常过滤器                     | `services/system-auth-service/src/common/filters/global-exception.filter.ts`      |
| 2.2  | 创建请求日志中间件                     | `services/system-auth-service/src/common/middleware/request-logger.middleware.ts` |
| 2.3  | 更新 main.ts 使用共享 logger           | `services/system-auth-service/src/main.ts`                                        |
| 2.4  | 更新 AppModule 注册过滤器和中间件      | `services/system-auth-service/src/AppModule.ts`                                   |
| 2.5  | 提取所有 DTO 类到单独文件              | `services/system-auth-service/src/modules/**/*.dto.ts`                            |
| 2.6  | 为 DTO 添加 `@ApiProperty` 装饰        | 同上                                                                              |
| 2.7  | 清理残留 `console.log`（启动日志除外） | 各模块                                                                            |

### 阶段 3：metadata-service 结构规范化

**预计耗时**: 2-3 小时

目标：对齐 `system-auth-service` 架构规范，消除实现差异。
**架构原则**: `system-auth-service` 是唯一的**完整认证权限服务**，其他服务只做 JWT 令牌验证，权限决策由 `system-auth-service` 统一处理。

| 步骤  | 任务                                                    | 目标文件                                                       |
| ----- | ------------------------------------------------------- | -------------------------------------------------------------- |
| 3.1   | 创建 `common/` 目录结构                                 | `services/metadata-service/src/common/`                        |
| 3.2   | 添加 `common/errors/` 自定义异常                        | `services/metadata-service/src/common/errors/`                 |
| 3.3   | 添加 `common/database/` Prisma 模块（复用 shared 模板） | `services/metadata-service/src/common/database/`               |
| 3.4   | 添加 JWT 令牌验证守卫                                   | 从 `@ai-datahub/shared` 导入复用，不需要重复实现               |
| 3.5   | 拆分单模块为多领域模块                                  |                                                                |
| 3.5.1 | `modules/data-source/` - 数据源连接管理                 | `services/metadata-service/src/modules/data-source/`           |
| 3.5.2 | `modules/data-asset/` - 数据资产管理                    | `services/metadata-service/src/modules/data-asset/`            |
| 3.5.3 | `modules/metadata-collection/` - 元数据采集             | `services/metadata-service/src/modules/metadata-collection/`   |
| 3.5.4 | `modules/metadata-version/` - 版本管理                  | `services/metadata-service/src/modules/metadata-version/`      |
| 3.6   | 保留 `connectors/` - 数据库连接器工厂                   | `services/metadata-service/src/connectors/` (保持现有位置不变) |
| 3.7   | 添加 Prisma schema 定义                                 | `prisma/schema.prisma`                                         |
| 3.8   | 替换内存仓库为 Prisma 持久化                            | 各模块                                                         |
| 3.9   | 提取 DTO 到单独文件并添加 Swagger 装饰器                | `modules/**/*.dto.ts`                                          |
| 3.10  | 补充单元测试                                            | `test/`                                                        |

### 阶段 4：创建轻量级 API 网关

**预计耗时**: 2-3 小时

依赖: 需要添加 `http-proxy` 和 `@types/http-proxy` 到 package.json

| 步骤 | 任务                                                  | 目标文件                                                                  |
| ---- | ----------------------------------------------------- | ------------------------------------------------------------------------- |
| 4.1  | 创建项目基础结构                                      | `services/api-gateway/`                                                   |
| 4.2  | 配置文件 (package.json, tsconfig.json, nest-cli.json) | `services/api-gateway/`                                                   |
| 4.3  | 启用 CORS 支持                                        | `main.ts` 配置                                                            |
| 4.4  | 实现基于路径的路由转发                                | `services/api-gateway/src/modules/proxy/proxy.service.ts`                 |
| 4.5  | traceId 生成和透传中间件                              | `services/api-gateway/src/common/middleware/trace-id.middleware.ts`       |
| 4.6  | 请求日志中间件                                        | `services/api-gateway/src/common/middleware/request-logger.middleware.ts` |
| 4.7  | 健康检查控制器                                        | `services/api-gateway/src/controllers/HealthController.ts`                |
| 4.8  | 主程序入口和 Swagger 配置                             | `services/api-gateway/src/main.ts`                                        |
| 4.9  | AppModule 根模块                                      | `services/api-gateway/src/AppModule.ts`                                   |
| 4.10 | 基础 E2E 测试                                         | `services/api-gateway/test/`                                              |

### 阶段 5：编写开发规范

**预计耗时**: 30 分钟

| 步骤 | 任务                                                 | 位置                            |
| ---- | ---------------------------------------------------- | ------------------------------- |
| 5.1  | 创建开发规范文档                                     | `doc/DEVELOPMENT-GUIDELINES.md` |
| 5.2  | 定义项目结构、错误处理、日志、文档约定、认证架构原则 | -                               |

## 技术细节

### 全局异常过滤器输出格式

```typescript
// 统一输出格式（符合 Result<T> 契约）
{
  success: boolean,
  data?: T,
  error?: {
    code: string,
    message: string,
    level: ErrorLevel
  },
  traceId: string
}
```

### API 网关路由规则

```
Gateway: http://gateway:port/
  /api/auth/* → http://system-auth-service:3000/*
  /api/data/* → http://data-service:port/*
  /api/metadata/* → http://metadata-service:port/*
```

配置可通过环境变量配置后端服务地址。

### 依赖

- 网关使用 `http-proxy` 包做反向代理
- 所有共享基础设施来自 `@ai-datahub/shared`

## 风险评估

| 风险                      | 等级   | 缓解措施                                   |
| ------------------------- | ------ | ------------------------------------------ |
| DTO 提取工作量较大        | MEDIUM | 模式统一，需要逐个模块处理，工作量比预期大 |
| metadata-service 模块拆分 | MEDIUM | 需要移动现有代码，测试保证功能不丢         |
| 网关流式转发              | LOW    | http-proxy 已原生支持                      |
| Swagger 装饰逐个添加      | MEDIUM | 机械重复，不复杂但耗时                     |

## 总体复杂度评估

**总体复杂度**: MEDIUM

**总计预计**: 7-10 小时

## 架构原则澄清

### 认证授权架构

- **单点职责**: `system-auth-service` 是唯一的**完整认证权限服务**，负责：
  - 用户登录/登出、JWT 签发
  - 组织/角色/权限/用户管理
  - RBAC/ACL 权限决策
- **其他服务职责**: 只做 JWT 令牌签名验证，从 token 中提取用户信息，不负责权限决策
- **权限检查流程**: 服务接收到请求 → 验证 JWT 令牌 → 调用 `system-auth-service` 检查当前用户对资源是否有权限 → 执行业务逻辑

这避免了重复实现认证逻辑，保证权限规则一致性。

## 验收标准

1. ✅ system-auth-service 所有异常返回统一格式，包含 traceId
2. ✅ 所有请求自动记录日志（方法、路径、状态码、响应时间）
3. ✅ Swagger UI 可浏览完整 API，包含参数说明和响应示例
4. ✅ metadata-service 按领域拆分为多模块，结构对齐 system-auth-service
5. ✅ metadata-service 启用 JWT 认证，所有端点受保护
6. ✅ metadata-service 使用 Prisma 持久化存储，替换内存仓库
7. ✅ API 网关能正确路由到各个后端服务
8. ✅ traceId 从网关到后端服务全程透传
9. ✅ 开发规范文档清晰说明新项目该如何遵循现有模式
