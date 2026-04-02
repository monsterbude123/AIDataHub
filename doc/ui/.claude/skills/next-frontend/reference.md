# 参考资料

## 官方文档链接

- [Next.js 官方文档](https://nextjs.org/docs)
- [React 官方文档](https://react.dev/)
- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
- [Conventional Commits 规范](https://www.conventionalcommits.org/zh-hans/v1.0.0/)
- [Tailwind CSS 官方文档](https://tailwindcss.com/docs)
- [TanStack Query 官方文档](https://tanstack.com/query/latest/docs/react/overview)
- [shadcn/ui 官方文档](https://ui.shadcn.com/)
- [Zod 官方文档](https://zod.dev/)

## 完整技术栈版本表

| Technology | Version Requirements | Core Positioning & Usage Guidelines |
|------------|----------------------|-------------------------------------|
| Next.js | 14.x (App Router 优先) | 核心全栈React框架，提供SSR/SSG/ISR/PPR等渲染能力、路由管理、构建优化 |
| React | 18.x | 基础UI组件开发框架，使用函数式组件与Hooks范式 |
| TypeScript | 5.x | 强制类型系统，保障全项目类型安全 |
| Tailwind CSS | 3.x | 原子化CSS框架，快速开发可维护的样式，推荐配合shadcn/ui使用 |
| React Query/TanStack Query | 5.x | 服务端数据请求、缓存与状态管理 |
| Zod | 3.x | 数据输入/输出校验，保障接口类型安全 |
| ESLint | 8.x | 代码静态检查，统一代码质量规范 |
| Prettier | 3.x | 代码格式化，统一代码风格 |
| Jest | 29.x | 单元测试框架 |
| React Testing Library | 14.x | 组件测试工具，基于用户行为测试组件 |
| Playwright | 1.40.x | E2E端到端测试工具 |
| Lucide React | 0.29x | 官方标准图标库，轻量可tree-shaking |

## Next.js App Router 核心概念

### 服务端组件 vs 客户端组件

| 场景 | 推荐组件类型 |
|------|--------------|
| 获取数据 | 服务端组件 |
| 访问后端资源/数据库 | 服务端组件 |
| 处理敏感信息（如API密钥） | 服务端组件 |
| 添加交互（点击、输入等） | 客户端组件 |
| 使用浏览器API | 客户端组件 |
| 使用React Hooks | 客户端组件 |
| 使用依赖浏览器API的第三方库 | 客户端组件 |

默认情况下，App Router中的组件都是服务端组件，需要添加`'use client'`指令才能变成客户端组件。

### 渲染模式对比

| 模式 | 说明 | 使用场景 |
|------|------|----------|
| SSR | 服务端渲染，每次请求都渲染 | 动态数据、需要实时更新的页面 |
| SSG | 静态生成，构建时生成HTML | 静态内容、不常更新的页面 |
| ISR | 增量静态再生成，构建后可以增量更新 | 需定期更新的静态内容 |
| PPR | 部分预渲染，部分静态部分动态 | 大型页面，部分静态部分动态 |