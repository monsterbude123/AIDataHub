/**
 * 用户相关类型定义
 */

/**
 * 用户性别
 */
export type UserGender = "male" | "female";

/**
 * 用户信息
 */
export interface UserProfile {
  /** 用户ID */
  id: string;
  /** 登录账号 */
  username: string;
  /** 姓名 */
  name: string;
  /** 头像URL */
  avatar?: string;
  /** 性别 */
  gender: UserGender;
  /** 手机号 */
  phone: string;
  /** 邮箱 */
  email: string;
  /** 所属机构ID */
  orgId: string;
  /** 所属机构名称 */
  orgName: string;
  /** 角色列表 */
  roles: UserRole[];
  /** 数据分级 */
  dataLevel: string;
  /** 创建时间 */
  createTime: string;
  /** 最后登录时间 */
  lastLoginTime?: string;
}

/**
 * 用户角色
 */
export interface UserRole {
  id: string;
  name: string;
  code: string;
}

/**
 * 登录历史记录
 */
export interface LoginHistory {
  id: string;
  loginTime: string;
  ip: string;
  device: string;
  browser: string;
  loginMethod: "password" | "oauth" | "ldap";
  status: "success" | "failed";
}

/**
 * 用户偏好设置
 */
export interface UserPreferences {
  /** 主题模式 */
  themeMode: "light" | "dark" | "system";
  /** 语言 */
  language: "zh-CN" | "en-US";
  /** 侧边栏默认折叠 */
  sidebarCollapsed: boolean;
  /** 系统通知开关 */
  systemNotification: boolean;
  /** 邮件通知开关 */
  emailNotification: boolean;
  /** 钉钉/企业微信通知开关 */
  imNotification: boolean;
  /** 默认数据分级 */
  defaultDataLevel: string;
  /** 默认数据源 */
  defaultDataSource: string;
  /** 表格每页条数 */
  tablePageSize: 10 | 20 | 50 | 100;
}

/**
 * OAuth 绑定信息
 */
export interface OAuthBinding {
  provider: "wecom" | "dingtalk" | "feishu";
  providerName: string;
  bound: boolean;
  boundAccount?: string;
  boundTime?: string;
}

/**
 * 密码修改请求
 */
export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * 用户基本信息修改请求
 */
export interface ProfileUpdateRequest {
  name?: string;
  gender?: UserGender;
  phone?: string;
  email?: string;
  avatar?: string;
}