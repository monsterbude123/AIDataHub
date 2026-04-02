"use client";

/**
 * 页面布局组件
 * 包含侧边导航、顶部导航和内容区域
 */

import { useState, useEffect, useMemo } from "react";
import {
  Layout,
  Menu,
  Dropdown,
  Avatar,
  Space,
  Badge,
  List,
  Button,
  Empty,
  message,
  Modal,
  Tabs,
  Tag,
  Popconfirm,
  Typography,
} from "antd";
import type { MenuProps } from "antd";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Database,
  FileText,
  Settings,
  Shield,
  Share2,
  BarChart3,
  User,
  Bell,
  LogOut,
  ChevronDown,
  Layers,
  FolderTree,
  CheckCircle,
  AlertCircle,
  Info,
  AlertTriangle,
  Trash2,
  Check,
  ExternalLink,
} from "lucide-react";

import { ROUTES, APP_CONFIG } from "@/constants";
import {
  mockNotifications,
  getUnreadCount,
  markAllAsRead,
  markAsRead,
  deleteNotification,
} from "@/services/mock/notification";
import type { Notification, NotificationType, NotificationLevel } from "@/types/notification";
import {
  NOTIFICATION_LEVEL_COLORS,
  NOTIFICATION_TYPE_LABELS,
} from "@/types/notification";

const { Header, Content, Sider } = Layout;
const { Text } = Typography;

/**
 * 导航菜单配置
 */
const menuItems: MenuProps["items"] = [
  {
    key: ROUTES.HOME,
    icon: <Home size={16} />,
    label: <Link href={ROUTES.HOME}>首页</Link>,
  },
  {
    key: "integration",
    icon: <Database size={16} />,
    label: "数据集成",
    children: [
      { key: ROUTES.DATA_SOURCES, label: <Link href={ROUTES.DATA_SOURCES}>数据源管理</Link> },
      { key: ROUTES.DATA_PROFILING, label: <Link href={ROUTES.DATA_PROFILING}>数据探查</Link> },
      { key: ROUTES.DATA_STANDARDIZATION, label: <Link href={ROUTES.DATA_STANDARDIZATION}>标准化</Link> },
      { key: ROUTES.SQL_DEV, label: <Link href={ROUTES.SQL_DEV}>SQL开发</Link> },
    ],
  },
  {
    key: "service",
    icon: <Share2 size={16} />,
    label: "数据服务",
    children: [
      { key: ROUTES.SERVICE_CATALOG, label: <Link href={ROUTES.SERVICE_CATALOG}>服务目录</Link> },
      { key: ROUTES.SERVICE_MONITORING, label: <Link href={ROUTES.SERVICE_MONITORING}>服务监控</Link> },
    ],
  },
  {
    key: "metadata",
    icon: <FileText size={16} />,
    label: "元数据管理",
    children: [
      { key: ROUTES.METADATA, label: <Link href={ROUTES.METADATA}>元数据列表</Link> },
    ],
  },
  {
    key: "organization",
    icon: <FolderTree size={16} />,
    label: "数据组织",
    children: [
      { key: ROUTES.RESOURCE_CATALOG, label: <Link href={ROUTES.RESOURCE_CATALOG}>资源目录</Link> },
      { key: ROUTES.DATA_MAPPING, label: <Link href={ROUTES.DATA_MAPPING}>入库映射</Link> },
    ],
  },
  {
    key: "governance",
    icon: <Shield size={16} />,
    label: "数据治理",
    children: [
      { key: ROUTES.DATA_QUALITY, label: <Link href={ROUTES.DATA_QUALITY}>数据质量</Link> },
      { key: ROUTES.DATA_MAP, label: <Link href={ROUTES.DATA_MAP}>数据地图</Link> },
      { key: ROUTES.DATA_LINEAGE, label: <Link href={ROUTES.DATA_LINEAGE}>数据血缘</Link> },
      { key: ROUTES.TAG_MANAGEMENT, label: <Link href={ROUTES.TAG_MANAGEMENT}>标签管理</Link> },
      { key: ROUTES.DATA_STANDARD, label: <Link href={ROUTES.DATA_STANDARD}>数据标准</Link> },
      { key: ROUTES.DATA_MODEL, label: <Link href={ROUTES.DATA_MODEL}>数据模型</Link> },
    ],
  },
  {
    key: "security",
    icon: <Layers size={16} />,
    label: "数据安全",
    children: [
      { key: ROUTES.DESENSITIZATION, label: <Link href={ROUTES.DESENSITIZATION}>数据脱敏</Link> },
      { key: ROUTES.CLASSIFICATION, label: <Link href={ROUTES.CLASSIFICATION}>分级分类</Link> },
      { key: ROUTES.WATERMARK, label: <Link href={ROUTES.WATERMARK}>水印管理</Link> },
    ],
  },
  {
    key: "analytics",
    icon: <BarChart3 size={16} />,
    label: "数据分析",
    children: [
      { key: ROUTES.AD_HOC_QUERY, label: <Link href={ROUTES.AD_HOC_QUERY}>即席查询</Link> },
      { key: ROUTES.AD_HOC_VISUALIZATION, label: <Link href={ROUTES.AD_HOC_VISUALIZATION}>可视化分析</Link> },
    ],
  },
  {
    key: "sharing",
    icon: <Share2 size={16} />,
    label: "数据共享",
    children: [
      { key: ROUTES.SHARING_HOME, label: <Link href={ROUTES.SHARING_HOME}>共享首页</Link> },
      { key: ROUTES.SHARING_TASKS, label: <Link href={ROUTES.SHARING_TASKS}>事项任务</Link> },
      { key: ROUTES.SHARING_RESOURCES, label: <Link href={ROUTES.SHARING_RESOURCES}>资源管理</Link> },
      { key: ROUTES.SHARING_APPLICATIONS, label: <Link href={ROUTES.SHARING_APPLICATIONS}>服务申请</Link> },
    ],
  },
  {
    key: "system",
    icon: <Settings size={16} />,
    label: "系统管理",
    children: [
      { key: ROUTES.ORG_USER, label: <Link href={ROUTES.ORG_USER}>组织用户</Link> },
      { key: ROUTES.ROLE_PERMISSION, label: <Link href={ROUTES.ROLE_PERMISSION}>角色权限</Link> },
      { key: ROUTES.APPROVAL_CONFIG, label: <Link href={ROUTES.APPROVAL_CONFIG}>审批配置</Link> },
      { key: ROUTES.APPROVAL_TODO, label: <Link href={ROUTES.APPROVAL_TODO}>待办事项</Link> },
      { key: ROUTES.SYSTEM_SETTINGS, label: <Link href={ROUTES.SYSTEM_SETTINGS}>系统设置</Link> },
    ],
  },
];

