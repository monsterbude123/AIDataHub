"use client";

/**
 * 页面布局组件
 * 包含侧边导航、顶部导航和内容区域
 * 支持响应式布局：移动端使用 Drawer 导航
 */

import { useState, useEffect, useMemo, useCallback } from "react";
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
  Drawer,
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
  FolderKanban,
  Server,
  Menu as MenuIcon,
  X,
} from "lucide-react";

import { ROUTES, APP_CONFIG, MENU_KEYS } from "@/constants";
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
 * 基于 design-system/navigation.md 规范
 * 精简为 6 个一级菜单
 */
const menuItems: MenuProps["items"] = [
  // ============================================
  // 首页
  // ============================================
  {
    key: MENU_KEYS.HOME,
    icon: <Home size={16} />,
    label: <Link href={ROUTES.HOME}>首页</Link>,
  },

  // ============================================
  // 数据项目
  // ============================================
  {
    key: MENU_KEYS.PROJECT,
    icon: <FolderKanban size={16} />,
    label: <Link href={ROUTES.PROJECT}>数据项目</Link>,
  },

  // ============================================
  // 数据集成
  // ============================================
  {
    key: MENU_KEYS.INTEGRATION,
    icon: <Database size={16} />,
    label: "数据集成",
    children: [
      {
        key: "integration-sources",
        label: <Link href={ROUTES.DATA_SOURCES}>数据源管理</Link>,
      },
      {
        key: "integration-profiling",
        label: <Link href={ROUTES.DATA_PROFILING}>数据探查</Link>,
      },
      {
        key: "integration-standardization",
        label: <Link href={ROUTES.DATA_STANDARDIZATION}>数据标准化</Link>,
      },
      {
        key: "integration-sql",
        label: <Link href={ROUTES.SQL_DEV}>Spark SQL开发</Link>,
      },
      {
        type: "divider",
        key: "integration-divider-1",
      },
      {
        key: "integration-migration",
        label: <Link href={ROUTES.MIGRATION}>数据迁移</Link>,
      },
      {
        type: "divider",
        key: "integration-divider-2",
      },
      {
        key: "integration-organization",
        icon: <FolderTree size={14} />,
        label: "数据组织",
        children: [
          {
            key: "integration-catalog",
            label: <Link href={ROUTES.RESOURCE_CATALOG}>资源目录</Link>,
          },
          {
            key: "integration-mapping",
            label: <Link href={ROUTES.DATA_MAPPING}>入库映射</Link>,
          },
        ],
      },
      {
        key: "integration-infrastructure",
        icon: <Server size={14} />,
        label: "基础设施",
        children: [
          {
            key: "infra-tenant",
            label: <Link href={ROUTES.TENANT_MANAGEMENT}>租户管理</Link>,
          },
          {
            key: "infra-queue",
            label: <Link href={ROUTES.QUEUE_MANAGEMENT}>资源队列</Link>,
          },
          {
            key: "infra-worker",
            label: <Link href={ROUTES.WORKER_MANAGEMENT}>Worker节点</Link>,
          },
          {
            key: "infra-engine",
            label: <Link href={ROUTES.ENGINE_CONFIG}>引擎配置</Link>,
          },
          {
            key: "infra-template",
            label: <Link href={ROUTES.CONFIG_TEMPLATE}>配置模板</Link>,
          },
        ],
      },
    ],
  },

  // ============================================
  // 数据治理
  // ============================================
  {
    key: MENU_KEYS.GOVERNANCE,
    icon: <Shield size={16} />,
    label: "数据治理",
    children: [
      {
        key: "governance-map",
        label: <Link href={ROUTES.DATA_MAP}>数据地图</Link>,
      },
      {
        key: "governance-quality",
        label: <Link href={ROUTES.DATA_QUALITY}>数据质量</Link>,
      },
      {
        key: "governance-tags",
        label: <Link href={ROUTES.TAG_MANAGEMENT}>标签管理</Link>,
      },
      {
        key: "governance-lineage",
        label: <Link href={ROUTES.DATA_LINEAGE}>数据血缘</Link>,
      },
      {
        key: "governance-standard",
        label: <Link href={ROUTES.DATA_STANDARD}>数据标准</Link>,
      },
      {
        key: "governance-model",
        label: <Link href={ROUTES.DATA_MODEL}>数据模型</Link>,
      },
      {
        type: "divider",
        key: "governance-divider-1",
      },
      {
        key: "governance-metadata",
        label: <Link href={ROUTES.METADATA}>元数据管理</Link>,
      },
    ],
  },

  // ============================================
  // 数据服务
  // ============================================
  {
    key: MENU_KEYS.SERVICE,
    icon: <Share2 size={16} />,
    label: "数据服务",
    children: [
      {
        key: "service-catalog",
        label: <Link href={ROUTES.SERVICE_CATALOG}>服务目录</Link>,
      },
      {
        key: "service-monitoring",
        label: <Link href={ROUTES.SERVICE_MONITORING}>服务监控</Link>,
      },
      {
        type: "divider",
        key: "service-divider-1",
      },
      {
        key: "service-sharing",
        icon: <Share2 size={14} />,
        label: "数据共享",
        children: [
          {
            key: "sharing-home",
            label: <Link href={ROUTES.SHARING}>共享首页</Link>,
          },
          {
            key: "sharing-tasks",
            label: <Link href={ROUTES.SHARING_TASKS}>事项任务</Link>,
          },
          {
            key: "sharing-resources",
            label: <Link href={ROUTES.SHARING_RESOURCES}>资源管理</Link>,
          },
          {
            key: "sharing-applications",
            label: <Link href={ROUTES.SHARING_APPLICATIONS}>服务申请</Link>,
          },
        ],
      },
      {
        key: "service-analytics",
        icon: <BarChart3 size={14} />,
        label: "自助分析",
        children: [
          {
            key: "analytics-query",
            label: <Link href={ROUTES.AD_HOC_QUERY}>即席查询</Link>,
          },
          {
            key: "analytics-visualization",
            label: <Link href={ROUTES.AD_HOC_VISUALIZATION}>可视化分析</Link>,
          },
        ],
      },
    ],
  },

  // ============================================
  // 系统管理
  // ============================================
  {
    key: MENU_KEYS.SYSTEM,
    icon: <Settings size={16} />,
    label: "系统管理",
    children: [
      {
        key: "system-org-user",
        label: <Link href={ROUTES.ORG_USER}>组织用户</Link>,
      },
      {
        key: "system-role",
        label: <Link href={ROUTES.ROLE_PERMISSION}>角色权限</Link>,
      },
      {
        key: "system-approval-todo",
        label: <Link href={ROUTES.APPROVAL_TODO}>审批待办</Link>,
      },
      {
        key: "system-approval-config",
        label: <Link href={ROUTES.APPROVAL_CONFIG}>审批配置</Link>,
      },
      {
        key: "system-settings",
        label: <Link href={ROUTES.SYSTEM_SETTINGS}>系统设置</Link>,
      },
      {
        type: "divider",
        key: "system-divider-1",
      },
      {
        key: "system-security",
        icon: <Layers size={14} />,
        label: "数据安全",
        children: [
          {
            key: "security-desensitization",
            label: <Link href={ROUTES.DESENSITIZATION}>数据脱敏</Link>,
          },
          {
            key: "security-classification",
            label: <Link href={ROUTES.CLASSIFICATION}>分级分类</Link>,
          },
          {
            key: "security-watermark",
            label: <Link href={ROUTES.WATERMARK}>数据水印</Link>,
          },
        ],
      },
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
 * 响应式断点检测 Hook
 */
function useResponsive() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkResponsive = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    // 初始检测
    checkResponsive();

    // 监听窗口大小变化
    window.addEventListener("resize", checkResponsive);

    return () => {
      window.removeEventListener("resize", checkResponsive);
    };
  }, []);

  return { isMobile, isTablet, isDesktop: !isMobile && !isTablet };
}

