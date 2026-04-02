import { Injectable } from '@nestjs/common';
import type {
  DataGovernanceOpsClient,
  QualityApprovalSwitch,
  Result,
  PageResult,
  PageRequest,
  ID,
  ISODateTime,
  QualityRule,
  QualityTask,
  QualityReport,
  QualityIssue,
  QualityTicket,
  TagCategoryNode,
  Tag,
  TagRule,
  TagTask,
  TagQuery,
  TagQueryResultItem,
  TagSubject,
  LineageGraph,
  ImpactAnalysisItem,
  TaskExecution,
} from '@ai-datahub/contract';
import { okResult, errResult } from '@ai-datahub/contract';
import type { RequestMeta } from '@ai-datahub/contract';

import { InMemoryQualityRuleRepository } from './repositories/quality-rule.repository';
import { InMemoryQualityTaskRepository } from './repositories/quality-task.repository';
import { InMemoryQualityReportRepository } from './repositories/quality-report.repository';
import { InMemoryQualityTicketRepository } from './repositories/quality-ticket.repository';
import { InMemoryTagCategoryRepository } from './repositories/tag-category.repository';
import { InMemoryTagRepository } from './repositories/tag.repository';
import { InMemoryTagRuleRepository } from './repositories/tag-rule.repository';
import { InMemoryTagTaskRepository } from './repositories/tag-task.repository';
import { InMemoryTagSubjectRepository } from './repositories/tag-subject.repository';
import { InMemoryExecutionRepository } from './repositories/execution.repository';

@Injectable()
export class DataGovernanceOpsService implements DataGovernanceOpsClient {
  private approvalSwitch: QualityApprovalSwitch = {
    ruleApprovalEnabled: false,
    taskApprovalEnabled: false,
    updatedAt: new Date().toISOString(),
  };

  private readonly qualityRuleRepo = new InMemoryQualityRuleRepository();
  private readonly qualityTaskRepo = new InMemoryQualityTaskRepository();
  private readonly qualityReportRepo = new InMemoryQualityReportRepository();
  private readonly qualityTicketRepo = new InMemoryQualityTicketRepository();
  private readonly tagCategoryRepo = new InMemoryTagCategoryRepository();
  private readonly tagRepo = new InMemoryTagRepository();
  private readonly tagRuleRepo = new InMemoryTagRuleRepository();
  private readonly tagTaskRepo = new InMemoryTagTaskRepository();
  private readonly tagSubjectRepo = new InMemoryTagSubjectRepository();
  private readonly executionRepo = new InMemoryExecutionRepository();

  // -------------------------
  // 质量管理
  // -------------------------

  async getQualityApprovalSwitch(req: {
    meta?: RequestMeta;
  }): Promise<Result<QualityApprovalSwitch>> {
    return okResult(this.approvalSwitch, req.meta?.traceId);
  }

  async setQualityApprovalSwitch(req: {
    meta?: RequestMeta;
    ruleApprovalEnabled?: boolean;
    taskApprovalEnabled?: boolean;
  }): Promise<Result<{ success: boolean }>> {
    if (req.ruleApprovalEnabled !== undefined) {
      this.approvalSwitch.ruleApprovalEnabled = req.ruleApprovalEnabled;
    }
    if (req.taskApprovalEnabled !== undefined) {
      this.approvalSwitch.taskApprovalEnabled = req.taskApprovalEnabled;
    }
    this.approvalSwitch.updatedAt = new Date().toISOString();
    return okResult({ success: true }, req.meta?.traceId);
  }

