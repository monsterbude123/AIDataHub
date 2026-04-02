import { Controller, Post, Body } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
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
import type { RequestMeta } from '@ai-datahub/contract';

import { DataGovernanceOpsService } from './data-governance-ops.service';

@ApiTags('DataGovernanceOps')
@Controller('api/governance-ops')
export class DataGovernanceOpsController {
  constructor(private readonly service: DataGovernanceOpsService) {}

  // -------------------------
  // 质量管理
  // -------------------------

  @Post('get-quality-approval-switch')
  @ApiBody({})
  async getQualityApprovalSwitch(
    @Body() body: { meta?: RequestMeta }
  ): Promise<Result<QualityApprovalSwitch>> {
    return this.service.getQualityApprovalSwitch({
      meta: body.meta,
    });
  }

  @Post('set-quality-approval-switch')
  @ApiBody({})
  async setQualityApprovalSwitch(
    @Body()
    body: {
      meta?: RequestMeta;
      ruleApprovalEnabled?: boolean;
      taskApprovalEnabled?: boolean;
    }
  ): Promise<Result<{ success: boolean }>> {
    return this.service.setQualityApprovalSwitch({
      meta: body.meta,
      ruleApprovalEnabled: body.ruleApprovalEnabled,
      taskApprovalEnabled: body.taskApprovalEnabled,
    });
  }

  @Post('create-quality-rule')
  @ApiBody({})
  async createQualityRule(
    @Body()
    body: {
      meta?: RequestMeta;
      rule: Omit<QualityRule, 'id' | 'createdAt' | 'updatedAt'>;
    }
  ): Promise<Result<{ ruleId: ID }>> {
    return this.service.createQualityRule({
      meta: body.meta,
      rule: body.rule,
    });
  }

  @Post('update-quality-rule')
  @ApiBody({})
  async updateQualityRule(
    @Body()
    body: {
      meta?: RequestMeta;
      rule: Omit<QualityRule, 'createdAt' | 'updatedAt'>;
    }
  ): Promise<Result<{ success: boolean }>> {
    return this.service.updateQualityRule({
      meta: body.meta,
      rule: body.rule,
    });
  }

  @Post('delete-quality-rule')
  @ApiBody({})
  async deleteQualityRule(
    @Body() body: { meta?: RequestMeta; ruleId: ID }
  ): Promise<Result<{ success: boolean }>> {
    return this.service.deleteQualityRule({
      meta: body.meta,
      ruleId: body.ruleId,
    });
  }

  @Post('list-quality-rules')
  @ApiBody({})
  async listQualityRules(
    @Body() body: { meta?: RequestMeta; keyword?: string; page: PageRequest }
  ): Promise<Result<PageResult<QualityRule>>> {
    return this.service.listQualityRules({
      meta: body.meta,
      keyword: body.keyword,
      page: body.page,
    });
  }

  @Post('create-quality-task')
  @ApiBody({})
  async createQualityTask(
    @Body()
    body: {
      meta?: RequestMeta;
      task: Omit<QualityTask, 'id' | 'createdAt' | 'updatedAt'>;
    }
  ): Promise<Result<{ taskId: ID }>> {
    return this.service.createQualityTask({
      meta: body.meta,
      task: body.task,
    });
  }

  @Post('update-quality-task')
  @ApiBody({})
  async updateQualityTask(
    @Body()
    body: {
      meta?: RequestMeta;
      task: Omit<QualityTask, 'createdAt' | 'updatedAt'>;
    }
  ): Promise<Result<{ success: boolean }>> {
    return this.service.updateQualityTask({
      meta: body.meta,
      task: body.task,
    });
  }

  @Post('delete-quality-task')
  @ApiBody({})
  async deleteQualityTask(
    @Body() body: { meta?: RequestMeta; taskId: ID }
  ): Promise<Result<{ success: boolean }>> {
    return this.service.deleteQualityTask({
      meta: body.meta,
      taskId: body.taskId,
    });
  }

  @Post('run-quality-task')
  @ApiBody({})
  async runQualityTask(
    @Body() body: { meta?: RequestMeta; taskId: ID }
  ): Promise<Result<{ executionId: ID }>> {
    return this.service.runQualityTask({
      meta: body.meta,
      taskId: body.taskId,
    });
  }

