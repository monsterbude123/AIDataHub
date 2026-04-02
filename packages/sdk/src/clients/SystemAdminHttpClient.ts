import type {
  DriverDef,
  FunctionDef,
  OperationLog,
  PackageDef,
  PageResult,
  Project,
  ProjectGroup,
  RequestMeta,
  Result,
  SystemAdminClient,
  UpdateWorkTicketRequest,
  WorkTicket,
} from '@ai-datahub/contract';
import type { HttpClient } from '../http/HttpClient';

export class SystemAdminHttpClient implements SystemAdminClient {
  constructor(private readonly http: HttpClient) {}

  createProject(req: {
    meta?: RequestMeta;
    project: Omit<Project, 'id'>;
  }): Promise<Result<{ projectId: string }>> {
    return this.http.request({
      path: '/projects',
      method: 'POST',
      meta: req.meta,
      body: req,
    });
  }
  updateProject(req: {
    meta?: RequestMeta;
    project: Project;
  }): Promise<Result<{ success: boolean }>> {
    return this.http.request({
      path: '/projects',
      method: 'PUT',
      meta: req.meta,
      body: req,
    });
  }
  deleteProject(req: {
    meta?: RequestMeta;
    projectId: string;
  }): Promise<Result<{ success: boolean }>> {
    return this.http.request({
      path: `/projects/${req.projectId}`,
      method: 'DELETE',
      meta: req.meta,
    });
  }
  listProjects(req: {
    meta?: RequestMeta;
    orgId?: string;
    keyword?: string;
    page: { page: number; pageSize: number };
  }): Promise<Result<PageResult<Project>>> {
    return this.http.request({
      path: '/projects',
      method: 'GET',
      meta: req.meta,
      query: {
        orgId: req.orgId,
        keyword: req.keyword,
        page: req.page.page,
        pageSize: req.page.pageSize,
      },
    });
  }
  getProject(req: {
    meta?: RequestMeta;
    projectId: string;
  }): Promise<Result<Project>> {
    return this.http.request({
      path: `/projects/${req.projectId}`,
      method: 'GET',
      meta: req.meta,
    });
  }

