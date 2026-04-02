# API Gateway - AIDataHub 统一API网关

## 概述

**API Gateway** 是 AIDataHub 平台的统一入口点，提供：

- 统一的外部访问入口
- 基于路径前缀的路由转发到后端微服务
- 内置 CORS 处理，支持浏览器跨域请求
- 自动 `traceId` 生成和全链路透传
- 请求日志记录（方法、路径、状态码、响应时间）

## 架构

```
 Browser/Client
      ↓
  API Gateway (统一入口)
      ↓
  路由匹配 → 转发到对应后端微服务
      ↓
  [system-auth-service] /metadata-service /data-service-service /task-scheduler-service
```

## 环境变量配置

复制 `.env.example` 为 `.env` 并修改：

```env
# Backend service URLs - point to your running services
AUTH_SERVICE_URL=http://localhost:3000
METADATA_SERVICE_URL=http://localhost:3001
DATA_SERVICE_URL=http://localhost:3002
TASK_SERVICE_URL=http://localhost:3003

# Server port
PORT=3000

# Node environment
NODE_ENV=development
```

## 路由规则

| 网关路径前缀      | 转发目标后端             | 说明           |
| ----------------- | ------------------------ | -------------- |
| `/api/auth/*`     | `AUTH_SERVICE_URL/*`     | 认证权限服务   |
| `/api/metadata/*` | `METADATA_SERVICE_URL/*` | 元数据管理服务 |
| `/api/data/*`     | `DATA_SERVICE_URL/*`     | 数据服务       |
| `/api/tasks/*`    | `TASK_SERVICE_URL/*`     | 任务调度服务   |

- 网关会自动 Stripped 前缀，例如：
  - 客户端请求: `GET /api/auth/users`
  - 转发到: `GET http://auth-service/users`

## 启动

### 开发模式

```bash
npm run dev:gateway
```

### 生产模式

```bash
npm run build
npm run start:gateway
```

### 使用根目录快捷命令

```bash
# 从项目根目录
npm run dev:gateway   # 开发
npm run start:gateway # 生产
```

## 功能特性

### 1. TraceId 透传

- 每个请求进入网关时，如果没有 `X-Trace-Id` 请求头，网关会生成一个新的 UUID 作为 `traceId`
- `traceId` 通过 `X-Trace-Id` 头发送给后端服务
- 所有后端服务应该从请求头提取 `traceId` 并继续透传给下游
- 响应头也包含 `X-Trace-Id`，方便客户端调试

### 2. 请求日志

所有请求自动记录日志，格式：

```
GET /api/auth/health 200 - 2ms - traceId=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

包含：

- HTTP 方法
- 请求路径
- 响应状态码
- 响应时间（ms）
- traceId

### 3. CORS

默认开启 CORS，允许所有来源，支持 credentials：

```typescript
app.enableCors({
  origin: true,
  credentials: true,
});
```

### 4. 健康检查

网关提供内置健康检查端点：

```
GET /health
```

响应示例：

```json
{
  "ok": true,
  "data": {
    "status": "ok"
  }
}
```

## Swagger 文档

网关自带 Swagger UI 文档：

```
http://gateway:port/api/docs
```

## 错误处理

- 路由不匹配：返回 `404 Not Found`
- 后端服务不可用：返回 `503 Service Unavailable` 带有 `Result` 格式：

```json
{
  "ok": false,
  "error": {
    "code": "PROXY_ERROR",
    "message": "Backend service unavailable",
    "level": "ERROR"
  },
  "traceId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

## 开发指南

### 添加新路由

修改 `src/modules/proxy/proxy.config.ts` 中的 `loadRouteConfig()` 函数：

```typescript
if (process.env.NEW_SERVICE_URL) {
  routes.push({
    prefix: '/api/new-service',
    target: process.env.NEW_SERVICE_URL,
    stripPrefix: true,
  });
}
```

### 依赖

- `http-proxy` - HTTP 反向代理
- `@nestjs/core` - NestJS 框架
- `@nestjs/platform-fastify` - Fastify HTTP 适配器

## 验收标准

✓ 统一入口，路由转发正常工作  
✓ CORS 已启用  
✓ traceId 生成和透传  
✓ 请求日志记录  
✓ 健康检查端点  
✓ Swagger 文档可访问  
✓ 遵循项目开发规范

## 许可证

MIT
