"use client";

/**
 * 首页仪表盘
 * 页面路径: /
 * 基于 design-system/pages/modules/common/dashboard.md 规范
 * 支持自动刷新机制
 */

import { useState, useCallback } from "react";
import { Card, Row, Col, Progress, Timeline, List, Tag, Button, Space, Skeleton, Select, Tooltip, message } from "antd";
import Link from "next/link";
import {
  Database,
  FileText,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  FolderKanban,
  Share2,
  ClipboardCheck,
  RefreshCw,
  Play,
  Pause,
} from "lucide-react";

import { PageLayout } from "@/components/layout";
import { KPICardRow, StatusBadge, type KPICardData, LoadingState } from "@/components/ui";
import { ROUTES } from "@/constants";
import { useAutoRefresh, formatLastRefreshTime } from "@/hooks/useAutoRefresh";

/**
 * 刷新间隔选项
 */
const REFRESH_INTERVALS = [
  { value: 15000, label: "15秒" },
  { value: 30000, label: "30秒" },
  { value: 60000, label: "1分钟" },
  { value: 300000, label: "5分钟" },
];

/**
 * KPI 数据
 * 基于 dashboard.md 核心指标卡片规范
 */
const kpiData: KPICardData[] = [
  {
    title: "数据源总数",
    value: 24,
    icon: <Database size={20} />,
    colorTheme: "primary",
    trend: "up",
    trendValue: 12.5,
    tooltip: "已配置的数据源数量",
  },
  {
    title: "迁移任务",
    value: "12/5",
    icon: <FolderKanban size={20} />,
    colorTheme: "success",
    tooltip: "运行中/待处理任务数",
  },
  {
    title: "数据服务",
    value: 18,
    icon: <Share2 size={20} />,
    colorTheme: "warning",
    trend: "up",
    trendValue: 8.3,
    tooltip: "已发布的数据服务数量",
  },
  {
    title: "质量问题",
    value: 3,
    icon: <AlertTriangle size={20} />,
    colorTheme: "error",
    tooltip: "待处理的质量问题工单",
  },
  {
    title: "待审批",
    value: 2,
    icon: <ClipboardCheck size={20} />,
    colorTheme: "primary",
    tooltip: "我的待审批事项",
  },
];

/**
 * 快捷入口配置
 * 基于 dashboard.md 快捷入口规范
 */
const quickLinks = [
  { title: "数据源管理", href: ROUTES.DATA_SOURCES, icon: <Database size={20} />, color: "#3B82F6" },
  { title: "数据质量", href: ROUTES.DATA_QUALITY, icon: <CheckCircle size={20} />, color: "#10B981" },
  { title: "DAG编排", href: "/project/proj-001/scheduler/dag", icon: <Clock size={20} />, color: "#8B5CF6" },
  { title: "服务目录", href: ROUTES.SERVICE_CATALOG, icon: <Share2 size={20} />, color: "#F59E0B" },
  { title: "即席查询", href: ROUTES.AD_HOC_QUERY, icon: <FileText size={20} />, color: "#06B6D4" },
  { title: "审批待办", href: ROUTES.APPROVAL_TODO, icon: <ClipboardCheck size={20} />, color: "#EF4444" },
];

/**
 * 最近活动数据
 */
const recentActivities = [
  { time: "10分钟前", content: "数据源「生产订单数据库」连接测试成功", type: "success" },
  { time: "30分钟前", content: "DAG任务「订单数据处理流程」执行完成", type: "success" },
  { time: "1小时前", content: "质量检测发现问题：客户表存在空值", type: "warning" },
  { time: "2小时前", content: "新用户「李四」注册成功", type: "info" },
  { time: "3小时前", content: "数据源「财务系统」连接失败", type: "error" },
];

/**
 * 待处理事项
 * 基于 dashboard.md 今日待办事项规范
 */
