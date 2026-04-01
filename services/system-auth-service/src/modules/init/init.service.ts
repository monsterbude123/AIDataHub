// services/system-auth-service/src/modules/init/init.service.ts
import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  Inject,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../crypto';

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

  constructor(@Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient) {}

  async onApplicationBootstrap() {
    if (this.initialized) return;
    await this.initializeAdmin();
    this.initialized = true;
  }

  private async initializeAdmin() {
    try {
      // Check if admin user already exists
      const existingAdmin = await this.prisma.user.findUnique({
        where: { username: 'admin' },
      });

      if (existingAdmin) {
        this.logger.log('Admin user already exists, skipping initialization');
        return;
      }

      // Create default organization if not exists
      let org = await this.prisma.organization.findUnique({
        where: { code: 'default' },
      });
      if (!org) {
        org = await this.prisma.organization.create({
          data: {
            name: 'Default Organization',
            code: 'default',
            status: 'ENABLED',
          },
        });
      }

      // Create super-admin role
      let superAdminRole = await this.prisma.role.findUnique({
        where: { code: 'super-admin' },
      });
      if (!superAdminRole) {
        superAdminRole = await this.prisma.role.create({
          data: {
            name: '超级管理员',
            code: 'super-admin',
            enabled: true,
          },
        });
      }

      // Generate secure password
      const password = generateSecurePassword(16);
      const passwordHash = await hashPassword(password);

      // Create admin user
      const adminUser = await this.prisma.user.create({
        data: {
          username: 'admin',
          passwordHash,
          email: 'admin@example.com',
          realName: '系统管理员',
          orgId: org.id,
          status: 'ENABLED',
        },
      });

      // Assign super-admin role
      await this.prisma.userRole.create({
        data: {
          userId: adminUser.id,
          roleId: superAdminRole.id,
        },
      });

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
        '│  Username: admin                                             │'
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
