"use client";

/**
 * 数据水印配置页
 * 页面路径: /security/watermark
 */

import { useState } from "react";
import { Card, Table, Button, Input, Select, Space, Tag, Modal, Form, message, Radio, InputNumber, Upload, Descriptions, Progress, Tabs } from "antd";
import { Plus, Search, Edit, Trash2, Play, Upload as UploadIcon, Database, Shield, CheckCircle, AlertTriangle } from "lucide-react";

import { PageLayout } from "@/components/layout";
import { PageBreadcrumb, StatusBadge } from "@/components/ui";
import { ROUTES } from "@/constants";

/**
 * 面包屑配置
 */
const BREADCRUMB_ITEMS = [
  { title: "数据安全", href: ROUTES.SECURITY },
  { title: "数据水印" },
];

/**
 * Mock 水印任务列表
 */
const mockWatermarkTasks = [
  { id: "wm-001", name: "客户数据水印", source: "customer_info", type: "hidden", output: "customer_watermarked", status: "success" },
  { id: "wm-002", name: "订单数据水印", source: "order_detail", type: "fake_row", output: "order_watermarked", status: "success" },
  { id: "wm-003", name: "产品数据水印", source: "product_catalog", type: "fake_column", output: "product_watermarked", status: "running" },
  { id: "wm-004", name: "交易数据水印", source: "transaction_log", type: "hidden", output: "transaction_watermarked", status: "failed" },
];

/**
 * 水印类型标签
 */
const WATERMARK_TYPE_LABELS: Record<string, string> = {
  hidden: "隐藏水印",
  fake_row: "伪行水印",
  fake_column: "伪列水印",
};

/**
 * 数据水印配置页面组件
 */
