import type { ID, PageRequest, RequestMeta, User } from '../../types';

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

export type DeleteUserRequest = {
  meta?: RequestMeta;
  userId: ID;
};
