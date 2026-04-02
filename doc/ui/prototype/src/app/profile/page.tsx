"use client";

/**
 * 个人中心页面
 * 页面路径: /profile
 */

import { useState } from "react";
import {
  Card,
  Tabs,
  Form,
  Input,
  Radio,
  Button,
  Avatar,
  Space,
  Switch,
  Select,
  Table,
  Tag,
  Modal,
  message,
  Upload,
  Descriptions,
} from "antd";
import { User, Mail, Phone, Building, Shield, Bell, Palette, Globe, Lock, History, Upload as UploadIcon } from "lucide-react";

import { PageLayout } from "@/components/layout";
import { PageBreadcrumb } from "@/components/ui";
import { ROUTES } from "@/constants";
import {
  mockCurrentUser,
  mockLoginHistory,
  mockUserPreferences,
  mockOAuthBindings,
  getLoginMethodLabel,
  getLoginStatusLabel,
} from "@/services/mock/user";
import type { LoginHistory, UserPreferences, OAuthBinding } from "@/types/user";

/**
 * 面包屑配置
 */
const BREADCRUMB_ITEMS = [{ title: "个人中心" }];

/**
 * 个人中心页面组件
 */
export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("basic");
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  // 基本信息表单
  const [basicForm] = Form.useForm();

  // 偏好设置状态
  const [preferences, setPreferences] = useState<UserPreferences>(mockUserPreferences);

  /**
   * 保存基本信息
   */
  const handleSaveBasic = async () => {
    try {
      await basicForm.validateFields();
      const values = basicForm.getFieldsValue();
      console.log("Save basic info:", values);
      message.success("保存成功");
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  /**
   * 重置基本信息
   */
  const handleResetBasic = () => {
    basicForm.resetFields();
    message.info("已重置");
  };

  /**
   * 修改密码
   */
  const handlePasswordChange = async (values: { currentPassword: string; newPassword: string }) => {
    console.log("Change password:", values);
    message.success("密码修改成功，请重新登录");
    setPasswordModalOpen(false);
  };

  /**
   * 更新偏好设置
   */
  const handlePreferenceChange = (key: keyof UserPreferences, value: unknown) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
    message.success("设置已保存");
  };

  /**
   * 登录历史表格列
   */
  const loginHistoryColumns = [
    {
      title: "登录时间",
      dataIndex: "loginTime",
      key: "loginTime",
      width: 180,
    },
    {
      title: "登录 IP",
      dataIndex: "ip",
      key: "ip",
      width: 140,
    },
    {
      title: "设备",
      dataIndex: "device",
      key: "device",
      width: 120,
    },
    {
      title: "浏览器",
      dataIndex: "browser",
      key: "browser",
      width: 140,
    },
    {
      title: "登录方式",
      dataIndex: "loginMethod",
      key: "loginMethod",
      width: 100,
      render: (method: string) => <Tag>{getLoginMethodLabel(method)}</Tag>,
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 80,
      render: (status: string) => (
        <Tag color={status === "success" ? "success" : "error"}>{getLoginStatusLabel(status)}</Tag>
      ),
    },
  ];

  /**
   * 渲染用户信息卡片
   */
  const renderUserInfoCard = () => (
    <Card style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <Avatar size={80} src={mockCurrentUser.avatar} icon={<User size={40} />} />
        <div>
          <h2 style={{ margin: 0, fontSize: 24 }}>{mockCurrentUser.name}</h2>
          <div style={{ color: "#6B7280", marginTop: 4 }}>账号: {mockCurrentUser.username}</div>
          <Space style={{ marginTop: 8 }}>
            <Tag icon={<Building size={12} />}>{mockCurrentUser.orgName}</Tag>
            {mockCurrentUser.roles.map((role) => (
              <Tag key={role.id} color="blue">{role.name}</Tag>
            ))}
          </Space>
        </div>
      </div>
    </Card>
  );

  /**
   * 渲染基本信息 Tab
   */
  const renderBasicInfo = () => (
    <Card>
      <Form
        form={basicForm}
        layout="vertical"
        initialValues={{
          name: mockCurrentUser.name,
          gender: mockCurrentUser.gender,
          phone: mockCurrentUser.phone,
          email: mockCurrentUser.email,
        }}
      >
        <Form.Item label="头像">
          <Upload showUploadList={false}>
            <Space>
              <Avatar size={64} src={mockCurrentUser.avatar} icon={<User size={32} />} />
              <Button icon={<UploadIcon size={14} />}>更换头像</Button>
            </Space>
          </Upload>
          <div style={{ color: "#6B7280", fontSize: 12, marginTop: 4 }}>
            支持 JPG/PNG 格式，建议 200x200 像素，不超过 2MB
          </div>
        </Form.Item>

        <Form.Item name="name" label="姓名" rules={[{ required: true, message: "请输入姓名" }]}>
          <Input style={{ maxWidth: 400 }} />
        </Form.Item>

        <Form.Item name="gender" label="性别">
          <Radio.Group>
            <Radio value="male">男</Radio>
            <Radio value="female">女</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="phone"
          label="手机号"
          rules={[{ pattern: /^1[3-9]\d{9}$/, message: "请输入正确的手机号" }]}
        >
          <Input style={{ maxWidth: 400 }} />
        </Form.Item>

        <Form.Item
          name="email"
          label="邮箱"
          rules={[{ type: "email", message: "请输入正确的邮箱地址" }]}
        >
          <Input style={{ maxWidth: 400 }} />
        </Form.Item>

        <Form.Item label="所属机构">
          <Input value={mockCurrentUser.orgName} disabled style={{ maxWidth: 400 }} />
        </Form.Item>

        <Form.Item label="数据分级">
          <Input value={mockCurrentUser.dataLevel} disabled style={{ maxWidth: 400 }} />
        </Form.Item>

        <Form.Item label="创建时间">
          <Input value={mockCurrentUser.createTime} disabled style={{ maxWidth: 400 }} />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" onClick={handleSaveBasic}>
              保存
            </Button>
            <Button onClick={handleResetBasic}>重置</Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );

  /**
   * 渲染安全设置 Tab
   */
  const renderSecuritySettings = () => (
    <Space direction="vertical" style={{ width: "100%" }} size="large">
      {/* 修改密码 */}
      <Card title="修改密码" extra={<Button onClick={() => setPasswordModalOpen(true)}>修改密码</Button>}>
        <Descriptions column={1}>
          <Descriptions.Item label="当前密码">已设置</Descriptions.Item>
          <Descriptions.Item label="密码规则">
            至少 8 位字符，包含大小写字母和数字
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 绑定信息 */}
      <Card title="绑定信息">
        <Descriptions column={2}>
          <Descriptions.Item label="手机绑定">
            <Space>
              <Phone size={14} />
              {mockCurrentUser.phone}
              <Button type="link" size="small">更换</Button>
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="邮箱绑定">
            <Space>
              <Mail size={14} />
              {mockCurrentUser.email}
              <Button type="link" size="small">更换</Button>
            </Space>
          </Descriptions.Item>
        </Descriptions>

        <div style={{ marginTop: 16 }}>
          <h4 style={{ marginBottom: 8 }}>OAuth 绑定</h4>
          <Space direction="vertical" style={{ width: "100%" }}>
            {mockOAuthBindings.map((binding: OAuthBinding) => (
              <div key={binding.provider} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#F9FAFB", borderRadius: 4 }}>
                <span>{binding.providerName}</span>
                {binding.bound ? (
                  <Space>
                    <Tag color="success">已绑定</Tag>
                    <span style={{ color: "#6B7280" }}>{binding.boundAccount}</span>
                    <Button type="link" size="small" danger>解绑</Button>
                  </Space>
                ) : (
                  <Button type="link" size="small">绑定</Button>
                )}
              </div>
            ))}
          </Space>
        </div>
      </Card>

      {/* 登录历史 */}
      <Card title="登录历史（最近 10 条）">
        <Table
          columns={loginHistoryColumns}
          dataSource={mockLoginHistory}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Card>
    </Space>
  );

  /**
   * 渲染偏好设置 Tab
   */
  const renderPreferences = () => (
    <Space direction="vertical" style={{ width: "100%" }} size="large">
      {/* 界面设置 */}
      <Card title={<Space><Palette size={16} /> 界面设置</Space>}>
        <div style={{ display: "grid", gap: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>主题模式</span>
            <Select
              value={preferences.themeMode}
              onChange={(value) => handlePreferenceChange("themeMode", value)}
              style={{ width: 200 }}
              options={[
                { value: "light", label: "浅色" },
                { value: "dark", label: "深色" },
                { value: "system", label: "跟随系统" },
              ]}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>语言</span>
            <Select
              value={preferences.language}
              onChange={(value) => handlePreferenceChange("language", value)}
              style={{ width: 200 }}
              options={[
                { value: "zh-CN", label: "中文" },
                { value: "en-US", label: "English" },
              ]}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>侧边栏默认折叠</span>
            <Switch
              checked={preferences.sidebarCollapsed}
              onChange={(checked) => handlePreferenceChange("sidebarCollapsed", checked)}
            />
          </div>
        </div>
      </Card>

      {/* 通知设置 */}
      <Card title={<Space><Bell size={16} /> 通知设置</Space>}>
        <div style={{ display: "grid", gap: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>系统通知</span>
            <Switch
              checked={preferences.systemNotification}
              onChange={(checked) => handlePreferenceChange("systemNotification", checked)}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>邮件通知</span>
            <Switch
              checked={preferences.emailNotification}
              onChange={(checked) => handlePreferenceChange("emailNotification", checked)}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>钉钉/企业微信通知</span>
            <Switch
              checked={preferences.imNotification}
              onChange={(checked) => handlePreferenceChange("imNotification", checked)}
            />
          </div>
        </div>
      </Card>

      {/* 数据偏好 */}
      <Card title={<Space><Shield size={16} /> 数据偏好</Space>}>
        <div style={{ display: "grid", gap: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>默认数据分级</span>
            <Select
              value={preferences.defaultDataLevel}
              onChange={(value) => handlePreferenceChange("defaultDataLevel", value)}
              style={{ width: 200 }}
              options={[
                { value: "L1-公开数据", label: "L1-公开数据" },
                { value: "L2-内部数据", label: "L2-内部数据" },
                { value: "L3-核心数据", label: "L3-核心数据" },
                { value: "L4-机密数据", label: "L4-机密数据" },
              ]}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>表格每页条数</span>
            <Select
              value={preferences.tablePageSize}
              onChange={(value) => handlePreferenceChange("tablePageSize", value)}
              style={{ width: 200 }}
              options={[
                { value: 10, label: "10 条" },
                { value: 20, label: "20 条" },
                { value: 50, label: "50 条" },
                { value: 100, label: "100 条" },
              ]}
            />
          </div>
        </div>
      </Card>
    </Space>
  );

  /**
   * Tab 配置
   */
  const tabItems = [
    {
      key: "basic",
      label: "基本信息",
      icon: <User size={14} />,
      children: renderBasicInfo(),
    },
    {
      key: "security",
      label: "安全设置",
      icon: <Lock size={14} />,
      children: renderSecuritySettings(),
    },
    {
      key: "preferences",
      label: "偏好设置",
      icon: <Palette size={14} />,
      children: renderPreferences(),
    },
  ];

  return (
    <PageLayout title="个人中心">
      <PageBreadcrumb items={BREADCRUMB_ITEMS} />

      {renderUserInfoCard()}

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
      />

      {/* 修改密码弹窗 */}
      <Modal
        title="修改密码"
        open={passwordModalOpen}
        onCancel={() => setPasswordModalOpen(false)}
        footer={null}
      >
        <Form
          layout="vertical"
          onFinish={handlePasswordChange}
        >
          <Form.Item
            name="currentPassword"
            label="当前密码"
            rules={[{ required: true, message: "请输入当前密码" }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[
              { required: true, message: "请输入新密码" },
              { min: 8, message: "密码至少 8 位" },
              {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                message: "密码必须包含大小写字母和数字",
              },
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="确认密码"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: "请确认新密码" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                确认修改
              </Button>
              <Button onClick={() => setPasswordModalOpen(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </PageLayout>
  );
}