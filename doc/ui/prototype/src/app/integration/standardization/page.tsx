"use client";

/**
 * 数据标准化配置页
 * 页面路径: /integration/standardization
 */

import { useState, useMemo } from "react";
import { Card, Table, Button, Input, Select, Transfer, Tag, Space, message, Tabs, Modal, Form, Breadcrumb } from "antd";
import type { TransferProps } from "antd";
import { ArrowRight, ArrowLeft, RefreshCw, Play, Eye, Save, Settings, Filter } from "lucide-react";

import { PageLayout } from "@/components/layout";
import { PageBreadcrumb, DirectoryTree, StatusBadge } from "@/components/ui";
import { ROUTES } from "@/constants";
import { mockDataSources } from "@/services/mock/data-integration";
import type { DirectoryTreeNode } from "@/components/ui";

/**
 * 面包屑配置
 */
const BREADCRUMB_ITEMS = [
  { title: "数据集成", href: ROUTES.DATA_INTEGRATION },
  { title: "数据标准化" },
];

/**
 * Mock 原始表字段
 */
const mockSourceFields = [
  { key: "sf1", title: "user_id", type: "bigint", description: "用户ID" },
  { key: "sf2", title: "user_name", type: "varchar(100)", description: "用户姓名" },
  { key: "sf3", title: "email_addr", type: "varchar(200)", description: "邮箱地址" },
  { key: "sf4", title: "phone_num", type: "varchar(20)", description: "电话号码" },
  { key: "sf5", title: "created_at", type: "datetime", description: "创建时间" },
  { key: "sf6", title: "user_status", type: "int", description: "用户状态" },
  { key: "sf7", title: "dept_code", type: "varchar(50)", description: "部门编码" },
  { key: "sf8", title: "addr_info", type: "text", description: "地址信息" },
];

/**
 * Mock 标准表字段
 */
const mockTargetFields = [
  { key: "tf1", title: "id", type: "BIGINT", description: "主键ID", mapped: false },
  { key: "tf2", title: "name", type: "VARCHAR(100)", description: "姓名", mapped: false },
  { key: "tf3", title: "email", type: "VARCHAR(200)", description: "邮箱", mapped: false },
  { key: "tf4", title: "phone", type: "VARCHAR(20)", description: "手机号", mapped: false },
  { key: "tf5", title: "create_time", type: "TIMESTAMP", description: "创建时间", mapped: false },
  { key: "tf6", title: "status", type: "INT", description: "状态", mapped: false },
  { key: "tf7", title: "department_id", type: "VARCHAR(50)", description: "部门ID", mapped: false },
];

/**
 * Mock 标准化任务列表
 */
const mockStandardizationTasks = [
  { id: "task-001", name: "用户数据标准化", createTime: "2024-01-15 10:00:00", status: "completed", lastExecute: "2024-01-20 08:00:00", dataCount: 50000 },
  { id: "task-002", name: "订单数据标准化", createTime: "2024-01-16 11:00:00", status: "running", lastExecute: "2024-01-20 09:00:00", dataCount: 120000 },
  { id: "task-003", name: "产品数据标准化", createTime: "2024-01-17 12:00:00", status: "draft", lastExecute: null, dataCount: 0 },
];

/**
 * 数据标准化页面组件
 */
