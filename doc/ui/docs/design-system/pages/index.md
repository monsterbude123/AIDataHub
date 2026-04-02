# AIDataHub 数据中台 - 页面设计索引

> 本目录按模块划分页面设计文档，遵循 MASTER + Overrides 层级模式

## 目录结构

```
pages/
├── index.md               # 本文件 - 主索引
└── modules/
    ├── common/            # 公共页面
    │   ├── index.md
    │   └── login.md
    ├── data-integration/  # 数据集成管理
    │   ├── index.md
    │   ├── source-list.md
    │   ├── source-config.md
    │   ├── profiling.md
    │   ├── standardization.md
    │   └── sql-dev.md
    ├── data-service/      # 数据服务管理
    │   ├── index.md
    │   ├── catalog.md
    │   ├── config.md
    │   ├── authorization.md
    │   └── monitoring.md
    ├── metadata/          # 元数据管理
    │   ├── index.md
    │   ├── list.md
    │   └── detail.md
    ├── data-organization/ # 数据组织管理
    │   ├── index.md
    │   ├── catalog.md
    │   └── mapping.md
    ├── governance/        # 数据治理管理
    │   ├── index.md
    │   ├── data-map.md
    │   ├── data-quality.md
    │   ├── tag-management.md
    │   ├── lineage.md
    │   ├── data-standard.md
    │   └── data-model.md
    ├── security/          # 数据安全管理
    │   ├── index.md
    │   ├── desensitization.md
    │   ├── classification.md
    │   └── watermark.md
    ├── scheduler/         # 统一任务调度中心
    │   ├── index.md
    │   ├── dag.md
    │   ├── task-list.md
    │   └── log-center.md
    ├── system/            # 系统管理
    │   ├── index.md
    │   ├── approval-config.md
    │   ├── approval-todo.md
    │   ├── org-user.md
    │   └── role-permission.md
    ├── sharing/           # 数据共享交换
    │   ├── index.md
    │   ├── home-dashboard.md
    │   ├── tasks.md
    │   ├── resource-management.md
    │   └── service-application.md
    └ analytics/          # 用户自助数据分析
        ├── index.md
        ├── ad-hoc-query.md
        └── ad-hoc-visualization.md
    └── task-queue/        # 任务队列管理
        ├── index.md
        └── monitor.md
```

## 模块概览

| 模块         | 目录               | 页面数 | 核心功能                               |
| ------------ | ------------------ | ------ | -------------------------------------- |
| 公共页面     | common/            | 1      | 登录认证                               |
| 数据集成管理 | data-integration/  | 5      | 数据源、探查、标准化、SQL开发          |
| 数据服务管理 | data-service/      | 4      | 服务目录、配置、授权、监控             |
| 元数据管理   | metadata/          | 2      | 元数据列表、详情版本                   |
| 数据组织管理 | data-organization/ | 2      | 资源目录、入库映射                     |
| 数据治理管理 | governance/        | 6      | 数据地图、质量、标签、血缘、标准、模型 |
| 数据安全管理 | security/          | 3      | 脱敏、分级分类、水印                   |
| 统一任务调度 | scheduler/         | 3      | DAG编排、任务运维、日志中心            |
| 任务队列管理 | task-queue/        | 1      | 队列监控总览                           |
| 系统管理     | system/            | 4      | 审批配置、待办、组织用户、角色权限     |
| 数据共享交换 | sharing/           | 4      | 首页、事项任务、资源管理、服务申请     |
| 自助数据分析 | analytics/         | 2      | 即席查询、可视化                       |

**总计**: 12个模块，33个页面设计文档

## 使用说明

1. **全局设计规范**: 参考 `../MASTER.md`
2. **页面级覆盖**: 页面文档可覆盖 MASTER 规范中的特定规则
3. **模块索引**: 每个模块目录有 `index.md` 说明模块功能概览
4. **页面文档**: 具体页面的布局、交互、组件设计细节

## 需求来源

基于 `doc/design/data-platform-requirements.md` 中定义的 221 个功能性需求进行页面设计拆分。
