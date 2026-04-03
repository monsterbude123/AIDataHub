/**
 * 项目详情页 Mock 数据
 * 路径: /project/[id]
 */

import type {
  Project,
  ProjectStatus,
  ProjectPhase,
  ProjectMember,
  ProjectMemberRole,
  ProjectActivityType,
  ProjectMilestone,
  MilestoneStatus,
  ProjectDocument,
  ProjectDetailStatistics,
  UserAvatar,
  ProjectTaskItem,
  ProjectStatsDetail,
  StageInfoDetail,
  ProjectActivityDetail,
  ProjectDetailFull,
} from "../types/project";

import {
  PROJECT_STATUS_LABELS,
  PROJECT_PHASE_LABELS,
  PROJECT_STATUS_COLORS,
  PROJECT_PHASE_COLORS,
  PROJECT_MEMBER_ROLE_LABELS,
  PROJECT_ACTIVITY_TYPE_LABELS,
  MILESTONE_STATUS_LABELS,
  TASK_STATUS_LABELS,
  TASK_PRIORITY_LABELS,
} from "../types/project";

// ==================== 项目详情 ====================

export const mockProjectDetail: ProjectDetailFull = {
  id: "PRJ-2024-001",
  name: "智能数据分析平台建设项目",
  code: "PRJ-2024-001",
  description:
    "建设企业级智能数据分析平台，整合数据采集、清洗、分析、可视化全链路能力，支持多业务场景的数据驱动决策。",
  status: "active",
  phase: "execution",
  progress: 65,
  startDate: "2024-01-15",
  expectedEndDate: "2024-08-30",
  actualEndDate: undefined,
  createdAt: "2024-01-10",
  updatedAt: "2024-03-28",
  managerId: "user-001",
  managerName: "张三",
  memberCount: 6,
  completedTasks: 28,
  totalTasks: 45,
  owner: {
    id: "user-001",
    name: "张三",
    avatar: "/avatars/user-001.png",
  },
  organization: {
    id: "org-001",
    name: "数据中心",
  },
  tags: ["数据分析", "AI", "平台建设"],
  priority: "high",
};

// ==================== 项目阶段 ====================

export const mockProjectStages: StageInfoDetail[] = [
  {
    key: "initiation",
    name: "立项",
    status: "completed",
    startDate: "2024-01-15",
    endDate: "2024-01-25",
    completedAt: "2024-01-25",
  },
  {
    key: "planning",
    name: "规划",
    status: "completed",
    startDate: "2024-01-26",
    endDate: "2024-02-15",
    completedAt: "2024-02-15",
  },
  {
    key: "execution",
    name: "执行",
    status: "in_progress",
    startDate: "2024-02-16",
    endDate: "2024-06-30",
  },
  {
    key: "acceptance",
    name: "验收",
    status: "pending",
    startDate: "2024-07-01",
    endDate: "2024-08-15",
  },
  {
    key: "closed",
    name: "结项",
    status: "pending",
    startDate: "2024-08-16",
    endDate: "2024-08-30",
  },
];

// ==================== 项目成员 ====================

export const mockProjectMembers: ProjectMember[] = [
  {
    id: "member-001",
    userId: "user-001",
    userName: "张三",
    userAvatar: "/avatars/user-001.png",
    role: "manager",
    joinedAt: "2024-01-10",
  },
  {
    id: "member-002",
    userId: "user-002",
    userName: "李四",
    userAvatar: "/avatars/user-002.png",
    role: "member",
    joinedAt: "2024-01-15",
  },
  {
    id: "member-003",
    userId: "user-003",
    userName: "王五",
    userAvatar: "/avatars/user-003.png",
    role: "member",
    joinedAt: "2024-01-15",
  },
  {
    id: "member-004",
    userId: "user-004",
    userName: "赵六",
    userAvatar: "/avatars/user-004.png",
    role: "member",
    joinedAt: "2024-02-01",
  },
  {
    id: "member-005",
    userId: "user-005",
    userName: "钱七",
    userAvatar: "/avatars/user-005.png",
    role: "viewer",
    joinedAt: "2024-02-20",
  },
  {
    id: "member-006",
    userId: "user-006",
    userName: "孙八",
    userAvatar: "/avatars/user-006.png",
    role: "viewer",
    joinedAt: "2024-03-01",
  },
];

