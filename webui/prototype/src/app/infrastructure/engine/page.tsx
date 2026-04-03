"use client";

/**
 * 引擎配置管理页面
 * 页面路径: /infrastructure/engine
 */

import { useState } from "react";
import { Card, Button, Space, message, Tag, Descriptions, Modal, Form, Input, Select, InputNumber } from "antd";
import { Plus, Edit, Trash2, PlayCircle, StopCircle, Eye, Settings } from "lucide-react";

import { PageLayout } from "@/components/layout";
import {
  PageBreadcrumb,
  DataTable,
  ModalForm,
  type TableActionItem,
  type FormFieldConfig,
} from "@/components/ui";
import { ROUTES } from "@/constants";
import { mockEngineConfigs } from "@/services/mock/infrastructure";
import type { EngineConfig, EngineConfigFormData, EngineType } from "@/types/infrastructure";
import { ENGINE_STATUS_LABELS, ENGINE_TYPE_LABELS } from "@/types/infrastructure";

/**
 * 面包屑配置
 */
const BREADCRUMB_ITEMS = [
  { title: "基础设施", href: "/infrastructure" },
  { title: "引擎配置" },
];

/**
 * 引擎配置管理页面组件
 */
export default function EngineConfigPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editingEngine, setEditingEngine] = useState<EngineConfig | null>(null);
  const [viewingEngine, setViewingEngine] = useState<EngineConfig | null>(null);

  /**
   * 表格列配置
   */
  const columns = [
    {
      key: "name",
      title: "引擎名称",
      dataIndex: "name",
      width: 150,
    },
    {
      key: "type",
      title: "引擎类型",
      dataIndex: "type",
      width: 100,
      render: (value: unknown) => {
        const type = value as EngineType;
        const colorMap: Record<EngineType, string> = {
          spark: "blue",
          flink: "green",
          presto: "purple",
          trino: "cyan",
          hive: "orange",
        };
        return <Tag color={colorMap[type]}>{ENGINE_TYPE_LABELS[type]}</Tag>;
      },
    },
    {
      key: "version",
      title: "版本",
      dataIndex: "version",
      width: 100,
    },
    {
      key: "workerCount",
      title: "Worker数量",
      dataIndex: "workerCount",
      width: 100,
    },
    {
      key: "status",
      title: "状态",
      dataIndex: "status",
      width: 100,
      render: (value: unknown) => {
        const status = value as EngineConfig["status"];
        const colorMap: Record<EngineConfig["status"], string> = {
          running: "green",
          stopped: "default",
          error: "red",
        };
        return <Tag color={colorMap[status]}>{ENGINE_STATUS_LABELS[status]}</Tag>;
      },
    },
    {
      key: "createdAt",
      title: "创建时间",
      dataIndex: "createdAt",
      width: 160,
    },
    {
      key: "updatedAt",
      title: "更新时间",
      dataIndex: "updatedAt",
      width: 160,
    },
  ];

  /**
   * 操作配置
   */
  const actions: TableActionItem[] = [
    {
      key: "view",
      label: "查看",
      icon: <Eye size={14} />,
      onClick: (record) => {
        setViewingEngine(record as EngineConfig);
        setDetailModalOpen(true);
      },
    },
    {
      key: "edit",
      label: "编辑",
      icon: <Edit size={14} />,
      onClick: (record) => {
        setEditingEngine(record as EngineConfig);
        setModalOpen(true);
      },
    },
    {
      key: "toggleStatus",
      label: "启动/停止",
      icon: <PlayCircle size={14} />,
      onClick: (record) => {
        const engine = record as EngineConfig;
        if (engine.status === "running") {
          message.success(`已停止引擎 ${engine.name}`);
        } else if (engine.status === "stopped") {
          message.success(`已启动引擎 ${engine.name}`);
        } else {
          message.warning("异常状态引擎，请先检查配置");
        }
      },
    },
    {
      key: "delete",
      label: "删除",
      icon: <Trash2 size={14} />,
      danger: true,
      confirm: true,
      confirmText: "确认删除该引擎配置？",
      onClick: (record) => message.success(`已删除引擎 ${(record as EngineConfig).name}`),
    },
  ];

  /**
   * 表单字段配置
   */
  const formFields: FormFieldConfig[] = [
    {
      name: "name",
      label: "引擎名称",
      type: "text",
      required: true,
      placeholder: "请输入引擎名称",
    },
    {
      name: "type",
      label: "引擎类型",
      type: "select",
      required: true,
      options: [
        { value: "spark", label: "Spark" },
        { value: "flink", label: "Flink" },
        { value: "presto", label: "Presto" },
        { value: "trino", label: "Trino" },
        { value: "hive", label: "Hive" },
      ],
    },
    {
      name: "version",
      label: "版本",
      type: "text",
      required: true,
      placeholder: "请输入版本号",
    },
    {
      name: "workerCount",
      label: "Worker数量",
      type: "number",
      required: true,
      placeholder: "请输入Worker数量",
      initialValue: 5,
    },
  ];

  /**
   * 处理表单提交
   */
  const handleSubmit = async (values: Record<string, unknown>) => {
    console.log("Submit engine:", values);
    message.success(editingEngine ? "引擎更新成功" : "引擎创建成功");
    setModalOpen(false);
    setEditingEngine(null);
  };

  /**
   * 统计运行中引擎数
   */
  const runningCount = mockEngineConfigs.filter((e) => e.status === "running").length;

  return (
    <PageLayout title="引擎配置管理">
      {/* 面包屑 */}
      <PageBreadcrumb items={BREADCRUMB_ITEMS} />

      {/* 顶部操作按钮 */}
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Button
            type="primary"
            icon={<Plus size={14} />}
            onClick={() => {
              setEditingEngine(null);
              setModalOpen(true);
            }}
          >
            新增引擎
          </Button>
        </Space>
      </div>

      {/* 引擎列表 */}
      <Card title={`引擎列表 (${runningCount}/${mockEngineConfigs.length}运行中)`}>
        <DataTable
          columns={columns}
          dataSource={mockEngineConfigs}
          actions={actions}
          rowKey="id"
          pagination
          defaultPageSize={10}
        />
      </Card>

      {/* 引擎编辑弹窗 */}
      <ModalForm
        title={editingEngine ? "编辑引擎" : "新增引擎"}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditingEngine(null);
        }}
        onSubmit={handleSubmit}
        fields={formFields}
        initialValues={editingEngine ? { ...editingEngine } : undefined}
        width={600}
      />

      {/* 引擎详情弹窗 */}
      <Modal
        title="引擎配置详情"
        open={detailModalOpen}
        onCancel={() => {
          setDetailModalOpen(false);
          setViewingEngine(null);
        }}
        footer={null}
        width={700}
      >
        {viewingEngine && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="引擎名称">{viewingEngine.name}</Descriptions.Item>
            <Descriptions.Item label="引擎类型">
              <Tag color="blue">{ENGINE_TYPE_LABELS[viewingEngine.type]}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="版本">{viewingEngine.version}</Descriptions.Item>
            <Descriptions.Item label="Worker数量">{viewingEngine.workerCount}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={viewingEngine.status === "running" ? "green" : viewingEngine.status === "error" ? "red" : "default"}>
                {ENGINE_STATUS_LABELS[viewingEngine.status]}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">{viewingEngine.createdAt}</Descriptions.Item>
            <Descriptions.Item label="更新时间">{viewingEngine.updatedAt}</Descriptions.Item>
            <Descriptions.Item label="配置参数" span={2}>
              <pre style={{ background: "#f5f5f5", padding: 8, borderRadius: 4, maxHeight: 200, overflow: "auto" }}>
                {JSON.stringify(viewingEngine.configParams, null, 2)}
              </pre>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </PageLayout>
  );
}