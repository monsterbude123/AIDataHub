import { Injectable, Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
  okResult,
  type Result,
  type DataPermission,
  type PageResult,
  type UpsertDataPermissionRequest,
} from '@ai-datahub/contract';
import { SystemAuthException } from '../../common/errors/system-auth.exception';

@Injectable()
export class DataPermissionService {
  constructor(@Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient) {}

  async upsertDataPermission(
    req: UpsertDataPermissionRequest
  ): Promise<Result<{ permissionId: string }>> {
    // Verify role exists
    const role = await this.prisma.role.findUnique({
      where: { id: req.permission.roleId },
    });
    if (!role) {
      throw new SystemAuthException('ROLE_NOT_FOUND', 'Role not found');
    }

    // Idempotent upsert: if id provided, update; otherwise check if exists for roleId
    if (req.permission.id) {
      // Update existing permission
      const existing = await this.prisma.dataPermission.findUnique({
        where: { id: req.permission.id },
      });
      if (!existing) {
        throw new SystemAuthException(
          'DATA_PERMISSION_NOT_FOUND',
          'Data permission not found'
        );
      }

      await this.prisma.dataPermission.update({
        where: { id: req.permission.id },
        data: {
          roleId: req.permission.roleId,
          scope: JSON.stringify(req.permission.scope),
        },
      });

      return okResult({ permissionId: existing.id });
    }

    // Check if a permission already exists for this role (idempotent behavior)
    const existingForRole = await this.prisma.dataPermission.findFirst({
      where: { roleId: req.permission.roleId },
    });

    if (existingForRole) {
      // Update existing permission for this role
      await this.prisma.dataPermission.update({
        where: { id: existingForRole.id },
        data: {
          scope: JSON.stringify(req.permission.scope),
        },
      });
      return okResult({ permissionId: existingForRole.id });
    }

    // Create new permission
    const permission = await this.prisma.dataPermission.create({
      data: {
        roleId: req.permission.roleId,
        scope: JSON.stringify(req.permission.scope),
      },
    });

    return okResult({ permissionId: permission.id });
  }

  async listDataPermissions(req: {
    roleId: string;
    page: { page: number; pageSize: number };
  }): Promise<Result<PageResult<DataPermission>>> {
    // Verify role exists
    const role = await this.prisma.role.findUnique({
      where: { id: req.roleId },
    });
    if (!role) {
      throw new SystemAuthException('ROLE_NOT_FOUND', 'Role not found');
    }

    const skip = (req.page.page - 1) * req.page.pageSize;

    const [items, total] = await Promise.all([
      this.prisma.dataPermission.findMany({
        where: { roleId: req.roleId },
        skip,
        take: req.page.pageSize,
      }),
      this.prisma.dataPermission.count({ where: { roleId: req.roleId } }),
    ]);

    return okResult({
      items: items.map(
        (p: {
          id: string;
          roleId: string;
          scope: string;
          createdAt: Date;
        }) => ({
          id: p.id,
          roleId: p.roleId,
          scope: JSON.parse(p.scope),
          createdAt: p.createdAt.toISOString(),
        })
      ),
      total,
      page: req.page.page,
      pageSize: req.page.pageSize,
    });
  }

  async findById(id: string) {
    return this.prisma.dataPermission.findUnique({ where: { id } });
  }
}
