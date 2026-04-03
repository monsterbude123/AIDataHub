"use client";

/**
 * 资源队列管理页面
 * 页面路径: /infrastructure/queue
 */

import { useState } from "react";
import { Card, Button, Space, message, Tag } from "antd";
import { Plus, Edit, Trash2, PlayCircle, StopCircle } from "lucide-react";

import { PageLayout } from "@/components/layout";
import {
  PageBreadcrumb,
  DataTable,
  ModalForm,
  type TableActionItem,
  type FormFieldConfig,
} from "@/components/ui";
import { ROUTES } from "@/constants";
import { mockResourceQueues, mockTenants } from "@/services/mock/infrastructure";
import type { ResourceQueue, ResourceQueueFormData } from "@/types/infrastructure";
import { QUEUE_STATUS_LABELS, PRIORITY_LABELS } from "@/types/infrastructure";

/**
 * 面包屑配置
 */
const BREADCRUMB_ITEMS = [
  { title: "基础设施", href: "/infrastructure" },
  { title: "资源队列" },
];

/**
 * 资源队列管理页面组件
 */
export default function ResourceQueuePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingQueue, setEditingQueue] = useState<ResourceQueue | null>(null);

  /**
   * 表格列配置
   */
  const columns = [
    {
      key: "name",
      title: "队列名称",
      dataIndex: "name",
      width: 150,
    },
    {
      key: "priority",
      title: "优先级",
      dataIndex: "priority",
      width: 100,
      render: (value: unknown) => {
        const priority = value as ResourceQueue["priority"];
        const colorMap: Record<ResourceQueue["priority"], string> = {
          high: "red",
          medium: "blue",
          low: "default",
        };
        return <Tag color={colorMap[priority]}>{PRIORITY_LABELS[priority]}</Tag>;
      },
    },
    {
      key: "tenantName",
      title: "所属租户",
      dataIndex: "tenantName",
      width: 120,
    },
    {
      key: "cpuAllocation",
      title: "CPU分配",
      dataIndex: "cpuAllocation",
      width: 100,
      render: (value: unknown) => `${value}核`,
    },
    {
      key: "memoryAllocation",
      title: "内存分配",
      dataIndex: "memoryAllocation",
      width: 100,
      render: (value: unknown) => `${value}GB`,
    },
    {
      key: "maxConcurrency",
      title: "最大并发",
      dataIndex: "maxConcurrency",
      width: 100,
    },
    {
      key: "currentTasks",
      title: "当前任务数",
      dataIndex: "currentTasks",
      width: 100,
    },
    {
      key: "status",
      title: "状态",
      dataIndex: "status",
      width: 80,
      render: (value: unknown) => {
        const status = value as ResourceQueue["status"];
        const colorMap: Record<ResourceQueue["status"], string> = {
          enabled: "green",
          disabled: "default",
        };
        return <Tag color={colorMap[status]}>{QUEUE_STATUS_LABELS[status]}</Tag>;
      },
    },
    {
      key: "createdAt",
      title: "创建时间",
      dataIndex: "createdAt",
      width: 160,
    },
  ];

  /**
   * 操作配置
   */
  const actions: TableActionItem[] = [
    {
      key: "edit",
      label: "编辑",
      icon: <Edit size={14} />,
      onClick: (record) => {
        setEditingQueue(record as ResourceQueue);
        setModalOpen(true);
      },
    },
    {
      key: "toggleStatus",
      label: "切换状态",
      icon: <PlayCircle size={14} />,
      onClick: (record) => {
        const queue = record as ResourceQueue;
        message.success(`已${queue.status === "enabled" ? "禁用" : "启用"}队列 ${queue.name}`);
      },
    },
    {
      key: "delete",
      label: "删除",
      icon: <Trash2 size={14} />,
      danger: true,
      confirm: true,
      confirmText: "确认删除该队列？",
      onClick: (record) => message.success(`已删除队列 ${(record as ResourceQueue).name}`),
    },
  ];

  /**
   * 表单字段配置
   */
  const formFields: FormFieldConfig[] = [
    {
      name: "name",
      label: "队列名称",
      type: "text",
      required: true,
      placeholder: "请输入队列名称",
    },
    {
      name: "tenantId",
      label: "所属租户",
      type: "select",
      required: true,
      options: mockTenants.map((tenant) => ({
        value: tenant.id,
        label: tenant.name,
      })),
    },
    {
      name: "priority",
      label: "优先级",
      type: "select",
      required: true,
      options: [
        { value: "high", label: "高" },
        { value: "medium", label: "中" },
        { value: "low", label: "低" },
      ],
      initialValue: "medium",
    },
    {
      name: "cpuAllocation",
      label: "CPU分配（核）",
      type: "number",
      required: true,
      placeholder: "请输入CPU分配",
      initialValue: 30,
    },
    {
      name: "memoryAllocation",
      label: "内存分配（GB）",
      type: "number",
      required: true,
      placeholder: "请输入内存分配",
      initialValue: 80,
    },
    {
      name: "maxConcurrency",
      label: "最大并发数",
      type: "number",
      required: true,
      placeholder: "请输入最大并发数",
      initialValue: 20,
    },
    {
      name: "status",
      label: "状态",
      type: "select",
      options: [
        { value: "enabled", label: "启用" },
        { value: "disabled", label: "禁用" },
      ],
      initialValue: "enabled",
    },
  ];

  /**
   * 处理表单提交
   */
  const handleSubmit = async (values: Record<string, unknown>) => {
    console.log("Submit queue:", values);
    message.success(editingQueue ? "队列更新成功" : "队列创建成功");
    setModalOpen(false);
    setEditingQueue(null);
  };

  return (
    <PageLayout title="资源队列管理">
      {/* 面包屑 */}
      <PageBreadcrumb items={BREADCRUMB_ITEMS} />

      {/* 顶部操作按钮 */}
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Button
            type="primary"
            icon={<Plus size={14} />}
            onClick={() => {
              setEditingQueue(null);
              setModalOpen(true);
            }}
          >
            新增队列
          </Button>
        </Space>
      </div>

      {/* 队列列表 */}
      <Card title={`队列列表 (${mockResourceQueues.length}个)`}>
        <DataTable
          columns={columns}
          dataSource={mockResourceQueues}
          actions={actions}
          rowKey="id"
          pagination
          defaultPageSize={10}
        />
      </Card>

      {/* 队列编辑弹窗 */}
      <ModalForm
        title={editingQueue ? "编辑队列" : "新增队列"}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditingQueue(null);
        }}
        onSubmit={handleSubmit}
        fields={formFields}
        initialValues={editingQueue ? { ...editingQueue } : undefined}
        width={600}
      />
    </PageLayout>
  );
}