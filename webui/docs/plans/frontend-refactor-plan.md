# 前端代码重构计划 v2

> 创建日期: 2026-04-02
> 基于设计文档: docs/design-system/navigation.md

## 一、页面类型分类检查

### 页面类型定义

| 类型     | 标识  | 说明               | 显示位置                   |
| -------- | ----- | ------------------ | -------------------------- |
| 菜单页面 | `[M]` | 出现在侧边导航菜单 | 一级/二级/三级菜单         |
| 详情页面 | `[D]` | 从列表点击进入     | 不在菜单，通过列表操作进入 |
| 配置页面 | `[C]` | 新增/编辑配置      | 不在菜单，弹窗或独立页面   |
| Tab页面  | `[T]` | 详情页的Tab标签    | 不在菜单，详情页内部       |

### 1.1 菜单页面清单 `[M]` (应在菜单中)

| 模块     | 页面名称         | 设计文档路由                   | 状态        |
| -------- | ---------------- | ------------------------------ | ----------- |
| 首页     | 首页仪表盘       | `/`                            | ✅ 已实现   |
| 数据项目 | 项目列表         | `/project`                     | ❌ 缺失     |
| 数据集成 | 数据源管理       | `/integration/sources`         | ⚠️ 路由错误 |
| 数据集成 | 数据探查         | `/integration/profiling`       | ⚠️ 路由错误 |
| 数据集成 | 数据标准化       | `/integration/standardization` | ⚠️ 路由错误 |
| 数据集成 | Spark SQL开发    | `/integration/sql-dev`         | ⚠️ 路由错误 |
| 数据集成 | 数据迁移任务列表 | `/integration/migration`       | ❌ 缺失     |
| 数据治理 | 数据地图         | `/governance/data-map`         | ✅ 已实现   |
| 数据治理 | 数据质量         | `/governance/quality`          | ⚠️ 路由错误 |
| 数据治理 | 标签管理         | `/governance/tags`             | ✅ 已实现   |
| 数据治理 | 数据血缘         | `/governance/lineage`          | ✅ 已实现   |
| 数据治理 | 数据标准         | `/governance/standard`         | ✅ 已实现   |
| 数据治理 | 数据模型         | `/governance/model`            | ⚠️ 路由错误 |
| 数据服务 | 服务目录         | `/service/catalog`             | ⚠️ 路由错误 |
| 数据服务 | 服务监控         | `/service/monitoring`          | ⚠️ 路由错误 |
| 数据共享 | 共享首页         | `/sharing`                     | ✅ 已实现   |
| 数据共享 | 事项任务         | `/sharing/tasks`               | ✅ 已实现   |
| 数据共享 | 资源管理         | `/sharing/resources`           | ✅ 已实现   |
| 数据共享 | 服务申请         | `/sharing/application`         | ⚠️ 路由错误 |
| 自助分析 | 即席查询         | `/analytics/query`             | ✅ 已实现   |
| 自助分析 | 可视化分析       | `/analytics/visualization`     | ✅ 已实现   |
| 元数据   | 元数据列表       | `/metadata`                    | ⚠️ 路由错误 |
| 数据组织 | 资源目录         | `/organization/catalog`        | ⚠️ 路由错误 |
| 数据组织 | 入库映射         | `/organization/mapping`        | ⚠️ 路由错误 |
| 数据安全 | 数据脱敏         | `/security/desensitization`    | ✅ 已实现   |
| 数据安全 | 分级分类         | `/security/classification`     | ✅ 已实现   |
| 数据安全 | 数据水印         | `/security/watermark`          | ✅ 已实现   |
| 任务队列 | 队列监控         | `/task-queue/monitor`          | ✅ 已实现   |
| 基础设施 | 租户管理         | `/infrastructure/tenant`       | ❌ 缺失     |
| 基础设施 | 资源队列         | `/infrastructure/queue`        | ❌ 缺失     |
| 基础设施 | Worker节点       | `/infrastructure/worker`       | ❌ 缺失     |
| 基础设施 | 引擎配置         | `/infrastructure/engine`       | ❌ 缺失     |
| 基础设施 | 配置模板         | `/infrastructure/template`     | ❌ 缺失     |
| 系统管理 | 组织用户         | `/system/org-user`             | ✅ 已实现   |
| 系统管理 | 角色权限         | `/system/role`                 | ⚠️ 路由错误 |
| 系统管理 | 审批待办         | `/system/approval/todo`        | ⚠️ 路由错误 |
| 系统管理 | 审批配置         | `/system/approval/config`      | ⚠️ 路由错误 |
| 系统管理 | 系统设置         | `/system/settings`             | ✅ 已实现   |

