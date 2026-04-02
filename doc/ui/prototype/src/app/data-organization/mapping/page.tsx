"use client";

/**
 * 数据入库映射配置页
 * 页面路径: /data-organization/mapping
 */

import { useState, useMemo } from "react";
import { Card, Table, Button, Input, Select, Space, Tag, Form, message, Tabs, Transfer, Modal, InputNumber, DatePicker, Switch } from "antd";
import { ArrowRight, ArrowLeft, RefreshCw, Play, Save, Eye, Edit, Trash2, Filter, Settings, Clock } from "lucide-react";

import { PageLayout } from "@/components/layout";
import { PageBreadcrumb, StatusBadge } from "@/components/ui";
import { ROUTES } from "@/constants";

/**
 * 面包屑配置
 */
const BREADCRUMB_ITEMS = [
  { title: "数据组织", href: "/data-organization" },
  { title: "数据入库映射" },
];

/**
 * Mock 源表字段
 */
const mockSourceFields = [
  { key: "sf1", name: "customer_id", type: "BIGINT", description: "客户ID" },
  { key: "sf2", name: "customer_name", type: "VARCHAR(100)", description: "客户姓名" },
  { key: "sf3", name: "email", type: "VARCHAR(200)", description: "邮箱" },
  { key: "sf4", name: "phone", type: "VARCHAR(20)", description: "电话" },
  { key: "sf5", name: "status", type: "INT", description: "状态" },
  { key: "sf6", name: "created_at", type: "DATETIME", description: "创建时间" },
];

/**
 * Mock 目标表字段
 */
const mockTargetFields = [
  { key: "tf1", name: "id", type: "BIGINT", description: "主键ID", mapped: false },
  { key: "tf2", name: "name", type: "VARCHAR(100)", description: "姓名", mapped: false },
  { key: "tf3", name: "email_address", type: "VARCHAR(200)", description: "邮箱地址", mapped: false },
  { key: "tf4", name: "phone_number", type: "VARCHAR(20)", description: "电话号码", mapped: false },
  { key: "tf5", name: "state", type: "INT", description: "状态", mapped: false },
  { key: "tf6", name: "create_time", type: "TIMESTAMP", description: "创建时间", mapped: false },
];

/**
 * Mock 已配置任务
 */
const mockMappingTasks = [
  { id: "task-001", name: "客户数据入库", sourceTable: "标准客户表", targetTable: "主题库客户表", status: "success", lastExecute: "2024-01-20 06:00", dataCount: 150000 },
  { id: "task-002", name: "订单数据入库", sourceTable: "标准订单表", targetTable: "主题库订单表", status: "running", lastExecute: "2024-01-20 08:00", dataCount: 500000 },
  { id: "task-003", name: "产品数据入库", sourceTable: "标准产品表", targetTable: "资源库产品表", status: "failed", lastExecute: "2024-01-19 22:00", dataCount: 0 },
];

/**
 * 数据入库映射页面组件
 */
