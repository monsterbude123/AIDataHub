/**
 * 任务调度 Mock 数据补充
 */

import type { DAGStatus } from "@/types/scheduler";

/**
 * 任务执行状态
 */
export type TaskExecutionStatus = "success" | "failed" | "running" | "pending";

/**
 * 任务执行状态标签
 */
export const TASK_STATUS_LABELS: Record<TaskExecutionStatus, string> = {
  success: "成功",
  failed: "失败",
  running: "运行中",
  pending: "待执行",
};

/**
 * 任务在线状态
 */
export type TaskOnlineStatus = "online" | "offline";

/**
 * 运维任务信息
 */
export interface TaskOperation {
  id: string;
  name: string;
  type: string;
  scheduleType: "cron" | "event" | "dependency";
  priority: "high" | "medium" | "low";
  lastExecutionTime: string;
  lastExecutionStatus: TaskExecutionStatus;
  onlineStatus: TaskOnlineStatus;
  dagStatus: DAGStatus;
  errorMessage?: string;
}

/**
 * 运维任务列表
 */
export const mockTaskOperations: TaskOperation[] = [
  {
    id: "task-1",
    name: "客户数据同步",
    type: "数据同步",
    scheduleType: "cron",
    priority: "high",
    lastExecutionTime: "2024-01-15 08:00",
    lastExecutionStatus: "success",
    onlineStatus: "online",
    dagStatus: "published",
  },
  {
    id: "task-2",
    name: "订单数据清洗",
    type: "数据清洗",
    scheduleType: "dependency",
    priority: "medium",
    lastExecutionTime: "2024-01-15 08:30",
    lastExecutionStatus: "success",
    onlineStatus: "online",
    dagStatus: "published",
  },
  {
    id: "task-3",
    name: "用户画像构建",
    type: "特征工程",
    scheduleType: "event",
    priority: "high",
    lastExecutionTime: "2024-01-15 09:00",
    lastExecutionStatus: "running",
    onlineStatus: "online",
    dagStatus: "published",
  },
  {
    id: "task-4",
    name: "数据质量检测",
    type: "质量检测",
    scheduleType: "cron",
    priority: "medium",
    lastExecutionTime: "2024-01-15 07:00",
    lastExecutionStatus: "failed",
    onlineStatus: "online",
    dagStatus: "published",
    errorMessage: "数据源连接超时",
  },
  {
    id: "task-5",
    name: "报表数据生成",
    type: "数据处理",
    scheduleType: "cron",
    priority: "low",
    lastExecutionTime: "2024-01-14 22:00",
    lastExecutionStatus: "success",
    onlineStatus: "offline",
    dagStatus: "archived",
  },
  {
    id: "task-6",
    name: "增量数据导入",
    type: "数据导入",
    scheduleType: "dependency",
    priority: "high",
    lastExecutionTime: "2024-01-15 06:00",
    lastExecutionStatus: "success",
    onlineStatus: "online",
    dagStatus: "published",
  },
];

/**
 * 过滤运维任务
 */
export function filterTaskOperations(filters: {
  keyword?: string;
  status?: TaskExecutionStatus | "";
  scheduleType?: string;
}): TaskOperation[] {
  return mockTaskOperations.filter((item) => {
    if (filters.keyword && !item.name.toLowerCase().includes(filters.keyword.toLowerCase())) {
      return false;
    }
    if (filters.status && item.lastExecutionStatus !== filters.status) {
      return false;
    }
    if (filters.scheduleType && item.scheduleType !== filters.scheduleType) {
      return false;
    }
    return true;
  });
}