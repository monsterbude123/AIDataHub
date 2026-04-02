"use client";

/**
 * 资源目录浏览页
 * 页面路径: /data-organization/catalog
 */

import { useState, useMemo } from "react";
import { Card, Button, Input, Table, Tag, Space, Dropdown, Modal, Form, message, Tabs, Breadcrumb, Select, TreeSelect } from "antd";
import type { MenuProps } from "antd";
import { Plus, FolderPlus, RefreshCw, Search, Edit, Trash2, Database, FileText, MoreHorizontal, Eye, ArrowRight } from "lucide-react";

import { PageLayout } from "@/components/layout";
import { PageBreadcrumb, DirectoryTree, CardGrid, StatusBadge } from "@/components/ui";
import { ROUTES } from "@/constants";
import type { DirectoryTreeNode, CardGridItem } from "@/components/ui";

/**
 * 面包屑配置
 */
const BREADCRUMB_ITEMS = [
  { title: "数据组织", href: "/data-organization" },
  { title: "资源目录" },
];

/**
 * 分层类型标签
 */
const LAYER_LABELS: Record<string, string> = {
  business: "业务库",
  raw: "原始库",
  resource: "资源库",
  theme: "主题库",
};

/**
 * Mock 目录树数据
 */
const mockCatalogTree: DirectoryTreeNode[] = [
  {
    key: "root",
    title: "数据资源目录",
    isLeaf: false,
    children: [
      {
        key: "business",
        title: "业务库",
        isLeaf: false,
        children: [
          { key: "business-customer", title: "客户域", isLeaf: true },
          { key: "business-order", title: "订单域", isLeaf: true },
          { key: "business-product", title: "产品域", isLeaf: true },
        ],
      },
      {
        key: "raw",
        title: "原始库",
        isLeaf: false,
        children: [
          { key: "raw-system-a", title: "系统A原始数据", isLeaf: true },
          { key: "raw-system-b", title: "系统B原始数据", isLeaf: true },
        ],
      },
      {
        key: "resource",
        title: "资源库",
        isLeaf: false,
        children: [
          { key: "resource-public", title: "公共数据", isLeaf: true },
          { key: "resource-reference", title: "参考数据", isLeaf: true },
        ],
      },
      {
        key: "theme",
        title: "主题库",
        isLeaf: false,
        children: [
          { key: "theme-customer-360", title: "客户360", isLeaf: true },
          { key: "theme-risk", title: "风险分析", isLeaf: true },
        ],
      },
    ],
  },
];

/**
 * Mock 资源列表
 */
const mockResources = [
  { id: "res-001", name: "客户基本信息表", type: "table", rowCount: 1500000, updatedAt: "2024-01-20 10:00", layer: "business" },
  { id: "res-002", name: "客户联系方式表", type: "table", rowCount: 1200000, updatedAt: "2024-01-19 16:30", layer: "business" },
  { id: "res-003", name: "订单主表", type: "table", rowCount: 5000000, updatedAt: "2024-01-20 08:00", layer: "business" },
  { id: "res-004", name: "订单明细表", type: "table", rowCount: 20000000, updatedAt: "2024-01-20 08:00", layer: "business" },
  { id: "res-005", name: "产品目录", type: "table", rowCount: 5000, updatedAt: "2024-01-15 14:00", layer: "business" },
  { id: "res-006", name: "客户行为日志", type: "file", fileCount: 365, updatedAt: "2024-01-20 00:00", layer: "raw" },
  { id: "res-007", name: "行政区划代码", type: "table", rowCount: 5000, updatedAt: "2024-01-01 00:00", layer: "resource" },
  { id: "res-008", name: "客户画像汇总", type: "table", rowCount: 1000000, updatedAt: "2024-01-20 06:00", layer: "theme" },
];

/**
 * 资源目录浏览页面组件
 */
