"use client";

/**
 * 审批流程配置页
 * 页面路径: /system/approval-config
 */

import { useState } from "react";
import { Card, Table, Button, Space, Tag, Modal, Form, Input, Select, message, Steps, Switch } from "antd";
import { Plus, Edit, Trash2, Copy, Settings, User, CheckCircle } from "lucide-react";

import { PageLayout } from "@/components/layout";
import { PageBreadcrumb, StatusBadge } from "@/components/ui";
import { ROUTES } from "@/constants";

const BREADCRUMB_ITEMS = [
  { title: "系统管理", href: ROUTES.SYSTEM },
  { title: "审批流程配置" },
];

const mockFlows = [
  { id: "flow-001", name: "数据源审批", type: "数据集成", nodes: 3, status: "active", createTime: "2024-01-10" },
  { id: "flow-002", name: "服务发布审批", type: "数据服务", nodes: 2, status: "active", createTime: "2024-01-12" },
  { id: "flow-003", name: "资源发布审批", type: "数据共享", nodes: 3, status: "inactive", createTime: "2024-01-15" },
];

export default function ApprovalConfigPage() {
  const [modalOpen, setModalOpen] = useState(false);

  const columns = [
    { title: "流程名称", dataIndex: "name", key: "name", width: 180 },
    { title: "业务类型", dataIndex: "type", key: "type", width: 120 },
    { title: "审批节点数", dataIndex: "nodes", key: "nodes", width: 100 },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 80,
      render: (status: string) => <Tag color={status === "active" ? "green" : "default"}>{status === "active" ? "启用" : "禁用"}</Tag>,
    },
    { title: "创建时间", dataIndex: "createTime", key: "createTime", width: 120 },
    {
      title: "操作",
      key: "actions",
      width: 180,
      render: () => (
        <Space>
          <Button type="link" size="small" icon={<Edit size={12} />}>编辑</Button>
          <Button type="link" size="small" icon={<Copy size={12} />}>复制</Button>
          <Button type="link" size="small" danger>删除</Button>
        </Space>
      ),
    },
  ];

  return (
    <PageLayout title="审批流程配置">
      <PageBreadcrumb items={BREADCRUMB_ITEMS} />

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<Plus size={14} />} onClick={() => setModalOpen(true)}>新增流程</Button>
        </div>
        <Table dataSource={mockFlows} columns={columns} rowKey="id" pagination={false} />
      </Card>

      <Modal
        title="配置审批流程"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => { message.success("保存成功"); setModalOpen(false); }}
        width={700}
      >
        <Form layout="vertical">
          <Form.Item name="name" label="流程名称" rules={[{ required: true }]}>
            <Input placeholder="请输入流程名称" />
          </Form.Item>
          <Form.Item name="type" label="业务类型" rules={[{ required: true }]}>
            <Select options={[{ value: "数据集成", label: "数据集成" }, { value: "数据服务", label: "数据服务" }, { value: "数据共享", label: "数据共享" }]} />
          </Form.Item>
          <Form.Item label="审批节点">
            <Steps
              direction="vertical"
              current={-1}
              items={[
                { title: "发起申请", description: "用户提交申请" },
                { title: "部门审核", description: "部门负责人审核", status: "process" },
                { title: "管理员审批", description: "系统管理员最终审批" },
              ]}
            />
          </Form.Item>
          <Form.Item name="active" label="启用状态" valuePropName="checked" initialValue={true}>
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
        </Form>
      </Modal>
    </PageLayout>
  );
}