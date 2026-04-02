"use client";

/**
 * 页面面包屑导航组件
 * 基于 Antd Breadcrumb 封装，统一面包屑样式
 */

import { Breadcrumb } from "antd";
import type { BreadcrumbProps } from "antd";
import { ChevronRight } from "lucide-react";

/**
 * 面包屑项配置
 */
export interface BreadcrumbItem {
  /** 显示标题 */
  title: string;
  /** 跳转路径（可选，无则仅展示） */
  href?: string;
}

/**
 * PageBreadcrumb 组件属性
 */
interface PageBreadcrumbProps {
  /** 面包屑项列表 */
  items: BreadcrumbItem[];
  /** 自定义类名 */
  className?: string;
  /** 额外的 Antd Breadcrumb 属性 */
  breadcrumbProps?: Omit<BreadcrumbProps, "items">;
}

/**
 * 渲染分隔符图标
 */
function SeparatorIcon() {
  return <ChevronRight size={14} />;
}

/**
 * 页面面包屑组件
 * @param items - 面包屑项列表
 * @param className - 自定义类名
 * @param breadcrumbProps - 额外的 Antd Breadcrumb 属性
 */
export function PageBreadcrumb({ items, className, breadcrumbProps }: PageBreadcrumbProps) {
  const breadcrumbItems = items.map((item) => ({
    title: item.href ? <a href={item.href}>{item.title}</a> : item.title,
  }));

  return (
    <Breadcrumb
      separator={<SeparatorIcon />}
      items={breadcrumbItems}
      style={{ marginBottom: 16 }}
      className={className}
      {...breadcrumbProps}
    />
  );
}