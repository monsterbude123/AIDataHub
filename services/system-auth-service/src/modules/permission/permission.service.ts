import { Injectable, Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
  okResult,
  errResult,
  type Result,
  type Permission,
  type PageResult,
} from '@ai-datahub/contract';
import { SystemAuthException } from '../../common/errors/system-auth.exception';

@Injectable()
export class PermissionService {
  constructor(@Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient) {}

  async createPermission(req: {
    permission: Omit<Permission, 'id' | 'createdAt'>;
  }): Promise<Result<{ permissionId: string }>> {
    // Check for duplicate code (non-idempotent)
    const existing = await this.prisma.permission.findUnique({
      where: { code: req.permission.code },
    });
    if (existing) {
      return errResult({
        code: 'INVALID_ARGUMENT',
        message: 'Permission code already exists',
        level: 'ERROR',
      });
    }

    const permission = await this.prisma.permission.create({
      data: {
        type: req.permission.type,
        name: req.permission.name,
        code: req.permission.code,
        resource: req.permission.resource,
      },
    });

    return okResult({ permissionId: permission.id });
  }

  async listPermissions(req: {
    keyword?: string;
    page: { page: number; pageSize: number };
  }): Promise<Result<PageResult<Permission>>> {
    const skip = (req.page.page - 1) * req.page.pageSize;

    const where = req.keyword
      ? {
          OR: [
            { name: { contains: req.keyword } },
            { code: { contains: req.keyword } },
            { resource: { contains: req.keyword } },
          ],
        }
      : undefined;

    const [items, total] = await Promise.all([
      this.prisma.permission.findMany({
        where,
        skip,
        take: req.page.pageSize,
      }),
      this.prisma.permission.count({ where }),
    ]);

    return okResult({
      items: items.map((p) => ({
        id: p.id,
        type: p.type as 'URI' | 'PAGE_ELEMENT',
        name: p.name,
        code: p.code,
        resource: p.resource,
        createdAt: p.createdAt.toISOString(),
      })),
      total,
      page: req.page.page,
      pageSize: req.page.pageSize,
    });
  }

  async bindPermissionsToRole(req: {
    roleId: string;
    permissionIds: string[];
  }): Promise<Result<{ success: boolean }>> {
    // Verify role exists
    const role = await this.prisma.role.findUnique({
      where: { id: req.roleId },
    });
    if (!role) {
      throw new SystemAuthException('ROLE_NOT_FOUND', 'Role not found');
    }

    // Verify all permissions exist
    if (req.permissionIds.length > 0) {
      const permissions = await this.prisma.permission.findMany({
        where: { id: { in: req.permissionIds } },
      });
      if (permissions.length !== req.permissionIds.length) {
        throw new SystemAuthException(
          'PERMISSION_NOT_FOUND',
          'One or more permissions not found'
        );
      }
    }

    // Use transaction for atomicity
    await this.prisma.$transaction(async (tx) => {
      // Delete existing bindings
      await tx.rolePermission.deleteMany({
        where: { roleId: req.roleId },
      });

      // Create new bindings
      if (req.permissionIds.length > 0) {
        await tx.rolePermission.createMany({
          data: req.permissionIds.map((permId) => ({
            roleId: req.roleId,
            permissionId: permId,
          })),
        });
      }
    });

    return okResult({ success: true });
  }

  async findById(id: string) {
    return this.prisma.permission.findUnique({ where: { id } });
  }
}
