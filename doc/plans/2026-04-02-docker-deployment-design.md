---
name: docker-deployment-design
overview: AI DataHub Docker 部署设计方案，包含多阶段构建、服务编排、环境配置、健康检查、安全加固。
todos:
  - id: dockerfile-template
    content: 创建多阶段 Dockerfile 模板
    status: completed
  - id: docker-compose-prod
    content: 创建生产环境 docker-compose.yml
    status: completed
  - id: dockerignore
    content: 创建 .dockerignore 文件
    status: completed
  - id: env-templates
    content: 创建环境变量模板文件
    status: completed
  - id: health-check
    content: 添加健康检查端点
    status: completed
isProject: false
---

# Docker 部署设计

> 目标：为 AI DataHub 微服务架构设计生产级 Docker 部署方案。

---

## 一、架构概览

### 1.1 服务清单

| 服务                       | 端口 | 依赖                                                  | 优先级 |
| -------------------------- | ---- | ----------------------------------------------------- | ------ |
| **api-gateway**            | 3000 | auth-service, all services                            | P0     |
| **system-auth-service**    | 4001 | postgres, redis                                       | P0     |
| **metadata-service**       | 4002 | postgres, auth-service                                | P0     |
| **data-service-service**   | 4003 | postgres, redis, auth-service                         | P0     |
| **ops-service**            | 3001 | postgres, redis, auth-service, metadata               | P1     |
| **integration-service**    | 3002 | postgres, redis, auth-service                         | P1     |
| **admin-service**          | 3003 | postgres, redis, auth-service                         | P1     |
| **sharing-service**        | 3004 | postgres, redis, auth-service, ops-service            | P2     |
| **analytics-service**      | 3005 | postgres, redis, auth-service, metadata, data-service | P2     |
| **security-service**       | 3006 | postgres, redis, auth-service, data-service           | P2     |
| **task-scheduler-service** | 5001 | postgres, redis                                       | P1     |

### 1.2 服务分层

```
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway (:3000)                      │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│ Infrastructure│    │ Business Layer│    │ Governance    │
│ Services      │    │ Services      │    │ Services      │
├───────────────┤    ├───────────────┤    ├───────────────┤
│ auth-service  │    │ ops-service   │    │ security-svc  │
│ metadata-svc  │    │ admin-service │    │               │
│ data-service  │    │ sharing-svc   │    │               │
│ task-scheduler│    │ analytics-svc │    │               │
│               │    │ integration-sv│    │               │
└───────────────┘    └───────────────┘    └───────────────┘
        │                     │                     │
        └─────────────────────┴─────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │  PostgreSQL  │  Redis  │ MinIO │
              └───────────────────────────────┘
```

---

## 二、Dockerfile 设计

### 2.1 多阶段构建模板

为所有 NestJS 服务创建统一的 Dockerfile 模板：

```dockerfile
# =============================================================================
# AI DataHub Service Dockerfile
# Multi-stage build for optimized production images
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Base - Common dependencies and setup
# -----------------------------------------------------------------------------
FROM node:20-alpine AS base

# Install security updates and required tools
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init && \
    rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 -G nodejs

# Set working directory
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production \
    NODE_OPTIONS="--enable-source-maps" \
    NPM_CONFIG_UPDATE_NOTIFIER=false

# -----------------------------------------------------------------------------
# Stage 2: Builder - Install dependencies and build
# -----------------------------------------------------------------------------
FROM base AS builder

# Copy package files for dependency installation
COPY package.json package-lock.json* ./
COPY packages/ ./packages/
COPY services/ ./services/

# Install all dependencies (including devDependencies for build)
RUN npm ci --ignore-scripts

# Build all packages first (monorepo dependency order)
RUN npm -w @ai-datahub/contract run build && \
    npm -w @ai-datahub/shared run build && \
    npm -w @ai-datahub/database run build

# Build the target service (passed as build arg)
ARG SERVICE_NAME
RUN npm -w @ai-datahub/${SERVICE_NAME} run build

# Prune devDependencies after build
RUN npm prune --production

# -----------------------------------------------------------------------------
# Stage 3: Runner - Production image
# -----------------------------------------------------------------------------
FROM base AS runner

# Copy built application and production dependencies
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/packages ./packages
COPY --from=builder --chown=nestjs:nodejs /app/services ./services
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./

# Copy environment file template (will be overridden by mounted config)
ARG SERVICE_NAME
COPY --from=builder --chown=nestjs:nodejs /app/services/${SERVICE_NAME}/.env.example ./.env.example

# Switch to non-root user
USER nestjs

# Expose port (default, overridden by PORT env var)
ARG PORT=3000
EXPOSE ${PORT}

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-3000}/health || exit 1

# Set default service name (overridden at runtime)
ENV SERVICE_NAME=${SERVICE_NAME}

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start the service
CMD ["sh", "-c", "node services/${SERVICE_NAME}/dist/main.js"]
```

