"use client";

/**
 * 系统设置页面
 * 页面路径: /system/settings
 */

import { useState } from "react";
import {
  Card,
  Tabs,
  Form,
  Input,
  InputNumber,
  Button,
  Space,
  Switch,
  Select,
  Checkbox,
  message,
  Modal,
  Divider,
  Alert,
} from "antd";
import {
  Settings,
  Mail,
  Database,
  ShieldCheck,
  FileText,
  Save,
  TestTube,
  Plus,
  Trash2,
} from "lucide-react";

import { PageLayout } from "@/components/layout";
import { PageBreadcrumb } from "@/components/ui";
import { ROUTES } from "@/constants";
import {
  mockSystemSettings,
  STORAGE_TYPE_OPTIONS,
  LOG_LEVEL_OPTIONS,
  PASSWORD_COMPLEXITY_OPTIONS,
  LOGIN_METHOD_OPTIONS,
} from "@/services/mock/system-settings";
import type {
  BaseSettings,
  EmailSettings,
  StorageSettings,
  SecuritySettings,
  LogSettings,
  StorageType,
} from "@/services/mock/system-settings";

/**
 * 面包屑配置
 */
const BREADCRUMB_ITEMS = [
  { title: "系统管理", href: ROUTES.SYSTEM },
  { title: "系统设置" },
];

/**
 * 系统设置页面组件
 */
