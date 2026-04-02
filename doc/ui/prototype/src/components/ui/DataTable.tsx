"use client";

/**
 * 数据表格组件
 * 基于 Antd Table 封装，统一表格样式和功能
 */

import { Table, Button, Dropdown, Space, Popconfirm, Tooltip } from "antd";
import type { TableProps, ButtonProps } from "antd";
import { Edit, Trash2, Eye, MoreHorizontal } from "lucide-react";
import type { Key } from "react";

/**
 * 表格操作项配置
 */
export interface TableActionItem {
  /** 操作项标识 */
  key: string;
  /** 操作项标题 */
  label: string;
  /** 操作项图标 */
  icon?: React.ReactNode;
  /** 是否危险操作（红色） */
  danger?: boolean;
  /** 是否需要确认 */
  confirm?: boolean;
  /** 确认提示文案 */
  confirmText?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 点击回调 */
  onClick?: (record: unknown) => void;
}

/**
 * 表格列配置（扩展 Antd 列配置）
 */
export interface TableColumnConfig {
  /** 列标识 */
  key: string;
  /** 列标题 */
  title: string;
  /** 数据字段名 */
  dataIndex: string;
  /** 列宽度 */
  width?: number;
  /** 是否固定列 */
  fixed?: "left" | "right";
  /** 是否可排序 */
  sorter?: boolean;
  /** 是否可筛选 */
  filter?: boolean;
  /** 渲染函数 */
  render?: (value: unknown, record: Record<string, unknown>, index: number) => React.ReactNode;
  /** 对齐方式 */
  align?: "left" | "center" | "right";
  /** 是否省略显示 */
  ellipsis?: boolean;
}

/**
 * DataTable 组件属性
 */
interface DataTableProps<T = Record<string, unknown>> {
  /** 表格列配置 */
  columns: TableColumnConfig[];
  /** 表格数据 */
  dataSource: T[];
  /** 操作列配置 */
  actions?: TableActionItem[];
  /** 操作列宽度 */
  actionColumnWidth?: number;
  /** 操作列标题 */
  actionColumnTitle?: string;
  /** 操作列固定位置 */
  actionColumnFixed?: "left" | "right";
  /** 行唯一标识字段 */
  rowKey?: string | ((record: T) => string);
  /** 是否显示分页 */
  pagination?: boolean | TableProps<T>["pagination"];
  /** 默认分页大小 */
  defaultPageSize?: number;
  /** 总数据量（用于分页） */
  total?: number;
  /** 当前页码 */
  currentPage?: number;
  /** 分页变化回调 */
  onPageChange?: (page: number, pageSize: number) => void;
  /** 加载状态 */
  loading?: boolean;
  /** 是否可选择行 */
  selectable?: boolean;
  /** 选中行回调 */
  onSelectionChange?: (selectedKeys: Key[], selectedRows: T[]) => void;
  /** 表格尺寸 */
  size?: "small" | "middle" | "large";
  /** 是否显示边框 */
  bordered?: boolean;
  /** 额外的 Antd Table 属性 */
  tableProps?: Omit<TableProps<T>, "columns" | "dataSource">;
  /** 自定义类名 */
  className?: string;
  /** 空数据提示 */
  emptyText?: string;
}

/**
 * 渲染操作列
 */
