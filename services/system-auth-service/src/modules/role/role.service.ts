import { Injectable, Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
  okResult,
  errResult,
  type Result,
  type Role,
} from '@ai-datahub/contract';
import { SystemAuthException } from '../../common/errors/system-auth.exception';

@Injectable()
export class RoleService {
  constructor(@Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient) {}

  async createRole(req: {
    role: Omit<Role, 'id'>;
  }): Promise<Result<{ roleId: string }>> {
    // Check for duplicate code (non-idempotent)
    const existing = await this.prisma.role.findUnique({
      where: { code: req.role.code },
    });
    if (existing) {
      return errResult({
        code: 'INVALID_ARGUMENT',
        message: 'Role code already exists',
        level: 'ERROR',
      });
    }

    const role = await this.prisma.role.create({
      data: {
        name: req.role.name,
        code: req.role.code,
        description: req.role.description,
        enabled: true,
      },
    });

    return okResult({ roleId: role.id });
  }

  async updateRole(req: { role: Role }): Promise<Result<{ success: boolean }>> {
    const existing = await this.prisma.role.findUnique({
      where: { id: req.role.id },
    });
    if (!existing) {
      throw new SystemAuthException('ROLE_NOT_FOUND', 'Role not found');
    }

    // Update fields
    await this.prisma.role.update({
      where: { id: req.role.id },
      data: {
        name: req.role.name,
        code: req.role.code,
        description: req.role.description,
      },
    });

    return okResult({ success: true });
  }

  async deleteRole(req: {
    roleId: string;
  }): Promise<Result<{ success: boolean }>> {
    const existing = await this.prisma.role.findUnique({
      where: { id: req.roleId },
    });
    if (!existing) {
      return okResult({ success: true }); // idempotent - already deleted
    }

    // Manually delete related records (handles both FK and non-FK databases)
    await this.prisma.rolePermission.deleteMany({
      where: { roleId: req.roleId },
    });
    await this.prisma.userRole.deleteMany({
      where: { roleId: req.roleId },
    });

    // Delete role
    await this.prisma.role.delete({
      where: { id: req.roleId },
    });

    return okResult({ success: true });
  }

  async listRoles(req: { keyword?: string }): Promise<Result<Role[]>> {
    const where = req.keyword
      ? {
          OR: [
            { name: { contains: req.keyword } },
            { code: { contains: req.keyword } },
          ],
        }
      : undefined;

    const roles = await this.prisma.role.findMany({
      where,
      include: {
        rolePermissions: {
          include: { permission: true },
        },
      },
    });

    return okResult(
      roles.map((r) => ({
        id: r.id,
        name: r.name,
        code: r.code,
        description: r.description ?? undefined,
        permissions: r.rolePermissions.map((rp) => rp.permission.code),
      }))
    );
  }

  async findById(id: string) {
    return this.prisma.role.findUnique({ where: { id } });
  }
}