/**
 * 页面布局组件
 */
export function PageLayout({ children, title }: PageLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobile, isTablet } = useResponsive();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");

  // 平板端自动折叠侧边栏
  useEffect(() => {
    if (isTablet) {
      setCollapsed(true);
    } else if (!isMobile) {
      setCollapsed(false);
    }
  }, [isTablet, isMobile]);

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
   * 根据路由路径匹配对应的菜单项
   */
  const getSelectedKeys = () => {
    // 首页特殊处理
    if (pathname === ROUTES.HOME) {
      return [MENU_KEYS.HOME];
    }

    // 项目模块
    if (pathname.startsWith("/project")) {
      return [MENU_KEYS.PROJECT];
    }

    // 数据集成模块
    if (pathname.startsWith("/integration")) {
      // 匹配具体的子菜单
      if (pathname.includes("/migration")) return ["integration-migration"];
      if (pathname.includes("/organization")) return ["integration-organization"];
      if (pathname.includes("/infrastructure")) return ["integration-infrastructure"];
      if (pathname.includes("/sources")) return ["integration-sources"];
      if (pathname.includes("/profiling")) return ["integration-profiling"];
      if (pathname.includes("/standardization")) return ["integration-standardization"];
      if (pathname.includes("/sql-dev")) return ["integration-sql"];
      return [MENU_KEYS.INTEGRATION];
    }

    // 数据治理模块
    if (pathname.startsWith("/governance")) {
      if (pathname.includes("/metadata")) return ["governance-metadata"];
      if (pathname.includes("/quality")) return ["governance-quality"];
      if (pathname.includes("/data-map")) return ["governance-map"];
      if (pathname.includes("/lineage")) return ["governance-lineage"];
      if (pathname.includes("/tags")) return ["governance-tags"];
      if (pathname.includes("/standard")) return ["governance-standard"];
      if (pathname.includes("/model")) return ["governance-model"];
      return [MENU_KEYS.GOVERNANCE];
    }

    // 数据服务模块
    if (pathname.startsWith("/service")) {
      if (pathname.includes("/catalog")) return ["service-catalog"];
      if (pathname.includes("/monitoring")) return ["service-monitoring"];
      return [MENU_KEYS.SERVICE];
    }

    // 数据共享模块 (归入数据服务)
    if (pathname.startsWith("/sharing")) {
      return ["sharing-home"];
    }

    // 自助分析模块 (归入数据服务)
    if (pathname.startsWith("/analytics")) {
      if (pathname.includes("/query")) return ["analytics-query"];
      if (pathname.includes("/visualization")) return ["analytics-visualization"];
      return ["service-analytics"];
    }

    // 系统管理模块
    if (pathname.startsWith("/system")) {
      if (pathname.includes("/security")) {
        if (pathname.includes("/desensitization")) return ["security-desensitization"];
        if (pathname.includes("/classification")) return ["security-classification"];
        if (pathname.includes("/watermark")) return ["security-watermark"];
        return ["system-security"];
      }
      if (pathname.includes("/org-user")) return ["system-org-user"];
      if (pathname.includes("/role")) return ["system-role"];
      if (pathname.includes("/approval/todo")) return ["system-approval-todo"];
      if (pathname.includes("/approval/config")) return ["system-approval-config"];
      if (pathname.includes("/settings")) return ["system-settings"];
      return [MENU_KEYS.SYSTEM];
    }

    // 兼容旧路由 (临时，后续需要迁移)
    if (pathname.startsWith("/metadata")) return ["governance-metadata"];
    if (pathname.startsWith("/organization")) return ["integration-organization"];
    if (pathname.startsWith("/security")) return ["system-security"];
    if (pathname.startsWith("/infrastructure")) return ["integration-infrastructure"];

    return [pathname];
  };

  /**
   * 获取当前展开的菜单项
   */
  const getOpenKeys = () => {
    const selectedKeys = getSelectedKeys();
    const openKeys: string[] = [];

    // 根据选中的 key 确定需要展开的父菜单
    const parentMap: Record<string, string[]> = {
      // 数据集成子菜单
      "integration-organization": [MENU_KEYS.INTEGRATION, "integration-organization"],
      "integration-infrastructure": [MENU_KEYS.INTEGRATION, "integration-infrastructure"],
      "integration-migration": [MENU_KEYS.INTEGRATION],
      "integration-sources": [MENU_KEYS.INTEGRATION],
      "integration-profiling": [MENU_KEYS.INTEGRATION],
      "integration-standardization": [MENU_KEYS.INTEGRATION],
      "integration-sql": [MENU_KEYS.INTEGRATION],

      // 数据治理子菜单
      "governance-metadata": [MENU_KEYS.GOVERNANCE],
      "governance-quality": [MENU_KEYS.GOVERNANCE],
      "governance-map": [MENU_KEYS.GOVERNANCE],
      "governance-lineage": [MENU_KEYS.GOVERNANCE],
      "governance-tags": [MENU_KEYS.GOVERNANCE],
      "governance-standard": [MENU_KEYS.GOVERNANCE],
      "governance-model": [MENU_KEYS.GOVERNANCE],

      // 数据服务子菜单
      "sharing-home": [MENU_KEYS.SERVICE, "service-sharing"],
      "sharing-tasks": [MENU_KEYS.SERVICE, "service-sharing"],
      "sharing-resources": [MENU_KEYS.SERVICE, "service-sharing"],
      "sharing-applications": [MENU_KEYS.SERVICE, "service-sharing"],
      "analytics-query": [MENU_KEYS.SERVICE, "service-analytics"],
      "analytics-visualization": [MENU_KEYS.SERVICE, "service-analytics"],
      "service-catalog": [MENU_KEYS.SERVICE],
      "service-monitoring": [MENU_KEYS.SERVICE],

      // 系统管理子菜单
      "security-desensitization": [MENU_KEYS.SYSTEM, "system-security"],
      "security-classification": [MENU_KEYS.SYSTEM, "system-security"],
      "security-watermark": [MENU_KEYS.SYSTEM, "system-security"],
      "system-org-user": [MENU_KEYS.SYSTEM],
      "system-role": [MENU_KEYS.SYSTEM],
      "system-approval-todo": [MENU_KEYS.SYSTEM],
      "system-approval-config": [MENU_KEYS.SYSTEM],
      "system-settings": [MENU_KEYS.SYSTEM],
    };

    selectedKeys.forEach((key) => {
      const parents = parentMap[key];
      if (parents) {
        openKeys.push(...parents);
      }
    });

    return [...new Set(openKeys)];
  };

  /**
   * 处理移动端菜单点击后关闭 Drawer
   */
  const handleMobileMenuClick = useCallback(() => {
    setMobileDrawerOpen(false);
  }, []);

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

  /**
   * 移动端导航菜单内容
   */
  const renderMobileMenuContent = () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* 移动端 Logo 和关闭按钮 */}
      <div
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          borderBottom: "1px solid #334155",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Database size={24} style={{ color: "#2563EB" }} />
          <span style={{ fontSize: 16, fontWeight: 600, color: "#fff" }}>
            {APP_CONFIG.APP_NAME}
          </span>
        </div>
        <Button
          type="text"
          icon={<X size={20} style={{ color: "#94A3B8" }} />}
          onClick={() => setMobileDrawerOpen(false)}
          style={{ padding: 8 }}
        />
      </div>

      {/* 导航菜单 */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={getSelectedKeys()}
          defaultOpenKeys={getOpenKeys()}
          items={menuItems}
          onClick={handleMobileMenuClick}
          style={{
            background: "#1E293B",
            borderRight: "none",
          }}
        />
      </div>
    </div>
  );

  return (
    <Layout style={{ height: "100vh", overflow: "hidden" }}>
      {/* 桌面端侧边导航 - 移动端隐藏 */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={220}
        breakpoint="md"
        onBreakpoint={(broken) => {
          if (broken) {
            setCollapsed(true);
          }
        }}
        style={{
          background: "#1E293B",
          height: "100vh",
          overflowY: "auto",
          overflowX: "hidden",
          display: isMobile ? "none" : "block",
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

      {/* 移动端导航 Drawer */}
      <Drawer
        placement="left"
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        width={280}
        closable={false}
        styles={{
          body: { padding: 0, background: "#1E293B" },
          header: { display: "none" },
        }}
      >
        {renderMobileMenuContent()}
      </Drawer>

      <Layout style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
        {/* 顶部导航 - 固定不滚动 */}
        <Header
          style={{
            padding: isMobile ? "0 12px" : "0 24px",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #E2E8F0",
            height: 64,
            flexShrink: 0,
          }}
        >
          {/* 左侧：移动端菜单按钮 + 标题 */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* 移动端菜单按钮 */}
            {isMobile && (
              <Button
                type="text"
                icon={<MenuIcon size={20} style={{ color: "#1E293B" }} />}
                onClick={() => setMobileDrawerOpen(true)}
                style={{ padding: 8 }}
              />
            )}
            <h1 style={{ margin: 0, fontSize: isMobile ? 16 : 18, fontWeight: 600, color: "#1E293B" }}>
              {title || "AIDataHub"}
            </h1>
          </div>

          <Space size={isMobile ? "small" : "middle"}>
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
                <Bell size={isMobile ? 16 : 18} style={{ color: "#6B7280" }} />
              </button>
            </Badge>

            {/* 用户菜单 - 移动端只显示头像 */}
            <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenuClick }} placement="bottomRight">
              <div style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                <Avatar size={isMobile ? 28 : 32} style={{ backgroundColor: "#2563EB" }}>
                  U
                </Avatar>
                {!isMobile && (
                  <>
                    <span style={{ color: "#1E293B" }}>管理员</span>
                    <ChevronDown size={14} style={{ color: "#6B7280" }} />
                  </>
                )}
              </div>
            </Dropdown>
          </Space>
        </Header>

        {/* 内容区域 - 唯一可滚动区域 */}
        <Content
          style={{
            flex: 1,
            padding: isMobile ? 12 : 24,
            background: "#F8FAFC",
            overflowY: "auto",
            overflowX: "hidden",
            minHeight: 0, // 确保 flex 子元素可以正确收缩
          }}
        >
          <div
            style={{
              padding: isMobile ? 12 : 24,
              background: "#fff",
              borderRadius: isMobile ? 4 : 8,
            }}
          >
            {children}
          </div>
        </Content>
      </Layout>

      {/* 通知中心弹窗 - 移动端全屏 */}
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
        width={isMobile ? "100%" : 700}
        style={isMobile ? { top: 0, margin: 0, maxWidth: "100%" } : undefined}
        styles={{
          body: {
            padding: 0,
            maxHeight: isMobile ? "calc(100vh - 110px)" : 500,
            overflowY: "auto"
          }
        }}
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