  @Post('list-quality-tasks')
  @ApiBody({})
  async listQualityTasks(
    @Body() body: { meta?: RequestMeta; page: PageRequest }
  ): Promise<Result<PageResult<QualityTask>>> {
    return this.service.listQualityTasks({
      meta: body.meta,
      page: body.page,
    });
  }

  @Post('get-quality-report')
  @ApiBody({})
  async getQualityReport(
    @Body() body: { meta?: RequestMeta; reportId: ID }
  ): Promise<Result<QualityReport>> {
    return this.service.getQualityReport({
      meta: body.meta,
      reportId: body.reportId,
    });
  }

  @Post('list-quality-reports')
  @ApiBody({})
  async listQualityReports(
    @Body() body: { meta?: RequestMeta; taskId: ID; page: PageRequest }
  ): Promise<Result<PageResult<QualityReport>>> {
    return this.service.listQualityReports({
      meta: body.meta,
      taskId: body.taskId,
      page: body.page,
    });
  }

  @Post('preview-quality-issues')
  @ApiBody({})
  async previewQualityIssues(
    @Body() body: { meta?: RequestMeta; reportId: ID; page: PageRequest }
  ): Promise<Result<PageResult<QualityIssue>>> {
    return this.service.previewQualityIssues({
      meta: body.meta,
      reportId: body.reportId,
      page: body.page,
    });
  }

  @Post('create-quality-ticket')
  @ApiBody({})
  async createQualityTicket(
    @Body()
    body: {
      meta?: RequestMeta;
      reportId: ID;
      assigneeUserId: ID;
      title: string;
      description?: string;
    }
  ): Promise<Result<{ ticketId: ID }>> {
    return this.service.createQualityTicket({
      meta: body.meta,
      reportId: body.reportId,
      assigneeUserId: body.assigneeUserId,
      title: body.title,
      description: body.description,
    });
  }

  @Post('update-quality-ticket')
  @ApiBody({})
  async updateQualityTicket(
    @Body()
    body: {
      meta?: RequestMeta;
      ticketId: ID;
      status?: QualityTicket['status'];
      description?: string;
    }
  ): Promise<Result<{ success: boolean }>> {
    return this.service.updateQualityTicket({
      meta: body.meta,
      ticketId: body.ticketId,
      status: body.status,
      description: body.description,
    });
  }

  @Post('list-my-quality-tickets')
  @ApiBody({})
  async listMyQualityTickets(
    @Body() body: { meta?: RequestMeta; assigneeUserId: ID; page: PageRequest }
  ): Promise<Result<PageResult<QualityTicket>>> {
    return this.service.listMyQualityTickets({
      meta: body.meta,
      assigneeUserId: body.assigneeUserId,
      page: body.page,
    });
  }

  @Post('get-quality-stats')
  @ApiBody({})
  async getQualityStats(
    @Body()
    body: {
      meta?: RequestMeta;
      startAt: ISODateTime;
      endAt: ISODateTime;
    }
  ): Promise<
    Result<{
      totalAssets?: number;
      totalRecords?: number;
      problemRecords?: number;
      problemRatio?: number;
    }>
  > {
    return this.service.getQualityStats({
      meta: body.meta,
      startAt: body.startAt,
      endAt: body.endAt,
    });
  }

  // -------------------------
  // 标签管理
  // -------------------------

  @Post('list-tag-categories')
  @ApiBody({})
  async listTagCategories(
    @Body() body: { meta?: RequestMeta; parentId?: ID }
  ): Promise<Result<TagCategoryNode[]>> {
    return this.service.listTagCategories({
      meta: body.meta,
      parentId: body.parentId,
    });
  }

  @Post('create-tag-category')
  @ApiBody({})
  async createTagCategory(
    @Body()
    body: {
      meta?: RequestMeta;
      node: Omit<TagCategoryNode, 'id' | 'createdAt' | 'updatedAt'>;
    }
  ): Promise<Result<{ categoryId: ID }>> {
    return this.service.createTagCategory({
      meta: body.meta,
      node: body.node,
    });
  }

  @Post('update-tag-category')
  @ApiBody({})
  async updateTagCategory(
    @Body()
    body: {
      meta?: RequestMeta;
      node: Omit<TagCategoryNode, 'createdAt' | 'updatedAt'>;
    }
  ): Promise<Result<{ success: boolean }>> {
    return this.service.updateTagCategory({
      meta: body.meta,
      node: body.node,
    });
  }

