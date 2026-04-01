import type {
  Approval,
  ApprovalTemplate,
  CreateApprovalRequest,
  CreateApprovalTemplateRequest,
  CreateUserRequest,
  DataPermission,
  DeleteMenuNodeRequest,
  DeleteDirectoryNodeRequest,
  DirectoryTreeNode,
  ListMyTodoApprovalsRequest,
  ListUsersRequest,
  LoginRequest,
  LoginResponse,
  MenuNode,
  Organization,
  PageResult,
  Permission,
  Role,
  SystemAuthClient,
  UpsertDataPermissionRequest,
  UpsertDirectoryNodeRequest,
  UpsertMenuNodeRequest,
  User,
  AssignRolesRequest,
  ApproveRequest,
  ApprovalReminderRequest,
  UpsertApprovalTemplateRequest,
} from '@ai-datahub/contract';
import type { Result } from '@ai-datahub/contract';

import type { HttpClient } from '../http/HttpClient';

export class SystemAuthHttpClient implements SystemAuthClient {
  constructor(private readonly http: HttpClient) {}

  // Authentication
  login(req: LoginRequest): Promise<Result<LoginResponse>> {
    return this.http.request({
      path: '/auth/login',
      method: 'POST',
      meta: req.meta,
      body: { username: req.username, password: req.password },
    });
  }

  // Organization
  listOrganizations(req: {
    meta?: { traceId?: string };
    keyword?: string;
  }): Promise<Result<Organization[]>> {
    return this.http.request({
      path: '/organizations',
      method: 'GET',
      meta: req.meta,
      query: { keyword: req.keyword },
    });
  }

  createOrganization(req: {
    meta?: { traceId?: string };
    org: Omit<Organization, 'id'>;
  }): Promise<Result<{ orgId: string }>> {
    return this.http.request({
      path: '/organizations',
      method: 'POST',
      meta: req.meta,
      body: req,
    });
  }

  updateOrganization(req: {
    meta?: { traceId?: string };
    org: Organization;
  }): Promise<Result<{ success: boolean }>> {
    return this.http.request({
      path: '/organizations',
      method: 'PUT',
      meta: req.meta,
      body: req,
    });
  }

  deleteOrganization(req: {
    meta?: { traceId?: string };
    orgId: string;
  }): Promise<Result<{ success: boolean }>> {
    return this.http.request({
      path: `/organizations/${req.orgId}`,
      method: 'DELETE',
      meta: req.meta,
    });
  }

  // User
  createUser(req: CreateUserRequest): Promise<Result<{ userId: string }>> {
    return this.http.request({
      path: '/users',
      method: 'POST',
      meta: req.meta,
      body: req,
    });
  }

