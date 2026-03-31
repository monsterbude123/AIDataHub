import type {
  Approval,
  ID,
  ISODateTime,
  Organization,
  PageRequest,
  PageResult,
  RequestMeta,
  Result,
  Role,
  User,
} from '../types';

export type SystemAuthErrorCode =
  | 'USER_NOT_FOUND'
  | 'ORG_NOT_FOUND'
  | 'ROLE_NOT_FOUND'
  | 'APPROVAL_NOT_FOUND'
  | 'USERNAME_DUPLICATE'
  | 'DIRECTORY_NOT_FOUND'
  | 'PERMISSION_NOT_FOUND'
  | 'DATA_PERMISSION_NOT_FOUND'
  | 'INVALID_ARGUMENT'
  | 'PERMISSION_DENIED'
  | 'APPROVAL_TEMPLATE_NOT_FOUND'
  | 'APPROVAL_STATE_INVALID'
  | 'REMIND_FAILED';

export type CreateUserRequest = {
  meta?: RequestMeta;
  user: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'status'> & {
    status?: User['status'];
  };
};

export type UpdateUserRequest = {
  meta?: RequestMeta;
  user: Omit<User, 'createdAt' | 'updatedAt'>;
};

export type ListUsersRequest = {
  meta?: RequestMeta;
  orgId?: ID;
  keyword?: string;
  page: PageRequest;
};

export type AssignRolesRequest = {
  meta?: RequestMeta;
  userId: ID;
  roleIds: ID[];
};

export type Permission = {
  id: ID;
  type: 'URI' | 'PAGE_ELEMENT';
  name: string;
  code: string;
  resource: string; // uri / selector / element-id 等
  createdAt: ISODateTime;
};

export type MenuNodeType = 'DIRECTORY' | 'MENU' | 'BUTTON';

export type MenuNode = {
  id: ID;
  parentId?: ID;
  type: MenuNodeType;
  name: string;
  path?: string;
  icon?: string;
  permissionCode?: string;
  enabled: boolean;
  sort?: number;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};

export type UpsertMenuNodeRequest = {
  meta?: RequestMeta;
  node: Omit<MenuNode, 'createdAt' | 'updatedAt'> & { id?: ID };
};

export type DeleteMenuNodeRequest = { meta?: RequestMeta; nodeId: ID };

export type DirectoryTreeNode = {
  id: ID;
  parentId?: ID;
  name: string;
  code: string;
  // 扩展属性（用于“系统树目录统一管理”）
  attributes?: Record<string, unknown>;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};

export type UpsertDirectoryNodeRequest = {
  meta?: RequestMeta;
  node: Omit<DirectoryTreeNode, 'createdAt' | 'updatedAt'> & { id?: ID };
};

export type DeleteDirectoryNodeRequest = { meta?: RequestMeta; nodeId: ID };

export type DataPermission = {
  id: ID;
  roleId: ID;
  // 分级分类/项目/组织范围等由实现层解释
  scope: Record<string, unknown>;
  createdAt: ISODateTime;
};

export type UpsertDataPermissionRequest = {
  meta?: RequestMeta;
  permission: Omit<DataPermission, 'createdAt'> & { id?: ID };
};

export type ApprovalReminderRequest = {
  meta?: RequestMeta;
  approvalId: ID;
  message?: string;
};

export type ApprovalTemplate = {
  id: ID;
  businessType: string;
  name: string;
  // 简化表达：节点与规则由实现层解释
  definition: Record<string, unknown>;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};

export type CreateApprovalTemplateRequest = {
  meta?: RequestMeta;
  template: Omit<ApprovalTemplate, 'id' | 'createdAt' | 'updatedAt'>;
};

export type CreateApprovalRequest = {
  meta?: RequestMeta;
  businessType: string;
  businessId: ID;
  title: string;
  applicantId: ID;
  payload?: Record<string, unknown>;
};

export type ApproveRequest = {
  meta?: RequestMeta;
  approvalId: ID;
  action: 'APPROVE' | 'REJECT';
  comment?: string;
};

export type ListMyTodoApprovalsRequest = {
  meta?: RequestMeta;
  userId: ID;
  page: PageRequest;
};

