import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  okResult,
  type Result,
  type ApprovalTemplate,
  type UpsertApprovalTemplateRequest,
} from '@ai-datahub/contract';
import { SystemAuthException } from '../../common/errors/system-auth.exception';
import { ApprovalTemplateEntity } from '../../entities/ApprovalTemplate.entity';

@Injectable()
export class ApprovalTemplateService {
  constructor(
    @InjectRepository(ApprovalTemplateEntity)
    private readonly templateRepo: Repository<ApprovalTemplateEntity>
  ) {}

  async createApprovalTemplate(req: {
    template: Omit<ApprovalTemplate, 'id' | 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ templateId: string }>> {
    // Non-idempotent - create new template each time
    const template = this.templateRepo.create({
      businessType: req.template.businessType,
      name: req.template.name,
      definition: req.template.definition,
    });

    await this.templateRepo.save(template);
    return okResult({ templateId: template.id });
  }

  async updateApprovalTemplate(
    req: UpsertApprovalTemplateRequest
  ): Promise<Result<{ success: boolean }>> {
    const existing = await this.templateRepo.findOneBy({ id: req.template.id });
    if (!existing) {
      throw new SystemAuthException(
        'APPROVAL_TEMPLATE_NOT_FOUND',
        'Approval template not found'
      );
    }

    // Update fields
    existing.businessType = req.template.businessType;
    existing.name = req.template.name;
    existing.definition = req.template.definition;

    await this.templateRepo.save(existing);
    return okResult({ success: true });
  }

  async deleteApprovalTemplate(req: {
    templateId: string;
  }): Promise<Result<{ success: boolean }>> {
    const existing = await this.templateRepo.findOneBy({ id: req.templateId });
    if (!existing) {
      return okResult({ success: true }); // idempotent - already deleted
    }

    await this.templateRepo.remove(existing);
    return okResult({ success: true });
  }

  async listApprovalTemplates(req: {
    businessType?: string;
  }): Promise<Result<ApprovalTemplate[]>> {
    const query = this.templateRepo.createQueryBuilder('template');

    if (req.businessType) {
      query.where('template.businessType = :businessType', {
        businessType: req.businessType,
      });
    }

    const templates = await query.getMany();
    return okResult(templates.map((t) => t.toDTO()));
  }

  async findById(id: string): Promise<ApprovalTemplateEntity | null> {
    return this.templateRepo.findOneBy({ id });
  }
}