// ==================== 项目活动动态 ====================

export const mockProjectActivities: ProjectActivityDetail[] = [
  {
    id: "activity-001",
    projectId: "PRJ-2024-001",
    type: "phase_change",
    title: "阶段推进",
    description: "项目从「规划阶段」推进至「执行阶段」",
    operator: {
      id: "user-001",
      name: "张三",
      avatar: "/avatars/user-001.png",
    },
    createdAt: "2024-02-16 09:30:00",
  },
  {
    id: "activity-002",
    projectId: "PRJ-2024-001",
    type: "milestone_complete",
    title: "里程碑完成",
    description: "里程碑「数据采集模块开发」已完成",
    operator: {
      id: "user-002",
      name: "李四",
      avatar: "/avatars/user-002.png",
    },
    createdAt: "2024-03-15 18:00:00",
  },
  {
    id: "activity-003",
    projectId: "PRJ-2024-001",
    type: "task_association",
    title: "任务关联",
    description: "新增关联任务「数据清洗服务开发」(TASK-2024-015)",
    operator: {
      id: "user-001",
      name: "张三",
      avatar: "/avatars/user-001.png",
    },
    createdAt: "2024-03-18 14:20:00",
  },
  {
    id: "activity-004",
    projectId: "PRJ-2024-001",
    type: "member_change",
    title: "成员加入",
    description: "孙八 加入项目，角色: 只读者",
    operator: {
      id: "user-001",
      name: "张三",
      avatar: "/avatars/user-001.png",
    },
    createdAt: "2024-03-01 10:00:00",
  },
  {
    id: "activity-005",
    projectId: "PRJ-2024-001",
    type: "document_upload",
    title: "文档上传",
    description: "上传文档「API接口设计规范V2.0」",
    operator: {
      id: "user-003",
      name: "王五",
      avatar: "/avatars/user-003.png",
    },
    createdAt: "2024-03-20 16:45:00",
  },
  {
    id: "activity-006",
    projectId: "PRJ-2024-001",
    type: "milestone_complete",
    title: "里程碑完成",
    description: "里程碑「元数据管理模块开发」已完成",
    operator: {
      id: "user-002",
      name: "李四",
      avatar: "/avatars/user-002.png",
    },
    createdAt: "2024-03-25 17:30:00",
  },
  {
    id: "activity-007",
    projectId: "PRJ-2024-001",
    type: "task_association",
    title: "任务完成",
    description: "任务「数据库连接池优化」已完成",
    operator: {
      id: "user-003",
      name: "王五",
      avatar: "/avatars/user-003.png",
    },
    createdAt: "2024-03-27 15:00:00",
  },
  {
    id: "activity-008",
    projectId: "PRJ-2024-001",
    type: "member_change",
    title: "角色变更",
    description: "钱七 角色从「成员」变更为「只读者」",
    operator: {
      id: "user-001",
      name: "张三",
      avatar: "/avatars/user-001.png",
    },
    createdAt: "2024-02-25 11:30:00",
  },
  {
    id: "activity-009",
    projectId: "PRJ-2024-001",
    type: "document_upload",
    title: "文档上传",
    description: "上传文档「系统部署手册」",
    operator: {
      id: "user-004",
      name: "赵六",
      avatar: "/avatars/user-004.png",
    },
    createdAt: "2024-03-28 09:15:00",
  },
  {
    id: "activity-010",
    projectId: "PRJ-2024-001",
    type: "task_association",
    title: "任务关联",
    description: "新增关联任务「性能测试与优化」(TASK-2024-022)",
    operator: {
      id: "user-001",
      name: "张三",
      avatar: "/avatars/user-001.png",
    },
    createdAt: "2024-03-28 10:30:00",
  },
];

