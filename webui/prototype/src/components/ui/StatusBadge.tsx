"use client";

/**
 * 状态徽章组件
 * 统一状态指示器样式，基于 MASTER.md 定义的颜色规范
 */

import { Tag } from "antd";
import type { TagProps } from "antd";
import { clsx } from "clsx";

/**
 * 预定义状态类型
 */
export type StatusType =
  | "success"
  | "warning"
  | "error"
  | "processing"
  | "pending"
  | "enabled"
  | "disabled"
  | "connected"
  | "disconnected";

/**
 * 状态颜色映射（基于 MASTER.md Status Colors）
 */
const STATUS_COLORS: Record<StatusType, string> = {
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  processing: "#3B82F6",
  pending: "#6B7280",
  enabled: "#10B981",
  disabled: "#6B7280",
  connected: "#10B981",
  disconnected: "#EF4444",
};

/**
 * 状态显示文本映射
 */
const STATUS_LABELS: Record<StatusType, string> = {
  success: "成功",
  warning: "警告",
  error: "失败",
  processing: "处理中",
  pending: "待处理",
  enabled: "启用",
  disabled: "禁用",
  connected: "已连接",
  disconnected: "未连接",
};

/**
 * StatusBadge 组件属性
 */
interface StatusBadgeProps {
  /** 状态类型 */
  status: StatusType;
  /** 自定义显示文本（可选，默认使用预定义文本） */
  label?: string;
  /** 是否显示为圆点样式 */
  dot?: boolean;
  /** 额外的 Antd Tag 属性 */
  tagProps?: Omit<TagProps, "color">;
  /** 自定义类名 */
  className?: string;
}

/**
 * 状态徽章组件
 * @param status - 状态类型
 * @param label - 自定义显示文本
 * @param dot - 是否显示为圆点样式
 * @param tagProps - 额外的 Antd Tag 属性
 * @param className - 自定义类名
 */
export function StatusBadge({
  status,
  label,
  dot = false,
  tagProps,
  className,
}: StatusBadgeProps) {
  const color = STATUS_COLORS[status];
  const displayLabel = label ?? STATUS_LABELS[status];

  if (dot) {
    return (
      <span className={clsx("inline-flex items-center gap-2", className)}>
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: color,
            display: "inline-block",
          }}
        />
        <span style={{ color: "#475569" }}>{displayLabel}</span>
      </span>
    );
  }

  return (
    <Tag
      color={color}
      style={{ borderRadius: 4 }}
      className={className}
      {...tagProps}
    >
      {displayLabel}
    </Tag>
  );
}

/**
 * 敏感性级别徽章组件
 * 用于数据分级分类展示
 */
export type SensitivityLevel = "public" | "internal" | "secret" | "confidential";

/**
 * 敏感性级别颜色映射（基于 MASTER.md Sensitivity Level Colors）
 */
const SENSITIVITY_COLORS: Record<SensitivityLevel, string> = {
  public: "#10B981",
  internal: "#3B82F6",
  secret: "#F59E0B",
  confidential: "#EF4444",
};

/**
 * 敏感性级别显示文本映射
 */
const SENSITIVITY_LABELS: Record<SensitivityLevel, string> = {
  public: "公开",
  internal: "内部",
  secret: "秘密",
  confidential: "机密",
};

/**
 * SensitivityBadge 组件属性
 */
interface SensitivityBadgeProps {
  /** 敏感性级别 */
  level: SensitivityLevel;
  /** 自定义显示文本 */
  label?: string;
  /** 额外的 Antd Tag 属性 */
  tagProps?: Omit<TagProps, "color">;
  /** 自定义类名 */
  className?: string;
}

/**
 * 敏感性级别徽章组件
 */
export function SensitivityBadge({
  level,
  label,
  tagProps,
  className,
}: SensitivityBadgeProps) {
  const color = SENSITIVITY_COLORS[level];
  const displayLabel = label ?? SENSITIVITY_LABELS[level];

  return (
    <Tag
      color={color}
      style={{ borderRadius: 4 }}
      className={className}
      {...tagProps}
    >
      {displayLabel}
    </Tag>
  );
}