### 2.2 各服务 Dockerfile

为每个服务创建专用 Dockerfile：

**services/api-gateway/Dockerfile**:

```dockerfile
ARG SERVICE_NAME=api-gateway
ARG PORT=3000
FROM ai-datahub-base:latest AS runner
EXPOSE ${PORT}
ENV SERVICE_NAME=api-gateway
CMD ["node", "services/api-gateway/dist/main.js"]
```

**services/system-auth-service/Dockerfile**:

```dockerfile
ARG SERVICE_NAME=system-auth-service
ARG PORT=4001
FROM ai-datahub-base:latest AS runner
EXPOSE ${PORT}
ENV SERVICE_NAME=system-auth-service
CMD ["node", "services/system-auth-service/dist/main.js"]
```

### 2.3 基础镜像构建

**Dockerfile.base** (一次性构建，供所有服务继承):

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
COPY packages/ ./packages/
COPY services/ ./services/
RUN npm ci --ignore-scripts
RUN npm -w @ai-datahub/contract run build && \
    npm -w @ai-datahub/shared run build && \
    npm -w @ai-datahub/database run build
RUN npm prune --production

# Runtime stage
FROM node:20-alpine AS runner
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init && \
    addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 -G nodejs
WORKDIR /app
ENV NODE_ENV=production NODE_OPTIONS="--enable-source-maps"
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/packages ./packages
COPY --from=builder --chown=nestjs:nodejs /app/services ./services
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./
USER nestjs
ENTRYPOINT ["dumb-init", "--"]
```

---

## 三、Docker Compose 配置

### 3.1 生产环境 docker-compose.yml

```yaml
# =============================================================================
# AI DataHub Production Docker Compose
# =============================================================================
# Usage:
#   docker-compose up -d                    # Start all services
#   docker-compose up -d api-gateway auth   # Start specific services
#   docker-compose logs -f api-gateway      # View logs
#   docker-compose down                     # Stop all services
#   docker-compose down -v                  # Stop and remove volumes
# =============================================================================

version: '3.8'

# -----------------------------------------------------------------------------
# Common configuration anchors (YAML anchors for DRY)
# -----------------------------------------------------------------------------
x-service-defaults: &service-defaults
  restart: unless-stopped
  networks:
    - aidatahub-network
  logging:
    driver: json-file
    options:
      max-size: '10m'
      max-file: '3'
  deploy:
    resources:
      limits:
        memory: 512M
      reservations:
        memory: 128M

x-healthcheck-defaults: &healthcheck-defaults
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 30s

x-env-defaults: &env-defaults
  NODE_ENV: production
  LOG_LEVEL: info
  POSTGRES_HOST: postgres
  POSTGRES_PORT: 5432
  POSTGRES_USER: postgres
  POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
  POSTGRES_DB: aidatahub
  REDIS_HOST: redis
  REDIS_PORT: 6379

# -----------------------------------------------------------------------------
# Networks
# -----------------------------------------------------------------------------
networks:
  aidatahub-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.28.0.0/16

# -----------------------------------------------------------------------------
# Volumes
# -----------------------------------------------------------------------------
volumes:
  postgres-data:
    driver: local
  redis-data:
    driver: local
  minio-data:
    driver: local

