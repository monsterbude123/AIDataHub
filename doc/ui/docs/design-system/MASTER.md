# AIDataHub 数据中台 - 设计系统 MASTER

> 全局设计规范，页面级规范在 `pages/` 目录下覆盖此规范

---

## Product

**Name**: AIDataHub 企业级数据中台
**Type**: Enterprise SaaS / Big Data Platform / Admin Dashboard
**Industry**: Government / Enterprise Data Platform
**Style**: Data-Dense Dashboard
**Mood**: Professional, Technical, Precise

## Color Palette

| Role                 | Hex     |
| -------------------- | ------- |
| Primary              | #2563EB |
| Secondary            | #3B82F6 |
| CTA                  | #F97316 |
| Background Light     | #F8FAFC |
| Background Dark      | #0F172A |
| Surface Light        | #FFFFFF |
| Surface Dark         | #1E293B |
| Text Primary Light   | #1E293B |
| Text Primary Dark    | #F1F5F9 |
| Text Secondary Light | #475569 |
| Text Secondary Dark  | #94A3B8 |
| Border Light         | #E2E8F0 |
| Border Dark          | #334155 |

### Status Colors

| Status     | Hex     |
| ---------- | ------- |
| Success    | #10B981 |
| Warning    | #F59E0B |
| Error      | #EF4444 |
| Processing | #3B82F6 |
| Pending    | #6B7280 |

### Sensitivity Level Colors

| Level        | Hex     |
| ------------ | ------- |
| Public       | #10B981 |
| Internal     | #3B82F6 |
| Secret       | #F59E0B |
| Confidential | #EF4444 |

## Typography

- **Heading Font**: Fira Code
- **Body Font**: Fira Sans
- **Base Size**: 16px
- **Line Height Body**: 1.5-1.75
- **Max Line Length**: 65-75 characters

### Type Scale

| Level      | Size | Weight |
| ---------- | ---- | ------ |
| H1         | 28px | 700    |
| H2         | 24px | 600    |
| H3         | 20px | 600    |
| H4         | 16px | 600    |
| Body       | 16px | 400    |
| Body Small | 14px | 400    |
| Caption    | 12px | 300    |

### Google Fonts Import

```css
@import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&family=Fira+Sans:wght@300;400;500;600;700&display=swap');
```

## Layout

### Grid System

- **Breakpoints**:
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: 1024px - 1440px
  - Large: > 1440px

- **Max Container Width**: 1400px
- **Spacing Base**: 4px
- **Gutter**: 16px (4 units)

### Z-Index Scale

| Component      | Z-Index |
| -------------- | ------- |
| Dropdown       | 10      |
| Sticky Header  | 20      |
| Modal Backdrop | 30      |
| Modal Content  | 40      |
| Toast / Popup  | 50      |

### Spacing Scale

| Unit | Pixels | Usage           |
| ---- | ------ | --------------- |
| 1    | 4px    | Minimal spacing |
| 2    | 8px    | Inside element  |
| 3    | 12px   | Compact         |
| 4    | 16px   | Standard        |
| 6    | 24px   | Block spacing   |
| 8    | 32px   | Section spacing |
| 12   | 48px   | Chapter spacing |

## Interaction

### Animation

- **Micro-interactions**: 150-300ms
- **Page transitions**: 300ms
- **Animate only**: transform and opacity
- **Avoid**: animate width, height, top, left

### Touch Targets

- **Minimum**: 44x44px
- **All interactive elements** must meet this requirement

### Feedback States

- **Hover**: background color change + cursor-pointer
- **Focus**: visible focus ring (keyboard navigation)
- **Active**: darker color
- **Disabled**: 50% opacity + cursor-not-allowed
- **Loading**: button disabled + spinner

## Icons

- **Icon Library**: Heroicons v2 or Lucide React
- **Size Consistency**: 24x24 viewBox with w-6 h-6
- **No emojis as UI icons**
- **Brand Logos**: Use official SVG from Simple Icons