export default function ResourceCatalogPage() {
  const [selectedNode, setSelectedNode] = useState<string>("root");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [activeLayer, setActiveLayer] = useState<string>("all");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addType, setAddType] = useState<"folder" | "resource">("folder");
  const [form] = Form.useForm();

  /**
   * 过滤后的资源列表
   */
  const filteredResources = useMemo(() => {
    let result = mockResources;

    // 按分层过滤
    if (activeLayer !== "all") {
      result = result.filter((r) => r.layer === activeLayer);
    }

    // 按关键词过滤
    if (searchKeyword) {
      result = result.filter((r) =>
        r.name.toLowerCase().includes(searchKeyword.toLowerCase())
      );
    }

    return result;
  }, [activeLayer, searchKeyword]);

  /**
   * 转换为卡片数据
   */
  const cardItems: CardGridItem[] = useMemo(() => {
    return filteredResources.map((res) => ({
      id: res.id,
      title: res.name,
      description: res.type === "table" ? `${res.rowCount?.toLocaleString()} 行` : `${res.fileCount} 个文件`,
      icon: res.type === "table" ? <Database size={24} /> : <FileText size={24} />,
      data: res,
    }));
  }, [filteredResources]);

  /**
   * 处理目录节点选中
   */
  const handleNodeSelect = (keys: React.Key[]) => {
    if (keys.length > 0) {
      setSelectedNode(keys[0] as string);
    }
  };

  /**
   * 处理新增目录
   */
  const handleAddFolder = () => {
    setAddType("folder");
    setAddModalOpen(true);
  };

  /**
   * 处理新增资源
   */
  const handleAddResource = () => {
    setAddType("resource");
    setAddModalOpen(true);
  };

  /**
   * 处理保存
   */
  const handleSave = async () => {
    try {
      await form.validateFields();
      message.success(addType === "folder" ? "目录创建成功" : "资源创建成功");
      setAddModalOpen(false);
      form.resetFields();
    } catch {
      message.error("请完成必填项");
    }
  };

  /**
   * 处理右键菜单
   */
  const handleContextMenu = (nodeKey: string): MenuProps["items"] => {
    return [
      { key: "add-child", icon: <FolderPlus size={14} />, label: "新增子目录", onClick: () => handleAddFolder() },
      { key: "add-sibling", icon: <Plus size={14} />, label: "新增同级目录" },
      { key: "rename", icon: <Edit size={14} />, label: "重命名" },
      { type: "divider" },
      { key: "delete", icon: <Trash2 size={14} />, label: "删除", danger: true, onClick: () => message.warning("删除需要确认") },
    ];
  };

  /**
   * 渲染资源卡片
   */
  const renderResourceCard = (item: CardGridItem) => {
    const res = item.data as typeof mockResources[0];
    const layerLabel = LAYER_LABELS[res.layer] || res.layer;

    return (
      <Card
        hoverable
        style={{ height: "100%" }}
        actions={[
          <Dropdown
            key="actions"
            menu={{
              items: [
                { key: "view", icon: <Eye size={14} />, label: "查看详情" },
                { key: "edit", icon: <Edit size={14} />, label: "编辑" },
                { key: "profile", icon: <Search size={14} />, label: "数据探查" },
                { key: "mapping", icon: <ArrowRight size={14} />, label: "入库映射" },
                { type: "divider" },
                { key: "delete", icon: <Trash2 size={14} />, label: "删除", danger: true },
              ],
            }}
            trigger={["click"]}
          >
            <Button type="text" icon={<MoreHorizontal size={14} />} />
          </Dropdown>,
        ]}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <Tag color={res.layer === "business" ? "blue" : res.layer === "raw" ? "cyan" : res.layer === "resource" ? "green" : "purple"}>
            {layerLabel}
          </Tag>
          <Tag>{res.type === "table" ? "数据表" : "文件"}</Tag>
        </div>

        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
          {res.name}
        </div>

        <div style={{ fontSize: 14, color: "#6B7280", marginBottom: 8 }}>
          {res.type === "table" ? `${res.rowCount?.toLocaleString()} 行` : `${res.fileCount} 个文件`}
        </div>

        <div style={{ fontSize: 12, color: "#6B7280" }}>
          更新: {res.updatedAt}
        </div>
      </Card>
    );
  };

  return (
    <PageLayout title="资源目录">
      {/* 面包屑 */}
      <PageBreadcrumb items={BREADCRUMB_ITEMS} />

      {/* 分层 Tabs */}
      <Tabs
        activeKey={activeLayer}
        onChange={setActiveLayer}
        items={[
          { key: "all", label: "全部" },
          { key: "business", label: "业务库" },
          { key: "raw", label: "原始库" },
          { key: "resource", label: "资源库" },
          { key: "theme", label: "主题库" },
        ]}
        style={{ marginBottom: 16 }}
      />

      {/* 主体布局 */}
      <div style={{ display: "flex", gap: 16 }}>
        {/* 左侧目录树 */}
        <Card
          title="目录结构"
          style={{ width: 280 }}
          extra={
            <Dropdown
              menu={{
                items: [
                  { key: "folder", icon: <FolderPlus size={14} />, label: "新增目录", onClick: handleAddFolder },
                  { key: "resource", icon: <Plus size={14} />, label: "新增资源", onClick: handleAddResource },
                ],
              }}
            >
              <Button type="text" icon={<Plus size={14} />} />
            </Dropdown>
          }
        >
          <DirectoryTree
            treeData={mockCatalogTree}
            onSelect={handleNodeSelect}
            showSearch
            defaultSelectedKeys={[selectedNode]}
          />
        </Card>

        {/* 右侧资源列表 */}
        <div style={{ flex: 1 }}>
          {/* 工具栏 */}
          <Card style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Input
                placeholder="搜索资源名称..."
                prefix={<Search size={14} />}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                style={{ width: 300 }}
                allowClear
              />
              <Space>
                <Button icon={<RefreshCw size={14} />}>
                  刷新
                </Button>
                <Button type="primary" icon={<Plus size={14} />} onClick={handleAddResource}>
                  新增资源
                </Button>
              </Space>
            </div>
          </Card>

          {/* 资源卡片网格 */}
          <CardGrid
            items={cardItems}
            renderCard={renderResourceCard}
            columns={{ desktop: 3, tablet: 2, mobile: 1 }}
            gutter={16}
          />
        </div>
      </div>

      {/* 新增弹窗 */}
      <Modal
        title={addType === "folder" ? "新增目录" : "新增资源"}
        open={addModalOpen}
        onCancel={() => {
          setAddModalOpen(false);
          form.resetFields();
        }}
        onOk={handleSave}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label={addType === "folder" ? "目录名称" : "资源名称"} rules={[{ required: true }]}>
            <Input placeholder={addType === "folder" ? "请输入目录名称" : "请输入资源名称"} />
          </Form.Item>

          {addType === "resource" && (
            <>
              <Form.Item name="type" label="资源类型" rules={[{ required: true }]}>
                <Input disabled defaultValue="数据表" />
              </Form.Item>
              <Form.Item name="layer" label="所属分层" rules={[{ required: true }]}>
                <Select
                  options={Object.entries(LAYER_LABELS).map(([value, label]) => ({ value, label }))}
                  placeholder="选择分层"
                />
              </Form.Item>
              <Form.Item name="description" label="描述">
                <Input.TextArea rows={3} placeholder="请输入描述" />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </PageLayout>
  );
}