/**
 * 数据治理模块类型定义
 */

/**
 * 质量规则类型
 */
export type QualityRuleType =
  | "consistency"
  | "accuracy"
  | "completeness"
  | "conformity"
  | "relevance"
  | "custom";

/**
 * 质量规则类型标签
 */
export const QUALITY_RULE_TYPE_LABELS: Record<QualityRuleType, string> = {
  consistency: "一致性",
  accuracy: "准确性",
  completeness: "完整性",
  conformity: "规范性",
  relevance: "关联性",
  custom: "自定义",
};

/**
 * 质量规则严重等级
 */
export type QualitySeverity = "low" | "medium" | "high";

/**
 * 质量规则严重等级标签
 */
export const QUALITY_SEVERITY_LABELS: Record<QualitySeverity, string> = {
  low: "低",
  medium: "中",
  high: "高",
};

/**
 * 审批状态
 */
export type ApprovalStatus = "pending" | "approved" | "rejected";

/**
 * 审批状态标签
 */
export const APPROVAL_STATUS_LABELS: Record<ApprovalStatus, string> = {
  pending: "待审批",
  approved: "已通过",
  rejected: "已拒绝",
};

/**
 * 质量规则
 */
export interface QualityRule {
  id: string;
  name: string;
  type: QualityRuleType;
  expression: string;
  errorDescription: string;
  severity: QualitySeverity;
  status: "enabled" | "disabled";
  approvalStatus: ApprovalStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 质量规则创建/编辑表单
 */
export interface QualityRuleFormData {
  name: string;
  type: QualityRuleType;
  expression: string;
  errorDescription: string;
  severity: QualitySeverity;
  status: "enabled" | "disabled";
}

/**
 * 质量任务状态
 */
export type QualityTaskStatus = "running" | "stopped";

/**
 * 质量任务执行结果
 */
export type QualityTaskResult = "success" | "failed" | "partial_failed";

/**
 * 质量任务
 */
export interface QualityTask {
  id: string;
  name: string;
  dataResourceId: string;
  dataResourceName: string;
  ruleCount: number;
  scheduleType: "cron" | "event" | "dependency";
  scheduleConfig: string;
  status: QualityTaskStatus;
  lastExecuteResult?: QualityTaskResult;
  lastExecuteTime?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 质量工单状态
 */
export type QualityTicketStatus = "pending" | "processing" | "resolved";

/**
 * 质量工单
 */
export interface QualityTicket {
  id: string;
  title: string;
  dataResourceId: string;
  dataResourceName: string;
  initiator: string;
  assignee: string;
  status: QualityTicketStatus;
  createdAt: string;
  updatedAt: string;
  description?: string;
  issueCount?: number;
}

/**
 * 质量统计 KPI
 */
export interface QualityKPI {
  checkedResourceCount: number;
  totalRecordCount: number;
  issueRecordCount: number;
  issueRate: number;
}

/**
 * 质量问题分布
 */
export interface QualityIssueDistribution {
  type: QualityRuleType;
  count: number;
  percentage: number;
}

/**
 * 质量趋势数据点
 */
export interface QualityTrendPoint {
  date: string;
  issueCount: number;
  checkedCount: number;
  issueRate: number;
}