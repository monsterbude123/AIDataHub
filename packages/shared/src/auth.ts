/**
 * JWT 验证结果
 */
export interface JwtValidationResult {
  valid: boolean;
  user?: AuthenticatedUser;
}

/**
 * 认证用户信息
 * 由 system-auth-service 签发，其他服务只读
 */
export interface AuthenticatedUser {
  id: string;
  username: string;
  orgId: string;
  roles: string[];
  permissions?: string[];
}

/**
 * JWT 验证器接口
 * 各服务实现此接口调用 system-auth-service 或本地验证
 */
export interface JwtValidator {
  validateToken(token: string): Promise<JwtValidationResult>;
}

/**
 * 公共端点装饰器元数据键
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Public 装饰器 - 标记端点不需要认证
 * 使用方法: @Public()
 */
import { SetMetadata } from '@nestjs/common';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
