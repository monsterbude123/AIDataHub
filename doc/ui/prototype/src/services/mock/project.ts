/**
 * 数据项目模块 Mock 数据
 */

import type {
  Project,
  ProjectStatus,
  ProjectPhase,
  ProjectStatistics,
  ProjectFormData,
} from "@/types/project";

/**
 * Mock 项目列表
 */
export const mockProjects: Project[] = [
  {
    id: "proj-001",
    code: "PRJ-2024-001",
    name: "客户数据治理项目",
    description: "对客户相关数据进行全面治理，提升数据质量和一致性",
    phase: "execution",
    status: "active",
    progress: 65,
    managerId: "user-002",
    managerName: "张三",
    memberCount: 5,
    completedTasks: 28,
    totalTasks: 45,
    startDate: "2024-01-01",
    expectedEndDate: "2024-06-30",
    createdAt: "2024-01-01",
    updatedAt: "2024-03-15",
  },
  {
    id: "proj-002",
    code: "PRJ-2024-002",
    name: "订单数据集成项目",
    description: "整合各渠道订单数据，建立统一订单数据仓库",
    phase: "planning",
    status: "active",
    progress: 25,
    managerId: "user-003",
    managerName: "李四",
    memberCount: 3,
    completedTasks: 8,
    totalTasks: 32,
    startDate: "2024-02-15",
    expectedEndDate: "2024-08-15",
    createdAt: "2024-02-15",
    updatedAt: "2024-03-10",
  },
  {
    id: "proj-003",
    code: "PRJ-2024-003",
    name: "财务数据标准化项目",
    description: "对财务系统数据进行标准化处理，建立统一数据标准",
    phase: "acceptance",
    status: "completed",
    progress: 100,
    managerId: "user-004",
    managerName: "王五",
    memberCount: 4,
    completedTasks: 20,
    totalTasks: 20,
    startDate: "2023-10-01",
    expectedEndDate: "2024-03-01",
    actualEndDate: "2024-02-28",
    createdAt: "2023-10-01",
    updatedAt: "2024-02-28",
  },
  {
    id: "proj-004",
    code: "PRJ-2024-004",
    name: "供应链数据分析项目",
    description: "对供应链数据进行深度分析，优化供应链管理决策",
    phase: "execution",
    status: "paused",
    progress: 45,
    managerId: "user-002",
    managerName: "张三",
    memberCount: 6,
    completedTasks: 15,
    totalTasks: 35,
    startDate: "2024-01-15",
    expectedEndDate: "2024-07-15",
    createdAt: "2024-01-15",
    updatedAt: "2024-03-01",
  },
  {
    id: "proj-005",
    code: "PRJ-2024-005",
    name: "用户行为分析平台",
    description: "搭建用户行为分析平台，支持用户画像和行为分析",
    phase: "initiation",
    status: "active",
    progress: 10,
    managerId: "user-006",
    managerName: "孙七",
    memberCount: 2,
    completedTasks: 2,
    totalTasks: 25,
    startDate: "2024-03-01",
    expectedEndDate: "2024-09-01",
    createdAt: "2024-03-01",
  },
  {
    id: "proj-006",
    code: "PRJ-2023-001",
    name: "历史数据归档项目",
    description: "对历史数据进行整理归档，建立数据归档规范",
    phase: "closed",
    status: "archived",
    progress: 100,
    managerId: "user-002",
    managerName: "张三",
    memberCount: 3,
    completedTasks: 15,
    totalTasks: 15,
    startDate: "2023-05-01",
    expectedEndDate: "2023-12-01",
    actualEndDate: "2023-11-30",
    createdAt: "2023-05-01",
    updatedAt: "2023-11-30",
  },
  {
    id: "proj-007",
    code: "PRJ-2023-002",
    name: "营销数据整合项目",
    description: "整合营销各渠道数据，建立营销数据平台",
    phase: "closed",
    status: "archived",
    progress: 100,
    managerId: "user-004",
    managerName: "王五",
    memberCount: 4,
    completedTasks: 18,
    totalTasks: 18,
    startDate: "2023-06-01",
    expectedEndDate: "2023-12-15",
    actualEndDate: "2023-12-10",
    createdAt: "2023-06-01",
    updatedAt: "2023-12-10",
  },
  {
    id: "proj-008",
    code: "PRJ-2024-006",
    name: "产品质量追溯系统",
    description: "建立产品质量追溯系统，实现产品质量全生命周期管理",
    phase: "planning",
    status: "active",
    progress: 15,
    managerId: "user-007",
    managerName: "周八",
    memberCount: 4,
    completedTasks: 3,
    totalTasks: 28,
    startDate: "2024-02-01",
    expectedEndDate: "2024-08-01",
    createdAt: "2024-02-01",
    updatedAt: "2024-03-05",
  },
  {
    id: "proj-009",
    code: "PRJ-2024-007",
    name: "数据安全合规项目",
    description: "建立数据安全合规体系，确保数据处理符合法规要求",
    phase: "execution",
    status: "active",
    progress: 55,
    managerId: "user-003",
    managerName: "李四",
    memberCount: 5,
    completedTasks: 22,
    totalTasks: 40,
    startDate: "2024-01-20",
    expectedEndDate: "2024-07-20",
    createdAt: "2024-01-20",
    updatedAt: "2024-03-12",
  },
  {
    id: "proj-010",
    code: "PRJ-2024-008",
    name: "智能推荐系统建设",
    description: "建设智能推荐系统，提升用户个性化体验",
    phase: "acceptance",
    status: "completed",
    progress: 100,
    managerId: "user-006",
    managerName: "孙七",
    memberCount: 3,
    completedTasks: 12,
    totalTasks: 12,
    startDate: "2023-11-01",
    expectedEndDate: "2024-04-01",
    actualEndDate: "2024-03-25",
    createdAt: "2023-11-01",
    updatedAt: "2024-03-25",
  },
  {
    id: "proj-011",
    code: "PRJ-2023-003",
    name: "基础数据字典建设",
    description: "建立企业基础数据字典，统一数据定义",
    phase: "closed",
    status: "archived",
    progress: 100,
    managerId: "user-005",
    managerName: "赵六",
    memberCount: 2,
    completedTasks: 10,
    totalTasks: 10,
    startDate: "2023-03-01",
    expectedEndDate: "2023-09-01",
    actualEndDate: "2023-08-15",
    createdAt: "2023-03-01",
    updatedAt: "2023-08-15",
  },
  {
    id: "proj-012",
    code: "PRJ-2024-009",
    name: "数据服务API平台",
    description: "建设统一数据服务API平台，提供标准化数据服务",
    phase: "execution",
    status: "active",
    progress: 70,
    managerId: "user-008",
    managerName: "吴九",
    memberCount: 6,
    completedTasks: 35,
    totalTasks: 50,
    startDate: "2024-01-10",
    expectedEndDate: "2024-06-10",
    createdAt: "2024-01-10",
    updatedAt: "2024-03-18",
  },
];

