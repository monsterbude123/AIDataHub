// services/system-auth-service/src/modules/init/init.service.ts
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { hashPassword } from '../crypto';
import { UserEntity } from '../../entities/User.entity';
import { RoleEntity } from '../../entities/Role.entity';
import { UserRoleEntity } from '../../entities/UserRole.entity';
import { OrganizationEntity } from '../../entities/Organization.entity';

function generateSecurePassword(length: number = 16): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  const allChars = uppercase + lowercase + numbers + special;

  let password = '';
  // Ensure at least one of each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}

@Injectable()
export class InitService implements OnApplicationBootstrap {
  private readonly logger = new Logger(InitService.name);
  private initialized = false;

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepo: Repository<RoleEntity>,
    @InjectRepository(UserRoleEntity)
    private readonly userRoleRepo: Repository<UserRoleEntity>,
    @InjectRepository(OrganizationEntity)
    private readonly orgRepo: Repository<OrganizationEntity>
  ) {}

  async onApplicationBootstrap() {
    if (this.initialized) return;
    await this.initializeAdmin();
    this.initialized = true;
  }

  private async initializeAdmin() {
    try {
      // Check if admin user already exists
      const existingAdmin = await this.userRepo.findOne({
        where: { username: 'admin' },
      });

      if (existingAdmin) {
        this.logger.log('Admin user already exists, skipping initialization');
        return;
      }

      // Create default organization if not exists
      let org = await this.orgRepo.findOne({ where: { code: 'default' } });
      if (!org) {
        org = this.orgRepo.create({
          name: 'Default Organization',
          code: 'default',
        });
        await this.orgRepo.save(org);
      }

      // Create super-admin role
      let superAdminRole = await this.roleRepo.findOne({
        where: { code: 'super-admin' },
      });
      if (!superAdminRole) {
        superAdminRole = this.roleRepo.create({
          name: '超级管理员',
          code: 'super-admin',
          orgId: org.id,
          enabled: true,
        });
        await this.roleRepo.save(superAdminRole);
      }

      // Generate secure password
      const password = generateSecurePassword(16);
      const passwordHash = await hashPassword(password);

      // Create admin user
      const adminUser = this.userRepo.create({
        username: 'admin',
        passwordHash,
        email: 'admin@example.com',
        realName: '系统管理员',
        orgId: org.id,
        status: 'ENABLED',
      });
      await this.userRepo.save(adminUser);

      // Assign super-admin role
      const userRole = this.userRoleRepo.create({
        userId: adminUser.id,
        roleId: superAdminRole.id,
      });
      await this.userRoleRepo.save(userRole);

      // Log credentials (one-time only)
      this.logger.log('');
      this.logger.log(
        '┌─────────────────────────────────────────────────────────────┐'
      );
      this.logger.log(
        '│  🔐 Initial Admin Credentials (save this securely!)         │'
      );
      this.logger.log(
        '├─────────────────────────────────────────────────────────────┤'
      );
      this.logger.log(
        `│  Username: admin                                             │`
      );
      this.logger.log(`│  Password: ${password.padEnd(47)}│`);
      this.logger.log(
        '│                                                             │'
      );
      this.logger.log(
        '│  ⚠️  Please change the password after first login!          │'
      );
      this.logger.log(
        '└─────────────────────────────────────────────────────────────┘'
      );
      this.logger.log('');
    } catch (error) {
      this.logger.error('Failed to initialize admin user', error);
    }
  }
}