export default function DataStandardizationPage() {
  const [selectedSource, setSelectedSource] = useState<string>("ds-001");
  const [sourceSearch, setSourceSearch] = useState("");
  const [targetSearch, setTargetSearch] = useState("");
  const [mappedFields, setMappedFields] = useState<Record<string, string>>({}); // sourceKey -> targetKey
  const [form] = Form.useForm();
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  /**
   * 数据源树数据
   */
  const sourceTreeData: DirectoryTreeNode[] = useMemo(() => {
    return [
      { key: "all", title: "全部数据源", isLeaf: false },
      ...mockDataSources.map((ds) => ({
        key: ds.id,
        title: ds.name,
        isLeaf: true,
      })),
    ];
  }, []);

  /**
   * 过滤后的原始字段
   */
  const filteredSourceFields = useMemo(() => {
    if (!sourceSearch) return mockSourceFields;
    return mockSourceFields.filter((f) =>
      f.title.toLowerCase().includes(sourceSearch.toLowerCase())
    );
  }, [sourceSearch]);

  /**
   * 过滤后的标准字段
   */
  const filteredTargetFields = useMemo(() => {
    if (!targetSearch) return mockTargetFields;
    return mockTargetFields.filter((f) =>
      f.title.toLowerCase().includes(targetSearch.toLowerCase())
    );
  }, [targetSearch]);

  /**
   * 处理自动匹配
   */
  const handleAutoMatch = () => {
    const newMappings: Record<string, string> = {};
    mockSourceFields.forEach((source) => {
      // 模糊匹配逻辑
      const matchedTarget = mockTargetFields.find((target) =>
        source.title.toLowerCase().includes(target.title.toLowerCase()) ||
        target.title.toLowerCase().includes(source.title.toLowerCase().replace("_", ""))
      );
      if (matchedTarget) {
        newMappings[source.key] = matchedTarget.key;
      }
    });
    setMappedFields(newMappings);
    message.success(`自动匹配完成，共匹配 ${Object.keys(newMappings).length} 个字段`);
  };

  /**
   * 处理字段映射
   */
  const handleMapField = (sourceKey: string, targetKey: string) => {
    setMappedFields((prev) => ({ ...prev, [sourceKey]: targetKey }));
    message.success("映射成功");
  };

  /**
   * 处理取消映射
   */
  const handleUnmapField = (sourceKey: string) => {
    setMappedFields((prev) => {
      const newMappings = { ...prev };
      delete newMappings[sourceKey];
      return newMappings;
    });
  };

  /**
   * 处理预览
   */
  const handlePreview = () => {
    setPreviewModalOpen(true);
  };

  /**
   * 处理执行
   */
  const handleExecute = () => {
    message.success("标准化任务已提交执行");
  };

  /**
   * 处理保存
   */
  const handleSave = () => {
    message.success("配置已保存");
  };

  /**
   * 数据源选中
   */
  const handleSourceSelect = (keys: React.Key[]) => {
    if (keys.length > 0) {
      setSelectedSource(keys[0] as string);
    }
  };

  /**
   * 原始字段表格列
   */
  const sourceColumns = [
    { title: "字段名", dataIndex: "title", key: "title", width: 150 },
    { title: "类型", dataIndex: "type", key: "type", width: 120 },
    { title: "描述", dataIndex: "description", key: "description", width: 150 },
    {
      title: "映射状态",
      key: "mapped",
      width: 100,
      render: (_: unknown, record: { key: string; title: string }) =>
        mappedFields[record.key] ? (
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
        mappedFields[record.key] ? (
          <Button type="link" size="small" onClick={() => handleUnmapField(record.key)}>
            取消
          </Button>
        ) : null,
    },
  ];

  /**
   * 标准字段表格列
   */
  const targetColumns = [
    { title: "字段名", dataIndex: "title", key: "title", width: 150 },
    { title: "类型", dataIndex: "type", key: "type", width: 120 },
    { title: "描述", dataIndex: "description", key: "description", width: 150 },
    {
      title: "映射来源",
      key: "source",
      width: 150,
      render: (_: unknown, record: { key: string }) => {
        const sourceKey = Object.keys(mappedFields).find((k) => mappedFields[k] === record.key);
        if (sourceKey) {
          const sourceField = mockSourceFields.find((f) => f.key === sourceKey);
          return <Tag color="blue">{sourceField?.title}</Tag>;
        }
        return <span style={{ color: "#6B7280" }}>未映射</span>;
      },
    },
  ];

  /**
   * 任务列表列
   */
  const taskColumns = [
    { title: "任务名称", dataIndex: "name", key: "name", width: 200 },
    { title: "创建时间", dataIndex: "createTime", key: "createTime", width: 180 },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => (
        <Tag color={status === "completed" ? "success" : status === "running" ? "processing" : "default"}>
          {status === "completed" ? "已完成" : status === "running" ? "运行中" : "草稿"}
        </Tag>
      ),
    },
    { title: "最后执行", dataIndex: "lastExecute", key: "lastExecute", width: 180 },
    { title: "数据量", dataIndex: "dataCount", key: "dataCount", width: 100, render: (v: number) => v.toLocaleString() },
    {
      title: "操作",
      key: "actions",
      width: 150,
      render: () => (
        <Space>
          <Button type="link" size="small">查看</Button>
          <Button type="link" size="small">编辑</Button>
          <Button type="link" size="small">执行</Button>
        </Space>
      ),
    },
  ];

  return (
    <PageLayout title="数据标准化">
      {/* 面包屑 */}
      <PageBreadcrumb items={BREADCRUMB_ITEMS} />

      {/* 基本信息 */}
      <Card style={{ marginBottom: 16 }}>
        <Form form={form} layout="inline">
          <Form.Item name="taskName" label="任务名称" rules={[{ required: true }]}>
            <Input placeholder="请输入任务名称" style={{ width: 200 }} />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input placeholder="请输入描述" style={{ width: 300 }} />
          </Form.Item>
        </Form>
      </Card>

      {/* 主体布局 */}
      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        {/* 左侧数据源树 */}
        <DirectoryTree
          treeData={sourceTreeData}
          onSelect={handleSourceSelect}
          showSearch
          width={240}
          collapsible
          defaultSelectedKeys={[selectedSource]}
        />

        {/* 字段映射区域 */}
        <Card style={{ flex: 1 }} title="字段映射">
          <div style={{ display: "flex", gap: 16 }}>
            {/* 原始字段 */}
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 500 }}>原始表字段</span>
                <Input
                  placeholder="搜索字段..."
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

            {/* 标准字段 */}
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 500 }}>标准表字段</span>
                <Input
                  placeholder="搜索字段..."
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
      </div>

      {/* 过滤条件配置 */}
      <Card title="过滤条件配置" style={{ marginBottom: 16 }}>
        <Form layout="inline">
          <Form.Item name="whereCondition" label="WHERE 条件">
            <Input placeholder="例如: status = 1" style={{ width: 300 }} />
          </Form.Item>
          <Form.Item name="filterNull" label="过滤空值" valuePropName="checked">
            <Select
              options={[
                { value: "none", label: "不过滤" },
                { value: "all", label: "过滤全空" },
                { value: "partial", label: "过滤部分空" },
              ]}
              defaultValue="none"
              style={{ width: 120 }}
            />
          </Form.Item>
          <Form.Item name="preprocessFunc" label="预处理函数">
            <Select
              placeholder="选择函数"
              options={[
                { value: "trim", label: "TRIM - 去空格" },
                { value: "upper", label: "UPPER - 转大写" },
                { value: "lower", label: "LOWER - 小写" },
              ]}
              style={{ width: 200 }}
            />
          </Form.Item>
        </Form>
      </Card>

      {/* 底部操作 */}
      <Card>
        <Space>
          <Button icon={<Save size={14} />} onClick={handleSave}>
            保存草稿
          </Button>
          <Button icon={<Eye size={14} />} onClick={handlePreview}>
            预览结果
          </Button>
          <Button type="primary" icon={<Play size={14} />} onClick={handleExecute}>
            执行标准化
          </Button>
        </Space>
      </Card>

      {/* 任务管理 Tabs */}
      <Tabs
        style={{ marginTop: 16 }}
        items={[
          {
            key: "history",
            label: "标准化任务列表",
            children: (
              <Card>
                <Table
                  dataSource={mockStandardizationTasks}
                  columns={taskColumns}
                  rowKey="id"
                  pagination={false}
                />
              </Card>
            ),
          },
          {
            key: "view-source",
            label: "按来源层视图",
            children: (
              <Card>
                <div style={{ padding: 24, textAlign: "center", color: "#6B7280" }}>
                  展示来源表 → 标准表的映射关系图
                </div>
              </Card>
            ),
          },
          {
            key: "view-standard",
            label: "按标准层视图",
            children: (
              <Card>
                <div style={{ padding: 24, textAlign: "center", color: "#6B7280" }}>
                  展示标准表 ← 来源表的映射关系图
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
        width={800}
      >
        <Table
          dataSource={[
            { source: "user_id", target: "id", type: "直接映射" },
            { source: "user_name", target: "name", type: "直接映射" },
            { source: "email_addr", target: "email", type: "名称匹配" },
            { source: "phone_num", target: "phone", type: "名称匹配" },
            { source: "created_at", target: "create_time", type: "直接映射" },
            { source: "user_status", target: "status", type: "直接映射" },
          ]}
          columns={[
            { title: "原始字段", dataIndex: "source", key: "source" },
            { title: "标准字段", dataIndex: "target", key: "target" },
            { title: "映射类型", dataIndex: "type", key: "type" },
          ]}
          rowKey="source"
          pagination={false}
        />
      </Modal>
    </PageLayout>
  );
}