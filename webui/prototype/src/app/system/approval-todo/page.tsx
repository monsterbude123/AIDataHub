"use client";

/**
 * 待办事项页
 * 页面路径: /system/approval-todo
 */

import { useState } from "react";
import { Card, Table, Button, Space, Tag, Tabs, Modal, Descriptions, Input, message } from "antd";
import { CheckCircle, XCircle, Clock, Eye, MessageSquare } from "lucide-react";

import { PageLayout } from "@/components/layout";
import { PageBreadcrumb } from "@/components/ui";
import { ROUTES } from "@/constants";

const BREADCRUMB_ITEMS = [
  { title: "系统管理", href: ROUTES.SYSTEM },
  { title: "待办事项" },
];

const mockPendingTasks = [
  { id: "todo-001", title: "数据源审批申请", applicant: "张三", type: "数据集成", time: "2024-01-20 10:00", status: "pending" },
  { id: "todo-002", title: "服务发布申请", applicant: "李四", type: "数据服务", time: "2024-01-20 09:30", status: "pending" },
  { id: "todo-003", title: "资源共享申请", applicant: "王五", type: "数据共享", time: "2024-01-19 16:00", status: "pending" },
];

const mockDoneTasks = [
  { id: "done-001", title: "数据源审批申请", applicant: "赵六", type: "数据集成", time: "2024-01-19 14:00", result: "approved", approveTime: "2024-01-19 15:00" },
  { id: "done-002", title: "服务发布申请", applicant: "孙七", type: "数据服务", time: "2024-01-18 11:00", result: "rejected", approveTime: "2024-01-18 14:00" },
];

export default function ApprovalTodoPage() {
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const pendingColumns = [
    { title: "申请标题", dataIndex: "title", key: "title", width: 200 },
    { title: "申请人", dataIndex: "applicant", key: "applicant", width: 100 },
    { title: "类型", dataIndex: "type", key: "type", width: 100, render: (v: string) => <Tag>{v}</Tag> },
    { title: "申请时间", dataIndex: "time", key: "time", width: 160 },
    {
      title: "操作",
      key: "actions",
      width: 200,
      render: () => (
        <Space>
          <Button type="link" size="small" icon={<Eye size={12} />} onClick={() => setDetailModalOpen(true)}>查看</Button>
          <Button type="link" size="small" icon={<CheckCircle size={12} />} style={{ color: "#10B981" }}>通过</Button>
          <Button type="link" size="small" icon={<XCircle size={12} />} danger>拒绝</Button>
        </Space>
      ),
    },
  ];

  const doneColumns = [
    { title: "申请标题", dataIndex: "title", key: "title", width: 200 },
    { title: "申请人", dataIndex: "applicant", key: "applicant", width: 100 },
    { title: "类型", dataIndex: "type", key: "type", width: 100, render: (v: string) => <Tag>{v}</Tag> },
    { title: "申请时间", dataIndex: "time", key: "time", width: 160 },
    {
      title: "审批结果",
      dataIndex: "result",
      key: "result",
      width: 100,
      render: (v: string) => <Tag color={v === "approved" ? "green" : "red"}>{v === "approved" ? "已通过" : "已拒绝"}</Tag>,
    },
    { title: "审批时间", dataIndex: "approveTime", key: "approveTime", width: 160 },
    {
      title: "操作",
      key: "actions",
      width: 80,
      render: () => <Button type="link" size="small">查看</Button>,
    },
  ];

  return (
    <PageLayout title="待办事项">
      <PageBreadcrumb items={BREADCRUMB_ITEMS} />

      <Tabs
        items={[
          {
            key: "pending",
            label: <span><Clock size={14} style={{ marginRight: 4 }} />待处理 (3)</span>,
            children: (
              <Card>
                <Table dataSource={mockPendingTasks} columns={pendingColumns} rowKey="id" pagination={false} />
              </Card>
            ),
          },
          {
            key: "done",
            label: <span><CheckCircle size={14} style={{ marginRight: 4 }} />已处理</span>,
            children: (
              <Card>
                <Table dataSource={mockDoneTasks} columns={doneColumns} rowKey="id" pagination={false} />
              </Card>
            ),
          },
        ]}
      />

      <Modal
        title="审批详情"
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={
          <Space>
            <Button onClick={() => setDetailModalOpen(false)}>取消</Button>
            <Button danger icon={<XCircle size={14} />}>拒绝</Button>
            <Button type="primary" icon={<CheckCircle size={14} />}>通过</Button>
          </Space>
        }
        width={600}
      >
        <Descriptions column={2} bordered>
          <Descriptions.Item label="申请标题">数据源审批申请</Descriptions.Item>
          <Descriptions.Item label="申请人">张三</Descriptions.Item>
          <Descriptions.Item label="申请时间">2024-01-20 10:00</Descriptions.Item>
          <Descriptions.Item label="申请类型"><Tag>数据集成</Tag></Descriptions.Item>
          <Descriptions.Item label="申请说明" span={2}>申请新增MySQL数据源，用于业务数据接入</Descriptions.Item>
        </Descriptions>
        <div style={{ marginTop: 16 }}>
          <span style={{ marginRight: 8 }}>审批意见:</span>
          <Input.TextArea rows={3} placeholder="请输入审批意见（可选）" />
        </div>
      </Modal>
    </PageLayout>
  );
}