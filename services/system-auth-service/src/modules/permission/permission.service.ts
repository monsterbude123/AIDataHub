import { Injectable } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
  okResult,
  errResult,
  type Result,
  type Permission,
  type PageResult,
} from '@ai-datahub/contract';
import { SystemAuthException } from '../../common/errors/system-auth.exception';
import { PermissionEntity } from '../../entities/Permission.entity';
import { RolePermissionEntity } from '../../entities/RolePermission.entity';
import { RoleEntity } from '../../entities/Role.entity';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(PermissionEntity)
    private readonly permRepo: Repository<PermissionEntity>,
    @InjectRepository(RolePermissionEntity)
    private readonly rolePermRepo: Repository<RolePermissionEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepo: Repository<RoleEntity>,
    @InjectDataSource()
    private readonly dataSource: DataSource
  ) {}

  async createPermission(req: {
    permission: Omit<Permission, 'id' | 'createdAt'>;
  }): Promise<Result<{ permissionId: string }>> {
    // Check for duplicate code (non-idempotent)
    const existing = await this.permRepo.findOneBy({
      code: req.permission.code,
    });
    if (existing) {
      return errResult({
        code: 'INVALID_ARGUMENT',
        message: 'Permission code already exists',
        level: 'ERROR',
      });
    }

    const permission = this.permRepo.create({
      type: req.permission.type,
      name: req.permission.name,
      code: req.permission.code,
      resource: req.permission.resource,
    });

    await this.permRepo.save(permission);
    return okResult({ permissionId: permission.id });
  }

  async listPermissions(req: {
    keyword?: string;
    page: { page: number; size: number };
  }): Promise<Result<PageResult<Permission>>> {
    const query = this.permRepo.createQueryBuilder('permission');

    if (req.keyword) {
      query.where(
        'permission.name LIKE :keyword OR permission.code LIKE :keyword OR permission.resource LIKE :keyword',
        { keyword: `%${req.keyword}%` }
      );
    }

    const skip = (req.page.page - 1) * req.page.size;
    query.skip(skip).take(req.page.size);

    const [items, total] = await query.getManyAndCount();

    return okResult({
      items: items.map((p) => p.toDTO()),
      total,
      page: req.page.page,
      size: req.page.size,
    });
  }

  async bindPermissionsToRole(req: {
    roleId: string;
    permissionIds: string[];
  }): Promise<Result<{ success: boolean }>> {
    // Verify role exists
    const role = await this.roleRepo.findOneBy({ id: req.roleId });
    if (!role) {
      throw new SystemAuthException('ROLE_NOT_FOUND', 'Role not found');
    }

    // Verify all permissions exist
    if (req.permissionIds.length > 0) {
      const permissions = await this.permRepo.findByIds(req.permissionIds);
      if (permissions.length !== req.permissionIds.length) {
        throw new SystemAuthException(
          'PERMISSION_NOT_FOUND',
          'One or more permissions not found'
        );
      }
    }

    // Use transaction for atomicity
    await this.dataSource.transaction(async (manager) => {
      // Delete existing bindings
      await manager.delete(RolePermissionEntity, { roleId: req.roleId });

      // Create new bindings
      if (req.permissionIds.length > 0) {
        const bindings = req.permissionIds.map((permId) =>
          manager.create(RolePermissionEntity, {
            roleId: req.roleId,
            permissionId: permId,
          })
        );
        await manager.save(bindings);
      }
    });

    return okResult({ success: true });
  }

  async findById(id: string): Promise<PermissionEntity | null> {
    return this.permRepo.findOneBy({ id });
  }
}
