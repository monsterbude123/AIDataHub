import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import jwt from 'jsonwebtoken';
import { comparePassword } from '../crypto';
import { UserEntity } from '../../entities/User.entity';
import { UserRoleEntity } from '../../entities/UserRole.entity';
import { RoleEntity } from '../../entities/Role.entity';
import { RolePermissionEntity } from '../../entities/RolePermission.entity';

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

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(UserRoleEntity)
    private readonly userRoleRepo: Repository<UserRoleEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepo: Repository<RoleEntity>,
    @InjectRepository(RolePermissionEntity)
    private readonly rolePermissionRepo: Repository<RolePermissionEntity>
  ) {
    this.jwtSecret = process.env.JWT_SECRET || 'dev-secret';
  }

  async login(req: LoginRequest): Promise<LoginResponse> {
    // Find user by username with passwordHash
    const user = await this.userRepo
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.username',
        'user.email',
        'user.realName',
        'user.orgId',
        'user.status',
        'user.passwordHash',
      ])
      .where('user.username = :username', { username: req.username })
      .getOne();

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
    const userRoles = await this.userRoleRepo.find({
      where: { userId: user.id },
    });

    const roleIds = userRoles.map((ur) => ur.roleId);
    const roles = await this.roleRepo.find({
      where: { id: In(roleIds), enabled: true },
    });

    const roleCodes = roles.map((r) => r.code);

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
        email: user.email,
        realName: user.realName,
        orgId: user.orgId,
      },
      roles: roleCodes,
    };
  }

  async validateToken(token: string): Promise<AuthenticatedUser | null> {
    try {
      const payload = jwt.verify(token, this.jwtSecret) as JwtPayload;

      // Get user details
      const user = await this.userRepo.findOneBy({ id: payload.userId });
      if (!user || user.status !== 'ENABLED') {
        return null;
      }

      // Get user roles and permissions
      const userRoles = await this.userRoleRepo.find({
        where: { userId: user.id },
      });

      const roleIds = userRoles.map((ur) => ur.roleId);
      const roles = await this.roleRepo.find({
        where: { id: In(roleIds), enabled: true },
      });

      const roleCodes = roles.map((r) => r.code);

      // Get permissions for all roles
      const rolePermissions = await this.rolePermissionRepo.find({
        where: { roleId: In(roleIds) },
        relations: ['permission'],
      });

      const permissionCodes = rolePermissions
        .map((rp) => rp.permission?.code)
        .filter((code) => code !== undefined);

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        realName: user.realName,
        orgId: user.orgId,
        roles: roleCodes,
        permissions: permissionCodes,
      };
    } catch {
      return null;
    }
  }

  async getPermissionsForUser(userId: string): Promise<string[]> {
    const userRoles = await this.userRoleRepo.find({
      where: { userId },
    });

    const roleIds = userRoles.map((ur) => ur.roleId);

    if (roleIds.length === 0) {
      return [];
    }

    const rolePermissions = await this.rolePermissionRepo.find({
      where: { roleId: In(roleIds) },
      relations: ['permission'],
    });

    return rolePermissions
      .map((rp) => rp.permission?.code)
      .filter((code) => code !== undefined);
  }
}