export default function SystemSettingsPage() {
  const [activeTab, setActiveTab] = useState("base");
  const [testEmailModalOpen, setTestEmailModalOpen] = useState(false);
  const [testStorageModalOpen, setTestStorageModalOpen] = useState(false);

  // 各配置表单
  const [baseForm] = Form.useForm();
  const [emailForm] = Form.useForm();
  const [storageForm] = Form.useForm();
  const [securityForm] = Form.useForm();
  const [logForm] = Form.useForm();

  // IP 白名单状态
  const [ipWhitelist, setIpWhitelist] = useState<string[]>(mockSystemSettings.security.ipWhitelist);

  /**
   * 保存配置通用处理
   */
  const handleSave = async (form: typeof baseForm, configName: string) => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();
      console.log(`Save ${configName}:`, values);
      message.success(`${configName}保存成功`);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  /**
   * 发送测试邮件
   */
  const handleSendTestEmail = async (values: { testEmail: string }) => {
    console.log("Send test email to:", values.testEmail);
    message.success(`测试邮件已发送至 ${values.testEmail}`);
    setTestEmailModalOpen(false);
  };

  /**
   * 测试存储连接
   */
  const handleTestStorage = async () => {
    console.log("Test storage connection");
    message.success("存储连接测试成功");
    setTestStorageModalOpen(false);
  };

  /**
   * 添加 IP 白名单
   */
  const handleAddIpWhitelist = () => {
    const newIp = "0.0.0.0/0";
    setIpWhitelist([...ipWhitelist, newIp]);
  };

  /**
   * 删除 IP 白名单项
   */
  const handleRemoveIpWhitelist = (index: number) => {
    setIpWhitelist(ipWhitelist.filter((_, i) => i !== index));
  };

  /**
   * 渲染基础配置 Tab
   */
  const renderBaseSettings = () => (
    <Card>
      <Form
        form={baseForm}
        layout="vertical"
        initialValues={mockSystemSettings.base}
      >
        <Divider>系统信息</Divider>

        <Form.Item name="systemName" label="系统名称" rules={[{ required: true }]}>
          <Input style={{ maxWidth: 400 }} />
        </Form.Item>

        <Form.Item name="systemLogo" label="系统 Logo">
          <Input style={{ maxWidth: 400 }} placeholder="Logo 图片路径" />
        </Form.Item>

        <Form.Item name="systemDescription" label="系统描述">
          <Input.TextArea style={{ maxWidth: 400 }} rows={3} />
        </Form.Item>

        <Form.Item name="copyrightInfo" label="版权信息">
          <Input style={{ maxWidth: 400 }} />
        </Form.Item>

        <Divider>功能开关</Divider>

        <Form.Item name="allowSelfRegister" label="用户自主注册" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item name="allowMultiLogin" label="多端登录" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item name="allowPasswordRecovery" label="密码找回" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item name="enableOperationLog" label="操作日志" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Divider>会话设置</Divider>

        <Form.Item name="sessionTimeout" label="会话超时时间（分钟）" rules={[{ required: true }]}>
          <InputNumber min={5} max={120} style={{ width: 200 }} />
        </Form.Item>

        <Form.Item name="captchaValidity" label="验证码有效期（分钟）" rules={[{ required: true }]}>
          <InputNumber min={1} max={30} style={{ width: 200 }} />
        </Form.Item>

        <Form.Item name="tokenValidity" label="Token 有效期（小时）" rules={[{ required: true }]}>
          <InputNumber min={1} max={72} style={{ width: 200 }} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" icon={<Save size={14} />} onClick={() => handleSave(baseForm, "基础配置")}>
            保存配置
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );

  /**
   * 渲染邮件服务 Tab
   */
  const renderEmailSettings = () => (
    <Card>
      <Form
        form={emailForm}
        layout="vertical"
        initialValues={mockSystemSettings.email}
      >
        <Divider>SMTP 配置</Divider>

        <Form.Item name="smtpServer" label="SMTP 服务器" rules={[{ required: true }]}>
          <Input style={{ maxWidth: 400 }} placeholder="smtp.example.com" />
        </Form.Item>

        <Form.Item name="smtpPort" label="端口" rules={[{ required: true }]}>
          <InputNumber min={1} max={65535} style={{ width: 200 }} />
        </Form.Item>

        <Form.Item name="senderEmail" label="发件人邮箱" rules={[{ required: true, type: "email" }]}>
          <Input style={{ maxWidth: 400 }} />
        </Form.Item>

        <Form.Item name="senderName" label="发件人名称">
          <Input style={{ maxWidth: 400 }} />
        </Form.Item>

        <Form.Item name="authUsername" label="认证用户名" rules={[{ required: true }]}>
          <Input style={{ maxWidth: 400 }} />
        </Form.Item>

        <Form.Item name="authPassword" label="认证密码" rules={[{ required: true }]}>
          <Input.Password style={{ maxWidth: 400 }} />
        </Form.Item>

        <Form.Item name="enableSSL" label="SSL/TLS 加密" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Divider>邮件模板</Divider>

        <Alert
          type="info"
          title="邮件模板配置"
          description="系统支持密码重置、账号激活、审批通知、告警通知等邮件模板，可在模板管理中自定义内容。"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Form.Item>
          <Space>
            <Button type="primary" icon={<Save size={14} />} onClick={() => handleSave(emailForm, "邮件服务配置")}>
              保存配置
            </Button>
            <Button icon={<TestTube size={14} />} onClick={() => setTestEmailModalOpen(true)}>
              发送测试邮件
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );

  /**
   * 渲染存储配置 Tab
   */
  const renderStorageSettings = () => {
    const storageType = storageForm.getFieldValue("storageType");

    return (
      <Card>
        <Form
          form={storageForm}
          layout="vertical"
          initialValues={mockSystemSettings.storage}
          onValuesChange={(changed) => {
            if (changed.storageType) {
              storageForm.resetFields(["localPath", "localMaxFileSize", "localAllowedTypes", "endpoint", "accessKey", "secretKey", "bucket", "region"]);
            }
          }}
        >
          <Form.Item name="storageType" label="存储类型" rules={[{ required: true }]}>
            <Select options={STORAGE_TYPE_OPTIONS} style={{ width: 200 }} />
          </Form.Item>

          {storageType === "local" && (
            <>
              <Form.Item name="localPath" label="存储路径" rules={[{ required: true }]}>
                <Input style={{ maxWidth: 400 }} placeholder="/data/uploads" />
              </Form.Item>
              <Form.Item name="localMaxFileSize" label="最大文件大小（MB）">
                <InputNumber min={1} max={1000} style={{ width: 200 }} />
              </Form.Item>
              <Form.Item name="localAllowedTypes" label="允许文件类型">
                <Input style={{ maxWidth: 400 }} placeholder="jpg,png,pdf,docx" />
              </Form.Item>
            </>
          )}

          {storageType !== "local" && (
            <>
              <Form.Item name="endpoint" label="Endpoint" rules={[{ required: true }]}>
                <Input style={{ maxWidth: 400 }} placeholder="http://minio.internal:9000" />
              </Form.Item>
              <Form.Item name="accessKey" label="Access Key" rules={[{ required: true }]}>
                <Input style={{ maxWidth: 400 }} />
              </Form.Item>
              <Form.Item name="secretKey" label="Secret Key" rules={[{ required: true }]}>
                <Input.Password style={{ maxWidth: 400 }} />
              </Form.Item>
              <Form.Item name="bucket" label="Bucket" rules={[{ required: true }]}>
                <Input style={{ maxWidth: 400 }} />
              </Form.Item>
              {(storageType === "oss" || storageType === "s3") && (
                <Form.Item name="region" label="Region">
                  <Input style={{ maxWidth: 400 }} placeholder="cn-hangzhou" />
                </Form.Item>
              )}
            </>
          )}

          <Form.Item>
            <Space>
              <Button type="primary" icon={<Save size={14} />} onClick={() => handleSave(storageForm, "存储配置")}>
                保存配置
              </Button>
              <Button icon={<TestTube size={14} />} onClick={() => setTestStorageModalOpen(true)}>
                测试连接
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    );
  };

  /**
   * 渲染安全策略 Tab
   */
  const renderSecuritySettings = () => (
    <Card>
      <Form
        form={securityForm}
        layout="vertical"
        initialValues={{
          ...mockSystemSettings.security,
          passwordComplexity: mockSystemSettings.security.passwordComplexity,
          loginMethods: mockSystemSettings.security.loginMethods,
        }}
      >
        <Divider>密码策略</Divider>

        <Form.Item name="passwordMinLength" label="最小长度" rules={[{ required: true }]}>
          <InputNumber min={6} max={32} style={{ width: 200 }} />
        </Form.Item>

        <Form.Item name="passwordComplexity" label="复杂度要求">
          <Checkbox.Group options={PASSWORD_COMPLEXITY_OPTIONS} />
        </Form.Item>

        <Form.Item name="passwordValidityDays" label="有效期（天）">
          <InputNumber min={0} max={365} style={{ width: 200 }} />
          <span style={{ color: "#6B7280", marginLeft: 8 }}>0 表示永不过期</span>
        </Form.Item>

        <Form.Item name="passwordHistoryCount" label="历史密码检查">
          <InputNumber min={0} max={10} style={{ width: 200 }} />
          <span style={{ color: "#6B7280", marginLeft: 8 }}>不能与最近 N 次密码相同</span>
        </Form.Item>

        <Form.Item name="loginLockCount" label="锁定策略">
          <InputNumber min={3} max={10} style={{ width: 200 }} />
          <span style={{ color: "#6B7280", marginLeft: 8 }}>N 次失败后锁定账户</span>
        </Form.Item>

        <Divider>IP 白名单</Divider>

        <div style={{ marginBottom: 16 }}>
          <Button icon={<Plus size={14} />} onClick={handleAddIpWhitelist}>
            添加 IP
          </Button>
        </div>

        <Space orientation="vertical" style={{ width: "100%" }}>
          {ipWhitelist.map((ip, index) => (
            <div key={index} style={{ display: "flex", gap: 8 }}>
              <Input
                value={ip}
                onChange={(e) => {
                  const newList = [...ipWhitelist];
                  newList[index] = e.target.value;
                  setIpWhitelist(newList);
                }}
                style={{ maxWidth: 300 }}
                placeholder="192.168.0.0/16"
              />
              <Button danger icon={<Trash2 size={14} />} onClick={() => handleRemoveIpWhitelist(index)}>
                删除
              </Button>
            </div>
          ))}
        </Space>

        <Divider>登录策略</Divider>

        <Form.Item name="loginMethods" label="登录方式">
          <Checkbox.Group options={LOGIN_METHOD_OPTIONS} />
        </Form.Item>

        <Form.Item name="enableMFA" label="强制双因素认证" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item name="enable异地LoginAlert" label="异地登录提醒" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item>
          <Button type="primary" icon={<Save size={14} />} onClick={() => handleSave(securityForm, "安全策略配置")}>
            保存配置
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );

  /**
   * 渲染日志配置 Tab
   */
  const renderLogSettings = () => (
    <Card>
      <Form
        form={logForm}
        layout="vertical"
        initialValues={mockSystemSettings.log}
      >
        <Divider>日志级别</Divider>

        <Form.Item name="apiLogLevel" label="API 日志级别" rules={[{ required: true }]}>
          <Select options={LOG_LEVEL_OPTIONS} style={{ width: 200 }} />
        </Form.Item>

        <Form.Item name="taskLogLevel" label="任务日志级别" rules={[{ required: true }]}>
          <Select options={LOG_LEVEL_OPTIONS} style={{ width: 200 }} />
        </Form.Item>

        <Form.Item name="auditLogLevel" label="审计日志级别" rules={[{ required: true }]}>
          <Select options={LOG_LEVEL_OPTIONS} style={{ width: 200 }} />
        </Form.Item>

        <Divider>日志保留</Divider>

        <Form.Item name="operationLogRetention" label="操作日志保留天数">
          <InputNumber min={7} max={365} style={{ width: 200 }} />
        </Form.Item>

        <Form.Item name="loginLogRetention" label="登录日志保留天数">
          <InputNumber min={7} max={365} style={{ width: 200 }} />
        </Form.Item>

        <Form.Item name="taskLogRetention" label="任务日志保留天数">
          <InputNumber min={7} max={90} style={{ width: 200 }} />
        </Form.Item>

        <Form.Item name="maxStorageSpace" label="最大存储空间（GB）">
          <InputNumber min={1} max={500} style={{ width: 200 }} />
        </Form.Item>

        <Divider>日志导出</Divider>

        <Alert
          type="info"
          title="日志导出配置"
          description="支持将日志导出到 Elasticsearch、Splunk 等外部系统，可在日志管理中配置导出规则。"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Form.Item>
          <Button type="primary" icon={<Save size={14} />} onClick={() => handleSave(logForm, "日志配置")}>
            保存配置
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );

  /**
   * Tab 配置
   */
  const tabItems = [
    {
      key: "base",
      label: "基础配置",
      icon: <Settings size={14} />,
      children: renderBaseSettings(),
    },
    {
      key: "email",
      label: "邮件服务",
      icon: <Mail size={14} />,
      children: renderEmailSettings(),
    },
    {
      key: "storage",
      label: "存储配置",
      icon: <Database size={14} />,
      children: renderStorageSettings(),
    },
    {
      key: "security",
      label: "安全策略",
      icon: <ShieldCheck size={14} />,
      children: renderSecuritySettings(),
    },
    {
      key: "log",
      label: "日志配置",
      icon: <FileText size={14} />,
      children: renderLogSettings(),
    },
  ];

  return (
    <PageLayout title="系统设置">
      <PageBreadcrumb items={BREADCRUMB_ITEMS} />

      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />

      {/* 测试邮件弹窗 */}
      <Modal
        title="发送测试邮件"
        open={testEmailModalOpen}
        onCancel={() => setTestEmailModalOpen(false)}
        footer={null}
      >
        <Form layout="vertical" onFinish={handleSendTestEmail}>
          <Form.Item
            name="testEmail"
            label="测试邮箱"
            rules={[{ required: true, type: "email", message: "请输入正确的邮箱地址" }]}
          >
            <Input placeholder="test@example.com" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                发送测试邮件
              </Button>
              <Button onClick={() => setTestEmailModalOpen(false)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 测试存储连接弹窗 */}
      <Modal
        title="测试存储连接"
        open={testStorageModalOpen}
        onCancel={() => setTestStorageModalOpen(false)}
        footer={
          <Space>
            <Button type="primary" onClick={handleTestStorage}>
              开始测试
            </Button>
            <Button onClick={() => setTestStorageModalOpen(false)}>取消</Button>
          </Space>
        }
      >
        <Alert
          type="info"
          title="将使用当前配置尝试连接存储服务"
          description="请确保配置信息正确，测试将验证连接权限和访问能力。"
          showIcon
        />
      </Modal>
    </PageLayout>
  );
}