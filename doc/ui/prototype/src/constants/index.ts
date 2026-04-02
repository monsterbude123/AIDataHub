/**
 * 全局常量定义
 */

/**
 * 分页相关常量
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

/**
 * API 状态码
 */
export const API_CODE = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
} as const;

/**
 * 应用配置常量
 */
export const APP_CONFIG = {
  APP_NAME: "AI DataHub Prototype",
  DEFAULT_LANGUAGE: "zh-CN",
  SUPPORTED_LANGUAGES: ["zh-CN", "en-US"],
} as const;

/**
 * 路由路径常量
 */
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  DATA: "/data",
  METADATA: "/metadata",
  // 数据集成
  DATA_INTEGRATION: "/data-integration",
  DATA_SOURCES: "/data-integration/sources",
  DATA_SOURCE_CONFIG: "/data-integration/config",
  DATA_PROFILING: "/data-integration/profiling",
  DATA_STANDARDIZATION: "/data-integration/standardization",
  SQL_DEV: "/data-integration/sql-dev",
  // 数据治理
  GOVERNANCE: "/governance",
  DATA_QUALITY: "/governance/data-quality",
  DATA_MAP: "/governance/data-map",
  DATA_LINEAGE: "/governance/lineage",
  TAG_MANAGEMENT: "/governance/tags",
  DATA_STANDARD: "/governance/standard",
  DATA_MODEL: "/governance/model",
  // 系统管理
  SYSTEM: "/system",
  ORG_USER: "/system/org-user",
  ROLE_PERMISSION: "/system/role-permission",
  APPROVAL_CONFIG: "/system/approval-config",
  APPROVAL_TODO: "/system/approval-todo",
  // 任务调度
  SCHEDULER: "/scheduler",
  DAG: "/scheduler/dag",
  TASK_LIST: "/scheduler/tasks",
  LOG_CENTER: "/scheduler/logs",
} as const;