import type { ID, ISODateTime, PageRequest, RequestMeta } from '../../types';

export type Permission = {
  id: ID;
  type: 'URI' | 'PAGE_ELEMENT';
  name: string;
  code: string;
  resource: string; // uri / selector / element-id 等
  createdAt: ISODateTime;
};

export type CreatePermissionRequest = {
  meta?: RequestMeta;
  permission: Omit<Permission, 'id' | 'createdAt'>;
};

export type ListPermissionsRequest = {
  meta?: RequestMeta;
  keyword?: string;
  page: PageRequest;
};

export type BindPermissionsToRoleRequest = {
  meta?: RequestMeta;
  roleId: ID;
  permissionIds: ID[];
};
