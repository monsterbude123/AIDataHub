/**
 * 基础设施模块类型定义
 */

/**
 * 租户信息类型
 */
export interface Tenant {
  id: string;
  name: string;
  code: string;
  cpuQuota: number;
  memoryQuota: number;
  storageQuota: number;
  status: "active" | "inactive" | "suspended";
  usedCpu: number;
  usedMemory: number;
  usedStorage: number;
  createdAt: string;
  description?: string;
}

/**
 * 租户表单数据
 */
export interface TenantFormData {
  name: string;
  code: string;
  cpuQuota: number;
  memoryQuota: number;
  storageQuota: number;
  status: "active" | "inactive" | "suspended";
  description?: string;
}

/**
 * 资源队列类型
 */
export interface ResourceQueue {
  id: string;
  name: string;
  priority: "high" | "medium" | "low";
  cpuAllocation: number;
  memoryAllocation: number;
  maxConcurrency: number;
  status: "enabled" | "disabled";
  currentTasks: number;
  tenantId: string;
  tenantName?: string;
  createdAt: string;
}

/**
 * 资源队列表单数据
 */
export interface ResourceQueueFormData {
  name: string;
  priority: "high" | "medium" | "low";
  cpuAllocation: number;
  memoryAllocation: number;
  maxConcurrency: number;
  status: "enabled" | "disabled";
  tenantId: string;
}

/**
 * Worker节点类型
 */
export interface WorkerNode {
  id: string;
  name: string;
  ipAddress: string;
  port: number;
  status: "online" | "offline" | "maintenance";
  taskCount: number;
  cpuUsage: number;
  memoryUsage: number;
  maxCpu: number;
  maxMemory: number;
  lastHeartbeat: string;
  createdAt: string;
}

/**
 * Worker节点表单数据
 */
export interface WorkerNodeFormData {
  name: string;
  ipAddress: string;
  port: number;
  maxCpu: number;
  maxMemory: number;
}

/**
 * 引擎类型
 */
export type EngineType = "spark" | "flink" | "presto" | "trino" | "hive";

/**
 * 引擎配置类型
 */
export interface EngineConfig {
  id: string;
  name: string;
  type: EngineType;
  version: string;
  configParams: Record<string, string>;
  status: "running" | "stopped" | "error";
  workerCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 引擎配置表单数据
 */
export interface EngineConfigFormData {
  name: string;
  type: EngineType;
  version: string;
  configParams: Record<string, string>;
  workerCount: number;
}

/**
 * 配置模板类型
 */
export type TemplateType = "engine" | "queue" | "worker" | "tenant";

/**
 * 配置模板类型
 */
export interface ConfigTemplate {
  id: string;
  name: string;
  type: TemplateType;
  applicableScenarios: string;
  configContent: Record<string, unknown>;
  status: "enabled" | "disabled";
  createdAt: string;
  updatedAt: string;
}

/**
 * 配置模板表单数据
 */
export interface ConfigTemplateFormData {
  name: string;
  type: TemplateType;
  applicableScenarios: string;
  configContent: Record<string, unknown>;
  status: "enabled" | "disabled";
}

/**
 * 状态标签映射
 */
export const TENANT_STATUS_LABELS: Record<Tenant["status"], string> = {
  active: "活跃",
  inactive: "未激活",
  suspended: "已暂停",
};

export const QUEUE_STATUS_LABELS: Record<ResourceQueue["status"], string> = {
  enabled: "启用",
  disabled: "禁用",
};

export const WORKER_STATUS_LABELS: Record<WorkerNode["status"], string> = {
  online: "在线",
  offline: "离线",
  maintenance: "维护中",
};

export const ENGINE_STATUS_LABELS: Record<EngineConfig["status"], string> = {
  running: "运行中",
  stopped: "已停止",
  error: "异常",
};

export const ENGINE_TYPE_LABELS: Record<EngineType, string> = {
  spark: "Spark",
  flink: "Flink",
  presto: "Presto",
  trino: "Trino",
  hive: "Hive",
};

export const TEMPLATE_TYPE_LABELS: Record<TemplateType, string> = {
  engine: "引擎模板",
  queue: "队列模板",
  worker: "Worker模板",
  tenant: "租户模板",
};

export const PRIORITY_LABELS: Record<ResourceQueue["priority"], string> = {
  high: "高",
  medium: "中",
  low: "低",
};