**菜单页面总计**: 37 个

### 1.2 非菜单页面清单 (不应在菜单中)

#### 详情页面 `[D]`

| 页面名称     | 设计文档路由                           | 代码实现路由                  | 状态        |
| ------------ | -------------------------------------- | ----------------------------- | ----------- |
| 项目详情     | `/project/[id]`                        | -                             | ❌ 缺失     |
| DAG编排      | `/project/[id]/scheduler/dag`          | `/scheduler/dag`              | ⚠️ 路径错误 |
| 任务运维     | `/project/[id]/scheduler/tasks`        | `/scheduler/tasks`            | ⚠️ 路径错误 |
| 日志中心     | `/project/[id]/scheduler/logs`         | `/scheduler/logs`             | ⚠️ 路径错误 |
| 探查任务详情 | `/integration/profiling/[taskId]`      | -                             | ❌ 缺失     |
| 迁移任务详情 | `/integration/migration/[taskId]`      | -                             | ❌ 缺失     |
| 迁移任务日志 | `/integration/migration/[taskId]/logs` | -                             | ❌ 缺失     |
| 质量检测详情 | `/governance/quality/[taskId]`         | -                             | ❌ 缺失     |
| 服务授权     | `/service/authorization/[id]`          | `/data-service/authorization` | ⚠️ 路径错误 |
| 租户详情     | `/infrastructure/tenant/[id]`          | -                             | ❌ 缺失     |
| 队列详情     | `/infrastructure/queue/[id]`           | -                             | ❌ 缺失     |
| Worker详情   | `/infrastructure/worker/[id]`          | -                             | ❌ 缺失     |
| 引擎详情     | `/infrastructure/engine/[id]`          | -                             | ❌ 缺失     |
| 模板详情     | `/infrastructure/template/[id]`        | -                             | ❌ 缺失     |
| 元数据详情   | `/metadata/[id]`                       | `/metadata/detail`            | ⚠️ 路径错误 |
| 用户详情     | `/system/user/[userId]`                | -                             | ❌ 缺失     |

#### 配置页面 `[C]`

| 页面名称           | 设计文档路由                       | 代码实现路由               | 状态        |
| ------------------ | ---------------------------------- | -------------------------- | ----------- |
| 数据源配置(新增)   | `/integration/sources/new`         | `/data-integration/config` | ⚠️ 路径错误 |
| 数据源配置(编辑)   | `/integration/sources/[id]/edit`   | -                          | ❌ 缺失     |
| 探查任务配置       | 弹窗                               | -                          | ⚠️ 需确认   |
| 迁移任务配置(新增) | `/integration/migration/create`    | -                          | ❌ 缺失     |
| 迁移任务配置(编辑) | `/integration/migration/[id]/edit` | -                          | ❌ 缺失     |
| 质量规则配置       | 弹窗                               | -                          | ⚠️ 需确认   |
| 服务配置(新增)     | `/service/config`                  | `/data-service/config`     | ⚠️ 路径错误 |
| 服务配置(编辑)     | `/service/config/[id]`             | -                          | ❌ 缺失     |
| 项目配置(新增)     | 弹窗                               | -                          | ❌ 缺失     |
| 用户配置           | 弹窗                               | -                          | ⚠️ 需确认   |
| 角色配置           | 弹窗                               | -                          | ⚠️ 需确认   |
| 登录页             | `/login`                           | `/login`                   | ✅ 已实现   |

