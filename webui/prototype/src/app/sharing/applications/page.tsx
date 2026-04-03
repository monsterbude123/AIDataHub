"use client";

import { useState } from "react";
import { Card, Table, Tabs, Button, Space, Tag, Modal, Form, Input, Select, DatePicker, message } from "antd";
import { Plus, Edit, Eye, Clock, CheckCircle, FileText, Database, Search } from "lucide-react";
import { PageLayout } from "@/components/layout";
import { PageBreadcrumb } from "@/components/ui";
import { ROUTES } from "@/constants";

const BREADCRUMB_ITEMS = [{ title: "数据共享交换", href: "/sharing" }, { title: "服务申请" }];

const mockMyApplications = [
  { id: "1", name: "客户信息查询申请", type: "数据查询", status: "pending", time: "2024-01-20" },
  { id: "2", name: "订单数据下载申请", type: "文件下载", status: "approved", time: "2024-01-19" },
];

const mockPendingApprovals = [
  { id: "3", name: "产品目录查询申请", applicant: "张三", time: "2024-01-20 10:00", status: "pending" },
];

const mockSharedToMe = [
  { id: "4", name: "客户画像服务", provider: "数据管理局", expireTime: "2024-06-30" },
];

export default function SharingApplicationsPage() {
  const [modalOpen, setModalOpen] = useState(false);

  const myAppColumns = [
    { title: "服务名称", dataIndex: "name", key: "name" },
    { title: "服务类型", dataIndex: "type", key: "type", render: (v: string) => <Tag>{v}</Tag> },
    { title: "申请状态", dataIndex: "status", key: "status", render: (v: string) => <Tag color={v === "approved" ? "green" : v === "pending" ? "orange" : "default"}>{v === "approved" ? "已通过" : v === "pending" ? "待审批" : "已拒绝"}</Tag> },
    { title: "申请时间", dataIndex: "time", key: "time" },
    { title: "操作", key: "actions", render: () => <Space><Button type="link" size="small">查看</Button><Button type="link" size="small">撤销</Button></Space> },
  ];

  const approvalColumns = [
    { title: "服务名称", dataIndex: "name", key: "name" },
    { title: "申请人", dataIndex: "applicant", key: "applicant" },
    { title: "申请时间", dataIndex: "time", key: "time" },
    { title: "操作", key: "actions", render: () => <Button type="primary" size="small">审批</Button> },
  ];

  const sharedColumns = [
    { title: "服务名称", dataIndex: "name", key: "name" },
    { title: "提供方", dataIndex: "provider", key: "provider" },
    { title: "有效期至", dataIndex: "expireTime", key: "expireTime" },
    { title: "操作", key: "actions", render: () => <Space><Button type="link" size="small">使用</Button><Button type="link" size="small">文档</Button></Space> },
  ];

  return (
    <PageLayout title="服务申请管理">
      <PageBreadcrumb items={BREADCRUMB_ITEMS} />
      <Tabs
        items={[
          { key: "my", label: <span><FileText size={14} /> 我的申请</span>, children: <Card extra={<Button type="primary" icon={<Plus size={14} />} onClick={() => setModalOpen(true)}>新增申请</Button>}><Table dataSource={mockMyApplications} columns={myAppColumns} rowKey="id" /></Card> },
          { key: "approval", label: <span><Clock size={14} /> 待我审批 (1)</span>, children: <Card><Table dataSource={mockPendingApprovals} columns={approvalColumns} rowKey="id" /></Card> },
          { key: "shared", label: <span><CheckCircle size={14} /> 已共享给我</span>, children: <Card><Table dataSource={mockSharedToMe} columns={sharedColumns} rowKey="id" /></Card> },
        ]}
      />
      <Modal title="新增服务申请" open={modalOpen} onCancel={() => setModalOpen(false)} onOk={() => { message.success("申请已提交"); setModalOpen(false); }} width={600}>
        <Form layout="vertical">
          <Form.Item name="service" label="选择服务" rules={[{ required: true }]}><Select placeholder="选择要申请的服务" options={[{ value: "customer-api", label: "客户信息查询API" }]} /></Form.Item>
          <Form.Item name="purpose" label="用途说明" rules={[{ required: true }]}><Input.TextArea rows={3} placeholder="请说明申请用途" /></Form.Item>
          <Form.Item name="expireTime" label="期望有效期"><DatePicker style={{ width: "100%" }} /></Form.Item>
        </Form>
      </Modal>
    </PageLayout>
  );
}