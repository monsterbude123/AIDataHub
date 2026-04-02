# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 目录定位

本目录 (`doc/ui`) 是 AIDataHub 数据中台的前端 UI 设计文档目录，包含：

- 设计系统规范（颜色、字体、布局、交互）
- 11 个功能模块共 32 个页面的详细设计文档
- Next.js 前端开发技能、规则、Agent 配置

## 前端技术栈

| Technology     | Version           | 用途                      |
| -------------- | ----------------- | ------------------------- |
| Next.js        | 14.x (App Router) | 核心全栈框架，SSR/SSG/ISR |
| React          | 18.x              | 函数式组件 + Hooks        |
| TypeScript     | 5.x               | 强制类型安全，禁止 `any`  |
| Tailwind CSS   | 3.x               | 原子化样式                |
| TanStack Query | 5.x               | 服务端数据缓存管理        |
| Zod            | 3.x               | 运行时数据校验            |
| Jest + RTL     | 29.x + 14.x       | 单元测试                  |
| Playwright     | 1.40.x            | E2E 测试                  |
| Lucide React   | 0.29x             | 图标库                    |

## 设计系统架构

采用 **MASTER + Overrides** 层级模式：

```
docs/design-system/
├── MASTER.md              # 全局设计规范（颜色、字体、布局、交互）
└── pages/modules/         # 模块级页面设计（可覆盖 MASTER 规则）
    ├── data-integration/  # 数据集成（5 页面）
    ├── data-service/      # 数据服务（4 页面）
    ├── governance/        # 数据治理（6 页面）
    └── ...                # 共 11 模块、32 页面
```

**使用方式**：全局规范看 MASTER.md，具体页面看对应模块目录。

## 核心开发铁则

1. **类型安全强制**：全项目 TypeScript，禁止 `any`
2. **App Router 优先**：新功能必须用 App Router，禁止 Pages Router
3. **服务端组件默认**：仅交互/浏览器 API 时才用客户端组件
4. **状态分离**：服务端数据由 TanStack Query 管理，禁止存全局状态
5. **单一职责**：单文件不超过 500 行
6. **成熟方案优先**：用 Next.js 原生能力，不自建已有功能

## 前端项目目录结构（目标）

```
app/
├── (routes)/
│   ├── (public)/    # 无需认证
│   └── (private)/   # 需要认证
├── api/             # API Routes
components/
├── ui/              # 基础 UI（无业务）
├── layout/          # 布局组件
├── features/        # 业务通用组件
services/
├── api/             # 接口封装
├── hooks/           # 数据请求 Hooks
lib/                 # 工具、第三方初始化
hooks/               # 全局 Hooks
store/               # 仅客户端全局状态
types/               # 全局类型
constants/           # 全局常量
```

## 关键设计规范摘要

### 色彩

| 角色       | Hex     |
| ---------- | ------- |
| Primary    | #2563EB |
| Success    | #10B981 |
| Warning    | #F59E0B |
| Error      | #EF4444 |
| Processing | #3B82F6 |

### 布局

- **侧边导航**: 240px
- **顶部导航**: 64px
- **最大容器宽度**: 1400px
- **间距基数**: 4px

### Z-Index 尺度

| 层级           | z-index |
| -------------- | ------- |
| Dropdown       | 10      |
| Sticky Header  | 20      |
| Modal Backdrop | 30      |
| Modal Content  | 40      |
| Toast          | 50      |

禁止随意使用大 z-index 值。

### 图表选型

| 数据类型    | 推荐图表       |
| ----------- | -------------- |
| KPI vs 目标 | Bullet / Gauge |
| 状态分布    | Pie / Donut    |
| 时间趋势    | Line / Area    |
| TOP 排名    | 横向 Bar       |
| 数据血缘    | React-Flow DAG |

## 测试要求

- 核心业务覆盖率 ≥ 80%
- 基础 UI 覆盖率 ≥ 70%
- 基于用户行为测试，不测实现细节

## 提交规范

遵循 Conventional Commits：

```
<type>(<scope>): <subject>
```

类型：`feat` | `fix` | `docs` | `style` | `refactor` | `perf` | `test` | `chore`

提交前必须：ESLint 检查通过 + 单元测试通过。

## 安全规范

- Token 存 HttpOnly Cookie，禁止 localStorage
- 权限校验在服务端/中间件完成
- 所有输入输出必须校验
- 禁止硬编码敏感信息

## 禁止清单

- ❌ 新功能用 Pages Router
- ❌ 客户端组件发不必要请求
- ❌ 滥用全局状态
- ❌ 使用 `any`
- ❌ 提交敏感配置
- ❌ 生产开调试模式
- ❌ emoji 作为图标（用 SVG）

## 相关文档

- [MASTER.md](docs/design-system/MASTER.md) — 全局设计系统
- [pages/index.md](docs/design-system/pages/index.md) — 页面设计索引
- [data-platform-ui-design.md](docs/data-platform-ui-design.md) — 完整 UI 设计规范
- [next-frontend SKILL.md](.claude/skills/next-frontend/SKILL.md) — Next.js 开发技能
- [nextjs-frontend-dev-rules.md](.claude/rules/nextjs-frontend-dev-rules.md) — 开发规则
