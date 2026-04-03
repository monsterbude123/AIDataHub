/**
 * 数据治理模块 Mock 数据
 */

import type {
  QualityRule,
  QualityTask,
  QualityTicket,
  QualityKPI,
  QualityIssueDistribution,
  QualityTrendPoint,
  QualityRuleType,
} from "@/types/governance";

/**
 * Mock 质量规则列表
 */
export const mockQualityRules: QualityRule[] = [
  {
    id: "rule-001",
    name: "订单号唯一性检查",
    type: "consistency",
    expression: "COUNT(DISTINCT order_id) = COUNT(order_id)",
    errorDescription: "订单号存在重复",
    severity: "high",
    status: "enabled",
    approvalStatus: "approved",
    createdBy: "张三",
    createdAt: "2024-01-01 09:00:00",
    updatedAt: "2024-01-10 10:00:00",
  },
  {
    id: "rule-002",
    name: "金额范围校验",
    type: "accuracy",
    expression: "amount >= 0 AND amount <= 1000000",
    errorDescription: "金额超出合理范围",
    severity: "high",
    status: "enabled",
    approvalStatus: "approved",
    createdBy: "李四",
    createdAt: "2024-01-02 10:00:00",
    updatedAt: "2024-01-11 11:00:00",
  },
  {
    id: "rule-003",
    name: "必填字段完整性",
    type: "completeness",
    expression: "customer_id IS NOT NULL AND product_id IS NOT NULL",
    errorDescription: "必填字段为空",
    severity: "medium",
    status: "enabled",
    approvalStatus: "approved",
    createdBy: "王五",
    createdAt: "2024-01-03 11:00:00",
    updatedAt: "2024-01-12 12:00:00",
  },
  {
    id: "rule-004",
    name: "日期格式规范",
    type: "conformity",
    expression: "REGEXP_MATCH(created_at, '\\d{4}-\\d{2}-\\d{2}')",
    errorDescription: "日期格式不符合规范",
    severity: "low",
    status: "enabled",
    approvalStatus: "pending",
    createdBy: "赵六",
    createdAt: "2024-01-04 12:00:00",
    updatedAt: "2024-01-13 13:00:00",
  },
  {
    id: "rule-005",
    name: "客户ID关联检查",
    type: "relevance",
    expression: "customer_id IN (SELECT id FROM customer_table)",
    errorDescription: "客户ID在客户表中不存在",
    severity: "medium",
    status: "enabled",
    approvalStatus: "approved",
    createdBy: "孙七",
    createdAt: "2024-01-05 13:00:00",
    updatedAt: "2024-01-14 14:00:00",
  },
  {
    id: "rule-006",
    name: "自定义状态校验",
    type: "custom",
    expression: "status IN ('pending', 'processing', 'completed', 'cancelled')",
    errorDescription: "状态值不在允许范围内",
    severity: "medium",
    status: "disabled",
    approvalStatus: "rejected",
    createdBy: "周八",
    createdAt: "2024-01-06 14:00:00",
    updatedAt: "2024-01-15 15:00:00",
  },
];

/**
 * Mock 质量任务列表
 */
export const mockQualityTasks: QualityTask[] = [
  {
    id: "task-001",
    name: "订单数据质量检测",
    dataResourceId: "ds-001",
    dataResourceName: "生产订单数据库",
    ruleCount: 3,
    scheduleType: "cron",
    scheduleConfig: "0 2 * * *",
    status: "running",
    lastExecuteResult: "success",
    lastExecuteTime: "2024-01-15 02:00:00",
    createdBy: "张三",
    createdAt: "2024-01-01 09:00:00",
    updatedAt: "2024-01-15 02:00:00",
  },
  {
    id: "task-002",
    name: "客户数据质量检测",
    dataResourceId: "ds-002",
    dataResourceName: "客户管理系统",
    ruleCount: 2,
    scheduleType: "event",
    scheduleConfig: "on_data_update",
    status: "running",
    lastExecuteResult: "partial_failed",
    lastExecuteTime: "2024-01-14 18:00:00",
    createdBy: "李四",
    createdAt: "2024-01-02 10:00:00",
    updatedAt: "2024-01-14 18:00:00",
  },
  {
    id: "task-003",
    name: "日志数据质量检测",
    dataResourceId: "ds-004",
    dataResourceName: "日志数据湖",
    ruleCount: 1,
    scheduleType: "dependency",
    scheduleConfig: "after_import_task",
    status: "stopped",
    createdBy: "赵六",
    createdAt: "2024-01-04 12:00:00",
    updatedAt: "2024-01-10 16:00:00",
  },
];

