"use client";

/**
 * 目录树组件
 * 用于侧边栏树形导航，支持折叠、搜索、右键菜单
 */

import { Tree, Input, Dropdown } from "antd";
import type { TreeProps, InputProps } from "antd";
import { Search, Folder, FolderOpen, File } from "lucide-react";
import { useState, useMemo } from "react";
import type { Key } from "react";

/**
 * 目录树节点数据结构
 */
export interface DirectoryTreeNode {
  /** 节点唯一标识 */
  key: string;
  /** 节点标题 */
  title: string;
  /** 子节点 */
  children?: DirectoryTreeNode[];
  /** 节点图标（可选） */
  icon?: React.ReactNode;
  /** 是否为叶子节点 */
  isLeaf?: boolean;
  /** 额外数据 */
  data?: unknown;
}

/**
 * 右键菜单项配置
 */
export interface ContextMenuItem {
  /** 菜单项标识 */
  key: string;
  /** 菜单项标题 */
  label: string;
  /** 菜单项图标 */
  icon?: React.ReactNode;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否危险操作 */
  danger?: boolean;
}

/**
 * DirectoryTree 组件属性
 */
interface DirectoryTreeProps {
  /** 树节点数据 */
  treeData: DirectoryTreeNode[];
  /** 选中节点回调 */
  onSelect?: (selectedKeys: Key[], node: DirectoryTreeNode) => void;
  /** 右键菜单项配置 */
  contextMenuItems?: ContextMenuItem[];
  /** 右键菜单点击回调 */
  onContextMenuClick?: (menuKey: string, nodeKey: string) => void;
  /** 是否显示搜索框 */
  showSearch?: boolean;
  /** 搜索框属性 */
  searchProps?: InputProps;
  /** 默认展开的节点 */
  defaultExpandedKeys?: Key[];
  /** 默认选中的节点 */
  defaultSelectedKeys?: Key[];
  /** 树宽度（可折叠时最小宽度） */
  width?: number;
  /** 是否可折叠 */
  collapsible?: boolean;
  /** 折叠状态变化回调 */
  onCollapse?: (collapsed: boolean) => void;
  /** 额外的 Antd Tree 属性 */
  treeProps?: Omit<TreeProps, "treeData">;
  /** 自定义类名 */
  className?: string;
}

/**
 * 自定义树节点标题渲染（带右键菜单）
 */
interface TreeNodeTitleProps {
  node: DirectoryTreeNode;
  contextMenuItems?: ContextMenuItem[];
  onContextMenuClick?: (menuKey: string, nodeKey: string) => void;
}

function TreeNodeTitle({
  node,
  contextMenuItems,
  onContextMenuClick,
}: TreeNodeTitleProps) {
  if (!contextMenuItems || contextMenuItems.length === 0) {
    return <span>{node.title}</span>;
  }

  const menuItems = contextMenuItems.map((item) => ({
    key: item.key,
    label: item.label,
    icon: item.icon,
    disabled: item.disabled,
    danger: item.danger,
  }));

  return (
    <Dropdown
      menu={{ items: menuItems, onClick: (e) => onContextMenuClick?.(e.key, node.key) }}
      trigger={['contextMenu']}
    >
      <span style={{ cursor: 'context-menu' }}>{node.title}</span>
    </Dropdown>
  );
}

/**
 * 目录树组件
 */
export function DirectoryTree({
  treeData,
  onSelect,
  contextMenuItems,
  onContextMenuClick,
  showSearch = false,
  searchProps,
  defaultExpandedKeys,
  defaultSelectedKeys,
  width = 240,
  collapsible = false,
  onCollapse,
  treeProps,
  className,
}: DirectoryTreeProps) {
  const [searchValue, setSearchValue] = useState("");
  const [collapsed, setCollapsed] = useState(false);

  /**
   * 过滤树数据
   */
  const filteredTreeData = useMemo(() => {
    if (!searchValue) return treeData;

    const filterNodes = (nodes: DirectoryTreeNode[]): DirectoryTreeNode[] => {
      return nodes
        .map((node) => {
          const matched = node.title.toLowerCase().includes(searchValue.toLowerCase());
          const filteredChildren = node.children ? filterNodes(node.children) : [];

          if (matched || filteredChildren.length > 0) {
            return {
              ...node,
              children: filteredChildren.length > 0 ? filteredChildren : node.children,
            };
          }
          return null;
        })
        .filter(Boolean) as DirectoryTreeNode[];
    };

    return filterNodes(treeData);
  }, [treeData, searchValue]);

  /**
   * 转换为 Antd Tree 数据格式
   */
  const antdTreeData = useMemo(() => {
    return filteredTreeData.map((node) => ({
      key: node.key,
      title: (
        <TreeNodeTitle
          node={node}
          contextMenuItems={contextMenuItems}
          onContextMenuClick={onContextMenuClick}
        />
      ),
      icon: node.isLeaf ? <File size={16} /> : (collapsed ? <Folder size={16} /> : <FolderOpen size={16} />),
      children: node.children?.map((child) => ({
        key: child.key,
        title: (
          <TreeNodeTitle
            node={child}
            contextMenuItems={contextMenuItems}
            onContextMenuClick={onContextMenuClick}
          />
        ),
        icon: child.isLeaf ? <File size={16} /> : <Folder size={16} />,
        children: child.children,
      })),
    }));
  }, [filteredTreeData, contextMenuItems, onContextMenuClick, collapsed]);

  /**
   * 处理节点选中
   */
  const handleSelect = (selectedKeys: Key[]) => {
    if (selectedKeys.length > 0) {
      const selectedNode = findNodeByKey(treeData, selectedKeys[0] as string);
      if (selectedNode) {
        onSelect?.(selectedKeys, selectedNode);
      }
    }
  };

  /**
   * 根据 key 查找节点
   */
  const findNodeByKey = (
    nodes: DirectoryTreeNode[],
    key: string
  ): DirectoryTreeNode | null => {
    for (const node of nodes) {
      if (node.key === key) return node;
      if (node.children) {
        const found = findNodeByKey(node.children, key);
        if (found) return found;
      }
    }
    return null;
  };

  /**
   * 处理折叠
   */
  const handleCollapse = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    onCollapse?.(newCollapsed);
  };

  const actualWidth = collapsed ? 48 : width;

  return (
    <div
      className={className}
      style={{
        width: actualWidth,
        minWidth: actualWidth,
        transition: "width 0.3s",
        borderRight: "1px solid #E2E8F0",
        background: "#F8FAFC",
        padding: collapsed ? 8 : 12,
      }}
    >
      {/* 搜索框 */}
      {!collapsed && showSearch && (
        <Input
          placeholder="搜索目录..."
          prefix={<Search size={14} />}
          allowClear
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          style={{ marginBottom: 8 }}
          {...searchProps}
        />
      )}

      {/* 折叠按钮 */}
      {collapsible && (
        <button
          onClick={handleCollapse}
          style={{
            position: "absolute",
            right: -12,
            top: "50%",
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: "#fff",
            border: "1px solid #E2E8F0",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
        >
          {collapsed ? ">" : "<"}
        </button>
      )}

      {/* 树结构 */}
      <Tree
        showIcon
        blockNode
        treeData={antdTreeData}
        defaultExpandedKeys={defaultExpandedKeys}
        defaultSelectedKeys={defaultSelectedKeys}
        onSelect={handleSelect}
        style={{
          background: "transparent",
          fontSize: collapsed ? 0 : 14,
        }}
        {...treeProps}
      />
    </div>
  );
}