// ==================== 项目里程碑 ====================

export const mockProjectMilestones: ProjectMilestone[] = [
  {
    id: "ms-001",
    projectId: "PRJ-2024-001",
    name: "需求分析与技术选型",
    description: "完成项目需求调研和技术架构选型",
    status: "completed",
    plannedDate: "2024-02-10",
    actualDate: "2024-02-08",
    createdAt: "2024-01-15",
  },
  {
    id: "ms-002",
    projectId: "PRJ-2024-001",
    name: "数据采集模块开发",
    description: "完成多源数据采集功能模块开发",
    status: "completed",
    plannedDate: "2024-03-15",
    actualDate: "2024-03-15",
    createdAt: "2024-02-01",
  },
  {
    id: "ms-003",
    projectId: "PRJ-2024-001",
    name: "元数据管理模块开发",
    description: "完成元数据采集、管理、查询功能",
    status: "completed",
    plannedDate: "2024-03-25",
    actualDate: "2024-03-25",
    createdAt: "2024-02-15",
  },
  {
    id: "ms-004",
    projectId: "PRJ-2024-001",
    name: "数据清洗模块开发",
    description: "完成数据清洗、转换、质量控制功能",
    status: "in_progress",
    plannedDate: "2024-04-20",
    createdAt: "2024-03-01",
  },
  {
    id: "ms-005",
    projectId: "PRJ-2024-001",
    name: "数据分析引擎开发",
    description: "完成SQL分析引擎和机器学习分析能力",
    status: "pending",
    plannedDate: "2024-05-15",
    createdAt: "2024-03-15",
  },
  {
    id: "ms-006",
    projectId: "PRJ-2024-001",
    name: "可视化报表模块开发",
    description: "完成可视化报表设计和展示功能",
    status: "pending",
    plannedDate: "2024-05-30",
    createdAt: "2024-03-20",
  },
  {
    id: "ms-007",
    projectId: "PRJ-2024-001",
    name: "权限管理模块开发",
    description: "完成用户权限、数据权限管理功能",
    status: "pending",
    plannedDate: "2024-06-10",
    createdAt: "2024-04-01",
  },
  {
    id: "ms-008",
    projectId: "PRJ-2024-001",
    name: "系统集成测试",
    description: "完成全系统集成测试和性能优化",
    status: "pending",
    plannedDate: "2024-06-30",
    createdAt: "2024-04-15",
  },
  {
    id: "ms-009",
    projectId: "PRJ-2024-001",
    name: "验收测试",
    description: "完成用户验收测试",
    status: "pending",
    plannedDate: "2024-07-30",
    createdAt: "2024-05-01",
  },
  {
    id: "ms-010",
    projectId: "PRJ-2024-001",
    name: "正式上线运行",
    description: "系统正式上线并投入使用",
    status: "pending",
    plannedDate: "2024-08-15",
    createdAt: "2024-05-15",
  },
];

// ==================== 项目任务列表 ====================

