/**
 * 系统设置 Mock 数据
 */

/**
 * 存储类型
 */
export type StorageType = "local" | "minio" | "oss" | "s3";

/**
 * 基础配置
 */
export interface BaseSettings {
  systemName: string;
  systemLogo?: string;
  systemDescription: string;
  copyrightInfo: string;
  allowSelfRegister: boolean;
  allowMultiLogin: boolean;
  allowPasswordRecovery: boolean;
  enableOperationLog: boolean;
  sessionTimeout: number; // 分钟
  captchaValidity: number; // 分钟
  tokenValidity: number; // 小时
}

/**
 * 邮件服务配置
 */
export interface EmailSettings {
  smtpServer: string;
  smtpPort: number;
  senderEmail: string;
  senderName: string;
  authUsername: string;
  authPassword: string;
  enableSSL: boolean;
}

/**
 * 存储配置
 */
export interface StorageSettings {
  storageType: StorageType;
  // 本地存储配置
  localPath?: string;
  localMaxFileSize?: number; // MB
  localAllowedTypes?: string[];
  // 对象存储配置
  endpoint?: string;
  accessKey?: string;
  secretKey?: string;
  bucket?: string;
  region?: string;
}

/**
 * 安全策略配置
 */
export interface SecuritySettings {
  passwordMinLength: number;
  passwordComplexity: ("uppercase" | "lowercase" | "number" | "special")[];
  passwordValidityDays: number;
  passwordHistoryCount: number;
  loginLockCount: number;
  ipWhitelist: string[];
  loginMethods: ("password" | "oauth" | "ldap")[];
  enableMFA: boolean;
  enable异地LoginAlert: boolean;
}

/**
 * 日志配置
 */
export interface LogSettings {
  apiLogLevel: "DEBUG" | "INFO" | "WARN" | "ERROR";
  taskLogLevel: "DEBUG" | "INFO" | "WARN" | "ERROR";
  auditLogLevel: "DEBUG" | "INFO" | "WARN" | "ERROR";
  operationLogRetention: number; // 天
  loginLogRetention: number; // 天
  taskLogRetention: number; // 天
  maxStorageSpace: number; // GB
}

/**
 * 系统设置汇总
 */
export interface SystemSettings {
  base: BaseSettings;
  email: EmailSettings;
  storage: StorageSettings;
  security: SecuritySettings;
  log: LogSettings;
}

/**
 * Mock 基础配置
 */
export const mockBaseSettings: BaseSettings = {
  systemName: "AI DataHub 数据中台",
  systemLogo: "/logo.png",
  systemDescription: "企业级数据中台，提供数据集成、治理、服务一体化解决方案",
  copyrightInfo: "© 2024 AI DataHub. All rights reserved.",
  allowSelfRegister: false,
  allowMultiLogin: true,
  allowPasswordRecovery: true,
  enableOperationLog: true,
  sessionTimeout: 30,
  captchaValidity: 5,
  tokenValidity: 24,
};

/**
 * Mock 邮件服务配置
 */
export const mockEmailSettings: EmailSettings = {
  smtpServer: "smtp.example.com",
  smtpPort: 465,
  senderEmail: "noreply@example.com",
  senderName: "AI DataHub",
  authUsername: "noreply@example.com",
  authPassword: "********",
  enableSSL: true,
};

/**
 * Mock 存储配置
 */
export const mockStorageSettings: StorageSettings = {
  storageType: "minio",
  endpoint: "http://minio.internal:9000",
  accessKey: "minioadmin",
  secretKey: "********",
  bucket: "datahub-files",
  region: "",
};

/**
 * Mock 安全策略配置
 */
export const mockSecuritySettings: SecuritySettings = {
  passwordMinLength: 8,
  passwordComplexity: ["uppercase", "lowercase", "number"],
  passwordValidityDays: 90,
  passwordHistoryCount: 5,
  loginLockCount: 5,
  ipWhitelist: ["192.168.0.0/16", "10.0.0.0/8"],
  loginMethods: ["password", "oauth", "ldap"],
  enableMFA: false,
  enable异地LoginAlert: true,
};

/**
 * Mock 日志配置
 */
export const mockLogSettings: LogSettings = {
  apiLogLevel: "INFO",
  taskLogLevel: "INFO",
  auditLogLevel: "WARN",
  operationLogRetention: 90,
  loginLogRetention: 180,
  taskLogRetention: 30,
  maxStorageSpace: 50,
};

/**
 * Mock 系统完整设置
 */
export const mockSystemSettings: SystemSettings = {
  base: mockBaseSettings,
  email: mockEmailSettings,
  storage: mockStorageSettings,
  security: mockSecuritySettings,
  log: mockLogSettings,
};

/**
 * 存储类型选项
 */
export const STORAGE_TYPE_OPTIONS = [
  { value: "local", label: "本地存储" },
  { value: "minio", label: "MinIO" },
  { value: "oss", label: "阿里云 OSS" },
  { value: "s3", label: "AWS S3" },
];

/**
 * 日志级别选项
 */
export const LOG_LEVEL_OPTIONS = [
  { value: "DEBUG", label: "DEBUG" },
  { value: "INFO", label: "INFO" },
  { value: "WARN", label: "WARN" },
  { value: "ERROR", label: "ERROR" },
];

/**
 * 密码复杂度选项
 */
export const PASSWORD_COMPLEXITY_OPTIONS = [
  { value: "uppercase", label: "大写字母" },
  { value: "lowercase", label: "小写字母" },
  { value: "number", label: "数字" },
  { value: "special", label: "特殊字符" },
];

/**
 * 登录方式选项
 */
export const LOGIN_METHOD_OPTIONS = [
  { value: "password", label: "密码登录" },
  { value: "oauth", label: "OAuth 登录" },
  { value: "ldap", label: "LDAP 登录" },
];