/**
 * 基础设施模块 Mock 数据
 */

import type {
  Tenant,
  ResourceQueue,
  WorkerNode,
  EngineConfig,
  ConfigTemplate,
} from "@/types/infrastructure";

/**
 * Mock 租户列表
 */
export const mockTenants: Tenant[] = [
  {
    id: "tenant-001",
    name: "研发部门",
    code: "DEV",
    cpuQuota: 100,
    memoryQuota: 256,
    storageQuota: 1024,
    status: "active",
    usedCpu: 45,
    usedMemory: 128,
    usedStorage: 512,
    createdAt: "2024-01-01 10:00:00",
    description: "研发部门专用租户",
  },
  {
    id: "tenant-002",
    name: "数据分析团队",
    code: "ANALYSIS",
    cpuQuota: 200,
    memoryQuota: 512,
    storageQuota: 2048,
    status: "active",
    usedCpu: 150,
    usedMemory: 380,
    usedStorage: 1536,
    createdAt: "2024-01-15 14:00:00",
    description: "数据分析团队租户",
  },
  {
    id: "tenant-003",
    name: "测试环境",
    code: "TEST",
    cpuQuota: 50,
    memoryQuota: 128,
    storageQuota: 256,
    status: "inactive",
    usedCpu: 0,
    usedMemory: 0,
    usedStorage: 0,
    createdAt: "2024-02-01 09:00:00",
    description: "测试环境专用",
  },
  {
    id: "tenant-004",
    name: "外部合作",
    code: "EXTERNAL",
    cpuQuota: 80,
    memoryQuota: 200,
    storageQuota: 500,
    status: "suspended",
    usedCpu: 20,
    usedMemory: 50,
    usedStorage: 100,
    createdAt: "2024-02-20 16:00:00",
    description: "外部合作伙伴租户",
  },
  {
    id: "tenant-005",
    name: "运维中心",
    code: "OPS",
    cpuQuota: 150,
    memoryQuota: 400,
    storageQuota: 800,
    status: "active",
    usedCpu: 60,
    usedMemory: 200,
    usedStorage: 400,
    createdAt: "2024-03-01 11:00:00",
    description: "运维中心租户",
  },
];

/**
 * Mock 资源队列列表
 */
export const mockResourceQueues: ResourceQueue[] = [
  {
    id: "queue-001",
    name: "高优先级队列",
    priority: "high",
    cpuAllocation: 50,
    memoryAllocation: 128,
    maxConcurrency: 10,
    status: "enabled",
    currentTasks: 5,
    tenantId: "tenant-001",
    tenantName: "研发部门",
    createdAt: "2024-01-02 10:00:00",
  },
  {
    id: "queue-002",
    name: "标准队列",
    priority: "medium",
    cpuAllocation: 30,
    memoryAllocation: 80,
    maxConcurrency: 20,
    status: "enabled",
    currentTasks: 12,
    tenantId: "tenant-001",
    tenantName: "研发部门",
    createdAt: "2024-01-02 10:00:00",
  },
  {
    id: "queue-003",
    name: "低优先级队列",
    priority: "low",
    cpuAllocation: 20,
    memoryAllocation: 48,
    maxConcurrency: 30,
    status: "enabled",
    currentTasks: 8,
    tenantId: "tenant-002",
    tenantName: "数据分析团队",
    createdAt: "2024-01-16 14:00:00",
  },
  {
    id: "queue-004",
    name: "批量处理队列",
    priority: "medium",
    cpuAllocation: 100,
    memoryAllocation: 256,
    maxConcurrency: 5,
    status: "disabled",
    currentTasks: 0,
    tenantId: "tenant-002",
    tenantName: "数据分析团队",
    createdAt: "2024-01-20 09:00:00",
  },
  {
    id: "queue-005",
    name: "实时计算队列",
    priority: "high",
    cpuAllocation: 80,
    memoryAllocation: 200,
    maxConcurrency: 15,
    status: "enabled",
    currentTasks: 3,
    tenantId: "tenant-005",
    tenantName: "运维中心",
    createdAt: "2024-03-02 11:00:00",
  },
];

/**
 * Mock Worker节点列表
 */
export const mockWorkerNodes: WorkerNode[] = [
  {
    id: "worker-001",
    name: "worker-node-01",
    ipAddress: "192.168.1.101",
    port: 8080,
    status: "online",
    taskCount: 25,
    cpuUsage: 65,
    memoryUsage: 48,
    maxCpu: 64,
    maxMemory: 128,
    lastHeartbeat: "2024-04-01 15:30:00",
    createdAt: "2024-01-01 10:00:00",
  },
  {
    id: "worker-002",
    name: "worker-node-02",
    ipAddress: "192.168.1.102",
    port: 8080,
    status: "online",
    taskCount: 18,
    cpuUsage: 42,
    memoryUsage: 35,
    maxCpu: 64,
    maxMemory: 128,
    lastHeartbeat: "2024-04-01 15:29:55",
    createdAt: "2024-01-01 10:00:00",
  },
  {
    id: "worker-003",
    name: "worker-node-03",
    ipAddress: "192.168.1.103",
    port: 8080,
    status: "offline",
    taskCount: 0,
    cpuUsage: 0,
    memoryUsage: 0,
    maxCpu: 64,
    maxMemory: 128,
    lastHeartbeat: "2024-04-01 10:00:00",
    createdAt: "2024-01-05 14:00:00",
  },
  {
    id: "worker-004",
    name: "worker-node-04",
    ipAddress: "192.168.1.104",
    port: 8080,
    status: "maintenance",
    taskCount: 5,
    cpuUsage: 15,
    memoryUsage: 12,
    maxCpu: 32,
    maxMemory: 64,
    lastHeartbeat: "2024-04-01 15:28:00",
    createdAt: "2024-02-01 09:00:00",
  },
  {
    id: "worker-005",
    name: "worker-node-05",
    ipAddress: "192.168.1.105",
    port: 8080,
    status: "online",
    taskCount: 30,
    cpuUsage: 78,
    memoryUsage: 62,
    maxCpu: 96,
    maxMemory: 192,
    lastHeartbeat: "2024-04-01 15:30:05",
    createdAt: "2024-03-01 11:00:00",
  },
];

