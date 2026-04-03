"use client";

/**
 * 数据模型管理页
 * 页面路径: /governance/model
 */

import { useState } from "react";
import { Card, Table, Button, Input, Select, Space, Tag, Modal, Form, message, Tabs, Descriptions, Timeline, Switch, Steps } from "antd";
import { Plus, Search, Edit, Trash2, Eye, Download, Upload, Play, CheckCircle, Clock, XCircle, GitMerge, FileText, Database } from "lucide-react";

import { PageLayout } from "@/components/layout";
import { PageBreadcrumb, DirectoryTree, StatusBadge } from "@/components/ui";
import { ROUTES } from "@/constants";
import type { DirectoryTreeNode } from "@/components/ui";

/**
 * 面包屑配置
 */
const BREADCRUMB_ITEMS = [
  { title: "数据治理", href: ROUTES.GOVERNANCE },
  { title: "数据模型管理" },
];

/**
 * Mock 模型分类树
 */
const mockModelCategories: DirectoryTreeNode[] = [
  { key: "all", title: "全部模型", isLeaf: true },
  {
    key: "fact",
    title: "事实表",
    isLeaf: false,
    children: [
      { key: "fact-order", title: "订单事实表", isLeaf: true },
      { key: "fact-transaction", title: "交易事实表", isLeaf: true },
    ],
  },
  {
    key: "dim",
    title: "维度表",
    isLeaf: false,
    children: [
      { key: "dim-customer", title: "客户维度", isLeaf: true },
      { key: "dim-product", title: "产品维度", isLeaf: true },
      { key: "dim-time", title: "时间维度", isLeaf: true },
    ],
  },
];

/**
 * Mock 模型列表
 */
const mockModels = [
  { id: "model-001", name: "订单事实表", type: "fact", category: "销售域", version: "v1.2.0", status: "online", creator: "张三", updatedAt: "2024-01-20" },
  { id: "model-002", name: "客户维度表", type: "dim", category: "客户域", version: "v2.0.0", status: "online", creator: "李四", updatedAt: "2024-01-18" },
  { id: "model-003", name: "产品维度表", type: "dim", category: "产品域", version: "v1.0.0", status: "pending", creator: "王五", updatedAt: "2024-01-15" },
  { id: "model-004", name: "交易事实表", type: "fact", category: "交易域", version: "v1.0.0", status: "draft", creator: "赵六", updatedAt: "2024-01-12" },
  { id: "model-005", name: "时间维度表", type: "dim", category: "公共域", version: "v1.0.0", status: "offline", creator: "系统", updatedAt: "2023-12-01" },
];

/**
 * Mock 版本历史
 */
const mockVersionHistory = [
  { version: "v1.2.0", operator: "张三", time: "2024-01-20 10:00:00", comment: "新增字段order_source" },
  { version: "v1.1.0", operator: "李四", time: "2024-01-15 14:00:00", comment: "修改字段描述" },
  { version: "v1.0.0", operator: "张三", time: "2024-01-01 09:00:00", comment: "初始版本" },
];

/**
 * Mock 稽核结果
 */
const mockAuditResults = [
  { id: "audit-001", name: "孤立模型检测", status: "pass", count: 0, time: "2024-01-20 06:00" },
  { id: "audit-002", name: "僵尸模型检测", status: "warning", count: 2, time: "2024-01-20 06:00" },
  { id: "audit-003", name: "一致性检测", status: "fail", count: 1, time: "2024-01-20 06:00" },
];

/**
 * 数据模型管理页面组件
 */
