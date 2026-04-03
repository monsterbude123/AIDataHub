"use client";

/**
 * 服务授权页
 * 页面路径: /service/authorization
 */

import { useState, useMemo } from "react";
import { Card, Table, Button, Input, Select, Space, Tag, Modal, Form, DatePicker, InputNumber, message, TreeSelect, Dropdown } from "antd";
import type { MenuProps } from "antd";
import { Plus, Edit, Trash2, Search, Filter, MoreHorizontal, Clock, User, Building } from "lucide-react";

import { PageLayout } from "@/components/layout";
import { PageBreadcrumb, DirectoryTree, StatusBadge } from "@/components/ui";
import { ROUTES } from "@/constants";
import { mockServiceList } from "@/services/mock/data-service";
import type { DirectoryTreeNode } from "@/components/ui";

/**
 * 面包屑配置
 */
const BREADCRUMB_ITEMS = [
  { title: "数据服务", href: ROUTES.DATA_SERVICE },
  { title: "服务授权" },
];

/**
 * Mock 授权分类树
 */
const mockAuthorizationCategories: DirectoryTreeNode[] = [
  { key: "all", title: "全部授权", isLeaf: true },
  { key: "industry", title: "按行业", isLeaf: false },
  { key: "industry-1", title: "金融行业", isLeaf: true },
  { key: "industry-2", title: "政府机构", isLeaf: true },
  { key: "industry-3", title: "企业单位", isLeaf: true },
  { key: "org", title: "按单位", isLeaf: false },
  { key: "org-1", title: "数据管理局", isLeaf: true },
  { key: "org-2", title: "大数据中心", isLeaf: true },
  { key: "org-3", title: "信息中心", isLeaf: true },
];

/**
 * Mock 授权列表
 */
const mockAuthorizations = [
  { id: "auth-001", title: "客户信息查询授权申请", serviceName: "客户信息查询API", applicantUnit: "数据管理局", contact: "张三", phone: "13800138001", rateLimit: 100, dailyLimit: 1000, expireTime: "2024-06-30", status: "active" },
  { id: "auth-002", title: "订单数据下载授权", serviceName: "订单数据下载服务", applicantUnit: "大数据中心", contact: "李四", phone: "13900139002", rateLimit: 50, dailyLimit: 500, expireTime: "2024-03-15", status: "active" },
  { id: "auth-003", title: "客户比对服务授权", serviceName: "客户身份比对服务", applicantUnit: "信息中心", contact: "王五", phone: "13700137003", rateLimit: 200, dailyLimit: 2000, expireTime: "2024-01-10", status: "expired" },
  { id: "auth-004", title: "库存查询授权申请", serviceName: "产品库存查询", applicantUnit: "企业单位A", contact: "赵六", phone: "13600136004", rateLimit: 30, dailyLimit: 300, expireTime: "2024-12-31", status: "active" },
  { id: "auth-005", title: "同步状态查询授权", serviceName: "实时数据同步状态", applicantUnit: "数据管理局", contact: "孙七", phone: "13500135005", rateLimit: 0, dailyLimit: 0, expireTime: "2025-01-01", status: "active" },
];

/**
 * 服务授权页面组件
 */