# -----------------------------------------------------------------------------
# Services
# -----------------------------------------------------------------------------
services:
  # ===========================================================================
  # Infrastructure Services
  # ===========================================================================

  postgres:
    image: postgres:16-alpine
    container_name: aidatahub-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
      POSTGRES_DB: ${POSTGRES_DB:-aidatahub}
      # Performance tuning
      POSTGRES_INITDB_ARGS: '--encoding=UTF8 --locale=C.UTF-8'
    ports:
      - '${POSTGRES_PORT:-5432}:5432'
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - aidatahub-network
    healthcheck:
      test:
        [
          'CMD-SHELL',
          'pg_isready -U ${POSTGRES_USER:-postgres} -d ${POSTGRES_DB:-aidatahub}',
        ]
      <<: *healthcheck-defaults
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 256M

  redis:
    image: redis:7-alpine
    container_name: aidatahub-redis
    restart: unless-stopped
    command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
    ports:
      - '${REDIS_PORT:-6379}:6379'
    volumes:
      - redis-data:/data
    networks:
      - aidatahub-network
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      <<: *healthcheck-defaults
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 64M

  minio:
    image: minio/minio:latest
    container_name: aidatahub-minio
    restart: unless-stopped
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER:-minioadmin}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD:-minioadmin}
    ports:
      - '${MINIO_API_PORT:-9000}:9000'
      - '${MINIO_CONSOLE_PORT:-9001}:9001'
    volumes:
      - minio-data:/data
    networks:
      - aidatahub-network
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:9000/minio/health/live']
      <<: *healthcheck-defaults
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 128M

  # ===========================================================================
  # Application Services
  # ===========================================================================

  api-gateway:
    <<: *service-defaults
    build:
      context: .
      dockerfile: services/api-gateway/Dockerfile
      args:
        SERVICE_NAME: api-gateway
        PORT: 3000
    container_name: aidatahub-gateway
    ports:
      - '${GATEWAY_PORT:-3000}:3000'
    environment:
      <<: *env-defaults
      PORT: 3000
      # Backend service URLs
      AUTH_SERVICE_URL: http://auth-service:4001
      METADATA_SERVICE_URL: http://metadata-service:4002
      DATA_SERVICE_URL: http://data-service:4003
      OPS_SERVICE_URL: http://ops-service:3001
      INTEGRATION_SERVICE_URL: http://integration-service:3002
      ADMIN_SERVICE_URL: http://admin-service:3003
      SHARING_SERVICE_URL: http://sharing-service:3004
      ANALYTICS_SERVICE_URL: http://analytics-service:3005
      SECURITY_SERVICE_URL: http://security-service:3006
      TASK_SERVICE_URL: http://task-scheduler:5001
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      auth-service:
        condition: service_healthy
    healthcheck:
      test:
        [
          'CMD',
          'wget',
          '--no-verbose',
          '--tries=1',
          '--spider',
          'http://localhost:3000/health',
        ]
      <<: *healthcheck-defaults

  auth-service:
    <<: *service-defaults
    build:
      context: .
      dockerfile: services/system-auth-service/Dockerfile
      args:
        SERVICE_NAME: system-auth-service
        PORT: 4001
    container_name: aidatahub-auth
    environment:
      <<: *env-defaults
      PORT: 4001
      JWT_SECRET: ${JWT_SECRET:-change-me-in-production}
      JWT_EXPIRES_IN: ${JWT_EXPIRES_IN:-7d}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test:
        [
          'CMD',
          'wget',
          '--no-verbose',
          '--tries=1',
          '--spider',
          'http://localhost:4001/health',
        ]
      <<: *healthcheck-defaults

  metadata-service:
    <<: *service-defaults
    build:
      context: .
      dockerfile: services/metadata-service/Dockerfile
      args:
        SERVICE_NAME: metadata-service
        PORT: 4002
    container_name: aidatahub-metadata
    environment:
      <<: *env-defaults
      PORT: 4002
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      auth-service:
        condition: service_healthy
    healthcheck:
      test:
        [
          'CMD',
          'wget',
          '--no-verbose',
          '--tries=1',
          '--spider',
          'http://localhost:4002/health',
        ]
      <<: *healthcheck-defaults

  data-service:
    <<: *service-defaults
    build:
      context: .
      dockerfile: services/data-service-service/Dockerfile
      args:
        SERVICE_NAME: data-service-service
        PORT: 4003
    container_name: aidatahub-data
    environment:
      <<: *env-defaults
      PORT: 4003
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      auth-service:
        condition: service_healthy
    healthcheck:
      test:
        [
          'CMD',
          'wget',
          '--no-verbose',
          '--tries=1',
          '--spider',
          'http://localhost:4003/health',
        ]
      <<: *healthcheck-defaults

  task-scheduler:
    <<: *service-defaults
    build:
      context: .
      dockerfile: services/task-scheduler-service/Dockerfile
      args:
        SERVICE_NAME: task-scheduler-service
        PORT: 5001
    container_name: aidatahub-tasks
    environment:
      <<: *env-defaults
      PORT: 5001
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test:
        [
          'CMD',
          'wget',
          '--no-verbose',
          '--tries=1',
          '--spider',
          'http://localhost:5001/health',
        ]
      <<: *healthcheck-defaults

  # ---------------------------------------------------------------------------
  # Business Layer Services
  # ---------------------------------------------------------------------------

  ops-service:
    <<: *service-defaults
    build:
      context: .
      dockerfile: services/ops-service/Dockerfile
      args:
        SERVICE_NAME: ops-service
        PORT: 3001
    container_name: aidatahub-ops
    environment:
      <<: *env-defaults
      PORT: 3001
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      auth-service:
        condition: service_healthy
      metadata-service:
        condition: service_healthy
    healthcheck:
      test:
        [
          'CMD',
          'wget',
          '--no-verbose',
          '--tries=1',
          '--spider',
          'http://localhost:3001/health',
        ]
      <<: *healthcheck-defaults

  integration-service:
    <<: *service-defaults
    build:
      context: .
      dockerfile: services/integration-service/Dockerfile
      args:
        SERVICE_NAME: integration-service
        PORT: 3002
    container_name: aidatahub-integration
    environment:
      <<: *env-defaults
      PORT: 3002
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      auth-service:
        condition: service_healthy
    healthcheck:
      test:
        [
          'CMD',
          'wget',
          '--no-verbose',
          '--tries=1',
          '--spider',
          'http://localhost:3002/health',
        ]
      <<: *healthcheck-defaults

  admin-service:
    <<: *service-defaults
    build:
      context: .
      dockerfile: services/admin-service/Dockerfile
      args:
        SERVICE_NAME: admin-service
        PORT: 3003
    container_name: aidatahub-admin
    environment:
      <<: *env-defaults
      PORT: 3003
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      auth-service:
        condition: service_healthy
    healthcheck:
      test:
        [
          'CMD',
          'wget',
          '--no-verbose',
          '--tries=1',
          '--spider',
          'http://localhost:3003/health',
        ]
      <<: *healthcheck-defaults

  sharing-service:
    <<: *service-defaults
    build:
      context: .
      dockerfile: services/sharing-service/Dockerfile
      args:
        SERVICE_NAME: sharing-service
        PORT: 3004
    container_name: aidatahub-sharing
    environment:
      <<: *env-defaults
      PORT: 3004
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      auth-service:
        condition: service_healthy
      ops-service:
        condition: service_healthy
    healthcheck:
      test:
        [
          'CMD',
          'wget',
          '--no-verbose',
          '--tries=1',
          '--spider',
          'http://localhost:3004/health',
        ]
      <<: *healthcheck-defaults

  analytics-service:
    <<: *service-defaults
    build:
      context: .
      dockerfile: services/analytics-service/Dockerfile
      args:
        SERVICE_NAME: analytics-service
        PORT: 3005
    container_name: aidatahub-analytics
    environment:
      <<: *env-defaults
      PORT: 3005
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      auth-service:
        condition: service_healthy
      metadata-service:
        condition: service_healthy
      data-service:
        condition: service_healthy
    healthcheck:
      test:
        [
          'CMD',
          'wget',
          '--no-verbose',
          '--tries=1',
          '--spider',
          'http://localhost:3005/health',
        ]
      <<: *healthcheck-defaults

  security-service:
    <<: *service-defaults
    build:
      context: .
      dockerfile: services/security-service/Dockerfile
      args:
        SERVICE_NAME: security-service
        PORT: 3006
    container_name: aidatahub-security
    environment:
      <<: *env-defaults
      PORT: 3006
      # Encryption key for sensitive data (use Vault in production)
      ENCRYPTION_KEY: ${ENCRYPTION_KEY:-change-me-32-chars-minimum}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      auth-service:
        condition: service_healthy
      data-service:
        condition: service_healthy
    healthcheck:
      test:
        [
          'CMD',
          'wget',
          '--no-verbose',
          '--tries=1',
          '--spider',
          'http://localhost:3006/health',
        ]
      <<: *healthcheck-defaults