  async createQualityRule(req: {
    meta?: RequestMeta;
    rule: Omit<QualityRule, 'id' | 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ ruleId: ID }>> {
    const result = await this.qualityRuleRepo.create(req.rule);
    return okResult(result, req.meta?.traceId);
  }

  async updateQualityRule(req: {
    meta?: RequestMeta;
    rule: Omit<QualityRule, 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ success: boolean }>> {
    const success = await this.qualityRuleRepo.update(req.rule);
    if (!success) {
      return errResult(
        {
          code: 'QUALITY_RULE_NOT_FOUND',
          message: 'Quality rule not found',
          level: 'ERROR',
        },
        req.meta?.traceId
      );
    }
    return okResult({ success: true }, req.meta?.traceId);
  }

  async deleteQualityRule(req: {
    meta?: RequestMeta;
    ruleId: ID;
  }): Promise<Result<{ success: boolean }>> {
    const success = await this.qualityRuleRepo.delete(req.ruleId);
    if (!success) {
      return errResult(
        {
          code: 'QUALITY_RULE_NOT_FOUND',
          message: 'Quality rule not found',
          level: 'ERROR',
        },
        req.meta?.traceId
      );
    }
    return okResult({ success: true }, req.meta?.traceId);
  }

  async listQualityRules(req: {
    meta?: RequestMeta;
    keyword?: string;
    page: PageRequest;
  }): Promise<Result<PageResult<QualityRule>>> {
    const result = await this.qualityRuleRepo.list(req.keyword, req.page);
    return okResult(result, req.meta?.traceId);
  }

  async createQualityTask(req: {
    meta?: RequestMeta;
    task: Omit<QualityTask, 'id' | 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ taskId: ID }>> {
    if (this.approvalSwitch.taskApprovalEnabled) {
      // In real implementation would require approval
    }
    const result = await this.qualityTaskRepo.create(req.task);
    return okResult(result, req.meta?.traceId);
  }

  async updateQualityTask(req: {
    meta?: RequestMeta;
    task: Omit<QualityTask, 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ success: boolean }>> {
    const success = await this.qualityTaskRepo.update(req.task);
    if (!success) {
      return errResult(
        {
          code: 'QUALITY_TASK_NOT_FOUND',
          message: 'Quality task not found',
          level: 'ERROR',
        },
        req.meta?.traceId
      );
    }
    return okResult({ success: true }, req.meta?.traceId);
  }

  async deleteQualityTask(req: {
    meta?: RequestMeta;
    taskId: ID;
  }): Promise<Result<{ success: boolean }>> {
    const success = await this.qualityTaskRepo.delete(req.taskId);
    if (!success) {
      return errResult(
        {
          code: 'QUALITY_TASK_NOT_FOUND',
          message: 'Quality task not found',
          level: 'ERROR',
        },
        req.meta?.traceId
      );
    }
    return okResult({ success: true }, req.meta?.traceId);
  }

  async runQualityTask(req: {
    meta?: RequestMeta;
    taskId: ID;
  }): Promise<Result<{ executionId: ID }>> {
    // In-memory implementation: just creates a successful execution
    const now = new Date().toISOString();
    const execution: Omit<TaskExecution, 'id'> = {
      taskId: req.taskId,
      status: 'SUCCESS',
      triggerType: 'MANUAL',
      startedAt: now,
      endedAt: now,
    };
    const result = await this.executionRepo.create(execution);
    return okResult(result, req.meta?.traceId);
  }

  async listQualityTasks(req: {
    meta?: RequestMeta;
    page: PageRequest;
  }): Promise<Result<PageResult<QualityTask>>> {
    const result = await this.qualityTaskRepo.list(req.page);
    return okResult(result, req.meta?.traceId);
  }

  async getQualityReport(req: {
    meta?: RequestMeta;
    reportId: ID;
  }): Promise<Result<QualityReport>> {
    const report = await this.qualityReportRepo.getById(req.reportId);
    if (!report) {
      return errResult(
        {
          code: 'QUALITY_REPORT_NOT_FOUND',
          message: 'Quality report not found',
          level: 'ERROR',
        },
        req.meta?.traceId
      );
    }
    return okResult(report, req.meta?.traceId);
  }

  async listQualityReports(req: {
    meta?: RequestMeta;
    taskId: ID;
    page: PageRequest;
  }): Promise<Result<PageResult<QualityReport>>> {
    const result = await this.qualityReportRepo.listByTaskId(
      req.taskId,
      req.page
    );
    return okResult(result, req.meta?.traceId);
  }

  async previewQualityIssues(req: {
    meta?: RequestMeta;
    reportId: ID;
    page: PageRequest;
  }): Promise<Result<PageResult<QualityIssue>>> {
    const result = await this.qualityReportRepo.listIssues(
      req.reportId,
      req.page
    );
    return okResult(result, req.meta?.traceId);
  }

  async createQualityTicket(req: {
    meta?: RequestMeta;
    reportId: ID;
    assigneeUserId: ID;
    title: string;
    description?: string;
  }): Promise<Result<{ ticketId: ID }>> {
    const result = await this.qualityTicketRepo.create(
      req.reportId,
      req.assigneeUserId,
      req.title,
      req.description
    );
    return okResult(result, req.meta?.traceId);
  }

  async updateQualityTicket(req: {
    meta?: RequestMeta;
    ticketId: ID;
    status?: QualityTicket['status'];
    description?: string;
  }): Promise<Result<{ success: boolean }>> {
    const success = await this.qualityTicketRepo.update(
      req.ticketId,
      req.status,
      req.description
    );
    if (!success) {
      return errResult(
        {
          code: 'QUALITY_TICKET_NOT_FOUND',
          message: 'Quality ticket not found',
          level: 'ERROR',
        },
        req.meta?.traceId
      );
    }
    return okResult({ success: true }, req.meta?.traceId);
  }

  async listMyQualityTickets(req: {
    meta?: RequestMeta;
    assigneeUserId: ID;
    page: PageRequest;
  }): Promise<Result<PageResult<QualityTicket>>> {
    const result = await this.qualityTicketRepo.listByAssignee(
      req.assigneeUserId,
      req.page
    );
    return okResult(result, req.meta?.traceId);
  }

  async getQualityStats(req: {
    meta?: RequestMeta;
    startAt: ISODateTime;
    endAt: ISODateTime;
  }): Promise<
    Result<{
      totalAssets?: number;
      totalRecords?: number;
      problemRecords?: number;
      problemRatio?: number;
    }>
  > {
    // In-memory implementation returns placeholder stats
    return okResult(
      {
        totalAssets: 0,
        totalRecords: 0,
        problemRecords: 0,
        problemRatio: 0,
      },
      req.meta?.traceId
    );
  }

  // -------------------------
  // 标签管理
  // -------------------------

  async listTagCategories(req: {
    meta?: RequestMeta;
    parentId?: ID;
  }): Promise<Result<TagCategoryNode[]>> {
    const result = await this.tagCategoryRepo.list(req.parentId);
    return okResult(result, req.meta?.traceId);
  }

  async createTagCategory(req: {
    meta?: RequestMeta;
    node: Omit<TagCategoryNode, 'id' | 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ categoryId: ID }>> {
    const result = await this.tagCategoryRepo.create(req.node);
    return okResult(result, req.meta?.traceId);
  }

  async updateTagCategory(req: {
    meta?: RequestMeta;
    node: Omit<TagCategoryNode, 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ success: boolean }>> {
    const success = await this.tagCategoryRepo.update(req.node);
    if (!success) {
      return errResult(
        {
          code: 'TAG_NOT_FOUND',
          message: 'Tag category not found',
          level: 'ERROR',
        },
        req.meta?.traceId
      );
    }
    return okResult({ success: true }, req.meta?.traceId);
  }

  async deleteTagCategory(req: {
    meta?: RequestMeta;
    categoryId: ID;
  }): Promise<Result<{ success: boolean }>> {
    const success = await this.tagCategoryRepo.delete(req.categoryId);
    if (!success) {
      return errResult(
        {
          code: 'TAG_NOT_FOUND',
          message: 'Tag category not found',
          level: 'ERROR',
        },
        req.meta?.traceId
      );
    }
    return okResult({ success: true }, req.meta?.traceId);
  }

  async createTag(req: {
    meta?: RequestMeta;
    tag: Omit<Tag, 'id' | 'createdAt'>;
  }): Promise<Result<{ tagId: ID }>> {
    const result = await this.tagRepo.create(req.tag);
    return okResult(result, req.meta?.traceId);
  }

  async updateTag(req: {
    meta?: RequestMeta;
    tag: Omit<Tag, 'createdAt'>;
  }): Promise<Result<{ success: boolean }>> {
    const success = await this.tagRepo.update(req.tag);
    if (!success) {
      return errResult(
        {
          code: 'TAG_NOT_FOUND',
          message: 'Tag not found',
          level: 'ERROR',
        },
        req.meta?.traceId
      );
    }
    return okResult({ success: true }, req.meta?.traceId);
  }

  async deleteTag(req: {
    meta?: RequestMeta;
    tagId: ID;
  }): Promise<Result<{ success: boolean }>> {
    const success = await this.tagRepo.delete(req.tagId);
    if (!success) {
      return errResult(
        {
          code: 'TAG_NOT_FOUND',
          message: 'Tag not found',
          level: 'ERROR',
        },
        req.meta?.traceId
      );
    }
    return okResult({ success: true }, req.meta?.traceId);
  }

  async queryTags(req: {
    meta?: RequestMeta;
    keyword?: string;
    page: PageRequest;
  }): Promise<Result<PageResult<Tag>>> {
    const result = await this.tagRepo.query(req.keyword, req.page);
    return okResult(result, req.meta?.traceId);
  }

  async createTagRule(req: {
    meta?: RequestMeta;
    rule: Omit<TagRule, 'id' | 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ ruleId: ID }>> {
    const result = await this.tagRuleRepo.create(req.rule);
    return okResult(result, req.meta?.traceId);
  }

  async updateTagRule(req: {
    meta?: RequestMeta;
    rule: Omit<TagRule, 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ success: boolean }>> {
    const success = await this.tagRuleRepo.update(req.rule);
    if (!success) {
      return errResult(
        {
          code: 'TAG_RULE_NOT_FOUND',
          message: 'Tag rule not found',
          level: 'ERROR',
        },
        req.meta?.traceId
      );
    }
    return okResult({ success: true }, req.meta?.traceId);
  }

  async deleteTagRule(req: {
    meta?: RequestMeta;
    ruleId: ID;
  }): Promise<Result<{ success: boolean }>> {
    const success = await this.tagRuleRepo.delete(req.ruleId);
    if (!success) {
      return errResult(
        {
          code: 'TAG_RULE_NOT_FOUND',
          message: 'Tag rule not found',
          level: 'ERROR',
        },
        req.meta?.traceId
      );
    }
    return okResult({ success: true }, req.meta?.traceId);
  }

  async listTagRules(req: {
    meta?: RequestMeta;
    tagId?: ID;
    page: PageRequest;
  }): Promise<Result<PageResult<TagRule>>> {
    const result = await this.tagRuleRepo.list(req.tagId, req.page);
    return okResult(result, req.meta?.traceId);
  }

  async createTagTask(req: {
    meta?: RequestMeta;
    task: Omit<TagTask, 'id' | 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ taskId: ID }>> {
    const result = await this.tagTaskRepo.create(req.task);
    return okResult(result, req.meta?.traceId);
  }

  async updateTagTask(req: {
    meta?: RequestMeta;
    task: Omit<TagTask, 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ success: boolean }>> {
    const success = await this.tagTaskRepo.update(req.task);
    if (!success) {
      return errResult(
        {
          code: 'TAG_TASK_NOT_FOUND',
          message: 'Tag task not found',
          level: 'ERROR',
        },
        req.meta?.traceId
      );
    }
    return okResult({ success: true }, req.meta?.traceId);
  }

  async deleteTagTask(req: {
    meta?: RequestMeta;
    taskId: ID;
  }): Promise<Result<{ success: boolean }>> {
    const success = await this.tagTaskRepo.delete(req.taskId);
    if (!success) {
      return errResult(
        {
          code: 'TAG_TASK_NOT_FOUND',
          message: 'Tag task not found',
          level: 'ERROR',
        },
        req.meta?.traceId
      );
    }
    return okResult({ success: true }, req.meta?.traceId);
  }

  async runTagTask(req: {
    meta?: RequestMeta;
    taskId: ID;
  }): Promise<Result<{ executionId: ID }>> {
    // In-memory implementation: just creates a successful execution
    const now = new Date().toISOString();
    const execution: Omit<TaskExecution, 'id'> = {
      taskId: req.taskId,
      status: 'SUCCESS',
      triggerType: 'MANUAL',
      startedAt: now,
      endedAt: now,
    };
    const result = await this.executionRepo.create(execution);
    return okResult(result, req.meta?.traceId);
  }

  async listTagTasks(req: {
    meta?: RequestMeta;
    tagId?: ID;
    page: PageRequest;
  }): Promise<Result<PageResult<TagTask>>> {
    const result = await this.tagTaskRepo.list(req.tagId, req.page);
    return okResult(result, req.meta?.traceId);
  }

  async queryTagData(req: {
    meta?: RequestMeta;
    query: TagQuery;
    page: PageRequest;
  }): Promise<Result<PageResult<TagQueryResultItem>>> {
    // In-memory implementation returns empty result
    return okResult(
      {
        page: req.page.page,
        pageSize: req.page.pageSize,
        total: 0,
        items: [],
      },
      req.meta?.traceId
    );
  }

  async upsertTagSubject(req: {
    meta?: RequestMeta;
    subject: Omit<TagSubject, 'createdAt' | 'updatedAt'> & { id?: ID };
  }): Promise<Result<{ subjectId: ID }>> {
    const result = await this.tagSubjectRepo.upsert(req.subject);
    return okResult(result, req.meta?.traceId);
  }

  async listTagSubjects(req: {
    meta?: RequestMeta;
    keyword?: string;
    type?: TagSubject['type'];
    page: PageRequest;
  }): Promise<Result<PageResult<TagSubject>>> {
    const result = await this.tagSubjectRepo.list(
      req.keyword,
      req.type,
      req.page
    );
    return okResult(result, req.meta?.traceId);
  }

  async getSubjectTags(req: {
    meta?: RequestMeta;
    subjectId: ID;
  }): Promise<Result<{ tagIds: ID[] }>> {
    const tagIds = await this.tagSubjectRepo.getSubjectTags(req.subjectId);
    return okResult({ tagIds }, req.meta?.traceId);
  }

  // -------------------------
  // 血缘
  // -------------------------

  async collectLineage(req: {
    meta?: RequestMeta;
    scope: 'ETL' | 'SQL' | 'SERVICE';
    since?: ISODateTime;
  }): Promise<Result<{ success: boolean }>> {
    // In-memory implementation always succeeds
    return okResult({ success: true }, req.meta?.traceId);
  }

  async getLineageGraph(req: {
    meta?: RequestMeta;
    dataAssetId: ID;
  }): Promise<Result<LineageGraph>> {
    // In-memory implementation returns empty graph
    return okResult({ nodes: [], edges: [] }, req.meta?.traceId);
  }

  async getFieldLineageGraph(req: {
    meta?: RequestMeta;
    dataAssetId: ID;
    fieldName: string;
  }): Promise<Result<LineageGraph>> {
    // In-memory implementation returns empty graph
    return okResult({ nodes: [], edges: [] }, req.meta?.traceId);
  }

  async impactAnalysis(req: {
    meta?: RequestMeta;
    dataAssetId: ID;
  }): Promise<Result<{ items: ImpactAnalysisItem[] }>> {
    // In-memory implementation returns empty result
    return okResult({ items: [] }, req.meta?.traceId);
  }

  async exportImpactAnalysis(req: {
    meta?: RequestMeta;
    dataAssetId: ID;
  }): Promise<Result<{ downloadUrl: string }>> {
    // In-memory implementation returns placeholder URL
    return okResult(
      {
        downloadUrl: `/api/governance-ops/impact-analysis/export/${req.dataAssetId}`,
      },
      req.meta?.traceId
    );
  }

  async getExecution(req: {
    meta?: RequestMeta;
    executionId: ID;
  }): Promise<Result<TaskExecution>> {
    const execution = await this.executionRepo.getById(req.executionId);
    if (!execution) {
      return errResult(
        {
          code: 'COLLECTION_FAILED',
          message: 'Execution not found',
          level: 'ERROR',
        },
        req.meta?.traceId
      );
    }
    return okResult(execution, req.meta?.traceId);
  }
}
