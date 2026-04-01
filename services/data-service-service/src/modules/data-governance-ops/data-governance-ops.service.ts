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

  async getQualityApprovalSwitch(): Promise<Result<QualityApprovalSwitch>> {
    return okResult(this.approvalSwitch);
  }

  async setQualityApprovalSwitch(req: {
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
    return okResult({ success: true });
  }

  async createQualityRule(req: {
    rule: Omit<QualityRule, 'id' | 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ ruleId: ID }>> {
    const result = await this.qualityRuleRepo.create(req.rule);
    return okResult(result);
  }

  async updateQualityRule(req: {
    rule: Omit<QualityRule, 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ success: boolean }>> {
    const success = await this.qualityRuleRepo.update(req.rule);
    if (!success) {
      return errResult({
        code: 'QUALITY_RULE_NOT_FOUND',
        message: 'Quality rule not found',
        level: 'ERROR',
      });
    }
    return okResult({ success: true });
  }

  async deleteQualityRule(req: {
    ruleId: ID;
  }): Promise<Result<{ success: boolean }>> {
    const success = await this.qualityRuleRepo.delete(req.ruleId);
    if (!success) {
      return errResult({
        code: 'QUALITY_RULE_NOT_FOUND',
        message: 'Quality rule not found',
        level: 'ERROR',
      });
    }
    return okResult({ success: true });
  }

  async listQualityRules(req: {
    keyword?: string;
    page: PageRequest;
  }): Promise<Result<PageResult<QualityRule>>> {
    const result = await this.qualityRuleRepo.list(req.keyword, req.page);
    return okResult(result);
  }

  async createQualityTask(req: {
    task: Omit<QualityTask, 'id' | 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ taskId: ID }>> {
    if (this.approvalSwitch.taskApprovalEnabled) {
      // In real implementation would require approval
    }
    const result = await this.qualityTaskRepo.create(req.task);
    return okResult(result);
  }

  async updateQualityTask(req: {
    task: Omit<QualityTask, 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ success: boolean }>> {
    const success = await this.qualityTaskRepo.update(req.task);
    if (!success) {
      return errResult({
        code: 'QUALITY_TASK_NOT_FOUND',
        message: 'Quality task not found',
        level: 'ERROR',
      });
    }
    return okResult({ success: true });
  }

  async deleteQualityTask(req: {
    taskId: ID;
  }): Promise<Result<{ success: boolean }>> {
    const success = await this.qualityTaskRepo.delete(req.taskId);
    if (!success) {
      return errResult({
        code: 'QUALITY_TASK_NOT_FOUND',
        message: 'Quality task not found',
        level: 'ERROR',
      });
    }
    return okResult({ success: true });
  }

  async runQualityTask(_req: {
    taskId: ID;
  }): Promise<Result<{ executionId: ID }>> {
    // In-memory implementation: just creates a successful execution
    const now = new Date().toISOString();
    const execution: Omit<TaskExecution, 'id'> = {
      taskId: _req.taskId,
      status: 'SUCCESS',
      triggerType: 'MANUAL',
      startedAt: now,
      endedAt: now,
    };
    const result = await this.executionRepo.create(execution);
    return okResult(result);
  }

  async listQualityTasks(req: {
    page: PageRequest;
  }): Promise<Result<PageResult<QualityTask>>> {
    const result = await this.qualityTaskRepo.list(req.page);
    return okResult(result);
  }

  async getQualityReport(req: {
    reportId: ID;
  }): Promise<Result<QualityReport>> {
    const report = await this.qualityReportRepo.getById(req.reportId);
    if (!report) {
      return errResult({
        code: 'QUALITY_REPORT_NOT_FOUND',
        message: 'Quality report not found',
        level: 'ERROR',
      });
    }
    return okResult(report);
  }

  async listQualityReports(req: {
    taskId: ID;
    page: PageRequest;
  }): Promise<Result<PageResult<QualityReport>>> {
    const result = await this.qualityReportRepo.listByTaskId(
      req.taskId,
      req.page
    );
    return okResult(result);
  }

  async previewQualityIssues(req: {
    reportId: ID;
    page: PageRequest;
  }): Promise<Result<PageResult<QualityIssue>>> {
    const result = await this.qualityReportRepo.listIssues(
      req.reportId,
      req.page
    );
    return okResult(result);
  }

  async createQualityTicket(req: {
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
    return okResult(result);
  }

  async updateQualityTicket(req: {
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
      return errResult({
        code: 'QUALITY_TICKET_NOT_FOUND',
        message: 'Quality ticket not found',
        level: 'ERROR',
      });
    }
    return okResult({ success: true });
  }

  async listMyQualityTickets(req: {
    assigneeUserId: ID;
    page: PageRequest;
  }): Promise<Result<PageResult<QualityTicket>>> {
    const result = await this.qualityTicketRepo.listByAssignee(
      req.assigneeUserId,
      req.page
    );
    return okResult(result);
  }

  async getQualityStats(_req: {
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
    return okResult({
      totalAssets: 0,
      totalRecords: 0,
      problemRecords: 0,
      problemRatio: 0,
    });
  }

  // -------------------------
  // 标签管理
  // -------------------------

  async listTagCategories(req: {
    parentId?: ID;
  }): Promise<Result<TagCategoryNode[]>> {
    const result = await this.tagCategoryRepo.list(req.parentId);
    return okResult(result);
  }

  async createTagCategory(req: {
    node: Omit<TagCategoryNode, 'id' | 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ categoryId: ID }>> {
    const result = await this.tagCategoryRepo.create(req.node);
    return okResult(result);
  }

  async updateTagCategory(req: {
    node: Omit<TagCategoryNode, 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ success: boolean }>> {
    const success = await this.tagCategoryRepo.update(req.node);
    if (!success) {
      return errResult({
        code: 'TAG_NOT_FOUND',
        message: 'Tag category not found',
        level: 'ERROR',
      });
    }
    return okResult({ success: true });
  }

  async deleteTagCategory(req: {
    categoryId: ID;
  }): Promise<Result<{ success: boolean }>> {
    const success = await this.tagCategoryRepo.delete(req.categoryId);
    if (!success) {
      return errResult({
        code: 'TAG_NOT_FOUND',
        message: 'Tag category not found',
        level: 'ERROR',
      });
    }
    return okResult({ success: true });
  }

  async createTag(req: {
    tag: Omit<Tag, 'id' | 'createdAt'>;
  }): Promise<Result<{ tagId: ID }>> {
    const result = await this.tagRepo.create(req.tag);
    return okResult(result);
  }

  async updateTag(req: {
    tag: Omit<Tag, 'createdAt'>;
  }): Promise<Result<{ success: boolean }>> {
    const success = await this.tagRepo.update(req.tag);
    if (!success) {
      return errResult({
        code: 'TAG_NOT_FOUND',
        message: 'Tag not found',
        level: 'ERROR',
      });
    }
    return okResult({ success: true });
  }

  async deleteTag(req: { tagId: ID }): Promise<Result<{ success: boolean }>> {
    const success = await this.tagRepo.delete(req.tagId);
    if (!success) {
      return errResult({
        code: 'TAG_NOT_FOUND',
        message: 'Tag not found',
        level: 'ERROR',
      });
    }
    return okResult({ success: true });
  }

  async queryTags(req: {
    keyword?: string;
    page: PageRequest;
  }): Promise<Result<PageResult<Tag>>> {
    const result = await this.tagRepo.query(req.keyword, req.page);
    return okResult(result);
  }

  async createTagRule(req: {
    rule: Omit<TagRule, 'id' | 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ ruleId: ID }>> {
    const result = await this.tagRuleRepo.create(req.rule);
    return okResult(result);
  }

  async updateTagRule(req: {
    rule: Omit<TagRule, 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ success: boolean }>> {
    const success = await this.tagRuleRepo.update(req.rule);
    if (!success) {
      return errResult({
        code: 'TAG_RULE_NOT_FOUND',
        message: 'Tag rule not found',
        level: 'ERROR',
      });
    }
    return okResult({ success: true });
  }

  async deleteTagRule(req: {
    ruleId: ID;
  }): Promise<Result<{ success: boolean }>> {
    const success = await this.tagRuleRepo.delete(req.ruleId);
    if (!success) {
      return errResult({
        code: 'TAG_RULE_NOT_FOUND',
        message: 'Tag rule not found',
        level: 'ERROR',
      });
    }
    return okResult({ success: true });
  }

  async listTagRules(req: {
    tagId?: ID;
    page: PageRequest;
  }): Promise<Result<PageResult<TagRule>>> {
    const result = await this.tagRuleRepo.list(req.tagId, req.page);
    return okResult(result);
  }

  async createTagTask(req: {
    task: Omit<TagTask, 'id' | 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ taskId: ID }>> {
    const result = await this.tagTaskRepo.create(req.task);
    return okResult(result);
  }

  async updateTagTask(req: {
    task: Omit<TagTask, 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ success: boolean }>> {
    const success = await this.tagTaskRepo.update(req.task);
    if (!success) {
      return errResult({
        code: 'TAG_TASK_NOT_FOUND',
        message: 'Tag task not found',
        level: 'ERROR',
      });
    }
    return okResult({ success: true });
  }

  async deleteTagTask(req: {
    taskId: ID;
  }): Promise<Result<{ success: boolean }>> {
    const success = await this.tagTaskRepo.delete(req.taskId);
    if (!success) {
      return errResult({
        code: 'TAG_TASK_NOT_FOUND',
        message: 'Tag task not found',
        level: 'ERROR',
      });
    }
    return okResult({ success: true });
  }

  async runTagTask(_req: { taskId: ID }): Promise<Result<{ executionId: ID }>> {
    // In-memory implementation: just creates a successful execution
    const now = new Date().toISOString();
    const execution: Omit<TaskExecution, 'id'> = {
      taskId: _req.taskId,
      status: 'SUCCESS',
      triggerType: 'MANUAL',
      startedAt: now,
      endedAt: now,
    };
    const result = await this.executionRepo.create(execution);
    return okResult(result);
  }

  async listTagTasks(req: {
    tagId?: ID;
    page: PageRequest;
  }): Promise<Result<PageResult<TagTask>>> {
    const result = await this.tagTaskRepo.list(req.tagId, req.page);
    return okResult(result);
  }

  async queryTagData(req: {
    query: TagQuery;
    page: PageRequest;
  }): Promise<Result<PageResult<TagQueryResultItem>>> {
    // In-memory implementation returns empty result
    return okResult({
      page: req.page.page,
      pageSize: req.page.pageSize,
      total: 0,
      items: [],
    });
  }

  async upsertTagSubject(req: {
    subject: Omit<TagSubject, 'createdAt' | 'updatedAt'> & { id?: ID };
  }): Promise<Result<{ subjectId: ID }>> {
    const result = await this.tagSubjectRepo.upsert(req.subject);
    return okResult(result);
  }

  async listTagSubjects(req: {
    keyword?: string;
    type?: TagSubject['type'];
    page: PageRequest;
  }): Promise<Result<PageResult<TagSubject>>> {
    const result = await this.tagSubjectRepo.list(
      req.keyword,
      req.type,
      req.page
    );
    return okResult(result);
  }

  async getSubjectTags(req: {
    subjectId: ID;
  }): Promise<Result<{ tagIds: ID[] }>> {
    const tagIds = await this.tagSubjectRepo.getSubjectTags(req.subjectId);
    return okResult({ tagIds });
  }

  // -------------------------
  // 血缘
  // -------------------------

  async collectLineage(_req: {
    scope: 'ETL' | 'SQL' | 'SERVICE';
    since?: ISODateTime;
  }): Promise<Result<{ success: boolean }>> {
    // In-memory implementation always succeeds
    return okResult({ success: true });
  }

  async getLineageGraph(_req: {
    dataAssetId: ID;
  }): Promise<Result<LineageGraph>> {
    // In-memory implementation returns empty graph
    return okResult({ nodes: [], edges: [] });
  }

  async getFieldLineageGraph(_req: {
    dataAssetId: ID;
    fieldName: string;
  }): Promise<Result<LineageGraph>> {
    // In-memory implementation returns empty graph
    return okResult({ nodes: [], edges: [] });
  }

  async impactAnalysis(_req: {
    dataAssetId: ID;
  }): Promise<Result<{ items: ImpactAnalysisItem[] }>> {
    // In-memory implementation returns empty result
    return okResult({ items: [] });
  }

  async exportImpactAnalysis(req: {
    dataAssetId: ID;
  }): Promise<Result<{ downloadUrl: string }>> {
    // In-memory implementation returns placeholder URL
    return okResult({
      downloadUrl: `/api/governance-ops/impact-analysis/export/${req.dataAssetId}`,
    });
  }

  async getExecution(req: { executionId: ID }): Promise<Result<TaskExecution>> {
    const execution = await this.executionRepo.getById(req.executionId);
    if (!execution) {
      return errResult({
        code: 'COLLECTION_FAILED',
        message: 'Execution not found',
        level: 'ERROR',
      });
    }
    return okResult(execution);
  }
}
