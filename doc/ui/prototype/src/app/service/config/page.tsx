"use client";

/**
 * 数据服务配置页 - 分步表单
 * 页面路径: /service/config
 */

import { useState } from "react";
import { Card, Steps, Button, Form, Input, Select, Switch, InputNumber, Table, Space, message, Modal, DatePicker, Radio, Checkbox, Tag } from "antd";
import { Database, Filter, FileText, Play, Save, Rocket, ArrowLeft, ArrowRight, Plus, Minus, Eye } from "lucide-react";

import { PageLayout } from "@/components/layout";
import { PageBreadcrumb } from "@/components/ui";
import { ROUTES } from "@/constants";
import { SERVICE_TYPE_LABELS, type ServiceType } from "@/types/data-service";

/**
 * 面包屑配置
 */
const BREADCRUMB_ITEMS = [
  { title: "数据服务", href: ROUTES.DATA_SERVICE },
  { title: "服务配置" },
];

/**
 * 步骤配置
 */
const STEPS = [
  { title: "基本信息", icon: <Database size={16} /> },
  { title: "查询条件", icon: <Filter size={16} /> },
  { title: "响应字段", icon: <FileText size={16} /> },
];

/**
 * 数据服务配置页面组件
 */
export default function ServiceConfigPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [serviceType, setServiceType] = useState<ServiceType>("query");
  const [queryParams, setQueryParams] = useState<{ id: string; name: string; displayName: string; type: string; required: boolean; defaultValue: string }[]>([
    { id: "q1", name: "customer_id", displayName: "客户ID", type: "string", required: true, defaultValue: "" },
  ]);
  const [responseFields, setResponseFields] = useState<{ id: string; name: string; displayName: string; dictionary: string }[]>([
    { id: "r1", name: "id", displayName: "主键", dictionary: "" },
    { id: "r2", name: "name", displayName: "姓名", dictionary: "" },
  ]);
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testResult, setTestResult] = useState<string>("");

  /**
   * 处理服务类型变化
   */
  const handleTypeChange = (type: ServiceType) => {
    setServiceType(type);
  };

  /**
   * 下一步
   */
  const handleNext = async () => {
    try {
      if (currentStep === 0) {
        await form.validateFields(["name", "type", "description"]);
      }
      setCurrentStep(currentStep + 1);
    } catch {
      message.error("请完成必填项");
    }
  };

  /**
   * 上一步
   */
  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  /**
   * 处理测试服务
   */
  const handleTestService = () => {
    setTestModalOpen(true);
    // 模拟测试结果
    setTestResult(JSON.stringify({
      success: true,
      data: [
        { id: "1001", name: "张三", email: "zhangsan@example.com", phone: "13800138001" },
        { id: "1002", name: "李四", email: "lisi@example.com", phone: "13900139002" },
      ],
      total: 2,
    }, null, 2));
  };

  /**
   * 处理执行测试
   */
  const handleExecuteTest = () => {
    message.loading({ content: "测试执行中...", key: "test" });
    setTimeout(() => {
      message.success({ content: "测试执行成功!", key: "test" });
    }, 1000);
  };

  /**
   * 处理保存草稿
   */
  const handleSaveDraft = () => {
    message.success("草稿保存成功!");
  };

  /**
   * 处理发布服务
   */
  const handlePublish = async () => {
    try {
      await form.validateFields();
      message.success("服务发布成功!");
      window.location.href = ROUTES.SERVICE_CATALOG;
    } catch {
      message.error("请完成所有必填项");
    }
  };

  /**
   * 添加查询参数
   */
  const addQueryParam = () => {
    setQueryParams((prev) => [
      ...prev,
      { id: `q${prev.length + 1}`, name: "", displayName: "", type: "string", required: false, defaultValue: "" },
    ]);
  };

  /**
   * 删除查询参数
   */
  const removeQueryParam = (id: string) => {
    setQueryParams((prev) => prev.filter((p) => p.id !== id));
  };

  /**
   * 添加响应字段
   */
  const addResponseField = () => {
    setResponseFields((prev) => [
      ...prev,
      { id: `r${prev.length + 1}`, name: "", displayName: "", dictionary: "" },
    ]);
  };

  /**
   * 删除响应字段
   */
  const removeResponseField = (id: string) => {
    setResponseFields((prev) => prev.filter((f) => f.id !== id));
  };

  /**
   * 渲染步骤1: 基本信息
   */
  const renderStep1 = () => (
    <div style={{ maxWidth: 600 }}>
      <Form.Item name="name" label="服务名称" rules={[{ required: true, message: "请输入服务名称" }]}>
        <Input placeholder="请输入服务名称" />
      </Form.Item>

      <Form.Item name="description" label="服务描述">
        <Input.TextArea rows={3} placeholder="请输入服务描述" />
      </Form.Item>

      <Form.Item name="type" label="服务类型" rules={[{ required: true }]} initialValue="query">
        <Radio.Group onChange={(e) => handleTypeChange(e.target.value)}>
          {Object.entries(SERVICE_TYPE_LABELS).map(([value, label]) => (
            <Radio key={value} value={value}>
              {label}
            </Radio>
          ))}
        </Radio.Group>
      </Form.Item>

      <Form.Item name="resourceType" label="基于资源" initialValue="existing">
        <Radio.Group>
          <Radio value="existing">已有数据资源</Radio>
          <Radio value="custom">自定义SQL</Radio>
        </Radio.Group>
      </Form.Item>

      {serviceType === "download" && (
        <Card title="数据下载配置" size="small" style={{ marginTop: 16 }}>
          <Form.Item name="outputFormat" label="输出格式" initialValue="csv">
            <Select options={[{ value: "csv", label: "CSV" }, { value: "excel", label: "Excel" }]} />
          </Form.Item>
          <Form.Item name="compress" label="压缩" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="encrypt" label="加密" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="shardSize" label="分片大小 (MB)">
            <InputNumber min={1} max={1000} defaultValue={10} />
          </Form.Item>
          <Form.Item name="resume" label="断点续传" valuePropName="checked" initialValue={true}>
            <Switch checkedChildren="开启" unCheckedChildren="关闭" />
          </Form.Item>
        </Card>
      )}
    </div>
  );

  /**
   * 渲染步骤2: 查询条件配置
   */
  const renderStep2 = () => (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button icon={<Plus size={14} />} onClick={addQueryParam}>
          添加参数
        </Button>
      </div>

      <Table
        dataSource={queryParams}
        columns={[
          { title: "序号", key: "index", width: 60, render: (_: unknown, __: unknown, index: number) => index + 1 },
          {
            title: "参数名",
            dataIndex: "name",
            key: "name",
            width: 150,
            render: (value: string, record: { id: string }) => (
              <Input value={value} onChange={(e) => setQueryParams((prev) => prev.map((p) => p.id === record.id ? { ...p, name: e.target.value } : p))} size="small" />
            ),
          },
          {
            title: "显示名称",
            dataIndex: "displayName",
            key: "displayName",
            width: 150,
            render: (value: string, record: { id: string }) => (
              <Input value={value} onChange={(e) => setQueryParams((prev) => prev.map((p) => p.id === record.id ? { ...p, displayName: e.target.value } : p))} size="small" />
            ),
          },
          {
            title: "类型",
            dataIndex: "type",
            key: "type",
            width: 100,
            render: (value: string, record: { id: string }) => (
              <Select
                value={value}
                options={[{ value: "string", label: "字符串" }, { value: "number", label: "数字" }, { value: "date", label: "日期" }]}
                size="small"
                onChange={(v) => setQueryParams((prev) => prev.map((p) => p.id === record.id ? { ...p, type: v } : p))}
              />
            ),
          },
          {
            title: "必填",
            dataIndex: "required",
            key: "required",
            width: 80,
            render: (value: boolean, record: { id: string }) => (
              <Checkbox checked={value} onChange={(e) => setQueryParams((prev) => prev.map((p) => p.id === record.id ? { ...p, required: e.target.checked } : p))} />
            ),
          },
          {
            title: "默认值",
            dataIndex: "defaultValue",
            key: "defaultValue",
            width: 150,
            render: (value: string, record: { id: string }) => (
              <Input value={value} onChange={(e) => setQueryParams((prev) => prev.map((p) => p.id === record.id ? { ...p, defaultValue: e.target.value } : p))} size="small" />
            ),
          },
          {
            title: "操作",
            key: "actions",
            width: 80,
            render: (_: unknown, record: { id: string }) => (
              <Button type="text" icon={<Minus size={14} />} onClick={() => removeQueryParam(record.id)} danger />
            ),
          },
        ]}
        rowKey="id"
        pagination={false}
        size="small"
      />
    </div>
  );

  /**
   * 渲染步骤3: 响应字段配置
   */
  const renderStep3 = () => (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button icon={<Plus size={14} />} onClick={addResponseField}>
          添加字段
        </Button>
      </div>

      <Table
        dataSource={responseFields}
        columns={[
          { title: "序号", key: "index", width: 60, render: (_: unknown, __: unknown, index: number) => index + 1 },
          {
            title: "字段名",
            dataIndex: "name",
            key: "name",
            width: 150,
            render: (value: string, record: { id: string }) => (
              <Input value={value} onChange={(e) => setResponseFields((prev) => prev.map((f) => f.id === record.id ? { ...f, name: e.target.value } : f))} size="small" />
            ),
          },
          {
            title: "显示名称",
            dataIndex: "displayName",
            key: "displayName",
            width: 150,
            render: (value: string, record: { id: string }) => (
              <Input value={value} onChange={(e) => setResponseFields((prev) => prev.map((f) => f.id === record.id ? { ...f, displayName: e.target.value } : f))} size="small" />
            ),
          },
          {
            title: "字典翻译",
            dataIndex: "dictionary",
            key: "dictionary",
            width: 150,
            render: (value: string, record: { id: string }) => (
              <Select
                value={value}
                placeholder="选择字典"
                allowClear
                options={[
                  { value: "status_dict", label: "状态字典" },
                  { value: "gender_dict", label: "性别字典" },
                  { value: "type_dict", label: "类型字典" },
                ]}
                size="small"
                onChange={(v) => setResponseFields((prev) => prev.map((f) => f.id === record.id ? { ...f, dictionary: v ?? "" } : f))}
              />
            ),
          },
          {
            title: "操作",
            key: "actions",
            width: 80,
            render: (_: unknown, record: { id: string }) => (
              <Button type="text" icon={<Minus size={14} />} onClick={() => removeResponseField(record.id)} danger />
            ),
          },
        ]}
        rowKey="id"
        pagination={false}
        size="small"
      />
    </div>
  );

  /**
   * 渲染当前步骤内容
   */
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderStep1();
      case 1:
        return renderStep2();
      case 2:
        return renderStep3();
      default:
        return null;
    }
  };

  return (
    <PageLayout title="服务配置">
      {/* 面包屑 */}
      <PageBreadcrumb items={BREADCRUMB_ITEMS} />

      {/* 分步表单卡片 */}
      <Card>
        {/* 步骤条 */}
        <Steps current={currentStep} items={STEPS} style={{ marginBottom: 32 }} />

        {/* 表单内容 */}
        <Form form={form} layout="vertical">
          {renderStepContent()}
        </Form>

        {/* 底部操作按钮 */}
        <Space style={{ marginTop: 24 }}>
          {currentStep > 0 && (
            <Button icon={<ArrowLeft size={14} />} onClick={handlePrev}>
              上一步
            </Button>
          )}

          {currentStep < 2 && (
            <Button type="primary" icon={<ArrowRight size={14} />} onClick={handleNext}>
              下一步
            </Button>
          )}

          {currentStep === 2 && (
            <>
              <Button icon={<Play size={14} />} onClick={handleTestService}>
                测试服务
              </Button>
              <Button icon={<Save size={14} />} onClick={handleSaveDraft}>
                保存草稿
              </Button>
              <Button type="primary" icon={<Rocket size={14} />} onClick={handlePublish}>
                发布服务
              </Button>
            </>
          )}

          <Button onClick={() => window.location.href = ROUTES.SERVICE_CATALOG}>
            取消
          </Button>
        </Space>
      </Card>

      {/* 测试弹窗 */}
      <Modal
        title="测试服务"
        open={testModalOpen}
        onCancel={() => setTestModalOpen(false)}
        width={700}
        footer={[
          <Button key="close" onClick={() => setTestModalOpen(false)}>
            关闭
          </Button>,
          <Button key="execute" type="primary" onClick={handleExecuteTest}>
            执行测试
          </Button>,
        ]}
      >
        {/* 测试输入参数 */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 500, marginBottom: 8 }}>输入参数</div>
          {queryParams.map((param) => (
            <div key={param.id} style={{ marginBottom: 8 }}>
              <span style={{ marginRight: 8 }}>{param.displayName}:</span>
              <Input style={{ width: 200 }} placeholder={param.name} defaultValue={param.defaultValue} size="small" />
              {param.required && <Tag color="red" style={{ marginLeft: 8 }}>必填</Tag>}
            </div>
          ))}
        </div>

        {/* 测试结果 */}
        <div>
          <div style={{ fontWeight: 500, marginBottom: 8 }}>返回结果</div>
          <pre style={{ background: "#F5F5F5", padding: 16, borderRadius: 4, maxHeight: 300, overflow: "auto" }}>
            {testResult}
          </pre>
        </div>
      </Modal>
    </PageLayout>
  );
}