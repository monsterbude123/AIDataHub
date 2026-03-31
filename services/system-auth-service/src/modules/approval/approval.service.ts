import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  okResult,
  type Result,
  type Approval,
  type PageResult,
  type ApprovalStatus,
} from '@ai-datahub/contract';
import { SystemAuthException } from '../../common/errors/system-auth.exception';
import { ApprovalEntity } from '../../entities/Approval.entity';
import { ApprovalTemplateEntity } from '../../entities/ApprovalTemplate.entity';

@Injectable()
export class ApprovalService {
  constructor(
    @InjectRepository(ApprovalEntity)
    private readonly approvalRepo: Repository<ApprovalEntity>,
    @InjectRepository(ApprovalTemplateEntity)
    private readonly templateRepo: Repository<ApprovalTemplateEntity>
  ) {}

  async createApproval(req: {
    businessType: string;
    businessId: string;
    title: string;
    applicantId: string;
    payload?: Record<string, unknown>;
  }): Promise<Result<{ approvalId: string }>> {
    // Find a template for this business type
    const template = await this.templateRepo.findOneBy({
      businessType: req.businessType,
    });

    if (!template) {
      throw new SystemAuthException(
        'APPROVAL_TEMPLATE_NOT_FOUND',
        `No approval template found for business type: ${req.businessType}`
      );
    }

    // Create approval with PENDING status
    const approval = this.approvalRepo.create({
      businessType: req.businessType,
      businessId: req.businessId,
      title: req.title,
      applicantId: req.applicantId,
      payload: req.payload,
      templateId: template.id,
      status: 'PENDING' as ApprovalStatus,
      history: [],
    });

    await this.approvalRepo.save(approval);
    return okResult({ approvalId: approval.id });
  }

  async approve(req: {
    approvalId: string;
    action: 'APPROVE' | 'REJECT';
    comment?: string;
    approverId: string;
  }): Promise<Result<{ success: boolean }>> {
    const approval = await this.approvalRepo.findOneBy({ id: req.approvalId });

    if (!approval) {
      throw new SystemAuthException('APPROVAL_NOT_FOUND', 'Approval not found');
    }

    // Check if approval is in PENDING status
    if (approval.status !== 'PENDING') {
      throw new SystemAuthException(
        'APPROVAL_STATE_INVALID',
        `Approval is already ${approval.status}`
      );
    }

    // Check if this approver has already acted (idempotent check)
    const existingAction = approval.history?.find(
      (h) => h.approverId === req.approverId
    );

    if (existingAction) {
      // Idempotent: same action by same approver is fine
      if (existingAction.action === req.action) {
        return okResult({ success: true });
      }
      // Different action by same approver - not allowed
      throw new SystemAuthException(
        'APPROVAL_STATE_INVALID',
        'Approver has already acted on this approval'
      );
    }

    // Add to history
    const historyEntry = {
      approverId: req.approverId,
      action: req.action,
      comment: req.comment,
      createdAt: new Date().toISOString(),
    };

    approval.history = [...(approval.history || []), historyEntry];
    approval.status = req.action === 'APPROVE' ? 'APPROVED' : 'REJECTED';

    await this.approvalRepo.save(approval);
    return okResult({ success: true });
  }

  async listMyTodoApprovals(req: {
    userId: string;
    page: { page: number; pageSize: number };
  }): Promise<Result<PageResult<Approval>>> {
    // For MVP: list all PENDING approvals
    // In a more sophisticated system, we'd filter by user's approval authority
    const query = this.approvalRepo
      .createQueryBuilder('approval')
      .where('approval.status = :status', { status: 'PENDING' });

    // Get total count
    const total = await query.getCount();

    // Apply pagination
    const skip = (req.page.page - 1) * req.page.pageSize;
    query.skip(skip).take(req.page.pageSize);

    const approvals = await query.getMany();

    return okResult({
      page: req.page.page,
      pageSize: req.page.pageSize,
      total,
      items: approvals.map((a) => a.toDTO()),
    });
  }

  async listMyDoneApprovals(req: {
    userId: string;
    page: { page: number; pageSize: number };
  }): Promise<Result<PageResult<Approval>>> {
    // List APPROVED/REJECTED approvals where userId appears in history
    // Using JSON query for SQLite compatibility
    const query = this.approvalRepo
      .createQueryBuilder('approval')
      .where('approval.status IN (:...statuses)', {
        statuses: ['APPROVED', 'REJECTED'],
      });

    // Get all and filter in memory for JSON field
    // This is not ideal for large datasets but works for MVP
    const allApprovals = await query.getMany();

    // Filter approvals where user is in history
    const filteredApprovals = allApprovals.filter((approval) => {
      return approval.history?.some((h) => h.approverId === req.userId);
    });

    const total = filteredApprovals.length;

    // Apply pagination
    const skip = (req.page.page - 1) * req.page.pageSize;
    const paginatedApprovals = filteredApprovals.slice(
      skip,
      skip + req.page.pageSize
    );

    return okResult({
      page: req.page.page,
      pageSize: req.page.pageSize,
      total,
      items: paginatedApprovals.map((a) => a.toDTO()),
    });
  }

  async remindApproval(req: {
    approvalId: string;
    message?: string;
  }): Promise<Result<{ success: boolean }>> {
    const approval = await this.approvalRepo.findOneBy({ id: req.approvalId });

    if (!approval) {
      throw new SystemAuthException('APPROVAL_NOT_FOUND', 'Approval not found');
    }

    // Only remind PENDING approvals
    if (approval.status !== 'PENDING') {
      throw new SystemAuthException(
        'APPROVAL_STATE_INVALID',
        `Cannot remind approval in ${approval.status} status`
      );
    }

    // MVP: Just return success - in real implementation, this would send
    // a notification (email, push, etc.) to the approvers
    // The idempotency is implicit since this is a notification action

    return okResult({ success: true });
  }

  async findById(id: string): Promise<ApprovalEntity | null> {
    return this.approvalRepo.findOneBy({ id });
  }
}
