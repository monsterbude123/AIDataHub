import { Injectable, Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { createLogger } from '@ai-datahub/shared';
import type { JwtPayload, AuthenticatedUser } from './auth.dtos';

const logger = createLogger({ service: 'auth' });

export type { JwtPayload, AuthenticatedUser };

@Injectable()
export class AuthService {
  private readonly jwtSecret: string;

  constructor(@Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      if (process.env.NODE_ENV === 'production') {
        logger.error('JWT_SECRET is required in production');
        throw new Error('JWT_SECRET environment variable is required');
      }
      this.jwtSecret = 'dev-secret';
      logger.warn(
        'Using default dev JWT secret - this is insecure and should only be used in development'
      );
    } else {
      this.jwtSecret = secret;
    }
  }

  async validateToken(token: string): Promise<AuthenticatedUser | null> {
    try {
      const payload = jwt.verify(token, this.jwtSecret) as JwtPayload;

      // Get user details
      const user = await this.prisma.user.findUnique({
        where: { id: payload.userId },
      });
      if (!user || user.status !== 'ENABLED') {
        return null;
      }

      // Get user roles and permissions
      const userRoles = await this.prisma.userRole.findMany({
        where: { userId: payload.userId },
        include: { role: true },
      });

      const roleIds = userRoles.map((ur: { roleId: string }) => ur.roleId);
      const roleCodes = userRoles
        .filter((ur: { role: { enabled: boolean } }) => ur.role.enabled)
        .map((ur: { role: { code: string } }) => ur.role.code);

      // Get permissions for all roles
      const rolePermissions = await this.prisma.rolePermission.findMany({
        where: { roleId: { in: roleIds } },
        include: { permission: true },
      });

      const permissionCodes = rolePermissions
        .map((rp: { permission?: { code?: string } }) => rp.permission?.code)
        .filter(
          (code: string | undefined): code is string => code !== undefined
        );

      return {
        id: user.id,
        username: user.username,
        email: user.email ?? undefined,
        realName: user.realName ?? undefined,
        orgId: user.orgId,
        roles: roleCodes,
        permissions: permissionCodes,
      };
    } catch {
      return null;
    }
  }

  async getPermissionsForUser(userId: string): Promise<string[]> {
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
    });

    const roleIds = userRoles.map((ur: { roleId: string }) => ur.roleId);

    if (roleIds.length === 0) {
      return [];
    }

    const rolePermissions = await this.prisma.rolePermission.findMany({
      where: { roleId: { in: roleIds } },
      include: { permission: true },
    });

    return rolePermissions
      .map((rp: { permission?: { code?: string } }) => rp.permission?.code)
      .filter((code: string | undefined): code is string => code !== undefined);
  }
}
