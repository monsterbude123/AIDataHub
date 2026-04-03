# AIDataHub UI 升级计划

> 文档创建日期: 2026-04-03
> 对比版本: 设计系统文档 vs 前端原型实现
> **最后更新: 2026-04-03 - Phase 2 已完成**

---

## 升级进度

### Phase 1: 基础架构重构 (P0) - ✅ 已完成

| 任务                                    | 状态   | 完成日期   |
| --------------------------------------- | ------ | ---------- |
| ✅ Tailwind 4 主题配置                  | 已完成 | 2026-04-03 |
| ✅ 字体系统配置 (Fira Sans + Fira Code) | 已完成 | 2026-04-03 |
| ✅ CSS 变量统一                         | 已完成 | 2026-04-03 |
| ✅ Antd 主题色调整                      | 已完成 | 2026-04-03 |
| ✅ 路由常量重构                         | 已完成 | 2026-04-03 |
| ✅ 导航菜单重构 (10 → 6 一级菜单)       | 已完成 | 2026-04-03 |
| ✅ EmptyState 组件开发                  | 已完成 | 2026-04-03 |
| ✅ LoadingState 组件开发                | 已完成 | 2026-04-03 |
| ✅ 数据迁移任务列表页                   | 已完成 | 2026-04-03 |
| ✅ 基础设施路由迁移                     | 已完成 | 2026-04-03 |
| ✅ 元数据路由迁移                       | 已完成 | 2026-04-03 |
| ✅ 数据组织路由迁移                     | 已完成 | 2026-04-03 |
| ✅ 数据安全路由迁移                     | 已完成 | 2026-04-03 |
| ✅ 首页组件更新                         | 已完成 | 2026-04-03 |

---

### Phase 2: 功能增强 (P1) - ✅ 已完成

| 任务                      | 状态   | 完成日期   |
| ------------------------- | ------ | ---------- |
| ✅ MultiStepForm 组件开发 | 已完成 | 2026-04-03 |
| ✅ 数据迁移配置页开发     | 已完成 | 2026-04-03 |
| ✅ 数据迁移详情页开发     | 已完成 | 2026-04-03 |
| ✅ 响应式布局适配         | 已完成 | 2026-04-03 |
| ✅ 首页自动刷新机制       | 已完成 | 2026-04-03 |

---

## 一、执行摘要

### 当前状态

| 维度     | 设计系统文档          | 前端原型实现    | 差距评估          |
| -------- | --------------------- | --------------- | ----------------- |
| 一级菜单 | 6 个                  | 10 个           | **高** - 需精简   |
| 页面数量 | 65 个                 | 58 个           | **中** - 部分缺失 |
| 组件库   | 自定义设计            | Antd + 自定义   | **低** - 基本符合 |
| 样式系统 | Tailwind CSS          | Antd CSS + 内联 | **高** - 需重构   |
| 字体系统 | Fira Sans + Fira Code | 系统默认字体    | **高** - 需配置   |
| 响应式   | 完整规范              | 部分实现        | **中** - 需完善   |

### 升级优先级

```
P0 (立即处理) → 导航结构重构、路由规范化
P1 (短期处理) → 样式系统迁移、字体配置
P2 (中期处理) → 缺失页面开发、组件增强
P3 (长期优化) → 性能优化、可访问性完善
```

---

## 二、导航结构差异

### 2.1 一级菜单对比

| 设计系统要求 | 当前实现   | 状态                |
| ------------ | ---------- | ------------------- |
| 首页         | 首页       | ✅ 已对齐           |
| 数据项目     | 数据项目   | ✅ 已对齐           |
| 数据集成     | 数据集成   | ✅ 已对齐           |
| 数据治理     | 数据治理   | ✅ 已对齐           |
| 数据服务     | 数据服务   | ⚠️ 需整合共享和分析 |
| 系统管理     | 系统管理   | ✅ 已对齐           |
| -            | 元数据管理 | ❌ 应归入数据治理   |
| -            | 数据组织   | ❌ 应归入数据集成   |
| -            | 数据安全   | ❌ 应归入系统管理   |
| -            | 数据分析   | ❌ 应归入数据服务   |
| -            | 数据共享   | ❌ 应归入数据服务   |
| -            | 基础设施   | ❌ 应归入数据集成   |

