import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  okResult,
  errResult,
  type Result,
  type Organization,
} from '@ai-datahub/contract';
import { SystemAuthException } from '../../common/errors/system-auth.exception';
import { OrganizationEntity } from '../../entities/Organization.entity';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(OrganizationEntity)
    private readonly repo: Repository<OrganizationEntity>
  ) {}

  async listOrganizations(req: {
    keyword?: string;
  }): Promise<Result<Organization[]>> {
    const query = this.repo.createQueryBuilder('org');

    if (req.keyword) {
      query.where('org.name LIKE :keyword OR org.code LIKE :keyword', {
        keyword: `%${req.keyword}%`,
      });
    }

    const orgs = await query.getMany();
    return okResult(orgs.map((o) => o.toDTO()));
  }

  async createOrganization(req: {
    org: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ orgId: string }>> {
    const existing = await this.repo.findOneBy({ code: req.org.code });
    if (existing) {
      return errResult({
        code: 'INVALID_ARGUMENT',
        message: 'Organization code already exists',
        level: 'ERROR',
      });
    }

    const org = this.repo.create({
      name: req.org.name,
      code: req.org.code,
      description: req.org.description,
      status: req.org.status,
      parentId: req.org.parentId,
      sort: req.org.sort,
    });

    await this.repo.save(org);
    return okResult({ orgId: org.id });
  }

  async updateOrganization(req: {
    org: Organization;
  }): Promise<Result<{ success: boolean }>> {
    const existing = await this.repo.findOneBy({ id: req.org.id });
    if (!existing) {
      throw new SystemAuthException('ORG_NOT_FOUND', 'Organization not found');
    }

    existing.name = req.org.name;
    existing.code = req.org.code;
    existing.description = req.org.description;
    existing.status = req.org.status;
    existing.parentId = req.org.parentId;
    existing.sort = req.org.sort;
    await this.repo.save(existing);

    return okResult({ success: true });
  }

  async deleteOrganization(req: {
    orgId: string;
  }): Promise<Result<{ success: boolean }>> {
    const existing = await this.repo.findOneBy({ id: req.orgId });
    if (!existing) {
      return okResult({ success: true }); // idempotent - already deleted
    }

    await this.repo.remove(existing);
    return okResult({ success: true });
  }

  async findById(id: string): Promise<OrganizationEntity | null> {
    return this.repo.findOneBy({ id });
  }
}
