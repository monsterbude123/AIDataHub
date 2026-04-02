"use client";

/**
 * 标签页布局组件
 * 用于多功能页面的 Tabs 布局，统一标签页样式
 */

import { Tabs, Card } from "antd";
import type { TabsProps, CardProps } from "antd";
import { clsx } from "clsx";

/**
 * 标签页配置项
 */
export interface TabConfig {
  /** 标签页唯一标识 */
  key: string;
  /** 标签页标题 */
  label: string;
  /** 标签页图标 */
  icon?: React.ReactNode;
  /** 标签页内容 */
  content: React.ReactNode;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否隐藏 */
  hidden?: boolean;
}

/**
 * TabsLayout 组件属性
 */
interface TabsLayoutProps {
  /** 标签页配置列表 */
  tabs: TabConfig[];
  /** 默认激活的标签页 */
  defaultActiveKey?: string;
  /** 当前激活的标签页（受控模式） */
  activeKey?: string;
  /** 标签页切换回调 */
  onChange?: (activeKey: string) => void;
  /** 是否显示为卡片样式 */
  cardStyle?: boolean;
  /** 卡片属性 */
  cardProps?: CardProps;
  /** 额外的 Antd Tabs 属性 */
  tabsProps?: Omit<TabsProps, "items">;
  /** 自定义类名 */
  className?: string;
  /** 标签页位置 */
  position?: "top" | "left" | "right" | "bottom";
}

/**
 * 标签页布局组件
 */
export function TabsLayout({
  tabs,
  defaultActiveKey,
  activeKey,
  onChange,
  cardStyle = false,
  cardProps,
  tabsProps,
  className,
  position = "top",
}: TabsLayoutProps) {
  /**
   * 过滤隐藏的标签页
   */
  const visibleTabs = tabs.filter((tab) => !tab.hidden);

  /**
   * 转换为 Antd Tabs 数据格式
   */
  const tabsItems = visibleTabs.map((tab) => ({
    key: tab.key,
    label: (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
        {tab.icon}
        {tab.label}
      </span>
    ),
    children: tab.content,
    disabled: tab.disabled,
  }));

  /**
   * 渲染标签页内容
   */
  const tabsContent = (
    <Tabs
      defaultActiveKey={defaultActiveKey ?? visibleTabs[0]?.key}
      activeKey={activeKey}
      onChange={onChange}
      items={tabsItems}
      tabPosition={position}
      style={{ marginBottom: 0 }}
      {...tabsProps}
    />
  );

  if (cardStyle) {
    return (
      <Card className={className} style={{ marginBottom: 16 }} {...cardProps}>
        {tabsContent}
      </Card>
    );
  }

  return (
    <div className={className} style={{ marginBottom: 16 }}>
      {tabsContent}
    </div>
  );
}

/**
 * 带面包屑的标签页布局组件
 */
interface TabsLayoutWithBreadcrumbProps extends TabsLayoutProps {
  /** 面包屑项列表 */
  breadcrumbItems: Array<{ title: string; href?: string }>;
}

/**
 * 带面包屑的标签页布局组件
 */
export function TabsLayoutWithBreadcrumb({
  breadcrumbItems,
  tabs,
  ...tabsLayoutProps
}: TabsLayoutWithBreadcrumbProps) {
  return (
    <div>
      {/* 面包屑区域 */}
      <div style={{ marginBottom: 8 }}>
        <span style={{ color: "#475569" }}>
          {breadcrumbItems.map((item, index) => (
            <span key={index}>
              {index > 0 && <span style={{ margin: "0 8px" }}>/</span>}
              {item.href ? (
                <a href={item.href} style={{ color: "#2563EB" }}>
                  {item.title}
                </a>
              ) : (
                <span>{item.title}</span>
              )}
            </span>
          ))}
        </span>
      </div>

      {/* 标签页区域 */}
      <TabsLayout tabs={tabs} {...tabsLayoutProps} />
    </div>
  );
}