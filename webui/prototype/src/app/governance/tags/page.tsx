"use client";

/**
 * 数据标签管理页
 * 页面路径: /governance/tags
 */

import { useState, useMemo } from "react";
import { Card, Button, Input, Select, Tag, Space, Table, Modal, Form, message, Tabs, Checkbox, Radio, Dropdown } from "antd";
import type { MenuProps } from "antd";
import { Plus, Search, Edit, Trash2, Settings, Eye, Download, Filter, MoreHorizontal, Users, Tag as TagIcon } from "lucide-react";

import { PageLayout } from "@/components/layout";
import { PageBreadcrumb, DirectoryTree, CardGrid, StatusBadge } from "@/components/ui";
import { ROUTES } from "@/constants";
import type { DirectoryTreeNode, CardGridItem } from "@/components/ui";

/**
 * 面包屑配置
 */
const BREADCRUMB_ITEMS = [
  { title: "数据治理", href: ROUTES.GOVERNANCE },
  { title: "数据标签管理" },
];

/**
 * Mock 分类树
 */
const mockCategoryTree: DirectoryTreeNode[] = [
  { key: "all", title: "全部分类", isLeaf: true },
  {
    key: "customer",
    title: "客户标签",
    isLeaf: false,
    children: [
      { key: "customer-basic", title: "基础属性", isLeaf: true },
      { key: "customer-behavior", title: "行为特征", isLeaf: true },
      { key: "customer-value", title: "价值分级", isLeaf: true },
    ],
  },
  {
    key: "product",
    title: "产品标签",
    isLeaf: false,
    children: [
      { key: "product-category", title: "品类分类", isLeaf: true },
      { key: "product-status", title: "状态标签", isLeaf: true },
    ],
  },
];

/**
 * Mock 标签列表
 */
const mockTags = [
  { id: "tag-001", name: "高价值客户", code: "HIGH_VALUE", description: "年消费超过10万的客户", category: "customer-value", level: 1, totalCount: 15000, yesterdayIncrement: 120, ruleCount: 3 },
  { id: "tag-002", name: "活跃用户", code: "ACTIVE_USER", description: "近30天有登录行为的用户", category: "customer-behavior", level: 2, totalCount: 85000, yesterdayIncrement: 500, ruleCount: 2 },
  { id: "tag-003", name: "新客户", code: "NEW_CUSTOMER", description: "注册时间在30天内的客户", category: "customer-basic", level: 3, totalCount: 25000, yesterdayIncrement: 800, ruleCount: 1 },
  { id: "tag-004", name: "流失预警", code: "CHURN_RISK", description: "超过60天未登录的活跃用户", category: "customer-behavior", level: 1, totalCount: 5000, yesterdayIncrement: 50, ruleCount: 2 },
  { id: "tag-005", name: "新品偏好", code: "NEW_PRODUCT_FAN", description: "经常购买新上架产品的用户", category: "customer-behavior", level: 2, totalCount: 12000, yesterdayIncrement: 30, ruleCount: 1 },
  { id: "tag-006", name: "热销产品", code: "HOT_PRODUCT", description: "月销量TOP100的产品", category: "product-status", level: 1, totalCount: 100, yesterdayIncrement: 0, ruleCount: 1 },
];

/**
 * 等级颜色映射
 */
const LEVEL_COLORS: Record<number, string> = {
  1: "#EF4444",
  2: "#F59E0B",
  3: "#10B981",
};

/**
 * 数据标签管理页面组件
 */