### 2.2 导航重构任务

```diff
# 当前实现 (10 个一级菜单)
- 首页
- 数据项目
- 数据集成 (4 子菜单)
- 数据服务 (2 子菜单)
- 元数据管理 (1 子菜单)
- 数据组织 (2 子菜单)
- 数据治理 (6 子菜单)
- 数据安全 (3 子菜单)
- 数据分析 (2 子菜单)
- 数据共享 (4 子菜单)
- 基础设施 (5 子菜单)
- 系统管理 (5 子菜单)

# 设计系统要求 (6 个一级菜单)
+ 首页
+ 数据项目
  └── 项目列表
+ 数据集成
  ├── 数据源管理
  ├── 数据探查
  ├── 数据标准化
  ├── Spark SQL开发
  ├── 数据迁移
  │   └── 任务列表
  ├── 数据组织 (归入)
  │   ├── 资源目录
  │   └── 入库映射
  └── 基础设施 (归入)
      ├── 租户管理
      ├── 资源队列
      ├── Worker节点
      ├── 引擎配置
      └── 配置模板
+ 数据治理
  ├── 数据地图
  ├── 数据质量
  ├── 标签管理
  ├── 数据血缘
  ├── 数据标准
  ├── 数据模型
  └── 元数据管理 (归入)
      └── 元数据列表
+ 数据服务
  ├── 服务目录
  ├── 服务监控
  ├── 数据共享 (归入)
  │   ├── 首页
  │   ├── 事项任务
  │   ├── 资源管理
  │   └── 服务申请
  └── 自助分析 (归入)
      ├── 即席查询
      └── 可视化分析
+ 系统管理
  ├── 组织用户
  ├── 角色权限
  ├── 审批待办
  ├── 审批配置
  ├── 系统设置
  └── 数据安全 (归入)
      ├── 数据脱敏
      ├── 分级分类
      └── 数据水印
```

### 2.3 菜单代码修改点

**文件**: `src/components/layout/PageLayout.tsx`

```typescript
// 需要重构 menuItems 配置
// 当前: 10 个顶级菜单项
// 目标: 6 个顶级菜单项，按设计系统文档重新组织
```

---

## 三、路由结构差异

### 3.1 路由对比表

| 设计系统路由                    | 当前实现路由                   | 状态            |
| ------------------------------- | ------------------------------ | --------------- |
| `/`                             | `/`                            | ✅              |
| `/project`                      | `/project`                     | ✅              |
| `/project/[projectId]`          | `/project/[id]`                | ⚠️ 参数名不一致 |
| `/integration/sources`          | `/integration/sources`         | ✅              |
| `/integration/profiling`        | `/integration/profiling`       | ✅              |
| `/integration/standardization`  | `/integration/standardization` | ✅              |
| `/integration/sql-dev`          | `/integration/sql-dev`         | ✅              |
| `/integration/migration`        | ❌ 缺失                        | ❌              |
| `/integration/infrastructure/*` | `/infrastructure/*`            | ⚠️ 路径需调整   |
| `/governance/metadata`          | `/metadata/list`               | ⚠️ 路径需调整   |
| `/integration/organization/*`   | `/organization/*`              | ⚠️ 路径需调整   |
| `/service/catalog`              | `/service/catalog`             | ✅              |
| `/service/monitoring`           | `/service/monitoring`          | ✅              |
| `/sharing`                      | `/sharing/home`                | ⚠️ 路径需调整   |
| `/analytics/query`              | `/analytics/query`             | ✅              |
| `/system/security/*`            | `/security/*`                  | ⚠️ 路径需调整   |