  @Post('delete-tag-category')
  @ApiBody({})
  async deleteTagCategory(
    @Body() body: { meta?: RequestMeta; categoryId: ID }
  ): Promise<Result<{ success: boolean }>> {
    return this.service.deleteTagCategory({
      meta: body.meta,
      categoryId: body.categoryId,
    });
  }

  @Post('create-tag')
  @ApiBody({})
  async createTag(
    @Body() body: { meta?: RequestMeta; tag: Omit<Tag, 'id' | 'createdAt'> }
  ): Promise<Result<{ tagId: ID }>> {
    return this.service.createTag({
      meta: body.meta,
      tag: body.tag,
    });
  }

  @Post('update-tag')
  @ApiBody({})
  async updateTag(
    @Body() body: { meta?: RequestMeta; tag: Omit<Tag, 'createdAt'> }
  ): Promise<Result<{ success: boolean }>> {
    return this.service.updateTag({
      meta: body.meta,
      tag: body.tag,
    });
  }

  @Post('delete-tag')
  @ApiBody({})
  async deleteTag(
    @Body() body: { meta?: RequestMeta; tagId: ID }
  ): Promise<Result<{ success: boolean }>> {
    return this.service.deleteTag({
      meta: body.meta,
      tagId: body.tagId,
    });
  }

  @Post('query-tags')
  @ApiBody({})
  async queryTags(
    @Body() body: { meta?: RequestMeta; keyword?: string; page: PageRequest }
  ): Promise<Result<PageResult<Tag>>> {
    return this.service.queryTags({
      meta: body.meta,
      keyword: body.keyword,
      page: body.page,
    });
  }

  @Post('create-tag-rule')
  @ApiBody({})
  async createTagRule(
    @Body()
    body: {
      meta?: RequestMeta;
      rule: Omit<TagRule, 'id' | 'createdAt' | 'updatedAt'>;
    }
  ): Promise<Result<{ ruleId: ID }>> {
    return this.service.createTagRule({
      meta: body.meta,
      rule: body.rule,
    });
  }

  @Post('update-tag-rule')
  @ApiBody({})
  async updateTagRule(
    @Body()
    body: {
      meta?: RequestMeta;
      rule: Omit<TagRule, 'createdAt' | 'updatedAt'>;
    }
  ): Promise<Result<{ success: boolean }>> {
    return this.service.updateTagRule({
      meta: body.meta,
      rule: body.rule,
    });
  }

  @Post('delete-tag-rule')
  @ApiBody({})
  async deleteTagRule(
    @Body() body: { meta?: RequestMeta; ruleId: ID }
  ): Promise<Result<{ success: boolean }>> {
    return this.service.deleteTagRule({
      meta: body.meta,
      ruleId: body.ruleId,
    });
  }

  @Post('list-tag-rules')
  @ApiBody({})
  async listTagRules(
    @Body() body: { meta?: RequestMeta; tagId?: ID; page: PageRequest }
  ): Promise<Result<PageResult<TagRule>>> {
    return this.service.listTagRules({
      meta: body.meta,
      tagId: body.tagId,
      page: body.page,
    });
  }

  @Post('create-tag-task')
  @ApiBody({})
  async createTagTask(
    @Body()
    body: {
      meta?: RequestMeta;
      task: Omit<TagTask, 'id' | 'createdAt' | 'updatedAt'>;
    }
  ): Promise<Result<{ taskId: ID }>> {
    return this.service.createTagTask({
      meta: body.meta,
      task: body.task,
    });
  }

  @Post('update-tag-task')
  @ApiBody({})
  async updateTagTask(
    @Body()
    body: {
      meta?: RequestMeta;
      task: Omit<TagTask, 'createdAt' | 'updatedAt'>;
    }
  ): Promise<Result<{ success: boolean }>> {
    return this.service.updateTagTask({
      meta: body.meta,
      task: body.task,
    });
  }

  @Post('delete-tag-task')
  @ApiBody({})
  async deleteTagTask(
    @Body() body: { meta?: RequestMeta; taskId: ID }
  ): Promise<Result<{ success: boolean }>> {
    return this.service.deleteTagTask({
      meta: body.meta,
      taskId: body.taskId,
    });
  }

