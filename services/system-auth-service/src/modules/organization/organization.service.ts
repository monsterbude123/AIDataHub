import { Injectable, Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
  okResult,
  errResult,
  type Result,
  type Organization,
  type OrganizationStatus,
} from '@ai-datahub/contract';
import { SystemAuthException } from '../../common/errors/system-auth.exception';

@Injectable()
export class OrganizationService {
  constructor(@Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient) {}

  async listOrganizations(req: {
    keyword?: string;
  }): Promise<Result<Organization[]>> {
    const where = req.keyword
      ? {
          OR: [
            { name: { contains: req.keyword } },
            { code: { contains: req.keyword } },
          ],
        }
      : undefined;

    const orgs = await this.prisma.organization.findMany({ where });

    return okResult(
      orgs.map((o) => ({
        id: o.id,
        name: o.name,
        code: o.code,
        status: o.status as OrganizationStatus,
        parentId: o.parentId ?? undefined,
        sort: o.sort ?? undefined,
        createdAt: o.createdAt.toISOString(),
        updatedAt: o.updatedAt.toISOString(),
      }))
    );
  }

  async createOrganization(req: {
    org: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ orgId: string }>> {
    const existing = await this.prisma.organization.findUnique({
      where: { code: req.org.code },
    });
    if (existing) {
      return errResult({
        code: 'INVALID_ARGUMENT',
        message: 'Organization code already exists',
        level: 'ERROR',
      });
    }

    const org = await this.prisma.organization.create({
      data: {
        name: req.org.name,
        code: req.org.code,
        status: req.org.status,
        parentId: req.org.parentId,
        sort: req.org.sort,
      },
    });

    return okResult({ orgId: org.id });
  }

  async updateOrganization(req: {
    org: Organization;
  }): Promise<Result<{ success: boolean }>> {
    const existing = await this.prisma.organization.findUnique({
      where: { id: req.org.id },
    });
    if (!existing) {
      throw new SystemAuthException('ORG_NOT_FOUND', 'Organization not found');
    }

    await this.prisma.organization.update({
      where: { id: req.org.id },
      data: {
        name: req.org.name,
        code: req.org.code,
        status: req.org.status,
        parentId: req.org.parentId,
        sort: req.org.sort,
      },
    });

    return okResult({ success: true });
  }

  async deleteOrganization(req: {
    orgId: string;
  }): Promise<Result<{ success: boolean }>> {
    const existing = await this.prisma.organization.findUnique({
      where: { id: req.orgId },
    });
    if (!existing) {
      return okResult({ success: true }); // idempotent - already deleted
    }

    await this.prisma.organization.delete({
      where: { id: req.orgId },
    });

    return okResult({ success: true });
  }

  async findById(id: string) {
    return this.prisma.organization.findUnique({ where: { id } });
  }
}
