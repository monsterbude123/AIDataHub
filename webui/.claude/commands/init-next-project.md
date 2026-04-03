---
name: init-next-project
description: 按照规范初始化一个符合企业级要求的Next.js项目
trigger: init-next-project
argument-hint: '[project-name]'
allowed-tools: Bash, Write, Read, Edit
---

# 初始化Next.js企业级项目

请按照以下步骤初始化一个符合当前规范的Next.js 14项目：

项目名称：$ARGUMENTS

执行步骤：

1. 使用官方create-next-app初始化项目，开启TypeScript、ESLint、Tailwind CSS、App Router
2. 按照规范创建企业级项目目录结构
3. 安装推荐的核心依赖：TanStack Query、Zod、Lucide React等
4. 配置ESLint、Prettier符合代码规范要求
5. 初始化基础配置文件：next.config.ts、tailwind.config.ts、tsconfig.json

检查要点：

- 强制使用Next.js 14+ App Router，不生成Pages Router相关代码
- 所有配置文件严格遵循规范要求
- 目录结构完全匹配文档中定义的企业级结构
- 核心依赖版本符合要求：Next.js 14.x, React 18.x, TypeScript 5.x, Tailwind 3.x
- 预配置好Conventional Commits提交规范相关工具

```

---
```
