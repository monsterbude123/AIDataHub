export interface JwtPayload {
  userId: string;
  username: string;
  roles: string[];
}

export interface AuthenticatedUser {
  id: string;
  username: string;
  email?: string;
  realName?: string;
  orgId: string;
  roles: string[];
  permissions: string[];
}
