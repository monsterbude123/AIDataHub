---
name: review-next-pr
description: 按照Next.js开发规范进行代码评审
trigger: review-next-pr
argument-hint: "[git-branch-or-commit-range]"
allowed-tools: Read, Bash, Grep, Git
---

# 按照Next.js规范进行Pull Request代码评审

请对指定的代码范围进行代码评审：
代码范围：$ARGUMENTS

执行步骤：
1. 获取变更文件列表，检查每个变更文件
2. 按照开发规范逐一检查变更内容，检查维度：
   - 类型安全：是否正确使用TypeScript，有无any滥用
   - 组件设计：是否符合单一职责，是否正确使用服务端/客户端组件
   - 状态管理：是否正确分离服务端/客户端状态
   - 命名规范：是否符合文件/变量/组件命名规则
   - 安全规范：是否存在敏感信息泄露、安全漏洞
   - 测试覆盖：核心逻辑是否有对应的测试用例
   - 提交规范：Commit信息是否符合Conventional Commits
3. 总结评审结果，列出问题和改进建议，标注问题严重程度

检查要点：
- 是否遵守了核心开发铁则
- 是否存在规范中列出的禁止实践
- 分层是否清晰，业务逻辑是否正确下沉
- 是否存在可维护性问题
- 是否符合安全与运维规范要求
```

---

如果你需要安装这些命令，可以使用以下方式：
1. 将每个文件保存到你的Claude Code自定义命令目录
2. 或者使用 `/skill-create` 命令创建完整的Next.js前端开发助手技能，包含这些内置命令