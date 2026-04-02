"use client";

/**
 * 首页仪表盘
 * 页面路径: /
 */

import { Card, Row, Col, Progress, Timeline, List, Tag, Button, Space } from "antd";
import Link from "next/link";
import {
  Database,
  FileText,
  Users,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
} from "lucide-react";

import { PageLayout } from "@/components/layout";
import { KPICardRow, StatusBadge, type KPICardData } from "@/components/ui";
import { ROUTES } from "@/constants";

/**
 * KPI 数据
 */
const kpiData: KPICardData[] = [
  {
    title: "数据源总数",
    value: 24,
    icon: <Database size={20} />,
    colorTheme: "primary",
    trend: "up",
    trendValue: 12.5,
  },
  {
    title: "元数据条目",
    value: 1856,
    icon: <FileText size={20} />,
    colorTheme: "success",
    trend: "up",
    trendValue: 8.3,
  },
  {
    title: "活跃用户",
    value: 128,
    icon: <Users size={20} />,
    colorTheme: "warning",
    trend: "down",
    trendValue: 2.1,
  },
  {
    title: "运行中任务",
    value: 16,
    icon: <Clock size={20} />,
    colorTheme: "primary",
    trend: "up",
    trendValue: 15.2,
  },
];

/**
 * 快捷入口配置
 */
const quickLinks = [
  { title: "数据源管理", href: ROUTES.DATA_SOURCES, icon: <Database size={20} />, color: "#3B82F6" },
  { title: "数据质量", href: ROUTES.DATA_QUALITY, icon: <CheckCircle size={20} />, color: "#10B981" },
  { title: "DAG编排", href: ROUTES.DAG, icon: <Clock size={20} />, color: "#8B5CF6" },
  { title: "组织用户", href: ROUTES.ORG_USER, icon: <Users size={20} />, color: "#F59E0B" },
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
 */
const todoItems = [
  { title: "质量工单处理", count: 3, href: ROUTES.DATA_QUALITY, urgent: true },
  { title: "数据源审批", count: 2, href: ROUTES.APPROVAL_TODO, urgent: false },
  { title: "用户权限申请", count: 5, href: ROUTES.APPROVAL_TODO, urgent: false },
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