export default function ServiceAuthorizationPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAuth, setEditingAuth] = useState<typeof mockAuthorizations[0] | null>(null);
  const [form] = Form.useForm();

  /**
   * 过滤后的授权列表
   */
  const filteredAuthorizations = useMemo(() => {
    if (!searchKeyword) return mockAuthorizations;
    return mockAuthorizations.filter(
      (auth) =>
        auth.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        auth.serviceName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        auth.contact.toLowerCase().includes(searchKeyword.toLowerCase())
    );
  }, [searchKeyword]);

  /**
   * 处理分类选中
   */
  const handleCategorySelect = (keys: React.Key[]) => {
    if (keys.length > 0) {
      setSelectedCategory(keys[0] as string);
    }
  };

  /**
   * 处理新增授权
   */
  const handleCreate = () => {
    setEditingAuth(null);
    form.resetFields();
    setModalOpen(true);
  };

  /**
   * 处理编辑授权
   */
  const handleEdit = (auth: typeof mockAuthorizations[0]) => {
    setEditingAuth(auth);
    form.setFieldsValue(auth);
    setModalOpen(true);
  };

  /**
   * 处理删除授权
   */
  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "确认删除",
      content: "确定要删除此授权记录吗？删除后无法恢复。",
      onOk: () => {
        message.success("删除成功");
      },
    });
  };

  /**
   * 处理保存授权
   */
  const handleSave = async () => {
    try {
      await form.validateFields();
      message.success(editingAuth ? "授权更新成功" : "授权创建成功");
      setModalOpen(false);
    } catch {
      message.error("请完成所有必填项");
    }
  };

  /**
   * 渲染过期时间
   */
  const renderExpireTime = (time: string, status: string) => {
    const isExpiringSoon = status === "active" && new Date(time) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    return (
      <span style={{ color: isExpiringSoon ? "#F59E0B" : status === "expired" ? "#EF4444" : "#10B981" }}>
        {time}
        {isExpiringSoon && <Tag color="warning" style={{ marginLeft: 4 }}>即将过期</Tag>}
      </span>
    );
  };

  /**
   * 表格列定义
   */
  const columns = [
    {
      title: "申请标题",
      dataIndex: "title",
      key: "title",
      width: 200,
      render: (title: string) => (
        <a onClick={() => message.info("查看详情")}>{title}</a>
      ),
    },
    { title: "服务名称", dataIndex: "serviceName", key: "serviceName", width: 150 },
    { title: "申请方单位", dataIndex: "applicantUnit", key: "applicantUnit", width: 120 },
    { title: "联系人", dataIndex: "contact", key: "contact", width: 80 },
    {
      title: "频率限制",
      dataIndex: "rateLimit",
      key: "rateLimit",
      width: 100,
      render: (value: number) => (value === 0 ? "不限制" : `${value} 次/分钟`),
    },
    {
      title: "日限制",
      dataIndex: "dailyLimit",
      key: "dailyLimit",
      width: 100,
      render: (value: number) => (value === 0 ? "不限制" : `${value} 次/日`),
    },
    {
      title: "到期时间",
      dataIndex: "expireTime",
      key: "expireTime",
      width: 140,
      render: (time: string, record: { status: string }) => renderExpireTime(time, record.status),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 80,
      render: (status: string) =>
        status === "active" ? (
          <Tag color="green">生效</Tag>
        ) : (
          <Tag color="default">失效</Tag>
        ),
    },
    {
      title: "操作",
      key: "actions",
      width: 100,
      render: (_: unknown, record: typeof mockAuthorizations[0]) => {
        const menuItems: MenuProps["items"] = [
          { key: "edit", icon: <Edit size={14} />, label: "编辑", onClick: () => handleEdit(record) },
          { key: "delete", icon: <Trash2 size={14} />, label: "删除", danger: true, onClick: () => handleDelete(record.id) },
        ];
        return (
          <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
            <Button type="text" icon={<MoreHorizontal size={14} />} />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <PageLayout title="服务授权">
      {/* 面包屑 */}
      <PageBreadcrumb items={BREADCRUMB_ITEMS} />

      {/* 主体布局 */}
      <div style={{ display: "flex", gap: 16 }}>
        {/* 左侧分类树 */}
        <DirectoryTree
          treeData={mockAuthorizationCategories}
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
              <Input
                placeholder="搜索申请标题、服务名称、联系人..."
                prefix={<Search size={14} />}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                style={{ width: 400 }}
                allowClear
              />
              <Button type="primary" icon={<Plus size={14} />} onClick={handleCreate}>
                新增授权
              </Button>
            </div>
          </Card>

          {/* 授权列表 */}
          <Card>
            <Table
              dataSource={filteredAuthorizations}
              columns={columns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              scroll={{ x: 1200 }}
            />
          </Card>
        </div>
      </div>

      {/* 新增/编辑授权弹窗 */}
      <Modal
        title={editingAuth ? "编辑授权" : "新增授权"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="serviceName" label="关联服务" rules={[{ required: true, message: "请选择服务" }]}>
            <Select
              placeholder="选择已发布服务"
              options={mockServiceList
                .filter((s) => s.status === "published")
                .map((s) => ({ value: s.name, label: s.name }))}
            />
          </Form.Item>

          <Form.Item name="title" label="申请标题" rules={[{ required: true }]}>
            <Input placeholder="申请标题" />
          </Form.Item>

          <Form.Item name="applicantUnit" label="申请方单位" rules={[{ required: true }]}>
            <TreeSelect
              treeData={[
                { value: "data-bureau", title: "数据管理局" },
                { value: "big-data-center", title: "大数据中心" },
                { value: "info-center", title: "信息中心" },
              ]}
              placeholder="选择单位"
            />
          </Form.Item>

          <div style={{ display: "flex", gap: 16 }}>
            <Form.Item name="contact" label="联系人姓名" rules={[{ required: true }]} style={{ flex: 1 }}>
              <Input placeholder="联系人姓名" prefix={<User size={14} />} />
            </Form.Item>

            <Form.Item name="phone" label="联系人电话" rules={[{ required: true }]} style={{ flex: 1 }}>
              <Input placeholder="联系人电话" />
            </Form.Item>
          </div>

          <div style={{ display: "flex", gap: 16 }}>
            <Form.Item name="rateLimit" label="频率限制 (次/分钟)" style={{ flex: 1 }}>
              <InputNumber min={0} style={{ width: "100%" }} placeholder="0 表示不限制" />
            </Form.Item>

            <Form.Item name="dailyLimit" label="单日限制 (次/日)" style={{ flex: 1 }}>
              <InputNumber min={0} style={{ width: "100%" }} placeholder="0 表示不限制" />
            </Form.Item>
          </div>

          <Form.Item name="expireTime" label="授权到期时间" rules={[{ required: true }]}>
            <DatePicker style={{ width: "100%" }} placeholder="选择到期时间" />
          </Form.Item>

          <Form.Item name="status" label="状态" initialValue="active">
            <Select
              options={[
                { value: "active", label: "生效" },
                { value: "expired", label: "失效" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </PageLayout>
  );
}