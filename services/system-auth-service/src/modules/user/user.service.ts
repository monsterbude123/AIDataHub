import { Injectable, Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
  okResult,
  errResult,
  type Result,
  type User,
  type UserStatus,
  type PageResult,
} from '@ai-datahub/contract';
import { SystemAuthException } from '../../common/errors/system-auth.exception';

@Injectable()
export class UserService {
  constructor(@Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient) {}

  async createUser(req: {
    user: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'status'> & {
      status?: User['status'];
    };
  }): Promise<Result<{ userId: string }>> {
    // Check for duplicate username (non-idempotent)
    const existing = await this.prisma.user.findUnique({
      where: { username: req.user.username },
    });
    if (existing) {
      return errResult({
        code: 'USERNAME_DUPLICATE',
        message: 'Username already exists',
        level: 'ERROR',
      });
    }

    const user = await this.prisma.user.create({
      data: {
        username: req.user.username,
        email: req.user.email,
        realName: req.user.realName,
        phone: req.user.phone,
        level: req.user.level,
        orgId: req.user.orgId,
        status: req.user.status || 'ENABLED',
      },
    });

    return okResult({ userId: user.id });
  }

  async updateUser(req: {
    user: Omit<User, 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ success: boolean }>> {
    const existing = await this.prisma.user.findUnique({
      where: { id: req.user.id },
    });
    if (!existing) {
      throw new SystemAuthException('USER_NOT_FOUND', 'User not found');
    }

    // Update fields (idempotent)
    await this.prisma.user.update({
      where: { id: req.user.id },
      data: {
        username: req.user.username,
        email: req.user.email,
        realName: req.user.realName,
        phone: req.user.phone,
        level: req.user.level,
        orgId: req.user.orgId,
        status: req.user.status,
      },
    });

    return okResult({ success: true });
  }

  async deleteUser(req: {
    userId: string;
  }): Promise<Result<{ success: boolean }>> {
    const existing = await this.prisma.user.findUnique({
      where: { id: req.userId },
    });
    if (!existing) {
      return okResult({ success: true }); // idempotent - already deleted
    }

    // Manually delete user roles (handles both FK and non-FK databases)
    await this.prisma.userRole.deleteMany({
      where: { userId: req.userId },
    });

    await this.prisma.user.delete({
      where: { id: req.userId },
    });

    return okResult({ success: true });
  }

  async listUsers(req: {
    orgId?: string;
    keyword?: string;
    page: { page: number; pageSize: number };
  }): Promise<Result<PageResult<User>>> {
    const skip = (req.page.page - 1) * req.page.pageSize;

    // Build where conditions
    const whereConditions: Record<string, unknown>[] = [];
    if (req.orgId) {
      whereConditions.push({ orgId: req.orgId });
    }
    if (req.keyword) {
      whereConditions.push({
        OR: [
          { username: { contains: req.keyword } },
          { realName: { contains: req.keyword } },
          { email: { contains: req.keyword } },
        ],
      });
    }

    const where = whereConditions.length > 0 ? { AND: whereConditions } : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: req.page.pageSize,
      }),
      this.prisma.user.count({ where }),
    ]);

    return okResult({
      page: req.page.page,
      pageSize: req.page.pageSize,
      total,
      items: users.map((u) => ({
        id: u.id,
        username: u.username,
        email: u.email ?? undefined,
        realName: u.realName ?? undefined,
        phone: u.phone ?? undefined,
        level: u.level ?? undefined,
        status: u.status as UserStatus,
        orgId: u.orgId,
        createdAt: u.createdAt.toISOString(),
        updatedAt: u.updatedAt.toISOString(),
      })),
    });
  }

  async assignRoles(req: {
    userId: string;
    roleIds: string[];
  }): Promise<Result<{ success: boolean }>> {
    // Check user exists
    const user = await this.prisma.user.findUnique({
      where: { id: req.userId },
    });
    if (!user) {
      throw new SystemAuthException('USER_NOT_FOUND', 'User not found');
    }

    // Check all roles exist
    const roles = await this.prisma.role.findMany({
      where: { id: { in: req.roleIds } },
    });
    if (roles.length !== req.roleIds.length) {
      throw new SystemAuthException('ROLE_NOT_FOUND', 'Some roles not found');
    }

    // Remove existing roles for this user (idempotent - replace with new set)
    await this.prisma.userRole.deleteMany({
      where: { userId: req.userId },
    });

    // Create new user-role associations
    await this.prisma.userRole.createMany({
      data: req.roleIds.map((roleId) => ({
        userId: req.userId,
        roleId,
      })),
    });

    return okResult({ success: true });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
