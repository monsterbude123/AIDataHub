"use client";

/**
 * 数据标准管理页
 * 页面路径: /governance/standard
 */

import { useState } from "react";
import { Card, Table, Button, Input, Select, Space, Tag, Modal, Form, message, Tabs, Transfer, TreeSelect, Switch, Dropdown } from "antd";
import type { MenuProps } from "antd";
import { Plus, Search, Edit, Trash2, Download, Upload, RefreshCw, Settings, MoreHorizontal, Book, Database, Code } from "lucide-react";

import { PageLayout } from "@/components/layout";
import { PageBreadcrumb, DirectoryTree } from "@/components/ui";
import { ROUTES } from "@/constants";
import type { DirectoryTreeNode } from "@/components/ui";

/**
 * 面包屑配置
 */
const BREADCRUMB_ITEMS = [
  { title: "数据治理", href: ROUTES.GOVERNANCE },
  { title: "数据标准管理" },
];

/**
 * Mock 数据元列表
 */
const mockDataElements = [
  { id: "de-001", identifier: "CUSTOMER_NAME", name: "客户姓名", type: "VARCHAR", length: 100, category: "客户信息", status: "active" },
  { id: "de-002", identifier: "CUSTOMER_ID", name: "客户编号", type: "BIGINT", length: 20, category: "客户信息", status: "active" },
  { id: "de-003", identifier: "PHONE_NUMBER", name: "手机号码", type: "VARCHAR", length: 20, category: "联系方式", status: "active" },
  { id: "de-004", identifier: "EMAIL_ADDRESS", name: "电子邮箱", type: "VARCHAR", length: 200, category: "联系方式", status: "active" },
  { id: "de-005", identifier: "ORDER_AMOUNT", name: "订单金额", type: "DECIMAL", length: 18, category: "交易信息", status: "active" },
  { id: "de-006", identifier: "ORDER_DATE", name: "下单日期", type: "DATE", length: 0, category: "交易信息", status: "inactive" },
];

/**
 * Mock 字典分类树
 */
const mockDictCategories: DirectoryTreeNode[] = [
  { key: "all", title: "全部分类", isLeaf: true },
  { key: "cat-status", title: "状态字典", isLeaf: true },
  { key: "cat-gender", title: "性别字典", isLeaf: true },
  { key: "cat-type", title: "类型字典", isLeaf: true },
  { key: "cat-region", title: "地区字典", isLeaf: true },
];

/**
 * Mock 字典列表
 */
const mockDictionaries = [
  { id: "dict-001", name: "状态字典", code: "status_dict", type: "custom", itemCount: 5, updatedAt: "2024-01-15" },
  { id: "dict-002", name: "性别字典", code: "gender_dict", type: "custom", itemCount: 3, updatedAt: "2024-01-10" },
  { id: "dict-003", name: "订单状态", code: "order_status", type: "dataset", itemCount: 6, updatedAt: "2024-01-20" },
  { id: "dict-004", name: "省份字典", code: "province_dict", type: "custom", itemCount: 34, updatedAt: "2024-01-01" },
];

/**
 * Mock 字典项
 */
const mockDictItems = [
  { code: "0", name: "禁用", sort: 1 },
  { code: "1", name: "启用", sort: 2 },
  { code: "2", name: "待审核", sort: 3 },
  { code: "3", name: "已删除", sort: 4 },
];

/**
 * Mock 类型映射
 */
const mockTypeMappings = [
  { standardType: "字符串", dbTypes: ["VARCHAR", "VARCHAR2", "TEXT", "STRING"] },
  { standardType: "整数", dbTypes: ["INT", "INTEGER", "BIGINT", "SMALLINT"] },
  { standardType: "小数", dbTypes: ["FLOAT", "DOUBLE", "DECIMAL", "NUMERIC"] },
  { standardType: "日期", dbTypes: ["DATE"] },
  { standardType: "时间", dbTypes: ["TIME"] },
  { standardType: "日期时间", dbTypes: ["DATETIME", "TIMESTAMP"] },
];

/**
 * 数据标准管理页面组件
 */
