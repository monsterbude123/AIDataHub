import { ApiProperty } from '@nestjs/swagger';

/**
 * 登录请求
 */
export class LoginRequest {
  @ApiProperty({ description: '用户名', example: 'admin' })
  username: string = undefined!;

  @ApiProperty({ description: '密码', example: 'admin123' })
  password: string = undefined!;
}

/**
 * 登录响应
 */
export class LoginResponse {
  @ApiProperty({ description: 'JWT 访问令牌' })
  token: string = undefined!;

  @ApiProperty({ description: '用户信息' })
  user: {
    id: string;
    username: string;
    email?: string;
    realName?: string;
    orgId: string;
  } = undefined!;

  @ApiProperty({ description: '用户角色列表' })
  roles: string[] = undefined!;
}

/**
 * JWT 载荷
 */
export interface JwtPayload {
  userId: string;
  username: string;
  roles: string[];
}

/**
 * 已认证用户信息
 */
export interface AuthenticatedUser {
  id: string;
  username: string;
  email?: string;
  realName?: string;
  orgId: string;
  roles: string[];
  permissions: string[];
}
