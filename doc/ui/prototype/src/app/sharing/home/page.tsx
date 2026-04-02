"use client";

import { Card, Row, Col, Statistic, Table, Button, Space, Tag, Progress } from "antd";
import { BarChart2, Users, Database, TrendingUp, ArrowRight, RefreshCw } from "lucide-react";
import { PageLayout } from "@/components/layout";
import { PageBreadcrumb, KPICardGrid } from "@/components/ui";
import { ROUTES } from "@/constants";

const BREADCRUMB_ITEMS = [{ title: "数据共享交换", href: "/sharing" }, { title: "首页仪表盘" }];

const kpiData = [
  { title: "待办任务", value: "12", icon: <Users size={20} />, trend: "up" as const, trendValue: 5 },
  { title: "资源目录", value: "156", icon: <Database size={20} /> },
  { title: "本月申请", value: "45", icon: <TrendingUp size={20} />, trend: "up" as const, trendValue: 12 },
  { title: "活跃服务", value: "89", icon: <BarChart2 size={20} /> },
];

const mockHotResources = [
  { rank: 1, name: "客户信息查询API", visits: 15234 },
  { rank: 2, name: "订单数据下载", visits: 8567 },
  { rank: 3, name: "产品目录服务", visits: 5432 },
  { rank: 4, name: "用户行为分析", visits: 3210 },
  { rank: 5, name: "数据质量报告", visits: 2180 },
];

const mockApplications = [
  { name: "客户数据共享申请", provider: "数据管理局", consumer: "大数据中心", time: "2024-01-20", status: "pending" },
  { name: "订单数据共享申请", provider: "业务部门", consumer: "分析中心", time: "2024-01-19", status: "approved" },
];

export default function SharingHomePage() {
  return (
    <PageLayout title="共享交换首页">
      <PageBreadcrumb items={BREADCRUMB_ITEMS} />
      <KPICardGrid data={kpiData} columns={4} />

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title="热门资源 TOP 5" extra={<Button type="link">查看全部 <ArrowRight size={12} /></Button>}>
            <Table
              dataSource={mockHotResources}
              columns={[
                { title: "排名", dataIndex: "rank", key: "rank", width: 60, render: (v: number) => <Tag color={v === 1 ? "gold" : v === 2 ? "silver" : v === 3 ? "orange" : "default"}>{v}</Tag> },
                { title: "资源名称", dataIndex: "name", key: "name" },
                { title: "访问次数", dataIndex: "visits", key: "visits", render: (v: number) => v.toLocaleString() },
              ]}
              rowKey="rank"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="最新申请" extra={<Button type="link">查看全部 <ArrowRight size={12} /></Button>}>
            <Table
              dataSource={mockApplications}
              columns={[
                { title: "申请名称", dataIndex: "name", key: "name" },
                { title: "提供方", dataIndex: "provider", key: "provider", width: 100 },
                { title: "需求方", dataIndex: "consumer", key: "consumer", width: 100 },
                { title: "状态", dataIndex: "status", key: "status", width: 80, render: (v: string) => <Tag color={v === "approved" ? "green" : "orange"}>{v === "approved" ? "已通过" : "待审批"}</Tag> },
              ]}
              rowKey="name"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </PageLayout>
  );
}