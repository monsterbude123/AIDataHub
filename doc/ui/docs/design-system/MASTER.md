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

| Role | Hex |
|------|-----|
| Primary | #2563EB |
| Secondary | #3B82F6 |
| CTA | #F97316 |
| Background Light | #F8FAFC |
| Background Dark | #0F172A |
| Surface Light | #FFFFFF |
| Surface Dark | #1E293B |
| Text Primary Light | #1E293B |
| Text Primary Dark | #F1F5F9 |
| Text Secondary Light | #475569 |
| Text Secondary Dark | #94A3B8 |
| Border Light | #E2E8F0 |
| Border Dark | #334155 |

### Status Colors

| Status | Hex |
|--------|-----|
| Success | #10B981 |
| Warning | #F59E0B |
| Error | #EF4444 |
| Processing | #3B82F6 |
| Pending | #6B7280 |

### Sensitivity Level Colors

| Level | Hex |
|-------|-----|
| Public | #10B981 |
| Internal | #3B82F6 |
| Secret | #F59E0B |
| Confidential | #EF4444 |

## Typography

- **Heading Font**: Fira Code
- **Body Font**: Fira Sans
- **Base Size**: 16px
- **Line Height Body**: 1.5-1.75
- **Max Line Length**: 65-75 characters

### Type Scale

| Level | Size | Weight |
|-------|------|--------|
| H1 | 28px | 700 |
| H2 | 24px | 600 |
| H3 | 20px | 600 |
| H4 | 16px | 600 |
| Body | 16px | 400 |
| Body Small | 14px | 400 |
| Caption | 12px | 300 |

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

| Component | Z-Index |
|-----------|---------|
| Dropdown | 10 |
| Sticky Header | 20 |
| Modal Backdrop | 30 |
| Modal Content | 40 |
| Toast / Popup | 50 |

### Spacing Scale

| Unit | Pixels | Usage |
|------|--------|-------|
| 1 | 4px | Minimal spacing |
| 2 | 8px | Inside element |
| 3 | 12px | Compact |
| 4 | 16px | Standard |
| 6 | 24px | Block spacing |
| 8 | 32px | Section spacing |
| 12 | 48px | Chapter spacing |

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

| Data Type | Best Chart | Secondary |
|-----------|------------|-----------|
| Multiple KPIs vs Target | Bullet Chart Grid | Multiple Gauges |
| Single KPI vs Target | Gauge | Progress Bar |
| Task Status Distribution | Pie / Donut | Bar |
| Time Series Trend | Line Chart | Area Chart |
| TOP 10 Ranking | Horizontal Bar | Vertical Bar |
| Data Storage Hierarchy | Treemap | Sunburst |
| Data Lineage / DAG | Directed Graph (React-Flow) | Cytoscape |
| Process Flow / Bottleneck | Process Map | DAG |

## Recommended Libraries

- **Charts**: Recharts (basic), ApexCharts (business), D3.js (custom)
- **Graphs / DAG**: React-Flow (simple), Cytoscape.js (complex)
- **Icons**: Heroicons, Lucide React
- **Tables**: TanStack Table (React Table)
- **Forms**: React Hook Form
- **Validation**: Zod

---

*This is the master design system. Page-specific overrides go in `pages/[page-name].md` and override these rules.*