### 3.2 路由重构任务清单

| 任务                                             | 涉及文件                               | 优先级 |
| ------------------------------------------------ | -------------------------------------- | ------ |
| 统一路由参数命名 `[projectId]`                   | `src/app/project/[id]/*`               | P0     |
| 迁移基础设施路由到 `/integration/infrastructure` | `src/app/infrastructure/*`             | P0     |
| 迁移元数据路由到 `/governance/metadata`          | `src/app/metadata/*`                   | P0     |
| 迁移数据组织路由到 `/integration/organization`   | `src/app/organization/*`               | P0     |
| 迁移数据安全路由到 `/system/security`            | `src/app/security/*`                   | P0     |
| 调整数据共享路由 `/sharing/home` → `/sharing`    | `src/app/sharing/*`                    | P1     |
| 新增数据迁移模块页面                             | 新建 `src/app/integration/migration/*` | P1     |

---

## 四、样式系统差异

### 4.1 字体配置

**设计系统要求**:

```css
@import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&family=Fira+Sans:wght@300;400;500;600;700&display=swap');

/* 字体使用 */
--font-heading: 'Fira Code', monospace;
--font-body: 'Fira Sans', sans-serif;
```

**当前实现**:

```css
/* globals.css - 使用系统默认字体 */
font-family:
  -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue',
  Arial, ...;
```

**任务**:

- [ ] 添加 Google Fonts 导入
- [ ] 配置 Tailwind 字体主题
- [ ] 更新 `globals.css` 字体变量
- [ ] 创建 `tailwind.config.ts` 配置

### 4.2 颜色系统

**设计系统定义**:

| 角色       | Hex     | 用途     |
| ---------- | ------- | -------- |
| Primary    | #2563EB | 主色调   |
| Secondary  | #3B82F6 | 次要色   |
| CTA        | #F97316 | 行动召唤 |
| Success    | #10B981 | 成功状态 |
| Warning    | #F59E0B | 警告状态 |
| Error      | #EF4444 | 错误状态 |
| Processing | #3B82F6 | 处理中   |

**当前实现**:

```css
:root {
  --ant-primary-color: #1890ff; /* 与设计系统不符 */
  --ant-success-color: #52c41a; /* 与设计系统不符 */
  --ant-warning-color: #faad14; /* 与设计系统不符 */
  --ant-error-color: #ff4d4f; /* 与设计系统不符 */
}
```

**任务**:

- [ ] 统一 CSS 变量到设计系统规范
- [ ] 配置 Antd 主题色
- [ ] 创建 Tailwind 颜色配置

### 4.3 间距系统

**设计系统定义**:

| Unit | Pixels | Usage           |
| ---- | ------ | --------------- |
| 1    | 4px    | Minimal spacing |
| 2    | 8px    | Inside element  |
| 3    | 12px   | Compact         |
| 4    | 16px   | Standard        |
| 6    | 24px   | Block spacing   |
| 8    | 32px   | Section spacing |
| 12   | 48px   | Chapter spacing |

**当前实现**: 部分使用内联样式硬编码

**任务**:

- [ ] 创建 Tailwind 间距配置
- [ ] 替换硬编码间距为 Tailwind 类

### 4.4 Z-Index 规范

**设计系统定义**:

| Component      | Z-Index |
| -------------- | ------- |
| Dropdown       | 10      |
| Sticky Header  | 20      |
| Modal Backdrop | 30      |
| Modal Content  | 40      |
| Toast / Popup  | 50      |

**任务**:

- [ ] 创建 `z-index.css` 变量文件
- [ ] 审计现有 z-index 使用情况

---

## 五、组件实现差异

### 5.1 组件对比清单