/**
 * Mock 引擎配置列表
 */
export const mockEngineConfigs: EngineConfig[] = [
  {
    id: "engine-001",
    name: "Spark-生产集群",
    type: "spark",
    version: "3.5.0",
    configParams: {
      "spark.executor.memory": "4g",
      "spark.executor.cores": "2",
      "spark.dynamicAllocation.enabled": "true",
    },
    status: "running",
    workerCount: 10,
    createdAt: "2024-01-01 10:00:00",
    updatedAt: "2024-03-15 14:00:00",
  },
  {
    id: "engine-002",
    name: "Flink-实时处理",
    type: "flink",
    version: "1.18.0",
    configParams: {
      "taskmanager.memory.process.size": "2048m",
      "taskmanager.numberOfTaskSlots": "4",
      "parallelism.default": "8",
    },
    status: "running",
    workerCount: 8,
    createdAt: "2024-01-10 14:00:00",
    updatedAt: "2024-03-20 09:00:00",
  },
  {
    id: "engine-003",
    name: "Presto-查询引擎",
    type: "presto",
    version: "0.280",
    configParams: {
      "query.max-memory-per-node": "1GB",
      "query.max-memory": "10GB",
      "discovery.uri": "http://192.168.1.110:8080",
    },
    status: "running",
    workerCount: 5,
    createdAt: "2024-02-01 09:00:00",
    updatedAt: "2024-04-01 10:00:00",
  },
  {
    id: "engine-004",
    name: "Trino-分析引擎",
    type: "trino",
    version: "435",
    configParams: {
      "query.max-memory-per-node": "2GB",
      "query.max-memory": "20GB",
    },
    status: "stopped",
    workerCount: 0,
    createdAt: "2024-02-15 16:00:00",
    updatedAt: "2024-04-01 12:00:00",
  },
  {
    id: "engine-005",
    name: "Hive-批处理",
    type: "hive",
    version: "3.1.3",
    configParams: {
      "hive.execution.engine": "spark",
      "hive.auto.convert.join": "true",
    },
    status: "error",
    workerCount: 3,
    createdAt: "2024-03-01 11:00:00",
    updatedAt: "2024-04-01 08:00:00",
  },
];

/**
 * Mock 配置模板列表
 */
export const mockConfigTemplates: ConfigTemplate[] = [
  {
    id: "template-001",
    name: "Spark标准配置",
    type: "engine",
    applicableScenarios: "适用于中等规模数据处理任务",
    configContent: {
      executorMemory: "4g",
      executorCores: 2,
      dynamicAllocation: true,
    },
    status: "enabled",
    createdAt: "2024-01-01 10:00:00",
    updatedAt: "2024-03-01 14:00:00",
  },
  {
    id: "template-002",
    name: "Flink实时配置",
    type: "engine",
    applicableScenarios: "适用于实时流处理场景",
    configContent: {
      taskManagerMemory: "2g",
      taskSlots: 4,
      parallelism: 8,
    },
    status: "enabled",
    createdAt: "2024-01-10 14:00:00",
    updatedAt: "2024-03-10 09:00:00",
  },
  {
    id: "template-003",
    name: "高优先级队列模板",
    type: "queue",
    applicableScenarios: "用于紧急任务处理",
    configContent: {
      priority: "high",
      maxConcurrency: 10,
      cpuAllocation: 50,
    },
    status: "enabled",
    createdAt: "2024-02-01 09:00:00",
    updatedAt: "2024-03-15 11:00:00",
  },
  {
    id: "template-004",
    name: "标准Worker配置",
    type: "worker",
    applicableScenarios: "通用Worker节点配置",
    configContent: {
      maxCpu: 64,
      maxMemory: 128,
      port: 8080,
    },
    status: "enabled",
    createdAt: "2024-02-15 16:00:00",
    updatedAt: "2024-03-20 14:00:00",
  },
  {
    id: "template-005",
    name: "测试租户模板",
    type: "tenant",
    applicableScenarios: "用于测试环境租户配置",
    configContent: {
      cpuQuota: 50,
      memoryQuota: 128,
      storageQuota: 256,
    },
    status: "disabled",
    createdAt: "2024-03-01 11:00:00",
    updatedAt: "2024-03-25 10:00:00",
  },
];

/**
 * 根据ID获取租户详情
 */
export function getTenantById(id: string): Tenant | undefined {
  return mockTenants.find((tenant) => tenant.id === id);
}

/**
 * 根据租户ID获取队列列表
 */
export function getQueuesByTenantId(tenantId: string): ResourceQueue[] {
  if (!tenantId || tenantId === "all") {
    return mockResourceQueues;
  }
  return mockResourceQueues.filter((queue) => queue.tenantId === tenantId);
}

/**
 * 根据ID获取Worker节点详情
 */
export function getWorkerById(id: string): WorkerNode | undefined {
  return mockWorkerNodes.find((worker) => worker.id === id);
}

/**
 * 根据ID获取引擎配置详情
 */
export function getEngineById(id: string): EngineConfig | undefined {
  return mockEngineConfigs.find((engine) => engine.id === id);
}

/**
 * 根据ID获取配置模板详情
 */
export function getTemplateById(id: string): ConfigTemplate | undefined {
  return mockConfigTemplates.find((template) => template.id === id);
}