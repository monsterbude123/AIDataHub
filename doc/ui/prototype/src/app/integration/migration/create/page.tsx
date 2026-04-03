"use client";

/**
 * 数据迁移任务配置页
 * 页面路径: /integration/migration/create
 * 使用多步骤表单实现
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  Form,
  Input,
  Select,
  InputNumber,
  Switch,
  Radio,
  Space,
  Button,
  message,
  Divider,
  Typography,
  Alert,
} from "antd";
import {
  Database,
  ArrowRight,
  Settings,
  Clock,
  CheckCircle,
  InfoCircle,
} from "lucide-react";

import { PageLayout } from "@/components/layout";
import {
  PageBreadcrumb,
  MultiStepForm,
  type StepConfig,
} from "@/components/ui";
import { ROUTES } from "@/constants";

const { Text, Title } = Typography;

/**
 * 面包屑配置
 */
const BREADCRUMB_ITEMS = [
  { title: "数据集成", href: "/integration" },
  { title: "数据迁移", href: ROUTES.MIGRATION },
  { title: "新建迁移任务" },
];

/**
 * Mock 数据源列表
 */
const mockDataSources = [
  { id: "ds-001", name: "生产订单数据库", type: "MySQL", status: "connected" },
  { id: "ds-002", name: "CRM系统", type: "Oracle", status: "connected" },
  { id: "ds-003", name: "日志数据库", type: "PostgreSQL", status: "connected" },
  { id: "ds-004", name: "商品数据库", type: "MongoDB", status: "connected" },
];

/**
 * Mock 目标存储列表
 */
const mockTargets = [
  { id: "target-001", name: "数据仓库订单表", type: "Hive" },
  { id: "target-002", name: "客户信息表", type: "HBase" },
  { id: "target-003", name: "日志存储目录", type: "HDFS" },
  { id: "target-004", name: "商品搜索索引", type: "Elasticsearch" },
];

/**
 * 数据迁移配置页组件
 */
