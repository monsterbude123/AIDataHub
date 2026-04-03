"use client";

/**
 * 多步骤表单组件
 * 基于 MASTER.md Multi-Step Form 规范
 * 用于新建租户、配置迁移任务等复杂配置场景
 */

import { useState, useCallback, useMemo } from "react";
import {
  Steps,
  Button,
  Card,
  Form,
  Space,
  Modal,
  message,
  Spin,
} from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  SaveOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { Check, ChevronLeft, ChevronRight, Save } from "lucide-react";
import type { FormInstance, FormProps } from "antd";
import { clsx } from "clsx";

/**
 * 步骤配置
 */
export interface StepConfig {
  /** 步骤唯一标识 */
  key: string;
  /** 步骤标题 */
  title: string;
  /** 步骤描述（可选） */
  description?: string;
  /** 步骤图标（可选） */
  icon?: React.ReactNode;
  /** 表单字段配置 */
  fields: FormFieldConfig[];
  /** 自定义渲染内容（可选，与 fields 二选一） */
  customRender?: (form: FormInstance, values: Record<string, unknown>) => React.ReactNode;
  /** 步骤验证函数（可选） */
  validate?: (values: Record<string, unknown>) => Promise<boolean> | boolean;
}

/**
 * 表单字段配置（简化版，复用 ModalForm 的定义）
 */
export interface FormFieldConfig {
  name: string;
  label: string;
  type: "text" | "number" | "select" | "textarea" | "date" | "switch" | "radio" | "custom";
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string | number; label: string }>;
  initialValue?: unknown;
  componentProps?: Record<string, unknown>;
  /** 自定义渲染（type 为 custom 时使用） */
  render?: (form: FormInstance) => React.ReactNode;
  /** 隐藏条件 */
  hidden?: (values: Record<string, unknown>) => boolean;
  /** 跨列显示 */
  span?: 1 | 2;
}

/**
 * MultiStepForm 组件属性
 */
export interface MultiStepFormProps {
  /** 步骤配置列表 */
  steps: StepConfig[];
  /** 完成回调 */
  onComplete: (data: Record<string, unknown>) => Promise<void> | void;
  /** 取消回调 */
  onCancel?: () => void;
  /** 保存草稿回调（可选） */
  onSaveDraft?: (data: Record<string, unknown>, currentStep: number) => Promise<void> | void;
  /** 初始值（用于编辑或恢复草稿） */
  initialValues?: Record<string, unknown>;
  /** 初始步骤（用于恢复草稿） */
  initialStep?: number;
  /** 标题 */
  title?: string;
  /** 是否显示为弹窗模式 */
  modal?: boolean;
  /** 弹窗打开状态（modal 模式时使用） */
  open?: boolean;
  /** 弹窗宽度 */
  width?: number;
  /** 自定义类名 */
  className?: string;
  /** 是否显示保存草稿按钮 */
  showSaveDraft?: boolean;
  /** 提交按钮文本 */
  submitText?: string;
  /** 是否禁用 */
  disabled?: boolean;
}

/**
 * 步骤状态
 */
type StepStatus = "wait" | "process" | "finish" | "error";

/**
 * 多步骤表单组件
 */
