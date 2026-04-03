"use client";

/**
 * 数据源创建/编辑表单弹窗
 * 支持分步表单：基本信息 → 连接配置 → 元数据采集配置
 */

import { useState, useEffect } from "react";
import { message, TreeSelect, Switch } from "antd";
import { ModalForm, type FormFieldConfig } from "@/components/ui";
import {
  mockDataSourceCategories,
  DATA_SOURCE_TYPE_LABELS,
} from "@/services/mock/data-integration";
import type { DataSource, DataSourceType, DataSourceFormData } from "@/types/data-integration";

/**
 * 数据源类型默认端口映射
 */
const DEFAULT_PORTS: Partial<Record<DataSourceType, number>> = {
  mysql: 3306,
  postgresql: 5432,
  oracle: 1521,
  sqlserver: 1433,
  mongodb: 27017,
  redis: 6379,
  elasticsearch: 9200,
  kafka: 9092,
  hive: 10000,
  hdfs: 9000,
  ftp: 21,
};

/**
 * 数据源类型选项
 */
const DATA_SOURCE_TYPE_OPTIONS = Object.entries(DATA_SOURCE_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

/**
 * 分类树选项
 */
const CATEGORY_TREE_OPTIONS = mockDataSourceCategories.map((cat) => ({
  value: cat.id,
  title: cat.name,
  children: cat.children?.map((child) => ({
    value: child.id,
    title: child.name,
  })),
}));

/**
 * 调度周期选项
 */
const SCHEDULE_OPTIONS = [
  { label: "每日", value: "daily" },
  { label: "每周", value: "weekly" },
  { label: "每月", value: "monthly" },
  { label: "自定义 (Cron)", value: "custom" },
];

/**
 * 表单初始值
 */
const INITIAL_FORM_VALUES: Partial<DataSourceFormData> = {
  name: "",
  type: "mysql",
  description: "",
  categoryId: "",
  connectionConfig: {
    host: "",
    port: 3306,
    database: "",
    username: "",
    password: "",
    extraParams: {},
  },
};

interface DataSourceFormModalProps {
  /** 是否显示弹窗 */
  open: boolean;
  /** 关闭弹窗回调 */
  onCancel: () => void;
  /** 表单提交回调 */
  onSubmit: (values: DataSourceFormData) => Promise<void> | void;
  /** 编辑模式时的初始数据 */
  editData?: DataSource;
  /** 是否为编辑模式 */
  isEdit?: boolean;
}

/**
 * 数据源表单弹窗组件
 */
export function DataSourceFormModal({
  open,
  onCancel,
  onSubmit,
  editData,
  isEdit = false,
}: DataSourceFormModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedType, setSelectedType] = useState<DataSourceType>("mysql");
  const [testingConnection, setTestingConnection] = useState(false);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);

  /**
   * 初始化编辑数据
   */
  useEffect(() => {
    if (editData) {
      setSelectedType(editData.type);
    } else {
      setSelectedType("mysql");
    }
  }, [editData, open]);

  /**
   * 获取步骤1字段配置（基本信息）
   */
  const getStep1Fields = (): FormFieldConfig[] => [
    {
      name: "name",
      label: "数据源名称",
      type: "text",
      required: true,
      placeholder: "请输入数据源名称",
    },
    {
      name: "type",
      label: "数据源类型",
      type: "select",
      required: true,
      options: DATA_SOURCE_TYPE_OPTIONS,
      placeholder: "请选择数据源类型",
      componentProps: {
        onChange: (value: DataSourceType) => {
          setSelectedType(value);
          // 自动更新默认端口
          const defaultPort = DEFAULT_PORTS[value];
          if (defaultPort) {
            // 更新表单中的 port 字段
          }
        },
      },
    },
    {
      name: "categoryId",
      label: "所属分类",
      type: "custom",
      required: true,
      component: (
        <TreeSelect
          treeData={CATEGORY_TREE_OPTIONS}
          placeholder="请选择所属分类"
          allowClear
          style={{ width: "100%" }}
        />
      ),
    },
    {
      name: "description",
      label: "描述",
      type: "textarea",
      placeholder: "请输入数据源描述（可选）",
    },
  ];

  /**
   * 获取步骤2字段配置（连接配置）- 根据数据源类型动态变化
   */
  const getStep2Fields = (): FormFieldConfig[] => {
    // 数据库类型的通用字段
    const dbFields: FormFieldConfig[] = [
      {
        name: "connectionConfig.host",
        label: "主机地址",
        type: "text",
        required: true,
        placeholder: "请输入主机地址，如 192.168.1.100",
      },
      {
        name: "connectionConfig.port",
        label: "端口",
        type: "number",
        required: true,
        initialValue: DEFAULT_PORTS[selectedType] || 0,
        componentProps: {
          min: 1,
          max: 65535,
        },
      },
      {
        name: "connectionConfig.database",
        label: "数据库名称",
        type: "text",
        required: true,
        placeholder: "请输入数据库名称",
      },
      {
        name: "connectionConfig.username",
        label: "用户名",
        type: "text",
        required: true,
        placeholder: "请输入用户名",
      },
      {
        name: "connectionConfig.password",
        label: "密码",
        type: "password",
        required: true,
        placeholder: "请输入密码",
      },
      {
        name: "connectionConfig.extraParams.jdbcParams",
        label: "JDBC 额外参数",
        type: "textarea",
        placeholder: "可选，如 useSSL=false&serverTimezone=UTC",
      },
    ];

    // S3 类型字段
    const s3Fields: FormFieldConfig[] = [
      {
        name: "connectionConfig.host",
        label: "Endpoint",
        type: "text",
        required: true,
        placeholder: "如 s3.amazonaws.com",
      },
      {
        name: "connectionConfig.extraParams.bucket",
        label: "Bucket 名称",
        type: "text",
        required: true,
        placeholder: "请输入 Bucket 名称",
      },
      {
        name: "connectionConfig.extraParams.region",
        label: "Region",
        type: "text",
        required: true,
        placeholder: "如 cn-north-1",
      },
      {
        name: "connectionConfig.username",
        label: "Access Key",
        type: "text",
        required: true,
        placeholder: "请输入 Access Key ID",
      },
      {
        name: "connectionConfig.password",
        label: "Secret Key",
        type: "password",
        required: true,
        placeholder: "请输入 Secret Access Key",
      },
    ];

    // Kafka 类型字段
    const kafkaFields: FormFieldConfig[] = [
      {
        name: "connectionConfig.host",
        label: "Broker 地址",
        type: "text",
        required: true,
        placeholder: "如 kafka-cluster.internal",
      },
      {
        name: "connectionConfig.port",
        label: "端口",
        type: "number",
        required: true,
        initialValue: 9092,
        componentProps: {
          min: 1,
          max: 65535,
        },
      },
      {
        name: "connectionConfig.extraParams.topic",
        label: "Topic",
        type: "text",
        required: true,
        placeholder: "请输入 Topic 名称",
      },
      {
        name: "connectionConfig.extraParams.groupId",
        label: "Consumer Group ID",
        type: "text",
        placeholder: "请输入消费者组 ID（可选）",
      },
    ];

    // API 类型字段
    const apiFields: FormFieldConfig[] = [
      {
        name: "connectionConfig.extraParams.endpoint",
        label: "API Endpoint",
        type: "text",
        required: true,
        placeholder: "如 https://api.example.com/data",
      },
      {
        name: "connectionConfig.extraParams.method",
        label: "请求方法",
        type: "select",
        required: true,
        options: [
          { label: "GET", value: "GET" },
          { label: "POST", value: "POST" },
          { label: "PUT", value: "PUT" },
          { label: "DELETE", value: "DELETE" },
        ],
        initialValue: "GET",
      },
      {
        name: "connectionConfig.username",
        label: "认证用户名",
        type: "text",
        placeholder: "可选，用于 Basic Auth",
      },
      {
        name: "connectionConfig.password",
        label: "认证密码/Token",
        type: "password",
        placeholder: "可选，用于 Basic Auth 或 API Token",
      },
    ];

    // 根据类型选择字段配置
    switch (selectedType) {
      case "s3":
        return s3Fields;
      case "kafka":
        return kafkaFields;
      case "api":
        return apiFields;
      case "redis":
        return [
          {
            name: "connectionConfig.host",
            label: "主机地址",
            type: "text",
            required: true,
          },
          {
            name: "connectionConfig.port",
            label: "端口",
            type: "number",
            required: true,
            initialValue: 6379,
          },
          {
            name: "connectionConfig.password",
            label: "密码",
            type: "password",
            placeholder: "可选",
          },
          {
            name: "connectionConfig.extraParams.db",
            label: "数据库编号",
            type: "number",
            initialValue: 0,
            componentProps: { min: 0, max: 15 },
          },
        ];
      default:
        return dbFields;
    }
  };

  /**
   * 获取步骤3字段配置（元数据采集配置）
   */
  const getStep3Fields = (): FormFieldConfig[] => [
    {
      name: "metadataConfig.enabled",
      label: "启用元数据采集",
      type: "custom",
      component: <Switch defaultChecked onChange={(checked) => setScheduleEnabled(checked)} />,
    },
    {
      name: "metadataConfig.strategy",
      label: "接入策略",
      type: "select",
      required: scheduleEnabled,
      options: [
        { label: "一次性接入", value: "once" },
        { label: "周期性接入", value: "periodic" },
      ],
      initialValue: "once",
    },
    {
      name: "metadataConfig.schedule",
      label: "调度周期",
      type: "select",
      required: scheduleEnabled,
      options: SCHEDULE_OPTIONS,
      initialValue: "daily",
    },
    {
      name: "metadataConfig.updateStrategy",
      label: "数据更新策略",
      type: "select",
      required: scheduleEnabled,
      options: [
        { label: "全量覆盖", value: "full" },
        { label: "增量追加", value: "incremental" },
      ],
      initialValue: "full",
    },
  ];

  /**
   * 分步配置
   */
  const steps = [
    { title: "基本信息", fields: getStep1Fields() },
    { title: "连接配置", fields: getStep2Fields() },
    { title: "元数据采集", fields: getStep3Fields() },
  ];

  /**
   * 处理连接测试
   */
  const handleTestConnection = async () => {
    setTestingConnection(true);
    message.loading({ content: "正在测试连接...", key: "testConnection" });

    // 模拟连接测试
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // 随机返回成功或失败（实际应调用后端接口）
    const success = Math.random() > 0.3;

    setTestingConnection(false);
    if (success) {
      message.success({ content: "连接测试成功！", key: "testConnection" });
    } else {
      message.error({ content: "连接测试失败，请检查配置参数", key: "testConnection" });
    }
  };

  /**
   * 处理表单提交
   */
  const handleSubmit = async (values: Record<string, unknown>) => {
    // 处理嵌套字段
    const formData: DataSourceFormData = {
      name: values.name as string,
      type: values.type as DataSourceType,
      description: values.description as string,
      categoryId: values.categoryId as string,
      connectionConfig: {
        host: values["connectionConfig.host"] as string,
        port: values["connectionConfig.port"] as number,
        database: values["connectionConfig.database"] as string,
        username: values["connectionConfig.username"] as string,
        password: values["connectionConfig.password"] as string,
        extraParams: {
          ...(values["connectionConfig.extraParams"] as Record<string, unknown> || {}),
          jdbcParams: values["connectionConfig.extraParams.jdbcParams"],
          bucket: values["connectionConfig.extraParams.bucket"],
          region: values["connectionConfig.extraParams.region"],
          topic: values["connectionConfig.extraParams.topic"],
          groupId: values["connectionConfig.extraParams.groupId"],
          endpoint: values["connectionConfig.extraParams.endpoint"],
          method: values["connectionConfig.extraParams.method"],
          db: values["connectionConfig.extraParams.db"],
        },
      },
    };

    // 清理 extraParams 中的 undefined 值
    const extraParams = formData.connectionConfig.extraParams;
    if (extraParams) {
      Object.keys(extraParams).forEach((key) => {
        if (extraParams[key] === undefined) {
          delete extraParams[key];
        }
      });
    }

    await onSubmit(formData);
    setCurrentStep(0);
  };

  /**
   * 转换编辑数据为表单初始值
   */
  const getInitialValues = (): Record<string, unknown> | undefined => {
    if (!editData) return INITIAL_FORM_VALUES;

    return {
      name: editData.name,
      type: editData.type,
      categoryId: editData.categoryId,
      description: editData.description,
      "connectionConfig.host": editData.connectionConfig.host,
      "connectionConfig.port": editData.connectionConfig.port,
      "connectionConfig.database": editData.connectionConfig.database,
      "connectionConfig.username": editData.connectionConfig.username,
      "connectionConfig.password": "", // 编辑时不显示密码
      "connectionConfig.extraParams.jdbcParams": editData.connectionConfig.extraParams?.jdbcParams,
      "connectionConfig.extraParams.bucket": editData.connectionConfig.extraParams?.bucket,
      "connectionConfig.extraParams.region": editData.connectionConfig.extraParams?.region,
      "connectionConfig.extraParams.topic": editData.connectionConfig.extraParams?.topic,
      "connectionConfig.extraParams.groupId": editData.connectionConfig.extraParams?.groupId,
      "connectionConfig.extraParams.endpoint": editData.connectionConfig.extraParams?.endpoint,
      "connectionConfig.extraParams.method": editData.connectionConfig.extraParams?.method,
      "connectionConfig.extraParams.db": editData.connectionConfig.extraParams?.db,
    };
  };

  return (
    <ModalForm
      title={isEdit ? `编辑数据源 - ${editData?.name}` : "新增数据源"}
      open={open}
      onCancel={onCancel}
      onSubmit={handleSubmit}
      steps={steps}
      currentStep={currentStep}
      onStepChange={setCurrentStep}
      initialValues={getInitialValues()}
      width={640}
      confirmText={isEdit ? "保存修改" : "完成创建"}
    />
  );
}