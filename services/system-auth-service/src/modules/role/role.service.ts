import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  okResult,
  errResult,
  type Result,
  type Role,
} from '@ai-datahub/contract';
import { SystemAuthException } from '../../common/errors/system-auth.exception';
import { RoleEntity } from '../../entities/Role.entity';
import { RolePermissionEntity } from '../../entities/RolePermission.entity';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly roleRepo: Repository<RoleEntity>,
    @InjectRepository(RolePermissionEntity)
    private readonly rolePermRepo: Repository<RolePermissionEntity>
  ) {}

  async createRole(req: {
    role: Omit<Role, 'id'>;
  }): Promise<Result<{ roleId: string }>> {
    // Check for duplicate code (non-idempotent)
    const existing = await this.roleRepo.findOneBy({ code: req.role.code });
    if (existing) {
      return errResult({
        code: 'INVALID_ARGUMENT',
        message: 'Role code already exists',
        level: 'ERROR',
      });
    }

    const role = this.roleRepo.create({
      name: req.role.name,
      code: req.role.code,
      description: req.role.description,
      enabled: true,
    });

    await this.roleRepo.save(role);
    return okResult({ roleId: role.id });
  }

  async updateRole(req: { role: Role }): Promise<Result<{ success: boolean }>> {
    const existing = await this.roleRepo.findOneBy({ id: req.role.id });
    if (!existing) {
      throw new SystemAuthException('ROLE_NOT_FOUND', 'Role not found');
    }

    // Update fields
    existing.name = req.role.name;
    existing.code = req.role.code;
    existing.description = req.role.description;

    await this.roleRepo.save(existing);
    return okResult({ success: true });
  }

  async deleteRole(req: {
    roleId: string;
  }): Promise<Result<{ success: boolean }>> {
    const existing = await this.roleRepo.findOneBy({ id: req.roleId });
    if (!existing) {
      return okResult({ success: true }); // idempotent - already deleted
    }

    // Delete role permissions first
    await this.rolePermRepo.delete({ roleId: req.roleId });

    // Delete role
    await this.roleRepo.remove(existing);
    return okResult({ success: true });
  }

  async listRoles(req: { keyword?: string }): Promise<Result<Role[]>> {
    const query = this.roleRepo
      .createQueryBuilder('role')
      .leftJoinAndSelect('role.rolePermissions', 'rp')
      .leftJoinAndSelect('rp.permission', 'perm');

    if (req.keyword) {
      query.where('role.name LIKE :keyword OR role.code LIKE :keyword', {
        keyword: `%${req.keyword}%`,
      });
    }

    const roles = await query.getMany();
    return okResult(roles.map((r) => r.toDTO()));
  }

  async findById(id: string): Promise<RoleEntity | null> {
    return this.roleRepo.findOneBy({ id });
  }
}
