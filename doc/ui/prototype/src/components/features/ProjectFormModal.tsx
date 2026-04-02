"use client";

/**
 * 项目创建/编辑表单弹窗
 * 统一处理新建和编辑项目的表单逻辑
 */

import { useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Row,
  Col,
} from "antd";
import { mockUsers } from "@/services/mock/system";
import type { Project } from "@/types/project";

/**
 * 用户选项（负责人选择）
 */
const userOptions = mockUsers
  .filter((u) => u.status === "normal")
  .map((u) => ({
    label: u.name,
    value: u.id,
  }));

interface ProjectFormModalProps {
  /** 是否显示弹窗 */
  open: boolean;
  /** 关闭弹窗回调 */
  onCancel: () => void;
  /** 表单提交回调 */
  onSubmit: (values: Record<string, unknown>) => Promise<void> | void;
  /** 编辑模式时的初始数据 */
  editData?: Project | null;
  /** 是否为编辑模式 */
  isEdit?: boolean;
}

/**
 * 项目表单弹窗组件
 */
export function ProjectFormModal({
  open,
  onCancel,
  onSubmit,
  editData,
  isEdit = false,
}: ProjectFormModalProps) {
  const [form] = Form.useForm();

  /**
   * 弹窗关闭时重置状态
   */
  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [open, form]);

  /**
   * 编辑模式下初始化表单数据
   */
  useEffect(() => {
    if (open && editData) {
      form.setFieldsValue({
        name: editData.name,
        code: editData.code,
        description: editData.description,
        managerId: editData.managerId,
        startDate: editData.startDate,
        expectedEndDate: editData.expectedEndDate,
      });
    }
  }, [open, editData, form]);

  /**
   * 处理表单提交
   */
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values);
    } catch (error) {
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

  return (
    <Modal
      title={isEdit ? "编辑项目" : "新建项目"}
      open={open}
      onCancel={handleCancel}
      onOk={handleSubmit}
      width={600}
      okText={isEdit ? "保存" : "创建"}
      cancelText="取消"
    >
      <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
        <Form.Item
          name="name"
          label="项目名称"
          rules={[{ required: true, message: "请输入项目名称" }]}
        >
          <Input placeholder="请输入项目名称，最多100字符" maxLength={100} />
        </Form.Item>
        <Form.Item name="code" label="项目编号">
          <Input
            placeholder="自动生成，可自定义"
            disabled={isEdit}
          />
        </Form.Item>
        <Form.Item name="description" label="项目描述">
          <Input.TextArea
            rows={3}
            placeholder="请输入项目描述，最多500字符"
            maxLength={500}
          />
        </Form.Item>
        <Form.Item
          name="managerId"
          label="负责人"
          rules={[{ required: true, message: "请选择负责人" }]}
        >
          <Select placeholder="请选择负责人" options={userOptions} showSearch />
        </Form.Item>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="startDate"
              label="开始时间"
              rules={[{ required: true, message: "请选择开始时间" }]}
            >
              <DatePicker style={{ width: "100%" }} placeholder="请选择开始时间" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="expectedEndDate"
              label="预计完成时间"
              rules={[{ required: true, message: "请选择预计完成时间" }]}
            >
              <DatePicker style={{ width: "100%" }} placeholder="请选择预计完成时间" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}