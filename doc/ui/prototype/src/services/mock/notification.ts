/**
 * 通知 Mock 数据和服务
 */

import type { Notification, NotificationType, NotificationStatus } from "@/types/notification";

/**
 * Mock 通知列表
 */
export const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "数据源连接异常",
    content: "数据源「MySQL-生产库」连接失败，请检查网络配置",
    type: "data",
    level: "error",
    status: "unread",
    createdAt: "2024-01-15 10:30:00",
    link: "/integration/sources",
  },
  {
    id: "2",
    title: "审批申请待处理",
    content: "用户「张三」申请访问数据表「customer_info」，请审批",
    type: "approval",
    level: "warning",
    status: "unread",
    createdAt: "2024-01-15 09:20:00",
    link: "/system/approval-todo",
  },
  {
    id: "3",
    title: "任务执行成功",
    content: "调度任务「日终数据同步」已于 08:00 成功完成",
    type: "system",
    level: "success",
    status: "unread",
    createdAt: "2024-01-15 08:00:00",
    link: "/project/proj-001/scheduler/logs",
  },
  {
    id: "4",
    title: "数据质量检测完成",
    content: "表「order_detail」数据质量评分：92分，发现3个问题",
    type: "data",
    level: "info",
    status: "read",
    createdAt: "2024-01-14 16:45:00",
    link: "/governance/data-quality",
  },
  {
    id: "5",
    title: "安全审计提醒",
    content: "检测到异常访问行为：用户「李四」在非工作时间访问敏感数据",
    type: "security",
    level: "warning",
    status: "read",
    createdAt: "2024-01-14 14:30:00",
    link: "/security/classification",
  },
  {
    id: "6",
    title: "元数据变更通知",
    content: "您订阅的元数据「customer_info」已更新至 v1.2.3",
    type: "data",
    level: "info",
    status: "read",
    createdAt: "2024-01-13 11:00:00",
    link: "/metadata/detail",
  },
];

/**
 * 获取未读通知数量
 */
export function getUnreadCount(): number {
  return mockNotifications.filter((n) => n.status === "unread").length;
}

/**
 * 按类型过滤通知
 */
export function filterNotificationsByType(type?: NotificationType): Notification[] {
  if (!type) return mockNotifications;
  return mockNotifications.filter((n) => n.type === type);
}

/**
 * 按状态过滤通知
 */
export function filterNotificationsByStatus(status?: NotificationStatus): Notification[] {
  if (!status) return mockNotifications;
  return mockNotifications.filter((n) => n.status === status);
}

/**
 * 标记通知为已读
 */
export function markAsRead(notificationId: string): void {
  const notification = mockNotifications.find((n) => n.id === notificationId);
  if (notification) {
    notification.status = "read";
  }
}

/**
 * 标记所有通知为已读
 */
export function markAllAsRead(): void {
  mockNotifications.forEach((n) => {
    n.status = "read";
  });
}

/**
 * 删除通知
 */
export function deleteNotification(notificationId: string): void {
  const index = mockNotifications.findIndex((n) => n.id === notificationId);
  if (index !== -1) {
    mockNotifications.splice(index, 1);
  }
}