/**
 * 任务队列 Mock 数据
 */

import type {
  QueueInfo,
  QueueDetail,
  QueueTask,
  QueueCapacityPoint,
  QueueFilterParams,
  QueueOverviewStats,
} from "@/types/task-queue";

/**
 * Mock 队列列表数据
 */
export const mockQueues: QueueInfo[] = [
  {
    id: "queue-1",
    name: "data-sync-queue",
    type: "data_sync",
    status: "running",
    queueLength: 45,
    processingCount: 5,
    processingRate: 12.5,
    avgWaitTime: 180,
    maxCapacity: 200,
    alertThreshold: 100,
    hasAlert: false,
    createdAt: "2024-01-01 00:00",
    updatedAt: "2024-01-15 10:30",
  },
  {
    id: "queue-2",
    name: "data-clean-queue",
    type: "data_clean",
    status: "running",
    queueLength: 120,
    processingCount: 8,
    processingRate: 8.0,
    avgWaitTime: 360,
    maxCapacity: 500,
    alertThreshold: 100,
    hasAlert: true,
    createdAt: "2024-01-01 00:00",
    updatedAt: "2024-01-15 10:30",
  },
  {
    id: "queue-3",
    name: "feature-engine-queue",
    type: "feature_engine",
    status: "running",
    queueLength: 30,
    processingCount: 3,
    processingRate: 5.0,
    avgWaitTime: 240,
    maxCapacity: 100,
    alertThreshold: 50,
    hasAlert: false,
    createdAt: "2024-01-01 00:00",
    updatedAt: "2024-01-15 10:30",
  },
  {
    id: "queue-4",
    name: "quality-check-queue",
    type: "quality_check",
    status: "paused",
    queueLength: 25,
    processingCount: 0,
    processingRate: 0,
    avgWaitTime: 0,
    maxCapacity: 50,
    alertThreshold: 30,
    hasAlert: false,
    createdAt: "2024-01-01 00:00",
    updatedAt: "2024-01-15 10:30",
  },
  {
    id: "queue-5",
    name: "report-gen-queue",
    type: "report_gen",
    status: "running",
    queueLength: 15,
    processingCount: 2,
    processingRate: 3.0,
    avgWaitTime: 120,
    maxCapacity: 30,
    alertThreshold: 20,
    hasAlert: false,
    createdAt: "2024-01-01 00:00",
    updatedAt: "2024-01-15 10:30",
  },
  {
    id: "queue-6",
    name: "data-import-queue",
    type: "data_import",
    status: "error",
    queueLength: 50,
    processingCount: 0,
    processingRate: 0,
    avgWaitTime: 600,
    maxCapacity: 100,
    alertThreshold: 40,
    hasAlert: true,
    createdAt: "2024-01-01 00:00",
    updatedAt: "2024-01-15 10:30",
  },
  {
    id: "queue-7",
    name: "realtime-sync-queue",
    type: "data_sync",
    status: "running",
    queueLength: 0,
    processingCount: 1,
    processingRate: 25.0,
    avgWaitTime: 10,
    maxCapacity: 1000,
    alertThreshold: 500,
    hasAlert: false,
    createdAt: "2024-01-01 00:00",
    updatedAt: "2024-01-15 10:30",
  },
  {
    id: "queue-8",
    name: "batch-clean-queue",
    type: "data_clean",
    status: "empty",
    queueLength: 0,
    processingCount: 0,
    processingRate: 0,
    avgWaitTime: 0,
    maxCapacity: 200,
    alertThreshold: 100,
    hasAlert: false,
    createdAt: "2024-01-01 00:00",
    updatedAt: "2024-01-15 10:30",
  },
];

/**
 * Mock 队列任务数据
 */
export const mockQueueTasks: QueueTask[] = [
  {
    id: "task-1",
    name: "客户数据同步任务",
    queueId: "queue-1",
    status: "waiting",
    enqueueTime: "2024-01-15 10:00",
    priority: "high",
  },
  {
    id: "task-2",
    name: "订单数据同步任务",
    queueId: "queue-1",
    status: "processing",
    enqueueTime: "2024-01-15 09:30",
    startTime: "2024-01-15 10:15",
    priority: "high",
  },
  {
    id: "task-3",
    name: "用户数据清洗任务",
    queueId: "queue-2",
    status: "waiting",
    enqueueTime: "2024-01-15 09:00",
    priority: "medium",
  },
  {
    id: "task-4",
    name: "日志数据清洗任务",
    queueId: "queue-2",
    status: "waiting",
    enqueueTime: "2024-01-15 08:30",
    priority: "low",
  },
  {
    id: "task-5",
    name: "特征提取任务",
    queueId: "queue-3",
    status: "processing",
    enqueueTime: "2024-01-15 09:45",
    startTime: "2024-01-15 10:00",
    priority: "high",
  },
  {
    id: "task-6",
    name: "质量检测任务",
    queueId: "queue-4",
    status: "waiting",
    enqueueTime: "2024-01-15 08:00",
    priority: "medium",
  },
  {
    id: "task-7",
    name: "日报生成任务",
    queueId: "queue-5",
    status: "completed",
    enqueueTime: "2024-01-15 07:00",
    startTime: "2024-01-15 07:30",
    endTime: "2024-01-15 08:00",
    priority: "low",
  },
  {
    id: "task-8",
    name: "历史数据导入任务",
    queueId: "queue-6",
    status: "failed",
    enqueueTime: "2024-01-15 06:00",
    startTime: "2024-01-15 06:30",
    endTime: "2024-01-15 06:45",
    priority: "high",
    errorMessage: "数据库连接超时",
  },
];