export default function DataModelPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<typeof mockModels[0] | null>(null);

  /**
   * 过滤后的模型列表
   */
  const filteredModels = mockModels.filter((model) => {
    if (selectedCategory !== "all" && model.type !== selectedCategory) return false;
    if (statusFilter !== "all" && model.status !== statusFilter) return false;
    if (searchKeyword && !model.name.toLowerCase().includes(searchKeyword.toLowerCase())) return false;
    return true;
  });

  /**
   * 模型表格列
   */
  const columns = [
    {
      title: "模型名称",
      dataIndex: "name",
      key: "name",
      width: 150,
      render: (name: string) => (
        <a onClick={() => {
          setSelectedModel(mockModels.find((m) => m.name === name) || null);
          setDetailModalOpen(true);
        }}>
          {name}
        </a>
      ),
    },
    {
      title: "模型类型",
      dataIndex: "type",
      key: "type",
      width: 100,
      render: (type: string) => (
        <Tag color={type === "fact" ? "blue" : "green"}>
          {type === "fact" ? "事实表" : "维度表"}
        </Tag>
      ),
    },
    { title: "分类", dataIndex: "category", key: "category", width: 100 },
    { title: "版本", dataIndex: "version", key: "version", width: 80 },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => {
        const statusMap: Record<string, { color: string; label: string }> = {
          draft: { color: "default", label: "未提交" },
          pending: { color: "processing", label: "待审批" },
          online: { color: "success", label: "已上线" },
          offline: { color: "error", label: "已下线" },
        };
        return <Tag color={statusMap[status]?.color}>{statusMap[status]?.label}</Tag>;
      },
    },
    { title: "创建人", dataIndex: "creator", key: "creator", width: 80 },
    { title: "更新时间", dataIndex: "updatedAt", key: "updatedAt", width: 120 },
    {
      title: "操作",
      key: "actions",
      width: 180,
      render: (_: unknown, record: typeof mockModels[0]) => (
        <Space>
          <Button type="link" size="small" onClick={() => {
            setSelectedModel(record);
            setDetailModalOpen(true);
          }}>详情</Button>
          <Button type="link" size="small">稽核</Button>
          {record.status === "pending" && (
            <Button type="link" size="small">审批</Button>
          )}
          {record.status === "online" && (
            <Button type="link" size="small">下线</Button>
          )}
        </Space>
      ),
    },
  ];

  /**
   * 处理分类选中
   */
  const handleCategorySelect = (keys: React.Key[]) => {
    if (keys.length > 0) {
      setSelectedCategory(keys[0] as string);
    }
  };

  /**
   * 处理物理建表
   */
  const handleCreateTable = () => {
    Modal.confirm({
      title: "物理建表确认",
      content: "将在目标数据源生成物理表，确定继续？",
      onOk: () => {
        message.success("建表SQL已生成，请确认后执行");
      },
    });
  };

  return (
    <PageLayout title="数据模型管理">
      {/* 面包屑 */}
      <PageBreadcrumb items={BREADCRUMB_ITEMS} />

      {/* 主体布局 */}
      <div style={{ display: "flex", gap: 16 }}>
        {/* 左侧分类树 */}
        <DirectoryTree
          treeData={mockModelCategories}
          onSelect={handleCategorySelect}
          showSearch
          width={240}
          collapsible
          defaultSelectedKeys={["all"]}
        />

        {/* 右侧内容区 */}
        <div style={{ flex: 1 }}>
          {/* 过滤栏 */}
          <Card style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Space>
                <Input
                  placeholder="搜索模型名称..."
                  prefix={<Search size={14} />}
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  style={{ width: 250 }}
                  allowClear
                />
                <Select
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[
                    { value: "all", label: "全部状态" },
                    { value: "draft", label: "未提交" },
                    { value: "pending", label: "待审批" },
                    { value: "online", label: "已上线" },
                    { value: "offline", label: "已下线" },
                  ]}
                  style={{ width: 120 }}
                />
              </Space>
              <Space>
                <Button icon={<Play size={14} />} onClick={() => setAuditModalOpen(true)}>
                  稽核检测
                </Button>
                <Button icon={<Upload size={14} />}>导入</Button>
                <Button icon={<Download size={14} />}>导出</Button>
                <Button type="primary" icon={<Plus size={14} />}>
                  新增模型
                </Button>
              </Space>
            </div>
          </Card>

          {/* 模型列表 */}
          <Card>
            <Table
              dataSource={filteredModels}
              columns={columns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </div>
      </div>

      {/* 模型详情弹窗 */}
      <Modal
        title={selectedModel?.name || "模型详情"}
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={null}
        width={900}
      >
        <Tabs
          items={[
            {
              key: "basic",
              label: "基本信息",
              children: (
                <div>
                  <Descriptions column={2} bordered>
                    <Descriptions.Item label="模型名称">{selectedModel?.name}</Descriptions.Item>
                    <Descriptions.Item label="模型类型">
                      <Tag color={selectedModel?.type === "fact" ? "blue" : "green"}>
                        {selectedModel?.type === "fact" ? "事实表" : "维度表"}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="分类">{selectedModel?.category}</Descriptions.Item>
                    <Descriptions.Item label="当前版本">{selectedModel?.version}</Descriptions.Item>
                    <Descriptions.Item label="状态">
                      <Tag>{selectedModel?.status}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="目标数据源">Hive-数仓</Descriptions.Item>
                    <Descriptions.Item label="描述" span={2}>
                      用于存储订单交易明细数据
                    </Descriptions.Item>
                  </Descriptions>

                  <div style={{ marginTop: 16 }}>
                    <Button type="primary" onClick={handleCreateTable}>
                      物理建表
                    </Button>
                  </div>
                </div>
              ),
            },
            {
              key: "attributes",
              label: "属性定义",
              children: (
                <Table
                  dataSource={[
                    { name: "order_id", type: "BIGINT", required: true, description: "订单ID" },
                    { name: "customer_id", type: "BIGINT", required: true, description: "客户ID" },
                    { name: "order_amount", type: "DECIMAL(18,2)", required: true, description: "订单金额" },
                    { name: "order_time", type: "TIMESTAMP", required: true, description: "下单时间" },
                  ]}
                  columns={[
                    { title: "属性名", dataIndex: "name", key: "name" },
                    { title: "类型", dataIndex: "type", key: "type" },
                    { title: "必填", dataIndex: "required", key: "required", render: (v: boolean) => v ? "是" : "否" },
                    { title: "描述", dataIndex: "description", key: "description" },
                  ]}
                  rowKey="name"
                  pagination={false}
                />
              ),
            },
            {
              key: "relations",
              label: "关系定义",
              children: (
                <div style={{ padding: 24, textAlign: "center", color: "#6B7280" }}>
                  <GitMerge size={48} style={{ marginBottom: 16 }} />
                  <div>ER 图展示区域</div>
                  <div style={{ fontSize: 12 }}>展示模型之间的主外键关系</div>
                </div>
              ),
            },
            {
              key: "versions",
              label: "版本历史",
              children: (
                <Table
                  dataSource={mockVersionHistory}
                  columns={[
                    { title: "版本号", dataIndex: "version", key: "version" },
                    { title: "操作人", dataIndex: "operator", key: "operator" },
                    { title: "时间", dataIndex: "time", key: "time" },
                    { title: "说明", dataIndex: "comment", key: "comment" },
                    {
                      title: "操作",
                      key: "actions",
                      render: () => <Button type="link" size="small">查看</Button>,
                    },
                  ]}
                  rowKey="version"
                  pagination={false}
                />
              ),
            },
          ]}
        />
      </Modal>

      {/* 稽核检测弹窗 */}
      <Modal
        title="稽核检测"
        open={auditModalOpen}
        onCancel={() => setAuditModalOpen(false)}
        footer={null}
        width={700}
      >
        <Card>
          <div style={{ marginBottom: 16 }}>
            <Button type="primary" icon={<Play size={14} />}>
              执行稽核
            </Button>
            <span style={{ marginLeft: 8, color: "#6B7280" }}>
              上次执行: 2024-01-20 06:00
            </span>
          </div>

          <Table
            dataSource={mockAuditResults}
            columns={[
              { title: "检测项", dataIndex: "name", key: "name" },
              {
                title: "状态",
                dataIndex: "status",
                key: "status",
                render: (status: string) =>
                  status === "pass" ? (
                    <Tag color="green"><CheckCircle size={12} style={{ marginRight: 4 }} />通过</Tag>
                  ) : status === "warning" ? (
                    <Tag color="orange"><Clock size={12} style={{ marginRight: 4 }} />警告</Tag>
                  ) : (
                    <Tag color="red"><XCircle size={12} style={{ marginRight: 4 }} />失败</Tag>
                  ),
              },
              { title: "异常数", dataIndex: "count", key: "count" },
              { title: "检测时间", dataIndex: "time", key: "time" },
              {
                title: "操作",
                key: "actions",
                render: () => <Button type="link" size="small">查看详情</Button>,
              },
            ]}
            rowKey="id"
            pagination={false}
          />
        </Card>
      </Modal>
    </PageLayout>
  );
}