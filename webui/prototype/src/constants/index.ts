/**
 * 全局常量定义
 * 基于 design-system/navigation.md 路由规范
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
  APP_NAME: "AIDataHub",
  DEFAULT_LANGUAGE: "zh-CN",
  SUPPORTED_LANGUAGES: ["zh-CN", "en-US"],
} as const;

/**
 * 路由路径常量
 * 基于 navigation.md 定义的路由规范
 *
 * 模块路由前缀：
 * - 数据项目: /project
 * - 数据集成: /integration
 * - 数据治理: /governance
 * - 数据服务: /service
 * - 数据共享: /sharing
 * - 自助分析: /analytics
 * - 系统管理: /system
 */
export const ROUTES = {
  // ============================================
  // 公共页面
  // ============================================
  HOME: "/",
  LOGIN: "/login",
  PROFILE: "/profile",
  NOTIFICATIONS: "/notifications",

  // ============================================
  // 数据项目模块
  // ============================================
  PROJECT: "/project",
  PROJECT_DETAIL: "/project/[projectId]",
  PROJECT_TASKS: "/project/[projectId]#tasks",
  PROJECT_MILESTONES: "/project/[projectId]#milestones",
  PROJECT_DOCS: "/project/[projectId]#docs",
  PROJECT_STATS: "/project/[projectId]#stats",
  PROJECT_MEMBERS: "/project/[projectId]#members",

  // 任务调度（项目详情内部入口）
  SCHEDULER: "/project/[projectId]/scheduler",
  SCHEDULER_DAG: "/project/[projectId]/scheduler/dag",
  SCHEDULER_DAG_DETAIL: "/project/[projectId]/scheduler/dag/[dagId]",
  SCHEDULER_TASKS: "/project/[projectId]/scheduler/tasks",
  SCHEDULER_LOGS: "/project/[projectId]/scheduler/logs",

  // ============================================
  // 数据集成模块 (/integration)
  // ============================================
  INTEGRATION: "/integration",
  DATA_INTEGRATION: "/integration",
  // 数据源管理
  DATA_SOURCES: "/integration/sources",
  DATA_SOURCE_NEW: "/integration/sources/new",
  DATA_SOURCE_EDIT: "/integration/sources/[sourceId]",

  // 数据探查
  DATA_PROFILING: "/integration/profiling",
  DATA_PROFILING_DETAIL: "/integration/profiling/[taskId]",

  // 数据标准化
  DATA_STANDARDIZATION: "/integration/standardization",

  // Spark SQL 开发
  SQL_DEV: "/integration/sql-dev",

  // 数据迁移
  MIGRATION: "/integration/migration",
  MIGRATION_CREATE: "/integration/migration/create",
  MIGRATION_DETAIL: "/integration/migration/[taskId]",
  MIGRATION_EDIT: "/integration/migration/[taskId]/edit",
  MIGRATION_LOGS: "/integration/migration/[taskId]/logs",

  // 数据组织（归入数据集成）
  RESOURCE_CATALOG: "/integration/organization/catalog",
  DATA_MAPPING: "/integration/organization/mapping",

  // 基础设施（归入数据集成）
  INFRASTRUCTURE: "/integration/infrastructure",
  TENANT_MANAGEMENT: "/integration/infrastructure/tenant",
  TENANT_DETAIL: "/integration/infrastructure/tenant/[tenantId]",
  QUEUE_MANAGEMENT: "/integration/infrastructure/queue",
  QUEUE_DETAIL: "/integration/infrastructure/queue/[queueId]",
  WORKER_MANAGEMENT: "/integration/infrastructure/worker",
  WORKER_DETAIL: "/integration/infrastructure/worker/[workerId]",
  ENGINE_CONFIG: "/integration/infrastructure/engine",
  ENGINE_DETAIL: "/integration/infrastructure/engine/[engineId]",
  CONFIG_TEMPLATE: "/integration/infrastructure/template",
  TEMPLATE_DETAIL: "/integration/infrastructure/template/[templateId]",

  // 任务队列监控（归入基础设施）
  QUEUE_MONITOR: "/integration/infrastructure/queue-monitor",

  // ============================================
  // 数据治理模块 (/governance)
  // ============================================
  GOVERNANCE: "/governance",
  DATA_MAP: "/governance/data-map",
  DATA_QUALITY: "/governance/quality",
  DATA_QUALITY_DETAIL: "/governance/quality/[taskId]",
  TAG_MANAGEMENT: "/governance/tags",
  DATA_LINEAGE: "/governance/lineage",
  DATA_STANDARD: "/governance/standard",
  DATA_MODEL: "/governance/model",

  // 元数据管理（归入数据治理）
  METADATA: "/governance/metadata",
  METADATA_DETAIL: "/governance/metadata/[id]",

  // ============================================
  // 数据服务模块 (/service)
  // ============================================
  SERVICE_CATALOG: "/service/catalog",
  SERVICE_CONFIG: "/service/config",
  SERVICE_CONFIG_EDIT: "/service/config/[serviceId]",
  SERVICE_AUTHORIZATION: "/service/authorization/[serviceId]",
  SERVICE_MONITORING: "/service/monitoring",

  // ============================================
  // 数据共享模块 (/sharing) - 归入数据服务
  // ============================================
  SHARING: "/sharing",
  SHARING_TASKS: "/sharing/tasks",
  SHARING_RESOURCES: "/sharing/resources",
  SHARING_APPLICATIONS: "/sharing/application",

  // ============================================
  // 自助分析模块 (/analytics) - 归入数据服务
  // ============================================
  AD_HOC_QUERY: "/analytics/query",
  AD_HOC_VISUALIZATION: "/analytics/visualization",

  // ============================================
  // 系统管理模块 (/system)
  // ============================================
  ORG_USER: "/system/org-user",
  USER_DETAIL: "/system/user/[userId]",
  ROLE_PERMISSION: "/system/role",
  APPROVAL_TODO: "/system/approval/todo",
  APPROVAL_CONFIG: "/system/approval/config",
  SYSTEM_SETTINGS: "/system/settings",

  // 数据安全（归入系统管理）
  DESENSITIZATION: "/system/security/desensitization",
  CLASSIFICATION: "/system/security/classification",
  WATERMARK: "/system/security/watermark",
} as const;