#### Tab页面 `[T]` (项目详情内部)

| Tab名称  | 设计文档路由               | 状态    |
| -------- | -------------------------- | ------- |
| 基本信息 | `/project/[id]` (默认)     | ❌ 缺失 |
| 任务管理 | `/project/[id]#tasks`      | ❌ 缺失 |
| 里程碑   | `/project/[id]#milestones` | ❌ 缺失 |
| 文档     | `/project/[id]#docs`       | ❌ 缺失 |
| 统计     | `/project/[id]#stats`      | ❌ 缺失 |
| 成员     | `/project/[id]#members`    | ❌ 缺失 |

#### 公共页面

| 页面名称 | 设计文档路由 | 代码实现路由 | 状态      |
| -------- | ------------ | ------------ | --------- |
| 登录页   | `/login`     | `/login`     | ✅ 已实现 |
| 个人中心 | `/profile`   | `/profile`   | ✅ 已实现 |

---

## 二、当前菜单实现问题

### 2.1 错误出现在菜单中的页面

**PageLayout.tsx 中需要移除的菜单项**:

| 错误菜单项 | 页面类型 | 问题说明           |
| ---------- | -------- | ------------------ |
| 数据源配置 | `[C]`    | 配置页面不应在菜单 |
| 服务配置   | `[C]`    | 配置页面不应在菜单 |
| 服务授权   | `[D]`    | 详情页面不应在菜单 |
| 元数据详情 | `[D]`    | 详情页面不应在菜单 |

### 2.2 当前菜单配置问题

```typescript
// 当前错误配置 (PageLayout.tsx)
{
  key: "data-integration",
  children: [
    { key: ROUTES.DATA_SOURCES, label: "数据源管理" },      // ✅ 正确 [M]
    { key: ROUTES.DATA_SOURCE_CONFIG, label: "数据源配置" }, // ❌ 错误 [C] 不应在菜单
    ...
  ],
}
{
  key: "data-service",
  children: [
    { key: ROUTES.SERVICE_CATALOG, label: "服务目录" },       // ✅ 正确 [M]
    { key: ROUTES.SERVICE_CONFIG, label: "服务配置" },        // ❌ 错误 [C] 不应在菜单
    { key: ROUTES.SERVICE_AUTHORIZATION, label: "服务授权" }, // ❌ 错误 [D] 不应在菜单
    { key: ROUTES.SERVICE_MONITORING, label: "服务监控" },    // ✅ 正确 [M]
  ],
}
{
  key: "metadata",
  children: [
    { key: ROUTES.METADATA, label: "元数据列表" },       // ✅ 正确 [M]
    { key: ROUTES.METADATA_DETAIL, label: "元数据详情" }, // ❌ 错误 [D] 不应在菜单
  ],
}
```

---

## 三、按钮实现状态检查

### 3.1 数据源管理页 (`/data-integration/sources`)

| 按钮       | 实现状态  | 行为                                               |
| ---------- | --------- | -------------------------------------------------- |
| 新增数据源 | ⚠️ 部分   | 显示 `message.info("功能开发中...")`，未跳转       |
| 编辑       | ✅ 已实现 | 显示 `message.info("编辑数据源...")`               |
| 测试连接   | ✅ 已实现 | 模拟测试，显示 loading 和成功消息                  |
| 删除       | ⚠️ 部分   | 显示 `message.warning("需要二次确认")`，无确认弹窗 |
| 刷新       | ✅ 已实现 | 显示 `message.success("数据已刷新")`               |

**需要修复**:

- 新增按钮应跳转到 `/integration/sources/new` 或打开配置弹窗
- 删除按钮应添加 Popconfirm 确认

### 3.2 数据源配置页 (`/data-integration/config`)