/**
 * 用户下拉菜单
 */
const userMenuItems: MenuProps["items"] = [
  {
    key: "profile",
    icon: <User size={14} />,
    label: "个人中心",
  },
  {
    key: "settings",
    icon: <Settings size={14} />,
    label: "系统设置",
  },
  { type: "divider" },
  {
    key: "logout",
    icon: <LogOut size={14} />,
    label: "退出登录",
    danger: true,
  },
];

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
 * 页面布局组件属性
 */
interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
}

/**
 * 页面布局组件
 */
export function PageLayout({ children, title }: PageLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");

  // 初始化通知数据
  useEffect(() => {
    setNotifications([...mockNotifications]);
  }, []);

  // 未读数量
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => n.status === "unread").length;
  }, [notifications]);

  // 筛选后的通知列表
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    if (activeTab === "unread") {
      filtered = filtered.filter((n) => n.status === "unread");
    } else if (activeTab === "read") {
      filtered = filtered.filter((n) => n.status === "read");
    } else if (["system", "approval", "data", "security"].includes(activeTab)) {
      filtered = filtered.filter((n) => n.type === activeTab);
    }

    return filtered.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [notifications, activeTab]);

  /**
   * 标记全部已读
   */
  const handleMarkAllRead = () => {
    markAllAsRead();
    setNotifications([...mockNotifications]);
    message.success("已将全部通知标记为已读");
  };

  /**
   * 标记单条已读
   */
  const handleMarkRead = (id: string) => {
    markAsRead(id);
    setNotifications([...mockNotifications]);
    message.success("已标记为已读");
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
   * 点击通知跳转
   */
  const handleNotificationClick = (notification: Notification) => {
    if (notification.link) {
      setNotificationModalOpen(false);
      router.push(notification.link);
    }
  };

  /**
   * 用户菜单点击处理
   */
  const handleUserMenuClick: MenuProps["onClick"] = (e) => {
    switch (e.key) {
      case "profile":
        router.push(ROUTES.PROFILE);
        break;
      case "settings":
        router.push(ROUTES.SYSTEM_SETTINGS);
        break;
      case "logout":
        router.push(ROUTES.LOGIN);
        break;
    }
  };

  /**
   * 获取当前选中的菜单项
   */
  const getSelectedKeys = () => {
    return [pathname];
  };

  /**
   * 获取当前展开的菜单项
   */
  const getOpenKeys = () => {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length > 1) {
      return [parts[0]];
    }
    return [];
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
    <Layout style={{ height: "100vh", overflow: "hidden" }}>
      {/* 侧边导航 - 固定高度，内部可滚动 */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={220}
        style={{
          background: "#1E293B",
          height: "100vh",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {/* Logo */}
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            padding: collapsed ? 0 : "0 20px",
            borderBottom: "1px solid #334155",
          }}
        >
          <Database size={28} style={{ color: "#2563EB" }} />
          {!collapsed && (
            <span
              style={{
                marginLeft: 10,
                fontSize: 16,
                fontWeight: 600,
                color: "#fff",
                whiteSpace: "nowrap",
              }}
            >
              {APP_CONFIG.APP_NAME}
            </span>
          )}
        </div>

        {/* 导航菜单 */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={getSelectedKeys()}
          defaultOpenKeys={getOpenKeys()}
          items={menuItems}
          style={{
            background: "transparent",
            borderRight: "none",
          }}
        />
      </Sider>

      <Layout style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
        {/* 顶部导航 - 固定不滚动 */}
        <Header
          style={{
            padding: "0 24px",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #E2E8F0",
            height: 64,
            flexShrink: 0,
          }}
        >
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: "#1E293B" }}>
            {title || "AIDataHub"}
          </h1>

          <Space size="middle">
            {/* 通知铃铛 */}
            <Badge count={unreadCount} size="small">
              <button
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  padding: 8,
                  display: "flex",
                  alignItems: "center",
                }}
                onClick={() => setNotificationModalOpen(true)}
              >
                <Bell size={18} style={{ color: "#6B7280" }} />
              </button>
            </Badge>

            {/* 用户菜单 */}
            <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenuClick }} placement="bottomRight">
              <div style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                <Avatar size={32} style={{ backgroundColor: "#2563EB" }}>
                  U
                </Avatar>
                <span style={{ color: "#1E293B" }}>管理员</span>
                <ChevronDown size={14} style={{ color: "#6B7280" }} />
              </div>
            </Dropdown>
          </Space>
        </Header>

        {/* 内容区域 - 唯一可滚动区域 */}
        <Content
          style={{
            flex: 1,
            padding: 24,
            background: "#F8FAFC",
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          <div
            style={{
              padding: 24,
              background: "#fff",
              borderRadius: 8,
              minHeight: "calc(100% - 48px)",
            }}
          >
            {children}
          </div>
        </Content>
      </Layout>

      {/* 通知中心弹窗 */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Bell size={18} style={{ color: "#2563EB" }} />
            <span>通知中心</span>
            {unreadCount > 0 && (
              <Badge count={unreadCount} size="small" style={{ marginLeft: 8 }} />
            )}
          </div>
        }
        open={notificationModalOpen}
        onCancel={() => setNotificationModalOpen(false)}
        footer={
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#9CA3AF", fontSize: 13 }}>
              共 {notifications.length} 条通知
            </span>
            {unreadCount > 0 && (
              <Button type="primary" icon={<Check size={14} />} onClick={handleMarkAllRead}>
                全部标记已读
              </Button>
            )}
          </div>
        }
        width={700}
        styles={{ body: { padding: 0, maxHeight: 500, overflowY: "auto" } }}
      >
        {/* 标签页筛选 */}
        <div style={{ padding: "12px 24px 0", borderBottom: "1px solid #F1F5F9" }}>
          <Tabs items={tabItems} activeKey={activeTab} onChange={setActiveTab} size="small" />
        </div>

        {/* 通知列表 */}
        {filteredNotifications.length > 0 ? (
          <List
            dataSource={filteredNotifications}
            renderItem={(item) => {
              const isUnread = item.status === "unread";
              return (
                <List.Item
                  style={{
                    padding: "16px 24px",
                    background: isUnread ? "#F0F9FF" : "#fff",
                    borderLeft: isUnread
                      ? `3px solid ${NOTIFICATION_LEVEL_COLORS[item.level]}`
                      : "none",
                    transition: "background 0.2s",
                  }}
                >
                  <div style={{ display: "flex", gap: 16, width: "100%" }}>
                    {/* 级别图标 */}
                    <div style={{ paddingTop: 2 }}>{getLevelIcon(item.level)}</div>

                    {/* 通知内容 */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <Text strong style={{ fontSize: 15, color: "#1E293B" }}>
                          {item.title}
                        </Text>
                        <Tag color={getTypeTagColor(item.type)} style={{ marginLeft: 4 }}>
                          {NOTIFICATION_TYPE_LABELS[item.type]}
                        </Tag>
                        {isUnread && <Tag color="processing">未读</Tag>}
                      </div>

                      <Text style={{ color: "#6B7280", fontSize: 14, display: "block", marginBottom: 8 }}>
                        {item.content}
                      </Text>

                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {formatRelativeTime(item.createdAt)}
                        </Text>

                        <Space size="small">
                          {isUnread && (
                            <Button
                              type="text"
                              size="small"
                              icon={<Check size={14} />}
                              onClick={() => handleMarkRead(item.id)}
                              style={{ color: "#2563EB" }}
                            >
                              标记已读
                            </Button>
                          )}

                          {item.link && (
                            <Button
                              type="text"
                              size="small"
                              icon={<ExternalLink size={14} />}
                              onClick={() => handleNotificationClick(item)}
                              style={{ color: "#2563EB" }}
                            >
                              查看详情
                            </Button>
                          )}

                          <Popconfirm
                            title="确认删除此通知？"
                            onConfirm={() => handleDelete(item.id)}
                            okText="删除"
                            cancelText="取消"
                          >
                            <Button type="text" size="small" danger icon={<Trash2 size={14} />}>
                              删除
                            </Button>
                          </Popconfirm>
                        </Space>
                      </div>
                    </div>
                  </div>
                </List.Item>
              );
            }}
          />
        ) : (
          <div style={{ padding: 48, textAlign: "center" }}>
            <Empty description="暂无通知" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </div>
        )}
      </Modal>
    </Layout>
  );
}