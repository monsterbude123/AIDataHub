/**
 * 数据项目模块类型定义
 */

/**
 * 项目状态类型
 */
export type ProjectStatus = "active" | "completed" | "paused" | "archived";

/**
 * 项目阶段类型
 */
export type ProjectPhase = "initiation" | "planning" | "execution" | "acceptance" | "closed";

/**
 * 项目状态标签映射
 */
export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  active: "进行中",
  completed: "已完成",
  paused: "已暂停",
  archived: "已归档",
};

/**
 * 项目阶段标签映射
 */
export const PROJECT_PHASE_LABELS: Record<ProjectPhase, string> = {
  initiation: "立项",
  planning: "规划",
  execution: "执行",
  acceptance: "验收",
  closed: "结项",
};

/**
 * 项目状态颜色映射
 */
export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
  active: "processing",
  completed: "success",
  paused: "warning",
  archived: "default",
};

/**
 * 项目阶段颜色映射
 */
export const PROJECT_PHASE_COLORS: Record<ProjectPhase, string> = {
  initiation: "default",
  planning: "processing",
  execution: "warning",
  acceptance: "success",
  closed: "success",
};

/**
 * 项目信息类型
 */
export interface Project {
  /** 项目ID */
  id: string;
  /** 项目编号 */
  code: string;
  /** 项目名称 */
  name: string;
  /** 项目描述 */
  description?: string;
  /** 当前阶段 */
  phase: ProjectPhase;
  /** 项目状态 */
  status: ProjectStatus;
  /** 进度百分比 */
  progress: number;
  /** 负责人ID */
  managerId: string;
  /** 负责人姓名 */
  managerName: string;
  /** 成员数量 */
  memberCount: number;
  /** 任务完成数 */
  completedTasks: number;
  /** 任务总数 */
  totalTasks: number;
  /** 开始时间 */
  startDate: string;
  /** 预计完成时间 */
  expectedEndDate: string;
  /** 实际完成时间 */
  actualEndDate?: string;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt?: string;
}

/**
 * 项目表单数据类型
 */
export interface ProjectFormData {
  /** 项目名称 */
  name: string;
  /** 项目编号（可选，自动生成） */
  code?: string;
  /** 项目描述 */
  description?: string;
  /** 负责人ID */
  managerId: string;
  /** 开始时间 */
  startDate: string;
  /** 预计完成时间 */
  expectedEndDate: string;
  /** 初始成员ID列表 */
  memberIds?: string[];
}

/**
 * 项目筛选参数
 */
export interface ProjectFilterParams {
  /** 搜索关键词 */
  keyword?: string;
  /** 状态筛选 */
  status?: ProjectStatus | "all";
  /** 阶段筛选 */
  phase?: ProjectPhase | "all";
  /** 负责人筛选 */
  managerId?: string;
  /** 开始时间范围 */
  startDateRange?: [string, string];
}

/**
 * 项目统计信息
 */
export interface ProjectStatistics {
  /** 总项目数 */
  total: number;
  /** 进行中项目数 */
  active: number;
  /** 已完成项目数 */
  completed: number;
  /** 已归档项目数 */
  archived: number;
}

/**
 * 项目成员角色类型
 */
export type ProjectMemberRole = "manager" | "member" | "viewer";

/**
 * 项目成员角色标签映射
 */
export const PROJECT_MEMBER_ROLE_LABELS: Record<ProjectMemberRole, string> = {
  manager: "项目经理",
  member: "项目成员",
  viewer: "只读者",
};

/**
 * 项目成员信息
 */
export interface ProjectMember {
  /** 成员ID */
  id: string;
  /** 用户ID */
  userId: string;
  /** 用户名 */
  userName: string;
  /** 用户头像 */
  userAvatar?: string;
  /** 角色 */
  role: ProjectMemberRole;
  /** 加入时间 */
  joinedAt: string;
}

/**
 * 项目动态类型
 */
export type ProjectActivityType =
  | "phase_change"
  | "task_association"
  | "milestone_complete"
  | "document_upload"
  | "member_change";

/**
 * 项目动态类型标签映射
 */
export const PROJECT_ACTIVITY_TYPE_LABELS: Record<ProjectActivityType, string> = {
  phase_change: "阶段变更",
  task_association: "任务关联",
  milestone_complete: "里程碑完成",
  document_upload: "文档上传",
  member_change: "成员变更",
};

/**
 * 项目动态信息
 */
export interface ProjectActivity {
  /** 动态ID */
  id: string;
  /** 项目ID */
  projectId: string;
  /** 动态类型 */
  type: ProjectActivityType;
  /** 动态描述 */
  description: string;
  /** 操作人 */
  operator: string;
  /** 操作时间 */
  createdAt: string;
}

/**
 * 里程碑状态类型
 */
export type MilestoneStatus = "pending" | "in_progress" | "completed" | "delayed";

/**
 * 里程碑状态标签映射
 */
export const MILESTONE_STATUS_LABELS: Record<MilestoneStatus, string> = {
  pending: "待开始",
  in_progress: "进行中",
  completed: "已完成",
  delayed: "已延期",
};

/**
 * 里程碑信息
 */
export interface ProjectMilestone {
  /** 里程碑ID */
  id: string;
  /** 项目ID */
  projectId: string;
  /** 里程碑名称 */
  name: string;
  /** 里程碑描述 */
  description?: string;
  /** 状态 */
  status: MilestoneStatus;
  /** 计划完成时间 */
  plannedDate: string;
  /** 实际完成时间 */
  actualDate?: string;
  /** 创建时间 */
  createdAt: string;
}

/**
 * 项目文档信息
 */
export interface ProjectDocument {
  /** 文档ID */
  id: string;
  /** 项目ID */
  projectId: string;
  /** 文档名称 */
  name: string;
  /** 文档类型 */
  type: string;
  /** 文档大小 */
  size: number;
  /** 上传者 */
  uploader: string;
  /** 上传时间 */
  uploadedAt: string;
}

/**
 * 项目详情统计
 */
export interface ProjectDetailStatistics {
  /** 任务总数 */
  totalTasks: number;
  /** 已完成任务 */
  completedTasks: number;
  /** 里程碑总数 */
  totalMilestones: number;
  /** 已完成里程碑 */
  completedMilestones: number;
  /** 文档数 */
  totalDocuments: number;
  /** 成员数 */
  totalMembers: number;
}