import { Injectable, Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
  okResult,
  type Result,
  type Approval,
  type PageResult,
  type ApprovalStatus,
} from '@ai-datahub/contract';
import { SystemAuthException } from '../../common/errors/system-auth.exception';

@Injectable()
export class ApprovalService {
  constructor(@Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient) {}

  async createApproval(req: {
    businessType: string;
    businessId: string;
    title: string;
    applicantId: string;
    payload?: Record<string, unknown>;
  }): Promise<Result<{ approvalId: string }>> {
    // Find a template for this business type
    const template = await this.prisma.approvalTemplate.findFirst({
      where: { businessType: req.businessType },
    });

    if (!template) {
      throw new SystemAuthException(
        'APPROVAL_TEMPLATE_NOT_FOUND',
        `No approval template found for business type: ${req.businessType}`
      );
    }

    // Create approval with PENDING status
    const approval = await this.prisma.approval.create({
      data: {
        businessType: req.businessType,
        businessId: req.businessId,
        title: req.title,
        applicantId: req.applicantId,
        payload: req.payload ? JSON.stringify(req.payload) : undefined,
        templateId: template.id,
        status: 'PENDING',
        history: '[]',
      },
    });

    return okResult({ approvalId: approval.id });
  }

  async approve(req: {
    approvalId: string;
    action: 'APPROVE' | 'REJECT';
    comment?: string;
    approverId: string;
  }): Promise<Result<{ success: boolean }>> {
    const approval = await this.prisma.approval.findUnique({
      where: { id: req.approvalId },
    });

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

    // Parse history
    const history = JSON.parse(approval.history || '[]') as Array<{
      approverId: string;
      action: string;
      comment?: string;
      createdAt: string;
    }>;

    // Check if this approver has already acted (idempotent check)
    const existingAction = history.find((h) => h.approverId === req.approverId);

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

    const newHistory = [...history, historyEntry];
    const newStatus: ApprovalStatus =
      req.action === 'APPROVE' ? 'APPROVED' : 'REJECTED';

    await this.prisma.approval.update({
      where: { id: req.approvalId },
      data: {
        history: JSON.stringify(newHistory),
        status: newStatus,
      },
    });

    return okResult({ success: true });
  }

  async listMyTodoApprovals(req: {
    userId: string;
    page: { page: number; pageSize: number };
  }): Promise<Result<PageResult<Approval>>> {
    const skip = (req.page.page - 1) * req.page.pageSize;

    // For MVP: list all PENDING approvals
    const [approvals, total] = await Promise.all([
      this.prisma.approval.findMany({
        where: { status: 'PENDING' },
        skip,
        take: req.page.pageSize,
      }),
      this.prisma.approval.count({ where: { status: 'PENDING' } }),
    ]);

    return okResult({
      page: req.page.page,
      pageSize: req.page.pageSize,
      total,
      items: approvals.map((a) => this.toDTO(a)),
    });
  }

  async listMyDoneApprovals(req: {
    userId: string;
    page: { page: number; pageSize: number };
  }): Promise<Result<PageResult<Approval>>> {
    // List APPROVED/REJECTED approvals where userId appears in history
    const allApprovals = await this.prisma.approval.findMany({
      where: { status: { in: ['APPROVED', 'REJECTED'] } },
    });

    // Filter approvals where user is in history
    const filteredApprovals = allApprovals.filter((approval) => {
      const history = JSON.parse(approval.history || '[]') as Array<{
        approverId: string;
      }>;
      return history.some((h) => h.approverId === req.userId);
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
      items: paginatedApprovals.map((a) => this.toDTO(a)),
    });
  }

  async remindApproval(req: {
    approvalId: string;
    message?: string;
  }): Promise<Result<{ success: boolean }>> {
    const approval = await this.prisma.approval.findUnique({
      where: { id: req.approvalId },
    });

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

    // MVP: Just return success - in real implementation, this would send notifications
    return okResult({ success: true });
  }

  async findById(id: string) {
    return this.prisma.approval.findUnique({ where: { id } });
  }

  private toDTO(a: {
    id: string;
    businessType: string;
    businessId: string;
    title: string;
    applicantId: string;
    currentNode: number | null;
    payload: string | null;
    templateId: string;
    status: string;
    history: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): Approval {
    return {
      id: a.id,
      businessType: a.businessType,
      businessId: a.businessId,
      title: a.title,
      applicantId: a.applicantId,
      currentNode: a.currentNode ?? undefined,
      payload: a.payload ? JSON.parse(a.payload) : undefined,
      templateId: a.templateId,
      status: a.status as ApprovalStatus,
      history: a.history ? JSON.parse(a.history) : [],
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    };
  }
}
