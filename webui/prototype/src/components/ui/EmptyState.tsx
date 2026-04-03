"use client";

/**
 * 空状态组件
 * 基于 MASTER.md Empty State 规范
 * 用于列表页无数据、搜索无结果、无权限访问等场景
 */

import { Button } from "antd";
import type { ButtonProps } from "antd";
import {
  Database,
  Lock,
  SearchX,
  WifiOff,
  CheckCircle,
  FileQuestion,
  AlertCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { clsx } from "clsx";

/**
 * 空状态场景类型
 */
export type EmptyStateScenario =
  | "no-data"
  | "no-permission"
  | "search-empty"
  | "network-error"
  | "task-complete"
  | "page-not-found"
  | "system-error";

/**
 * 空状态场景配置
 */
const SCENARIO_CONFIG: Record<
  EmptyStateScenario,
  {
    icon: LucideIcon;
    title: string;
    description: string;
    actionText?: string;
  }
> = {
  "no-data": {
    icon: Database,
    title: "暂无数据",
    description: "点击下方按钮创建第一个",
    actionText: "新建",
  },
  "no-permission": {
    icon: Lock,
    title: "无访问权限",
    description: "请联系管理员申请权限",
    actionText: "申请权限",
  },
  "search-empty": {
    icon: SearchX,
    title: "未找到匹配结果",
    description: "请尝试其他搜索条件",
    actionText: "清空筛选",
  },
  "network-error": {
    icon: WifiOff,
    title: "网络连接失败",
    description: "请检查网络连接后重试",
    actionText: "重新加载",
  },
  "task-complete": {
    icon: CheckCircle,
    title: "任务已全部完成",
    description: "暂无待处理任务",
    actionText: undefined,
  },
  "page-not-found": {
    icon: FileQuestion,
    title: "页面不存在",
    description: "您访问的页面已被删除或移动",
    actionText: "返回首页",
  },
  "system-error": {
    icon: AlertCircle,
    title: "系统异常",
    description: "系统暂时无法处理您的请求",
    actionText: "重试",
  },
};

/**
 * EmptyState 组件属性
 */
export interface EmptyStateProps {
  /** 场景类型 */
  scenario?: EmptyStateScenario;
  /** 自定义图标 (覆盖场景默认图标) */
  icon?: LucideIcon;
  /** 自定义标题 (覆盖场景默认标题) */
  title?: string;
  /** 自定义描述 (覆盖场景默认描述) */
  description?: string;
  /** 操作按钮配置 */
  action?: {
    text?: string;
    onClick: () => void;
    buttonProps?: ButtonProps;
  };
  /** 自定义类名 */
  className?: string;
  /** 图标尺寸 */
  iconSize?: number;
  /** 是否显示操作按钮 */
  showAction?: boolean;
}

/**
 * 空状态组件
 */
export function EmptyState({
  scenario = "no-data",
  icon: customIcon,
  title: customTitle,
  description: customDescription,
  action,
  className,
  iconSize = 64,
  showAction = true,
}: EmptyStateProps) {
  const config = SCENARIO_CONFIG[scenario];
  const Icon = customIcon ?? config.icon;
  const title = customTitle ?? config.title;
  const description = customDescription ?? config.description;
  const actionText = action?.text ?? config.actionText;

  return (
    <div
      className={clsx("empty-state", className)}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        minHeight: 300,
      }}
    >
      {/* 图标 */}
      <Icon
        size={iconSize}
        style={{
          color: "#94A3B8",
          marginBottom: 16,
        }}
      />

      {/* 标题 */}
      <div
        style={{
          fontSize: 16,
          color: "#475569",
          marginBottom: 8,
        }}
      >
        {title}
      </div>

      {/* 描述 */}
      {description && (
        <div
          style={{
            fontSize: 14,
            color: "#94A3B8",
            marginBottom: actionText && showAction ? 24 : 0,
            textAlign: "center",
            maxWidth: 300,
          }}
        >
          {description}
        </div>
      )}

      {/* 操作按钮 */}
      {actionText && showAction && action && (
        <Button type="primary" onClick={action.onClick} {...action.buttonProps}>
          {actionText}
        </Button>
      )}
    </div>
  );
}

/**
 * 预设空状态组件 - 无数据
 */
export function EmptyData({
  onCreate,
  createText = "新建",
  description,
  className,
}: {
  onCreate?: () => void;
  createText?: string;
  description?: string;
  className?: string;
}) {
  return (
    <EmptyState
      scenario="no-data"
      description={description}
      className={className}
      action={
        onCreate
          ? {
              text: createText,
              onClick: onCreate,
            }
          : undefined
      }
      showAction={!!onCreate}
    />
  );
}

/**
 * 预设空状态组件 - 无权限
 */
export function EmptyPermission({
  onRequest,
  description,
  className,
}: {
  onRequest?: () => void;
  description?: string;
  className?: string;
}) {
  return (
    <EmptyState
      scenario="no-permission"
      description={description}
      className={className}
      action={
        onRequest
          ? {
              text: "申请权限",
              onClick: onRequest,
            }
          : undefined
      }
      showAction={!!onRequest}
    />
  );
}

/**
 * 预设空状态组件 - 搜索无结果
 */
export function EmptySearch({
  onClear,
  description,
  className,
}: {
  onClear?: () => void;
  description?: string;
  className?: string;
}) {
  return (
    <EmptyState
      scenario="search-empty"
      description={description}
      className={className}
      action={
        onClear
          ? {
              text: "清空筛选",
              onClick: onClear,
            }
          : undefined
      }
      showAction={!!onClear}
    />
  );
}

/**
 * 预设空状态组件 - 网络错误
 */
export function EmptyNetworkError({
  onRetry,
  description,
  className,
}: {
  onRetry?: () => void;
  description?: string;
  className?: string;
}) {
  return (
    <EmptyState
      scenario="network-error"
      description={description}
      className={className}
      action={
        onRetry
          ? {
              text: "重新加载",
              onClick: onRetry,
            }
          : undefined
      }
      showAction={!!onRetry}
    />
  );
}