export default function DataStandardPage() {
  const [activeTab, setActiveTab] = useState("dataElement");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [dictModalOpen, setDictModalOpen] = useState(false);
  const [selectedDict, setSelectedDict] = useState<string>("all");
  const [form] = Form.useForm();

  /**
   * 数据元表格列
   */
  const dataElementColumns = [
    { title: "标识符", dataIndex: "identifier", key: "identifier", width: 150 },
    { title: "名称", dataIndex: "name", key: "name", width: 120 },
    { title: "数据类型", dataIndex: "type", key: "type", width: 100 },
    { title: "长度", dataIndex: "length", key: "length", width: 80 },
    { title: "分类", dataIndex: "category", key: "category", width: 100 },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 80,
      render: (status: string) =>
        status === "active" ? <Tag color="green">启用</Tag> : <Tag>禁用</Tag>,
    },
    {
      title: "操作",
      key: "actions",
      width: 100,
      render: () => (
        <Space>
          <Button type="link" size="small">编辑</Button>
          <Button type="link" size="small" danger>删除</Button>
        </Space>
      ),
    },
  ];

  /**
   * 字典表格列
   */
  const dictColumns = [
    { title: "字典名称", dataIndex: "name", key: "name", width: 150 },
    { title: "字典编码", dataIndex: "code", key: "code", width: 150 },
    {
      title: "类型",
      dataIndex: "type",
      key: "type",
      width: 100,
      render: (type: string) => (
        <Tag color={type === "custom" ? "blue" : "green"}>
          {type === "custom" ? "自定义" : "数据集"}
        </Tag>
      ),
    },
    { title: "字典项数", dataIndex: "itemCount", key: "itemCount", width: 80 },
    { title: "更新时间", dataIndex: "updatedAt", key: "updatedAt", width: 120 },
    {
      title: "操作",
      key: "actions",
      width: 150,
      render: () => (
        <Space>
          <Button type="link" size="small" onClick={() => setDictModalOpen(true)}>编辑</Button>
          <Button type="link" size="small">刷新缓存</Button>
        </Space>
      ),
    },
  ];

  /**
   * 字典项表格列
   */
  const dictItemColumns = [
    { title: "编码", dataIndex: "code", key: "code", width: 100 },
    { title: "名称", dataIndex: "name", key: "name", width: 150 },
    { title: "排序", dataIndex: "sort", key: "sort", width: 80 },
    {
      title: "操作",
      key: "actions",
      width: 100,
      render: () => (
        <Space>
          <Button type="link" size="small">编辑</Button>
          <Button type="link" size="small" danger>删除</Button>
        </Space>
      ),
    },
  ];

  /**
   * 类型映射表格列
   */
  const typeMappingColumns = [
    { title: "标准类型", dataIndex: "standardType", key: "standardType", width: 120 },
    {
      title: "数据库类型映射",
      dataIndex: "dbTypes",
      key: "dbTypes",
      render: (types: string[]) => (
        <Space wrap>
          {types.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: "操作",
      key: "actions",
      width: 100,
      render: () => <Button type="link" size="small">编辑</Button>,
    },
  ];

  return (
    <PageLayout title="数据标准管理">
      {/* 面包屑 */}
      <PageBreadcrumb items={BREADCRUMB_ITEMS} />

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: "dataElement",
            label: (
              <span>
                <Book size={14} style={{ marginRight: 4 }} />
                标准数据元
              </span>
            ),
            children: (
              <Card>
                <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
                  <Space>
                    <Input
                      placeholder="搜索数据元..."
                      prefix={<Search size={14} />}
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      style={{ width: 250 }}
                      allowClear
                    />
                    <Select placeholder="分类筛选" style={{ width: 150 }} allowClear />
                  </Space>
                  <Space>
                    <Button icon={<Upload size={14} />}>导入</Button>
                    <Button icon={<Download size={14} />}>导出</Button>
                    <Button type="primary" icon={<Plus size={14} />} onClick={() => setModalOpen(true)}>
                      新增数据元
                    </Button>
                  </Space>
                </div>

                <Table
                  dataSource={mockDataElements}
                  columns={dataElementColumns}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              </Card>
            ),
          },
          {
            key: "dictionary",
            label: (
              <span>
                <Database size={14} style={{ marginRight: 4 }} />
                标准字典
              </span>
            ),
            children: (
              <div style={{ display: "flex", gap: 16 }}>
                {/* 左侧分类树 */}
                <Card style={{ width: 240 }} title="字典分类">
                  <DirectoryTree
                    treeData={mockDictCategories}
                    onSelect={(keys) => keys.length > 0 && setSelectedDict(keys[0] as string)}
                    defaultSelectedKeys={["all"]}
                  />
                </Card>

                {/* 右侧字典列表 */}
                <div style={{ flex: 1 }}>
                  <Card>
                    <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
                      <Input
                        placeholder="搜索字典..."
                        prefix={<Search size={14} />}
                        style={{ width: 250 }}
                        allowClear
                      />
                      <Space>
                        <Button icon={<RefreshCw size={14} />}>刷新全部缓存</Button>
                        <Button icon={<Upload size={14} />}>导入</Button>
                        <Button type="primary" icon={<Plus size={14} />} onClick={() => setDictModalOpen(true)}>
                          新增字典
                        </Button>
                      </Space>
                    </div>

                    <Table
                      dataSource={mockDictionaries}
                      columns={dictColumns}
                      rowKey="id"
                      pagination={false}
                    />
                  </Card>

                  {/* 字典项配置 */}
                  <Card style={{ marginTop: 16 }} title="字典项 (状态字典)">
                    <div style={{ marginBottom: 8 }}>
                      <Button icon={<Plus size={14} />}>新增字典项</Button>
                    </div>
                    <Table
                      dataSource={mockDictItems}
                      columns={dictItemColumns}
                      rowKey="code"
                      pagination={false}
                      size="small"
                    />
                  </Card>
                </div>
              </div>
            ),
          },
          {
            key: "typeMapping",
            label: (
              <span>
                <Code size={14} style={{ marginRight: 4 }} />
                类型映射
              </span>
            ),
            children: (
              <Card>
                <div style={{ marginBottom: 16 }}>
                  <Button type="primary" icon={<Plus size={14} />}>
                    新增映射
                  </Button>
                </div>
                <Table
                  dataSource={mockTypeMappings}
                  columns={typeMappingColumns}
                  rowKey="standardType"
                  pagination={false}
                />
              </Card>
            ),
          },
        ]}
      />

      {/* 新增数据元弹窗 */}
      <Modal
        title="新增数据元"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => {
          message.success("保存成功");
          setModalOpen(false);
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="identifier" label="标识符" rules={[{ required: true }]}>
            <Input placeholder="例如: CUSTOMER_NAME" />
          </Form.Item>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}>
            <Input placeholder="数据元名称" />
          </Form.Item>
          <Form.Item name="definition" label="定义">
            <Input.TextArea rows={2} placeholder="数据元定义说明" />
          </Form.Item>
          <Form.Item name="type" label="数据类型" rules={[{ required: true }]}>
            <Select
              options={[
                { value: "VARCHAR", label: "VARCHAR" },
                { value: "BIGINT", label: "BIGINT" },
                { value: "DECIMAL", label: "DECIMAL" },
                { value: "DATE", label: "DATE" },
              ]}
            />
          </Form.Item>
          <Form.Item name="length" label="数据长度">
            <Input type="number" />
          </Form.Item>
          <Form.Item name="category" label="分类">
            <Select placeholder="选择分类" />
          </Form.Item>
          <Form.Item name="status" label="状态" valuePropName="checked" initialValue={true}>
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 字典编辑弹窗 */}
      <Modal
        title="编辑字典"
        open={dictModalOpen}
        onCancel={() => setDictModalOpen(false)}
        onOk={() => {
          message.success("保存成功");
          setDictModalOpen(false);
        }}
        width={600}
      >
        <Form layout="vertical">
          <Form.Item name="name" label="字典名称" rules={[{ required: true }]}>
            <Input placeholder="字典名称" />
          </Form.Item>
          <Form.Item name="code" label="字典编码" rules={[{ required: true }]}>
            <Input placeholder="字典编码" />
          </Form.Item>
          <Form.Item name="type" label="字典类型" rules={[{ required: true }]}>
            <Select
              options={[
                { value: "custom", label: "自定义字典" },
                { value: "dataset", label: "数据集字典" },
              ]}
            />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </PageLayout>
  );
}