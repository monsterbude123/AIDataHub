/**
 * 任务运维报表导出服务
 * 实现任务运行统计与 Excel 导出功能
 */

import * as XLSX from "xlsx";
import type { TaskOperation, TaskExecutionStatus } from "../mock/task-operation";
import { TASK_STATUS_LABELS } from "../mock/task-operation";

/**
 * 任务统计结果
 */
export interface TaskStatistics {
  /** 总任务数 */
  total: number;
  /** 成功任务数 */
  success: number;
  /** 失败任务数 */
  failed: number;
  /** 运行中任务数 */
  running: number;
  /** 待执行任务数 */
  pending: number;
  /** 成功率 (百分比) */
  successRate: number;
  /** 在线任务数 */
  online: number;
  /** 下线任务数 */
  offline: number;
}

/**
 * 按类型分组统计
 */
export interface TaskTypeStatistics {
  /** 任务类型 */
  type: string;
  /** 该类型任务数 */
  count: number;
  /** 该类型成功数 */
  successCount: number;
  /** 该类型失败数 */
  failedCount: number;
  /** 该类型成功率 */
  successRate: number;
}

/**
 * 按调度类型分组统计
 */
export interface ScheduleTypeStatistics {
  /** 调度类型 */
  scheduleType: string;
  /** 调度类型标签 */
  label: string;
  /** 该类型任务数 */
  count: number;
  /** 该类型成功率 */
  successRate: number;
}

/**
 * 计算任务总体统计
 */
export function calculateTaskStatistics(tasks: TaskOperation[]): TaskStatistics {
  const total = tasks.length;
  const success = tasks.filter((t) => t.lastExecutionStatus === "success").length;
  const failed = tasks.filter((t) => t.lastExecutionStatus === "failed").length;
  const running = tasks.filter((t) => t.lastExecutionStatus === "running").length;
  const pending = tasks.filter((t) => t.lastExecutionStatus === "pending").length;
  const online = tasks.filter((t) => t.onlineStatus === "online").length;
  const offline = tasks.filter((t) => t.onlineStatus === "offline").length;

  // 成功率 = 成功数 / (成功数 + 失败数) * 100，避免除零
  const executedCount = success + failed;
  const successRate = executedCount > 0 ? Math.round((success / executedCount) * 100) : 0;

  return {
    total,
    success,
    failed,
    running,
    pending,
    successRate,
    online,
    offline,
  };
}

/**
 * 计算按任务类型分组统计
 */
