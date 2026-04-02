import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import type {
  Result,
  DataSource,
  ColumnMetadata,
  TaskExecution,
  ProfilingResult,
  PreviewDataResponse,
  ExecuteSqlResponse,
  DataSourceType,
} from '@ai-datahub/contract';
import {
  CreateDataSourceRequestDto,
  UpdateDataSourceRequestDto,
  DeleteDataSourceRequestDto,
  TestConnectionRequestDto,
  ConnectionTestResultDto,
  ListDataSourcesRequestDto,
  CollectMetadataRequestDto,
  SubmitAccessTaskRequestDto,
  ProfileDataRequestDto,
  PreviewDataRequestDto,
  ExecuteSqlRequestDto,
  GetTaskExecutionRequestDto,
} from '@ai-datahub/contract';

import { DataIntegrationService } from './data-integration.service';

@ApiTags('DataIntegration')
@Controller('api/data-integration')
export class DataIntegrationController {
  constructor(private readonly service: DataIntegrationService) {}

  @Post('create-data-source')
  @ApiBody({ type: CreateDataSourceRequestDto })
  createDataSource(
    @Body() req: CreateDataSourceRequestDto
  ): Promise<Result<DataSource>> {
    const type: DataSourceType = req.type as unknown as DataSourceType;
    return this.service.createDataSource({
      meta: req.meta,
      dataSource: {
        name: req.name,
        type,
        jdbcUrl: '', // Not in DTO - TODO: add to DTO
        username: req.username,
        passwordRef: req.password, // TODO: should be passwordRef
        driverClass: '', // Not in DTO - TODO: add to DTO
        orgId: '', // TODO: add orgId to DTO
        projectId: undefined,
        description: undefined,
        status: 'ENABLED',
      },
    });
  }

  @Post('update-data-source')
  @ApiBody({ type: UpdateDataSourceRequestDto })
  updateDataSource(
    @Body() req: UpdateDataSourceRequestDto
  ): Promise<Result<DataSource>> {
    const anyReq = req as unknown as Record<string, unknown>;
    const type: DataSourceType | undefined =
      anyReq['type'] !== undefined
        ? (anyReq['type'] as unknown as DataSourceType)
        : undefined;
    return this.service.updateDataSource({
      meta: req.meta,
      dataSource: {
        id: req.id,
        name: req.name ?? '',
        type: type as DataSourceType,
        jdbcUrl: '',
        username: req.username ?? '',
        passwordRef: req.password,
        driverClass: '',
        orgId: '',
        projectId: undefined,
        description: undefined,
        status: 'ENABLED',
      },
    });
  }

  @Post('delete-data-source')
  @ApiBody({ type: DeleteDataSourceRequestDto })
  deleteDataSource(
    @Body() req: DeleteDataSourceRequestDto
  ): Promise<Result<{ success: boolean }>> {
    return this.service.deleteDataSource({
      meta: req.meta,
      dataSourceId: req.id,
    });
  }

  @Post('test-connection')
  @ApiBody({ type: TestConnectionRequestDto })
  testConnection(
    @Body() req: TestConnectionRequestDto
  ): Promise<Result<ConnectionTestResultDto>> {
    const type: DataSourceType = req.type as unknown as DataSourceType;
    return this.service.testConnection({
      meta: req.meta,
      dataSource: {
        type,
        name: '',
        jdbcUrl: '',
        username: req.username,
        passwordRef: req.password,
        driverClass: '',
        orgId: '',
        projectId: undefined,
        description: undefined,
        status: 'ENABLED',
      },
    });
  }

  @Post('list-data-sources')
  @ApiBody({ type: ListDataSourcesRequestDto })
  listDataSources(
    @Body() req: ListDataSourcesRequestDto
  ): Promise<Result<DataSource[]>> {
    return this.service.listDataSources({
      meta: req.meta,
      orgId: '',
      keyword: undefined,
      projectId: undefined,
    });
  }

  @Post('collect-initial-metadata')
  @ApiBody({ type: CollectMetadataRequestDto })
  collectInitialMetadata(
    @Body() req: CollectMetadataRequestDto
  ): Promise<Result<ColumnMetadata[]>> {
    return this.service.collectInitialMetadata({
      meta: req.meta,
      dataSourceId: req.dataSourceId,
    });
  }

  @Post('submit-access-task')
  @ApiBody({ type: SubmitAccessTaskRequestDto })
  submitAccessTask(
    @Body() req: SubmitAccessTaskRequestDto
  ): Promise<Result<{ taskExecutionId: string }>> {
    return this.service.submitAccessTask({
      meta: req.meta,
      task: {
        name: '',
        orgId: '',
        projectId: undefined,
        dataSourceId: req.dataAssetId,
        config: req.conditions || {},
        schedule: undefined,
        priority: undefined,
      },
    });
  }

  @Post('profile-data')
  @ApiBody({ type: ProfileDataRequestDto })
  profileData(
    @Body() req: ProfileDataRequestDto
  ): Promise<Result<ProfilingResult>> {
    return this.service.profileData({
      meta: req.meta,
      dataSourceId: req.dataAssetId,
      tableName: '',
      sampleSize: undefined,
    });
  }

  @Post('preview-data')
  @ApiBody({ type: PreviewDataRequestDto })
  previewData(
    @Body() req: PreviewDataRequestDto
  ): Promise<Result<PreviewDataResponse>> {
    return this.service.previewData({
      meta: req.meta,
      dataAssetId: req.dataAssetId,
      limit: req.limit || 100,
    });
  }

  @Post('execute-sql')
  @ApiBody({ type: ExecuteSqlRequestDto })
  executeSql(
    @Body() req: ExecuteSqlRequestDto
  ): Promise<Result<ExecuteSqlResponse>> {
    return this.service.executeSql({
      meta: req.meta,
      sql: req.sql,
      projectId: '',
      isTest: false,
    });
  }

  @Post('get-task-execution')
  @ApiBody({ type: GetTaskExecutionRequestDto })
  getTaskExecution(
    @Body() req: GetTaskExecutionRequestDto
  ): Promise<Result<TaskExecution>> {
    return this.service.getTaskExecution({
      meta: req.meta,
      taskExecutionId: req.executionId,
    });
  }
}
