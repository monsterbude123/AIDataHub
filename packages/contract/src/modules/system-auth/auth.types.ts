import type { ID, RequestMeta } from '../../types';

export type LoginRequest = {
  meta?: RequestMeta;
  username: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  user: {
    id: ID;
    username: string;
    email?: string;
    realName?: string;
    orgId: ID;
  };
  roles: string[];
};