| 按钮     | 实现状态  | 行为                      |
| -------- | --------- | ------------------------- |
| 测试连接 | ✅ 已实现 | 模拟测试，有 loading 状态 |
| 上一步   | ✅ 已实现 | 正常切换步骤              |
| 下一步   | ✅ 已实现 | 验证后切换步骤            |
| 完成保存 | ✅ 已实现 | 验证后提交，跳转列表      |
| 取消     | ✅ 已实现 | 跳转回列表                |

### 3.3 服务目录页 (`/data-service/catalog`)

| 按钮      | 实现状态  | 行为                         |
| --------- | --------- | ---------------------------- |
| 新增服务  | ✅ 已实现 | 打开新增弹窗                 |
| 详情      | ✅ 已实现 | 打开详情弹窗                 |
| 测试      | ⚠️ 部分   | 仅 `console.log`，无实际反馈 |
| 文档      | ⚠️ 部分   | 仅 `console.log`，无实际反馈 |
| 删除      | ⚠️ 部分   | 无确认弹窗                   |
| 搜索/筛选 | ✅ 已实现 | 正常过滤                     |

**需要修复**:

- 测试按钮应打开测试弹窗或跳转测试页面
- 文档按钮应触发下载或打开文档预览
- 删除按钮应添加确认弹窗

### 3.4 其他页面按钮检查

| 页面          | 按钮                 | 实现状态  |
| ------------- | -------------------- | --------- |
| 数据探查      | 新建探查任务         | ⚠️ 待检查 |
| 数据标准化    | 各操作按钮           | ⚠️ 待检查 |
| Spark SQL开发 | 执行、保存等         | ⚠️ 待检查 |
| 数据质量      | 配置规则、新建任务   | ⚠️ 待检查 |
| 标签管理      | 新建、编辑、删除     | ⚠️ 待检查 |
| 数据血缘      | 展开、筛选           | ⚠️ 待检查 |
| 组织用户      | 新增用户、编辑、删除 | ⚠️ 待检查 |
| 角色权限      | 新增角色、编辑、删除 | ⚠️ 待检查 |

---

## 四、重构任务清单

### Phase 1: 菜单结构调整 (P0 - 1h)

#### 1.1 移除不应在菜单中的页面

**文件**: `components/layout/PageLayout.tsx`

