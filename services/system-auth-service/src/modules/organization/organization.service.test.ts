import 'reflect-metadata';
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { Test } from '@nestjs/testing';
import { OrganizationService } from './organization.service';
import {
  prisma,
  setupTestDatabase,
  resetTestDatabase,
  teardownTestDatabase,
} from '../../../test/prisma';

describe('OrganizationService', () => {
  let service: OrganizationService;

  beforeEach(async () => {
    await setupTestDatabase();
    await resetTestDatabase();

    const moduleRef = await Test.createTestingModule({
      providers: [
        OrganizationService,
        {
          provide: 'PRISMA_CLIENT',
          useValue: prisma,
        },
      ],
    }).compile();

    service = moduleRef.get(OrganizationService);
  });

  afterAll(async () => {
    await teardownTestDatabase();
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
