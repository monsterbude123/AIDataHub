"use client";

/**
 * 通知面板组件
 * 显示系统通知列表，支持标记已读和全部清除
 */

import { useState } from "react";
import { Popover, List, Button, Tag, Space, Tabs, Empty, message } from "antd";
import { Bell, Check, Trash2, CheckCheck, ExternalLink } from "lucide-react";
import Link from "next/link";

import {
  mockNotifications,
  getUnreadCount,
  filterNotificationsByType,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "@/services/mock/notification";
import {
  NOTIFICATION_TYPE_LABELS,
  NOTIFICATION_LEVEL_COLORS,
  type NotificationType,
} from "@/types/notification";

/**
 * 通知面板组件属性
 */
interface NotificationPanelProps {
  /** 通知图标大小 */
  iconSize?: number;
}

/**
 * 单条通知项渲染
 */
function NotificationItem({
  notification,
  onMarkRead,
  onDelete,
}: {
  notification: typeof mockNotifications[0];
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const isUnread = notification.status === "unread";

  return (
    <List.Item
      style={{
        padding: "12px 0",
        borderBottom: "1px solid #E2E8F0",
        background: isUnread ? "#F0F9FF" : "transparent",
      }}
      actions={[
        <Button
          key="read"
          type="text"
          size="small"
          icon={<Check size={14} />}
          onClick={() => onMarkRead(notification.id)}
          disabled={!isUnread}
        />,
        <Button
          key="delete"
          type="text"
          size="small"
          danger
          icon={<Trash2 size={14} />}
          onClick={() => onDelete(notification.id)}
        />,
      ]}
    >
      <List.Item.Meta
        title={
          <Space>
            {isUnread && <Tag color="blue">未读</Tag>}
            <span style={{ fontWeight: isUnread ? 600 : 400 }}>{notification.title}</span>
          </Space>
        }
        description={
          <div>
            <div style={{ marginBottom: 4, color: "#6B7280" }}>{notification.content}</div>
            <Space size="small">
              <Tag
                style={{ borderColor: NOTIFICATION_LEVEL_COLORS[notification.level], color: NOTIFICATION_LEVEL_COLORS[notification.level] }}
              >
                {NOTIFICATION_TYPE_LABELS[notification.type]}
              </Tag>
              <span style={{ fontSize: 12, color: "#9CA3AF" }}>{notification.createdAt}</span>
              {notification.link && (
                <Link href={notification.link} style={{ fontSize: 12, color: "#2563EB" }}>
                  <Space size={2}>
                    <ExternalLink size={12} />
                    查看详情
                  </Space>
                </Link>
              )}
            </Space>
          </div>
        }
      />
    </List.Item>
  );
}

/**
 * 通知面板组件
 */
export function NotificationPanel({ iconSize = 18 }: NotificationPanelProps) {
  const [visible, setVisible] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const [activeTab, setActiveTab] = useState<string>("all");

  /**
   * 未读数量
   */
  const unreadCount = notifications.filter((n) => n.status === "unread").length;

  /**
   * 根据Tab过滤通知
   */
  const filteredNotifications =
    activeTab === "all"
      ? notifications
      : activeTab === "unread"
        ? notifications.filter((n) => n.status === "unread")
        : filterNotificationsByType(activeTab as NotificationType);

  /**
   * 标记单条已读
   */
  const handleMarkRead = (id: string) => {
    markAsRead(id);
    setNotifications([...mockNotifications]);
    message.success("已标记为已读");
  };

  /**
   * 标记全部已读
   */
  const handleMarkAllRead = () => {
    markAllAsRead();
    setNotifications([...mockNotifications]);
    message.success("已全部标记为已读");
  };

  /**
   * 删除通知
   */
  const handleDelete = (id: string) => {
    deleteNotification(id);
    setNotifications([...mockNotifications]);
    message.success("已删除通知");
  };

  /**
   * 通知内容面板
   */
  const content = (
    <div style={{ width: 380, maxHeight: 400, overflow: "hidden" }}>
      {/* 标题栏 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px 0",
          borderBottom: "1px solid #E2E8F0",
        }}
      >
        <span style={{ fontWeight: 600 }}>通知中心</span>
        <Button
          type="text"
          size="small"
          icon={<CheckCheck size={14} />}
          onClick={handleMarkAllRead}
          disabled={unreadCount === 0}
        >
          全部已读
        </Button>
      </div>

      {/* Tab 切换 */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        size="small"
        items={[
          { key: "all", label: `全部 (${notifications.length})` },
          { key: "unread", label: `未读 (${unreadCount})` },
          { key: "system", label: "系统" },
          { key: "approval", label: "审批" },
          { key: "data", label: "数据" },
        ]}
        style={{ marginBottom: 8 }}
      />

      {/* 通知列表 */}
      <div style={{ maxHeight: 280, overflowY: "auto" }}>
        {filteredNotifications.length > 0 ? (
          <List
            dataSource={filteredNotifications}
            renderItem={(item) => (
              <NotificationItem
                notification={item}
                onMarkRead={handleMarkRead}
                onDelete={handleDelete}
              />
            )}
          />
        ) : (
          <Empty description="暂无通知" style={{ padding: 24 }} />
        )}
      </div>
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      placement="bottomRight"
      arrow={false}
      open={visible}
      onOpenChange={setVisible}
    >
      <button
        style={{
          border: "none",
          background: visible ? "#F0F9FF" : "transparent",
          cursor: "pointer",
          padding: 8,
          borderRadius: 4,
          transition: "background 0.2s",
        }}
      >
        <Bell size={iconSize} style={{ color: visible ? "#2563EB" : "#6B7280" }} />
      </button>
    </Popover>
  );
}