export default function WatermarkPage() {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [traceModalOpen, setTraceModalOpen] = useState(false);
  const [traceResult, setTraceResult] = useState<typeof traceResultData | null>(null);
  const [form] = Form.useForm();

  /**
   * 过滤后的任务列表
   */
  const filteredTasks = mockWatermarkTasks.filter((task) => {
    if (statusFilter !== "all" && task.status !== statusFilter) return false;
    if (searchKeyword && !task.name.toLowerCase().includes(searchKeyword.toLowerCase())) return false;
    return true;
  });

  /**
   * 表格列
   */
  const columns = [
    { title: "任务名称", dataIndex: "name", key: "name", width: 150 },
    { title: "数据源", dataIndex: "source", key: "source", width: 120 },
    {
      title: "水印类型",
      dataIndex: "type",
      key: "type",
      width: 100,
      render: (type: string) => <Tag color="blue">{WATERMARK_TYPE_LABELS[type]}</Tag>,
    },
    { title: "输出目标", dataIndex: "output", key: "output", width: 150 },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 80,
      render: (status: string) => (
        <Tag color={status === "success" ? "success" : status === "running" ? "processing" : "error"}>
          {status === "success" ? "成功" : status === "running" ? "运行中" : "失败"}
        </Tag>
      ),
    },
    {
      title: "操作",
      key: "actions",
      width: 200,
      render: () => (
        <Space>
          <Button type="link" size="small">编辑</Button>
          <Button type="link" size="small" onClick={() => setTraceModalOpen(true)}>
            溯源测试
          </Button>
          <Button type="link" size="small" icon={<Play size={12} />}>执行</Button>
          <Button type="link" size="small" danger>删除</Button>
        </Space>
      ),
    },
  ];

  /**
   * 处理溯源
   */
  const handleTrace = () => {
    setTraceResult(traceResultData);
  };

  /**
   * 溯源结果数据
   */
  const traceResultData = {
    found: true,
    confidence: 95,
    recipient: "大数据中心",
    taskId: "wm-001",
    createTime: "2024-01-15 10:00:00",
  };

  return (
    <PageLayout title="数据水印">
      {/* 面包屑 */}
      <PageBreadcrumb items={BREADCRUMB_ITEMS} />

      {/* 工具栏 */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Space>
            <Input
              placeholder="搜索任务名称..."
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
                { value: "success", label: "成功" },
                { value: "running", label: "运行中" },
                { value: "failed", label: "失败" },
              ]}
              style={{ width: 120 }}
            />
          </Space>
          <Space>
            <Button icon={<Shield size={14} />} onClick={() => setTraceModalOpen(true)}>
              水印溯源
            </Button>
            <Button type="primary" icon={<Plus size={14} />} onClick={() => setCreateModalOpen(true)}>
              新增水印任务
            </Button>
          </Space>
        </div>
      </Card>

      {/* 任务列表 */}
      <Card>
        <Table
          dataSource={filteredTasks}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* 新增水印任务弹窗 */}
      <Modal
        title="新增水印任务"
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        onOk={() => {
          message.success("水印任务创建成功");
          setCreateModalOpen(false);
        }}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="任务名称" rules={[{ required: true }]}>
            <Input placeholder="请输入任务名称" />
          </Form.Item>
          <Form.Item name="sourceTable" label="数据源表" rules={[{ required: true }]}>
            <Select
              placeholder="选择源数据表"
              options={[
                { value: "customer_info", label: "customer_info (客户表)" },
                { value: "order_detail", label: "order_detail (订单表)" },
              ]}
            />
          </Form.Item>
          <Form.Item name="watermarkType" label="水印类型" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value="hidden">隐藏水印</Radio>
              <Radio value="fake_row">伪行水印</Radio>
              <Radio value="fake_column">伪列水印</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item name="watermarkInfo" label="水印信息" rules={[{ required: true }]}>
            <Input placeholder="接收单位信息，如: 大数据中心" />
          </Form.Item>
          <Form.Item name="density" label="水印密度 (%)">
            <InputNumber min={1} max={100} defaultValue={10} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="outputTable" label="输出目标表" rules={[{ required: true }]}>
            <Input placeholder="输出表名称" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 水印溯源弹窗 */}
      <Modal
        title="水印溯源"
        open={traceModalOpen}
        onCancel={() => {
          setTraceModalOpen(false);
          setTraceResult(null);
        }}
        footer={null}
        width={700}
      >
        <Tabs
          items={[
            {
              key: "upload",
              label: "上传文件",
              children: (
                <div>
                  <Upload.Dragger accept=".csv,.xlsx">
                    <p className="ant-upload-drag-icon">
                      <UploadIcon size={48} />
                    </p>
                    <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
                    <p className="ant-upload-hint">支持 CSV、Excel 文件</p>
                  </Upload.Dragger>
                  <Button
                    type="primary"
                    block
                    style={{ marginTop: 16 }}
                    onClick={handleTrace}
                  >
                    解析水印
                  </Button>
                </div>
              ),
            },
            {
              key: "database",
              label: "指定数据库表",
              children: (
                <div>
                  <Form layout="vertical">
                    <Form.Item label="数据源">
                      <Select placeholder="选择数据源" options={[{ value: "hive", label: "Hive-数仓" }]} />
                    </Form.Item>
                    <Form.Item label="数据库">
                      <Select placeholder="选择数据库" options={[{ value: "dw", label: "dw" }]} />
                    </Form.Item>
                    <Form.Item label="表名">
                      <Input placeholder="输入表名" />
                    </Form.Item>
                  </Form>
                  <Button type="primary" block onClick={handleTrace}>
                    解析水印
                  </Button>
                </div>
              ),
            },
          ]}
        />

        {/* 溯源结果 */}
        {traceResult && (
          <Card style={{ marginTop: 16 }} title="溯源结果">
            <div style={{ marginBottom: 16, textAlign: "center" }}>
              <Progress
                type="circle"
                percent={traceResult.confidence}
                format={(percent) => (
                  <span>
                    <CheckCircle size={24} style={{ color: "#10B981" }} />
                    <br />
                    置信度 {percent}%
                  </span>
                )}
                strokeColor="#10B981"
              />
            </div>

            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="水印状态">
                <Tag color="green">已找到</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="接收单位">
                <strong>{traceResult.recipient}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="关联任务">{traceResult.taskId}</Descriptions.Item>
              <Descriptions.Item label="嵌入时间">{traceResult.createTime}</Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 16, padding: 12, background: "#FEF3C7", borderRadius: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <AlertTriangle size={16} style={{ color: "#F59E0B" }} />
                <span style={{ color: "#92400E" }}>
                  注意：溯源结果仅供参考，置信度越高表示结果越可靠
                </span>
              </div>
            </div>
          </Card>
        )}
      </Modal>
    </PageLayout>
  );
}