export default function DataMappingPage() {
  const [form] = Form.useForm();
  const [sourceSearch, setSourceSearch] = useState("");
  const [targetSearch, setTargetSearch] = useState("");
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  /**
   * 过滤后的源字段
   */
  const filteredSourceFields = useMemo(() => {
    if (!sourceSearch) return mockSourceFields;
    return mockSourceFields.filter((f) =>
      f.name.toLowerCase().includes(sourceSearch.toLowerCase())
    );
  }, [sourceSearch]);

  /**
   * 过滤后的目标字段
   */
  const filteredTargetFields = useMemo(() => {
    if (!targetSearch) return mockTargetFields;
    return mockTargetFields.filter((f) =>
      f.name.toLowerCase().includes(targetSearch.toLowerCase())
    );
  }, [targetSearch]);

  /**
   * 处理自动匹配
   */
  const handleAutoMatch = () => {
    const newMappings: Record<string, string> = {};
    mockSourceFields.forEach((source) => {
      const matchedTarget = mockTargetFields.find((target) =>
        source.name.toLowerCase().includes(target.name.toLowerCase()) ||
        target.name.toLowerCase().includes(source.name.toLowerCase().replace("customer_", ""))
      );
      if (matchedTarget) {
        newMappings[source.key] = matchedTarget.key;
      }
    });
    setMappings(newMappings);
    message.success(`自动匹配完成，共匹配 ${Object.keys(newMappings).length} 个字段`);
  };

  /**
   * 处理字段映射
   */
  const handleMapField = (sourceKey: string, targetKey: string) => {
    setMappings((prev) => ({ ...prev, [sourceKey]: targetKey }));
    message.success("映射成功");
  };

  /**
   * 处理取消映射
   */
  const handleUnmapField = (sourceKey: string) => {
    setMappings((prev) => {
      const newMappings = { ...prev };
      delete newMappings[sourceKey];
      return newMappings;
    });
  };

  /**
   * 处理保存配置
   */
  const handleSave = () => {
    message.success("配置保存成功");
  };

  /**
   * 处理执行入库
   */
  const handleExecute = () => {
    message.loading({ content: "入库任务已提交执行...", key: "execute" });
    setTimeout(() => {
      message.success({ content: "入库任务执行成功!", key: "execute" });
    }, 2000);
  };

  /**
   * 处理预览
   */
  const handlePreview = () => {
    setPreviewModalOpen(true);
  };

  /**
   * 源字段表格列
   */
  const sourceColumns = [
    { title: "字段名", dataIndex: "name", key: "name", width: 150 },
    { title: "类型", dataIndex: "type", key: "type", width: 120 },
    { title: "描述", dataIndex: "description", key: "description" },
    {
      title: "映射状态",
      key: "mapped",
      width: 100,
      render: (_: unknown, record: { key: string }) =>
        mappings[record.key] ? (
          <Tag color="green">已映射</Tag>
        ) : (
          <Tag>未映射</Tag>
        ),
    },
    {
      title: "操作",
      key: "actions",
      width: 80,
      render: (_: unknown, record: { key: string }) =>
        mappings[record.key] ? (
          <Button type="link" size="small" onClick={() => handleUnmapField(record.key)}>
            取消
          </Button>
        ) : null,
    },
  ];

  /**
   * 目标字段表格列
   */
  const targetColumns = [
    { title: "字段名", dataIndex: "name", key: "name", width: 150 },
    { title: "类型", dataIndex: "type", key: "type", width: 120 },
    { title: "描述", dataIndex: "description", key: "description" },
    {
      title: "映射来源",
      key: "source",
      width: 150,
      render: (_: unknown, record: { key: string }) => {
        const sourceKey = Object.keys(mappings).find((k) => mappings[k] === record.key);
        if (sourceKey) {
          const sourceField = mockSourceFields.find((f) => f.key === sourceKey);
          return <Tag color="blue">{sourceField?.name}</Tag>;
        }
        return <span style={{ color: "#6B7280" }}>未映射</span>;
      },
    },
  ];

  /**
   * 任务列表表格列
   */
  const taskColumns = [
    { title: "任务名称", dataIndex: "name", key: "name", width: 150 },
    { title: "源表", dataIndex: "sourceTable", key: "sourceTable", width: 120 },
    { title: "目标表", dataIndex: "targetTable", key: "targetTable", width: 120 },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 80,
      render: (status: string) => <StatusBadge status={status as "success" | "running" | "failed"} />,
    },
    { title: "最后执行", dataIndex: "lastExecute", key: "lastExecute", width: 160 },
    { title: "数据量", dataIndex: "dataCount", key: "dataCount", width: 100, render: (v: number) => v.toLocaleString() },
    {
      title: "操作",
      key: "actions",
      width: 150,
      render: () => (
        <Space>
          <Button type="link" size="small">查看日志</Button>
          <Button type="link" size="small">重新执行</Button>
          <Button type="link" size="small">编辑</Button>
        </Space>
      ),
    },
  ];

  return (
    <PageLayout title="数据入库映射">
      {/* 面包屑 */}
      <PageBreadcrumb items={BREADCRUMB_ITEMS} />

      {/* 基本信息 */}
      <Card style={{ marginBottom: 16 }}>
        <Form form={form} layout="inline">
          <Form.Item name="taskName" label="任务名称" rules={[{ required: true }]}>
            <Input placeholder="请输入任务名称" style={{ width: 200 }} />
          </Form.Item>
          <Form.Item name="targetLayer" label="目标分层" rules={[{ required: true }]}>
            <Select
              placeholder="选择目标分层"
              options={[
                { value: "resource", label: "资源库" },
                { value: "theme", label: "主题库" },
              ]}
              style={{ width: 150 }}
            />
          </Form.Item>
          <Form.Item name="sourceTable" label="源表">
            <Select placeholder="选择标准表" style={{ width: 200 }} />
          </Form.Item>
          <Form.Item name="targetTable" label="目标表">
            <Select placeholder="选择目标表" style={{ width: 200 }} />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input placeholder="任务描述" style={{ width: 250 }} />
          </Form.Item>
        </Form>
      </Card>

      {/* 字段映射区域 */}
      <Card title="字段映射" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 16 }}>
          {/* 源表字段 */}
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 500 }}>源表字段 (标准表)</span>
              <Input
                placeholder="搜索..."
                size="small"
                style={{ width: 150 }}
                value={sourceSearch}
                onChange={(e) => setSourceSearch(e.target.value)}
                prefix={<Filter size={12} />}
              />
            </div>
            <Table
              dataSource={filteredSourceFields}
              columns={sourceColumns}
              rowKey="key"
              pagination={false}
              size="small"
              scroll={{ y: 300 }}
            />
          </div>

          {/* 操作按钮 */}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 8 }}>
            <Button icon={<ArrowRight size={14} />} onClick={handleAutoMatch}>
              自动匹配
            </Button>
            <Button icon={<ArrowRight size={14} />} disabled>
              全部映射
            </Button>
            <Button icon={<ArrowLeft size={14} />} disabled>
              全部取消
            </Button>
          </div>

          {/* 目标表字段 */}
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 500 }}>目标表字段</span>
              <Input
                placeholder="搜索..."
                size="small"
                style={{ width: 150 }}
                value={targetSearch}
                onChange={(e) => setTargetSearch(e.target.value)}
                prefix={<Filter size={12} />}
              />
            </div>
            <Table
              dataSource={filteredTargetFields}
              columns={targetColumns}
              rowKey="key"
              pagination={false}
              size="small"
              scroll={{ y: 300 }}
            />
          </div>
        </div>
      </Card>

      {/* 清洗预处理配置 */}
      <Card title="清洗预处理配置" style={{ marginBottom: 16 }}>
        <Form layout="inline">
          <Form.Item name="whereCondition" label="WHERE 条件">
            <Input placeholder="例如: status = 1" style={{ width: 300 }} />
          </Form.Item>
          <Form.Item name="filterNull" label="过滤空值">
            <Select
              options={[
                { value: "none", label: "不过滤" },
                { value: "all", label: "过滤全空" },
              ]}
              defaultValue="none"
              style={{ width: 120 }}
            />
          </Form.Item>
          <Form.Item name="outputMode" label="输出模式">
            <Select
              options={[
                { value: "full", label: "全量覆盖" },
                { value: "incremental", label: "增量追加" },
              ]}
              defaultValue="full"
              style={{ width: 120 }}
            />
          </Form.Item>
          <Form.Item>
            <Button icon={<Settings size={14} />}>
              高级配置
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* 底部操作 */}
      <Card style={{ marginBottom: 16 }}>
        <Space>
          <Button icon={<Save size={14} />} onClick={handleSave}>
            保存配置
          </Button>
          <Button icon={<Eye size={14} />} onClick={handlePreview}>
            预览结果
          </Button>
          <Button icon={<Clock size={14} />} onClick={() => setScheduleModalOpen(true)}>
            调度配置
          </Button>
          <Button type="primary" icon={<Play size={14} />} onClick={handleExecute}>
            立即执行
          </Button>
        </Space>
      </Card>

      {/* 已配置任务列表 */}
      <Tabs
        items={[
          {
            key: "tasks",
            label: "已配置任务",
            children: (
              <Card>
                <Table
                  dataSource={mockMappingTasks}
                  columns={taskColumns}
                  rowKey="id"
                  pagination={false}
                />
              </Card>
            ),
          },
          {
            key: "view-source",
            label: "从源表视角",
            children: (
              <Card>
                <div style={{ padding: 24, textAlign: "center", color: "#6B7280" }}>
                  展示源表 → 目标表的映射关系
                </div>
              </Card>
            ),
          },
          {
            key: "view-target",
            label: "从目标表视角",
            children: (
              <Card>
                <div style={{ padding: 24, textAlign: "center", color: "#6B7280" }}>
                  展示目标表 ← 源表的映射关系
                </div>
              </Card>
            ),
          },
        ]}
      />

      {/* 预览弹窗 */}
      <Modal
        title="映射结果预览"
        open={previewModalOpen}
        onCancel={() => setPreviewModalOpen(false)}
        footer={null}
        width={700}
      >
        <Table
          dataSource={Object.entries(mappings).map(([sk, tk], index) => {
            const source = mockSourceFields.find((f) => f.key === sk);
            const target = mockTargetFields.find((f) => f.key === tk);
            return {
              key: index,
              source: source?.name,
              sourceType: source?.type,
              target: target?.name,
              targetType: target?.type,
            };
          })}
          columns={[
            { title: "源字段", dataIndex: "source", key: "source" },
            { title: "源类型", dataIndex: "sourceType", key: "sourceType" },
            { title: "→", key: "arrow", width: 40, render: () => "→" },
            { title: "目标字段", dataIndex: "target", key: "target" },
            { title: "目标类型", dataIndex: "targetType", key: "targetType" },
          ]}
          pagination={false}
        />
      </Modal>

      {/* 调度配置弹窗 */}
      <Modal
        title="调度配置"
        open={scheduleModalOpen}
        onCancel={() => setScheduleModalOpen(false)}
        onOk={() => {
          message.success("调度配置保存成功");
          setScheduleModalOpen(false);
        }}
      >
        <Form layout="vertical">
          <Form.Item name="enabled" label="启用调度" valuePropName="checked">
            <Switch checkedChildren="开启" unCheckedChildren="关闭" />
          </Form.Item>
          <Form.Item name="scheduleType" label="调度类型">
            <Select
              options={[
                { value: "daily", label: "每日" },
                { value: "weekly", label: "每周" },
                { value: "monthly", label: "每月" },
                { value: "cron", label: "Cron表达式" },
              ]}
              defaultValue="daily"
            />
          </Form.Item>
          <Form.Item name="executeTime" label="执行时间">
            <Input type="time" defaultValue="06:00" />
          </Form.Item>
        </Form>
      </Modal>
    </PageLayout>
  );
}