"use client";

/**
 * 过滤栏组件
 * 统一列表页搜索和过滤控件样式
 */

import { Input, Select, Button, Space } from "antd";
import type { InputProps, SelectProps, ButtonProps } from "antd";
import { Search, Filter, RefreshCw, Plus } from "lucide-react";

/**
 * 过滤项配置
 */
export interface FilterItem {
  /** 过滤项唯一标识 */
  key: string;
  /** 过滤项类型 */
  type: "search" | "select" | "date" | "custom";
  /** 过滤项占位文本 */
  placeholder?: string;
  /** Select 类型的选项配置 */
  options?: SelectProps["options"];
  /** 默认值 */
  defaultValue?: string | number;
  /** 额外的组件属性 */
  componentProps?: Record<string, unknown>;
}

/**
 * FilterBar 组件属性
 */
interface FilterBarProps {
  /** 过滤项配置列表 */
  filters: FilterItem[];
  /** 搜索/过滤回调 */
  onFilter?: (values: Record<string, string | number | undefined>) => void;
  /** 重置回调 */
  onReset?: () => void;
  /** 新增按钮回调 */
  onCreate?: () => void;
  /** 新增按钮文本 */
  createText?: string;
  /** 是否显示新增按钮 */
  showCreate?: boolean;
  /** 是否显示刷新按钮 */
  showRefresh?: boolean;
  /** 刷新回调 */
  onRefresh?: () => void;
  /** 加载状态 */
  loading?: boolean;
  /** 自定义类名 */
  className?: string;
}

/**
 * 渲染单个过滤控件
 */
function renderFilterItem(item: FilterItem): React.ReactNode {
  switch (item.type) {
    case "search":
      return (
        <Input
          key={item.key}
          placeholder={item.placeholder ?? "搜索..."}
          prefix={<Search size={14} />}
          allowClear
          style={{ width: 200 }}
          {...item.componentProps}
        />
      );
    case "select":
      return (
        <Select
          key={item.key}
          placeholder={item.placeholder ?? "请选择"}
          options={item.options}
          allowClear
          style={{ width: 150 }}
          defaultValue={item.defaultValue}
          {...item.componentProps}
        />
      );
    case "date":
      // 日期选择器需要单独引入 DatePicker
      return null;
    case "custom":
      // 自定义组件通过 componentProps.render 传入
      return item.componentProps?.render as React.ReactNode;
    default:
      return null;
  }
}

/**
 * 过滤栏组件
 * @param filters - 过滤项配置列表
 * @param onFilter - 搜索/过滤回调
 * @param onReset - 重置回调
 * @param onCreate - 新增按钮回调
 * @param createText - 新增按钮文本
 * @param showCreate - 是否显示新增按钮
 * @param showRefresh - 是否显示刷新按钮
 * @param onRefresh - 刷新回调
 * @param loading - 加载状态
 * @param className - 自定义类名
 */
export function FilterBar({
  filters,
  onFilter,
  onReset,
  onCreate,
  createText = "新增",
  showCreate = false,
  showRefresh = false,
  onRefresh,
  loading = false,
  className,
}: FilterBarProps) {
  return (
    <div
      className={className}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
        padding: "12px 16px",
        background: "#F8FAFC",
        borderRadius: 8,
      }}
    >
      {/* 左侧过滤控件 */}
      <Space size="middle">
        {filters.map(renderFilterItem)}
        {filters.length > 0 && (
          <Button icon={<Filter size={14} />} onClick={() => onFilter?.({})}>
            筛选
          </Button>
        )}
        {filters.length > 0 && (
          <Button icon={<RefreshCw size={14} />} onClick={() => onReset?.()}>
            重置
          </Button>
        )}
      </Space>

      {/* 右侧操作按钮 */}
      <Space>
        {showRefresh && (
          <Button
            icon={<RefreshCw size={14} />}
            onClick={onRefresh}
            loading={loading}
          >
            刷新
          </Button>
        )}
        {showCreate && (
          <Button type="primary" icon={<Plus size={14} />} onClick={onCreate}>
            {createText}
          </Button>
        )}
      </Space>
    </div>
  );
}