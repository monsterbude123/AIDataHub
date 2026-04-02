"use client";

/**
 * 页面布局组件
 * 包含侧边导航、顶部导航和内容区域
 */

import { useState } from "react";
import { Layout, Menu, Dropdown, Avatar, Space, Badge } from "antd";
import type { MenuProps } from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";

import { ROUTES, APP_CONFIG } from "@/constants";

const { Header, Content, Footer, Sider } = Layout;

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
      { key: "/data-service/catalog", label: "服务目录" },
      { key: "/data-service/config", label: "服务配置" },
      { key: "/data-service/authorization", label: "服务授权" },
      { key: "/data-service/monitoring", label: "服务监控" },
    ],
  },
  {
    key: "metadata",
    icon: <FileText size={16} />,
    label: "元数据管理",
    children: [
      { key: "/metadata/list", label: "元数据列表" },
      { key: "/metadata/detail", label: "元数据详情" },
    ],
  },
  {
    key: "data-organization",
    icon: <FolderTree size={16} />,
    label: "数据组织",
    children: [
      { key: "/data-organization/catalog", label: "资源目录" },
      { key: "/data-organization/mapping", label: "入库映射" },
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
      { key: "/security/desensitization", label: "数据脱敏" },
      { key: "/security/classification", label: "分级分类" },
      { key: "/security/watermark", label: "水印管理" },
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
      { key: "/analytics/query", label: "即席查询" },
      { key: "/analytics/visualization", label: "可视化分析" },
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
  const [collapsed, setCollapsed] = useState(false);

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
    <Layout style={{ minHeight: "100vh" }}>
      {/* 侧边导航 */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={220}
        style={{
          background: "#1E293B",
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

      <Layout>
        {/* 顶部导航 */}
        <Header
          style={{
            padding: "0 24px",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #E2E8F0",
            height: 64,
          }}
        >
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: "#1E293B" }}>
            {title || "AIDataHub"}
          </h1>

          <Space size="middle">
            {/* 通知 */}
            <Badge count={3} size="small">
              <button
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  padding: 8,
                }}
              >
                <Bell size={18} style={{ color: "#6B7280" }} />
              </button>
            </Badge>

            {/* 用户菜单 */}
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
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

        {/* 内容区域 */}
        <Content
          style={{
            margin: 0,
            padding: 24,
            background: "#F8FAFC",
            overflow: "auto",
          }}
        >
          <div
            style={{
              padding: 24,
              background: "#fff",
              borderRadius: 8,
              minHeight: "calc(100vh - 160px)",
            }}
          >
            {children}
          </div>
        </Content>

        {/* 页脚 */}
        <Footer
          style={{
            textAlign: "center",
            padding: "12px 24px",
            background: "#F8FAFC",
            borderTop: "1px solid #E2E8F0",
          }}
        >
          <span style={{ color: "#94A3B8", fontSize: 12 }}>
            AIDataHub ©{new Date().getFullYear()} 企业级数据中台
          </span>
        </Footer>
      </Layout>
    </Layout>
  );
}