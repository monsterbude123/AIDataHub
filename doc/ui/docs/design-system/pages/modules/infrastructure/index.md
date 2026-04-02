# 基础设施管理模块 - 页面索引

> 模块路由前缀: `/infrastructure`
> 菜单位置: 一级菜单「基础设施」

## 模块说明

基础设施管理模块负责统一管理数据中台的大数据计算资源配置，包括租户管理、资源队列、Worker节点、计算引擎配置等。通过**配置层级继承**和**配置引用**机制，实现配置的集中管理和跨模块复用。

## 功能页面

### 一级菜单页面

| 页面           | 类型  | 菜单名称              | 路由                       | 文档                                           |
| -------------- | ----- | --------------------- | -------------------------- | ---------------------------------------------- |
| 租户管理       | `[M]` | 基础设施 > 租户管理   | `/infrastructure/tenant`   | [tenant-management.md](./tenant-management.md) |
| 资源队列管理   | `[M]` | 基础设施 > 资源队列   | `/infrastructure/queue`    | [queue-management.md](./queue-management.md)   |
| Worker节点管理 | `[M]` | 基础设施 > Worker节点 | `/infrastructure/worker`   | [worker-management.md](./worker-management.md) |
| 计算引擎配置   | `[M]` | 基础设施 > 引擎配置   | `/infrastructure/engine`   | [engine-config.md](./engine-config.md)         |
| 配置模板管理   | `[M]` | 基础设施 > 配置模板   | `/infrastructure/template` | [config-template.md](./config-template.md)     |

### 非菜单页面（从列表/按钮进入）

| 页面         | 类型  | 路由                                    | 入口方式                   | 文档                                           |
| ------------ | ----- | --------------------------------------- | -------------------------- | ---------------------------------------------- |
| 租户详情     | `[D]` | `/infrastructure/tenant/[tenantId]`     | 租户列表「查看详情」按钮   | [tenant-management.md](./tenant-management.md) |
| 租户配置     | `[C]` | 弹窗或独立页面                          | 「新建租户」按钮           | [tenant-management.md](./tenant-management.md) |
| 队列详情     | `[D]` | `/infrastructure/queue/[queueId]`       | 队列列表「查看详情」按钮   | [queue-management.md](./queue-management.md)   |
| 队列配置     | `[C]` | 弹窗或独立页面                          | 「新建队列」按钮           | [queue-management.md](./queue-management.md)   |
| Worker详情   | `[D]` | `/infrastructure/worker/[workerId]`     | Worker列表「查看详情」按钮 | [worker-management.md](./worker-management.md) |
| Worker配置   | `[C]` | 弹窗或独立页面                          | 「新建Worker」按钮         | [worker-management.md](./worker-management.md) |
| 引擎配置详情 | `[D]` | `/infrastructure/engine/[engineId]`     | 引擎列表「查看详情」按钮   | [engine-config.md](./engine-config.md)         |
| 引擎配置编辑 | `[C]` | 弹窗或独立页面                          | 「新建配置」按钮           | [engine-config.md](./engine-config.md)         |
| 模板详情     | `[D]` | `/infrastructure/template/[templateId]` | 模板列表「查看详情」按钮   | [config-template.md](./config-template.md)     |
| 模板编辑     | `[C]` | 弹窗或独立页面                          | 「新建模板」按钮           | [config-template.md](./config-template.md)     |

**页面类型说明**：

- `[M]` 菜单页面 - 出现在侧边导航菜单
- `[D]` 详情页面 - 从列表点击进入，不在菜单
- `[C]` 配置页面 - 新增/编辑配置，不在菜单

## 配置层级架构

采用四级配置层级，实现配置继承和覆盖：

```
系统级配置（全局默认）
    ↓ 继承（可覆盖）
租户级配置（租户特定）
    ↓ 继承（可覆盖）
项目级配置（项目特定）
    ↓ 引用 + 任务参数
任务级配置（任务特定）
```

## 与其他模块的关联

| 关联模块    | 关联方式                 | 使用的配置                    |
| ----------- | ------------------------ | ----------------------------- |
| 数据迁移    | 引用引擎+队列+Worker配置 | Spark/DataX引擎、队列、Worker |
| 数据探查    | 引用引擎+队列配置        | Spark引擎、队列               |
| 数据治理    | 引用引擎+队列+Worker配置 | Spark引擎、队列、Worker       |
| 任务DAG调度 | 引用队列+Worker配置      | 队列、Worker SSH              |
| 数据项目    | 项目级配置继承           | 项目默认队列、引擎            |

## 导航结构

```
基础设施 (一级菜单，可展开)
├── 租户管理 [M]
│   ├── 新建租户 [C]
│   └── 查看详情 [D]
├── 资源队列 [M]
│   ├── 新建队列 [C]
│   └── 查看详情 [D]
├── Worker节点 [M]
│   ├── 新建Worker [C]
│   └── 查看详情 [D]
├── 引擎配置 [M]
│   ├── 新建配置 [C]
│   └── 查看详情 [D]
└── 配置模板 [M]
    ├── 新建模板 [C]
    └── 查看详情 [D]
```
