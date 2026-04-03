"use client";

/**
 * 数据质量管理页
 * 页面路径: /governance/data-quality
 */

import { useState } from "react";
import { Card, Button, Space, Tag } from "antd";
import {
  Plus,
  Play,
  Edit,
  Trash2,
  Eye,
  FileText,
  AlertTriangle,
} from "lucide-react";

import { PageLayout } from "@/components/layout";
import {
  PageBreadcrumb,
  TabsLayout,
  DataTable,
  FilterBar,
  KPICardRow,
  ModalForm,
  StatusBadge,
  type TabConfig,
  type TableActionItem,
  type KPICardData,
  type FormFieldConfig,
} from "@/components/ui";
import { ROUTES } from "@/constants";
import { useMessage } from "@/hooks/useAntdApp";
import {
  mockQualityRules,
  mockQualityTasks,
  mockQualityTickets,
  mockQualityKPI,
  mockIssueDistribution,
} from "@/services/mock/governance";
import {
  QUALITY_RULE_TYPE_LABELS,
  QUALITY_SEVERITY_LABELS,
  APPROVAL_STATUS_LABELS,
} from "@/types/governance";
import type { QualityRule, QualityTask, QualityTicket } from "@/types/governance";

/**
 * 面包屑配置
 */
const BREADCRUMB_ITEMS = [
  { title: "数据治理", href: ROUTES.GOVERNANCE },
  { title: "数据质量管理" },
];

/**
 * 数据质量管理页面组件
 */
