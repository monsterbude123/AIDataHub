import { Controller, Post, Body } from '@nestjs/common';
import type {
  Result,
  QualityApprovalSwitch,
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
  PageResult,
  PageRequest,
  ID,
  ISODateTime,
} from '@ai-datahub/contract';

import { DataGovernanceOpsService } from './data-governance-ops.service';

@Controller('api/governance-ops')
export class DataGovernanceOpsController {
  constructor(private readonly service: DataGovernanceOpsService) {}

  // -------------------------
  // 质量管理
  // -------------------------

  @Post('get-quality-approval-switch')
  async getQualityApprovalSwitch(): Promise<Result<QualityApprovalSwitch>> {
    return this.service.getQualityApprovalSwitch();
  }

  @Post('set-quality-approval-switch')
  async setQualityApprovalSwitch(
    @Body()
    body: {
      ruleApprovalEnabled?: boolean;
      taskApprovalEnabled?: boolean;
    }
  ): Promise<Result<{ success: boolean }>> {
    return this.service.setQualityApprovalSwitch(body);
  }

  @Post('create-quality-rule')
  async createQualityRule(
    @Body() body: { rule: Omit<QualityRule, 'id' | 'createdAt' | 'updatedAt'> }
  ): Promise<Result<{ ruleId: ID }>> {
    return this.service.createQualityRule(body);
  }

  @Post('update-quality-rule')
  async updateQualityRule(
    @Body() body: { rule: Omit<QualityRule, 'createdAt' | 'updatedAt'> }
  ): Promise<Result<{ success: boolean }>> {
    return this.service.updateQualityRule(body);
  }

  @Post('delete-quality-rule')
  async deleteQualityRule(
    @Body() body: { ruleId: ID }
  ): Promise<Result<{ success: boolean }>> {
    return this.service.deleteQualityRule(body);
  }

  @Post('list-quality-rules')
  async listQualityRules(
    @Body() body: { keyword?: string; page: PageRequest }
  ): Promise<Result<PageResult<QualityRule>>> {
    return this.service.listQualityRules(body);
  }

  @Post('create-quality-task')
  async createQualityTask(
    @Body() body: { task: Omit<QualityTask, 'id' | 'createdAt' | 'updatedAt'> }
  ): Promise<Result<{ taskId: ID }>> {
    return this.service.createQualityTask(body);
  }

  @Post('update-quality-task')
  async updateQualityTask(
    @Body() body: { task: Omit<QualityTask, 'createdAt' | 'updatedAt'> }
  ): Promise<Result<{ success: boolean }>> {
    return this.service.updateQualityTask(body);
  }

  @Post('delete-quality-task')
  async deleteQualityTask(
    @Body() body: { taskId: ID }
  ): Promise<Result<{ success: boolean }>> {
    return this.service.deleteQualityTask(body);
  }

  @Post('run-quality-task')
  async runQualityTask(
    @Body() body: { taskId: ID }
  ): Promise<Result<{ executionId: ID }>> {
    return this.service.runQualityTask(body);
  }

  @Post('list-quality-tasks')
  async listQualityTasks(
    @Body() body: { page: PageRequest }
  ): Promise<Result<PageResult<QualityTask>>> {
    return this.service.listQualityTasks(body);
  }

  @Post('get-quality-report')
  async getQualityReport(
    @Body() body: { reportId: ID }
  ): Promise<Result<QualityReport>> {
    return this.service.getQualityReport(body);
  }

  @Post('list-quality-reports')
  async listQualityReports(
    @Body() body: { taskId: ID; page: PageRequest }
  ): Promise<Result<PageResult<QualityReport>>> {
    return this.service.listQualityReports(body);
  }

  @Post('preview-quality-issues')
  async previewQualityIssues(
    @Body() body: { reportId: ID; page: PageRequest }
  ): Promise<Result<PageResult<QualityIssue>>> {
    return this.service.previewQualityIssues(body);
  }