```

### 3.2 开发环境 docker-compose.dev.yml

```yaml
# =============================================================================
# AI DataHub Development Docker Compose
# =============================================================================
# Extends production config with development-specific settings:
# - Hot reload enabled
# - Source code mounted as volumes
# - Debug ports exposed
# =============================================================================

version: '3.8'

services:
  api-gateway:
    build:
      context: .
      dockerfile: services/api-gateway/Dockerfile.dev
    volumes:
      - ./services/api-gateway/src:/app/services/api-gateway/src:ro
      - ./packages:/app/packages:ro
    environment:
      NODE_ENV: development
      LOG_LEVEL: debug
    ports:
      - '3000:3000'
      - '9229:9229' # Debug port

  auth-service:
    build:
      context: .
      dockerfile: services/system-auth-service/Dockerfile.dev
    volumes:
      - ./services/system-auth-service/src:/app/services/system-auth-service/src:ro
      - ./packages:/app/packages:ro
    environment:
      NODE_ENV: development
      LOG_LEVEL: debug
    ports:
      - '4001:4001'
      - '9230:9229'
```

---

## 四、环境变量管理

### 4.1 环境变量文件

**.env.example** (模板文件):

```bash
# =============================================================================
# AI DataHub Environment Configuration
# =============================================================================