export function calculateTaskTypeStatistics(tasks: TaskOperation[]): TaskTypeStatistics[] {
  const typeMap = new Map<string, { count: number; success: number; failed: number }>();

  tasks.forEach((task) => {
    const current = typeMap.get(task.type) || { count: 0, success: 0, failed: 0 };
    current.count++;
    if (task.lastExecutionStatus === "success") current.success++;
    if (task.lastExecutionStatus === "failed") current.failed++;
    typeMap.set(task.type, current);
  });

  return Array.from(typeMap.entries())
    .map(([type, data]) => ({
      type,
      count: data.count,
      successCount: data.success,
      failedCount: data.failed,
      successRate:
        data.success + data.failed > 0
          ? Math.round((data.success / (data.success + data.failed)) * 100)
          : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * 计算按调度类型分组统计
 */
export function calculateScheduleTypeStatistics(
  tasks: TaskOperation[]
): ScheduleTypeStatistics[] {
  const scheduleLabels: Record<string, string> = {
    cron: "定时调度",
    event: "事件触发",
    dependency: "依赖触发",
  };

  const typeMap = new Map<string, { count: number; success: number; failed: number }>();

  tasks.forEach((task) => {
    const current = typeMap.get(task.scheduleType) || { count: 0, success: 0, failed: 0 };
    current.count++;
    if (task.lastExecutionStatus === "success") current.success++;
    if (task.lastExecutionStatus === "failed") current.failed++;
    typeMap.set(task.scheduleType, current);
  });

  return Array.from(typeMap.entries())
    .map(([scheduleType, data]) => ({
      scheduleType,
      label: scheduleLabels[scheduleType] || scheduleType,
      count: data.count,
      successRate:
        data.success + data.failed > 0
          ? Math.round((data.success / (data.success + data.failed)) * 100)
          : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * 导出任务运维报表为 Excel 文件
 * 包含：总体统计、按类型统计、按调度类型统计、任务明细
 */
export function exportTaskReport(tasks: TaskOperation[], filename: string = "任务运维报表"): void {
  // 1. 计算统计数据
  const overallStats = calculateTaskStatistics(tasks);
  const typeStats = calculateTaskTypeStatistics(tasks);
  const scheduleStats = calculateScheduleTypeStatistics(tasks);

  // 2. 创建工作簿
  const workbook = XLSX.utils.book_new();

  // 3. 总体统计工作表
  const overallData = [
    ["任务运维统计报表"],
    ["生成时间", new Date().toLocaleString("zh-CN")],
    [],
    ["指标", "数值", "说明"],
    ["任务总数", overallStats.total, "所有任务数量"],
    ["执行成功", overallStats.success, "最后执行状态为成功的任务"],
    ["执行失败", overallStats.failed, "最后执行状态为失败的任务"],
    ["运行中", overallStats.running, "正在执行的任务"],
    ["待执行", overallStats.pending, "等待执行的任务"],
    ["成功率", `${overallStats.successRate}%`, "成功数 / (成功数 + 失败数)"],
    ["在线任务", overallStats.online, "当前在线可执行的任务"],
    ["下线任务", overallStats.offline, "已下线的任务"],
  ];
  const overallSheet = XLSX.utils.aoa_to_sheet(overallData);
  XLSX.utils.book_append_sheet(workbook, overallSheet, "总体统计");

  // 4. 按任务类型统计工作表
  const typeData = [
    ["任务类型统计"],
    [],
    ["任务类型", "任务数", "成功数", "失败数", "成功率"],
    ...typeStats.map((stat) => [
      stat.type,
      stat.count,
      stat.successCount,
      stat.failedCount,
      `${stat.successRate}%`,
    ]),
  ];
  const typeSheet = XLSX.utils.aoa_to_sheet(typeData);
  XLSX.utils.book_append_sheet(workbook, typeSheet, "类型统计");

  // 5. 按调度类型统计工作表
  const scheduleData = [
    ["调度类型统计"],
    [],
    ["调度类型", "任务数", "成功率"],
    ...scheduleStats.map((stat) => [stat.label, stat.count, `${stat.successRate}%`]),
  ];
  const scheduleSheet = XLSX.utils.aoa_to_sheet(scheduleData);
  XLSX.utils.book_append_sheet(workbook, scheduleSheet, "调度类型统计");

  // 6. 任务明细工作表
  const priorityLabels: Record<string, string> = {
    high: "高",
    medium: "中",
    low: "低",
  };
  const scheduleTypeLabels: Record<string, string> = {
    cron: "定时",
    event: "事件",
    dependency: "依赖",
  };
  const onlineLabels: Record<string, string> = {
    online: "在线",
    offline: "下线",
  };

  const detailData = [
    ["任务明细"],
    [],
    [
      "任务名称",
      "任务类型",
      "调度类型",
      "优先级",
      "最后执行时间",
      "最后执行状态",
      "当前状态",
      "错误信息",
    ],
    ...tasks.map((task) => [
      task.name,
      task.type,
      scheduleTypeLabels[task.scheduleType] || task.scheduleType,
      priorityLabels[task.priority] || task.priority,
      task.lastExecutionTime,
      TASK_STATUS_LABELS[task.lastExecutionStatus],
      onlineLabels[task.onlineStatus] || task.onlineStatus,
      task.errorMessage || "",
    ]),
  ];
  const detailSheet = XLSX.utils.aoa_to_sheet(detailData);
  XLSX.utils.book_append_sheet(workbook, detailSheet, "任务明细");

  // 7. 导出文件
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

/**
 * 格式化统计数据用于展示
 */
export function formatStatisticsForDisplay(stats: TaskStatistics): {
  statusDistribution: { label: string; value: number; color: string }[];
  onlineDistribution: { label: string; value: number; color: string }[];
} {
  const statusColors: Record<TaskExecutionStatus, string> = {
    success: "#10B981",
    failed: "#EF4444",
    running: "#3B82F6",
    pending: "#6B7280",
  };

  return {
    statusDistribution: [
      { label: "执行成功", value: stats.success, color: statusColors.success },
      { label: "执行失败", value: stats.failed, color: statusColors.failed },
      { label: "运行中", value: stats.running, color: statusColors.running },
      { label: "待执行", value: stats.pending, color: statusColors.pending },
    ],
    onlineDistribution: [
      { label: "在线", value: stats.online, color: "#10B981" },
      { label: "下线", value: stats.offline, color: "#6B7280" },
    ],
  };
}