/**
 * 路由参数名常量
 * 统一动态路由参数命名
 */
export const ROUTE_PARAMS = {
  PROJECT_ID: "projectId",
  TASK_ID: "taskId",
  SOURCE_ID: "sourceId",
  SERVICE_ID: "serviceId",
  TENANT_ID: "tenantId",
  QUEUE_ID: "queueId",
  WORKER_ID: "workerId",
  ENGINE_ID: "engineId",
  TEMPLATE_ID: "templateId",
  USER_ID: "userId",
  DAG_ID: "dagId",
} as const;

/**
 * 菜单类型定义
 * 基于 navigation.md 页面类型定义
 */
export const PAGE_TYPES = {
  MENU: "[M]",        // 菜单页面 - 出现在侧边导航菜单
  DETAIL: "[D]",      // 详情页面 - 从列表点击进入
  CONFIG: "[C]",      // 配置页面 - 新增/编辑配置
  TAB: "[T]",         // Tab页面 - 详情页内部
} as const;

/**
 * 一级菜单标识
 * 用于菜单高亮和权限控制
 */
export const MENU_KEYS = {
  HOME: "home",
  PROJECT: "project",
  INTEGRATION: "integration",
  GOVERNANCE: "governance",
  SERVICE: "service",
  SYSTEM: "system",
} as const;

/**
 * 创建动态路由路径的辅助函数
 */
export const createRoute = {
  projectDetail: (projectId: string) => `/project/${projectId}`,
  projectTasks: (projectId: string) => `/project/${projectId}#tasks`,
  projectMilestones: (projectId: string) => `/project/${projectId}#milestones`,
  projectDocs: (projectId: string) => `/project/${projectId}#docs`,
  projectStats: (projectId: string) => `/project/${projectId}#stats`,
  projectMembers: (projectId: string) => `/project/${projectId}#members`,

  schedulerDag: (projectId: string) => `/project/${projectId}/scheduler/dag`,
  schedulerDagDetail: (projectId: string, dagId: string) => `/project/${projectId}/scheduler/dag/${dagId}`,
  schedulerTasks: (projectId: string) => `/project/${projectId}/scheduler/tasks`,
  schedulerLogs: (projectId: string) => `/project/${projectId}/scheduler/logs`,

  dataSourceEdit: (sourceId: string) => `/integration/sources/${sourceId}`,
  profilingDetail: (taskId: string) => `/integration/profiling/${taskId}`,

  migrationDetail: (taskId: string) => `/integration/migration/${taskId}`,
  migrationEdit: (taskId: string) => `/integration/migration/${taskId}/edit`,
  migrationLogs: (taskId: string) => `/integration/migration/${taskId}/logs`,

  tenantDetail: (tenantId: string) => `/integration/infrastructure/tenant/${tenantId}`,
  queueDetail: (queueId: string) => `/integration/infrastructure/queue/${queueId}`,
  workerDetail: (workerId: string) => `/integration/infrastructure/worker/${workerId}`,
  engineDetail: (engineId: string) => `/integration/infrastructure/engine/${engineId}`,
  templateDetail: (templateId: string) => `/integration/infrastructure/template/${templateId}`,

  metadataDetail: (id: string) => `/governance/metadata/${id}`,
  qualityDetail: (taskId: string) => `/governance/quality/${taskId}`,

  serviceConfigEdit: (serviceId: string) => `/service/config/${serviceId}`,
  serviceAuthorization: (serviceId: string) => `/service/authorization/${serviceId}`,

  userDetail: (userId: string) => `/system/user/${userId}`,
} as const;