  createProjectGroup(req: {
    meta?: RequestMeta;
    group: Omit<ProjectGroup, 'id' | 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ groupId: string }>> {
    return this.http.request({
      path: '/project-groups',
      method: 'POST',
      meta: req.meta,
      body: req,
    });
  }
  updateProjectGroup(req: {
    meta?: RequestMeta;
    group: Omit<ProjectGroup, 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ success: boolean }>> {
    return this.http.request({
      path: '/project-groups',
      method: 'PUT',
      meta: req.meta,
      body: req,
    });
  }
  deleteProjectGroup(req: {
    meta?: RequestMeta;
    groupId: string;
  }): Promise<Result<{ success: boolean }>> {
    return this.http.request({
      path: `/project-groups/${req.groupId}`,
      method: 'DELETE',
      meta: req.meta,
    });
  }
  listProjectGroups(req: {
    meta?: RequestMeta;
    orgId?: string;
    keyword?: string;
    page: { page: number; pageSize: number };
  }): Promise<Result<PageResult<ProjectGroup>>> {
    return this.http.request({
      path: '/project-groups',
      method: 'GET',
      meta: req.meta,
      query: {
        orgId: req.orgId,
        keyword: req.keyword,
        page: req.page.page,
        pageSize: req.page.pageSize,
      },
    });
  }
  bindProjectsToGroup(req: {
    meta?: RequestMeta;
    groupId: string;
    projectIds: string[];
  }): Promise<Result<{ success: boolean }>> {
    return this.http.request({
      path: `/project-groups/${req.groupId}/bind-projects`,
      method: 'POST',
      meta: req.meta,
      body: { projectIds: req.projectIds },
    });
  }
  bindUsersToGroup(req: {
    meta?: RequestMeta;
    groupId: string;
    userIds: string[];
  }): Promise<Result<{ success: boolean }>> {
    return this.http.request({
      path: `/project-groups/${req.groupId}/bind-users`,
      method: 'POST',
      meta: req.meta,
      body: { userIds: req.userIds },
    });
  }

  listFunctions(req: {
    meta?: RequestMeta;
    keyword?: string;
    page: { page: number; pageSize: number };
  }): Promise<Result<PageResult<FunctionDef>>> {
    return this.http.request({
      path: '/functions',
      method: 'GET',
      meta: req.meta,
      query: {
        keyword: req.keyword,
        page: req.page.page,
        pageSize: req.page.pageSize,
      },
    });
  }
  getFunction(req: {
    meta?: RequestMeta;
    functionId: string;
  }): Promise<Result<FunctionDef>> {
    return this.http.request({
      path: `/functions/${req.functionId}`,
      method: 'GET',
      meta: req.meta,
    });
  }
  createFunction(req: {
    meta?: RequestMeta;
    func: Omit<FunctionDef, 'id' | 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ functionId: string }>> {
    return this.http.request({
      path: '/functions',
      method: 'POST',
      meta: req.meta,
      body: req,
    });
  }
  updateFunction(req: {
    meta?: RequestMeta;
    func: Omit<FunctionDef, 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ success: boolean }>> {
    return this.http.request({
      path: '/functions',
      method: 'PUT',
      meta: req.meta,
      body: req,
    });
  }
  deleteFunction(req: {
    meta?: RequestMeta;
    functionId: string;
  }): Promise<Result<{ success: boolean }>> {
    return this.http.request({
      path: `/functions/${req.functionId}`,
      method: 'DELETE',
      meta: req.meta,
    });
  }

  listPackages(req: {
    meta?: RequestMeta;
    keyword?: string;
    page: { page: number; pageSize: number };
  }): Promise<Result<PageResult<PackageDef>>> {
    return this.http.request({
      path: '/packages',
      method: 'GET',
      meta: req.meta,
      query: {
        keyword: req.keyword,
        page: req.page.page,
        pageSize: req.page.pageSize,
      },
    });
  }
  createPackage(req: {
    meta?: RequestMeta;
    pkg: Omit<PackageDef, 'id' | 'createdAt'>;
  }): Promise<Result<{ packageId: string }>> {
    return this.http.request({
      path: '/packages',
      method: 'POST',
      meta: req.meta,
      body: req,
    });
  }
  deletePackage(req: {
    meta?: RequestMeta;
    packageId: string;
  }): Promise<Result<{ success: boolean }>> {
    return this.http.request({
      path: `/packages/${req.packageId}`,
      method: 'DELETE',
      meta: req.meta,
    });
  }

  listDrivers(req: {
    meta?: RequestMeta;
    page: { page: number; pageSize: number };
  }): Promise<Result<PageResult<DriverDef>>> {
    return this.http.request({
      path: '/drivers',
      method: 'GET',
      meta: req.meta,
      query: { page: req.page.page, pageSize: req.page.pageSize },
    });
  }
  createDriver(req: {
    meta?: RequestMeta;
    driver: Omit<DriverDef, 'id' | 'createdAt'>;
  }): Promise<Result<{ driverId: string }>> {
    return this.http.request({
      path: '/drivers',
      method: 'POST',
      meta: req.meta,
      body: req,
    });
  }
  deleteDriver(req: {
    meta?: RequestMeta;
    driverId: string;
  }): Promise<Result<{ success: boolean }>> {
    return this.http.request({
      path: `/drivers/${req.driverId}`,
      method: 'DELETE',
      meta: req.meta,
    });
  }

  listOperationLogs(req: {
    meta?: RequestMeta;
    actorUserId?: string;
    page: { page: number; pageSize: number };
  }): Promise<Result<PageResult<OperationLog>>> {
    return this.http.request({
      path: '/logs',
      method: 'GET',
      meta: req.meta,
      query: {
        actorUserId: req.actorUserId,
        page: req.page.page,
        pageSize: req.page.pageSize,
      },
    });
  }

  listMyTickets(req: {
    meta?: RequestMeta;
    assigneeUserId: string;
    page: { page: number; pageSize: number };
  }): Promise<Result<PageResult<WorkTicket>>> {
    return this.http.request({
      path: '/tickets',
      method: 'GET',
      meta: req.meta,
      query: {
        assigneeUserId: req.assigneeUserId,
        page: req.page.page,
        pageSize: req.page.pageSize,
      },
    });
  }
  getWorkTicket(req: {
    meta?: RequestMeta;
    ticketId: string;
  }): Promise<Result<WorkTicket>> {
    return this.http.request({
      path: `/tickets/${req.ticketId}`,
      method: 'GET',
      meta: req.meta,
    });
  }
  updateWorkTicket(
    req: UpdateWorkTicketRequest
  ): Promise<Result<{ success: boolean }>> {
    return this.http.request({
      path: `/tickets/${req.ticketId}`,
      method: 'PUT',
      meta: req.meta,
      body: { status: req.status, resolution: req.resolution },
    });
  }
}
