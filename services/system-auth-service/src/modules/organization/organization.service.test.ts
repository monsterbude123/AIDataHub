import 'reflect-metadata';
import { describe, it, expect, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationService } from './organization.service';
import { OrganizationEntity } from '../../entities/Organization.entity';
import { UserEntity } from '../../entities/User.entity';
import { UserRoleEntity } from '../../entities/UserRole.entity';
import { RoleEntity } from '../../entities/Role.entity';
import { RolePermissionEntity } from '../../entities/RolePermission.entity';
import { PermissionEntity } from '../../entities/Permission.entity';
import { DataSource } from 'typeorm';

describe('OrganizationService', () => {
  let service: OrganizationService;
  let dataSource: DataSource;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [
            OrganizationEntity,
            UserEntity,
            UserRoleEntity,
            RoleEntity,
            RolePermissionEntity,
            PermissionEntity,
          ],
          synchronize: true,
          logging: false,
        }),
        TypeOrmModule.forFeature([OrganizationEntity]),
      ],
      providers: [OrganizationService],
    }).compile();

    service = moduleRef.get(OrganizationService);
    dataSource = moduleRef.get(DataSource);

    await dataSource.dropDatabase();
    await dataSource.synchronize(true);
  });

  it('should create an organization', async () => {
    const result = await service.createOrganization({
      org: {
        name: 'Test Org',
        code: 'test-org',
        status: 'ENABLED',
      },
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.orgId).toBeDefined();
    }
  });

  it('should not allow duplicate organization codes', async () => {
    await service.createOrganization({
      org: { name: 'Test Org', code: 'test-org', status: 'ENABLED' },
    });
    const result = await service.createOrganization({
      org: { name: 'Test Org', code: 'test-org', status: 'ENABLED' },
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('INVALID_ARGUMENT');
    }
  });

  it('should list organizations', async () => {
    await service.createOrganization({
      org: { name: 'Test 1', code: 'test-1', status: 'ENABLED' },
    });
    await service.createOrganization({
      org: { name: 'Test 2', code: 'test-2', status: 'ENABLED' },
    });

    const result = await service.listOrganizations({ keyword: 'Test' });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.length).toBe(2);
    }
  });

  it('should throw ORG_NOT_FOUND when updating non-existent organization', async () => {
    await expect(
      service.updateOrganization({
        org: {
          id: 'non-existent-id',
          name: 'Test',
          code: 'test',
          status: 'ENABLED',
        },
      })
    ).rejects.toThrow('Organization not found');
  });

  it('should be idempotent when deleting non-existent organization', async () => {
    const result = await service.deleteOrganization({
      orgId: 'non-existent-id',
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.success).toBe(true);
    }
  });
});
