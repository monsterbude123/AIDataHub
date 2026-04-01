import type { ID, RequestMeta, Role } from '../../types';

export type ListRolesRequest = {
  meta?: RequestMeta;
  keyword?: string;
};

export type CreateRoleRequest = {
  meta?: RequestMeta;
  role: Omit<Role, 'id'>;
};

export type UpdateRoleRequest = {
  meta?: RequestMeta;
  role: Role;
};

export type DeleteRoleRequest = {
  meta?: RequestMeta;
  roleId: ID;
};
