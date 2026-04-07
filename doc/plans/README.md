# 规划文档索引（doc/plans）

本目录存放项目开发过程中的规划文档，按时间线组织。

---

## 当前活跃规划

| 文档                                                                                                 | 概述                                                           | 状态      |
| ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | --------- |
| [2026-04-02-sdk-development-plan.md](./2026-04-02-sdk-development-plan.md)                           | SDK 开发计划（HttpClient + 9 个服务客户端）                    | 📋 待开始 |
| [2026-04-02-frontend-integration-deliverables.md](./2026-04-02-frontend-integration-deliverables.md) | 前端接入交付物规划（Swagger、文档、Mock、SDK）                 | 📋 待开始 |
| [2026-04-02-post-domain-services-roadmap.md](./2026-04-02-post-domain-services-roadmap.md)           | 后续工作规划（集成验证、测试、基础设施、可观测性、安全、部署） | 📋 待开始 |
| [2026-04-02-docker-deployment-design.md](./2026-04-02-docker-deployment-design.md)                   | Docker 部署设计（多阶段构建、服务编排、安全加固）              | 📋 待开始 |
| [2026-04-03-m3-database-migration-runbook.md](./2026-04-03-m3-database-migration-runbook.md)         | M3 3.1 数据库迁移执行与回滚 Runbook                            | ✅ 已完成 |

---

## 历史规划（已完成）

| 文档                                                                                                         | 概述                                                                     | 完成状态  |
| ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ | --------- |
| [2026-04-02-domain-services-plan.md](./2026-04-02-domain-services-plan.md)                                   | 6 个领域服务落地计划（ops/integration/admin/sharing/analytics/security） | ✅ 已完成 |
| [2026-03-30-system-auth-authentication.md](./2026-03-30-system-auth-authentication.md)                       | 系统认证服务认证功能                                                     | ✅ 已完成 |
| [2026-03-30-system-auth-sdk-integration.md](./2026-03-30-system-auth-sdk-integration.md)                     | SDK 集成指南                                                             | ✅ 已完成 |
| [2026-03-31-system-auth-auth-guard-design.md](./2026-03-31-system-auth-auth-guard-design.md)                 | 认证守卫设计                                                             | ✅ 已完成 |
| [2026-04-01-architecture-improvement-gateway-plan.md](./2026-04-01-architecture-improvement-gateway-plan.md) | API 网关架构改进                                                         | ✅ 已完成 |
| [2026-04-01-system-auth-database-refactor.md](./2026-04-01-system-auth-database-refactor.md)                 | 数据库重构设计                                                           | ✅ 已完成 |

---

## 规划文档命名规范

```
YYYY-MM-DD-{topic}.md
```

- 使用日期前缀便于时间线排序
- 使用 kebab-case 描述主题
- 文档内部使用 frontmatter 标记状态和 TODO 列表

---

## 相关文档目录

- **架构文档**：`doc/ARCHITECTURE.md`
- **服务规划**：`doc/services/README.md`
- **SDK 设计**：`doc/design/sdk/README.md`
- **开发指南**：`doc/DEVELOPMENT-GUIDELINES.md`