| 组件           | 设计系统规范 | 当前实现       | 差距     |
| -------------- | ------------ | -------------- | -------- |
| StatusBadge    | ✅ 详细定义  | ✅ 已实现      | 符合     |
| KPICard        | ✅ 详细定义  | ✅ 已实现      | 符合     |
| DataTable      | ✅ 详细定义  | ✅ 已实现      | 符合     |
| CardGrid       | ✅ 详细定义  | ✅ 已实现      | 符合     |
| FilterBar      | ✅ 详细定义  | ✅ 已实现      | 符合     |
| PageBreadcrumb | ✅ 详细定义  | ✅ 已实现      | 符合     |
| TabsLayout     | ✅ 详细定义  | ✅ 已实现      | 符合     |
| ModalForm      | ✅ 详细定义  | ✅ 已实现      | 符合     |
| DirectoryTree  | ✅ 详细定义  | ✅ 已实现      | 符合     |
| EmptyState     | ✅ 详细定义  | ⚠️ 内联实现    | 需组件化 |
| LoadingState   | ✅ 详细定义  | ⚠️ 仅使用 Antd | 需封装   |
| ErrorState     | ✅ 详细定义  | ❌ 缺失        | 需开发   |
| MultiStepForm  | ✅ 详细定义  | ❌ 缺失        | 需开发   |
| ProgressBar    | ✅ 详细定义  | ⚠️ 仅使用 Antd | 需封装   |

### 5.2 需新增的组件

#### EmptyState 组件

```tsx
// 设计系统规范: MASTER.md Empty State规范
interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  scenario:
    | 'no-data'
    | 'no-permission'
    | 'search-empty'
    | 'network-error'
    | 'task-complete';
}
```

#### LoadingState 组件

```tsx
// 设计系统规范: MASTER.md Loading State规范
interface LoadingStateProps {
  type: 'skeleton' | 'spinner' | 'progress';
  skeletonVariant?: 'card' | 'table' | 'text';
  progress?: {
    value: number;
    estimatedTime?: string;
  };
}
```

#### MultiStepForm 组件

```tsx
// 设计系统规范: MASTER.md Multi-Step Form规范
interface MultiStepFormProps {
  steps: Array<{
    key: string;
    title: string;
    description?: string;
    fields: FormFieldConfig[];
  }>;
  onComplete: (data: Record<string, unknown>) => void;
  saveDraft?: boolean;
  defaultValues?: Record<string, unknown>;
}
```

---

## 六、页面实现差异

### 6.1 缺失页面清单

| 页面             | 路由                                   | 设计系统文档 | 优先级 |
| ---------------- | -------------------------------------- | ------------ | ------ |
| 数据迁移任务列表 | `/integration/migration`               | ✅           | P1     |
| 数据迁移任务配置 | `/integration/migration/create`        | ✅           | P1     |
| 数据迁移任务详情 | `/integration/migration/[taskId]`      | ✅           | P1     |
| 数据迁移任务日志 | `/integration/migration/[taskId]/logs` | ✅           | P2     |
| 数据源配置       | `/integration/sources/new`             | ✅           | P1     |
| 数据源详情       | `/integration/sources/[id]`            | ✅           | P2     |
| 服务授权管理     | `/service/authorization/[id]`          | ✅           | P2     |
| 用户详情         | `/system/user/[userId]`                | ✅           | P2     |

### 6.2 页面功能差异

#### 首页仪表盘

| 功能点       | 设计系统             | 当前实现      | 差距           |
| ------------ | -------------------- | ------------- | -------------- |
| 欢迎区域     | ✅ 用户名 + 待办统计 | ⚠️ 简单欢迎   | 需增强         |
| 核心指标卡片 | ✅ 5 个              | ✅ 4 个       | 补充待审批卡片 |
| 今日待办事项 | ✅ 分类列表          | ⚠️ 简单列表   | 需增强         |
| 系统资源状态 | ✅ 队列+Worker       | ⚠️ 简单进度条 | 需增强         |
| 快捷入口     | ✅ 动态权限          | ⚠️ 硬编码     | 需增强         |
| 近期活动     | ✅ 时间线            | ✅ 已实现     | 符合           |
| 自动刷新机制 | ✅ 详细定义          | ❌ 未实现     | 需开发         |