const todoItems = [
  { title: "质量工单处理", count: 3, href: ROUTES.DATA_QUALITY, urgent: true, type: "quality" },
  { title: "数据源审批", count: 2, href: ROUTES.APPROVAL_TODO, urgent: false, type: "approval" },
  { title: "用户权限申请", count: 5, href: ROUTES.APPROVAL_TODO, urgent: false, type: "approval" },
];

/**
 * 资源使用情况
 */
const resourceUsage = [
  { name: "存储空间", used: 68, total: 100, unit: "GB" },
  { name: "计算资源", used: 45, total: 100, unit: "%" },
  { name: "API调用", used: 8500, total: 10000, unit: "次/日" },
];

/**
 * 首页组件
 */
export default function HomePage() {
  // 刷新间隔状态
  const [refreshInterval, setRefreshInterval] = useState(30000);

  // 模拟数据刷新
  const handleRefresh = useCallback(async () => {
    // 这里实际项目中会调用 API 获取最新数据
    // 模拟 API 调用延迟
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log("Dashboard data refreshed at", new Date().toISOString());
  }, []);

  // 自动刷新 Hook
  const {
    isRefreshing,
    lastRefreshTime,
    countdown,
    refresh,
    start,
    stop,
    isRunning,
  } = useAutoRefresh({
    interval: refreshInterval,
    enabled: true,
    pauseOnHidden: true,
    onRefresh: handleRefresh,
  });

  // 手动刷新
  const handleManualRefresh = async () => {
    message.info("正在刷新数据...");
    await refresh();
    message.success("数据已更新");
  };

  // 切换自动刷新状态
  const toggleAutoRefresh = () => {
    if (isRunning) {
      stop();
      message.info("已暂停自动刷新");
    } else {
      start();
      message.info("已开启自动刷新");
    }
  };

  return (
    <PageLayout title="工作台">
      {/* 欢迎区域 */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>
              欢迎使用 AIDataHub 数据中台
            </h2>
            <p style={{ margin: "8px 0 0", color: "#6B7280" }}>
              今天是 {new Date().toLocaleDateString("zh-CN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {quickLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: link.color }}>{link.icon}</span>
                  {link.title}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </Card>

      {/* 自动刷新控制栏 */}
      <Card size="small" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Space size="middle">
            {/* 自动刷新开关 */}
            <Button
              type={isRunning ? "default" : "primary"}
              icon={isRunning ? <Pause size={14} /> : <Play size={14} />}
              onClick={toggleAutoRefresh}
            >
              {isRunning ? "暂停刷新" : "开启刷新"}
            </Button>

            {/* 刷新间隔选择 */}
            <Space size="small">
              <span style={{ color: "#6B7280", fontSize: 13 }}>刷新间隔:</span>
              <Select
                value={refreshInterval}
                onChange={setRefreshInterval}
                options={REFRESH_INTERVALS}
                style={{ width: 100 }}
                size="small"
                disabled={!isRunning}
              />
            </Space>

            {/* 手动刷新按钮 */}
            <Tooltip title="立即刷新数据">
              <Button
                icon={<RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />}
                onClick={handleManualRefresh}
                loading={isRefreshing}
              >
                刷新
              </Button>
            </Tooltip>
          </Space>

          {/* 刷新状态信息 */}
          <Space size="large">
            {/* 倒计时 */}
            {isRunning && (
              <span style={{ color: "#6B7280", fontSize: 13 }}>
                <Clock size={14} style={{ marginRight: 4, verticalAlign: "middle" }} />
                {countdown}秒后刷新
              </span>
            )}

            {/* 最后刷新时间 */}
            <Tooltip title={lastRefreshTime?.toLocaleString("zh-CN")}>
              <span style={{ color: "#6B7280", fontSize: 13 }}>
                最后更新: {formatLastRefreshTime(lastRefreshTime)}
              </span>
            </Tooltip>
          </Space>
        </div>
      </Card>

      {/* KPI 卡片 */}
      <div style={{ marginBottom: 24 }}>
        <KPICardRow data={kpiData} />
      </div>

      <Row gutter={24}>
        {/* 左侧内容 */}
        <Col xs={24} lg={16}>
          {/* 数据概览 */}
          <Card title="数据概览" style={{ marginBottom: 24 }}>
            <Row gutter={16}>
              <Col span={12}>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span>数据源连接率</span>
                    <span style={{ fontWeight: 600 }}>92%</span>
                  </div>
                  <Progress percent={92} strokeColor="#10B981" showInfo={false} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span>元数据完整度</span>
                    <span style={{ fontWeight: 600 }}>78%</span>
                  </div>
                  <Progress percent={78} strokeColor="#3B82F6" showInfo={false} />
                </div>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span>质量检测通过率</span>
                    <span style={{ fontWeight: 600 }}>85%</span>
                  </div>
                  <Progress percent={85} strokeColor="#F59E0B" showInfo={false} />
                </div>
              </Col>
              <Col span={12}>
                <div style={{ textAlign: "center" }}>
                  <h4 style={{ marginBottom: 16 }}>任务执行状态（今日）</h4>
                  <Row gutter={16}>
                    <Col span={8}>
                      <div style={{ fontSize: 28, fontWeight: 600, color: "#10B981" }}>45</div>
                      <div style={{ color: "#6B7280", fontSize: 12 }}>成功</div>
                    </Col>
                    <Col span={8}>
                      <div style={{ fontSize: 28, fontWeight: 600, color: "#EF4444" }}>3</div>
                      <div style={{ color: "#6B7280", fontSize: 12 }}>失败</div>
                    </Col>
                    <Col span={8}>
                      <div style={{ fontSize: 28, fontWeight: 600, color: "#3B82F6" }}>8</div>
                      <div style={{ color: "#6B7280", fontSize: 12 }}>运行中</div>
                    </Col>
                  </Row>
                </div>
              </Col>
            </Row>
          </Card>

          {/* 最近活动 */}
          <Card title="最近活动" extra={<Link href="/logs">查看全部</Link>}>
            <Timeline
              items={recentActivities.map((activity) => ({
                color:
                  activity.type === "success"
                    ? "#10B981"
                    : activity.type === "warning"
                    ? "#F59E0B"
                    : activity.type === "error"
                    ? "#EF4444"
                    : "#3B82F6",
                children: (
                  <div>
                    <span style={{ color: "#6B7280", fontSize: 12, marginRight: 8 }}>
                      {activity.time}
                    </span>
                    <span>{activity.content}</span>
                  </div>
                ),
              }))}
            />
          </Card>
        </Col>

        {/* 右侧内容 */}
        <Col xs={24} lg={8}>
          {/* 待处理事项 */}
          <Card title="待处理事项" style={{ marginBottom: 24 }}>
            <List
              dataSource={todoItems}
              renderItem={(item) => (
                <List.Item>
                  <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {item.urgent && <AlertTriangle size={14} style={{ color: "#EF4444" }} />}
                      <Link href={item.href} style={{ color: item.urgent ? "#EF4444" : "#1E293B" }}>
                        {item.title}
                      </Link>
                    </div>
                    <Tag color={item.urgent ? "error" : "default"}>{item.count}</Tag>
                  </div>
                </List.Item>
              )}
            />
          </Card>

          {/* 资源使用 */}
          <Card title="资源使用情况">
            {resourceUsage.map((resource) => {
              const percent = Math.round((resource.used / resource.total) * 100);
              return (
                <div key={resource.name} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span>{resource.name}</span>
                    <span style={{ fontSize: 12, color: "#6B7280" }}>
                      {resource.used} / {resource.total} {resource.unit}
                    </span>
                  </div>
                  <Progress
                    percent={percent}
                    strokeColor={percent > 80 ? "#EF4444" : percent > 60 ? "#F59E0B" : "#3B82F6"}
                    showInfo={false}
                    size="small"
                  />
                </div>
              );
            })}
          </Card>
        </Col>
      </Row>
    </PageLayout>
  );
}