/**
 * 任务运维报表导出服务单元测试
 */

import {
  calculateTaskStatistics,
  calculateTaskTypeStatistics,
  calculateScheduleTypeStatistics,
  formatStatisticsForDisplay,
} from "../task-report";
import type { TaskOperation } from "../../mock/task-operation";

describe("任务报表导出服务", () => {
  // 测试数据
  const mockTasks: TaskOperation[] = [
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

  describe("calculateTaskStatistics", () => {
    it("应该正确计算任务总体统计", () => {
      const stats = calculateTaskStatistics(mockTasks);

      expect(stats.total).toBe(6);
      expect(stats.success).toBe(4);
      expect(stats.failed).toBe(1);
      expect(stats.running).toBe(1);
      expect(stats.pending).toBe(0);
      expect(stats.online).toBe(5);
      expect(stats.offline).toBe(1);
    });

    it("应该正确计算成功率", () => {
      const stats = calculateTaskStatistics(mockTasks);
      // 成功率 = 成功数 / (成功数 + 失败数) = 4 / 5 = 80%
      expect(stats.successRate).toBe(80);
    });

    it("应该正确处理空任务列表", () => {
      const stats = calculateTaskStatistics([]);

      expect(stats.total).toBe(0);
      expect(stats.success).toBe(0);
      expect(stats.failed).toBe(0);
      expect(stats.running).toBe(0);
      expect(stats.pending).toBe(0);
      expect(stats.successRate).toBe(0);
      expect(stats.online).toBe(0);
      expect(stats.offline).toBe(0);
    });

    it("应该正确处理只有失败任务的情况", () => {
      const failedTasks: TaskOperation[] = [
        {
          id: "task-failed",
          name: "失败任务",
          type: "测试",
          scheduleType: "cron",
          priority: "high",
          lastExecutionTime: "2024-01-15 08:00",
          lastExecutionStatus: "failed",
          onlineStatus: "online",
          dagStatus: "published",
        },
      ];

      const stats = calculateTaskStatistics(failedTasks);
      expect(stats.successRate).toBe(0);
    });
  });

  describe("calculateTaskTypeStatistics", () => {
    it("应该正确按任务类型分组统计", () => {
      const typeStats = calculateTaskTypeStatistics(mockTasks);

      expect(typeStats.length).toBeGreaterThan(0);

      // 检查数据同步类型 (只有 task-1)
      const syncStats = typeStats.find((s) => s.type === "数据同步");
      expect(syncStats).toBeDefined();
      expect(syncStats?.count).toBe(1);
      expect(syncStats?.successCount).toBe(1);
      expect(syncStats?.failedCount).toBe(0);
      expect(syncStats?.successRate).toBe(100);
    });

    it("应该按任务数量降序排列", () => {
      const typeStats = calculateTaskTypeStatistics(mockTasks);

      for (let i = 0; i < typeStats.length - 1; i++) {
        expect(typeStats[i].count).toBeGreaterThanOrEqual(typeStats[i + 1].count);
      }
    });

    it("应该正确处理空任务列表", () => {
      const typeStats = calculateTaskTypeStatistics([]);
      expect(typeStats).toHaveLength(0);
    });
  });

  describe("calculateScheduleTypeStatistics", () => {
    it("应该正确按调度类型分组统计", () => {
      const scheduleStats = calculateScheduleTypeStatistics(mockTasks);

      expect(scheduleStats.length).toBe(3);

      // 检查定时调度类型 (task-1, task-4, task-5)
      const cronStats = scheduleStats.find((s) => s.scheduleType === "cron");
      expect(cronStats).toBeDefined();
      expect(cronStats?.label).toBe("定时调度");
      expect(cronStats?.count).toBe(3);
    });

    it("应该包含正确的中文标签", () => {
      const scheduleStats = calculateScheduleTypeStatistics(mockTasks);

      const labels = scheduleStats.map((s) => s.label);
      expect(labels).toContain("定时调度");
      expect(labels).toContain("事件触发");
      expect(labels).toContain("依赖触发");
    });

    it("应该正确处理空任务列表", () => {
      const scheduleStats = calculateScheduleTypeStatistics([]);
      expect(scheduleStats).toHaveLength(0);
    });
  });

  describe("formatStatisticsForDisplay", () => {
    it("应该正确格式化状态分布数据", () => {
      const stats = calculateTaskStatistics(mockTasks);
      const formatted = formatStatisticsForDisplay(stats);

      expect(formatted.statusDistribution).toHaveLength(4);

      const successItem = formatted.statusDistribution.find((d) => d.label === "执行成功");
      expect(successItem?.value).toBe(4);
      expect(successItem?.color).toBe("#10B981");
    });

    it("应该正确格式化在线状态分布数据", () => {
      const stats = calculateTaskStatistics(mockTasks);
      const formatted = formatStatisticsForDisplay(stats);

      expect(formatted.onlineDistribution).toHaveLength(2);

      const onlineItem = formatted.onlineDistribution.find((d) => d.label === "在线");
      expect(onlineItem?.value).toBe(5);
    });
  });
});