/**
 * Mock 队列容量趋势数据
 */
function generateCapacityTrend(queueId: string): QueueCapacityPoint[] {
  const points: QueueCapacityPoint[] = [];
  const baseLength = mockQueues.find((q) => q.id === queueId)?.queueLength ?? 50;

  for (let i = 60; i >= 0; i -= 5) {
    const time = new Date(Date.now() - i * 60 * 1000);
    const variation = Math.random() * 20 - 10;
    points.push({
      time: time.toISOString().slice(0, 16).replace("T", " "),
      queueLength: Math.max(0, Math.round(baseLength + variation)),
      processingRate: Math.round((Math.random() * 5 + 5) * 10) / 10,
      avgWaitTime: Math.round(Math.random() * 200 + 100),
    });
  }

  return points;
}

/**
 * 获取队列详情
 */
export function getQueueDetail(queueId: string): QueueDetail {
  const queue = mockQueues.find((q) => q.id === queueId);
  if (!queue) {
    throw new Error(`Queue ${queueId} not found`);
  }

  const tasks = mockQueueTasks.filter((t) => t.queueId === queueId);
  const capacityTrend = generateCapacityTrend(queueId);

  return {
    ...queue,
    tasks,
    capacityTrend,
  };
}

/**
 * 过滤队列列表
 */
export function filterQueues(filters: QueueFilterParams): QueueInfo[] {
  return mockQueues.filter((queue) => {
    if (filters.keyword && !queue.name.toLowerCase().includes(filters.keyword.toLowerCase())) {
      return false;
    }
    if (filters.status && queue.status !== filters.status) {
      return false;
    }
    if (filters.type && queue.type !== filters.type) {
      return false;
    }
    return true;
  });
}

/**
 * 获取队列概览统计
 */
export function getQueueOverviewStats(): QueueOverviewStats {
  const runningQueues = mockQueues.filter((q) => q.status === "running").length;
  const totalWaitingTasks = mockQueues.reduce((sum, q) => sum + q.queueLength, 0);
  const runningRates = mockQueues
    .filter((q) => q.status === "running")
    .map((q) => q.processingRate);
  const avgProcessingRate =
    runningRates.length > 0
      ? runningRates.reduce((sum, r) => sum + r, 0) / runningRates.length
      : 0;

  return {
    totalQueues: mockQueues.length,
    runningQueues,
    totalWaitingTasks,
    avgProcessingRate: Math.round(avgProcessingRate * 10) / 10,
  };
}

/**
 * 暂停队列（Mock 操作）
 */
export function pauseQueue(queueId: string): boolean {
  const queue = mockQueues.find((q) => q.id === queueId);
  if (queue && queue.status === "running") {
    queue.status = "paused";
    queue.processingRate = 0;
    queue.updatedAt = new Date().toISOString().slice(0, 16).replace("T", " ");
    return true;
  }
  return false;
}

/**
 * 恢复队列（Mock 操作）
 */
export function resumeQueue(queueId: string): boolean {
  const queue = mockQueues.find((q) => q.id === queueId);
  if (queue && (queue.status === "paused" || queue.status === "error")) {
    queue.status = "running";
    queue.processingRate = Math.random() * 10 + 5;
    queue.updatedAt = new Date().toISOString().slice(0, 16).replace("T", " ");
    return true;
  }
  return false;
}

/**
 * 清空队列（Mock 操作）
 */
export function clearQueue(queueId: string): boolean {
  const queue = mockQueues.find((q) => q.id === queueId);
  if (queue && queue.queueLength > 0) {
    queue.queueLength = 0;
    queue.hasAlert = false;
    queue.updatedAt = new Date().toISOString().slice(0, 16).replace("T", " ");
    return true;
  }
  return false;
}