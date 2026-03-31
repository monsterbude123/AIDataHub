# AI DataHub 文档索引

## 优先阅读顺序

1. `doc/ARCHITECTURE.md`（架构全景与分层约束）
2. `doc/DECISIONS.md`（ADR 决策记录）
3. `doc/design/sdk/README.md`（设计手册与契约来源）
4. `doc/services/README.md`（微服务规划入口）

## 给 AI 开发者的最小指令

后续实现必须沿以下链路进行，不可越层：

```text
Next.js UI -> SDK/BFF 调用 -> NestJS services -> 数据与计算基础设施
```

如需新增能力，优先顺序：

1. 更新契约（contract）
2. 更新 SDK 调用层
3. 实现 NestJS 服务
4. 补齐测试与文档
