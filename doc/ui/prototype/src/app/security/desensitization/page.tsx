"use client";

/**
 * 数据脱敏配置页
 * 页面路径: /security/desensitization
 */

import { useState } from "react";
import { Card, Table, Button, Input, Select, Space, Tag, Modal, Form, message, Tabs, Transfer, Switch, InputNumber } from "antd";
import { Plus, Search, Edit, Trash2, Play, Eye, TestTube, Shield, Code, FileText, Settings } from "lucide-react";

import { PageLayout } from "@/components/layout";
import { PageBreadcrumb, StatusBadge } from "@/components/ui";
import { ROUTES } from "@/constants";

/**
 * 面包屑配置
 */
const BREADCRUMB_ITEMS = [
  { title: "数据安全", href: ROUTES.SECURITY },
  { title: "数据脱敏" },
];

/**
 * Mock 脱敏算法列表
 */
const mockAlgorithms = [
  { id: "algo-001", name: "Hash脱敏", type: "preset", description: "使用Hash算法不可逆脱敏" },
  { id: "algo-002", name: "手机号脱敏", type: "preset", description: "保留前3后4，中间打*" },
  { id: "algo-003", name: "身份证脱敏", type: "preset", description: "保留前6后4，中间打*" },
  { id: "algo-004", name: "邮箱脱敏", type: "preset", description: "用户名保留1位，域名保留" },
  { id: "algo-005", name: "姓名脱敏", type: "preset", description: "保留姓，名用*代替" },
  { id: "algo-006", name: "自定义脱敏", type: "custom", description: "用户上传JAR包实现" },
];

/**
 * Mock 脱敏规则列表
 */
const mockRules = [
  { id: "rule-001", name: "身份证号脱敏", algorithm: "身份证脱敏", description: "18位身份证号脱敏", status: "active" },
  { id: "rule-002", name: "手机号脱敏", algorithm: "手机号脱敏", description: "11位手机号脱敏", status: "active" },
  { id: "rule-003", name: "邮箱脱敏", algorithm: "邮箱脱敏", description: "邮箱地址脱敏", status: "active" },
  { id: "rule-004", name: "姓名脱敏", algorithm: "姓名脱敏", description: "中文姓名脱敏", status: "inactive" },
];

/**
 * Mock 脱敏任务列表
 */
const mockTasks = [
  { id: "task-001", name: "客户数据脱敏", source: "customer_info", configCount: 5, output: "customer_masked", schedule: "每日 02:00", status: "success" },
  { id: "task-002", name: "订单数据脱敏", source: "order_detail", configCount: 3, output: "order_masked", schedule: "每周日 03:00", status: "running" },
  { id: "task-003", name: "用户行为数据脱敏", source: "user_behavior", configCount: 2, output: "behavior_masked", schedule: "手动执行", status: "failed" },
];

/**
 * 数据脱敏配置页面组件
 */