```typescript
// 修改后的菜单配置
const menuItems: MenuProps["items"] = [
  // 首页
  { key: ROUTES.HOME, icon: <Home />, label: <Link href="/">首页</Link> },

  // 数据项目 (新增)
  { key: ROUTES.PROJECT, icon: <FolderKanban />, label: <Link href="/project">数据项目</Link> },

  // 数据集成
  {
    key: "integration",
    icon: <Database />,
    label: "数据集成",
    children: [
      { key: ROUTES.DATA_SOURCES, label: <Link href="/integration/sources">数据源管理</Link> },
      { key: ROUTES.DATA_PROFILING, label: <Link href="/integration/profiling">数据探查</Link> },
      { key: ROUTES.DATA_STANDARDIZATION, label: <Link href="/integration/standardization">数据标准化</Link> },
      { key: ROUTES.SQL_DEV, label: <Link href="/integration/sql-dev">Spark SQL开发</Link> },
      { key: ROUTES.MIGRATION, label: <Link href="/integration/migration">数据迁移</Link> },
    ],
  },

  // 数据治理
  {
    key: "governance",
    icon: <Shield />,
    label: "数据治理",
    children: [
      { key: ROUTES.DATA_MAP, label: <Link href="/governance/data-map">数据地图</Link> },
      { key: ROUTES.DATA_QUALITY, label: <Link href="/governance/quality">数据质量</Link> },
      { key: ROUTES.TAG_MANAGEMENT, label: <Link href="/governance/tags">标签管理</Link> },
      { key: ROUTES.DATA_LINEAGE, label: <Link href="/governance/lineage">数据血缘</Link> },
      { key: ROUTES.DATA_STANDARD, label: <Link href="/governance/standard">数据标准</Link> },
      { key: ROUTES.DATA_MODEL, label: <Link href="/governance/model">数据模型</Link> },
    ],
  },

  // 数据服务 - 移除配置和授权
  {
    key: "service",
    icon: <Share2 />,
    label: "数据服务",
    children: [
      { key: ROUTES.SERVICE_CATALOG, label: <Link href="/service/catalog">服务目录</Link> },
      { key: ROUTES.SERVICE_MONITORING, label: <Link href="/service/monitoring">服务监控</Link> },
    ],
  },

  // ... 其他菜单项

  // 元数据管理 - 移除详情
  {
    key: "metadata",
    icon: <FileText />,
    label: "元数据管理",
    children: [
      { key: ROUTES.METADATA, label: <Link href="/metadata">元数据列表</Link> },
    ],
  },

  // 基础设施 (新增)
  {
    key: "infrastructure",
    icon: <Server />,
    label: "基础设施",
    children: [
      { key: ROUTES.TENANT_MANAGEMENT, label: <Link href="/infrastructure/tenant">租户管理</Link> },
      { key: ROUTES.QUEUE_MANAGEMENT, label: <Link href="/infrastructure/queue">资源队列</Link> },
      { key: ROUTES.WORKER_MANAGEMENT, label: <Link href="/infrastructure/worker">Worker节点</Link> },
      { key: ROUTES.ENGINE_CONFIG, label: <Link href="/infrastructure/engine">引擎配置</Link> },
      { key: ROUTES.CONFIG_TEMPLATE, label: <Link href="/infrastructure/template">配置模板</Link> },
    ],
  },

  // 系统管理
  {
    key: "system",
    icon: <Settings />,
    label: "系统管理",
    children: [
      { key: ROUTES.ORG_USER, label: <Link href="/system/org-user">组织用户</Link> },
      { key: ROUTES.ROLE_PERMISSION, label: <Link href="/system/role">角色权限</Link> },
      { key: ROUTES.APPROVAL_TODO, label: <Link href="/system/approval/todo">审批待办</Link> },
      { key: ROUTES.APPROVAL_CONFIG, label: <Link href="/system/approval/config">审批配置</Link> },
      { key: ROUTES.SYSTEM_SETTINGS, label: <Link href="/system/settings">系统设置</Link> },
    ],
  },
];
```

### Phase 2: 路由结构调整 (P0 - 2h)

#### 2.1 重命名现有路由目录

| 操作   | 原路径                         | 新路径                        |
| ------ | ------------------------------ | ----------------------------- |
| 重命名 | `app/data-integration/`        | `app/integration/`            |
| 重命名 | `app/data-service/`            | `app/service/`                |
| 重命名 | `app/data-organization/`       | `app/organization/`           |
| 删除   | `app/data-integration/config/` | 改为从列表页进入              |
| 移动   | `app/scheduler/`               | `app/project/[id]/scheduler/` |

#### 2.2 更新路由常量

**文件**: `constants/index.ts`