export interface SystemAuthClient {
  // Organization
  listOrganizations(req: {
    meta?: RequestMeta;
    keyword?: string;
  }): Promise<Result<Organization[]>>;
  createOrganization(req: {
    meta?: RequestMeta;
    org: Omit<Organization, 'id'>;
  }): Promise<Result<{ orgId: ID }>>;
  updateOrganization(req: {
    meta?: RequestMeta;
    org: Organization;
  }): Promise<Result<{ success: boolean }>>;
  deleteOrganization(req: {
    meta?: RequestMeta;
    orgId: ID;
  }): Promise<Result<{ success: boolean }>>;

  // User
  createUser(req: CreateUserRequest): Promise<Result<{ userId: ID }>>;
  updateUser(req: UpdateUserRequest): Promise<Result<{ success: boolean }>>;
  deleteUser(req: {
    meta?: RequestMeta;
    userId: ID;
  }): Promise<Result<{ success: boolean }>>;
  listUsers(req: ListUsersRequest): Promise<Result<PageResult<User>>>;
  assignRoles(req: AssignRolesRequest): Promise<Result<{ success: boolean }>>;

  // Role
  listRoles(req: {
    meta?: RequestMeta;
    keyword?: string;
  }): Promise<Result<Role[]>>;
  createRole(req: {
    meta?: RequestMeta;
    role: Omit<Role, 'id'>;
  }): Promise<Result<{ roleId: ID }>>;
  updateRole(req: {
    meta?: RequestMeta;
    role: Role;
  }): Promise<Result<{ success: boolean }>>;
  deleteRole(req: {
    meta?: RequestMeta;
    roleId: ID;
  }): Promise<Result<{ success: boolean }>>;

  // Permissions
  createPermission(req: {
    meta?: RequestMeta;
    permission: Omit<Permission, 'id' | 'createdAt'>;
  }): Promise<Result<{ permissionId: ID }>>;
  listPermissions(req: {
    meta?: RequestMeta;
    keyword?: string;
    page: PageRequest;
  }): Promise<Result<PageResult<Permission>>>;
  bindPermissionsToRole(req: {
    meta?: RequestMeta;
    roleId: ID;
    permissionIds: ID[];
  }): Promise<Result<{ success: boolean }>>;

  // Menu
  listMenuTree(req: { meta?: RequestMeta }): Promise<Result<MenuNode[]>>;
  upsertMenuNode(req: UpsertMenuNodeRequest): Promise<Result<{ nodeId: ID }>>;
  deleteMenuNode(
    req: DeleteMenuNodeRequest
  ): Promise<Result<{ success: boolean }>>;

  // Approval templates
  createApprovalTemplate(
    req: CreateApprovalTemplateRequest
  ): Promise<Result<{ templateId: ID }>>;
  updateApprovalTemplate(req: {
    meta?: RequestMeta;
    template: ApprovalTemplate;
  }): Promise<Result<{ success: boolean }>>;
  deleteApprovalTemplate(req: {
    meta?: RequestMeta;
    templateId: ID;
  }): Promise<Result<{ success: boolean }>>;
  listApprovalTemplates(req: {
    meta?: RequestMeta;
    businessType?: string;
  }): Promise<Result<ApprovalTemplate[]>>;

  // Approvals
  createApproval(
    req: CreateApprovalRequest
  ): Promise<Result<{ approvalId: ID }>>;
  approve(req: ApproveRequest): Promise<Result<{ success: boolean }>>;
  listMyTodoApprovals(
    req: ListMyTodoApprovalsRequest
  ): Promise<Result<PageResult<Approval>>>;
  listMyDoneApprovals(req: {
    meta?: RequestMeta;
    userId: ID;
    page: PageRequest;
  }): Promise<Result<PageResult<Approval>>>;
  remindApproval(
    req: ApprovalReminderRequest
  ): Promise<Result<{ success: boolean }>>;

  // Directory tree（系统树目录统一管理）
  listDirectoryTree(req: {
    meta?: RequestMeta;
    parentId?: ID;
    keyword?: string;
  }): Promise<Result<DirectoryTreeNode[]>>;
  upsertDirectoryNode(
    req: UpsertDirectoryNodeRequest
  ): Promise<Result<{ nodeId: ID }>>;
  deleteDirectoryNode(
    req: DeleteDirectoryNodeRequest
  ): Promise<Result<{ success: boolean }>>;

  // Data permission
  upsertDataPermission(
    req: UpsertDataPermissionRequest
  ): Promise<Result<{ permissionId: ID }>>;
  listDataPermissions(req: {
    meta?: RequestMeta;
    roleId: ID;
    page: PageRequest;
  }): Promise<Result<PageResult<DataPermission>>>;
}
