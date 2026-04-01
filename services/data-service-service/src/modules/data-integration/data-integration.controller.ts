import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import type {
  Result,
  DataSource,
  ColumnMetadata,
  TaskExecution,
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
    return this.service.createDataSource(req);
  }

  @Post('update-data-source')
  @ApiBody({ type: UpdateDataSourceRequestDto })
  updateDataSource(
    @Body() req: UpdateDataSourceRequestDto
  ): Promise<Result<DataSource>> {
    return this.service.updateDataSource(req);
  }

  @Post('delete-data-source')
  @ApiBody({ type: DeleteDataSourceRequestDto })
  deleteDataSource(
    @Body() req: DeleteDataSourceRequestDto
  ): Promise<Result<{ success: boolean }>> {
    return this.service.deleteDataSource(req);
  }

  @Post('test-connection')
  @ApiBody({ type: TestConnectionRequestDto })
  testConnection(
    @Body() req: TestConnectionRequestDto
  ): Promise<Result<ConnectionTestResultDto>> {
    return this.service.testConnection(req);
  }

  @Post('list-data-sources')
  @ApiBody({ type: ListDataSourcesRequestDto })
  listDataSources(
    @Body() req: ListDataSourcesRequestDto
  ): Promise<Result<DataSource[]>> {
    return this.service.listDataSources(req);
  }

  @Post('collect-initial-metadata')
  @ApiBody({ type: CollectMetadataRequestDto })
  collectInitialMetadata(
    @Body() req: CollectMetadataRequestDto
  ): Promise<Result<ColumnMetadata[]>> {
    return this.service.collectInitialMetadata(req);
  }

  @Post('submit-access-task')
  @ApiBody({ type: SubmitAccessTaskRequestDto })
  submitAccessTask(
    @Body() req: SubmitAccessTaskRequestDto
  ): Promise<Result<{ taskId: string }>> {
    return this.service.submitAccessTask(req);
  }

  @Post('profile-data')
  @ApiBody({ type: ProfileDataRequestDto })
  profileData(
    @Body() req: ProfileDataRequestDto
  ): Promise<Result<Record<string, unknown>>> {
    return this.service.profileData(req);
  }

  @Post('preview-data')
  @ApiBody({ type: PreviewDataRequestDto })
  previewData(
    @Body() req: PreviewDataRequestDto
  ): Promise<Result<{ rows: Record<string, unknown>[] }>> {
    return this.service.previewData(req);
  }

  @Post('execute-sql')
  @ApiBody({ type: ExecuteSqlRequestDto })
  executeSql(
    @Body() req: ExecuteSqlRequestDto
  ): Promise<Result<{ rows: Record<string, unknown>[]; rowCount: number }>> {
    return this.service.executeSql(req);
  }

  @Post('get-task-execution')
  @ApiBody({ type: GetTaskExecutionRequestDto })
  getTaskExecution(
    @Body() req: GetTaskExecutionRequestDto
  ): Promise<Result<TaskExecution>> {
    return this.service.getTaskExecution(req);
  }
}
