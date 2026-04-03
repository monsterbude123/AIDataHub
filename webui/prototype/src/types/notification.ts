/**
 * 通知类型定义
 */

/** 通知类型枚举 */
export type NotificationType = "system" | "approval" | "data" | "security";

/** 通知级别枚举 */
export type NotificationLevel = "info" | "warning" | "error" | "success";

/** 通知状态枚举 */
export type NotificationStatus = "unread" | "read";

/** 通知项 */
export interface Notification {
  /** 通知ID */
  id: string;
  /** 通知标题 */
  title: string;
  /** 通知内容 */
  content: string;
  /** 通知类型 */
  type: NotificationType;
  /** 通知级别 */
  level: NotificationLevel;
  /** 通知状态 */
  status: NotificationStatus;
  /** 创建时间 */
  createdAt: string;
  /** 关联链接（可选） */
  link?: string;
}

/** 通知类型标签映射 */
export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  system: "系统通知",
  approval: "审批通知",
  data: "数据通知",
  security: "安全通知",
};

/** 通知级别颜色映射 */
export const NOTIFICATION_LEVEL_COLORS: Record<NotificationLevel, string> = {
  info: "#3B82F6",
  warning: "#F59E0B",
  error: "#EF4444",
  success: "#10B981",
};