```typescript
export const ROUTES = {
  // 公共页面
  HOME: '/',
  LOGIN: '/login',
  PROFILE: '/profile',

  // 数据项目 (新增)
  PROJECT: '/project',
  PROJECT_DETAIL: '/project/[id]',

  // 数据集成
  INTEGRATION: '/integration',
  DATA_SOURCES: '/integration/sources',
  DATA_SOURCE_NEW: '/integration/sources/new',
  DATA_SOURCE_EDIT: '/integration/sources/[id]/edit',
  DATA_PROFILING: '/integration/profiling',
  DATA_PROFILING_DETAIL: '/integration/profiling/[taskId]',
  DATA_STANDARDIZATION: '/integration/standardization',
  SQL_DEV: '/integration/sql-dev',

  // 数据迁移 (新增)
  MIGRATION: '/integration/migration',
  MIGRATION_CREATE: '/integration/migration/create',
  MIGRATION_DETAIL: '/integration/migration/[taskId]',
  MIGRATION_EDIT: '/integration/migration/[taskId]/edit',
  MIGRATION_LOGS: '/integration/migration/[taskId]/logs',

  // 数据治理
  GOVERNANCE: '/governance',
  DATA_MAP: '/governance/data-map',
  DATA_QUALITY: '/governance/quality',
  DATA_QUALITY_DETAIL: '/governance/quality/[taskId]',
  TAG_MANAGEMENT: '/governance/tags',
  DATA_LINEAGE: '/governance/lineage',
  DATA_STANDARD: '/governance/standard',
  DATA_MODEL: '/governance/model',

  // 数据服务
  SERVICE: '/service',
  SERVICE_CATALOG: '/service/catalog',
  SERVICE_CONFIG: '/service/config',
  SERVICE_CONFIG_EDIT: '/service/config/[id]',
  SERVICE_AUTHORIZATION: '/service/authorization/[id]',
  SERVICE_MONITORING: '/service/monitoring',

  // 数据共享
  SHARING: '/sharing',
  SHARING_TASKS: '/sharing/tasks',
  SHARING_RESOURCES: '/sharing/resources',
  SHARING_APPLICATION: '/sharing/application',

  // 自助分析
  ANALYTICS: '/analytics',
  AD_HOC_QUERY: '/analytics/query',
  AD_HOC_VISUALIZATION: '/analytics/visualization',

  // 元数据
  METADATA: '/metadata',
  METADATA_DETAIL: '/metadata/[id]',

  // 数据组织
  ORGANIZATION: '/organization',
  RESOURCE_CATALOG: '/organization/catalog',
  DATA_MAPPING: '/organization/mapping',

  // 数据安全
  SECURITY: '/security',
  CLASSIFICATION: '/security/classification',
  DESENSITIZATION: '/security/desensitization',
  WATERMARK: '/security/watermark',

  // 任务队列
  TASK_QUEUE: '/task-queue',
  QUEUE_MONITOR: '/task-queue/monitor',

  // 基础设施 (新增)
  INFRASTRUCTURE: '/infrastructure',
  TENANT_MANAGEMENT: '/infrastructure/tenant',
  TENANT_DETAIL: '/infrastructure/tenant/[tenantId]',
  QUEUE_MANAGEMENT: '/infrastructure/queue',
  QUEUE_DETAIL: '/infrastructure/queue/[queueId]',
  WORKER_MANAGEMENT: '/infrastructure/worker',
  WORKER_DETAIL: '/infrastructure/worker/[workerId]',
  ENGINE_CONFIG: '/infrastructure/engine',
  ENGINE_DETAIL: '/infrastructure/engine/[engineId]',
  CONFIG_TEMPLATE: '/infrastructure/template',
  TEMPLATE_DETAIL: '/infrastructure/template/[templateId]',

  // 系统管理
  SYSTEM: '/system',
  ORG_USER: '/system/org-user',
  USER_DETAIL: '/system/user/[userId]',
  ROLE_PERMISSION: '/system/role',
  APPROVAL_TODO: '/system/approval/todo',
  APPROVAL_CONFIG: '/system/approval/config',
  SYSTEM_SETTINGS: '/system/settings',
} as const;
```

### Phase 3: 数据项目模块实现 (P0 - 4h)

#### 3.1 目录结构

```
app/project/
├── page.tsx                    # 项目列表 [M]
├── [id]/
│   ├── page.tsx               # 项目详情 [D] - 概览Tab
│   ├── layout.tsx             # 项目详情布局 (Tab导航)
│   ├── tasks/
│   │   └── page.tsx           # 任务管理 [T]
│   ├── milestones/
│   │   └── page.tsx           # 里程碑 [T]
│   ├── docs/
│   │   └── page.tsx           # 文档管理 [T]
│   ├── stats/
│   │   └── page.tsx           # 统计 [T]
│   └── scheduler/             # 任务调度子模块
│       ├── dag/
│       │   └── page.tsx       # DAG编排 [D]
│       ├── tasks/
│       │   └── page.tsx       # 任务运维 [D]
│       └── logs/
│           └── page.tsx       # 日志中心 [D]
```