/**
 * 获取项目统计信息
 */
export function getProjectStatistics(): ProjectStatistics {
  return {
    total: mockProjects.length,
    active: mockProjects.filter((p) => p.status === "active").length,
    completed: mockProjects.filter((p) => p.status === "completed").length,
    archived: mockProjects.filter((p) => p.status === "archived").length,
  };
}

/**
 * 根据筛选条件获取项目列表
 */
export function getFilteredProjects(params: {
  status?: ProjectStatus | "all";
  phase?: ProjectPhase | "all";
  keyword?: string;
}): Project[] {
  let filtered = [...mockProjects];

  // 状态筛选
  if (params.status && params.status !== "all") {
    filtered = filtered.filter((p) => p.status === params.status);
  }

  // 阶段筛选
  if (params.phase && params.phase !== "all") {
    filtered = filtered.filter((p) => p.phase === params.phase);
  }

  // 关键词搜索
  if (params.keyword) {
    const keyword = params.keyword.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(keyword) ||
        p.code.toLowerCase().includes(keyword) ||
        p.description?.toLowerCase().includes(keyword)
    );
  }

  return filtered;
}

/**
 * 根据ID获取项目详情
 */
export function getProjectById(id: string): Project | undefined {
  return mockProjects.find((p) => p.id === id);
}

/**
 * 创建新项目
 */
export function createProject(data: ProjectFormData): Project {
  const newProject: Project = {
    id: `proj-${Date.now()}`,
    code: data.code || `PRJ-${new Date().getFullYear()}-${String(mockProjects.length + 1).padStart(3, "0")}`,
    name: data.name,
    description: data.description,
    phase: "initiation",
    status: "active",
    progress: 0,
    managerId: data.managerId,
    managerName: "新负责人", // 实际应用中需要根据 managerId 查询
    memberCount: data.memberIds?.length || 1,
    completedTasks: 0,
    totalTasks: 0,
    startDate: data.startDate,
    expectedEndDate: data.expectedEndDate,
    createdAt: new Date().toISOString().split("T")[0],
  };

  mockProjects.push(newProject);
  return newProject;
}

