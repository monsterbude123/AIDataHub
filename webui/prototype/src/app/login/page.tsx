"use client";

/**
 * 登录页面
 * 页面路径: /login
 */

import { useState } from "react";
import { Form, Input, Button, Checkbox, Divider, message } from "antd";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { ROUTES } from "@/constants";

/**
 * 登录表单字段
 */
interface LoginFormValues {
  username: string;
  password: string;
  remember: boolean;
}

/**
 * 登录页面组件
 */
export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const router = useRouter();

  /**
   * 处理登录提交
   */
  const handleSubmit = async (values: LoginFormValues) => {
    setLoading(true);

    try {
      // 模拟登录请求
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // 模拟登录成功
      message.success("登录成功");
      router.push(ROUTES.HOME);
    } catch {
      message.error("登录失败，请检查用户名和密码");
    } finally {
      setLoading(false);
    }
  };

  /**
   * 第三方登录按钮
   */
  const handleThirdPartyLogin = (provider: string) => {
    message.info(`${provider} 登录功能开发中...`);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      {/* 左侧品牌区域 - 仅桌面端显示 */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: 48,
          color: "#fff",
        }}
        className="login-brand-section"
      >
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <h1 style={{ fontSize: 48, fontWeight: 700, marginBottom: 24 }}>
            AIDataHub
          </h1>
          <p style={{ fontSize: 24, marginBottom: 16 }}>
            企业级数据中台
          </p>
          <p style={{ fontSize: 16, opacity: 0.8 }}>
            统一数据管理、数据治理、数据服务平台
          </p>
        </div>
      </div>

      {/* 右侧登录表单区域 */}
      <div
        style={{
          width: 480,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: 48,
          background: "#fff",
        }}
      >
        <div style={{ width: "100%", maxWidth: 360 }}>
          {/* Logo - 移动端显示 */}
          <div
            style={{
              textAlign: "center",
              marginBottom: 32,
              display: "none",
            }}
            className="login-mobile-logo"
          >
            <h1 style={{ fontSize: 28, fontWeight: 700, color: "#2563EB" }}>
              AIDataHub
            </h1>
          </div>

          {/* 标题 */}
          <h2
            style={{
              fontSize: 24,
              fontWeight: 600,
              color: "#1E293B",
              marginBottom: 8,
              textAlign: "center",
            }}
          >
            欢迎登录
          </h2>
          <p
            style={{
              fontSize: 14,
              color: "#6B7280",
              marginBottom: 32,
              textAlign: "center",
            }}
          >
            请输入您的账号信息
          </p>

          {/* 登录表单 */}
          <Form
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ remember: false }}
            size="large"
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: "请输入用户名" }]}
            >
              <Input
                prefix={<User size={16} style={{ color: "#94A3B8" }} />}
                placeholder="用户名 / 账号"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: "请输入密码" }]}
            >
              <Input
                prefix={<Lock size={16} style={{ color: "#94A3B8" }} />}
                suffix={
                  <button
                    type="button"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    style={{
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    {passwordVisible ? (
                      <EyeOff size={16} style={{ color: "#94A3B8" }} />
                    ) : (
                      <Eye size={16} style={{ color: "#94A3B8" }} />
                    )}
                  </button>
                }
                type={passwordVisible ? "text" : "password"}
                placeholder="密码"
              />
            </Form.Item>

            <Form.Item name="remember" valuePropName="checked">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Checkbox>记住我</Checkbox>
                <Link
                  href="/forgot-password"
                  style={{ color: "#2563EB", fontSize: 14 }}
                >
                  忘记密码？
                </Link>
              </div>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                style={{
                  height: 44,
                  fontSize: 16,
                  fontWeight: 500,
                }}
              >
                登录
              </Button>
            </Form.Item>
          </Form>

          <Divider style={{ margin: "24px 0" }}>
            <span style={{ color: "#94A3B8", fontSize: 12 }}>其他登录方式</span>
          </Divider>

          {/* 第三方登录 */}
          <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
            <Button
              onClick={() => handleThirdPartyLogin("OAuth2")}
              style={{ width: 48, height: 48, borderRadius: "50%" }}
            >
              OA
            </Button>
            <Button
              onClick={() => handleThirdPartyLogin("LDAP")}
              style={{ width: 48, height: 48, borderRadius: "50%" }}
            >
              LD
            </Button>
            <Button
              onClick={() => handleThirdPartyLogin("AD")}
              style={{ width: 48, height: 48, borderRadius: "50%" }}
            >
              AD
            </Button>
          </div>

          {/* 注册链接 */}
          <p
            style={{
              textAlign: "center",
              marginTop: 24,
              fontSize: 14,
              color: "#6B7280",
            }}
          >
            还没有账号？{" "}
            <Link href="/register" style={{ color: "#2563EB" }}>
              注册新账号
            </Link>
          </p>
        </div>
      </div>

      {/* 响应式样式 */}
      <style jsx global>{`
        @media (max-width: 768px) {
          .login-brand-section {
            display: none !important;
          }
          .login-mobile-logo {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}