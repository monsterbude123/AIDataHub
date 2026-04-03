/**
 * 用户相关 Mock 数据
 */

import type {
  UserProfile,
  LoginHistory,
  UserPreferences,
  OAuthBinding,
} from "@/types/user";

/**
 * 当前用户信息
 */
export const mockCurrentUser: UserProfile = {
  id: "user-001",
  username: "admin",
  name: "张三",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
  gender: "male",
  phone: "13812345678",
  email: "zhangsan@example.com",
  orgId: "org-001",
  orgName: "数据中心 / 数据开发部",
  roles: [
    { id: "role-001", name: "系统管理员", code: "admin" },
    { id: "role-002", name: "数据开发人员", code: "data_dev" },
  ],
  dataLevel: "L3-核心数据",
  createTime: "2023-06-15 10:00:00",
  lastLoginTime: "2024-01-15 09:30:00",
};

/**
 * 登录历史记录
 */
export const mockLoginHistory: LoginHistory[] = [
  {
    id: "login-001",
    loginTime: "2024-01-15 09:30:00",
    ip: "192.168.1.100",
    device: "Windows 10",
    browser: "Chrome 120",
    loginMethod: "password",
    status: "success",
  },
  {
    id: "login-002",
    loginTime: "2024-01-14 18:00:00",
    ip: "192.168.1.100",
    device: "Windows 10",
    browser: "Chrome 120",
    loginMethod: "password",
    status: "success",
  },
  {
    id: "login-003",
    loginTime: "2024-01-14 09:00:00",
    ip: "10.0.0.50",
    device: "MacOS",
    browser: "Safari 17",
    loginMethod: "oauth",
    status: "success",
  },
  {
    id: "login-004",
    loginTime: "2024-01-13 17:30:00",
    ip: "192.168.2.200",
    device: "Windows 10",
    browser: "Edge 120",
    loginMethod: "password",
    status: "success",
  },
  {
    id: "login-005",
    loginTime: "2024-01-13 09:15:00",
    ip: "192.168.1.100",
    device: "Windows 10",
    browser: "Chrome 119",
    loginMethod: "password",
    status: "success",
  },
  {
    id: "login-006",
    loginTime: "2024-01-12 14:00:00",
    ip: "192.168.1.150",
    device: "iPhone",
    browser: "Mobile Safari",
    loginMethod: "oauth",
    status: "success",
  },
  {
    id: "login-007",
    loginTime: "2024-01-11 10:00:00",
    ip: "未知",
    device: "未知",
    browser: "未知",
    loginMethod: "password",
    status: "failed",
  },
  {
    id: "login-008",
    loginTime: "2024-01-10 09:00:00",
    ip: "192.168.1.100",
    device: "Windows 10",
    browser: "Chrome 118",
    loginMethod: "ldap",
    status: "success",
  },
];

/**
 * 用户偏好设置
 */
export const mockUserPreferences: UserPreferences = {
  themeMode: "light",
  language: "zh-CN",
  sidebarCollapsed: false,
  systemNotification: true,
  emailNotification: true,
  imNotification: false,
  defaultDataLevel: "L1-公开数据",
  defaultDataSource: "mysql-prod",
  tablePageSize: 20,
};

/**
 * OAuth 绑定信息
 */
export const mockOAuthBindings: OAuthBinding[] = [
  {
    provider: "wecom",
    providerName: "企业微信",
    bound: true,
    boundAccount: "张三",
    boundTime: "2023-06-20 10:00:00",
  },
  {
    provider: "dingtalk",
    providerName: "钉钉",
    bound: false,
  },
  {
    provider: "feishu",
    providerName: "飞书",
    bound: false,
  },
];

/**
 * 获取登录方式标签
 */
export function getLoginMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    password: "密码登录",
    oauth: "OAuth 登录",
    ldap: "LDAP 登录",
  };
  return labels[method] || method;
}

/**
 * 获取登录状态标签
 */
export function getLoginStatusLabel(status: string): string {
  return status === "success" ? "成功" : "失败";
}