/**
 * 更新项目信息
 */
export function updateProject(id: string, data: Partial<ProjectFormData>): Project | undefined {
  const project = mockProjects.find((p) => p.id === id);
  if (!project) return undefined;

  Object.assign(project, data, {
    updatedAt: new Date().toISOString().split("T")[0],
  });

  return project;
}

/**
 * 删除项目
 */
export function deleteProject(id: string): boolean {
  const index = mockProjects.findIndex((p) => p.id === id);
  if (index === -1) return false;

  mockProjects.splice(index, 1);
  return true;
}

/**
 * 归档项目
 */
export function archiveProject(id: string): Project | undefined {
  const project = mockProjects.find((p) => p.id === id);
  if (!project) return undefined;

  project.status = "archived";
  project.phase = "closed";
  project.progress = 100;
  project.actualEndDate = new Date().toISOString().split("T")[0];
  project.updatedAt = new Date().toISOString().split("T")[0];

  return project;
}

/**
 * Mock 项目成员列表
 */
export const mockProjectMembers: Record<string, import("@/types/project").ProjectMember[]> = {
  "proj-001": [
    { id: "mem-001", userId: "user-002", userName: "张三", role: "manager", joinedAt: "2024-01-01" },
    { id: "mem-002", userId: "user-003", userName: "李四", role: "member", joinedAt: "2024-01-05" },
    { id: "mem-003", userId: "user-004", userName: "王五", role: "member", joinedAt: "2024-01-10" },
    { id: "mem-004", userId: "user-005", userName: "赵六", role: "member", joinedAt: "2024-02-01" },
    { id: "mem-005", userId: "user-006", userName: "孙七", role: "viewer", joinedAt: "2024-02-15" },
  ],
  "proj-002": [
    { id: "mem-006", userId: "user-003", userName: "李四", role: "manager", joinedAt: "2024-02-15" },
    { id: "mem-007", userId: "user-007", userName: "周八", role: "member", joinedAt: "2024-02-20" },
    { id: "mem-008", userId: "user-008", userName: "吴九", role: "member", joinedAt: "2024-03-01" },
  ],
  "proj-003": [
    { id: "mem-009", userId: "user-004", userName: "王五", role: "manager", joinedAt: "2023-10-01" },
    { id: "mem-010", userId: "user-002", userName: "张三", role: "member", joinedAt: "2023-10-05" },
    { id: "mem-011", userId: "user-006", userName: "孙七", role: "member", joinedAt: "2023-10-15" },
    { id: "mem-012", userId: "user-003", userName: "李四", role: "viewer", joinedAt: "2023-11-01" },
  ],
};

/**
 * Mock 项目动态列表
 */
export const mockProjectActivities: Record<string, import("@/types/project").ProjectActivity[]> = {
  "proj-001": [
    { id: "act-001", projectId: "proj-001", type: "phase_change", description: "项目阶段从规划推进到执行", operator: "张三", createdAt: "2024-03-15 10:30:00" },
    { id: "act-002", projectId: "proj-001", type: "task_association", description: "关联任务: 数据质量评估", operator: "李四", createdAt: "2024-03-12 14:20:00" },
    { id: "act-003", projectId: "proj-001", type: "milestone_complete", description: "完成里程碑: 数据采集完成", operator: "王五", createdAt: "2024-03-10 09:00:00" },
    { id: "act-004", projectId: "proj-001", type: "document_upload", description: "上传文档: 数据治理方案.docx", operator: "赵六", createdAt: "2024-03-08 16:45:00" },
    { id: "act-005", projectId: "proj-001", type: "member_change", description: "新成员孙七加入项目", operator: "张三", createdAt: "2024-02-15 11:00:00" },
    { id: "act-006", projectId: "proj-001", type: "phase_change", description: "项目阶段从立项推进到规划", operator: "张三", createdAt: "2024-01-20 09:30:00" },
    { id: "act-007", projectId: "proj-001", type: "member_change", description: "新成员赵六加入项目", operator: "张三", createdAt: "2024-02-01 10:00:00" },
  ],
  "proj-002": [
    { id: "act-008", projectId: "proj-002", type: "phase_change", description: "项目阶段从立项推进到规划", operator: "李四", createdAt: "2024-02-28 10:00:00" },
    { id: "act-009", projectId: "proj-002", type: "member_change", description: "新成员吴九加入项目", operator: "李四", createdAt: "2024-03-01 09:00:00" },
  ],
};

