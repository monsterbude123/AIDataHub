import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
  okResult,
  errResult,
  type Result,
  type User,
  type PageResult,
} from '@ai-datahub/contract';
import { SystemAuthException } from '../../common/errors/system-auth.exception';
import { UserEntity } from '../../entities/User.entity';
import { UserRoleEntity } from '../../entities/UserRole.entity';
import { RoleEntity } from '../../entities/Role.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(UserRoleEntity)
    private readonly userRoleRepo: Repository<UserRoleEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepo: Repository<RoleEntity>
  ) {}

  async createUser(req: {
    user: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'status'> & {
      status?: User['status'];
    };
  }): Promise<Result<{ userId: string }>> {
    // Check for duplicate username (non-idempotent)
    const existing = await this.userRepo.findOneBy({
      username: req.user.username,
    });
    if (existing) {
      return errResult({
        code: 'USERNAME_DUPLICATE',
        message: 'Username already exists',
        level: 'ERROR',
      });
    }

    const user = this.userRepo.create({
      username: req.user.username,
      email: req.user.email,
      realName: req.user.realName,
      phone: req.user.phone,
      level: req.user.level,
      orgId: req.user.orgId,
      status: req.user.status || 'ENABLED',
    });

    await this.userRepo.save(user);
    return okResult({ userId: user.id });
  }

  async updateUser(req: {
    user: Omit<User, 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ success: boolean }>> {
    const existing = await this.userRepo.findOneBy({ id: req.user.id });
    if (!existing) {
      throw new SystemAuthException('USER_NOT_FOUND', 'User not found');
    }

    // Update fields (idempotent)
    existing.username = req.user.username;
    existing.email = req.user.email;
    existing.realName = req.user.realName;
    existing.phone = req.user.phone;
    existing.level = req.user.level;
    existing.orgId = req.user.orgId;
    existing.status = req.user.status;

    await this.userRepo.save(existing);
    return okResult({ success: true });
  }

  async deleteUser(req: {
    userId: string;
  }): Promise<Result<{ success: boolean }>> {
    const existing = await this.userRepo.findOneBy({ id: req.userId });
    if (!existing) {
      return okResult({ success: true }); // idempotent - already deleted
    }

    // Also delete user roles
    await this.userRoleRepo.delete({ userId: req.userId });
    await this.userRepo.remove(existing);
    return okResult({ success: true });
  }

  async listUsers(req: {
    orgId?: string;
    keyword?: string;
    page: { page: number; pageSize: number };
  }): Promise<Result<PageResult<User>>> {
    const query = this.userRepo.createQueryBuilder('user');

    // Filter by orgId
    if (req.orgId) {
      query.where('user.orgId = :orgId', { orgId: req.orgId });
    }

    // Filter by keyword (search username, realName, email)
    if (req.keyword) {
      const keywordCondition = req.orgId
        ? 'AND (user.username LIKE :keyword OR user.realName LIKE :keyword OR user.email LIKE :keyword)'
        : '(user.username LIKE :keyword OR user.realName LIKE :keyword OR user.email LIKE :keyword)';
      query.andWhere(keywordCondition, { keyword: `%${req.keyword}%` });
    }

    // Get total count
    const total = await query.getCount();

    // Apply pagination
    const skip = (req.page.page - 1) * req.page.pageSize;
    query.skip(skip).take(req.page.pageSize);

    const users = await query.getMany();

    return okResult({
      page: req.page.page,
      pageSize: req.page.pageSize,
      total,
      items: users.map((u) => u.toDTO()),
    });
  }

  async assignRoles(req: {
    userId: string;
    roleIds: string[];
  }): Promise<Result<{ success: boolean }>> {
    // Check user exists
    const user = await this.userRepo.findOneBy({ id: req.userId });
    if (!user) {
      throw new SystemAuthException('USER_NOT_FOUND', 'User not found');
    }

    // Check all roles exist
    const roles = await this.roleRepo.find({
      where: { id: In(req.roleIds) },
    });
    if (roles.length !== req.roleIds.length) {
      throw new SystemAuthException('ROLE_NOT_FOUND', 'Some roles not found');
    }

    // Remove existing roles for this user (idempotent - replace with new set)
    await this.userRoleRepo.delete({ userId: req.userId });

    // Create new user-role associations
    const userRoles = req.roleIds.map((roleId) =>
      this.userRoleRepo.create({ userId: req.userId, roleId })
    );
    await this.userRoleRepo.save(userRoles);

    return okResult({ success: true });
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.userRepo.findOneBy({ id });
  }
}
