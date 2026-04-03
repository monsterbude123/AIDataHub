"use client";

/**
 * 通知中心页面
 * 展示所有通知消息，支持筛选、标记已读、删除等操作
 */

import { useState, useMemo } from "react";
import {
  Card,
  List,
  Tag,
  Button,
  Space,
  Empty,
  Tabs,
  Popconfirm,
  message,
  Typography,
} from "antd";
import {
  Bell,
  CheckCircle,
  AlertCircle,
  Info,
  AlertTriangle,
  Trash2,
  Check,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { PageLayout } from "@/components/layout";
import {
  mockNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "@/services/mock/notification";
import type { Notification, NotificationType, NotificationLevel } from "@/types/notification";
import {
  NOTIFICATION_TYPE_LABELS,
  NOTIFICATION_LEVEL_COLORS,
} from "@/types/notification";
import { ROUTES } from "@/constants";

const { Title, Text } = Typography;

/**
 * 获取通知级别图标
 */
const getLevelIcon = (level: NotificationLevel) => {
  const color = NOTIFICATION_LEVEL_COLORS[level];
  switch (level) {
    case "success":
      return <CheckCircle size={18} style={{ color }} />;
    case "warning":
      return <AlertTriangle size={18} style={{ color }} />;
    case "error":
      return <AlertCircle size={18} style={{ color }} />;
    default:
      return <Info size={18} style={{ color }} />;
  }
};

/**
 * 获取通知类型标签颜色
 */
const getTypeTagColor = (type: NotificationType): string => {
  switch (type) {
    case "system":
      return "blue";
    case "approval":
      return "orange";
    case "data":
      return "green";
    case "security":
      return "red";
    default:
      return "default";
  }
};

/**
 * 格式化时间为相对时间
 */
const formatRelativeTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "刚刚";
  if (diffMins < 60) return `${diffMins}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 7) return `${diffDays}天前`;
  return dateStr;
};

/**
 * 单条通知项组件
 */
function NotificationItem({
  notification,
  onMarkRead,
  onDelete,
}: {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const router = useRouter();
  const isUnread = notification.status === "unread";

  return (
    <List.Item
      style={{
        padding: "16px 20px",
        background: isUnread ? "#F0F9FF" : "#fff",
        borderLeft: isUnread ? `3px solid ${NOTIFICATION_LEVEL_COLORS[notification.level]}` : "none",
        transition: "background 0.2s",
      }}
    >
      <div style={{ display: "flex", gap: 16, width: "100%" }}>
        {/* 级别图标 */}
        <div style={{ paddingTop: 2 }}>{getLevelIcon(notification.level)}</div>

        {/* 通知内容 */}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Text strong style={{ fontSize: 15, color: "#1E293B" }}>
              {notification.title}
            </Text>
            <Tag color={getTypeTagColor(notification.type)} style={{ marginLeft: 4 }}>
              {NOTIFICATION_TYPE_LABELS[notification.type]}
            </Tag>
            {isUnread && <Tag color="processing">未读</Tag>}
          </div>

          <Text style={{ color: "#6B7280", fontSize: 14, display: "block", marginBottom: 8 }}>
            {notification.content}
          </Text>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {formatRelativeTime(notification.createdAt)}
            </Text>

            {/* 操作按钮 */}
            <Space size="small">
              {isUnread && (
                <Button
                  type="text"
                  size="small"
                  icon={<Check size={14} />}
                  onClick={() => onMarkRead(notification.id)}
                  style={{ color: "#2563EB" }}
                >
                  标记已读
                </Button>
              )}

              {notification.link && (
                <Link href={notification.link}>
                  <Button
                    type="text"
                    size="small"
                    icon={<ExternalLink size={14} />}
                    style={{ color: "#2563EB" }}
                  >
                    查看详情
                  </Button>
                </Link>
              )}

              <Popconfirm
                title="确认删除此通知？"
                onConfirm={() => onDelete(notification.id)}
                okText="删除"
                cancelText="取消"
              >
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<Trash2 size={14} />}
                >
                  删除
                </Button>
              </Popconfirm>
            </Space>
          </div>
        </div>
      </div>
    </List.Item>
  );
}

/**
 * 通知中心页面组件
 */
export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [activeTab, setActiveTab] = useState<string>("all");

  /**
   * 筛选后的通知列表
   */
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    // 按标签页筛选
    if (activeTab === "unread") {
      filtered = filtered.filter((n) => n.status === "unread");
    } else if (activeTab === "read") {
      filtered = filtered.filter((n) => n.status === "read");
    } else if (["system", "approval", "data", "security"].includes(activeTab)) {
      filtered = filtered.filter((n) => n.type === activeTab);
    }

    // 按时间倒序排列
    return filtered.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [notifications, activeTab]);

  /**
   * 未读数量
   */
  const unreadCount = notifications.filter((n) => n.status === "unread").length;

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
    message.success("已将全部通知标记为已读");
  };

  /**
   * 删除通知
   */
  const handleDelete = (id: string) => {
    deleteNotification(id);
    setNotifications([...mockNotifications]);
    message.success("通知已删除");
  };

  /**
   * 标签页配置
   */
  const tabItems = [
    { key: "all", label: `全部 (${notifications.length})` },
    { key: "unread", label: `未读 (${unreadCount})` },
    { key: "read", label: `已读 (${notifications.length - unreadCount})` },
    { key: "system", label: "系统通知" },
    { key: "approval", label: "审批通知" },
    { key: "data", label: "数据通知" },
    { key: "security", label: "安全通知" },
  ];

  return (
    <PageLayout title="通知中心">
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* 页面标题 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Bell size={24} style={{ color: "#2563EB" }} />
            <Title level={4} style={{ margin: 0 }}>
              通知中心
            </Title>
          </div>

          {unreadCount > 0 && (
            <Button type="primary" icon={<Check size={14} />} onClick={handleMarkAllRead}>
              全部标记已读
            </Button>
          )}
        </div>

        {/* 通知列表 */}
        <Card style={{ borderRadius: 8 }}>
          <Tabs
            items={tabItems}
            activeKey={activeTab}
            onChange={setActiveTab}
            style={{ marginBottom: 16 }}
          />

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
              style={{ maxHeight: 500, overflowY: "auto" }}
            />
          ) : (
            <Empty
              description="暂无通知"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{ padding: 48 }}
            />
          )}
        </Card>
      </div>
    </PageLayout>
  );
}