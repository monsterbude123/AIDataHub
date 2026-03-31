import type {
  ID,
  ISODateTime,
  PageRequest,
  PageResult,
  Project,
  RequestMeta,
  Result,
} from '../types';

export type SystemAdminErrorCode =
  | 'INVALID_ARGUMENT'
  | 'PERMISSION_DENIED'
  | 'DUPLICATE_NAME'
  | 'PROJECT_NOT_FOUND'
  | 'PROJECT_GROUP_NOT_FOUND'
  | 'DRIVER_NOT_FOUND'
  | 'FUNCTION_NOT_FOUND'
  | 'PACKAGE_NOT_FOUND'
  | 'TICKET_NOT_FOUND';

export type FunctionDef = {
  id: ID;
  category: string;
  name: string;
  description?: string;
  parameters: Array<{
    name: string;
    type: string;
    description?: string;
    required?: boolean;
  }>;
  implementationRef?: string;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};

export type DriverDef = {
  id: ID;
  name: string;
  version: string;
  // jar/package 存储引用，由实现层解释
  artifactRef: string;
  createdAt: ISODateTime;
};

export type PackageDef = {
  id: ID;
  name: string;
  version?: string;
  artifactRef: string;
  description?: string;
  createdAt: ISODateTime;
};

export type ProjectGroup = {
  id: ID;
  name: string;
  description?: string;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};

export type OperationLog = {
  id: ID;
  actorUserId: ID;
  action: string;
  target?: string;
  success: boolean;
  ip?: string;
  traceId?: string;
  createdAt: ISODateTime;
};

export type WorkTicketStatus = 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'CANCELED';

export type WorkTicket = {
  id: ID;
  title: string;
  description?: string;
  assigneeUserId: ID;
  status: WorkTicketStatus;
  resolution?: string;
  attachmentsRef?: string[];
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};

export type UpdateWorkTicketRequest = {
  meta?: RequestMeta;
  ticketId: ID;
  status?: WorkTicketStatus;
  resolution?: string;
};

export interface SystemAdminClient {
  // Project
  createProject(req: {
    meta?: RequestMeta;
    project: Omit<Project, 'id'>;
  }): Promise<Result<{ projectId: ID }>>;
  updateProject(req: {
    meta?: RequestMeta;
    project: Project;
  }): Promise<Result<{ success: boolean }>>;
  deleteProject(req: {
    meta?: RequestMeta;
    projectId: ID;
  }): Promise<Result<{ success: boolean }>>;
  listProjects(req: {
    meta?: RequestMeta;
    orgId?: ID;
    keyword?: string;
    page: PageRequest;
  }): Promise<Result<PageResult<Project>>>;
  getProject(req: {
    meta?: RequestMeta;
    projectId: ID;
  }): Promise<Result<Project>>;

  // Project groups
  createProjectGroup(req: {
    meta?: RequestMeta;
    group: Omit<ProjectGroup, 'id' | 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ groupId: ID }>>;
  updateProjectGroup(req: {
    meta?: RequestMeta;
    group: Omit<ProjectGroup, 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ success: boolean }>>;
  deleteProjectGroup(req: {
    meta?: RequestMeta;
    groupId: ID;
  }): Promise<Result<{ success: boolean }>>;
  listProjectGroups(req: {
    meta?: RequestMeta;
    orgId?: ID;
    keyword?: string;
    page: PageRequest;
  }): Promise<Result<PageResult<ProjectGroup>>>;
  bindProjectsToGroup(req: {
    meta?: RequestMeta;
    groupId: ID;
    projectIds: ID[];
  }): Promise<Result<{ success: boolean }>>;
  bindUsersToGroup(req: {
    meta?: RequestMeta;
    groupId: ID;
    userIds: ID[];
  }): Promise<Result<{ success: boolean }>>;

  // Functions
  listFunctions(req: {
    meta?: RequestMeta;
    keyword?: string;
    page: PageRequest;
  }): Promise<Result<PageResult<FunctionDef>>>;
  getFunction(req: {
    meta?: RequestMeta;
    functionId: ID;
  }): Promise<Result<FunctionDef>>;
  createFunction(req: {
    meta?: RequestMeta;
    func: Omit<FunctionDef, 'id' | 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ functionId: ID }>>;
  updateFunction(req: {
    meta?: RequestMeta;
    func: Omit<FunctionDef, 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ success: boolean }>>;
  deleteFunction(req: {
    meta?: RequestMeta;
    functionId: ID;
  }): Promise<Result<{ success: boolean }>>;

  // Custom packages
  listPackages(req: {
    meta?: RequestMeta;
    keyword?: string;
    page: PageRequest;
  }): Promise<Result<PageResult<PackageDef>>>;
  createPackage(req: {
    meta?: RequestMeta;
    pkg: Omit<PackageDef, 'id' | 'createdAt'>;
  }): Promise<Result<{ packageId: ID }>>;
  deletePackage(req: {
    meta?: RequestMeta;
    packageId: ID;
  }): Promise<Result<{ success: boolean }>>;

  // Drivers
  listDrivers(req: {
    meta?: RequestMeta;
    page: PageRequest;
  }): Promise<Result<PageResult<DriverDef>>>;
  createDriver(req: {
    meta?: RequestMeta;
    driver: Omit<DriverDef, 'id' | 'createdAt'>;
  }): Promise<Result<{ driverId: ID }>>;
  deleteDriver(req: {
    meta?: RequestMeta;
    driverId: ID;
  }): Promise<Result<{ success: boolean }>>;

  // Operation logs
  listOperationLogs(req: {
    meta?: RequestMeta;
    actorUserId?: ID;
    page: PageRequest;
  }): Promise<Result<PageResult<OperationLog>>>;

  // Tickets
  listMyTickets(req: {
    meta?: RequestMeta;
    assigneeUserId: ID;
    page: PageRequest;
  }): Promise<Result<PageResult<WorkTicket>>>;
  getWorkTicket(req: {
    meta?: RequestMeta;
    ticketId: ID;
  }): Promise<Result<WorkTicket>>;
  updateWorkTicket(
    req: UpdateWorkTicketRequest
  ): Promise<Result<{ success: boolean }>>;
}