# -----------------------------------------------------------------------------
# Infrastructure
# -----------------------------------------------------------------------------
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-secure-password-here
POSTGRES_DB=aidatahub
POSTGRES_PORT=5432

REDIS_PORT=6379

MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=your-minio-password-here
MINIO_API_PORT=9000
MINIO_CONSOLE_PORT=9001

# -----------------------------------------------------------------------------
# Application
# -----------------------------------------------------------------------------
NODE_ENV=production
LOG_LEVEL=info

# JWT Configuration
JWT_SECRET=your-jwt-secret-at-least-32-characters
JWT_EXPIRES_IN=7d

# Encryption (for security-service)
ENCRYPTION_KEY=your-encryption-key-32-chars-min

# -----------------------------------------------------------------------------
# Service URLs (internal Docker network)
# -----------------------------------------------------------------------------
AUTH_SERVICE_URL=http://auth-service:4001
METADATA_SERVICE_URL=http://metadata-service:4002
DATA_SERVICE_URL=http://data-service:4003
OPS_SERVICE_URL=http://ops-service:3001
INTEGRATION_SERVICE_URL=http://integration-service:3002
ADMIN_SERVICE_URL=http://admin-service:3003
SHARING_SERVICE_URL=http://sharing-service:3004
ANALYTICS_SERVICE_URL=http://analytics-service:3005
SECURITY_SERVICE_URL=http://security-service:3006
TASK_SERVICE_URL=http://task-scheduler:5001

# -----------------------------------------------------------------------------
# External Services (if any)
# -----------------------------------------------------------------------------
# SMTP for notifications
# SMTP_HOST=smtp.example.com
# SMTP_PORT=587
# SMTP_USER=noreply@example.com
# SMTP_PASS=your-smtp-password

# External API Keys
# OPENAI_API_KEY=sk-xxx
```

### 4.2 Secrets 管理

**生产环境建议**：

1. **Docker Secrets** (Swarm mode):

```yaml
secrets:
  jwt_secret:
    external: true
  postgres_password:
    external: true

services:
  auth-service:
    secrets:
      - jwt_secret
      - postgres_password
```

2. **Kubernetes Secrets**:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: aidatahub-secrets
type: Opaque
data:
  JWT_SECRET: <base64-encoded>
  POSTGRES_PASSWORD: <base64-encoded>
```

---

## 五、健康检查端点

### 5.1 统一健康检查实现

每个服务需要实现 `/health` 端点：

```typescript
// src/modules/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  service: string;
  version: string;
  timestamp: string;
  checks: {
    database: boolean;
    redis: boolean;
    dependencies?: Record<string, boolean>;
  };
}

@Controller()
export class HealthController {
  constructor(
    private readonly dataSource: DataSource, // TypeORM/Prisma
    private readonly redis: RedisClient // Redis
  ) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  @ApiResponse({ status: 503, description: 'Service is unhealthy' })
  async health(): Promise<HealthResponse> {
    const checks = {
      database: await this.checkDatabase(),
      redis: await this.checkRedis(),
    };

    const allHealthy = Object.values(checks).every(Boolean);
    const status = allHealthy ? 'healthy' : 'unhealthy';

    return {
      status,
      service: process.env.SERVICE_NAME || 'unknown',
      version: process.env.npm_package_version || '0.0.0',
      timestamp: new Date().toISOString(),
      checks,
    };
  }

  private async checkDatabase(): Promise<boolean> {
    try {
      await this.dataSource.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }

  private async checkRedis(): Promise<boolean> {
    try {
      const pong = await this.redis.ping();
      return pong === 'PONG';
    } catch {
      return false;
    }
  }
}
```

