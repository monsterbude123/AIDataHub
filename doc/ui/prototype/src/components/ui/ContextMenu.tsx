"use client";

/**
 * 右键菜单组件
 * 用于 DAG 编辑器节点和连线的右键操作
 */

import { useEffect, useRef, useState } from "react";
import { Edit3, Trash2 } from "lucide-react";

/**
 * 菜单项配置
 */
export interface ContextMenuItem {
  /** 菜单项唯一标识 */
  key: string;
  /** 菜单项文本 */
  label: string;
  /** 菜单项图标 */
  icon?: React.ReactNode;
  /** 是否为危险操作（红色文字） */
  danger?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 点击回调 */
  onClick?: () => void;
}

/**
 * ContextMenu 组件属性
 */
interface ContextMenuProps {
  /** 菜单项配置 */
  items: ContextMenuItem[];
  /** 菜单显示位置 */
  position: { x: number; y: number };
  /** 是否显示菜单 */
  visible: boolean;
  /** 关闭菜单回调 */
  onClose: () => void;
}

/**
 * 右键菜单组件
 */
export function ContextMenu({
  items,
  position,
  visible,
  onClose,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  /**
   * 点击菜单外部关闭菜单
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [visible, onClose]);

  /**
   * 处理菜单项点击
   */
  const handleItemClick = (item: ContextMenuItem) => {
    if (item.disabled) return;
    item.onClick?.();
    onClose();
  };

  if (!visible) return null;

  return (
    <div
      ref={menuRef}
      style={{
        position: "fixed",
        left: position.x,
        top: position.y,
        zIndex: 1000,
        minWidth: 120,
        background: "#fff",
        borderRadius: 8,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        padding: "4px 0",
        border: "1px solid #E2E8F0",
      }}
    >
      {items.map((item) => (
        <div
          key={item.key}
          onClick={() => handleItemClick(item)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 12px",
            height: 36,
            cursor: item.disabled ? "not-allowed" : "pointer",
            color: item.danger ? "#EF4444" : item.disabled ? "#94A3B8" : "#1E293B",
            opacity: item.disabled ? 0.5 : 1,
            transition: "background 0.15s ease",
          }}
          onMouseEnter={(e) => {
            if (!item.disabled) {
              e.currentTarget.style.background = "#F1F5F9";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          {item.icon && (
            <span style={{ display: "flex", alignItems: "center" }}>
              {item.icon}
            </span>
          )}
          <span style={{ fontSize: 14 }}>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * 预定义的节点右键菜单项
 */
export const NODE_CONTEXT_MENU_ITEMS: ContextMenuItem[] = [
  {
    key: "edit",
    label: "编辑",
    icon: <Edit3 size={14} />,
    danger: false,
  },
  {
    key: "delete",
    label: "删除",
    icon: <Trash2 size={14} />,
    danger: true,
  },
];

/**
 * 预定义的连线右键菜单项
 */
export const EDGE_CONTEXT_MENU_ITEMS: ContextMenuItem[] = [
  {
    key: "delete",
    label: "删除连线",
    icon: <Trash2 size={14} />,
    danger: true,
  },
];

export default ContextMenu;