  @Post('run-tag-task')
  @ApiBody({})
  async runTagTask(
    @Body() body: { meta?: RequestMeta; taskId: ID }
  ): Promise<Result<{ executionId: ID }>> {
    return this.service.runTagTask({
      meta: body.meta,
      taskId: body.taskId,
    });
  }

  @Post('list-tag-tasks')
  @ApiBody({})
  async listTagTasks(
    @Body() body: { meta?: RequestMeta; tagId?: ID; page: PageRequest }
  ): Promise<Result<PageResult<TagTask>>> {
    return this.service.listTagTasks({
      meta: body.meta,
      tagId: body.tagId,
      page: body.page,
    });
  }

  @Post('query-tag-data')
  @ApiBody({})
  async queryTagData(
    @Body() body: { meta?: RequestMeta; query: TagQuery; page: PageRequest }
  ): Promise<Result<PageResult<TagQueryResultItem>>> {
    return this.service.queryTagData({
      meta: body.meta,
      query: body.query,
      page: body.page,
    });
  }

  @Post('upsert-tag-subject')
  @ApiBody({})
  async upsertTagSubject(
    @Body()
    body: {
      meta?: RequestMeta;
      subject: Omit<TagSubject, 'createdAt' | 'updatedAt'> & { id?: ID };
    }
  ): Promise<Result<{ subjectId: ID }>> {
    return this.service.upsertTagSubject({
      meta: body.meta,
      subject: body.subject,
    });
  }

  @Post('list-tag-subjects')
  @ApiBody({})
  async listTagSubjects(
    @Body()
    body: {
      meta?: RequestMeta;
      keyword?: string;
      type?: TagSubject['type'];
      page: PageRequest;
    }
  ): Promise<Result<PageResult<TagSubject>>> {
    return this.service.listTagSubjects({
      meta: body.meta,
      keyword: body.keyword,
      type: body.type,
      page: body.page,
    });
  }

  @Post('get-subject-tags')
  @ApiBody({})
  async getSubjectTags(
    @Body() body: { meta?: RequestMeta; subjectId: ID }
  ): Promise<Result<{ tagIds: ID[] }>> {
    return this.service.getSubjectTags({
      meta: body.meta,
      subjectId: body.subjectId,
    });
  }

  // -------------------------
  // 血缘
  // -------------------------

  @Post('collect-lineage')
  @ApiBody({})
  async collectLineage(
    @Body()
    body: {
      meta?: RequestMeta;
      scope: 'ETL' | 'SQL' | 'SERVICE';
      since?: ISODateTime;
    }
  ): Promise<Result<{ success: boolean }>> {
    return this.service.collectLineage({
      meta: body.meta,
      scope: body.scope,
      since: body.since,
    });
  }

  @Post('get-lineage-graph')
  @ApiBody({})
  async getLineageGraph(
    @Body() body: { meta?: RequestMeta; dataAssetId: ID }
  ): Promise<Result<LineageGraph>> {
    return this.service.getLineageGraph({
      meta: body.meta,
      dataAssetId: body.dataAssetId,
    });
  }

  @Post('get-field-lineage-graph')
  @ApiBody({})
  async getFieldLineageGraph(
    @Body() body: { meta?: RequestMeta; dataAssetId: ID; fieldName: string }
  ): Promise<Result<LineageGraph>> {
    return this.service.getFieldLineageGraph({
      meta: body.meta,
      dataAssetId: body.dataAssetId,
      fieldName: body.fieldName,
    });
  }

  @Post('impact-analysis')
  @ApiBody({})
  async impactAnalysis(
    @Body() body: { meta?: RequestMeta; dataAssetId: ID }
  ): Promise<Result<{ items: ImpactAnalysisItem[] }>> {
    return this.service.impactAnalysis({
      meta: body.meta,
      dataAssetId: body.dataAssetId,
    });
  }

  @Post('export-impact-analysis')
  @ApiBody({})
  async exportImpactAnalysis(
    @Body() body: { meta?: RequestMeta; dataAssetId: ID }
  ): Promise<Result<{ downloadUrl: string }>> {
    return this.service.exportImpactAnalysis({
      meta: body.meta,
      dataAssetId: body.dataAssetId,
    });
  }

  @Post('get-execution')
  @ApiBody({})
  async getExecution(
    @Body() body: { meta?: RequestMeta; executionId: ID }
  ): Promise<Result<TaskExecution>> {
    return this.service.getExecution({
      meta: body.meta,
      executionId: body.executionId,
    });
  }
}