export default function DataQualityPage() {
  const message = useMessage();
  const [activeTab, setActiveTab] = useState("rules");
  const [ruleModalOpen, setRuleModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<QualityRule | null>(null);

  /**
   * KPI 卡片数据
   */
  const kpiData: KPICardData[] = [
    {
      title: "检测资源数",
      value: mockQualityKPI.checkedResourceCount,
      icon: <FileText size={20} />,
      colorTheme: "primary",
    },
    {
      title: "总记录数",
      value: mockQualityKPI.totalRecordCount,
      icon: <FileText size={20} />,
      colorTheme: "success",
    },
    {
      title: "问题记录数",
      value: mockQualityKPI.issueRecordCount,
      icon: <AlertTriangle size={20} />,
      colorTheme: "warning",
    },
    {
      title: "问题占比",
      value: mockQualityKPI.issueRate,
      unit: "%",
      precision: 2,
      icon: <AlertTriangle size={20} />,
      colorTheme: "error",
    },
  ];

  /**
   * 规则表格列配置
   */
  const ruleColumns = [
    {
      key: "name",
      title: "规则名称",
      dataIndex: "name",
      width: 200,
      ellipsis: true,
    },
    {
      key: "type",
      title: "规则类型",
      dataIndex: "type",
      width: 120,
      render: (value: unknown) => (
        <Tag color="blue">{QUALITY_RULE_TYPE_LABELS[value as keyof typeof QUALITY_RULE_TYPE_LABELS]}</Tag>
      ),
    },
    {
      key: "severity",
      title: "严重等级",
      dataIndex: "severity",
      width: 100,
      render: (value: unknown) => {
        const colors: Record<string, string> = {
          high: "#EF4444",
          medium: "#F59E0B",
          low: "#10B981",
        };
        return (
          <Tag color={colors[value as string]}>
            {QUALITY_SEVERITY_LABELS[value as keyof typeof QUALITY_SEVERITY_LABELS]}
          </Tag>
        );
      },
    },
    {
      key: "status",
      title: "状态",
      dataIndex: "status",
      width: 100,
      render: (value: unknown) => (
        <StatusBadge status={value === "enabled" ? "enabled" : "disabled"} />
      ),
    },
    {
      key: "approvalStatus",
      title: "审批状态",
      dataIndex: "approvalStatus",
      width: 100,
      render: (value: unknown) => {
        const colors: Record<string, string> = {
          pending: "#F59E0B",
          approved: "#10B981",
          rejected: "#EF4444",
        };
        return (
          <Tag color={colors[value as string]}>
            {APPROVAL_STATUS_LABELS[value as keyof typeof APPROVAL_STATUS_LABELS]}
          </Tag>
        );
      },
    },
    {
      key: "createdBy",
      title: "创建人",
      dataIndex: "createdBy",
      width: 100,
    },
    {
      key: "createdAt",
      title: "创建时间",
      dataIndex: "createdAt",
      width: 160,
    },
  ];

  /**
   * 任务表格列配置
   */
  const taskColumns = [
    {
      key: "name",
      title: "任务名称",
      dataIndex: "name",
      width: 200,
      ellipsis: true,
    },
    {
      key: "dataResourceName",
      title: "数据资源",
      dataIndex: "dataResourceName",
      width: 150,
    },
    {
      key: "ruleCount",
      title: "规则数量",
      dataIndex: "ruleCount",
      width: 100,
      align: "center" as const,
    },
    {
      key: "scheduleConfig",
      title: "调度周期",
      dataIndex: "scheduleConfig",
      width: 150,
    },
    {
      key: "status",
      title: "状态",
      dataIndex: "status",
      width: 100,
      render: (value: unknown) => (
        <StatusBadge status={value === "running" ? "processing" : "pending"} label={value === "running" ? "运行中" : "已停止"} />
      ),
    },
    {
      key: "lastExecuteResult",
      title: "最后执行结果",
      dataIndex: "lastExecuteResult",
      width: 120,
      render: (value: unknown) => {
        if (!value) return "-";
        const statusMap: Record<string, "success" | "error" | "warning"> = {
          success: "success",
          failed: "error",
          partial_failed: "warning",
        };
        const labelMap: Record<string, string> = {
          success: "成功",
          failed: "失败",
          partial_failed: "部分失败",
        };
        return <StatusBadge status={statusMap[value as string]} label={labelMap[value as string]} />;
      },
    },
    {
      key: "createdBy",
      title: "创建人",
      dataIndex: "createdBy",
      width: 100,
    },
  ];

  /**
   * 工单表格列配置
   */
  const ticketColumns = [
    {
      key: "title",
      title: "工单标题",
      dataIndex: "title",
      width: 200,
      ellipsis: true,
    },
    {
      key: "dataResourceName",
      title: "问题数据资源",
      dataIndex: "dataResourceName",
      width: 150,
    },
    {
      key: "initiator",
      title: "发起人",
      dataIndex: "initiator",
      width: 100,
    },
    {
      key: "assignee",
      title: "负责人",
      dataIndex: "assignee",
      width: 100,
    },
    {
      key: "status",
      title: "状态",
      dataIndex: "status",
      width: 100,
      render: (value: unknown) => {
        const statusMap: Record<string, "pending" | "processing" | "success"> = {
          pending: "pending",
          processing: "processing",
          resolved: "success",
        };
        const labelMap: Record<string, string> = {
          pending: "待处理",
          processing: "处理中",
          resolved: "已解决",
        };
        return <StatusBadge status={statusMap[value as string]} label={labelMap[value as string]} />;
      },
    },
    {
      key: "issueCount",
      title: "问题数",
      dataIndex: "issueCount",
      width: 80,
      align: "center" as const,
      render: (value: unknown) => (
        <Tag color={(value as number) > 100 ? "error" : "warning"}>{value as number}</Tag>
      ),
    },
    {
      key: "createdAt",
      title: "创建时间",
      dataIndex: "createdAt",
      width: 160,
    },
  ];

  /**
   * 规则操作配置
   */
  const ruleActions: TableActionItem[] = [
    {
      key: "view",
      label: "查看",
      icon: <Eye size={14} />,
      onClick: (record) => message.info(`查看规则: ${(record as QualityRule).name}`),
    },
    {
      key: "edit",
      label: "编辑",
      icon: <Edit size={14} />,
      onClick: (record) => {
        setEditingRule((record as QualityRule));
        setRuleModalOpen(true);
      },
    },
    {
      key: "copy",
      label: "复制",
      icon: <FileText size={14} />,
      onClick: (record) => message.info(`复制规则: ${(record as QualityRule).name}`),
    },
    {
      key: "delete",
      label: "删除",
      icon: <Trash2 size={14} />,
      danger: true,
      confirm: true,
      confirmText: "确认删除该规则？",
      onClick: (record) => message.success(`已删除规则: ${(record as QualityRule).name}`),
    },
  ];

  /**
   * 任务操作配置
   */
  const taskActions: TableActionItem[] = [
    {
      key: "view",
      label: "查看",
      icon: <Eye size={14} />,
      onClick: (record) => message.info(`查看任务: ${(record as QualityTask).name}`),
    },
    {
      key: "execute",
      label: "执行",
      icon: <Play size={14} />,
      onClick: () => {
        message.loading({ content: "正在执行任务...", key: "execute" });
        setTimeout(() => {
          message.success({ content: "任务执行完成", key: "execute" });
        }, 2000);
      },
    },
    {
      key: "edit",
      label: "编辑",
      icon: <Edit size={14} />,
      onClick: (record) => message.info(`编辑任务: ${(record as QualityTask).name}`),
    },
  ];

  /**
   * 工单操作配置
   */
  const ticketActions: TableActionItem[] = [
    {
      key: "view",
      label: "查看",
      icon: <Eye size={14} />,
      onClick: (record) => message.info(`查看工单: ${(record as QualityTicket).title}`),
    },
    {
      key: "process",
      label: "处理",
      icon: <Edit size={14} />,
      onClick: (record) => message.info(`处理工单: ${(record as QualityTicket).title}`),
    },
  ];

  /**
   * 新增规则表单字段
   */
  const ruleFormFields: FormFieldConfig[] = [
    {
      name: "name",
      label: "规则名称",
      type: "text",
      required: true,
      placeholder: "请输入规则名称",
    },
    {
      name: "type",
      label: "规则类型",
      type: "select",
      required: true,
      options: Object.entries(QUALITY_RULE_TYPE_LABELS).map(([value, label]) => ({
        value,
        label,
      })),
    },
    {
      name: "expression",
      label: "规则表达式",
      type: "textarea",
      required: true,
      placeholder: "请输入校验条件表达式",
    },
    {
      name: "errorDescription",
      label: "错误描述",
      type: "textarea",
      required: true,
      placeholder: "检测不通过时的描述信息",
    },
    {
      name: "severity",
      label: "严重等级",
      type: "select",
      required: true,
      options: Object.entries(QUALITY_SEVERITY_LABELS).map(([value, label]) => ({
        value,
        label,
      })),
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
   * 处理新增规则
   */
  const handleRuleSubmit = async (values: Record<string, unknown>) => {
    console.log("Submit rule:", values);
    message.success("规则保存成功");
    setRuleModalOpen(false);
    setEditingRule(null);
  };

  /**
   * Tab 配置
   */
  const tabs: TabConfig[] = [
    {
      key: "rules",
      label: "规则定义",
      content: (
        <div>
          <FilterBar
            filters={[]}
            showCreate
            createText="新增规则"
            onCreate={() => {
              setEditingRule(null);
              setRuleModalOpen(true);
            }}
          />
          <DataTable
            columns={ruleColumns}
            dataSource={mockQualityRules}
            actions={ruleActions}
            rowKey="id"
            pagination
            defaultPageSize={10}
          />
        </div>
      ),
    },
    {
      key: "tasks",
      label: "任务配置",
      content: (
        <div>
          <FilterBar
            filters={[]}
            showCreate
            createText="新增任务"
            onCreate={() => message.info("新增任务功能开发中...")}
          />
          <DataTable
            columns={taskColumns}
            dataSource={mockQualityTasks}
            actions={taskActions}
            rowKey="id"
            pagination
            defaultPageSize={10}
          />
        </div>
      ),
    },
    {
      key: "statistics",
      label: "质量统计",
      content: (
        <div>
          {/* KPI 卡片 */}
          <div style={{ marginBottom: 24 }}>
            <KPICardRow data={kpiData} />
          </div>

          {/* 问题分布 */}
          <Card title="问题分布" style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {mockIssueDistribution.map((item) => (
                <Card key={item.type} size="small" style={{ width: 150 }}>
                  <div style={{ fontSize: 12, color: "#475569", marginBottom: 4 }}>
                    {QUALITY_RULE_TYPE_LABELS[item.type]}
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 600, color: "#1E293B" }}>
                    {item.count}
                  </div>
                  <div style={{ fontSize: 12, color: "#6B7280" }}>
                    占比 {item.percentage}%
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          {/* 趋势图占位 */}
          <Card title="质量问题趋势（近7天）">
            <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "#94A3B8" }}>
              趋势图（需集成图表库 Recharts）
            </div>
          </Card>
        </div>
      ),
    },
    {
      key: "tickets",
      label: "质量工单",
      content: (
        <div>
          <FilterBar filters={[]} />
          <DataTable
            columns={ticketColumns}
            dataSource={mockQualityTickets}
            actions={ticketActions}
            rowKey="id"
            pagination
            defaultPageSize={10}
          />
        </div>
      ),
    },
  ];

  return (
    <PageLayout title="数据质量管理">
      {/* 面包屑 */}
      <PageBreadcrumb items={BREADCRUMB_ITEMS} />

      {/* 标签页布局 */}
      <TabsLayout
        tabs={tabs}
        activeKey={activeTab}
        onChange={setActiveTab}
      />

      {/* 规则编辑弹窗 */}
      <ModalForm
        title={editingRule ? "编辑规则" : "新增规则"}
        open={ruleModalOpen}
        onCancel={() => {
          setRuleModalOpen(false);
          setEditingRule(null);
        }}
        onSubmit={handleRuleSubmit}
        fields={ruleFormFields}
        initialValues={editingRule ? { ...editingRule } : undefined}
        width={600}
      />
    </PageLayout>
  );
}