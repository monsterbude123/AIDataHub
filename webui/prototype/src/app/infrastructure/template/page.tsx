"use client";

/**
 * 配置模板管理页面
 * 页面路径: /infrastructure/template
 */

import { useState } from "react";
import { Card, Button, Space, message, Tag, Descriptions, Modal } from "antd";
import { Plus, Edit, Trash2, Eye, Copy, Download } from "lucide-react";

import { PageLayout } from "@/components/layout";
import {
  PageBreadcrumb,
  DataTable,
  ModalForm,
  type TableActionItem,
  type FormFieldConfig,
} from "@/components/ui";
import { ROUTES } from "@/constants";
import { mockConfigTemplates } from "@/services/mock/infrastructure";
import type { ConfigTemplate, ConfigTemplateFormData, TemplateType } from "@/types/infrastructure";
import { TEMPLATE_TYPE_LABELS } from "@/types/infrastructure";

/**
 * 面包屑配置
 */
const BREADCRUMB_ITEMS = [
  { title: "基础设施", href: "/infrastructure" },
  { title: "配置模板" },
];

/**
 * 配置模板管理页面组件
 */
export default function ConfigTemplatePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ConfigTemplate | null>(null);
  const [viewingTemplate, setViewingTemplate] = useState<ConfigTemplate | null>(null);

  /**
   * 表格列配置
   */
  const columns = [
    {
      key: "name",
      title: "模板名称",
      dataIndex: "name",
      width: 150,
    },
    {
      key: "type",
      title: "模板类型",
      dataIndex: "type",
      width: 120,
      render: (value: unknown) => {
        const type = value as TemplateType;
        const colorMap: Record<TemplateType, string> = {
          engine: "blue",
          queue: "green",
          worker: "purple",
          tenant: "orange",
        };
        return <Tag color={colorMap[type]}>{TEMPLATE_TYPE_LABELS[type]}</Tag>;
      },
    },
    {
      key: "applicableScenarios",
      title: "适用场景",
      dataIndex: "applicableScenarios",
      width: 200,
      ellipsis: true,
    },
    {
      key: "status",
      title: "状态",
      dataIndex: "status",
      width: 80,
      render: (value: unknown) => {
        const status = value as ConfigTemplate["status"];
        return <Tag color={status === "enabled" ? "green" : "default"}>{status === "enabled" ? "启用" : "禁用"}</Tag>;
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
        setViewingTemplate(record as ConfigTemplate);
        setDetailModalOpen(true);
      },
    },
    {
      key: "edit",
      label: "编辑",
      icon: <Edit size={14} />,
      onClick: (record) => {
        setEditingTemplate(record as ConfigTemplate);
        setModalOpen(true);
      },
    },
    {
      key: "copy",
      label: "复制",
      icon: <Copy size={14} />,
      onClick: (record) => {
        const template = record as ConfigTemplate;
        message.success(`已复制模板 ${template.name}`);
      },
    },
    {
      key: "download",
      label: "导出",
      icon: <Download size={14} />,
      onClick: (record) => {
        const template = record as ConfigTemplate;
        message.success(`已导出模板 ${template.name}`);
      },
    },
    {
      key: "delete",
      label: "删除",
      icon: <Trash2 size={14} />,
      danger: true,
      confirm: true,
      confirmText: "确认删除该模板？",
      onClick: (record) => message.success(`已删除模板 ${(record as ConfigTemplate).name}`),
    },
  ];

  /**
   * 表单字段配置
   */
  const formFields: FormFieldConfig[] = [
    {
      name: "name",
      label: "模板名称",
      type: "text",
      required: true,
      placeholder: "请输入模板名称",
    },
    {
      name: "type",
      label: "模板类型",
      type: "select",
      required: true,
      options: [
        { value: "engine", label: "引擎模板" },
        { value: "queue", label: "队列模板" },
        { value: "worker", label: "Worker模板" },
        { value: "tenant", label: "租户模板" },
      ],
    },
    {
      name: "applicableScenarios",
      label: "适用场景",
      type: "textarea",
      required: true,
      placeholder: "请描述适用场景",
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
    console.log("Submit template:", values);
    message.success(editingTemplate ? "模板更新成功" : "模板创建成功");
    setModalOpen(false);
    setEditingTemplate(null);
  };

  /**
   * 统计启用模板数
   */
  const enabledCount = mockConfigTemplates.filter((t) => t.status === "enabled").length;

  return (
    <PageLayout title="配置模板管理">
      {/* 面包屑 */}
      <PageBreadcrumb items={BREADCRUMB_ITEMS} />

      {/* 顶部操作按钮 */}
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Button
            type="primary"
            icon={<Plus size={14} />}
            onClick={() => {
              setEditingTemplate(null);
              setModalOpen(true);
            }}
          >
            新增模板
          </Button>
        </Space>
      </div>

      {/* 模板列表 */}
      <Card title={`模板列表 (${enabledCount}/${mockConfigTemplates.length}启用)`}>
        <DataTable
          columns={columns}
          dataSource={mockConfigTemplates}
          actions={actions}
          rowKey="id"
          pagination
          defaultPageSize={10}
        />
      </Card>

      {/* 模板编辑弹窗 */}
      <ModalForm
        title={editingTemplate ? "编辑模板" : "新增模板"}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditingTemplate(null);
        }}
        onSubmit={handleSubmit}
        fields={formFields}
        initialValues={editingTemplate ? { ...editingTemplate } : undefined}
        width={600}
      />

      {/* 模板详情弹窗 */}
      <Modal
        title="模板详情"
        open={detailModalOpen}
        onCancel={() => {
          setDetailModalOpen(false);
          setViewingTemplate(null);
        }}
        footer={null}
        width={700}
      >
        {viewingTemplate && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="模板名称">{viewingTemplate.name}</Descriptions.Item>
            <Descriptions.Item label="模板类型">
              <Tag color="blue">{TEMPLATE_TYPE_LABELS[viewingTemplate.type]}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="适用场景" span={2}>
              {viewingTemplate.applicableScenarios}
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={viewingTemplate.status === "enabled" ? "green" : "default"}>
                {viewingTemplate.status === "enabled" ? "启用" : "禁用"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">{viewingTemplate.createdAt}</Descriptions.Item>
            <Descriptions.Item label="更新时间">{viewingTemplate.updatedAt}</Descriptions.Item>
            <Descriptions.Item label="配置内容" span={2}>
              <pre style={{ background: "#f5f5f5", padding: 8, borderRadius: 4, maxHeight: 300, overflow: "auto" }}>
                {JSON.stringify(viewingTemplate.configContent, null, 2)}
              </pre>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </PageLayout>
  );
}