#### 项目详情页

| 功能点       | 设计系统         | 当前实现    | 差距   |
| ------------ | ---------------- | ----------- | ------ |
| Tab 导航     | ✅ 6 个 Tab      | ✅ 已实现   | 符合   |
| 任务调度入口 | ✅ DAG/任务/日志 | ✅ 已实现   | 符合   |
| DAG 编辑器   | ✅ React-Flow    | ⚠️ 基础实现 | 需增强 |
| 项目阶段进度 | ✅ 详细定义      | ✅ 已实现   | 符合   |

---

## 七、响应式设计差异

### 7.1 断点定义

**设计系统**:

| 断点    | 范围            | 容器宽度            |
| ------- | --------------- | ------------------- |
| Mobile  | < 768px         | 100% - 16px padding |
| Tablet  | 768px - 1024px  | 100% - 32px padding |
| Desktop | 1024px - 1440px | 1200px              |
| Large   | > 1440px        | 1400px (max)        |

**当前实现**: 未统一定义断点

### 7.2 响应式组件行为

| 组件     | 设计系统 Mobile | 当前实现 | 差距   |
| -------- | --------------- | -------- | ------ |
| 侧边导航 | 底部Drawer      | 折叠     | 需调整 |
| 表格     | 卡片列表替代    | 仅隐藏列 | 需重构 |
| Modal    | 全屏            | 居中     | 需调整 |
| 过滤栏   | 折叠Drawer      | 无响应式 | 需开发 |

### 7.3 特殊页面处理

**设计系统要求**:

| 页面     | 移动端方案              |
| -------- | ----------------------- |
| 数据血缘 | 简化视图 + 文字列表模式 |
| DAG编排  | 仅查看模式，提示桌面端  |
| SQL开发  | 仅查看SQL               |

**当前实现**: 未特殊处理

---

## 八、可访问性差异

### 8.1 图表可访问性

**设计系统要求**:

- 所有图表提供数据表格替代视图
- 颜色 + 图案双重区分数据系列
- 键盘导航支持
- ARIA 标签完整

**当前实现**: 基本未实现

### 8.2 表单可访问性

**设计系统要求**:

- 自动聚焦第一个错误字段
- aria-label 完整
- 键盘导航顺畅

**当前实现**: 部分实现

---

## 九、升级实施计划

### Phase 1: 基础架构重构 (P0) - 2 周

| 任务                           | 预估工时 | 负责人 |
| ------------------------------ | -------- | ------ |
| 导航菜单重构 (10 → 6 一级菜单) | 2d       | -      |
| 路由结构重组                   | 3d       | -      |
| Tailwind 配置初始化            | 1d       | -      |
| Antd 主题色调整                | 1d       | -      |
| 字体系统配置                   | 0.5d     | -      |
| CSS 变量统一                   | 0.5d     | -      |

### Phase 2: 组件系统完善 (P1) - 3 周

| 任务                   | 预估工时 | 负责人 |
| ---------------------- | -------- | ------ |
| EmptyState 组件开发    | 1d       | -      |
| LoadingState 组件开发  | 1d       | -      |
| MultiStepForm 组件开发 | 3d       | -      |
| 首页仪表盘增强         | 3d       | -      |
| 数据迁移模块页面开发   | 5d       | -      |
| 响应式布局适配         | 3d       | -      |

### Phase 3: 功能补全 (P2) - 3 周

| 任务               | 预估工时 | 负责人 |
| ------------------ | -------- | ------ |
| 缺失详情页开发     | 3d       | -      |
| 数据源配置流程开发 | 2d       | -      |
| DAG 编辑器增强     | 3d       | -      |
| 图表可访问性增强   | 2d       | -      |
| 自动刷新机制实现   | 1d       | -      |

### Phase 4: 优化完善 (P3) - 2 周