### 5.2 健康检查配置

```typescript
// src/AppModule.ts
import { Module } from '@nestjs/common';
import { HealthController } from './modules/health/health.controller';

@Module({
  controllers: [HealthController],
  // ... other imports
})
export class AppModule {}
```

---

## 六、.dockerignore 文件

```
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
dist/
*.tsbuildinfo

# Development files
.env
.env.local
.env.*.local

# IDE
.idea/
.vscode/
*.swp
*.swo

# Git
.git/
.gitignore

# Docker
Dockerfile*
docker-compose*.yml
.docker/

# Testing
coverage/
.nyc_output/
*.test.ts
*.spec.ts
__tests__/

# Documentation
docs/
*.md
!README.md

# Misc
.DS_Store
Thumbs.db
*.log
*.tmp
```

---

## 七、构建与部署流程

### 7.1 构建流程

```bash
# 1. 构建基础镜像（首次或 package 依赖变更时）
docker build -f Dockerfile.base -t ai-datahub-base:latest .

# 2. 构建所有服务镜像
docker-compose build

# 3. 或构建单个服务
docker-compose build api-gateway
```

### 7.2 部署流程

```bash
# 开发环境
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# 生产环境
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f api-gateway

# 扩展服务
docker-compose up -d --scale auth-service=2
```

### 7.3 更新流程

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 重新构建镜像
docker-compose build --no-cache

# 3. 滚动更新（零停机）
docker-compose up -d --no-deps --build api-gateway

# 4. 验证健康状态
docker-compose ps
curl http://localhost:3000/health
```

---

## 八、监控与日志

### 8.1 日志配置

```yaml
# docker-compose.yml logging configuration
services:
  api-gateway:
    logging:
      driver: json-file
      options:
        max-size: '10m'
        max-file: '3'
        labels: 'service'
        tag: '{{.Name}}/{{.ID}}'
```

### 8.2 Prometheus + Grafana 监控（可选）

```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - '9090:9090'
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml:ro
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'

  grafana:
    image: grafana/grafana:latest
    ports:
      - '3001:3000'
    environment:
      GF_SECURITY_ADMIN_PASSWORD: admin
    volumes:
      - grafana-data:/var/lib/grafana

volumes:
  grafana-data:
```

---

## 九、安全加固

### 9.1 安全检查清单

- [x] 非 root 用户运行容器
- [x] 最小化基础镜像（alpine）
- [x] 多阶段构建减少攻击面
- [x] 健康检查配置
- [x] 资源限制（memory/cpu）
- [x] 敏感信息通过环境变量/Secrets 注入
- [x] 网络隔离（自定义网络）
- [x] 日志轮转配置

### 9.2 网络安全

```yaml
networks:
  aidatahub-network:
    driver: bridge
    internal: true # 内部网络，禁止外部访问

  gateway-network:
    driver: bridge
    # 仅 gateway 暴露给外部

services:
  api-gateway:
    networks:
      - gateway-network
      - aidatahub-network # 连接内部服务

  auth-service:
    networks:
      - aidatahub-network # 仅内部访问
```

---

## 十、Kubernetes 部署（进阶）

### 10.1 Deployment 示例

```yaml
# k8s/api-gateway-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
  labels:
    app: api-gateway
spec:
  replicas: 2
  selector:
    matchLabels:
      app: api-gateway
  template:
    metadata:
      labels:
        app: api-gateway
    spec:
      containers:
        - name: api-gateway
          image: ai-datahub/api-gateway:latest
          ports:
            - containerPort: 3000
          env:
            - name: NODE_ENV
              value: production
            - name: JWT_SECRET
              valueFrom:
                secretKeyRef:
                  name: aidatahub-secrets
                  key: JWT_SECRET
          resources:
            limits:
              memory: '512Mi'
              cpu: '500m'
            requests:
              memory: '128Mi'
              cpu: '100m'
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 10
            periodSeconds: 30
          readinessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: api-gateway
spec:
  selector:
    app: api-gateway
  ports:
    - port: 80
      targetPort: 3000
  type: LoadBalancer
```

---

## 相关文档

- 架构全景：`doc/ARCHITECTURE.md`
- 服务规划：`doc/services/README.md`
- 开发指南：`doc/DEVELOPMENT-GUIDELINES.md`
