import { Injectable, Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
  okResult,
  type Result,
  type ApprovalTemplate,
  type UpsertApprovalTemplateRequest,
} from '@ai-datahub/contract';
import { SystemAuthException } from '../../common/errors/system-auth.exception';

@Injectable()
export class ApprovalTemplateService {
  constructor(@Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient) {}

  async createApprovalTemplate(req: {
    template: Omit<ApprovalTemplate, 'id' | 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ templateId: string }>> {
    // Non-idempotent - create new template each time
    const template = await this.prisma.approvalTemplate.create({
      data: {
        businessType: req.template.businessType,
        name: req.template.name,
        definition: JSON.stringify(req.template.definition),
      },
    });

    return okResult({ templateId: template.id });
  }

  async updateApprovalTemplate(
    req: UpsertApprovalTemplateRequest
  ): Promise<Result<{ success: boolean }>> {
    const existing = await this.prisma.approvalTemplate.findUnique({
      where: { id: req.template.id },
    });
    if (!existing) {
      throw new SystemAuthException(
        'APPROVAL_TEMPLATE_NOT_FOUND',
        'Approval template not found'
      );
    }

    // Update fields
    await this.prisma.approvalTemplate.update({
      where: { id: req.template.id },
      data: {
        businessType: req.template.businessType,
        name: req.template.name,
        definition: JSON.stringify(req.template.definition),
      },
    });

    return okResult({ success: true });
  }

  async deleteApprovalTemplate(req: {
    templateId: string;
  }): Promise<Result<{ success: boolean }>> {
    const existing = await this.prisma.approvalTemplate.findUnique({
      where: { id: req.templateId },
    });
    if (!existing) {
      return okResult({ success: true }); // idempotent - already deleted
    }

    await this.prisma.approvalTemplate.delete({
      where: { id: req.templateId },
    });

    return okResult({ success: true });
  }

  async listApprovalTemplates(req: {
    businessType?: string;
  }): Promise<Result<ApprovalTemplate[]>> {
    const templates = await this.prisma.approvalTemplate.findMany({
      where: req.businessType ? { businessType: req.businessType } : undefined,
    });

    return okResult(
      templates.map((t) => ({
        id: t.id,
        businessType: t.businessType,
        name: t.name,
        definition: JSON.parse(t.definition),
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      }))
    );
  }

  async findById(id: string) {
    return this.prisma.approvalTemplate.findUnique({ where: { id } });
  }
}
