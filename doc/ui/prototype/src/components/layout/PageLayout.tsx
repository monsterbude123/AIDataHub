"use client";

/**
 * 页面布局组件
 * 包含侧边导航、顶部导航和内容区域
 */

import { useState, useEffect } from "react";
import { Layout, Menu, Dropdown, Avatar, Space, Badge, List, Button, Empty, message } from "antd";
import type { MenuProps } from "antd";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Database,
  FileText,
  Settings,
  Shield,
  Clock,
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
} from "lucide-react";

import { ROUTES, APP_CONFIG } from "@/constants";
import {
  mockNotifications,
  getUnreadCount,
  markAllAsRead,
} from "@/services/mock/notification";
import type { Notification, NotificationLevel } from "@/types/notification";
import { NOTIFICATION_LEVEL_COLORS } from "@/types/notification";

const { Header, Content, Sider } = Layout;

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
    key: "data-integration",
    icon: <Database size={16} />,
    label: "数据集成",
    children: [
      { key: ROUTES.DATA_SOURCES, label: <Link href={ROUTES.DATA_SOURCES}>数据源管理</Link> },
      { key: ROUTES.DATA_SOURCE_CONFIG, label: <Link href={ROUTES.DATA_SOURCE_CONFIG}>数据源配置</Link> },
      { key: ROUTES.DATA_PROFILING, label: <Link href={ROUTES.DATA_PROFILING}>数据探查</Link> },
      { key: ROUTES.DATA_STANDARDIZATION, label: <Link href={ROUTES.DATA_STANDARDIZATION}>标准化</Link> },
      { key: ROUTES.SQL_DEV, label: <Link href={ROUTES.SQL_DEV}>SQL开发</Link> },
    ],
  },
  {
    key: "data-service",
    icon: <Share2 size={16} />,
    label: "数据服务",
    children: [
      { key: ROUTES.SERVICE_CATALOG, label: <Link href={ROUTES.SERVICE_CATALOG}>服务目录</Link> },
      { key: ROUTES.SERVICE_CONFIG, label: <Link href={ROUTES.SERVICE_CONFIG}>服务配置</Link> },
      { key: ROUTES.SERVICE_AUTHORIZATION, label: <Link href={ROUTES.SERVICE_AUTHORIZATION}>服务授权</Link> },
      { key: ROUTES.SERVICE_MONITORING, label: <Link href={ROUTES.SERVICE_MONITORING}>服务监控</Link> },
    ],
  },
  {
    key: "metadata",
    icon: <FileText size={16} />,
    label: "元数据管理",
    children: [
      { key: ROUTES.METADATA, label: <Link href={ROUTES.METADATA}>元数据列表</Link> },
      { key: ROUTES.METADATA_DETAIL, label: <Link href={ROUTES.METADATA_DETAIL}>元数据详情</Link> },
    ],
  },
  {
    key: "data-organization",
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
    key: "scheduler",
    icon: <Clock size={16} />,
    label: "任务调度",
    children: [
      { key: ROUTES.DAG, label: <Link href={ROUTES.DAG}>DAG编排</Link> },
      { key: ROUTES.TASK_LIST, label: <Link href={ROUTES.TASK_LIST}>任务运维</Link> },
      { key: ROUTES.LOG_CENTER, label: <Link href={ROUTES.LOG_CENTER}>日志中心</Link> },
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
      return <CheckCircle size={16} style={{ color }} />;
    case "warning":
      return <AlertTriangle size={16} style={{ color }} />;
    case "error":
      return <AlertCircle size={16} style={{ color }} />;
    default:
      return <Info size={16} style={{ color }} />;
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // 初始化通知数据
  useEffect(() => {
    setNotifications([...mockNotifications]);
    setUnreadCount(getUnreadCount());
  }, []);

  /**
   * 标记全部已读
   */
  const handleMarkAllRead = () => {
    markAllAsRead();
    setNotifications([...mockNotifications]);
    setUnreadCount(0);
    message.success("已将全部通知标记为已读");
  };

  /**
   * 跳转到通知中心
   */
  const handleViewAll = () => {
    router.push(ROUTES.NOTIFICATIONS);
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
            {/* 通知下拉 */}
            <Dropdown
              trigger={['click']}
              dropdownRender={() => (
                <div
                  style={{
                    width: 360,
                    background: '#fff',
                    borderRadius: 8,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  {/* 标题栏 */}
                  <div
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid #E2E8F0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontWeight: 600, color: '#1E293B' }}>
                      通知消息
                      {unreadCount > 0 && (
                        <Badge count={unreadCount} size="small" style={{ marginLeft: 8 }} />
                      )}
                    </span>
                    {unreadCount > 0 && (
                      <Button
                        type="link"
                        size="small"
                        style={{ color: '#2563EB', padding: 0 }}
                        onClick={handleMarkAllRead}
                      >
                        全部已读
                      </Button>
                    )}
                  </div>

                  {/* 通知列表 - 只显示未读的前5条 */}
                  {notifications.filter(n => n.status === 'unread').length > 0 ? (
                    <List
                      dataSource={notifications.filter(n => n.status === 'unread').slice(0, 5)}
                      renderItem={(item) => (
                        <List.Item
                          style={{
                            padding: '12px 16px',
                            cursor: 'pointer',
                            transition: 'background 0.2s',
                            background: '#F0F9FF',
                            borderLeft: `3px solid ${NOTIFICATION_LEVEL_COLORS[item.level]}`,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#E0F2FE';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#F0F9FF';
                          }}
                          onClick={() => item.link && router.push(item.link)}
                        >
                          <div style={{ display: 'flex', gap: 12, width: '100%' }}>
                            {getLevelIcon(item.level)}
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 500, color: '#1E293B', marginBottom: 4 }}>
                                {item.title}
                              </div>
                              <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 4 }}>
                                {item.content}
                              </div>
                              <div style={{ fontSize: 12, color: '#9CA3AF' }}>
                                {formatRelativeTime(item.createdAt)}
                              </div>
                            </div>
                          </div>
                        </List.Item>
                      )}
                      style={{ maxHeight: 300, overflowY: 'auto' }}
                    />
                  ) : (
                    <div style={{ padding: 32, textAlign: 'center' }}>
                      <Empty description="暂无未读通知" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    </div>
                  )}

                  {/* 底部操作栏 */}
                  <div
                    style={{
                      padding: '12px 16px',
                      borderTop: '1px solid #E2E8F0',
                      textAlign: 'center',
                    }}
                  >
                    <Button
                      type="link"
                      style={{ color: '#2563EB' }}
                      onClick={handleViewAll}
                    >
                      查看全部通知
                    </Button>
                  </div>
                </div>
              )}
              placement="bottomRight"
            >
              <Badge count={unreadCount} size="small">
                <button
                  style={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    padding: 8,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Bell size={18} style={{ color: "#6B7280" }} />
                </button>
              </Badge>
            </Dropdown>

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
    </Layout>
  );
}