  updateUser(req: {
    meta?: { traceId?: string };
    user: Omit<User, 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ success: boolean }>> {
    return this.http.request({
      path: '/users',
      method: 'PUT',
      meta: req.meta,
      body: req,
    });
  }

  deleteUser(req: {
    meta?: { traceId?: string };
    userId: string;
  }): Promise<Result<{ success: boolean }>> {
    return this.http.request({
      path: `/users/${req.userId}`,
      method: 'DELETE',
      meta: req.meta,
    });
  }

  listUsers(req: ListUsersRequest): Promise<Result<PageResult<User>>> {
    return this.http.request({
      path: '/users',
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

  assignRoles(req: AssignRolesRequest): Promise<Result<{ success: boolean }>> {
    return this.http.request({
      path: '/users/assign-roles',
      method: 'POST',
      meta: req.meta,
      body: req,
    });
  }

  // Role
  listRoles(req: {
    meta?: { traceId?: string };
    keyword?: string;
  }): Promise<Result<Role[]>> {
    return this.http.request({
      path: '/roles',
      method: 'GET',
      meta: req.meta,
      query: { keyword: req.keyword },
    });
  }

  createRole(req: {
    meta?: { traceId?: string };
    role: Omit<Role, 'id'>;
  }): Promise<Result<{ roleId: string }>> {
    return this.http.request({
      path: '/roles',
      method: 'POST',
      meta: req.meta,
      body: req,
    });
  }

  updateRole(req: {
    meta?: { traceId?: string };
    role: Role;
  }): Promise<Result<{ success: boolean }>> {
    return this.http.request({
      path: '/roles',
      method: 'PUT',
      meta: req.meta,
      body: req,
    });
  }

  deleteRole(req: {
    meta?: { traceId?: string };
    roleId: string;
  }): Promise<Result<{ success: boolean }>> {
    return this.http.request({
      path: `/roles/${req.roleId}`,
      method: 'DELETE',
      meta: req.meta,
    });
  }

  // Permissions
  createPermission(req: {
    meta?: { traceId?: string };
    permission: Omit<Permission, 'id' | 'createdAt'>;
  }): Promise<Result<{ permissionId: string }>> {
    return this.http.request({
      path: '/permissions',
      method: 'POST',
      meta: req.meta,
      body: req,
    });
  }

  listPermissions(req: {
    meta?: { traceId?: string };
    keyword?: string;
    page: { page: number; pageSize: number };
  }): Promise<Result<PageResult<Permission>>> {
    return this.http.request({
      path: '/permissions',
      method: 'GET',
      meta: req.meta,
      query: {
        keyword: req.keyword,
        page: req.page.page,
        pageSize: req.page.pageSize,
      },
    });
  }

  bindPermissionsToRole(req: {
    meta?: { traceId?: string };
    roleId: string;
    permissionIds: string[];
  }): Promise<Result<{ success: boolean }>> {
    return this.http.request({
      path: '/permissions/bind-to-role',
      method: 'POST',
      meta: req.meta,
      body: req,
    });
  }

  // Menu
  listMenuTree(req: {
    meta?: { traceId?: string };
  }): Promise<Result<MenuNode[]>> {
    return this.http.request({
      path: '/menu/tree',
      method: 'GET',
      meta: req.meta,
    });
  }

  upsertMenuNode(
    req: UpsertMenuNodeRequest
  ): Promise<Result<{ nodeId: string }>> {
    return this.http.request({
      path: '/menu/upsert',
      method: 'POST',
      meta: req.meta,
      body: req,
    });
  }

  deleteMenuNode(
    req: DeleteMenuNodeRequest
  ): Promise<Result<{ success: boolean }>> {
    return this.http.request({
      path: `/menu/${req.nodeId}`,
      method: 'DELETE',
      meta: req.meta,
    });
  }

  // Approval templates
  createApprovalTemplate(
    req: CreateApprovalTemplateRequest
  ): Promise<Result<{ templateId: string }>> {
    return this.http.request({
      path: '/approval-templates',
      method: 'POST',
      meta: req.meta,
      body: req,
    });
  }

  updateApprovalTemplate(
    req: UpsertApprovalTemplateRequest
  ): Promise<Result<{ success: boolean }>> {
    return this.http.request({
      path: '/approval-templates',
      method: 'PUT',
      meta: req.meta,
      body: req,
    });
  }

  deleteApprovalTemplate(req: {
    meta?: { traceId?: string };
    templateId: string;
  }): Promise<Result<{ success: boolean }>> {
    return this.http.request({
      path: `/approval-templates/${req.templateId}`,
      method: 'DELETE',
      meta: req.meta,
    });
  }

  listApprovalTemplates(req: {
    meta?: { traceId?: string };
    businessType?: string;
  }): Promise<Result<ApprovalTemplate[]>> {
    return this.http.request({
      path: '/approval-templates',
      method: 'GET',
      meta: req.meta,
      query: { businessType: req.businessType },
    });
  }

  // Approvals
  createApproval(
    req: CreateApprovalRequest
  ): Promise<Result<{ approvalId: string }>> {
    return this.http.request({
      path: '/approvals',
      method: 'POST',
      meta: req.meta,
      body: req,
    });
  }

  approve(req: ApproveRequest): Promise<Result<{ success: boolean }>> {
    return this.http.request({
      path: `/approvals/${req.approvalId}/approve`,
      method: 'POST',
      meta: req.meta,
      body: req,
    });
  }

  listMyTodoApprovals(
    req: ListMyTodoApprovalsRequest
  ): Promise<Result<PageResult<Approval>>> {
    return this.http.request({
      path: '/approvals/todo',
      method: 'GET',
      meta: req.meta,
      query: {
        userId: req.userId,
        page: req.page.page,
        pageSize: req.page.pageSize,
      },
    });
  }

  listMyDoneApprovals(req: {
    meta?: { traceId?: string };
    userId: string;
    page: { page: number; pageSize: number };
  }): Promise<Result<PageResult<Approval>>> {
    return this.http.request({
      path: '/approvals/done',
      method: 'GET',
      meta: req.meta,
      query: {
        userId: req.userId,
        page: req.page.page,
        pageSize: req.page.pageSize,
      },
    });
  }

  remindApproval(
    req: ApprovalReminderRequest
  ): Promise<Result<{ success: boolean }>> {
    return this.http.request({
      path: `/approvals/${req.approvalId}/remind`,
      method: 'POST',
      meta: req.meta,
      body: req,
    });
  }

  // Directory tree
  listDirectoryTree(req: {
    meta?: { traceId?: string };
    parentId?: string;
    keyword?: string;
  }): Promise<Result<DirectoryTreeNode[]>> {
    return this.http.request({
      path: '/directory/tree',
      method: 'GET',
      meta: req.meta,
      query: { parentId: req.parentId, keyword: req.keyword },
    });
  }

  upsertDirectoryNode(
    req: UpsertDirectoryNodeRequest
  ): Promise<Result<{ nodeId: string }>> {
    return this.http.request({
      path: '/directory/upsert',
      method: 'POST',
      meta: req.meta,
      body: req,
    });
  }

  deleteDirectoryNode(
    req: DeleteDirectoryNodeRequest
  ): Promise<Result<{ success: boolean }>> {
    return this.http.request({
      path: `/directory/${req.nodeId}`,
      method: 'DELETE',
      meta: req.meta,
    });
  }

  // Data permission
  upsertDataPermission(
    req: UpsertDataPermissionRequest
  ): Promise<Result<{ permissionId: string }>> {
    return this.http.request({
      path: '/data-permissions',
      method: 'POST',
      meta: req.meta,
      body: req,
    });
  }

  listDataPermissions(req: {
    meta?: { traceId?: string };
    roleId: string;
    page: { page: number; pageSize: number };
  }): Promise<Result<PageResult<DataPermission>>> {
    return this.http.request({
      path: '/data-permissions',
      method: 'GET',
      meta: req.meta,
      query: {
        roleId: req.roleId,
        page: req.page.page,
        pageSize: req.page.pageSize,
      },
    });
  }
}
