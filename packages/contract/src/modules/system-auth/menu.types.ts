import type { ID, ISODateTime, RequestMeta } from '../../types';

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
  node: Omit<MenuNode, 'createdAt' | 'updatedAt' | 'id'> & { id?: ID };
};

export type DeleteMenuNodeRequest = {
  meta?: RequestMeta;
  nodeId: ID;
};