/**
 * Mock 质量工单列表
 */
export const mockQualityTickets: QualityTicket[] = [
  {
    id: "ticket-001",
    title: "订单数据重复问题",
    dataResourceId: "ds-001",
    dataResourceName: "生产订单数据库",
    initiator: "张三",
    assignee: "王五",
    status: "processing",
    createdAt: "2024-01-14 10:00:00",
    updatedAt: "2024-01-15 09:00:00",
    description: "发现订单表中存在重复订单号，需要人工核查",
    issueCount: 156,
  },
  {
    id: "ticket-002",
    title: "客户ID缺失问题",
    dataResourceId: "ds-002",
    dataResourceName: "客户管理系统",
    initiator: "李四",
    assignee: "孙七",
    status: "pending",
    createdAt: "2024-01-15 08:00:00",
    updatedAt: "2024-01-15 08:00:00",
    description: "部分订单记录缺少客户ID",
    issueCount: 89,
  },
  {
    id: "ticket-003",
    title: "金额异常问题",
    dataResourceId: "ds-001",
    dataResourceName: "生产订单数据库",
    initiator: "系统",
    assignee: "周八",
    status: "resolved",
    createdAt: "2024-01-10 14:00:00",
    updatedAt: "2024-01-12 16:00:00",
    description: "发现金额超出合理范围的异常记录",
    issueCount: 23,
  },
];

/**
 * Mock 质量统计 KPI
 */
export const mockQualityKPI: QualityKPI = {
  checkedResourceCount: 5,
  totalRecordCount: 1258460,
  issueRecordCount: 4567,
  issueRate: 0.36,
};

/**
 * Mock 问题分布数据
 */
export const mockIssueDistribution: QualityIssueDistribution[] = [
  { type: "consistency", count: 156, percentage: 34.2 },
  { type: "accuracy", count: 23, percentage: 5.1 },
  { type: "completeness", count: 89, percentage: 19.5 },
  { type: "conformity", count: 45, percentage: 9.9 },
  { type: "relevance", count: 120, percentage: 26.3 },
  { type: "custom", count: 23, percentage: 5.0 },
];

/**
 * Mock 质量趋势数据（近7天）
 */
export const mockQualityTrend: QualityTrendPoint[] = [
  { date: "2024-01-09", issueCount: 3200, checkedCount: 150000, issueRate: 2.13 },
  { date: "2024-01-10", issueCount: 2800, checkedCount: 180000, issueRate: 1.56 },
  { date: "2024-01-11", issueCount: 4500, checkedCount: 200000, issueRate: 2.25 },
  { date: "2024-01-12", issueCount: 3800, checkedCount: 190000, issueRate: 2.0 },
  { date: "2024-01-13", issueCount: 4100, checkedCount: 185000, issueRate: 2.22 },
  { date: "2024-01-14", issueCount: 5200, checkedCount: 220000, issueRate: 2.36 },
  { date: "2024-01-15", issueCount: 4567, checkedCount: 125846, issueRate: 3.63 },
];

/**
 * 获取质量规则列表
 */
export function getQualityRules(): QualityRule[] {
  return mockQualityRules;
}

/**
 * 获取质量任务列表
 */
export function getQualityTasks(): QualityTask[] {
  return mockQualityTasks;
}

/**
 * 获取质量工单列表
 */
export function getQualityTickets(): QualityTicket[] {
  return mockQualityTickets;
}

/**
 * 获取质量 KPI
 */
export function getQualityKPI(): QualityKPI {
  return mockQualityKPI;
}

/**
 * 获取问题分布
 */
export function getIssueDistribution(): QualityIssueDistribution[] {
  return mockIssueDistribution;
}

/**
 * 获取质量趋势
 */
export function getQualityTrend(): QualityTrendPoint[] {
  return mockQualityTrend;
}