export const mockProjectTasks: ProjectTaskItem[] = [
  // 已完成任务
  {
    id: "TASK-2024-001",
    name: "业务需求调研",
    status: "completed",
    priority: "high",
    assignee: { id: "user-004", name: "赵六", avatar: "/avatars/user-004.png" },
    milestoneId: "ms-001",
    dueDate: "2024-01-30",
    completedAt: "2024-01-28",
  },
  {
    id: "TASK-2024-002",
    name: "技术架构设计",
    status: "completed",
    priority: "high",
    assignee: { id: "user-002", name: "李四", avatar: "/avatars/user-002.png" },
    milestoneId: "ms-001",
    dueDate: "2024-02-05",
    completedAt: "2024-02-03",
  },
  {
    id: "TASK-2024-003",
    name: "技术选型报告",
    status: "completed",
    priority: "high",
    assignee: { id: "user-002", name: "李四", avatar: "/avatars/user-002.png" },
    milestoneId: "ms-001",
    dueDate: "2024-02-10",
    completedAt: "2024-02-08",
  },
  // 进行中任务
  {
    id: "TASK-2024-011",
    name: "数据清洗规则配置",
    status: "in_progress",
    priority: "high",
    assignee: { id: "user-003", name: "王五", avatar: "/avatars/user-003.png" },
    milestoneId: "ms-004",
    dueDate: "2024-04-10",
  },
  {
    id: "TASK-2024-012",
    name: "数据转换逻辑开发",
    status: "in_progress",
    priority: "high",
    assignee: { id: "user-003", name: "王五", avatar: "/avatars/user-003.png" },
    milestoneId: "ms-004",
    dueDate: "2024-04-15",
  },
  {
    id: "TASK-2024-015",
    name: "数据清洗服务开发",
    status: "in_progress",
    priority: "high",
    assignee: { id: "user-002", name: "李四", avatar: "/avatars/user-002.png" },
    milestoneId: "ms-005",
    dueDate: "2024-04-25",
  },
  // 待开始任务
  {
    id: "TASK-2024-014",
    name: "SQL分析引擎开发",
    status: "pending",
    priority: "high",
    assignee: { id: "user-002", name: "李四", avatar: "/avatars/user-002.png" },
    milestoneId: "ms-005",
    dueDate: "2024-05-10",
  },
  {
    id: "TASK-2024-016",
    name: "机器学习分析模块",
    status: "pending",
    priority: "medium",
    assignee: { id: "user-003", name: "王五", avatar: "/avatars/user-003.png" },
    milestoneId: "ms-005",
    dueDate: "2024-05-15",
  },
  {
    id: "TASK-2024-022",
    name: "性能测试与优化",
    status: "pending",
    priority: "high",
    assignee: { id: "user-006", name: "孙八", avatar: "/avatars/user-006.png" },
    milestoneId: "ms-008",
    dueDate: "2024-06-25",
  },
];

// ==================== 项目文档 ====================

export const mockProjectDocuments: ProjectDocument[] = [
  {
    id: "doc-001",
    projectId: "PRJ-2024-001",
    name: "项目需求说明书V1.0",
    type: "requirement",
    size: 2500000,
    uploader: "赵六",
    uploadedAt: "2024-01-25",
  },
  {
    id: "doc-002",
    projectId: "PRJ-2024-001",
    name: "技术架构设计文档",
    type: "design",
    size: 5200000,
    uploader: "李四",
    uploadedAt: "2024-02-05",
  },
  {
    id: "doc-003",
    projectId: "PRJ-2024-001",
    name: "数据库设计规范",
    type: "design",
    size: 1800000,
    uploader: "李四",
    uploadedAt: "2024-02-15",
  },
  {
    id: "doc-004",
    projectId: "PRJ-2024-001",
    name: "API接口设计规范V1.0",
    type: "design",
    size: 3100000,
    uploader: "王五",
    uploadedAt: "2024-02-20",
  },
  {
    id: "doc-005",
    projectId: "PRJ-2024-001",
    name: "API接口设计规范V2.0",
    type: "design",
    size: 4200000,
    uploader: "王五",
    uploadedAt: "2024-03-20",
  },
  {
    id: "doc-006",
    projectId: "PRJ-2024-001",
    name: "系统部署手册",
    type: "manual",
    size: 2800000,
    uploader: "赵六",
    uploadedAt: "2024-03-28",
  },
  {
    id: "doc-007",
    projectId: "PRJ-2024-001",
    name: "用户操作手册",
    type: "manual",
    size: 6500000,
    uploader: "赵六",
    uploadedAt: "2024-03-15",
  },
  {
    id: "doc-008",
    projectId: "PRJ-2024-001",
    name: "测试计划与报告",
    type: "test",
    size: 1200000,
    uploader: "孙八",
    uploadedAt: "2024-03-10",
  },
];

// ==================== 项目统计 ====================

