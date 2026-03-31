import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  okResult,
  type Result,
  type DataPermission,
  type PageResult,
  type UpsertDataPermissionRequest,
} from '@ai-datahub/contract';
import { SystemAuthException } from '../../common/errors/system-auth.exception';
import { DataPermissionEntity } from '../../entities/DataPermission.entity';
import { RoleEntity } from '../../entities/Role.entity';

@Injectable()
export class DataPermissionService {
  constructor(
    @InjectRepository(DataPermissionEntity)
    private readonly dataPermRepo: Repository<DataPermissionEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepo: Repository<RoleEntity>
  ) {}

  async upsertDataPermission(
    req: UpsertDataPermissionRequest
  ): Promise<Result<{ permissionId: string }>> {
    // Verify role exists
    const role = await this.roleRepo.findOneBy({ id: req.permission.roleId });
    if (!role) {
      throw new SystemAuthException('ROLE_NOT_FOUND', 'Role not found');
    }

    // Idempotent upsert: if id provided, update; otherwise check if exists for roleId
    if (req.permission.id) {
      // Update existing permission
      const existing = await this.dataPermRepo.findOneBy({
        id: req.permission.id,
      });
      if (!existing) {
        throw new SystemAuthException(
          'DATA_PERMISSION_NOT_FOUND',
          'Data permission not found'
        );
      }

      existing.roleId = req.permission.roleId;
      existing.scope = req.permission.scope;
      await this.dataPermRepo.save(existing);
      return okResult({ permissionId: existing.id });
    }

    // Check if a permission already exists for this role (idempotent behavior)
    const existingForRole = await this.dataPermRepo.findOneBy({
      roleId: req.permission.roleId,
    });
    if (existingForRole) {
      // Update existing permission for this role
      existingForRole.scope = req.permission.scope;
      await this.dataPermRepo.save(existingForRole);
      return okResult({ permissionId: existingForRole.id });
    }

    // Create new permission
    const permission = this.dataPermRepo.create({
      roleId: req.permission.roleId,
      scope: req.permission.scope,
    });

    await this.dataPermRepo.save(permission);
    return okResult({ permissionId: permission.id });
  }

  async listDataPermissions(req: {
    roleId: string;
    page: { page: number; pageSize: number };
  }): Promise<Result<PageResult<DataPermission>>> {
    // Verify role exists
    const role = await this.roleRepo.findOneBy({ id: req.roleId });
    if (!role) {
      throw new SystemAuthException('ROLE_NOT_FOUND', 'Role not found');
    }

    const query = this.dataPermRepo
      .createQueryBuilder('dataPermission')
      .where('dataPermission.roleId = :roleId', { roleId: req.roleId });

    const skip = (req.page.page - 1) * req.page.pageSize;
    query.skip(skip).take(req.page.pageSize);

    const [items, total] = await query.getManyAndCount();

    return okResult({
      items: items.map((p) => p.toDTO()),
      total,
      page: req.page.page,
      pageSize: req.page.pageSize,
    });
  }

  async findById(id: string): Promise<DataPermissionEntity | null> {
    return this.dataPermRepo.findOneBy({ id });
  }
}
