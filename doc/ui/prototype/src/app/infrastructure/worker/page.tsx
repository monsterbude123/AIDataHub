"use client";

/**
 * Worker节点管理页面
 * 页面路径: /infrastructure/worker
 */

import { useState } from "react";
import { Card, Button, Space, message, Tag, Progress } from "antd";
import { Plus, Edit, Trash2, PlayCircle, StopCircle, Settings } from "lucide-react";

import { PageLayout } from "@/components/layout";
import {
  PageBreadcrumb,
  DataTable,
  ModalForm,
  type TableActionItem,
  type FormFieldConfig,
} from "@/components/ui";
import { ROUTES } from "@/constants";
import { mockWorkerNodes } from "@/services/mock/infrastructure";
import type { WorkerNode, WorkerNodeFormData } from "@/types/infrastructure";
import { WORKER_STATUS_LABELS } from "@/types/infrastructure";

/**
 * 面包屑配置
 */
const BREADCRUMB_ITEMS = [
  { title: "基础设施", href: "/infrastructure" },
  { title: "Worker节点" },
];

/**
 * Worker节点管理页面组件
 */
export default function WorkerNodePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<WorkerNode | null>(null);

  /**
   * 表格列配置
   */
  const columns = [
    {
      key: "name",
      title: "节点名称",
      dataIndex: "name",
      width: 150,
    },
    {
      key: "ipAddress",
      title: "IP地址",
      dataIndex: "ipAddress",
      width: 130,
    },
    {
      key: "port",
      title: "端口",
      dataIndex: "port",
      width: 80,
    },
    {
      key: "status",
      title: "状态",
      dataIndex: "status",
      width: 100,
      render: (value: unknown) => {
        const status = value as WorkerNode["status"];
        const colorMap: Record<WorkerNode["status"], string> = {
          online: "green",
          offline: "default",
          maintenance: "orange",
        };
        return <Tag color={colorMap[status]}>{WORKER_STATUS_LABELS[status]}</Tag>;
      },
    },
    {
      key: "taskCount",
      title: "任务数",
      dataIndex: "taskCount",
      width: 80,
    },
    {
      key: "cpuUsage",
      title: "CPU使用率",
      dataIndex: "cpuUsage",
      width: 130,
      render: (value: unknown, record: Record<string, unknown>) => {
        const worker = record as unknown as WorkerNode;
        const usage = value as number;
        const max = worker.maxCpu;
        const percent = Math.round(usage);
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Progress
              percent={percent}
              size="small"
              style={{ width: 80 }}
              status={percent > 80 ? "exception" : "normal"}
            />
            <span style={{ fontSize: 12 }}>{usage}/{max}核</span>
          </div>
        );
      },
    },
    {
      key: "memoryUsage",
      title: "内存使用率",
      dataIndex: "memoryUsage",
      width: 130,
      render: (value: unknown, record: Record<string, unknown>) => {
        const worker = record as unknown as WorkerNode;
        const usage = value as number;
        const max = worker.maxMemory;
        const percent = Math.round(usage);
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Progress
              percent={percent}
              size="small"
              style={{ width: 80 }}
              status={percent > 80 ? "exception" : "normal"}
            />
            <span style={{ fontSize: 12 }}>{Math.round(usage * max / 100)}/{max}GB</span>
          </div>
        );
      },
    },
    {
      key: "lastHeartbeat",
      title: "最后心跳",
      dataIndex: "lastHeartbeat",
      width: 160,
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
        setEditingWorker(record as WorkerNode);
        setModalOpen(true);
      },
    },
    {
      key: "toggleOnline",
      label: "上线/下线",
      icon: <PlayCircle size={14} />,
      onClick: (record) => {
        const worker = record as unknown as WorkerNode;
        if (worker.status === "online") {
          message.success(`已下线节点 ${worker.name}`);
        } else if (worker.status === "offline") {
          message.success(`已上线节点 ${worker.name}`);
        } else {
          message.warning("维护中节点无法直接切换状态");
        }
      },
    },
    {
      key: "maintenance",
      label: "维护模式",
      icon: <Settings size={14} />,
      onClick: (record) => {
        const worker = record as unknown as WorkerNode;
        message.success(`已将节点 ${worker.name} 设置为维护模式`);
      },
    },
    {
      key: "delete",
      label: "删除",
      icon: <Trash2 size={14} />,
      danger: true,
      confirm: true,
      confirmText: "确认删除该节点？",
      onClick: (record) => message.success(`已删除节点 ${(record as WorkerNode).name}`),
    },
  ];

  /**
   * 表单字段配置
   */
  const formFields: FormFieldConfig[] = [
    {
      name: "name",
      label: "节点名称",
      type: "text",
      required: true,
      placeholder: "请输入节点名称",
    },
    {
      name: "ipAddress",
      label: "IP地址",
      type: "text",
      required: true,
      placeholder: "请输入IP地址",
    },
    {
      name: "port",
      label: "端口",
      type: "number",
      required: true,
      placeholder: "请输入端口",
      initialValue: 8080,
    },
    {
      name: "maxCpu",
      label: "最大CPU（核）",
      type: "number",
      required: true,
      placeholder: "请输入最大CPU",
      initialValue: 64,
    },
    {
      name: "maxMemory",
      label: "最大内存（GB）",
      type: "number",
      required: true,
      placeholder: "请输入最大内存",
      initialValue: 128,
    },
  ];

  /**
   * 处理表单提交
   */
  const handleSubmit = async (values: Record<string, unknown>) => {
    console.log("Submit worker:", values);
    message.success(editingWorker ? "节点更新成功" : "节点创建成功");
    setModalOpen(false);
    setEditingWorker(null);
  };

  /**
   * 统计在线节点数
   */
  const onlineCount = mockWorkerNodes.filter((w) => w.status === "online").length;

  return (
    <PageLayout title="Worker节点管理">
      {/* 面包屑 */}
      <PageBreadcrumb items={BREADCRUMB_ITEMS} />

      {/* 顶部操作按钮 */}
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Button
            type="primary"
            icon={<Plus size={14} />}
            onClick={() => {
              setEditingWorker(null);
              setModalOpen(true);
            }}
          >
            新增节点
          </Button>
        </Space>
      </div>

      {/* 节点列表 */}
      <Card title={`节点列表 (${onlineCount}/${mockWorkerNodes.length}在线)`}>
        <DataTable
          columns={columns}
          dataSource={mockWorkerNodes}
          actions={actions}
          rowKey="id"
          pagination
          defaultPageSize={10}
        />
      </Card>

      {/* 节点编辑弹窗 */}
      <ModalForm
        title={editingWorker ? "编辑节点" : "新增节点"}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditingWorker(null);
        }}
        onSubmit={handleSubmit}
        fields={formFields}
        initialValues={editingWorker ? { ...editingWorker } : undefined}
        width={600}
      />
    </PageLayout>
  );
}