### Phase 4: 按钮功能完善 (P1 - 2h)

#### 4.1 数据源管理页修复

```typescript
// 新增数据源 - 跳转到配置页
const handleCreate = () => {
  router.push(ROUTES.DATA_SOURCE_NEW);
};

// 删除 - 添加确认弹窗
<Popconfirm
  title="确认删除此数据源？"
  description="删除后无法恢复，请谨慎操作"
  onConfirm={() => handleDelete(ds.id)}
  okText="删除"
  cancelText="取消"
  okButtonProps={{ danger: true }}
>
  <Button type="text" size="small" danger icon={<Trash2 size={14} />}>
    删除
  </Button>
</Popconfirm>
```

#### 4.2 服务目录页修复

```typescript
// 测试服务 - 打开测试弹窗
const [testModalOpen, setTestModalOpen] = useState(false);
const [testService, setTestService] = useState<DataService | null>(null);

const handleTestService = (service: DataService) => {
  setTestService(service);
  setTestModalOpen(true);
};

// 下载文档 - 模拟下载
const handleDownloadDoc = (service: DataService) => {
  message.loading({ content: '正在生成文档...', key: 'download' });
  setTimeout(() => {
    message.success({ content: '文档已下载', key: 'download' });
    // 实际项目中: window.open(`/api/services/${service.id}/doc`);
  }, 1000);
};
```

### Phase 5: 基础设施模块实现 (P1 - 3h)

#### 5.1 目录结构

```
app/infrastructure/
├── layout.tsx                  # 基础设施布局
├── tenant/
│   ├── page.tsx               # 租户管理 [M]
│   └── [tenantId]/
│       └── page.tsx           # 租户详情 [D]
├── queue/
│   ├── page.tsx               # 资源队列 [M]
│   └── [queueId]/
│       └── page.tsx           # 队列详情 [D]
├── worker/
│   ├── page.tsx               # Worker节点 [M]
│   └── [workerId]/
│       └── page.tsx           # Worker详情 [D]
├── engine/
│   ├── page.tsx               # 引擎配置 [M]
│   └── [engineId]/
│       └── page.tsx           # 引擎详情 [D]
└── template/
    ├── page.tsx               # 配置模板 [M]
    └── [templateId]/
        └── page.tsx           # 模板详情 [D]
```

---

## 五、实施步骤

### Step 1: 菜单清理 (30min)

1. 编辑 `PageLayout.tsx`
2. 移除 `[C]` 和 `[D]` 类型页面的菜单项
3. 添加新模块菜单项（数据项目、基础设施）

### Step 2: 路由重命名 (1.5h)

1. 重命名路由目录
2. 更新 `constants/index.ts`
3. 更新所有引用

### Step 3: 数据项目模块 (4h)

1. 创建目录结构
2. 迁移 scheduler 到项目下
3. 实现项目详情布局和 Tab

### Step 4: 按钮修复 (2h)

1. 修复数据源管理页按钮
2. 修复服务目录页按钮
3. 检查其他页面按钮

### Step 5: 基础设施模块 (3h)

1. 创建目录结构
2. 实现各子页面框架

### Step 6: 测试验证 (1h)

1. 验证所有菜单项正确
2. 验证按钮功能正常
3. 验证路由跳转正确

---

## 六、验收标准

### 菜单验收

- [ ] 所有 `[M]` 页面都在菜单中
- [ ] 所有 `[C]`、`[D]`、`[T]` 页面都不在菜单中
- [ ] 菜单结构符合 navigation.md 定义

### 按验收

- [ ] 新增按钮：跳转或弹窗
- [ ] 编辑按钮：跳转或弹窗
- [ ] 删除按钮：有确认弹窗
- [ ] 测试按钮：有反馈（成功/失败）
- [ ] 导出/下载按钮：有反馈

### 路由验收

- [ ] 所有路由符合设计文档
- [ ] 列表页点击可跳转详情/配置页
- [ ] 面包屑导航正确
