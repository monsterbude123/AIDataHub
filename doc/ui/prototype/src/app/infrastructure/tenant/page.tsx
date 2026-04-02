"use client";

/**
 * 租户管理页面
 * 页面路径: /infrastructure/tenant
 */

import { useState, useMemo } from "react";
import { Card, Button, Space, message, Progress, Tag } from "antd";
import { Plus, Edit, Trash2, PlayCircle, StopCircle } from "lucide-react";

import { PageLayout } from "@/components/layout";
import {
  PageBreadcrumb,
  DataTable,
  ModalForm,
  StatusBadge,
  type TableActionItem,
  type FormFieldConfig,
} from "@/components/ui";
import { ROUTES } from "@/constants";
import { mockTenants } from "@/services/mock/infrastructure";
import type { Tenant, TenantFormData } from "@/types/infrastructure";
import { TENANT_STATUS_LABELS } from "@/types/infrastructure";

/**
 * 面包屑配置
 */
const BREADCRUMB_ITEMS = [
  { title: "基础设施", href: ROUTES.TENANT_MANAGEMENT.split("/")[0] ? `/${ROUTES.TENANT_MANAGEMENT.split("/")[1]}` : ROUTES.TENANT_MANAGEMENT },
  { title: "租户管理" },
];

/**
 * 租户管理页面组件
 */
export default function TenantManagementPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);

  /**
   * 表格列配置
   */
  const columns = [
    {
      key: "name",
      title: "租户名称",
      dataIndex: "name",
      width: 120,
    },
    {
      key: "code",
      title: "租户编码",
      dataIndex: "code",
      width: 100,
    },
    {
      key: "cpuQuota",
      title: "CPU配额",
      dataIndex: "cpuQuota",
      width: 150,
      render: (value: unknown, record: Record<string, unknown>) => {
        const tenant = record as unknown as Tenant;
        const used = tenant.usedCpu;
        const total = value as number;
        const percent = Math.round((used / total) * 100);
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Progress percent={percent} size="small" style={{ width: 80 }} />
            <span style={{ fontSize: 12 }}>{used}/{total}核</span>
          </div>
        );
      },
    },
    {
      key: "memoryQuota",
      title: "内存配额",
      dataIndex: "memoryQuota",
      width: 150,
      render: (value: unknown, record: Record<string, unknown>) => {
        const tenant = record as unknown as Tenant;
        const used = tenant.usedMemory;
        const total = value as number;
        const percent = Math.round((used / total) * 100);
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Progress percent={percent} size="small" style={{ width: 80 }} />
            <span style={{ fontSize: 12 }}>{used}/{total}GB</span>
          </div>
        );
      },
    },
    {
      key: "storageQuota",
      title: "存储配额",
      dataIndex: "storageQuota",
      width: 150,
      render: (value: unknown, record: Record<string, unknown>) => {
        const tenant = record as unknown as Tenant;
        const used = tenant.usedStorage;
        const total = value as number;
        const percent = Math.round((used / total) * 100);
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Progress percent={percent} size="small" style={{ width: 80 }} />
            <span style={{ fontSize: 12 }}>{used}/{total}GB</span>
          </div>
        );
      },
    },
    {
      key: "status",
      title: "状态",
      dataIndex: "status",
      width: 100,
      render: (value: unknown) => {
        const status = value as Tenant["status"];
        const colorMap: Record<Tenant["status"], string> = {
          active: "green",
          inactive: "default",
          suspended: "orange",
        };
        return <Tag color={colorMap[status]}>{TENANT_STATUS_LABELS[status]}</Tag>;
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
        setEditingTenant(record as Tenant);
        setModalOpen(true);
      },
    },
    {
      key: "toggleStatus",
      label: "切换状态",
      icon: <PlayCircle size={14} />,
      onClick: (record) => {
        const tenant = record as unknown as Tenant;
        message.success(`已${tenant.status === "active" ? "暂停" : "激活"}租户 ${tenant.name}`);
      },
    },
    {
      key: "delete",
      label: "删除",
      icon: <Trash2 size={14} />,
      danger: true,
      confirm: true,
      confirmText: "确认删除该租户？删除后无法恢复。",
      onClick: (record) => message.success(`已删除租户 ${(record as Tenant).name}`),
    },
  ];

  /**
   * 表单字段配置
   */
  const formFields: FormFieldConfig[] = [
    {
      name: "name",
      label: "租户名称",
      type: "text",
      required: true,
      placeholder: "请输入租户名称",
    },
    {
      name: "code",
      label: "租户编码",
      type: "text",
      required: true,
      placeholder: "请输入租户编码",
    },
    {
      name: "cpuQuota",
      label: "CPU配额（核）",
      type: "number",
      required: true,
      placeholder: "请输入CPU配额",
      initialValue: 100,
    },
    {
      name: "memoryQuota",
      label: "内存配额（GB）",
      type: "number",
      required: true,
      placeholder: "请输入内存配额",
      initialValue: 256,
    },
    {
      name: "storageQuota",
      label: "存储配额（GB）",
      type: "number",
      required: true,
      placeholder: "请输入存储配额",
      initialValue: 1024,
    },
    {
      name: "status",
      label: "状态",
      type: "select",
      options: [
        { value: "active", label: "活跃" },
        { value: "inactive", label: "未激活" },
        { value: "suspended", label: "已暂停" },
      ],
      initialValue: "active",
    },
    {
      name: "description",
      label: "描述",
      type: "textarea",
      placeholder: "请输入租户描述",
    },
  ];

  /**
   * 处理表单提交
   */
  const handleSubmit = async (values: Record<string, unknown>) => {
    console.log("Submit tenant:", values);
    message.success(editingTenant ? "租户更新成功" : "租户创建成功");
    setModalOpen(false);
    setEditingTenant(null);
  };

  return (
    <PageLayout title="租户管理">
      {/* 面包屑 */}
      <PageBreadcrumb items={BREADCRUMB_ITEMS} />

      {/* 顶部操作按钮 */}
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Button
            type="primary"
            icon={<Plus size={14} />}
            onClick={() => {
              setEditingTenant(null);
              setModalOpen(true);
            }}
          >
            新增租户
          </Button>
        </Space>
      </div>

      {/* 租户列表 */}
      <Card title={`租户列表 (${mockTenants.length}个)`}>
        <DataTable
          columns={columns}
          dataSource={mockTenants}
          actions={actions}
          rowKey="id"
          pagination
          defaultPageSize={10}
        />
      </Card>

      {/* 租户编辑弹窗 */}
      <ModalForm
        title={editingTenant ? "编辑租户" : "新增租户"}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditingTenant(null);
        }}
        onSubmit={handleSubmit}
        fields={formFields}
        initialValues={editingTenant ? { ...editingTenant } : undefined}
        width={600}
      />
    </PageLayout>
  );
}