export default function MigrationCreatePage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  /**
   * 多步骤配置
   */
  const steps: StepConfig[] = [
    {
      key: "basic",
      title: "基本信息",
      description: "配置任务名称和描述",
      icon: <Database size={16} />,
      fields: [
        {
          name: "taskName",
          label: "任务名称",
          type: "text",
          required: true,
          placeholder: "请输入任务名称",
        },
        {
          name: "description",
          label: "任务描述",
          type: "textarea",
          placeholder: "请输入任务描述（可选）",
        },
        {
          name: "priority",
          label: "优先级",
          type: "select",
          required: true,
          initialValue: "medium",
          options: [
            { value: "high", label: "高" },
            { value: "medium", label: "中" },
            { value: "low", label: "低" },
          ],
        },
      ],
    },
    {
      key: "source",
      title: "数据源配置",
      description: "选择数据源和要迁移的表",
      icon: <Database size={16} />,
      fields: [
        {
          name: "sourceId",
          label: "数据源",
          type: "select",
          required: true,
          placeholder: "请选择数据源",
          options: mockDataSources.map((ds) => ({
            value: ds.id,
            label: `${ds.name} (${ds.type})`,
          })),
        },
        {
          name: "sourceDatabase",
          label: "数据库",
          type: "text",
          required: true,
          placeholder: "请输入数据库名称",
        },
        {
          name: "sourceTable",
          label: "数据表",
          type: "text",
          required: true,
          placeholder: "请输入数据表名称",
        },
        {
          name: "sourceQuery",
          label: "查询条件",
          type: "textarea",
          placeholder: "WHERE 条件（可选）",
        },
      ],
    },
    {
      key: "target",
      title: "目标配置",
      description: "配置目标存储位置",
      icon: <ArrowRight size={16} />,
      fields: [
        {
          name: "targetType",
          label: "目标类型",
          type: "select",
          required: true,
          placeholder: "请选择目标类型",
          options: [
            { value: "Hive", label: "Hive 表" },
            { value: "HBase", label: "HBase 表" },
            { value: "HDFS", label: "HDFS 文件" },
            { value: "Elasticsearch", label: "Elasticsearch 索引" },
          ],
        },
        {
          name: "targetDatabase",
          label: "目标数据库",
          type: "text",
          required: true,
          placeholder: "请输入目标数据库",
        },
        {
          name: "targetTable",
          label: "目标表名",
          type: "text",
          required: true,
          placeholder: "请输入目标表名",
        },
        {
          name: "writeMode",
          label: "写入模式",
          type: "radio",
          required: true,
          initialValue: "append",
          options: [
            { value: "append", label: "追加" },
            { value: "overwrite", label: "覆盖" },
            { value: "update", label: "更新" },
          ],
        },
      ],
    },
    {
      key: "mapping",
      title: "字段映射",
      description: "配置源字段与目标字段的映射关系",
      icon: <Settings size={16} />,
      customRender: (formInstance) => (
        <div>
          <Alert
            message="字段映射配置"
            description="请配置源表字段与目标表字段的映射关系。系统会自动匹配同名字段。"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Form form={formInstance} layout="vertical">
            <Form.Item name="autoMapping" label="自动映射" valuePropName="checked" initialValue={true}>
              <Switch checkedChildren="开启" unCheckedChildren="关闭" />
            </Form.Item>

            <Divider />

            <Title level={5}>字段映射预览</Title>
            <div style={{ background: "#F8FAFC", padding: 16, borderRadius: 8 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 16, alignItems: "center" }}>
                <div>
                  <Text type="secondary">源字段</Text>
                  <div style={{ marginTop: 8 }}>
                    <Text>customer_id (BIGINT)</Text>
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <Text>customer_name (VARCHAR)</Text>
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <Text>email (VARCHAR)</Text>
                  </div>
                </div>

                <div style={{ textAlign: "center" }}>
                  <ArrowRight size={20} color="#2563EB" />
                </div>

                <div>
                  <Text type="secondary">目标字段</Text>
                  <div style={{ marginTop: 8 }}>
                    <Text>id (BIGINT)</Text>
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <Text>name (VARCHAR)</Text>
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <Text>email_address (VARCHAR)</Text>
                  </div>
                </div>
              </div>
            </div>
          </Form>
        </div>
      ),
    },
    {
      key: "schedule",
      title: "调度配置",
      description: "设置任务调度周期",
      icon: <Clock size={16} />,
      fields: [
        {
          name: "scheduleType",
          label: "调度类型",
          type: "select",
          required: true,
          initialValue: "manual",
          options: [
            { value: "manual", label: "手动执行" },
            { value: "daily", label: "每日执行" },
            { value: "weekly", label: "每周执行" },
            { value: "monthly", label: "每月执行" },
            { value: "cron", label: "Cron 表达式" },
          ],
        },
        {
          name: "executeTime",
          label: "执行时间",
          type: "text",
          placeholder: "例如: 02:00",
          componentProps: {
            type: "time",
          },
        },
        {
          name: "retryCount",
          label: "失败重试次数",
          type: "number",
          initialValue: 3,
          componentProps: {
            min: 0,
            max: 10,
          },
        },
        {
          name: "timeout",
          label: "超时时间（分钟）",
          type: "number",
          initialValue: 60,
          componentProps: {
            min: 1,
            max: 1440,
          },
        },
      ],
    },
    {
      key: "confirm",
      title: "确认提交",
      description: "确认任务配置信息",
      icon: <CheckCircle size={16} />,
      customRender: () => (
        <div>
          <Alert
            message="请确认以下配置信息"
            description="提交后将创建迁移任务，您可以在任务列表中查看执行状态。"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Card size="small" title="任务配置摘要">
            <div style={{ display: "grid", gap: 8 }}>
              <div><Text type="secondary">任务名称：</Text><Text>新数据迁移任务</Text></div>
              <div><Text type="secondary">数据源：</Text><Text>生产订单数据库</Text></div>
              <div><Text type="secondary">目标位置：</Text><Text>数据仓库订单表</Text></div>
              <div><Text type="secondary">调度方式：</Text><Text>手动执行</Text></div>
            </div>
          </Card>
        </div>
      ),
    },
  ];

  /**
   * 处理提交
   */
  const handleComplete = async (values: Record<string, unknown>) => {
    setSubmitting(true);
    try {
      console.log("Migration task values:", values);
      // 模拟 API 调用
      await new Promise((resolve) => setTimeout(resolve, 1500));
      message.success("迁移任务创建成功");
      router.push(ROUTES.MIGRATION);
    } catch {
      message.error("创建失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * 处理取消
   */
  const handleCancel = () => {
    router.push(ROUTES.MIGRATION);
  };

  /**
   * 处理保存草稿
   */
  const handleSaveDraft = async (values: Record<string, unknown>, currentStep: number) => {
    console.log("Save draft:", { values, currentStep });
    // 模拟 API 调用
    await new Promise((resolve) => setTimeout(resolve, 500));
  };

  return (
    <PageLayout title="新建迁移任务">
      <PageBreadcrumb items={BREADCRUMB_ITEMS} />

      <MultiStepForm
        steps={steps}
        onComplete={handleComplete}
        onCancel={handleCancel}
        onSaveDraft={handleSaveDraft}
        showSaveDraft
        submitText="创建任务"
        submitting={submitting}
      />
    </PageLayout>
  );
}