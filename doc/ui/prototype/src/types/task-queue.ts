/**
 * 任务队列模块类型定义
 */

/**
 * 队列状态
 */
export type QueueStatus = "running" | "paused" | "error" | "empty";

/**
 * 队列状态标签
 */
export const QUEUE_STATUS_LABELS: Record<QueueStatus, string> = {
  running: "运行中",
  paused: "已暂停",
  error: "异常",
  empty: "空队列",
};

/**
 * 队列类型
 */
export type QueueType =
  | "data_sync"      // 数据同步
  | "data_clean"     // 数据清洗
  | "feature_engine" // 特征工程
  | "quality_check"  // 质量检测
  | "report_gen"     // 报表生成
  | "data_import";   // 数据导入

/**
 * 队列类型标签
 */
export const QUEUE_TYPE_LABELS: Record<QueueType, string> = {
  data_sync: "数据同步",
  data_clean: "数据清洗",
  feature_engine: "特征工程",
  quality_check: "质量检测",
  report_gen: "报表生成",
  data_import: "数据导入",
};

/**
 * 队列信息
 */
export interface QueueInfo {
  /** 队列唯一标识 */
  id: string;
  /** 队列名称 */
  name: string;
  /** 队列类型 */
  type: QueueType;
  /** 队列状态 */
  status: QueueStatus;
  /** 队列长度（等待处理的任务数） */
  queueLength: number;
  /** 处理中任务数 */
  processingCount: number;
  /** 处理速率（任务/秒） */
  processingRate: number;
  /** 平均等待时间（秒） */
  avgWaitTime: number;
  /** 最大容量 */
  maxCapacity: number;
  /** 堆积告警阈值 */
  alertThreshold: number;
  /** 是否触发告警 */
  hasAlert: boolean;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}

/**
 * 队列任务状态
 */
export type QueueTaskStatus = "waiting" | "processing" | "completed" | "failed";

/**
 * 队列任务状态标签
 */
export const QUEUE_TASK_STATUS_LABELS: Record<QueueTaskStatus, string> = {
  waiting: "等待中",
  processing: "处理中",
  completed: "已完成",
  failed: "失败",
};

/**
 * 队列任务信息
 */
export interface QueueTask {
  /** 任务唯一标识 */
  id: string;
  /** 任务名称 */
  name: string;
  /** 所属队列ID */
  queueId: string;
  /** 任务状态 */
  status: QueueTaskStatus;
  /** 入队时间 */
  enqueueTime: string;
  /** 开始处理时间 */
  startTime?: string;
  /** 完成时间 */
  endTime?: string;
  /** 优先级 */
  priority: "high" | "medium" | "low";
  /** 错误信息 */
  errorMessage?: string;
}

/**
 * 队列容量趋势数据点
 */
export interface QueueCapacityPoint {
  /** 时间戳 */
  time: string;
  /** 队列长度 */
  queueLength: number;
  /** 处理速率 */
  processingRate: number;
  /** 平均等待时间 */
  avgWaitTime: number;
}

/**
 * 队列详情（包含任务列表和容量趋势）
 */
export interface QueueDetail extends QueueInfo {
  /** 当前队列任务列表 */
  tasks: QueueTask[];
  /** 容量趋势数据 */
  capacityTrend: QueueCapacityPoint[];
}

/**
 * 队列过滤参数
 */
export interface QueueFilterParams {
  /** 关键词搜索 */
  keyword?: string;
  /** 状态筛选 */
  status?: QueueStatus | "";
  /** 类型筛选 */
  type?: QueueType | "";
}

/**
 * 队列概览统计
 */
export interface QueueOverviewStats {
  /** 总队列数 */
  totalQueues: number;
  /** 运行中队列数 */
  runningQueues: number;
  /** 等待任务总数 */
  totalWaitingTasks: number;
  /** 平均处理速率 */
  avgProcessingRate: number;
}