  @Post('create-quality-ticket')
  async createQualityTicket(
    @Body()
    body: {
      reportId: ID;
      assigneeUserId: ID;
      title: string;
      description?: string;
    }
  ): Promise<Result<{ ticketId: ID }>> {
    return this.service.createQualityTicket(body);
  }

  @Post('update-quality-ticket')
  async updateQualityTicket(
    @Body()
    body: {
      ticketId: ID;
      status?: QualityTicket['status'];
      description?: string;
    }
  ): Promise<Result<{ success: boolean }>> {
    return this.service.updateQualityTicket(body);
  }

  @Post('list-my-quality-tickets')
  async listMyQualityTickets(
    @Body() body: { assigneeUserId: ID; page: PageRequest }
  ): Promise<Result<PageResult<QualityTicket>>> {
    return this.service.listMyQualityTickets(body);
  }

  @Post('get-quality-stats')
  async getQualityStats(
    @Body() body: { startAt: ISODateTime; endAt: ISODateTime }
  ): Promise<
    Result<{
      totalAssets?: number;
      totalRecords?: number;
      problemRecords?: number;
      problemRatio?: number;
    }>
  > {
    return this.service.getQualityStats(body);
  }

  // -------------------------
  // 标签管理
  // -------------------------

  @Post('list-tag-categories')
  async listTagCategories(
    @Body() body: { parentId?: ID }
  ): Promise<Result<TagCategoryNode[]>> {
    return this.service.listTagCategories(body);
  }

  @Post('create-tag-category')
  async createTagCategory(
    @Body()
    body: {
      node: Omit<TagCategoryNode, 'id' | 'createdAt' | 'updatedAt'>;
    }
  ): Promise<Result<{ categoryId: ID }>> {
    return this.service.createTagCategory(body);
  }

  @Post('update-tag-category')
  async updateTagCategory(
    @Body() body: { node: Omit<TagCategoryNode, 'createdAt' | 'updatedAt'> }
  ): Promise<Result<{ success: boolean }>> {
    return this.service.updateTagCategory(body);
  }

  @Post('delete-tag-category')
  async deleteTagCategory(
    @Body() body: { categoryId: ID }
  ): Promise<Result<{ success: boolean }>> {
    return this.service.deleteTagCategory(body);
  }

  @Post('create-tag')
  async createTag(
    @Body() body: { tag: Omit<Tag, 'id' | 'createdAt'> }
  ): Promise<Result<{ tagId: ID }>> {
    return this.service.createTag(body);
  }

  @Post('update-tag')
  async updateTag(
    @Body() body: { tag: Omit<Tag, 'createdAt'> }
  ): Promise<Result<{ success: boolean }>> {
    return this.service.updateTag(body);
  }

  @Post('delete-tag')
  async deleteTag(
    @Body() body: { tagId: ID }
  ): Promise<Result<{ success: boolean }>> {
    return this.service.deleteTag(body);
  }

  @Post('query-tags')
  async queryTags(
    @Body() body: { keyword?: string; page: PageRequest }
  ): Promise<Result<PageResult<Tag>>> {
    return this.service.queryTags(body);
  }

  @Post('create-tag-rule')
  async createTagRule(
    @Body() body: { rule: Omit<TagRule, 'id' | 'createdAt' | 'updatedAt'> }
  ): Promise<Result<{ ruleId: ID }>> {
    return this.service.createTagRule(body);
  }

  @Post('update-tag-rule')
  async updateTagRule(
    @Body() body: { rule: Omit<TagRule, 'createdAt' | 'updatedAt'> }
  ): Promise<Result<{ success: boolean }>> {
    return this.service.updateTagRule(body);
  }

  @Post('delete-tag-rule')
  async deleteTagRule(
    @Body() body: { ruleId: ID }
  ): Promise<Result<{ success: boolean }>> {
    return this.service.deleteTagRule(body);
  }