export default function DesensitizationPage() {
  const [activeTab, setActiveTab] = useState("algorithm");
  const [modalOpen, setModalOpen] = useState(false);
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [form] = Form.useForm();

  /**
   * 算法表格列
   */
  const algorithmColumns = [
    { title: "算法名称", dataIndex: "name", key: "name", width: 150 },
    {
      title: "类型",
      dataIndex: "type",
      key: "type",
      width: 100,
      render: (type: string) => (
        <Tag color={type === "preset" ? "blue" : "green"}>
          {type === "preset" ? "预置" : "自定义"}
        </Tag>
      ),
    },
    { title: "描述", dataIndex: "description", key: "description" },
    {
      title: "操作",
      key: "actions",
      width: 100,
      render: () => (
        <Space>
          <Button type="link" size="small">查看</Button>
          <Button type="link" size="small" onClick={() => setTestModalOpen(true)}>测试</Button>
        </Space>
      ),
    },
  ];

  /**
   * 规则表格列
   */
  const ruleColumns = [
    { title: "规则名称", dataIndex: "name", key: "name", width: 150 },
    { title: "算法", dataIndex: "algorithm", key: "algorithm", width: 120 },
    { title: "描述", dataIndex: "description", key: "description" },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 80,
      render: (status: string) => (
        <Tag color={status === "active" ? "green" : "default"}>
          {status === "active" ? "启用" : "禁用"}
        </Tag>
      ),
    },
    {
      title: "操作",
      key: "actions",
      width: 150,
      render: () => (
        <Space>
          <Button type="link" size="small" onClick={() => setModalOpen(true)}>编辑</Button>
          <Button type="link" size="small" onClick={() => setTestModalOpen(true)}>测试</Button>
        </Space>
      ),
    },
  ];

  /**
   * 任务表格列
   */
  const taskColumns = [
    { title: "任务名称", dataIndex: "name", key: "name", width: 150 },
    { title: "数据源", dataIndex: "source", key: "source", width: 120 },
    { title: "脱敏字段数", dataIndex: "configCount", key: "configCount", width: 100 },
    { title: "输出目标", dataIndex: "output", key: "output", width: 120 },
    { title: "调度周期", dataIndex: "schedule", key: "schedule", width: 120 },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 80,
      render: (status: string) => <StatusBadge status={status as "success" | "running" | "failed"} />,
    },
    {
      title: "操作",
      key: "actions",
      width: 180,
      render: () => (
        <Space>
          <Button type="link" size="small" icon={<Play size={12} />}>执行</Button>
          <Button type="link" size="small">编辑</Button>
          <Button type="link" size="small">日志</Button>
        </Space>
      ),
    },
  ];

  return (
    <PageLayout title="数据脱敏">
      {/* 面包屑 */}
      <PageBreadcrumb items={BREADCRUMB_ITEMS} />

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: "algorithm",
            label: (
              <span>
                <Code size={14} style={{ marginRight: 4 }} />
                算法管理
              </span>
            ),
            children: (
              <Card>
                <div style={{ marginBottom: 16 }}>
                  <Button type="primary" icon={<Plus size={14} />}>
                    上传自定义算法
                  </Button>
                </div>
                <Table
                  dataSource={mockAlgorithms}
                  columns={algorithmColumns}
                  rowKey="id"
                  pagination={false}
                />
              </Card>
            ),
          },
          {
            key: "rule",
            label: (
              <span>
                <Shield size={14} style={{ marginRight: 4 }} />
                规则管理
              </span>
            ),
            children: (
              <Card>
                <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
                  <Input.Search placeholder="搜索规则..." style={{ width: 250 }} />
                  <Button type="primary" icon={<Plus size={14} />} onClick={() => setModalOpen(true)}>
                    新增规则
                  </Button>
                </div>
                <Table
                  dataSource={mockRules}
                  columns={ruleColumns}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              </Card>
            ),
          },
          {
            key: "task",
            label: (
              <span>
                <FileText size={14} style={{ marginRight: 4 }} />
                任务配置
              </span>
            ),
            children: (
              <Card>
                <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
                  <Space>
                    <Input.Search placeholder="搜索任务..." style={{ width: 250 }} />
                    <Select placeholder="状态筛选" style={{ width: 120 }} allowClear />
                  </Space>
                  <Button type="primary" icon={<Plus size={14} />}>
                    新增任务
                  </Button>
                </div>
                <Table
                  dataSource={mockTasks}
                  columns={taskColumns}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              </Card>
            ),
          },
        ]}
      />

      {/* 规则编辑弹窗 */}
      <Modal
        title="编辑脱敏规则"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => {
          message.success("保存成功");
          setModalOpen(false);
        }}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="规则名称" rules={[{ required: true }]}>
            <Input placeholder="请输入规则名称" />
          </Form.Item>
          <Form.Item name="algorithm" label="选择算法" rules={[{ required: true }]}>
            <Select
              options={mockAlgorithms.map((a) => ({ value: a.name, label: a.name }))}
              placeholder="选择脱敏算法"
            />
          </Form.Item>
          <Form.Item name="prefixKeep" label="保留前N位">
            <InputNumber min={0} max={20} defaultValue={3} />
          </Form.Item>
          <Form.Item name="suffixKeep" label="保留后M位">
            <InputNumber min={0} max={20} defaultValue={4} />
          </Form.Item>
          <Form.Item name="maskChar" label="遮蔽字符">
            <Input defaultValue="*" style={{ width: 80 }} />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="规则描述" />
          </Form.Item>
          <Form.Item name="status" label="状态" valuePropName="checked" initialValue={true}>
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 测试弹窗 */}
      <Modal
        title="测试脱敏效果"
        open={testModalOpen}
        onCancel={() => setTestModalOpen(false)}
        footer={null}
        width={500}
      >
        <Form layout="vertical">
          <Form.Item label="原始数据">
            <Input placeholder="输入测试数据，例如: 13800138000" defaultValue="13800138000" />
          </Form.Item>
          <Form.Item label="选择规则">
            <Select
              options={mockRules.map((r) => ({ value: r.name, label: r.name }))}
              defaultValue="手机号脱敏"
            />
          </Form.Item>
          <Button type="primary" icon={<TestTube size={14} />} block>
            测试脱敏
          </Button>
          <Form.Item label="脱敏结果" style={{ marginTop: 16 }}>
            <Input value="138****8000" readOnly style={{ background: "#F5F5F5" }} />
          </Form.Item>
        </Form>
      </Modal>
    </PageLayout>
  );
}