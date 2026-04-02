"use client";

/**
 * 模态表单组件
 * 统一新增/编辑弹窗表单样式
 */

import { Modal, Form, Button, Space, Input, InputNumber, Select, DatePicker, Switch } from "antd";
import type { ModalProps, FormProps, FormInstance } from "antd";
import { useForm } from "antd/es/form/Form";
import { useEffect } from "react";

/**
 * 表单字段配置
 */
export interface FormFieldConfig {
  /** 字段名 */
  name: string;
  /** 字段标签 */
  label: string;
  /** 字段类型 */
  type: "text" | "password" | "number" | "select" | "textarea" | "date" | "switch" | "custom";
  /** 是否必填 */
  required?: boolean;
  /** 占位文本 */
  placeholder?: string;
  /** 默认值 */
  initialValue?: unknown;
  /** 提示信息 */
  tooltip?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** Select 类型选项 */
  options?: Array<{ label: string; value: string | number }>;
  /** 验证规则 */
  rules?: FormProps["fields"];
  /** 自定义渲染组件（type 为 custom 时使用） */
  component?: React.ReactNode;
  /** 额外的组件属性 */
  componentProps?: Record<string, unknown>;
  /** 字段宽度 */
  width?: number | string;
  /** 是否隐藏 */
  hidden?: boolean;
}

/**
 * ModalForm 组件属性
 */
interface ModalFormProps {
  /** 弹窗标题 */
  title: string;
  /** 是否显示弹窗 */
  open: boolean;
  /** 关闭弹窗回调 */
  onCancel: () => void;
  /** 表单提交回调 */
  onSubmit: (values: Record<string, unknown>) => Promise<void> | void;
  /** 表单字段配置（单步表单时使用） */
  fields?: FormFieldConfig[];
  /** 初始表单值（编辑模式） */
  initialValues?: Record<string, unknown>;
  /** 弹窗宽度 */
  width?: number;
  /** 确认按钮文本 */
  confirmText?: string;
  /** 取消按钮文本 */
  cancelText?: string;
  /** 是否显示加载状态 */
  loading?: boolean;
  /** 额外的 Modal 属性 */
  modalProps?: Omit<ModalProps, "title" | "open" | "onCancel">;
  /** 额外的 Form 属性 */
  formProps?: FormProps;
  /** 表单实例（可选，用于外部控制） */
  form?: FormInstance;
  /** 表单布局 */
  layout?: "horizontal" | "vertical" | "inline";
  /** 标签宽度（horizontal 布局时） */
  labelCol?: number;
  /** 是否为分步表单 */
  steps?: Array<{
    title: string;
    fields: FormFieldConfig[];
  }>;
  /** 当前步骤（分步表单时） */
  currentStep?: number;
  /** 步骤变化回调 */
  onStepChange?: (step: number) => void;
}

/**
 * 渲染单个表单字段
 */
function renderFormField(field: FormFieldConfig) {
  if (field.hidden) return null;

  const baseProps = {
    placeholder: field.placeholder,
    disabled: field.disabled,
    ...field.componentProps,
  };

  const widthStyle = { width: field.width ?? "100%" };

  switch (field.type) {
    case "text":
      return <Input {...baseProps} style={widthStyle} />;
    case "password":
      return <Input.Password {...baseProps} style={widthStyle} />;
    case "number":
      return <InputNumber {...baseProps} style={widthStyle} />;
    case "select":
      return (
        <Select
          options={field.options}
          allowClear
          {...baseProps}
          style={widthStyle}
        />
      );
    case "textarea":
      return <Input.TextArea rows={4} {...baseProps} />;
    case "date":
      return <DatePicker {...baseProps} style={widthStyle} />;
    case "switch":
      return <Switch {...baseProps} />;
    case "custom":
      return field.component;
    default:
      return null;
  }
}

/**
 * 模态表单组件
 */
export function ModalForm({
  title,
  open,
  onCancel,
  onSubmit,
  fields,
  initialValues,
  width = 520,
  confirmText = "确定",
  cancelText = "取消",
  loading = false,
  modalProps,
  formProps,
  form: externalForm,
  layout = "vertical",
  labelCol = 6,
  steps,
  currentStep = 0,
  onStepChange,
}: ModalFormProps) {
  const [internalForm] = useForm();
  const form = externalForm ?? internalForm;

  /**
   * 初始化表单值
   */
  useEffect(() => {
    if (open && initialValues) {
      form.setFieldsValue(initialValues);
    } else if (open) {
      form.resetFields();
    }
  }, [open, initialValues, form]);

  /**
   * 处理表单提交
   */
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values);
      form.resetFields();
    } catch (error) {
      // 验证失败，不关闭弹窗
      console.error("Form validation failed:", error);
    }
  };

  /**
   * 处理取消
   */
  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  /**
   * 当前步骤的字段配置
   */
  const currentFields = steps ? steps[currentStep]?.fields ?? [] : fields ?? [];

  /**
   * 渲染表单内容
   */
  const renderFormContent = () => (
    <Form
      form={form}
      layout={layout}
      labelCol={layout === "horizontal" ? { span: labelCol } : undefined}
      wrapperCol={layout === "horizontal" ? { span: 24 - labelCol } : undefined}
      style={{ marginTop: 24 }}
      {...formProps}
    >
      {currentFields.map((field) => (
        <Form.Item
          key={field.name}
          name={field.name}
          label={field.label}
          rules={field.required ? [{ required: true, message: `请输入${field.label}` }] : undefined}
          tooltip={field.tooltip}
          initialValue={field.initialValue}
        >
          {renderFormField(field)}
        </Form.Item>
      ))}
    </Form>
  );

  /**
   * 渲染分步表单底部
   */
  const renderStepFooter = () => {
    if (!steps) return null;

    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === steps.length - 1;

    return (
      <Space>
        {!isFirstStep && (
          <Button onClick={() => onStepChange?.(currentStep - 1)}>
            上一步
          </Button>
        )}
        {!isLastStep && (
          <Button type="primary" onClick={() => onStepChange?.(currentStep + 1)}>
            下一步
          </Button>
        )}
        {isLastStep && (
          <Button type="primary" loading={loading} onClick={handleSubmit}>
            {confirmText}
          </Button>
        )}
        <Button onClick={handleCancel}>{cancelText}</Button>
      </Space>
    );
  };

  return (
    <Modal
      title={title}
      open={open}
      onCancel={handleCancel}
      width={width}
      footer={
        steps ? (
          renderStepFooter()
        ) : (
          <Space>
            <Button onClick={handleCancel}>{cancelText}</Button>
            <Button type="primary" loading={loading} onClick={handleSubmit}>
              {confirmText}
            </Button>
          </Space>
        )
      }
      maskClosable={false}
      forceRender
      {...modalProps}
    >
      {/* 分步表单进度指示 */}
      {steps && (
        <div style={{ marginBottom: 16 }}>
          {steps.map((step, index) => (
            <span
              key={index}
              style={{
                display: "inline-block",
                padding: "4px 12px",
                marginRight: 8,
                borderRadius: 4,
                background: index === currentStep ? "#2563EB" : index < currentStep ? "#10B981" : "#E2E8F0",
                color: index === currentStep ? "#fff" : index < currentStep ? "#fff" : "#475569",
              }}
            >
              {step.title}
            </span>
          ))}
        </div>
      )}
      {renderFormContent()}
    </Modal>
  );
}