  @Post('list-tag-rules')
  async listTagRules(
    @Body() body: { tagId?: ID; page: PageRequest }
  ): Promise<Result<PageResult<TagRule>>> {
    return this.service.listTagRules(body);
  }

  @Post('create-tag-task')
  async createTagTask(
    @Body() body: { task: Omit<TagTask, 'id' | 'createdAt' | 'updatedAt'> }
  ): Promise<Result<{ taskId: ID }>> {
    return this.service.createTagTask(body);
  }

  @Post('update-tag-task')
  async updateTagTask(
    @Body() body: { task: Omit<TagTask, 'createdAt' | 'updatedAt'> }
  ): Promise<Result<{ success: boolean }>> {
    return this.service.updateTagTask(body);
  }

  @Post('delete-tag-task')
  async deleteTagTask(
    @Body() body: { taskId: ID }
  ): Promise<Result<{ success: boolean }>> {
    return this.service.deleteTagTask(body);
  }

  @Post('run-tag-task')
  async runTagTask(
    @Body() body: { taskId: ID }
  ): Promise<Result<{ executionId: ID }>> {
    return this.service.runTagTask(body);
  }

  @Post('list-tag-tasks')
  async listTagTasks(
    @Body() body: { tagId?: ID; page: PageRequest }
  ): Promise<Result<PageResult<TagTask>>> {
    return this.service.listTagTasks(body);
  }

  @Post('query-tag-data')
  async queryTagData(
    @Body() body: { query: TagQuery; page: PageRequest }
  ): Promise<Result<PageResult<TagQueryResultItem>>> {
    return this.service.queryTagData(body);
  }

  @Post('upsert-tag-subject')
  async upsertTagSubject(
    @Body()
    body: {
      subject: Omit<TagSubject, 'createdAt' | 'updatedAt'> & { id?: ID };
    }
  ): Promise<Result<{ subjectId: ID }>> {
    return this.service.upsertTagSubject(body);
  }

  @Post('list-tag-subjects')
  async listTagSubjects(
    @Body()
    body: {
      keyword?: string;
      type?: TagSubject['type'];
      page: PageRequest;
    }
  ): Promise<Result<PageResult<TagSubject>>> {
    return this.service.listTagSubjects(body);
  }

  @Post('get-subject-tags')
  async getSubjectTags(
    @Body() body: { subjectId: ID }
  ): Promise<Result<{ tagIds: ID[] }>> {
    return this.service.getSubjectTags(body);
  }

  // -------------------------
  // 血缘
  // -------------------------

  @Post('collect-lineage')
  async collectLineage(
    @Body() body: { scope: 'ETL' | 'SQL' | 'SERVICE'; since?: ISODateTime }
  ): Promise<Result<{ success: boolean }>> {
    return this.service.collectLineage(body);
  }

  @Post('get-lineage-graph')
  async getLineageGraph(
    @Body() body: { dataAssetId: ID }
  ): Promise<Result<LineageGraph>> {
    return this.service.getLineageGraph(body);
  }

  @Post('get-field-lineage-graph')
  async getFieldLineageGraph(
    @Body() body: { dataAssetId: ID; fieldName: string }
  ): Promise<Result<LineageGraph>> {
    return this.service.getFieldLineageGraph(body);
  }

  @Post('impact-analysis')
  async impactAnalysis(
    @Body() body: { dataAssetId: ID }
  ): Promise<Result<{ items: ImpactAnalysisItem[] }>> {
    return this.service.impactAnalysis(body);
  }

  @Post('export-impact-analysis')
  async exportImpactAnalysis(
    @Body() body: { dataAssetId: ID }
  ): Promise<Result<{ downloadUrl: string }>> {
    return this.service.exportImpactAnalysis(body);
  }

  @Post('get-execution')
  async getExecution(
    @Body() body: { executionId: ID }
  ): Promise<Result<TaskExecution>> {
    return this.service.getExecution(body);
  }
}