## Accessibility (Priority: CRITICAL)

- [ ] Color contrast ≥ 4.5:1 for normal text
- [ ] Color contrast ≥ 3:1 for large text
- [ ] Visible focus states for all interactive elements
- [ ] Descriptive alt text for meaningful images
- [ ] aria-label for icon-only buttons
- [ ] Tab order matches visual order
- [ ] Proper label association for form inputs
- [ ] Color is not the only indicator
- [ ] Respect prefers-reduced-motion

## Anti-Patterns to Avoid

- ❌ Ornate decorative design - function first for data platform
- ❌ No filtering capabilities on data-dense pages
- ❌ Arbitrary large z-index values (use scale system)
- [❌ Loading everything upfront - use lazy loading
- ❌ Emojis as icons - use SVG icons
- ❌ Hover-only value display on charts - always visible text

## Chart Type Selection Guide

| Data Type                 | Best Chart                  | Secondary       |
| ------------------------- | --------------------------- | --------------- |
| Multiple KPIs vs Target   | Bullet Chart Grid           | Multiple Gauges |
| Single KPI vs Target      | Gauge                       | Progress Bar    |
| Task Status Distribution  | Pie / Donut                 | Bar             |
| Time Series Trend         | Line Chart                  | Area Chart      |
| TOP 10 Ranking            | Horizontal Bar              | Vertical Bar    |
| Data Storage Hierarchy    | Treemap                     | Sunburst        |
| Data Lineage / DAG        | Directed Graph (React-Flow) | Cytoscape       |
| Process Flow / Bottleneck | Process Map                 | DAG             |

## Recommended Libraries

- **Charts**: Recharts (basic), ApexCharts (business), D3.js (custom)
- **Graphs / DAG**: React-Flow (simple), Cytoscape.js (complex)
- **Icons**: Heroicons, Lucide React
- **Tables**: TanStack Table (React Table)
- **Forms**: React Hook Form
- **Validation**: Zod

---

## Empty State规范

空状态用于列表页无数据、搜索无结果、无权限访问等场景。

### 空状态组成

| 元素     | 规格                       | 说明                       |
| -------- | -------------------------- | -------------------------- |
| 图标     | 64x64px, #94A3B8           | 使用 Lucide 图标，灰色     |
| 主文案   | Body (16px), #475569       | 描述当前状态               |
| 副文案   | Body Small (14px), #94A3B8 | 引导用户操作（可选）       |
| 操作按钮 | Primary Button             | 引导用户创建或操作（可选） |

### 空状态场景模板

| 场景       | 图标           | 主文案           | 副文案                   | 操作按钮   |
| ---------- | -------------- | ---------------- | ------------------------ | ---------- |
| 无数据     | `database-off` | "暂无数据"       | "点击下方按钮创建第一个" | "新建XX"   |
| 无权限     | `lock`         | "无访问权限"     | "请联系管理员申请权限"   | "申请权限" |
| 搜索无结果 | `search-x`     | "未找到匹配结果" | "请尝试其他搜索条件"     | "清空筛选" |
| 网络错误   | `wifi-off`     | "网络连接失败"   | "请检查网络连接后重试"   | "重新加载" |
| 任务完成   | `check-circle` | "任务已全部完成" | "暂无待处理任务"         | -          |

### 空状态样式

```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  min-height: 300px;
}

.empty-state-icon {
  width: 64px;
  height: 64px;
  color: #94a3b8;
  margin-bottom: 16px;
}

.empty-state-title {
  font-size: 16px;
  color: #475569;
  margin-bottom: 8px;
}

.empty-state-description {
  font-size: 14px;
  color: #94a3b8;
  margin-bottom: 24px;
}
```

---

## Loading State规范

加载状态用于数据加载、操作执行、长时任务等场景。

### 加载类型选择

| 场景         | 加载方式       | 说明                         |
| ------------ | -------------- | ---------------------------- |
| 页面初始加载 | Skeleton       | 保持布局稳定，减少视觉跳动   |
| 按钮操作     | Button Spinner | 按钮内显示 Spinner，按钮禁用 |
| 局部刷新     | Spinner        | 局部区域 Spinner 覆盖        |
| 长时任务     | Progress Bar   | 显示进度百分比 + 预估时间    |

### Skeleton规范

| 元素            | 尺寸           | 样式                     |
| --------------- | -------------- | ------------------------ |
| 卡片 Skeleton   | 与实际卡片相同 | 圆角 8px, 背景 #E2E8F0   |
| 表格行 Skeleton | 高度 48px      | 背景 #E2E8F0, 动画 pulse |
| 文本 Skeleton   | 高度 16px      | 圆角 4px, 宽度按实际比例 |

**Skeleton动画**:

```css
.skeleton {
  background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

@keyframes skeleton-pulse {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
```

### Spinner规范

| 尺寸 | 使用场景 | 颜色                     |
| ---- | -------- | ------------------------ |
| 16px | 按钮内部 | Primary (#2563EB) 或白色 |
| 24px | 局部加载 | Primary (#2563EB)        |
| 40px | 页面加载 | Primary (#2563EB)        |

### Progress Bar规范

| 属性   | 规格                                               |
| ------ | -------------------------------------------------- |
| 高度   | 8px (默认) / 4px (紧凑)                            |
| 背景   | #E2E8F0                                            |
| 进度色 | #2563EB (进行中) / #10B981 (完成) / #EF4444 (失败) |
| 文字   | 进度百分比 + 预估剩余时间                          |

**长时任务进度显示**:

```
┌─────────────────────────────────────────────────────────────┐
│ 正在处理数据...                                               │
│ ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ 35%  ·  预估剩余时间: 2分30秒                    [取消]       │
└─────────────────────────────────────────────────────────────┘
```

---

## Error Handling规范

错误处理分为表单验证错误、API请求错误、系统错误三类。

### 表单验证错误

| 元素         | 规格               | 说明                 |
| ------------ | ------------------ | -------------------- |
| 错误提示位置 | 字段下方           | 紧贴输入框           |
| 错误文字     | 12px, #EF4444      | 红色提示文案         |
| 输入框状态   | 边框 #EF4444       | 红色边框标识错误字段 |
| 聚焦行为     | 自动聚焦第一个错误 | 提交失败后           |

**表单错误样式**:

```css
.input-error {
  border-color: #ef4444;
}

.input-error-message {
  font-size: 12px;
  color: #ef4444;
  margin-top: 4px;
}
```

### API请求错误

| 错误类型        | Toast样式        | 操作               |
| --------------- | ---------------- | ------------------ |
| 网络错误        | 红色背景, 5s显示 | 显示"重试"按钮     |
| 服务端错误(500) | 红色背景, 5s显示 | 显示"重试"按钮     |
| 业务错误(400)   | 红色背景, 3s显示 | 无                 |
| 权限错误(403)   | 红色背景, 5s显示 | 显示"申请权限"链接 |

**Toast样式**:

```css
.toast-error {
  background: #fee2e2;
  border: 1px solid #ef4444;
  color: #b91c1c;
  padding: 12px 16px;
  border-radius: 8px;
}
```

### 系统错误页

| 错误码 | 图标            | 主文案       | 副文案                       | 操作                    |
| ------ | --------------- | ------------ | ---------------------------- | ----------------------- |
| 404    | `file-question` | "页面不存在" | "您访问的页面已被删除或移动" | "返回首页"              |
| 403    | `lock`          | "无访问权限" | "您没有权限访问此页面"       | "申请权限" / "返回首页" |
| 500    | `server-crash`  | "系统异常"   | "系统暂时无法处理您的请求"   | "联系支持" / "重试"     |

**错误页布局**:

```
┌───────────────────────────────────┐
│                                   │
│          [错误图标 80px]          │
│                                   │
│          页面不存在               │
│   您访问的页面已被删除或移动       │
│                                   │
│         [返回首页]                │
│                                   │
└───────────────────────────────────┘
```

---

## Form Field规范

表单字段统一规范，确保跨页面一致性。

### 输入框尺寸

| 尺寸          | 高度 | 使用场景         |
| ------------- | ---- | ---------------- |
| Small         | 32px | 紧凑布局、筛选栏 |
| Medium (默认) | 40px | 标准表单         |
| Large         | 48px | 强调字段         |

### 输入框样式

| 状态 | 边框         | 背景    | 说明           |
| ---- | ------------ | ------- | -------------- |
| 默认 | #E2E8F0, 1px | #FFFFFF | 未聚焦         |
| 聚焦 | #2563EB, 2px | #FFFFFF | 键盘聚焦或有值 |
| 错误 | #EF4444, 1px | #FEF2F2 | 验证失败       |
| 禁用 | #E2E8F0, 1px | #F1F5F9 | 不可编辑       |
| 只读 | #E2E8F0, 1px | #F8FAFC | 可查看不可编辑 |

### 字段类型规范

#### Input (文本输入)

| 属性     | 规格                   |
| -------- | ---------------------- |
| 高度     | 40px (默认)            |
| 内边距   | 12px 左右              |
| 字体     | 16px, Body             |
| 最大长度 | 默认无限制，按业务设置 |

#### TextArea (多行文本)

| 属性     | 规格                                     |
| -------- | ---------------------------------------- |
| 最小行数 | 3行                                      |
| 最大行数 | 6行 (自动扩展)                           |
| 内边距   | 12px                                     |
| 字体     | 16px, Body                               |
| 字数限制 | 按业务设置，右下角显示 "已输入 X/最大 Y" |

#### Select (下拉选择)

| 属性     | 规格                     |
| -------- | ------------------------ |
| 高度     | 40px (默认)              |
| 下拉面板 | 最大高度 320px, 超出滚动 |
| 选项高度 | 36px                     |
| 搜索     | 选项超过10个启用搜索     |
| 多选     | 选中项显示为标签，可删除 |

#### DatePicker (日期选择)

| 属性     | 规格                                          |
| -------- | --------------------------------------------- |
| 格式     | YYYY-MM-DD (默认) / YYYY-MM-DD HH:mm (含时间) |
| 范围选择 | 两个 DatePicker 组合                          |
| 禁用日期 | 按业务规则禁用未来/过去日期                   |
| 快捷选项 | "今天"、"最近7天"、"最近30天" 等              |

#### NumberInput (数字输入)

| 属性   | 规格                     |
| ------ | ------------------------ |
| 步进   | 默认 1, 按业务设置       |
| 最小值 | 按业务设置               |
| 最大值 | 按业务设置               |
| 精度   | 默认整数, 可设置小数位数 |

### 表单标签规范

| 属性     | 规格                                    |
| -------- | --------------------------------------- |
| 标签位置 | 输入框上方 (默认) / 左侧对齐 (横向表单) |
| 标签宽度 | 左侧对齐时 120px                        |
| 标签字体 | 14px, Body, #1E293B                     |
| 必填标识 | 红色星号 (\*) 在标签后                  |
| 帮助提示 | 问号图标悬浮显示 Tooltip                |

---

## Card组件规范

卡片组件用于数据源、服务目录、项目列表等网格展示场景。

### 卡片尺寸

| 布局              | 宽度          | 间距     |
| ----------------- | ------------- | -------- |
| 桌面 (≥1024px)    | 280px - 320px | 16px gap |
| 平板 (768-1024px) | 240px         | 12px gap |
| 移动端 (<768px)   | 100%          | 12px gap |

### 卡片结构

```
┌──────────────────────────────────────┐
│ ┌────┐                               │
│ │图标│  标题 (16px, 粗体)             │  ← Header区
│ └────┘                               │
│                                      │
│ 描述文字 (14px, 两行截断, #475569)    │  ← 内容区
│                                      │
│ 元信息: 创建人 · 创建时间             │  ← 元信息区
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ 状态标签  ·  统计数据             │ │  ← 状态区
│ └──────────────────────────────────┘ │
│                                      │
│ [操作1] [操作2] [操作菜单 ▼]         │  ← 操作区
└──────────────────────────────────────┘
```

### 卡片样式规范

| 区域       | 规格                                            |
| ---------- | ----------------------------------------------- |
| 整体       | 圆角 8px, 背景 #FFFFFF, 边框 #E2E8F0            |
| 内边距     | 16px                                            |
| Header图标 | 40x40px, 圆角 8px                               |
| 标题       | 16px, #1E293B, fontWeight 600                   |
| 描述       | 14px, #475569, max-height 40px, overflow hidden |
| 元信息     | 12px, #94A3B8                                   |
| 操作按钮   | 32px 高度, 次按钮样式                           |

### 卡片状态样式

| 状态          | 标签颜色         | 边框         |
| ------------- | ---------------- | ------------ |
| 正常/已发布   | #10B981 绿色实心 | 默认         |
| 处理中        | #3B82F6 蓝色实心 | 默认         |
| 未发布/待审核 | #6B7280 灰色实心 | 默认         |
| 已下线/失败   | #EF4444 红色实心 | 默认         |
| 警告/异常     | #F59E0B 黄色实心 | #F59E0B 边框 |

### 卡片交互

| 交互      | 行为                           |
| --------- | ------------------------------ |
| Hover     | 背景变为 #F8FAFC, 显示操作按钮 |
| Click标题 | 跳转详情页                     |
| Click操作 | 执行对应操作                   |
| 右键菜单  | 复制/删除/导出等扩展操作       |

---

## Table列宽标准

表格列宽统一标准，确保不同页面表格视觉一致。

### 标准列宽定义

| 列类型           | 推荐宽度  | 最小宽度 | 说明                   |
| ---------------- | --------- | -------- | ---------------------- |
| 标识列 (ID/编号) | 100-120px | 80px     | 固定宽度，显示完整编号 |
| 名称列           | 180-200px | 150px    | 可搜索关键词           |
| 描述列           | 自适应    | 200px    | 弹性宽度，优先分配     |
| 类型列           | 100px     | 80px     | 显示类型标签           |
| 状态列           | 80-100px  | 60px     | 显示状态标签           |
| 数值列           | 100-120px | 80px     | 数字对齐右对齐         |
| 时间列           | 140-160px | 120px    | YYYY-MM-DD HH:mm       |
| 用户列           | 120-140px | 100px    | 头像 + 名称            |
| 操作列           | 120-150px | 100px    | 按钮组，固定右侧       |

### 列宽分配原则

1. **固定列优先**: 标识列、状态列、操作列使用固定宽度
2. **弹性列补充**: 描述列、名称列使用自适应
3. **最小宽度保障**: 所有列设置最小宽度，避免挤压
4. **操作列固定**: 操作列固定在右侧，不随横向滚动

### 表格整体规范

| 属性        | 规格                      |
| ----------- | ------------------------- |
| 表头高度    | 48px                      |
| 行高度      | 48px (默认) / 40px (紧凑) |
| 表头背景    | #F8FAFC                   |
| 行Hover背景 | #F1F5F9                   |
| 行选中背景  | #EFF6FF                   |
| 边框        | 1px, #E2E8F0              |
| 圆角        | 8px (表格外框)            |

---

## Multi-Step Form规范

多步骤表单用于新建租户、配置迁移任务等复杂配置场景。

### 步骤指示器

| 属性       | 规格                      |
| ---------- | ------------------------- |
| 步骤数显示 | 最多显示5步，超出使用折叠 |
| 当前步骤   | Primary色圆点 + 加粗文字  |
| 已完成步骤 | Success色圆点 + 勾选图标  |
| 未完成步骤 | 灰色圆点 + 浅色文字       |

**步骤指示器样式**:

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ① 基本信息 ─── ② 资源配额 ─── ③ 队列绑定 ─── ④ 引擎配置    │
│     ✓ 完成       ● 当前        ○ 待完成        ○ 待完成     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 导航按钮

| 按钮      | 位置 | 显示条件      | 说明               |
| --------- | ---- | ------------- | ------------------ |
| 上一步    | 左侧 | 步骤 > 1      | 次按钮样式         |
| 下一步    | 右侧 | 步骤 < 总步数 | 主按钮样式         |
| 提交/完成 | 右侧 | 步骤 = 总步数 | 主按钮样式         |
| 取消      | 左侧 | 所有步骤      | 文字按钮，二次确认 |

### 步骤验证

| 规则     | 说明                                   |
| -------- | -------------------------------------- |
| 单步验证 | 点击"下一步"前验证当前步骤所有必填字段 |
| 错误定位 | 验证失败自动定位第一个错误字段         |
| 阻止前进 | 当前步骤验证失败不允许进入下一步       |
| 完整验证 | 最后步骤提交前验证所有步骤数据         |

### 保存草稿

| 场景     | 行为                           |
| -------- | ------------------------------ |
| 自动保存 | 每步完成后自动保存草稿 (可选)  |
| 手动保存 | 提供"保存草稿"按钮             |
| 取消确认 | 取消时提示"未保存的数据将丢失" |
| 草稿恢复 | 重新进入时提示恢复草稿         |

### 多步骤表单布局

```
┌─────────────────────────────────────────────────────────────┐
│ [步骤指示器]                                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 当前步骤标题                                                 │
│ 步骤描述 (可选)                                              │
│                                                             │
│ ┌───────────────────────────────────────────────────────┐   │
│ │                                                       │   │
│ │ 表单字段区域                                           │   │
│ │                                                       │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ [取消] [保存草稿]                        [上一步] [下一步]   │
└─────────────────────────────────────────────────────────────┘
```

---

## Responsive Design规范

响应式断点定义，确保跨设备体验一致。

### 断点定义

| 断点    | 范围            | 容器宽度            | 布局调整             |
| ------- | --------------- | ------------------- | -------------------- |
| Mobile  | < 768px         | 100% - 16px padding | 单列, 侧边栏折叠     |
| Tablet  | 768px - 1024px  | 100% - 32px padding | 双列, 侧边栏图标模式 |
| Desktop | 1024px - 1440px | 1200px              | 多列, 侧边栏展开     |
| Large   | > 1440px        | 1400px (max)        | 最大容器宽度限制     |

### 响应式组件行为

| 组件     | Mobile               | Tablet       | Desktop   |
| -------- | -------------------- | ------------ | --------- |
| 侧边导航 | 底部Drawer或完全隐藏 | 48px图标模式 | 240px展开 |
| 表格     | 卡片列表替代         | 部分列隐藏   | 全列显示  |
| 卡片网格 | 1列                  | 2列          | 3-4列     |
| 表单     | 单列堆叠             | 单列堆叠     | 可双列    |
| Modal    | 全屏                 | 600px居中    | 600px居中 |
| 过滤栏   | 折叠Drawer           | 部分展开     | 全展开    |

### 移动端特殊处理

对于复杂交互页面（血缘分析、DAG编排、SQL开发），移动端需特殊处理：

| 页面     | 移动端方案                            |
| -------- | ------------------------------------- |
| 数据血缘 | 简化视图 + 文字列表模式，隐藏图形操作 |
| DAG编排  | 仅查看模式，提示"请在桌面端编辑"      |
| SQL开发  | 仅查看SQL，编辑提示跳转桌面           |

---

## Chart Accessibility规范

图表可访问性确保所有用户（包括视觉障碍用户）能够理解图表传达的信息。

### 颜色备用指示原则

**核心原则**: 颜色不能是唯一的信息传达方式。

| 信息类型 | 禁止做法         | 推荐做法               |
| -------- | ---------------- | ---------------------- |
| 数据系列 | 仅用颜色区分     | 颜色 + 图案/形状/标签  |
| 状态指示 | 仅用颜色标识     | 颜色 + 图标/文字       |
| 数据对比 | 仅用颜色对比     | 颜色 + 数值标签        |
| 趋势方向 | 仅用颜色表示涨跌 | 颜色 + 箭头图标 + 文字 |

### 图表类型可访问性规范

#### 柱状图/条形图

| 要求         | 实现方式                             |
| ------------ | ------------------------------------ |
| 数据系列区分 | 不同颜色 + 不同图案 (斜线/点状/交叉) |
| 数值显示     | 每个柱子显示数值标签                 |
| 替代文本     | 提供数据表格视图                     |
| 键盘导航     | Tab 键在各数据系列间切换             |

**图案示例**:

```css
.series-a {
  background: repeating-linear-gradient(
    45deg,
    #2563eb,
    #2563eb 2px,
    transparent 2px,
    transparent 4px
  );
}
.series-b {
  background: repeating-linear-gradient(
    -45deg,
    #10b981,
    #10b981 2px,
    transparent 2px,
    transparent 4px
  );
}
.series-c {
  background: radial-gradient(circle, #f59e0b 1px, transparent 1px);
  background-size: 4px 4px;
}
```

#### 折线图/面积图

| 要求         | 实现方式                             |
| ------------ | ------------------------------------ |
| 数据系列区分 | 不同颜色 + 不同线型 (实线/虚线/点线) |
| 数据点标记   | 不同形状标记 (圆形/方形/三角形/菱形) |
| 数值显示     | 关键数据点显示数值标签               |
| 替代文本     | 提供数据表格视图                     |

**线型示例**:

```css
.line-solid {
  stroke-dasharray: none;
}
.line-dashed {
  stroke-dasharray: 8, 4;
}
.line-dotted {
  stroke-dasharray: 2, 4;
}
```

**标记形状**:
| 系列 | 形状 | SVG |
|------|------|-----|
| 系列 A | 圆形 | `<circle>` |
| 系列 B | 方形 | `<rect>` |
| 系列 C | 三角形 | `<polygon points="0,-6 6,6 -6,6">` |
| 系列 D | 菱形 | `<polygon points="0,-6 6,0 0,6 -6,0">` |

#### 饼图/环形图

| 要求     | 实现方式                                 |
| -------- | ---------------------------------------- |
| 扇区区分 | 不同颜色 + 不同图案填充                  |
| 数值显示 | 每个扇区显示百分比标签                   |
| 替代文本 | 提供数据表格视图（类别 + 数值 + 百分比） |
| 交互     | 点击扇区显示详情，键盘可聚焦             |

**饼图数据表格**:

```
┌────────────────────────────────────┐
│ 销售分布数据表                      │
├────────────────────────────────────┤
│ 类别      │ 销售额    │ 占比       │
│ 产品A     │ ¥120万   │ 35%       │
│ 产品B     │ ¥85万    │ 25%       │
│ 产品C     │ ¥68万    │ 20%       │
│ 产品D     │ ¥51万    │ 15%       │
│ 其他      │ ¥17万    │ 5%        │
└────────────────────────────────────┘
```

#### 仪表盘/Gauge

| 要求     | 实现方式                             |
| -------- | ------------------------------------ |
| 数值显示 | 中央大号数字显示当前值               |
| 状态指示 | 颜色 + 文字标签 (正常/警告/异常)     |
| 目标线   | 虚线标识目标值 + 数值标签            |
| 替代文本 | 文字描述: "当前值 X，目标 Y，状态 Z" |

### 数据表格视图

所有图表必须提供数据表格作为替代视图：

```
┌─────────────────────────────────────────────────────────────┐
│ [图形视图] [表格视图]                                        │
├─────────────────────────────────────────────────────────────┤
│ 数据表格                                                     │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 月份   │ 销售额  │ 去年同期 │ 同比增长                   │ │
│ │ 1月    │ ¥120万  │ ¥100万  │ ↑ 20%                     │ │
│ │ 2月    │ ¥135万  │ ¥110万  │ ↑ 22.7%                   │ │
│ │ 3月    │ ¥142万  │ ¥125万  │ ↑ 13.6%                   │ │
│ │ ...    │ ...     │ ...     │ ...                       │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ [导出数据]                                                   │
└─────────────────────────────────────────────────────────────┘
```

**表格视图特性**:

- Tab 键可在单元格间导航
- 屏幕阅读器可正确读取
- 支持排序和筛选
- 支持导出 CSV/Excel

### ARIA 标签规范

#### 图表容器

```html
<figure
  role="figure"
  aria-labelledby="chart-title"
  aria-describedby="chart-desc"
>
  <figcaption id="chart-title">月度销售趋势图</figcaption>
  <div id="chart-desc" class="sr-only">
    折线图显示1月至6月销售趋势。销售额从120万增长到180万，
    整体呈上升趋势。6月达到最高值180万。
  </div>
  <!-- 图表内容 -->
</figure>
```

#### 图表摘要

每个图表需要提供文字摘要，放在图表下方：

```html
<div class="chart-summary" aria-live="polite">
  <p>
    <strong>图表摘要:</strong>
    1月销售额120万，6月销售额180万，半年增长50%。
    最高值出现在6月，最低值出现在2月。 整体趋势为稳步上升。
  </p>
</div>
```

### 键盘导航规范

| 按键     | 功能                        |
| -------- | --------------------------- |
| `Tab`    | 在图表间切换焦点            |
| `Enter`  | 进入图表内部导航模式        |
| `↑` `↓`  | 在数据系列间切换 (内部模式) |
| `←` `→`  | 在数据点间切换 (内部模式)   |
| `Escape` | 退出内部导航模式            |

**焦点样式**:

- 图表焦点: 2px 虚线边框
- 数据点焦点: 高亮显示 + Tooltip 展开

### 高对比度模式

| 图表元素 | 普通模式  | 高对比度模式    |
| -------- | --------- | --------------- |
| 背景     | 白色/浅色 | 白色            |
| 数据线   | 彩色      | 黑色 + 不同线型 |
| 数据点   | 彩色填充  | 黑色 + 不同形状 |
| 文字     | 深灰色    | 黑色            |
| 网格线   | 浅灰色    | 黑色虚线        |

### 颜色对比度要求

| 元素         | 最小对比度 | 推荐对比度 |
| ------------ | ---------- | ---------- |
| 文字 (≥18px) | 3:1        | 4.5:1      |
| 文字 (<18px) | 4.5:1      | 7:1        |
| 图标/图形    | 3:1        | 4.5:1      |
| 焦点指示     | 3:1        | 4.5:1      |

### 可访问性检查清单

- [ ] 所有数据系列使用颜色 + 图案/形状双重区分
- [ ] 关键数据点显示数值标签
- [ ] 提供数据表格作为替代视图
- [ ] 图表有描述性的标题和摘要
- [ ] 屏幕阅读器可正确读取图表信息
- [ ] 支持键盘导航
- [ ] 焦点状态清晰可见
- [ ] 支持高对比度模式
- [ ] 颜色对比度符合 WCAG AA 标准
- [ ] 提供导出数据功能

---

_This is the master design system. Page-specific overrides go in `pages/[page-name].md` and override these rules._
