import 'reflect-metadata';
import { describe, it, expect, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApprovalService } from './approval.service';
import { ApprovalEntity } from '../../entities/Approval.entity';
import { ApprovalTemplateEntity } from '../../entities/ApprovalTemplate.entity';
import { DataSource } from 'typeorm';
import { SystemAuthException } from '../../common/errors/system-auth.exception';

describe('ApprovalService', () => {
  let service: ApprovalService;
  let dataSource: DataSource;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [ApprovalEntity, ApprovalTemplateEntity],
          synchronize: true,
          logging: false,
        }),
        TypeOrmModule.forFeature([ApprovalEntity, ApprovalTemplateEntity]),
      ],
      providers: [ApprovalService],
    }).compile();

    service = moduleRef.get(ApprovalService);
    dataSource = moduleRef.get(DataSource);

    await dataSource.dropDatabase();
    await dataSource.synchronize(true);

    // Create a default approval template for tests
    const templateRepo = dataSource.getRepository(ApprovalTemplateEntity);
    await templateRepo.save({
      businessType: 'LEAVE_REQUEST',
      name: 'Leave Approval',
      definition: {
        nodes: [{ id: 'node1', type: 'approval', assignee: 'manager' }],
      },
    });
  });

  describe('createApproval', () => {
    it('should create an approval with PENDING status', async () => {
      const result = await service.createApproval({
        businessType: 'LEAVE_REQUEST',
        businessId: 'business-1',
        title: 'Leave Request for 3 days',
        applicantId: 'user-1',
        payload: { startDate: '2024-01-01', endDate: '2024-01-03' },
      });

      expect(result.ok).toBe(true);
      expect(result.data?.approvalId).toBeDefined();
    });

    it('should throw APPROVAL_TEMPLATE_NOT_FOUND when template not found', async () => {
      await expect(
        service.createApproval({
          businessType: 'UNKNOWN_TYPE',
          businessId: 'business-1',
          title: 'Test',
          applicantId: 'user-1',
        })
      ).rejects.toThrow('No approval template found');
    });

    it('should create approval without payload', async () => {
      const result = await service.createApproval({
        businessType: 'LEAVE_REQUEST',
        businessId: 'business-1',
        title: 'Leave Request',
        applicantId: 'user-1',
      });

      expect(result.ok).toBe(true);
      expect(result.data?.approvalId).toBeDefined();
    });

    it('should create approval with empty history', async () => {
      const result = await service.createApproval({
        businessType: 'LEAVE_REQUEST',
        businessId: 'business-1',
        title: 'Leave Request',
        applicantId: 'user-1',
      });

      const approval = await service.findById(result.data!.approvalId);
      expect(approval?.history).toEqual([]);
      expect(approval?.status).toBe('PENDING');
    });
  });

  describe('approve', () => {
    it('should approve a pending approval', async () => {
      const createResult = await service.createApproval({
        businessType: 'LEAVE_REQUEST',
        businessId: 'business-1',
        title: 'Leave Request',
        applicantId: 'user-1',
      });
      const approvalId = createResult.data!.approvalId;

      const result = await service.approve({
        approvalId,
        action: 'APPROVE',
        comment: 'Approved',
        approverId: 'approver-1',
      });

      expect(result.ok).toBe(true);
      expect(result.data?.success).toBe(true);

      const approval = await service.findById(approvalId);
      expect(approval?.status).toBe('APPROVED');
      expect(approval?.history?.length).toBe(1);
      expect(approval?.history?.[0].action).toBe('APPROVE');
      expect(approval?.history?.[0].approverId).toBe('approver-1');
    });

    it('should reject a pending approval', async () => {
      const createResult = await service.createApproval({
        businessType: 'LEAVE_REQUEST',
        businessId: 'business-1',
        title: 'Leave Request',
        applicantId: 'user-1',
      });
      const approvalId = createResult.data!.approvalId;

      const result = await service.approve({
        approvalId,
        action: 'REJECT',
        comment: 'Not approved',
        approverId: 'approver-1',
      });

      expect(result.ok).toBe(true);

      const approval = await service.findById(approvalId);
      expect(approval?.status).toBe('REJECTED');
      expect(approval?.history?.[0].action).toBe('REJECT');
    });

    it('should throw APPROVAL_NOT_FOUND when approving non-existent approval', async () => {
      await expect(
        service.approve({
          approvalId: 'non-existent-id',
          action: 'APPROVE',
          approverId: 'approver-1',
        })
      ).rejects.toThrow('Approval not found');
    });

    it('should throw APPROVAL_STATE_INVALID when approving already approved approval', async () => {
      const createResult = await service.createApproval({
        businessType: 'LEAVE_REQUEST',
        businessId: 'business-1',
        title: 'Leave Request',
        applicantId: 'user-1',
      });
      const approvalId = createResult.data!.approvalId;

      await service.approve({
        approvalId,
        action: 'APPROVE',
        approverId: 'approver-1',
      });

      // Try to approve again
      await expect(
        service.approve({
          approvalId,
          action: 'APPROVE',
          approverId: 'approver-2',
        })
      ).rejects.toThrow('Approval is already APPROVED');
    });

    it('should be idempotent for same approver with same action', async () => {
      const createResult = await service.createApproval({
        businessType: 'LEAVE_REQUEST',
        businessId: 'business-1',
        title: 'Leave Request',
        applicantId: 'user-1',
      });
      const approvalId = createResult.data!.approvalId;

      // First approve
      const result1 = await service.approve({
        approvalId,
        action: 'APPROVE',
        approverId: 'approver-1',
      });

      // Reset status to PENDING to test idempotency
      const approval = await service.findById(approvalId);
      if (approval) {
        approval.status = 'PENDING';
        await dataSource.getRepository(ApprovalEntity).save(approval);
      }

      // Second approve by same approver - should be idempotent
      const result2 = await service.approve({
        approvalId,
        action: 'APPROVE',
        approverId: 'approver-1',
      });

      expect(result2.ok).toBe(true);
      expect(result2.data?.success).toBe(true);
    });

    it('should throw when same approver tries different action', async () => {
      const createResult = await service.createApproval({
        businessType: 'LEAVE_REQUEST',
        businessId: 'business-1',
        title: 'Leave Request',
        applicantId: 'user-1',
      });
      const approvalId = createResult.data!.approvalId;

      await service.approve({
        approvalId,
        action: 'APPROVE',
        approverId: 'approver-1',
      });

      // Reset status to PENDING to test
      const approval = await service.findById(approvalId);
      if (approval) {
        approval.status = 'PENDING';
        await dataSource.getRepository(ApprovalEntity).save(approval);
      }

      // Same approver tries different action
      await expect(
        service.approve({
          approvalId,
          action: 'REJECT',
          approverId: 'approver-1',
        })
      ).rejects.toThrow('Approver has already acted');
    });

    it('should allow approve without comment', async () => {
      const createResult = await service.createApproval({
        businessType: 'LEAVE_REQUEST',
        businessId: 'business-1',
        title: 'Leave Request',
        applicantId: 'user-1',
      });
      const approvalId = createResult.data!.approvalId;

      const result = await service.approve({
        approvalId,
        action: 'APPROVE',
        approverId: 'approver-1',
      });

      expect(result.ok).toBe(true);

      const approval = await service.findById(approvalId);
      expect(approval?.history?.[0].comment).toBeUndefined();
    });
  });

  describe('listMyTodoApprovals', () => {
    it('should list pending approvals', async () => {
      await service.createApproval({
        businessType: 'LEAVE_REQUEST',
        businessId: 'business-1',
        title: 'Leave Request 1',
        applicantId: 'user-1',
      });
      await service.createApproval({
        businessType: 'LEAVE_REQUEST',
        businessId: 'business-2',
        title: 'Leave Request 2',
        applicantId: 'user-2',
      });

      const result = await service.listMyTodoApprovals({
        userId: 'approver-1',
        page: { page: 1, pageSize: 10 },
      });

      expect(result.ok).toBe(true);
      expect(result.data?.items.length).toBe(2);
      expect(result.data?.total).toBe(2);
      expect(result.data?.page).toBe(1);
      expect(result.data?.pageSize).toBe(10);
    });

    it('should not list approved/rejected approvals', async () => {
      const createResult = await service.createApproval({
        businessType: 'LEAVE_REQUEST',
        businessId: 'business-1',
        title: 'Leave Request',
        applicantId: 'user-1',
      });

      await service.approve({
        approvalId: createResult.data!.approvalId,
        action: 'APPROVE',
        approverId: 'approver-1',
      });

      const result = await service.listMyTodoApprovals({
        userId: 'approver-1',
        page: { page: 1, pageSize: 10 },
      });

      expect(result.ok).toBe(true);
      expect(result.data?.items.length).toBe(0);
      expect(result.data?.total).toBe(0);
    });

    it('should support pagination', async () => {
      for (let i = 0; i < 15; i++) {
        await service.createApproval({
          businessType: 'LEAVE_REQUEST',
          businessId: `business-${i}`,
          title: `Leave Request ${i}`,
          applicantId: 'user-1',
        });
      }

      const result = await service.listMyTodoApprovals({
        userId: 'approver-1',
        page: { page: 2, pageSize: 5 },
      });

      expect(result.ok).toBe(true);
      expect(result.data?.items.length).toBe(5);
      expect(result.data?.total).toBe(15);
      expect(result.data?.page).toBe(2);
    });

    it('should return empty array when no pending approvals', async () => {
      const result = await service.listMyTodoApprovals({
        userId: 'approver-1',
        page: { page: 1, pageSize: 10 },
      });

      expect(result.ok).toBe(true);
      expect(result.data?.items.length).toBe(0);
      expect(result.data?.total).toBe(0);
    });
  });

  describe('listMyDoneApprovals', () => {
    it('should list approvals where user has acted', async () => {
      const createResult = await service.createApproval({
        businessType: 'LEAVE_REQUEST',
        businessId: 'business-1',
        title: 'Leave Request',
        applicantId: 'user-1',
      });

      await service.approve({
        approvalId: createResult.data!.approvalId,
        action: 'APPROVE',
        approverId: 'approver-1',
      });

      const result = await service.listMyDoneApprovals({
        userId: 'approver-1',
        page: { page: 1, pageSize: 10 },
      });

      expect(result.ok).toBe(true);
      expect(result.data?.items.length).toBe(1);
      expect(result.data?.total).toBe(1);
      expect(result.data?.items[0].status).toBe('APPROVED');
    });

    it('should not list approvals where user has not acted', async () => {
      const createResult = await service.createApproval({
        businessType: 'LEAVE_REQUEST',
        businessId: 'business-1',
        title: 'Leave Request',
        applicantId: 'user-1',
      });

      await service.approve({
        approvalId: createResult.data!.approvalId,
        action: 'APPROVE',
        approverId: 'approver-1',
      });

      const result = await service.listMyDoneApprovals({
        userId: 'approver-2',
        page: { page: 1, pageSize: 10 },
      });

      expect(result.ok).toBe(true);
      expect(result.data?.items.length).toBe(0);
      expect(result.data?.total).toBe(0);
    });

    it('should list both approved and rejected approvals', async () => {
      const createResult1 = await service.createApproval({
        businessType: 'LEAVE_REQUEST',
        businessId: 'business-1',
        title: 'Leave Request 1',
        applicantId: 'user-1',
      });
      await service.approve({
        approvalId: createResult1.data!.approvalId,
        action: 'APPROVE',
        approverId: 'approver-1',
      });

      const createResult2 = await service.createApproval({
        businessType: 'LEAVE_REQUEST',
        businessId: 'business-2',
        title: 'Leave Request 2',
        applicantId: 'user-2',
      });
      await service.approve({
        approvalId: createResult2.data!.approvalId,
        action: 'REJECT',
        approverId: 'approver-1',
      });

      const result = await service.listMyDoneApprovals({
        userId: 'approver-1',
        page: { page: 1, pageSize: 10 },
      });

      expect(result.ok).toBe(true);
      expect(result.data?.items.length).toBe(2);
      expect(result.data?.total).toBe(2);
    });

    it('should not list pending approvals', async () => {
      await service.createApproval({
        businessType: 'LEAVE_REQUEST',
        businessId: 'business-1',
        title: 'Leave Request',
        applicantId: 'user-1',
      });

      const result = await service.listMyDoneApprovals({
        userId: 'approver-1',
        page: { page: 1, pageSize: 10 },
      });

      expect(result.ok).toBe(true);
      expect(result.data?.items.length).toBe(0);
      expect(result.data?.total).toBe(0);
    });

    it('should support pagination', async () => {
      for (let i = 0; i < 15; i++) {
        const createResult = await service.createApproval({
          businessType: 'LEAVE_REQUEST',
          businessId: `business-${i}`,
          title: `Leave Request ${i}`,
          applicantId: 'user-1',
        });
        await service.approve({
          approvalId: createResult.data!.approvalId,
          action: 'APPROVE',
          approverId: 'approver-1',
        });
      }

      const result = await service.listMyDoneApprovals({
        userId: 'approver-1',
        page: { page: 2, pageSize: 5 },
      });

      expect(result.ok).toBe(true);
      expect(result.data?.items.length).toBe(5);
      expect(result.data?.total).toBe(15);
      expect(result.data?.page).toBe(2);
    });
  });

  describe('remindApproval', () => {
    it('should remind a pending approval', async () => {
      const createResult = await service.createApproval({
        businessType: 'LEAVE_REQUEST',
        businessId: 'business-1',
        title: 'Leave Request',
        applicantId: 'user-1',
      });

      const result = await service.remindApproval({
        approvalId: createResult.data!.approvalId,
        message: 'Please review',
      });

      expect(result.ok).toBe(true);
      expect(result.data?.success).toBe(true);
    });

    it('should throw APPROVAL_NOT_FOUND for non-existent approval', async () => {
      await expect(
        service.remindApproval({ approvalId: 'non-existent-id' })
      ).rejects.toThrow('Approval not found');
    });

    it('should throw APPROVAL_STATE_INVALID for approved approval', async () => {
      const createResult = await service.createApproval({
        businessType: 'LEAVE_REQUEST',
        businessId: 'business-1',
        title: 'Leave Request',
        applicantId: 'user-1',
      });
      await service.approve({
        approvalId: createResult.data!.approvalId,
        action: 'APPROVE',
        approverId: 'approver-1',
      });

      await expect(
        service.remindApproval({ approvalId: createResult.data!.approvalId })
      ).rejects.toThrow('Cannot remind approval in APPROVED status');
    });

    it('should throw APPROVAL_STATE_INVALID for rejected approval', async () => {
      const createResult = await service.createApproval({
        businessType: 'LEAVE_REQUEST',
        businessId: 'business-1',
        title: 'Leave Request',
        applicantId: 'user-1',
      });
      await service.approve({
        approvalId: createResult.data!.approvalId,
        action: 'REJECT',
        approverId: 'approver-1',
      });

      await expect(
        service.remindApproval({ approvalId: createResult.data!.approvalId })
      ).rejects.toThrow('Cannot remind approval in REJECTED status');
    });

    it('should be idempotent - multiple reminders succeed', async () => {
      const createResult = await service.createApproval({
        businessType: 'LEAVE_REQUEST',
        businessId: 'business-1',
        title: 'Leave Request',
        applicantId: 'user-1',
      });

      const result1 = await service.remindApproval({
        approvalId: createResult.data!.approvalId,
        message: 'Reminder 1',
      });
      const result2 = await service.remindApproval({
        approvalId: createResult.data!.approvalId,
        message: 'Reminder 2',
      });

      expect(result1.ok).toBe(true);
      expect(result2.ok).toBe(true);
    });

    it('should work without message', async () => {
      const createResult = await service.createApproval({
        businessType: 'LEAVE_REQUEST',
        businessId: 'business-1',
        title: 'Leave Request',
        applicantId: 'user-1',
      });

      const result = await service.remindApproval({
        approvalId: createResult.data!.approvalId,
      });

      expect(result.ok).toBe(true);
      expect(result.data?.success).toBe(true);
    });
  });

  describe('findById', () => {
    it('should find an approval by id', async () => {
      const createResult = await service.createApproval({
        businessType: 'LEAVE_REQUEST',
        businessId: 'business-1',
        title: 'Leave Request',
        applicantId: 'user-1',
      });

      const approval = await service.findById(createResult.data!.approvalId);

      expect(approval).not.toBeNull();
      expect(approval?.title).toBe('Leave Request');
      expect(approval?.businessType).toBe('LEAVE_REQUEST');
    });

    it('should return null for non-existent approval', async () => {
      const approval = await service.findById('non-existent-id');

      expect(approval).toBeNull();
    });
  });
});
