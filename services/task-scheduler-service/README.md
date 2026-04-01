# task-scheduler-service

> 统一任务调度中心

## 概述

`task-scheduler-service` 是 AI DataHub 的统一任务调度服务，负责：

- DAG 编排与调度
- 任务状态管理
- 队列与优先级管理
- 执行日志中心

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

服务将在 `http://localhost:3003` 启动（默认端口）。

### 构建检查

```bash
npm run build:check
```

### 运行测试

```bash
npm run test
```

## API 端点

| 方法 | 路径                | 描述       |
| ---- | ------------------- | ---------- |
| GET  | `/health`           | 健康检查   |
| GET  | `/scheduler/status` | 调度器状态 |

## 模块结构

```
src/
├── main.ts                    # 入口文件
├── AppModule.ts               # 根模块
├── controllers/
│   └── HealthController.ts    # 健康检查控制器
└── modules/
    └── scheduler/
        ├── scheduler.module.ts        # 调度模块
        ├── scheduler.controller.ts    # 调度控制器
        ├── scheduler.service.ts       # 调度服务
        ├── entities/
        │   ├── task.entity.ts         # 任务实体
        │   ├── task-execution.entity.ts # 执行实体
        │   ├── dag.entity.ts          # DAG 实体
        │   └── queue.entity.ts        # 队列实体
        └── repositories/
            ├── task.repository.ts     # 任务仓储
            └── task-execution.repository.ts # 执行仓储
```

## 核心概念

### 任务（Task）

任务是调度的基本单元，包含：

- `id`: 任务唯一标识
- `name`: 任务名称
- `module`: 所属模块（如 data-integration, metadata）
- `type`: 任务类型（ONE_TIME, SCHEDULED, EVENT_DRIVEN）
- `status`: 任务状态（READY, RUNNING, PAUSED, DISABLED）
- `cronExpression`: Cron 表达式（定时任务）
- `config`: 任务配置
- `priority`: 优先级
- `retryPolicy`: 重试策略

### 任务执行（TaskExecution）

任务执行记录，包含：

- `id`: 执行 ID
- `taskId`: 关联任务 ID
- `status`: 执行状态（PENDING, READY, RUNNING, SUCCESS, FAILED, CANCELED）
- `triggerType`: 触发类型（MANUAL, SCHEDULED, EVENT）
- `startedAt`: 开始时间
- `endedAt`: 结束时间
- `durationMs`: 执行时长
- `errorMessage`: 错误信息
- `retryCount`: 重试次数

### DAG（有向无环图）

用于定义任务依赖关系：

- `id`: DAG ID
- `name`: DAG 名称
- `nodes`: 节点列表
  - `nodeId`: 节点 ID
  - `taskId`: 关联任务 ID
  - `dependsOn`: 依赖节点列表

### 队列（Queue）

任务队列管理：

- `id`: 队列 ID
- `name`: 队列名称
- `priority`: 优先级
- `resourceIsolationKey`: 资源隔离键

## 状态机

任务执行状态流转：

```
PENDING → READY → RUNNING → SUCCESS/FAILED
                ↓
              RETRY → RUNNING
```

## MVP 功能

- [x] 手动触发任务
- [x] 任务状态管理
- [x] 失败重试策略
- [x] 按优先级调度
- [ ] Cron 定时调度
- [ ] DAG 依赖解析
- [ ] 队列管理

## 依赖

- `@ai-datahub/contract`: 契约定义
- `@ai-datahub/shared`: 共享基础设施（traceId、错误映射）
- `@nestjs/common`: NestJS 核心
- `@nestjs/schedule`: Cron 调度（待集成）

## 环境变量

| 变量名 | 默认值 | 描述     |
| ------ | ------ | -------- |
| `PORT` | `3003` | 服务端口 |

## 测试覆盖率

运行测试覆盖率报告：

```bash
npm run test -- --coverage
```

目标：80%+ 覆盖率

## 相关文档

- [SDK 集成指南](./task-scheduler-sdk-integration.md)
- [API 契约](../../packages/contract/src/modules/task-scheduler.ts)
