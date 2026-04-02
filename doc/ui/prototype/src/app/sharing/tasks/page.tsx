"use client";

import { useState } from "react";
import { Card, Table, Tabs, Button, Space, Tag, Modal, Descriptions, Input, message } from "antd";
import { CheckCircle, XCircle, Clock, Eye, MessageSquare, Bell } from "lucide-react";
import { PageLayout } from "@/components/layout";
import { PageBreadcrumb } from "@/components/ui";
import { ROUTES } from "@/constants";

const BREADCRUMB_ITEMS = [{ title: "数据共享交换", href: "/sharing" }, { title: "事项任务" }];

const mockPendingTasks = [
  { id: "1", resource: "客户信息API", applicant: "大数据中心", provider: "数据管理局", time: "2024-01-20 10:00" },
  { id: "2", resource: "订单数据下载", applicant: "分析中心", provider: "业务部门", time: "2024-01-20 09:30" },
];

const mockDoneTasks = [
  { id: "3", resource: "产品目录服务", applicant: "研发部门", provider: "数据管理局", result: "approved", approveTime: "2024-01-19 16:00" },
];

export default function SharingTasksPage() {
  const [detailOpen, setDetailOpen] = useState(false);

  const pendingColumns = [
    { title: "资源信息", dataIndex: "resource", key: "resource" },
    { title: "申请方", dataIndex: "applicant", key: "applicant" },
    { title: "提供方", dataIndex: "provider", key: "provider" },
    { title: "申请时间", dataIndex: "time", key: "time" },
    {
      title: "操作",
      key: "actions",
      render: () => (
        <Space>
          <Button type="link" size="small" onClick={() => setDetailOpen(true)}>审批</Button>
          <Button type="link" size="small" icon={<Bell size={12} />}>催办</Button>
        </Space>
      ),
    },
  ];

  const doneColumns = [
    { title: "资源信息", dataIndex: "resource", key: "resource" },
    { title: "申请方", dataIndex: "applicant", key: "applicant" },
    { title: "审批结果", dataIndex: "result", key: "result", render: (v: string) => <Tag color={v === "approved" ? "green" : "red"}>{v === "approved" ? "通过" : "拒绝"}</Tag> },
    { title: "审批时间", dataIndex: "approveTime", key: "approveTime" },
    { title: "操作", key: "actions", render: () => <Button type="link" size="small">查看</Button> },
  ];

  return (
    <PageLayout title="事项任务">
      <PageBreadcrumb items={BREADCRUMB_ITEMS} />
      <Tabs
        items={[
          { key: "pending", label: <span><Clock size={14} /> 我的待办 (2)</span>, children: <Card><Table dataSource={mockPendingTasks} columns={pendingColumns} rowKey="id" /></Card> },
          { key: "done", label: <span><CheckCircle size={14} /> 我的已办</span>, children: <Card><Table dataSource={mockDoneTasks} columns={doneColumns} rowKey="id" /></Card> },
        ]}
      />
      <Modal title="审批详情" open={detailOpen} onCancel={() => setDetailOpen(false)} onOk={() => { message.success("审批成功"); setDetailOpen(false); }} width={600}>
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="资源名称">客户信息API</Descriptions.Item>
          <Descriptions.Item label="申请方">大数据中心</Descriptions.Item>
          <Descriptions.Item label="申请时间">2024-01-20 10:00</Descriptions.Item>
          <Descriptions.Item label="服务类型"><Tag>数据查询</Tag></Descriptions.Item>
        </Descriptions>
        <div style={{ marginTop: 16 }}>
          <span>审批意见:</span>
          <Input.TextArea rows={2} placeholder="请输入审批意见" style={{ marginTop: 8 }} />
        </div>
      </Modal>
    </PageLayout>
  );
}