function renderActions(
  actions: TableActionItem[],
  record: unknown
) {
  if (actions.length <= 3) {
    return (
      <Space size="small">
        {actions.map((action) => {
          if (action.disabled) {
            return (
              <Tooltip key={action.key} title={action.label}>
                <Button
                  size="small"
                  type="text"
                  disabled
                  icon={action.icon}
                />
              </Tooltip>
            );
          }

          if (action.confirm) {
            return (
              <Popconfirm
                key={action.key}
                title={action.confirmText ?? `确认${action.label}?`}
                onConfirm={() => action.onClick?.(record)}
              >
                <Button
                  size="small"
                  type="text"
                  danger={action.danger}
                  icon={action.icon}
                />
              </Popconfirm>
            );
          }

          return (
            <Tooltip key={action.key} title={action.label}>
              <Button
                size="small"
                type="text"
                danger={action.danger}
                icon={action.icon}
                onClick={() => action.onClick?.(record)}
              />
            </Tooltip>
          );
        })}
      </Space>
    );
  }

  /**
   * 操作项超过 3 个，使用下拉菜单
   */
  const dropdownItems = actions.map((action) => ({
    key: action.key,
    label: action.label,
    icon: action.icon,
    danger: action.danger,
    disabled: action.disabled,
  }));

  return (
    <Dropdown
      menu={{
        items: dropdownItems,
        onClick: (e) => {
          const action = actions.find((a) => a.key === e.key);
          if (action && !action.disabled) {
            if (action.confirm) {
              // 下拉菜单中的确认操作需要额外处理
              action.onClick?.(record);
            } else {
              action.onClick?.(record);
            }
          }
        },
      }}
      trigger={['click']}
    >
      <Button size="small" type="text" icon={<MoreHorizontal size={14} />} />
    </Dropdown>
  );
}

/**
 * 标准操作图标
 */
export const STANDARD_ACTIONS: Record<string, { icon: React.ReactNode; label: string }> = {
  view: { icon: <Eye size={14} />, label: "查看" },
  edit: { icon: <Edit size={14} />, label: "编辑" },
  delete: { icon: <Trash2 size={14} />, label: "删除" },
};

/**
 * 创建标准操作配置
 */
export function createStandardActions(
  keys: string[],
  callbacks: Record<string, (record: unknown) => void>
): TableActionItem[] {
  return keys.map((key) => {
    const standard = STANDARD_ACTIONS[key];
    return {
      key,
      label: standard?.label ?? key,
      icon: standard?.icon,
      danger: key === "delete",
      confirm: key === "delete",
      confirmText: "确认删除该记录？",
      onClick: callbacks[key],
    };
  });
}

/**
 * 数据表格组件
 */
export function DataTable<T = Record<string, unknown>>({
  columns,
  dataSource,
  actions,
  actionColumnWidth = 120,
  actionColumnTitle = "操作",
  actionColumnFixed = "right",
  rowKey = "id",
  pagination = true,
  defaultPageSize = 10,
  total,
  currentPage = 1,
  onPageChange,
  loading = false,
  selectable = false,
  onSelectionChange,
  size = "middle",
  bordered = false,
  tableProps,
  className,
  emptyText = "暂无数据",
}: DataTableProps<T>) {
  /**
   * 构建完整列配置
   */
  const allColumns = [...columns];

  if (actions && actions.length > 0) {
    allColumns.push({
      key: "actions",
      title: actionColumnTitle,
      dataIndex: "actions",
      width: actionColumnWidth,
      fixed: actionColumnFixed,
      align: "center",
      render: (_, record) => renderActions(actions, record),
    });
  }

  /**
   * 分页配置
   */
  const paginationConfig = pagination
    ? {
        current: currentPage,
        pageSize: defaultPageSize,
        total: total ?? dataSource.length,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total: number) => `共 ${total} 条`,
        onChange: onPageChange,
        pageSizeOptions: [10, 20, 50, 100],
      }
    : false;

  /**
   * 行选择配置
   */
  const rowSelection = selectable
    ? {
        onChange: (selectedKeys: Key[], selectedRows: T[]) => {
          onSelectionChange?.(selectedKeys, selectedRows);
        },
      }
    : undefined;

  return (
    <Table<T>
      className={className}
      columns={allColumns as TableProps<T>["columns"]}
      dataSource={dataSource}
      rowKey={rowKey as string}
      pagination={paginationConfig}
      loading={loading}
      rowSelection={rowSelection}
      size={size}
      bordered={bordered}
      locale={{ emptyText }}
      scroll={{ x: "max-content" }}
      style={{ background: "#fff", borderRadius: 8 }}
      {...tableProps}
    />
  );
}