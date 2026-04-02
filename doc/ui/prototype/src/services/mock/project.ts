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