| 任务             | 预估工时 | 负责人 |
| ---------------- | -------- | ------ |
| 性能优化         | 2d       | -      |
| E2E 测试补充     | 3d       | -      |
| 可访问性审计修复 | 2d       | -      |
| 文档更新         | 1d       | -      |

---

## 十、风险与依赖

### 风险项

| 风险                   | 影响 | 缓解措施       |
| ---------------------- | ---- | -------------- |
| 路由变更导致旧链接失效 | 高   | 添加路由重定向 |
| 导航结构变更用户适应   | 中   | 提供用户引导   |
| 组件重构影响现有功能   | 中   | 完善测试覆盖   |

### 依赖项

| 依赖             | 状态   | 说明           |
| ---------------- | ------ | -------------- |
| Tailwind CSS 3.x | 需安装 | 样式系统基础   |
| Lucide React     | 已安装 | 图标库         |
| React-Flow       | 需安装 | DAG 编辑器增强 |
| Fira Sans 字体   | 需配置 | Google Fonts   |

---

## 十一、验收标准

### 导航结构

- [ ] 一级菜单精简为 6 个
- [ ] 所有二级菜单按设计系统文档归类
- [ ] 路由参数命名统一

### 样式系统

- [ ] 所有颜色使用设计系统定义
- [ ] 字体配置符合设计系统
- [ ] 间距使用 Tailwind 标准类

### 组件系统

- [ ] 所有基础 UI 组件有单元测试
- [ ] EmptyState、LoadingState 组件可用
- [ ] MultiStepForm 组件支持草稿保存

### 页面功能

- [ ] 首页具备完整待办和资源状态
- [ ] 数据迁移模块完整可用
- [ ] 响应式布局在移动端可用

### 可访问性

- [ ] 所有图表有数据表格替代
- [ ] 键盘导航完整可用
- [ ] 颜色对比度符合 WCAG AA

---

## 附录 A: 文件修改清单

### 需要修改的文件

```
src/
├── app/
│   ├── layout.tsx                    # 字体配置
│   ├── page.tsx                      # 首页增强
│   ├── project/[id]/                 # 重命名为 [projectId]
│   ├── infrastructure/               # 迁移到 integration/infrastructure
│   ├── metadata/                     # 迁移到 governance/metadata
│   ├── organization/                 # 迁移到 integration/organization
│   ├── security/                     # 迁移到 system/security
│   └── integration/migration/        # 新增
├── components/
│   ├── layout/
│   │   └── PageLayout.tsx            # 菜单重构
│   └── ui/
│       ├── EmptyState.tsx            # 新增
│       ├── LoadingState.tsx          # 新增
│       └── MultiStepForm.tsx         # 新增
├── styles/
│   └── globals.css                   # 样式变量重构
├── constants/
│   └── index.ts                      # 路由常量更新
└── tailwind.config.ts                # 新增配置
```

### 需要新增的文件

```
src/
├── app/
│   └── integration/
│       ├── migration/
│       │   ├── page.tsx
│       │   ├── create/page.tsx
│       │   └── [taskId]/
│       │       ├── page.tsx
│       │       └── logs/page.tsx
│       └── infrastructure/
│           ├── tenant/page.tsx
│           ├── queue/page.tsx
│           ├── worker/page.tsx
│           ├── engine/page.tsx
│           └── template/page.tsx
└── components/
    └── ui/
        ├── EmptyState.tsx
        ├── LoadingState.tsx
        └── MultiStepForm.tsx
```

---

## 附录 B: 参考文档

- [MASTER.md](docs/design-system/MASTER.md) - 全局设计规范
- [navigation.md](docs/design-system/navigation.md) - 导航结构设计
- [pages/index.md](docs/design-system/pages/index.md) - 页面索引
- [nextjs-frontend-dev-rules.md](.claude/rules/nextjs-frontend-dev-rules.md) - 开发规范

---

_文档维护: 前端开发团队_
_最后更新: 2026-04-03_
