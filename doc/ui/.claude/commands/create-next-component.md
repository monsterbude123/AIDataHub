---
name: create-next-component
description: 按照规范创建符合要求的Next.js React组件
trigger: create-next-component
argument-hint: '[component-name] [ui|layout|features]'
allowed-tools: Read, Write, Edit, Glob
---

# 创建符合规范的Next.js组件

请按照要求创建新的React组件：
参数：$ARGUMENTS

执行步骤：

1. 解析组件名称和组件类型（ui基础组件/layout布局组件/features业务组件）
2. 在对应目录创建组件文件，使用帕斯卡命名法
3. 创建组件时遵循以下开发铁则：
   - 默认使用服务端组件，只在需要交互时添加'use client'
   - 使用TypeScript严格定义所有Props类型，禁止使用any
   - 遵循单一职责原则，控制组件行数不超过500行
   - 对所有props添加JSDoc注释说明用途
4. 如果是业务组件，确保分离服务端数据请求逻辑，遵循分层规范

检查要点：

- 文件名使用帕斯卡命名法，符合规范
- Props全部有明确类型定义，无隐式any
- 除非需要交互，否则没有添加不必要的'use client'指令
- 组件遵循单一职责，没有超过500行代码
- 没有硬编码魔法数字和魔法字符串，常量抽离正确
- 导入顺序符合规范要求：React/Next -> 第三方 -> 内部 -> 样式

```

---
```
