import 'reflect-metadata';
import { describe, it, expect, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApprovalTemplateService } from './approval-template.service';
import { ApprovalTemplateEntity } from '../../entities/ApprovalTemplate.entity';
import { DataSource } from 'typeorm';

describe('ApprovalTemplateService', () => {
  let service: ApprovalTemplateService;
  let dataSource: DataSource;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [ApprovalTemplateEntity],
          synchronize: true,
          logging: false,
        }),
        TypeOrmModule.forFeature([ApprovalTemplateEntity]),
      ],
      providers: [ApprovalTemplateService],
    }).compile();

    service = moduleRef.get(ApprovalTemplateService);
    dataSource = moduleRef.get(DataSource);

    await dataSource.dropDatabase();
    await dataSource.synchronize(true);
  });

  describe('createApprovalTemplate', () => {
    it('should create an approval template', async () => {
      const result = await service.createApprovalTemplate({
        template: {
          businessType: 'LEAVE_REQUEST',
          name: 'Leave Approval Workflow',
          definition: {
            nodes: [
              { id: 'node1', type: 'approval', assignee: 'manager' },
              { id: 'node2', type: 'notification', assignee: 'hr' },
            ],
            rules: {
              autoApprove: false,
              timeout: '24h',
            },
          },
        },
      });

      expect(result.ok).toBe(true);
      expect(result.data?.templateId).toBeDefined();
    });

    it('should allow multiple templates with different business types', async () => {
      const result1 = await service.createApprovalTemplate({
        template: {
          businessType: 'LEAVE_REQUEST',
          name: 'Leave Approval',
          definition: { nodes: [] },
        },
      });

      const result2 = await service.createApprovalTemplate({
        template: {
          businessType: 'EXPENSE_CLAIM',
          name: 'Expense Approval',
          definition: { nodes: [] },
        },
      });

      expect(result1.ok).toBe(true);
      expect(result2.ok).toBe(true);
    });

    it('should allow multiple templates with same business type', async () => {
      const result1 = await service.createApprovalTemplate({
        template: {
          businessType: 'LEAVE_REQUEST',
          name: 'Leave Approval v1',
          definition: { nodes: [] },
        },
      });

      const result2 = await service.createApprovalTemplate({
        template: {
          businessType: 'LEAVE_REQUEST',
          name: 'Leave Approval v2',
          definition: { nodes: [] },
        },
      });

      expect(result1.ok).toBe(true);
      expect(result2.ok).toBe(true);
    });

    it('should create template with minimal definition', async () => {
      const result = await service.createApprovalTemplate({
        template: {
          businessType: 'SIMPLE_APPROVAL',
          name: 'Simple Approval',
          definition: {},
        },
      });

      expect(result.ok).toBe(true);
      expect(result.data?.templateId).toBeDefined();
    });
  });

  describe('updateApprovalTemplate', () => {
    it('should update an existing template', async () => {
      const createResult = await service.createApprovalTemplate({
        template: {
          businessType: 'LEAVE_REQUEST',
          name: 'Leave Approval',
          definition: { nodes: [] },
        },
      });
      const templateId = createResult.data!.templateId;

      const result = await service.updateApprovalTemplate({
        template: {
          id: templateId,
          businessType: 'LEAVE_REQUEST',
          name: 'Updated Leave Approval',
          definition: {
            nodes: [{ id: 'node1', type: 'approval' }],
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });

      expect(result.ok).toBe(true);
      expect(result.data?.success).toBe(true);
    });

    it('should throw APPROVAL_TEMPLATE_NOT_FOUND when updating non-existent template', async () => {
      await expect(
        service.updateApprovalTemplate({
          template: {
            id: 'non-existent-id',
            businessType: 'LEAVE_REQUEST',
            name: 'Leave Approval',
            definition: {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        })
      ).rejects.toThrow('Approval template not found');
    });
  });

  describe('deleteApprovalTemplate', () => {
    it('should delete an existing template', async () => {
      const createResult = await service.createApprovalTemplate({
        template: {
          businessType: 'LEAVE_REQUEST',
          name: 'Leave Approval',
          definition: { nodes: [] },
        },
      });
      const templateId = createResult.data!.templateId;

      const result = await service.deleteApprovalTemplate({ templateId });

      expect(result.ok).toBe(true);
      expect(result.data?.success).toBe(true);
    });

    it('should be idempotent when deleting non-existent template', async () => {
      const result = await service.deleteApprovalTemplate({
        templateId: 'non-existent-id',
      });

      expect(result.ok).toBe(true);
      expect(result.data?.success).toBe(true);
    });

    it('should return success when deleting already deleted template', async () => {
      const createResult = await service.createApprovalTemplate({
        template: {
          businessType: 'LEAVE_REQUEST',
          name: 'Leave Approval',
          definition: { nodes: [] },
        },
      });
      const templateId = createResult.data!.templateId;

      // First delete
      await service.deleteApprovalTemplate({ templateId });

      // Second delete - should be idempotent
      const result = await service.deleteApprovalTemplate({ templateId });

      expect(result.ok).toBe(true);
      expect(result.data?.success).toBe(true);
    });
  });

  describe('listApprovalTemplates', () => {
    it('should list all templates', async () => {
      await service.createApprovalTemplate({
        template: {
          businessType: 'LEAVE_REQUEST',
          name: 'Leave Approval',
          definition: { nodes: [] },
        },
      });
      await service.createApprovalTemplate({
        template: {
          businessType: 'EXPENSE_CLAIM',
          name: 'Expense Approval',
          definition: { nodes: [] },
        },
      });

      const result = await service.listApprovalTemplates({});

      expect(result.ok).toBe(true);
      expect(result.data?.length).toBe(2);
    });

    it('should filter templates by businessType', async () => {
      await service.createApprovalTemplate({
        template: {
          businessType: 'LEAVE_REQUEST',
          name: 'Leave Approval v1',
          definition: { nodes: [] },
        },
      });
      await service.createApprovalTemplate({
        template: {
          businessType: 'LEAVE_REQUEST',
          name: 'Leave Approval v2',
          definition: { nodes: [] },
        },
      });
      await service.createApprovalTemplate({
        template: {
          businessType: 'EXPENSE_CLAIM',
          name: 'Expense Approval',
          definition: { nodes: [] },
        },
      });

      const result = await service.listApprovalTemplates({
        businessType: 'LEAVE_REQUEST',
      });

      expect(result.ok).toBe(true);
      expect(result.data?.length).toBe(2);
      result.data?.forEach((t) => {
        expect(t.businessType).toBe('LEAVE_REQUEST');
      });
    });

    it('should return empty array when no templates match businessType filter', async () => {
      await service.createApprovalTemplate({
        template: {
          businessType: 'LEAVE_REQUEST',
          name: 'Leave Approval',
          definition: { nodes: [] },
        },
      });

      const result = await service.listApprovalTemplates({
        businessType: 'NON_EXISTENT',
      });

      expect(result.ok).toBe(true);
      expect(result.data?.length).toBe(0);
    });

    it('should return empty array when no templates exist', async () => {
      const result = await service.listApprovalTemplates({});

      expect(result.ok).toBe(true);
      expect(result.data?.length).toBe(0);
    });
  });

  describe('findById', () => {
    it('should find a template by id', async () => {
      const createResult = await service.createApprovalTemplate({
        template: {
          businessType: 'LEAVE_REQUEST',
          name: 'Leave Approval',
          definition: { nodes: [] },
        },
      });
      const templateId = createResult.data!.templateId;

      const template = await service.findById(templateId);

      expect(template).not.toBeNull();
      expect(template?.name).toBe('Leave Approval');
      expect(template?.businessType).toBe('LEAVE_REQUEST');
    });

    it('should return null for non-existent template', async () => {
      const template = await service.findById('non-existent-id');

      expect(template).toBeNull();
    });
  });
});
