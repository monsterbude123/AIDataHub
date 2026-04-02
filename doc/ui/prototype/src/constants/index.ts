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
  // 公共页面
  HOME: "/",
  LOGIN: "/login",
  PROFILE: "/profile",

  // 数据项目
  PROJECT: "/project",

  // 数据集成
  DATA_INTEGRATION: "/integration",
  DATA_SOURCES: "/integration/sources",
  DATA_SOURCE_CONFIG: "/integration/config",
  DATA_PROFILING: "/integration/profiling",
  DATA_STANDARDIZATION: "/integration/standardization",
  SQL_DEV: "/integration/sql-dev",

  // 数据服务
  DATA_SERVICE: "/service",
  SERVICE_CATALOG: "/service/catalog",
  SERVICE_CONFIG: "/service/config",
  SERVICE_AUTHORIZATION: "/service/authorization",
  SERVICE_MONITORING: "/service/monitoring",

  // 元数据管理
  METADATA: "/metadata/list",
  METADATA_DETAIL: "/metadata/detail",

  // 数据组织
  DATA_ORGANIZATION: "/organization",
  RESOURCE_CATALOG: "/organization/catalog",
  DATA_MAPPING: "/organization/mapping",

  // 数据治理
  GOVERNANCE: "/governance",
  DATA_QUALITY: "/governance/data-quality",
  DATA_MAP: "/governance/data-map",
  DATA_LINEAGE: "/governance/lineage",
  TAG_MANAGEMENT: "/governance/tags",
  DATA_STANDARD: "/governance/standard",
  DATA_MODEL: "/governance/model",

  // 数据安全
  SECURITY: "/security",
  CLASSIFICATION: "/security/classification",
  DESENSITIZATION: "/security/desensitization",
  WATERMARK: "/security/watermark",

  // 任务调度
  SCHEDULER: "/scheduler",
  DAG: "/scheduler/dag",
  TASK_LIST: "/scheduler/tasks",
  LOG_CENTER: "/scheduler/logs",

  // 数据分析
  ANALYTICS: "/analytics",
  AD_HOC_QUERY: "/analytics/query",
  AD_HOC_VISUALIZATION: "/analytics/visualization",

  // 数据共享
  SHARING: "/sharing",
  SHARING_HOME: "/sharing/home",
  SHARING_TASKS: "/sharing/tasks",
  SHARING_RESOURCES: "/sharing/resources",
  SHARING_APPLICATIONS: "/sharing/applications",

  // 系统管理
  SYSTEM: "/system",
  ORG_USER: "/system/org-user",
  ROLE_PERMISSION: "/system/role-permission",
  APPROVAL_CONFIG: "/system/approval-config",
  APPROVAL_TODO: "/system/approval-todo",
  SYSTEM_SETTINGS: "/system/settings",

  // 基础设施
  TENANT_MANAGEMENT: "/infrastructure/tenant",
  QUEUE_MANAGEMENT: "/infrastructure/queue",
  WORKER_MANAGEMENT: "/infrastructure/worker",
  ENGINE_CONFIG: "/infrastructure/engine",
  CONFIG_TEMPLATE: "/infrastructure/template",

  // 任务队列
  TASK_QUEUE: "/task-queue",
  QUEUE_MONITOR: "/task-queue/monitor",

  // 通知中心
  NOTIFICATIONS: "/notifications",
} as const;