/**
 * Mock 项目里程碑列表
 */
export const mockProjectMilestones: Record<string, import("@/types/project").ProjectMilestone[]> = {
  "proj-001": [
    { id: "mile-001", projectId: "proj-001", name: "数据采集完成", description: "完成客户数据的采集工作", status: "completed", plannedDate: "2024-03-10", actualDate: "2024-03-08", createdAt: "2024-01-15" },
    { id: "mile-002", projectId: "proj-001", name: "数据质量评估", description: "完成数据质量评估报告", status: "in_progress", plannedDate: "2024-04-15", createdAt: "2024-01-20" },
    { id: "mile-003", projectId: "proj-001", name: "治理方案实施", description: "实施治理方案并验证效果", status: "pending", plannedDate: "2024-05-30", createdAt: "2024-02-01" },
    { id: "mile-004", projectId: "proj-001", name: "项目验收", description: "完成项目验收并交付", status: "pending", plannedDate: "2024-06-30", createdAt: "2024-02-15" },
  ],
  "proj-002": [
    { id: "mile-005", projectId: "proj-002", name: "数据源接入", description: "完成各渠道数据源接入", status: "in_progress", plannedDate: "2024-04-01", createdAt: "2024-02-20" },
    { id: "mile-006", projectId: "proj-002", name: "数据整合", description: "完成数据整合工作", status: "pending", plannedDate: "2024-06-01", createdAt: "2024-02-25" },
    { id: "mile-007", projectId: "proj-002", name: "数据仓库上线", description: "数据仓库正式上线", status: "pending", plannedDate: "2024-08-15", createdAt: "2024-03-01" },
  ],
};

/**
 * 获取项目成员列表
 */
export function getProjectMembers(projectId: string): import("@/types/project").ProjectMember[] {
  return mockProjectMembers[projectId] || [];
}

/**
 * 获取项目动态列表
 */
export function getProjectActivities(projectId: string): import("@/types/project").ProjectActivity[] {
  return (mockProjectActivities[projectId] || []).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * 获取项目里程碑列表
 */
export function getProjectMilestones(projectId: string): import("@/types/project").ProjectMilestone[] {
  return mockProjectMilestones[projectId] || [];
}

/**
 * 获取项目详情统计信息
 */
export function getProjectDetailStatistics(projectId: string): import("@/types/project").ProjectDetailStatistics {
  const project = getProjectById(projectId);
  const milestones = getProjectMilestones(projectId);
  const members = getProjectMembers(projectId);

  return {
    totalTasks: project?.totalTasks || 0,
    completedTasks: project?.completedTasks || 0,
    totalMilestones: milestones.length,
    completedMilestones: milestones.filter((m) => m.status === "completed").length,
    totalDocuments: Math.floor(Math.random() * 20) + 5, // Mock data
    totalMembers: members.length,
  };
}

/**
 * 阶段推进
 */
export function advanceProjectPhase(id: string): Project | undefined {
  const project = mockProjects.find((p) => p.id === id);
  if (!project) return undefined;

  const phaseOrder: ProjectPhase[] = ["initiation", "planning", "execution", "acceptance", "closed"];
  const currentIndex = phaseOrder.indexOf(project.phase);

  if (currentIndex < phaseOrder.length - 1) {
    project.phase = phaseOrder[currentIndex + 1];
    project.progress = Math.min(100, project.progress + 20);
    project.updatedAt = new Date().toISOString().split("T")[0];
  }

  return project;
}

/**
 * 阶段回退
 */
export function revertProjectPhase(id: string, reason: string): Project | undefined {
  const project = mockProjects.find((p) => p.id === id);
  if (!project) return undefined;

  const phaseOrder: ProjectPhase[] = ["initiation", "planning", "execution", "acceptance", "closed"];
  const currentIndex = phaseOrder.indexOf(project.phase);

  if (currentIndex > 0) {
    project.phase = phaseOrder[currentIndex - 1];
    project.progress = Math.max(0, project.progress - 20);
    project.updatedAt = new Date().toISOString().split("T")[0];
    console.log(`Phase revert reason: ${reason}`);
  }

  return project;
}