export const mockProjectStats: ProjectStatsDetail = {
  tasks: {
    total: 45,
    completed: 28,
    inProgress: 12,
    pending: 5,
    overdue: 2,
    completionRate: 62.2,
  },
  milestones: {
    total: 10,
    completed: 3,
    inProgress: 1,
    pending: 6,
    completionRate: 30,
  },
  documents: {
    total: 28,
    byType: {
      requirement: 5,
      design: 12,
      manual: 6,
      test: 3,
      other: 2,
    },
  },
  members: {
    total: 6,
    byRole: {
      manager: 1,
      member: 3,
      viewer: 2,
    },
  },
  time: {
    elapsedDays: 73,
    remainingDays: 154,
    expectedDuration: 227,
    elapsedPercentage: 32.2,
  },
};

// ==================== 项目统计卡片数据 ====================

export const mockProjectStatistics: ProjectDetailStatistics = {
  totalTasks: 45,
  completedTasks: 28,
  totalMilestones: 10,
  completedMilestones: 3,
  totalDocuments: 28,
  totalMembers: 6,
};

// ==================== 项目列表（概览页面） ====================

export interface ProjectListItem {
  id: string;
  name: string;
  code: string;
  status: ProjectStatus;
  stage: string;
  progress: number;
  owner: UserAvatar;
  startDate: string;
  expectedEndDate: string;
  memberCount: number;
  taskCount: number;
}

export const mockProjectList: ProjectListItem[] = [
  {
    id: "PRJ-2024-001",
    name: "智能数据分析平台建设项目",
    code: "PRJ-2024-001",
    status: "active",
    stage: "执行阶段",
    progress: 65,
    owner: { id: "user-001", name: "张三", avatar: "/avatars/user-001.png" },
    startDate: "2024-01-15",
    expectedEndDate: "2024-08-30",
    memberCount: 6,
    taskCount: 45,
  },
  {
    id: "PRJ-2024-002",
    name: "数据治理体系建设项目",
    code: "PRJ-2024-002",
    status: "active",
    stage: "规划阶段",
    progress: 25,
    owner: { id: "user-002", name: "李四", avatar: "/avatars/user-002.png" },
    startDate: "2024-02-20",
    expectedEndDate: "2024-10-15",
    memberCount: 4,
    taskCount: 32,
  },
  {
    id: "PRJ-2024-003",
    name: "实时数据监控平台",
    code: "PRJ-2024-003",
    status: "completed",
    stage: "结项",
    progress: 100,
    owner: { id: "user-003", name: "王五", avatar: "/avatars/user-003.png" },
    startDate: "2023-09-01",
    expectedEndDate: "2024-01-30",
    memberCount: 3,
    taskCount: 20,
  },
  {
    id: "PRJ-2023-005",
    name: "历史数据归档系统",
    code: "PRJ-2023-005",
    status: "archived",
    stage: "结项",
    progress: 100,
    owner: { id: "user-001", name: "张三", avatar: "/avatars/user-001.png" },
    startDate: "2023-03-01",
    expectedEndDate: "2023-08-30",
    memberCount: 2,
    taskCount: 15,
  },
  {
    id: "PRJ-2024-004",
    name: "数据交换共享平台",
    code: "PRJ-2024-004",
    status: "paused",
    stage: "执行阶段",
    progress: 40,
    owner: { id: "user-004", name: "赵六", avatar: "/avatars/user-004.png" },
    startDate: "2024-01-10",
    expectedEndDate: "2024-06-30",
    memberCount: 5,
    taskCount: 28,
  },
];

// ==================== 导出状态映射（从类型文件导入） ====================

export {
  PROJECT_STATUS_LABELS,
  PROJECT_PHASE_LABELS,
  PROJECT_STATUS_COLORS,
  PROJECT_PHASE_COLORS,
  PROJECT_MEMBER_ROLE_LABELS,
  PROJECT_ACTIVITY_TYPE_LABELS,
  MILESTONE_STATUS_LABELS,
  TASK_STATUS_LABELS,
  TASK_PRIORITY_LABELS,
};