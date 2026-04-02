# 数据集成管理模块 - 页面索引

> 模块路由前缀: `/integration`
> 菜单位置: 一级菜单「数据集成」

## 模块说明

数据接入处理支持通过Spark、ETL实现结构化、半结构化、非结构化文件的集中读取、校验、清洗转换等接入处理，并存储到数据仓库。

## 功能页面

### 一级菜单页面

| 页面          | 类型  | 菜单名称      | 路由                           | 文档                                       |
| ------------- | ----- | ------------- | ------------------------------ | ------------------------------------------ |
| 数据源列表    | `[M]` | 数据源管理    | `/integration/sources`         | [source-list.md](./source-list.md)         |
| 数据探查      | `[M]` | 数据探查      | `/integration/profiling`       | [profiling.md](./profiling.md)             |
| 数据标准化    | `[M]` | 数据标准化    | `/integration/standardization` | [standardization.md](./standardization.md) |
| Spark SQL开发 | `[M]` | Spark SQL开发 | `/integration/sql-dev`         | [sql-dev.md](./sql-dev.md)                 |

### 非菜单页面（从列表/按钮进入）

| 页面         | 类型  | 路由                              | 入口方式                 | 文档                                   |
| ------------ | ----- | --------------------------------- | ------------------------ | -------------------------------------- |
| 数据源配置   | `[C]` | `/integration/sources/new`        | 数据源列表「新增」按钮   | [source-config.md](./source-config.md) |
| 数据源配置   | `[C]` | `/integration/sources/[id]/edit`  | 数据源列表「编辑」按钮   | [source-config.md](./source-config.md) |
| 探查任务详情 | `[D]` | `/integration/profiling/[taskId]` | 探查列表「查看详情」按钮 | [profiling.md](./profiling.md)         |

**页面类型说明**：

- `[M]` 菜单页面 - 出现在侧边导航菜单
- `[D]` 详情页面 - 从列表点击进入，不在菜单
- `[C]` 配置页面 - 新增/编辑配置，不在菜单

## 数据迁移子模块

数据迁移是数据集成的核心子模块，负责同/异构数据源之间的数据迁移任务管理与运维监控。

### 二级菜单页面

| 页面         | 类型  | 菜单名称            | 路由                     | 文档                                               |
| ------------ | ----- | ------------------- | ------------------------ | -------------------------------------------------- |
| 迁移任务列表 | `[M]` | 数据迁移 > 任务列表 | `/integration/migration` | [migration/task-list.md](./migration/task-list.md) |

### 非菜单页面（从列表/按钮进入）

| 页面         | 类型  | 路由                                   | 入口方式                     | 文档                                         |
| ------------ | ----- | -------------------------------------- | ---------------------------- | -------------------------------------------- |
| 迁移任务配置 | `[C]` | `/integration/migration/create`        | 任务列表「新建迁移任务」按钮 | [migration/config.md](./migration/config.md) |
| 迁移任务配置 | `[C]` | `/integration/migration/[taskId]/edit` | 任务列表「编辑」按钮         | [migration/config.md](./migration/config.md) |
| 迁移任务详情 | `[D]` | `/integration/migration/[taskId]`      | 任务列表「查看详情」按钮     | [migration/detail.md](./migration/detail.md) |
| 迁移日志中心 | `[D]` | `/integration/migration/[taskId]/logs` | 详情页「查看日志」按钮       | [migration/logs.md](./migration/logs.md)     |

详见 [迁移模块文档](./migration/index.md)

## 职责划分

- **数据接入**: 数据源配置、连接测试、元数据初始采集
- **数据探查**: 接入前数据质量分析
- **数据标准化**: 执行标准化处理（标准定义在数据治理）
- **数据开发**: 自助Spark SQL开发处理
- **数据迁移**: 跨数据源数据迁移任务管理与执行监控

## 导航结构

```
数据集成 (一级菜单)
├── 数据源管理 [M] ─── 新增/编辑数据源配置 [C]
├── 数据探查 [M] ─── 探查任务详情 [D]
├── 数据标准化 [M]
├── Spark SQL开发 [M]
└── 数据迁移 (展开)
    └── 任务列表 [M]
        ├── 新建迁移任务 [C]
        ├── 查看详情 [D]
        │   └── 查看日志 [D]
        └── 编辑任务 [C]
```
