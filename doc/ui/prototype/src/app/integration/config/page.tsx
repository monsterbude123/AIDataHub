"use client";

/**
 * 数据源配置页 - 分步表单
 * 页面路径: /integration/config
 */

import { useState } from "react";
import { Card, Steps, Button, Form, Input, Select, InputNumber, Switch, message, Space, TreeSelect } from "antd";
import { Database, Link2, Settings, ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";

import { PageLayout } from "@/components/layout";
import { PageBreadcrumb } from "@/components/ui";
import { ROUTES } from "@/constants";
import { mockDataSourceCategories } from "@/services/mock/data-integration";
import { DATA_SOURCE_TYPE_LABELS, type DataSourceType } from "@/types/data-integration";

/**
 * 面包屑配置
 */
const BREADCRUMB_ITEMS = [
  { title: "数据集成", href: ROUTES.DATA_INTEGRATION },
  { title: "数据源配置" },
];

/**
 * 数据源类型选项
 */
const DATA_SOURCE_OPTIONS = Object.entries(DATA_SOURCE_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

/**
 * 默认端口映射
 */
const DEFAULT_PORTS: Partial<Record<DataSourceType, number>> = {
  mysql: 3306,
  postgresql: 5432,
  oracle: 1521,
  sqlserver: 1433,
  mongodb: 27017,
  redis: 6379,
  elasticsearch: 9200,
  hive: 10000,
};

/**
 * 调度周期选项
 */
const SCHEDULE_OPTIONS = [
  { value: "daily", label: "每日" },
  { value: "weekly", label: "每周" },
  { value: "monthly", label: "每月" },
  { value: "custom", label: "自定义 (Cron)" },
];

/**
 * 步骤配置
 */
const STEPS = [
  { title: "基本信息", icon: <Database size={16} /> },
  { title: "连接配置", icon: <Link2 size={16} /> },
  { title: "元数据采集", icon: <Settings size={16} /> },
];

/**
 * 数据源配置页面组件
 */
export default function DataSourceConfigPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [testing, setTesting] = useState(false);
  const [dataSourceType, setDataSourceType] = useState<DataSourceType>("mysql");

  /**
   * 处理数据源类型变化
   */
  const handleTypeChange = (type: DataSourceType) => {
    setDataSourceType(type);
    // 自动填充默认端口
    const defaultPort = DEFAULT_PORTS[type];
    if (defaultPort) {
      form.setFieldValue(["connectionConfig", "port"], defaultPort);
    }
  };

  /**
   * 处理连接测试
   */
  const handleTestConnection = async () => {
    try {
      await form.validateFields([
        ["connectionConfig", "host"],
        ["connectionConfig", "port"],
        ["connectionConfig", "database"],
        ["connectionConfig", "username"],
        ["connectionConfig", "password"],
      ]);

      setTesting(true);
      message.loading({ content: "正在测试连接...", key: "test" });

      // 模拟测试
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setTesting(false);
      message.success({ content: "连接测试成功!", key: "test", icon: <CheckCircle size={16} /> });
    } catch {
      message.error({ content: "请先完成连接配置", key: "test" });
    }
  };

  /**
   * 下一步
   */
  const handleNext = async () => {
    try {
      if (currentStep === 0) {
        await form.validateFields(["name", "type", "categoryId"]);
      } else if (currentStep === 1) {
        await form.validateFields([
          ["connectionConfig", "host"],
          ["connectionConfig", "port"],
          ["connectionConfig", "database"],
          ["connectionConfig", "username"],
          ["connectionConfig", "password"],
        ]);
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
   * 完成提交
   */
  const handleFinish = async () => {
    try {
      const values = await form.validateFields();
      console.log("提交数据:", values);
      message.success("数据源配置保存成功!");
      // 返回列表页
      window.location.href = ROUTES.DATA_SOURCES;
    } catch {
      message.error("请完成所有必填项");
    }
  };

  /**
   * 渲染步骤1: 基本信息
   */
  const renderStep1 = () => (
    <div style={{ maxWidth: 600 }}>
      <Form.Item
        name="name"
        label="数据源名称"
        rules={[{ required: true, message: "请输入数据源名称" }]}
      >
        <Input placeholder="请输入数据源名称" />
      </Form.Item>

      <Form.Item
        name="type"
        label="数据源类型"
        rules={[{ required: true, message: "请选择数据源类型" }]}
      >
        <Select
          options={DATA_SOURCE_OPTIONS}
          placeholder="请选择数据源类型"
          onChange={handleTypeChange}
        />
      </Form.Item>

      <Form.Item
        name="categoryId"
        label="所属分类"
        rules={[{ required: true, message: "请选择所属分类" }]}
      >
        <TreeSelect
          treeData={mockDataSourceCategories.filter((cat) => cat.children).flatMap((cat) =>
            cat.children!.map((child) => ({
              value: child.id,
              title: `${cat.name} / ${child.name}`,
            }))
          )}
          placeholder="请选择所属分类"
          treeDefaultExpandAll
        />
      </Form.Item>

      <Form.Item name="description" label="描述">
        <Input.TextArea rows={3} placeholder="请输入描述信息" />
      </Form.Item>
    </div>
  );

  /**
   * 渲染步骤2: 连接配置
   */
  const renderStep2 = () => (
    <div style={{ maxWidth: 600 }}>
      <Form.Item
        name={["connectionConfig", "host"]}
        label="主机地址"
        rules={[{ required: true, message: "请输入主机地址" }]}
      >
        <Input placeholder="例如: 192.168.1.100" />
      </Form.Item>

      <Form.Item
        name={["connectionConfig", "port"]}
        label="端口"
        rules={[{ required: true, message: "请输入端口" }]}
      >
        <InputNumber min={1} max={65535} style={{ width: "100%" }} placeholder="端口号" />
      </Form.Item>

      <Form.Item
        name={["connectionConfig", "database"]}
        label="数据库名称"
        rules={[{ required: true, message: "请输入数据库名称" }]}
      >
        <Input placeholder="请输入数据库名称" />
      </Form.Item>

      <Form.Item
        name={["connectionConfig", "username"]}
        label="用户名"
        rules={[{ required: true, message: "请输入用户名" }]}
      >
        <Input placeholder="请输入用户名" />
      </Form.Item>

      <Form.Item
        name={["connectionConfig", "password"]}
        label="密码"
        rules={[{ required: true, message: "请输入密码" }]}
      >
        <Input.Password placeholder="请输入密码" />
      </Form.Item>

      <Form.Item name={["connectionConfig", "extraParams"]} label="JDBC 额外参数">
        <Input.TextArea rows={2} placeholder="可选的额外连接参数" />
      </Form.Item>

      <Button
        type="default"
        onClick={handleTestConnection}
        loading={testing}
        style={{ marginTop: 16 }}
      >
        测试连接
      </Button>
    </div>
  );

  /**
   * 渲染步骤3: 元数据采集配置
   */
  const renderStep3 = () => (
    <div style={{ maxWidth: 600 }}>
      <Form.Item name="accessStrategy" label="接入策略" initialValue="once">
        <Select
          options={[
            { value: "once", label: "一次性接入" },
            { value: "periodic", label: "周期性接入" },
          ]}
        />
      </Form.Item>

      <Form.Item name="schedulePeriod" label="调度周期">
        <Select options={SCHEDULE_OPTIONS} placeholder="请选择调度周期" />
      </Form.Item>

      <Form.Item name="updateStrategy" label="数据更新策略" initialValue="full">
        <Select
          options={[
            { value: "full", label: "全量覆盖" },
            { value: "incremental", label: "增量追加" },
          ]}
        />
      </Form.Item>

      <Form.Item
        name="collectMetadata"
        label="采集元数据"
        valuePropName="checked"
        initialValue={true}
      >
        <Switch checkedChildren="开启" unCheckedChildren="关闭" />
      </Form.Item>
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
    <PageLayout title="数据源配置">
      {/* 面包屑 */}
      <PageBreadcrumb items={BREADCRUMB_ITEMS} />

      {/* 分步表单卡片 */}
      <Card>
        {/* 步骤条 */}
        <Steps
          current={currentStep}
          items={STEPS}
          style={{ marginBottom: 32 }}
        />

        {/* 表单内容 */}
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            type: "mysql",
            accessStrategy: "once",
            updateStrategy: "full",
            collectMetadata: true,
          }}
        >
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
            <Button type="primary" onClick={handleFinish}>
              完成保存
            </Button>
          )}

          <Button onClick={() => window.location.href = ROUTES.DATA_SOURCES}>
            取消
          </Button>
        </Space>
      </Card>
    </PageLayout>
  );
}