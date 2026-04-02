---
name: create-next-api-route
description: 按照规范创建Next.js API路由和接口请求逻辑
trigger: create-next-api-route
argument-hint: "[route-path]"
allowed-tools: Read, Write, Edit, Grep
---

# 创建Next.js API路由和接口请求封装

请创建符合规范的API路由和服务层封装：
路由路径：$ARGUMENTS

执行步骤：
1. 在app/api/下创建对应路由的route.ts文件
2. 在services/api/下创建对应接口定义文件
3. 在services/hooks/下创建对应的数据请求Hook
4. 使用Zod定义接口请求参数和返回数据的校验Schema
5. 统一处理接口错误，添加错误处理逻辑
6. 为所有类型定义明确的TypeScript类型

检查要点：
- 所有入参出参都有明确TypeScript类型定义，无any
- 所有数据都通过Zod做运行时校验，禁止使用未校验数据
- 接口请求逻辑完全封装在service层，组件不直接写请求逻辑
- 错误做了统一处理，没有重复错误处理代码
- 符合类型安全强制规范，没有绕过类型检查
- 遵循Next.js App Router API路由的最新规范
```

---