export function MultiStepForm({
  steps,
  onComplete,
  onCancel,
  onSaveDraft,
  initialValues = {},
  initialStep = 0,
  title,
  modal = false,
  open = true,
  width = 800,
  className,
  showSaveDraft = false,
  submitText = "提交",
  disabled = false,
}: MultiStepFormProps) {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [stepErrors, setStepErrors] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /**
   * 当前步骤配置
   */
  const currentStepConfig = steps[currentStep];

  /**
   * 计算步骤状态
   */
  const getStepStatus = useCallback(
    (index: number): StepStatus => {
      if (stepErrors.has(steps[index].key)) return "error";
      if (index < currentStep) return "finish";
      if (index === currentStep) return "process";
      return "wait";
    },
    [currentStep, stepErrors, steps]
  );

  /**
   * 步骤项配置
   */
  const stepItems = useMemo(
    () =>
      steps.map((step, index) => ({
        key: step.key,
        title: step.title,
        description: step.description,
        icon: step.icon,
        status: getStepStatus(index),
      })),
    [steps, getStepStatus]
  );

  /**
   * 验证当前步骤
   */
  const validateCurrentStep = async (): Promise<boolean> => {
    try {
      await form.validateFields();

      // 执行步骤自定义验证
      if (currentStepConfig.validate) {
        const values = form.getFieldsValue();
        const valid = await currentStepConfig.validate(values);
        if (!valid) {
          setStepErrors((prev) => new Set(prev).add(currentStepConfig.key));
          return false;
        }
      }

      // 清除步骤错误
      setStepErrors((prev) => {
        const next = new Set(prev);
        next.delete(currentStepConfig.key);
        return next;
      });

      return true;
    } catch {
      setStepErrors((prev) => new Set(prev).add(currentStepConfig.key));
      return false;
    }
  };

  /**
   * 处理下一步
   */
  const handleNext = async () => {
    const valid = await validateCurrentStep();
    if (!valid) return;

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  /**
   * 处理上一步
   */
  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  /**
   * 处理保存草稿
   */
  const handleSaveDraft = async () => {
    if (!onSaveDraft) return;

    setLoading(true);
    try {
      const values = form.getFieldsValue();
      await onSaveDraft(values, currentStep);
      message.success("草稿保存成功");
    } catch {
      message.error("草稿保存失败");
    } finally {
      setLoading(false);
    }
  };

  /**
   * 处理提交
   */
  const handleSubmit = async () => {
    const valid = await validateCurrentStep();
    if (!valid) return;

    setSubmitting(true);
    try {
      const values = form.getFieldsValue();
      await onComplete(values);
      message.success("提交成功");
    } catch {
      message.error("提交失败");
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * 处理取消
   */
  const handleCancel = () => {
    Modal.confirm({
      title: "确认取消",
      content: "未保存的数据将丢失，确定要取消吗？",
      okText: "确定",
      cancelText: "继续编辑",
      onOk: () => {
        form.resetFields();
        setCurrentStep(0);
        setStepErrors(new Set());
        onCancel?.();
      },
    });
  };

  /**
   * 渲染表单内容
   */
  const renderFormContent = () => (
    <div className={clsx("multi-step-form", className)}>
      {/* 步骤指示器 */}
      <div style={{ marginBottom: 24 }}>
        <Steps current={currentStep} items={stepItems} />
      </div>

      {/* 当前步骤标题 */}
      <div
        style={{
          marginBottom: 8,
          fontSize: 18,
          fontWeight: 600,
          color: "#1E293B",
        }}
      >
        {currentStepConfig.title}
      </div>

      {/* 当前步骤描述 */}
      {currentStepConfig.description && (
        <div
          style={{
            marginBottom: 24,
            fontSize: 14,
            color: "#6B7280",
          }}
        >
          {currentStepConfig.description}
        </div>
      )}

      {/* 表单区域 */}
      <div style={{ minHeight: 300 }}>
        {currentStepConfig.customRender ? (
          currentStepConfig.customRender(form, form.getFieldsValue())
        ) : (
          <Form
            form={form}
            layout="vertical"
            initialValues={initialValues}
            disabled={disabled || submitting}
          >
            {renderFormFields(currentStepConfig.fields)}
          </Form>
        )}
      </div>

      {/* 底部操作栏 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 24,
          paddingTop: 16,
          borderTop: "1px solid #E2E8F0",
        }}
      >
        {/* 左侧 */}
        <Space>
          <Button onClick={handleCancel} disabled={submitting}>
            取消
          </Button>
          {showSaveDraft && onSaveDraft && (
            <Button
              icon={<Save size={14} />}
              onClick={handleSaveDraft}
              loading={loading}
              disabled={submitting}
            >
              保存草稿
            </Button>
          )}
        </Space>

        {/* 右侧 */}
        <Space>
          {currentStep > 0 && (
            <Button
              icon={<ChevronLeft size={14} />}
              onClick={handlePrev}
              disabled={submitting}
            >
              上一步
            </Button>
          )}
          {currentStep < steps.length - 1 ? (
            <Button type="primary" onClick={handleNext} disabled={submitting}>
              下一步
              <ChevronRight size={14} style={{ marginLeft: 4 }} />
            </Button>
          ) : (
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={submitting}
              icon={submitting ? undefined : <Check size={14} />}
            >
              {submitText}
            </Button>
          )}
        </Space>
      </div>
    </div>
  );

  /**
   * 渲染表单字段
   */
  const renderFormFields = (fields: FormFieldConfig[]) => {
    return fields.map((field) => {
      const values = form.getFieldsValue();
      if (field.hidden?.(values)) return null;

      return (
        <Form.Item
          key={field.name}
          name={field.name}
          label={field.label}
          rules={field.required ? [{ required: true, message: `请输入${field.label}` }] : undefined}
          initialValue={field.initialValue}
          valuePropName={field.type === "switch" ? "checked" : "value"}
        >
          {renderFieldInput(field)}
        </Form.Item>
      );
    });
  };

  /**
   * 渲染字段输入控件
   */
  const renderFieldInput = (field: FormFieldConfig) => {
    switch (field.type) {
      case "text":
        return (
          <Form.Item name={field.name} noStyle>
            <input
              type="text"
              placeholder={field.placeholder}
              className="ant-input"
              style={{ width: "100%" }}
              {...field.componentProps}
            />
          </Form.Item>
        );
      case "number":
        return (
          <Form.Item name={field.name} noStyle>
            <input
              type="number"
              placeholder={field.placeholder}
              className="ant-input"
              style={{ width: "100%" }}
              {...field.componentProps}
            />
          </Form.Item>
        );
      case "select":
        return (
          <Form.Item name={field.name} noStyle>
            <select
              className="ant-select-selector"
              style={{ width: "100%", height: 40 }}
              {...field.componentProps}
            >
              <option value="">{field.placeholder || "请选择"}</option>
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </Form.Item>
        );
      case "textarea":
        return (
          <Form.Item name={field.name} noStyle>
            <textarea
              placeholder={field.placeholder}
              className="ant-input"
              style={{ width: "100%", minHeight: 80 }}
              rows={3}
              {...field.componentProps}
            />
          </Form.Item>
        );
      case "custom":
        return field.render?.(form) || null;
      default:
        return null;
    }
  };

  // 弹窗模式
  if (modal) {
    return (
      <Modal
        title={title}
        open={open}
        onCancel={handleCancel}
        footer={null}
        width={width}
        maskClosable={false}
        destroyOnClose
      >
        {renderFormContent()}
      </Modal>
    );
  }

  // 页面模式
  return (
    <Card title={title} className={className}>
      {renderFormContent()}
    </Card>
  );
}

/**
 * 创建多步骤表单的快捷函数
 */
export function createMultiStepForm(
  steps: StepConfig[],
  options: Partial<Omit<MultiStepFormProps, "steps">> = {}
) {
  return function MultiStepFormWrapper(props: Omit<MultiStepFormProps, "steps">) {
    return <MultiStepForm steps={steps} {...options} {...props} />;
  };
}