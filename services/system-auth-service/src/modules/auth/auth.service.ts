import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { comparePassword } from '../crypto';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email?: string;
    realName?: string;
    orgId: string;
  };
  roles: string[];
}

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

@Injectable()
export class AuthService {
  private readonly jwtSecret: string;

  constructor(@Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient) {
    this.jwtSecret = process.env.JWT_SECRET || 'dev-secret';
  }

  async login(req: LoginRequest): Promise<LoginResponse> {
    // Find user by username with passwordHash
    const user = await this.prisma.user.findUnique({
      where: { username: req.username },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Check user status
    if (user.status !== 'ENABLED') {
      throw new UnauthorizedException('User is disabled');
    }

    // Check password
    if (!user.passwordHash) {
      throw new UnauthorizedException('Password not set for this user');
    }

    const passwordMatch = await comparePassword(
      req.password,
      user.passwordHash
    );
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid password');
    }

    // Get user roles
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId: user.id },
      include: { role: true },
    });

    const roleCodes = userRoles
      .filter((ur) => ur.role.enabled)
      .map((ur) => ur.role.code);

    // Generate JWT token
    const payload: JwtPayload = {
      userId: user.id,
      username: user.username,
      roles: roleCodes,
    };

    const token = jwt.sign(payload, this.jwtSecret, {
      expiresIn: '24h',
    });

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email ?? undefined,
        realName: user.realName ?? undefined,
        orgId: user.orgId,
      },
      roles: roleCodes,
    };
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
        where: { userId: user.id },
        include: { role: true },
      });

      const roleIds = userRoles.map((ur) => ur.roleId);
      const roleCodes = userRoles
        .filter((ur) => ur.role.enabled)
        .map((ur) => ur.role.code);

      // Get permissions for all roles
      const rolePermissions = await this.prisma.rolePermission.findMany({
        where: { roleId: { in: roleIds } },
        include: { permission: true },
      });

      const permissionCodes = rolePermissions
        .map((rp) => rp.permission?.code)
        .filter((code): code is string => code !== undefined);

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

    const roleIds = userRoles.map((ur) => ur.roleId);

    if (roleIds.length === 0) {
      return [];
    }

    const rolePermissions = await this.prisma.rolePermission.findMany({
      where: { roleId: { in: roleIds } },
      include: { permission: true },
    });

    return rolePermissions
      .map((rp) => rp.permission?.code)
      .filter((code): code is string => code !== undefined);
  }
}
