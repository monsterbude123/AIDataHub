"use client";

import { useState } from "react";
import { Card, Table, Button, Space, Tag, Modal, Form, Input, Select, TreeSelect, Steps, message } from "antd";
import { Plus, Edit, Trash2, Eye, Database, Globe, FileText, AppWindow } from "lucide-react";
import { PageLayout } from "@/components/layout";
import { PageBreadcrumb, DirectoryTree } from "@/components/ui";
import { ROUTES } from "@/constants";
import type { DirectoryTreeNode } from "@/components/ui";

const BREADCRUMB_ITEMS = [{ title: "数据共享交换", href: "/sharing" }, { title: "资源管理" }];

const mockCatalogTree: DirectoryTreeNode[] = [
  { key: "all", title: "全部资源", isLeaf: true },
  { key: "db", title: "库表数据", isLeaf: true },
  { key: "api", title: "接口数据", isLeaf: true },
  { key: "file", title: "文件数据", isLeaf: true },
  { key: "app", title: "应用系统", isLeaf: true },
];

const mockResources = [
  { id: "1", name: "客户信息表", type: "db", shareType: "conditional", status: "published", creator: "张三", time: "2024-01-20" },
  { id: "2", name: "订单查询API", type: "api", shareType: "unconditional", status: "published", creator: "李四", time: "2024-01-19" },
  { id: "3", name: "产品资料文档", type: "file", shareType: "none", status: "unpublished", creator: "王五", time: "2024-01-18" },
];

const TYPE_ICONS = { db: <Database size={14} />, api: <Globe size={14} />, file: <FileText size={14} />, app: <AppWindow size={14} /> };
const SHARE_TYPE_LABELS = { unconditional: { label: "无条件共享", color: "green" }, conditional: { label: "有条件共享", color: "orange" }, none: { label: "不共享", color: "default" } };

export default function SharingResourcesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const columns = [
    { title: "资源名称", dataIndex: "name", key: "name" },
    { title: "资源类型", dataIndex: "type", key: "type", render: (v: string) => <Tag icon={TYPE_ICONS[v as keyof typeof TYPE_ICONS]}>{v === "db" ? "库表" : v === "api" ? "接口" : v === "file" ? "文件" : "应用"}</Tag> },
    { title: "共享类型", dataIndex: "shareType", key: "shareType", render: (v: string) => { const t = SHARE_TYPE_LABELS[v as keyof typeof SHARE_TYPE_LABELS]; return <Tag color={t.color}>{t.label}</Tag>; } },
    { title: "状态", dataIndex: "status", key: "status", render: (v: string) => <Tag color={v === "published" ? "green" : "default"}>{v === "published" ? "已发布" : "未发布"}</Tag> },
    { title: "创建人", dataIndex: "creator", key: "creator" },
    { title: "创建时间", dataIndex: "time", key: "time" },
    { title: "操作", key: "actions", render: () => <Space><Button type="link" size="small">详情</Button><Button type="link" size="small">编辑</Button><Button type="link" size="small">发布</Button></Space> },
  ];

  return (
    <PageLayout title="资源管理">
      <PageBreadcrumb items={BREADCRUMB_ITEMS} />
      <div style={{ display: "flex", gap: 16 }}>
        <DirectoryTree treeData={mockCatalogTree} onSelect={() => {}} width={240} defaultSelectedKeys={["all"]} />
        <div style={{ flex: 1 }}>
          <Card style={{ marginBottom: 16 }}>
            <Space>
              <Button type="primary" icon={<Plus size={14} />} onClick={() => setModalOpen(true)}>新增编制资源</Button>
              <Button icon={<Plus size={14} />}>导入</Button>
              <Button icon={<Plus size={14} />}>导出</Button>
            </Space>
          </Card>
          <Card><Table dataSource={mockResources} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} /></Card>
        </div>
      </div>
      <Modal title="新增编制资源" open={modalOpen} onCancel={() => setModalOpen(false)} onOk={() => { message.success("创建成功"); setModalOpen(false); }} width={700}>
        <Steps current={currentStep} items={[{ title: "基本信息" }, { title: "资源登记" }, { title: "共享配置" }]} style={{ marginBottom: 24 }} />
        <Form layout="vertical">
          <Form.Item name="name" label="资源名称" rules={[{ required: true }]}><Input placeholder="请输入资源名称" /></Form.Item>
          <Form.Item name="type" label="资源类型" rules={[{ required: true }]}>
            <Select options={[{ value: "db", label: "库表数据" }, { value: "api", label: "接口数据" }, { value: "file", label: "文件数据" }, { value: "app", label: "应用系统" }]} />
          </Form.Item>
          <Form.Item name="shareType" label="共享类型">
            <Select options={[{ value: "unconditional", label: "无条件共享" }, { value: "conditional", label: "有条件共享" }, { value: "none", label: "不共享" }]} />
          </Form.Item>
        </Form>
      </Modal>
    </PageLayout>
  );
}