export default function TagManagementPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [ruleModalOpen, setRuleModalOpen] = useState(false);
  const [queryModalOpen, setQueryModalOpen] = useState(false);
  const [form] = Form.useForm();

  /**
   * 过滤后的标签列表
   */
  const filteredTags = useMemo(() => {
    return mockTags.filter((tag) => {
      if (selectedCategory !== "all" && tag.category !== selectedCategory) return false;
      if (levelFilter !== "all" && tag.level !== Number(levelFilter)) return false;
      if (searchKeyword && !tag.name.toLowerCase().includes(searchKeyword.toLowerCase())) return false;
      return true;
    });
  }, [selectedCategory, levelFilter, searchKeyword]);

  /**
   * 转换为卡片数据
   */
  const cardItems: CardGridItem[] = useMemo(() => {
    return filteredTags.map((tag) => ({
      id: tag.id,
      title: tag.name,
      description: tag.description,
      icon: <TagIcon size={24} />,
      data: tag,
    }));
  }, [filteredTags]);

  /**
   * 处理分类选中
   */
  const handleCategorySelect = (keys: React.Key[]) => {
    if (keys.length > 0) {
      setSelectedCategory(keys[0] as string);
    }
  };

  /**
   * 渲染标签卡片
   */
  const renderTagCard = (item: CardGridItem) => {
    const tag = item.data as typeof mockTags[0];

    return (
      <Card
        hoverable
        style={{ height: "100%" }}
        actions={[
          <Dropdown
            key="actions"
            menu={{
              items: [
                { key: "edit", icon: <Edit size={14} />, label: "编辑", onClick: () => setModalOpen(true) },
                { key: "rule", icon: <Settings size={14} />, label: "规则配置", onClick: () => setRuleModalOpen(true) },
                { key: "query", icon: <Eye size={14} />, label: "查询数据", onClick: () => setQueryModalOpen(true) },
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
          <Tag color={LEVEL_COLORS[tag.level]}>L{tag.level}</Tag>
          <Tag>{tag.totalCount.toLocaleString()} 人</Tag>
        </div>

        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
          {tag.name}
        </div>

        <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 8 }}>
          {tag.code}
        </div>

        <div style={{ fontSize: 14, color: "#475569", marginBottom: 8, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
          {tag.description}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6B7280" }}>
          <span>昨日新增: {tag.yesterdayIncrement}</span>
          <span>规则数: {tag.ruleCount}</span>
        </div>
      </Card>
    );
  };

  return (
    <PageLayout title="数据标签管理">
      {/* 面包屑 */}
      <PageBreadcrumb items={BREADCRUMB_ITEMS} />

      {/* 主体布局 */}
      <div style={{ display: "flex", gap: 16 }}>
        {/* 左侧分类树 */}
        <DirectoryTree
          treeData={mockCategoryTree}
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
                  placeholder="搜索标签名称..."
                  prefix={<Search size={14} />}
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  style={{ width: 250 }}
                  allowClear
                />
                <Select
                  value={levelFilter}
                  onChange={setLevelFilter}
                  options={[
                    { value: "all", label: "全部等级" },
                    { value: "1", label: "一级标签" },
                    { value: "2", label: "二级标签" },
                    { value: "3", label: "三级标签" },
                  ]}
                  style={{ width: 120 }}
                />
              </Space>
              <Space>
                <Button icon={<Users size={14} />} onClick={() => setQueryModalOpen(true)}>
                  标签碰撞查询
                </Button>
                <Button type="primary" icon={<Plus size={14} />} onClick={() => setModalOpen(true)}>
                  新增标签
                </Button>
              </Space>
            </div>
          </Card>

          {/* 标签卡片网格 */}
          <CardGrid
            items={cardItems}
            renderCard={renderTagCard}
            columns={{ desktop: 3, tablet: 2, mobile: 1 }}
            gutter={16}
          />
        </div>
      </div>

      {/* 新增/编辑标签弹窗 */}
      <Modal
        title="新增标签"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => {
          message.success("保存成功");
          setModalOpen(false);
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="标签名称" rules={[{ required: true }]}>
            <Input placeholder="请输入标签名称" />
          </Form.Item>
          <Form.Item name="code" label="标签编码" rules={[{ required: true }]}>
            <Input placeholder="请输入标签编码" />
          </Form.Item>
          <Form.Item name="category" label="标签分类" rules={[{ required: true }]}>
            <Select placeholder="选择分类" options={[{ value: "customer-basic", label: "基础属性" }]} />
          </Form.Item>
          <Form.Item name="level" label="标签等级" rules={[{ required: true }]}>
            <Select placeholder="选择等级" options={[{ value: 1, label: "一级" }, { value: 2, label: "二级" }, { value: 3, label: "三级" }]} />
          </Form.Item>
          <Form.Item name="description" label="标签描述">
            <Input.TextArea rows={3} placeholder="请输入描述" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 规则配置弹窗 */}
      <Modal
        title="标签规则配置"
        open={ruleModalOpen}
        onCancel={() => setRuleModalOpen(false)}
        width={800}
        footer={null}
      >
        <Form layout="vertical">
          <Form.Item name="dataSource" label="数据源">
            <Select placeholder="选择数据源" options={[{ value: "mysql", label: "MySQL-生产库" }]} />
          </Form.Item>
          <Form.Item name="condition" label="提取条件 (WHERE)">
            <Input.TextArea rows={3} placeholder="例如: annual_consumption > 100000" />
          </Form.Item>
          <Form.Item name="extractMode" label="提取方式">
            <Radio.Group options={[{ value: "full", label: "全量提取" }, { value: "incremental", label: "增量提取" }]} defaultValue="full" />
          </Form.Item>
          <Form.Item name="schedule" label="调度周期">
            <Select placeholder="选择周期" options={[{ value: "daily", label: "每日" }, { value: "weekly", label: "每周" }]} />
          </Form.Item>
        </Form>
        <div style={{ textAlign: "right" }}>
          <Button type="primary">保存规则</Button>
        </div>
      </Modal>

      {/* 标签碰撞查询弹窗 */}
      <Modal
        title="标签碰撞查询"
        open={queryModalOpen}
        onCancel={() => setQueryModalOpen(false)}
        width={900}
        footer={null}
      >
        <div style={{ display: "flex", gap: 16 }}>
          {/* 左侧标签选择 */}
          <Card style={{ width: 300 }} title="选择标签">
            <div style={{ marginBottom: 8 }}>
              <Radio.Group defaultValue="and" size="small">
                <Radio.Button value="and">交集</Radio.Button>
                <Radio.Button value="or">并集</Radio.Button>
              </Radio.Group>
            </div>
            <div style={{ maxHeight: 300, overflow: "auto" }}>
              {mockTags.map((tag) => (
                <div key={tag.id} style={{ padding: "4px 0" }}>
                  <Checkbox>{tag.name}</Checkbox>
                </div>
              ))}
            </div>
          </Card>

          {/* 右侧结果 */}
          <Card style={{ flex: 1 }} title="查询结果">
            <Table
              dataSource={[
                { id: "C001", name: "张三", tags: "高价值客户, 活跃用户" },
                { id: "C002", name: "李四", tags: "新客户" },
              ]}
              columns={[
                { title: "客户ID", dataIndex: "id", key: "id" },
                { title: "客户名称", dataIndex: "name", key: "name" },
                { title: "关联标签", dataIndex: "tags", key: "tags" },
              ]}
              rowKey="id"
              pagination={false}
              size="small"
            />
            <div style={{ marginTop: 16, textAlign: "right" }}>
              <Button icon={<Download size={14} />}>导出结果</Button>
            </div>
          </Card>
        </div>
      </Modal>
    </PageLayout>
  );
}