"use client";

/**
 * 元数据列表页
 * 页面路径: /metadata/list
 */

import { useState, useMemo } from "react";
import { Card, Table, Tag, Button, Space, Input, Switch, Modal, Form, Select, Breadcrumb } from "antd";
import { Search, Plus, Upload, Download, Edit, History, Trash2 } from "lucide-react";

import { PageLayout } from "@/components/layout";
import { PageBreadcrumb, DirectoryTree } from "@/components/ui";
import { ROUTES } from "@/constants";
import { mockMetadataCategories, mockMetadataList, filterMetadata } from "@/services/mock/metadata";
import { METADATA_TYPE_LABELS, type Metadata, type MetadataType } from "@/types/metadata";

/**
 * 面包屑配置
 */
const BREADCRUMB_ITEMS = [
  { title: "元数据管理", href: ROUTES.METADATA },
  { title: "元数据列表" },
];

/**
 * 元数据列表页面组件
 */
export default function MetadataListPage() {
  const [filters, setFilters] = useState<{
    keyword: string;
    type: string;
    categoryId: string;
  }>({
    keyword: "",
    type: "",
    categoryId: "",
  });

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMetadata, setEditingMetadata] = useState<Metadata | null>(null);

  /**
   * 过滤后的元数据列表
   */
  const filteredMetadata = useMemo(() => {
    return filterMetadata({
      keyword: filters.keyword,
      type: filters.type || undefined,
      categoryId: selectedCategory || undefined,
    });
  }, [filters, selectedCategory]);

  /**
   * 处理分类选择
   */
  const handleCategorySelect = (selectedKeys: React.Key[]) => {
    const key = selectedKeys[0] as string | undefined;
    setSelectedCategory(key === selectedCategory ? null : key ?? null);
  };

  /**
   * 处理订阅切换
   */
  const handleSubscribeChange = (metadataId: string, subscribed: boolean) => {
    // 实际项目中调用API更新订阅状态
    console.log("Update subscription:", metadataId, subscribed);
  };

  /**
   * 打开编辑弹窗
   */
  const handleEdit = (metadata: Metadata) => {
    setEditingMetadata(metadata);
    setModalOpen(true);
  };

  /**
   * 打开新增弹窗
   */
  const handleCreate = () => {
    setEditingMetadata(null);
    setModalOpen(true);
  };

  /**
   * 表格列定义
   */
  const columns = [
    {
      title: "名称",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: Metadata) => (
        <a style={{ color: "#2563EB" }}>{name}</a>
      ),
    },
    {
      title: "类型",
      dataIndex: "type",
      key: "type",
      render: (type: MetadataType) => (
        <Tag color={type === "table" ? "blue" : type === "view" ? "green" : "orange"}>
          {METADATA_TYPE_LABELS[type]}
        </Tag>
      ),
    },
    {
      title: "数据源",
      dataIndex: "dataSource",
      key: "dataSource",
    },
    {
      title: "当前版本",
      dataIndex: "currentVersion",
      key: "currentVersion",
    },
    {
      title: "更新时间",
      dataIndex: "updatedAt",
      key: "updatedAt",
    },
    {
      title: "更新人",
      dataIndex: "updatedBy",
      key: "updatedBy",
    },
    {
      title: "变更订阅",
      dataIndex: "subscribed",
      key: "subscribed",
      render: (subscribed: boolean, record: Metadata) => (
        <Switch
          checked={subscribed}
          onChange={(checked) => handleSubscribeChange(record.id, checked)}
          size="small"
        />
      ),
    },
    {
      title: "操作",
      key: "actions",
      render: (_: unknown, record: Metadata) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<Edit size={14} />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="text"
            size="small"
            icon={<History size={14} />}
          >
            版本
          </Button>
          <Button
            type="text"
            size="small"
            danger
            icon={<Trash2 size={14} />}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <PageLayout title="元数据列表">
      <PageBreadcrumb items={BREADCRUMB_ITEMS} />

      {/* 顶部操作栏 */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Space>
            <Input
              placeholder="搜索元数据名称..."
              prefix={<Search size={14} />}
              value={filters.keyword}
              onChange={(e) => setFilters((prev) => ({ ...prev, keyword: e.target.value }))}
              style={{ width: 240 }}
              allowClear
            />
            <Select
              placeholder="类型筛选"
              value={filters.type}
              onChange={(value) => setFilters((prev) => ({ ...prev, type: value || "" }))}
              style={{ width: 120 }}
              allowClear
              options={Object.entries(METADATA_TYPE_LABELS).map(([key, label]) => ({
                value: key,
                label,
              }))}
            />
          </Space>
          <Space>
            <Button icon={<Plus size={14} />} onClick={handleCreate}>
              新增
            </Button>
            <Button icon={<Upload size={14} />}>
              导入
            </Button>
            <Button icon={<Download size={14} />}>
              导出
            </Button>
          </Space>
        </div>
      </Card>

      {/* 主体布局 */}
      <div style={{ display: "flex", gap: 16 }}>
        {/* 左侧分类树 */}
        <Card
          title="分类目录"
          style={{ width: 240, flexShrink: 0 }}
          styles={{ body: { padding: 12 } }}
        >
          <DirectoryTree
            treeData={mockMetadataCategories.map((cat) => ({
              key: cat.id,
              title: cat.name,
              children: cat.children?.map((child) => ({
                key: child.id,
                title: child.name,
              })),
            }))}
            onSelect={handleCategorySelect}
            defaultSelectedKeys={selectedCategory ? [selectedCategory] : []}
            collapsible
          />
        </Card>

        {/* 右侧元数据表格 */}
        <Card
          title={`元数据列表 (${filteredMetadata.length})`}
          style={{ flex: 1 }}
        >
          <Table
            columns={columns}
            dataSource={filteredMetadata}
            rowKey="id"
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条`,
            }}
          />
        </Card>
      </div>

      {/* 新增/编辑弹窗 */}
      <Modal
        title={editingMetadata ? "编辑元数据" : "新增元数据"}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditingMetadata(null);
        }}
        onOk={() => {
          setModalOpen(false);
          setEditingMetadata(null);
        }}
        width={600}
      >
        <Form layout="vertical" initialValues={editingMetadata || {}}>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="type" label="类型" rules={[{ required: true }]}>
            <Select
              options={Object.entries(METADATA_TYPE_LABELS).map(([key, label]) => ({
                value: key,
                label,
              }))}
            />
          </Form.Item>
          <Form.Item name="dataSource" label="数据源" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </PageLayout>
  );
}