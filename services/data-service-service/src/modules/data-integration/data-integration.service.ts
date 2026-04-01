import { Injectable } from '@nestjs/common';
import type {
  DataIntegrationClient,
  CreateDataSourceRequest,
  UpdateDataSourceRequest,
  DeleteDataSourceRequest,
  TestConnectionRequest,
  TestConnectionResponse,
  ListDataSourcesRequest,
  CollectInitialMetadataRequest,
  SubmitAccessTaskRequest,
  SubmitAccessTaskResponse,
  ProfileDataRequest,
  ProfilingResult,
  PreviewDataRequest,
  PreviewDataResponse,
  ExecuteSqlRequest,
  ExecuteSqlResponse,
  GetTaskExecutionRequest,
  Result,
  DataSource,
  ColumnMetadata,
  TaskExecution,
} from '@ai-datahub/contract';
import { okResult, errResult } from '@ai-datahub/contract';

import { InMemoryDataSourceRepository } from './repositories/data-source.repository';
import { InMemoryExecutionRepository } from '../data-governance-ops/repositories/execution.repository';

@Injectable()
export class DataIntegrationService implements DataIntegrationClient {
  private readonly dataSourceRepo = new InMemoryDataSourceRepository();
  private readonly executionRepo = new InMemoryExecutionRepository();

  async createDataSource(
    req: CreateDataSourceRequest
  ): Promise<Result<DataSource>> {
    const exists = await this.dataSourceRepo.existsByName(
      req.dataSource.name,
      req.dataSource.orgId
    );
    if (exists) {
      return errResult({
        code: 'DATA_SOURCE_NAME_DUPLICATE',
        message: 'Data source with this name already exists',
        level: 'ERROR',
      });
    }
    const { id } = await this.dataSourceRepo.create(req.dataSource);
    const created = await this.dataSourceRepo.findById(id);
    return okResult(created!);
  }

  async updateDataSource(
    req: UpdateDataSourceRequest
  ): Promise<Result<DataSource>> {
    const existing = await this.dataSourceRepo.findById(req.dataSource.id);
    if (!existing) {
      return errResult({
        code: 'DATA_SOURCE_NOT_FOUND',
        message: 'Data source not found',
        level: 'ERROR',
      });
    }
    const exists = await this.dataSourceRepo.existsByName(
      req.dataSource.name,
      req.dataSource.orgId,
      req.dataSource.id
    );
    if (exists) {
      return errResult({
        code: 'DATA_SOURCE_NAME_DUPLICATE',
        message: 'Data source with this name already exists',
        level: 'ERROR',
      });
    }
    const success = await this.dataSourceRepo.update(req.dataSource);
    if (!success) {
      return errResult({
        code: 'DATA_SOURCE_NOT_FOUND',
        message: 'Data source not found',
        level: 'ERROR',
      });
    }
    const updated = await this.dataSourceRepo.findById(req.dataSource.id);
    return okResult(updated!);
  }

  async deleteDataSource(
    req: DeleteDataSourceRequest
  ): Promise<Result<{ success: boolean }>> {
    const success = await this.dataSourceRepo.delete(req.dataSourceId);
    if (!success) {
      return errResult({
        code: 'DATA_SOURCE_NOT_FOUND',
        message: 'Data source not found',
        level: 'ERROR',
      });
    }
    return okResult({ success: true });
  }

  async testConnection(
    _req: TestConnectionRequest
  ): Promise<Result<TestConnectionResponse>> {
    // In-memory implementation: always succeeds for demo purposes
    // In production, this would actually test the connection
    const now = new Date().toISOString();
    return okResult({
      success: true,
      message: 'Connection test successful',
      checkedAt: now,
    });
  }

  async listDataSources(
    req: ListDataSourcesRequest
  ): Promise<Result<DataSource[]>> {
    const dataSources = await this.dataSourceRepo.list(
      req.orgId,
      req.keyword,
      req.projectId
    );
    return okResult(dataSources);
  }

  async collectInitialMetadata(
    _req: CollectInitialMetadataRequest
  ): Promise<Result<ColumnMetadata[]>> {
    // In-memory implementation: returns empty metadata
    // In production, this would connect and read schema
    return okResult([]);
  }

  async submitAccessTask(
    _req: SubmitAccessTaskRequest
  ): Promise<Result<SubmitAccessTaskResponse>> {
    // In-memory implementation: creates a successful execution
    const now = new Date().toISOString();
    const execution: Omit<TaskExecution, 'id'> = {
      taskId: '',
      status: 'SUCCESS',
      triggerType: 'MANUAL',
      startedAt: now,
      endedAt: now,
    };
    const { executionId } = await this.executionRepo.create(execution);
    return okResult({ taskExecutionId: executionId });
  }

  async profileData(
    _req: ProfileDataRequest
  ): Promise<Result<ProfilingResult>> {
    // In-memory implementation: returns empty profiling result
    return okResult({
      tableName: _req.tableName,
      metrics: [],
      sampleRows: [],
    });
  }

  async previewData(
    _req: PreviewDataRequest
  ): Promise<Result<PreviewDataResponse>> {
    // In-memory implementation: returns empty preview
    return okResult({
      columns: [],
      rows: [],
    });
  }

  async executeSql(
    _req: ExecuteSqlRequest
  ): Promise<Result<ExecuteSqlResponse>> {
    // In-memory implementation: returns empty result
    return okResult({
      columns: [],
      rows: [],
      rowCount: 0,
      isTruncated: false,
    });
  }

  async getTaskExecution(
    req: GetTaskExecutionRequest
  ): Promise<Result<TaskExecution>> {
    const execution = await this.executionRepo.getById(req.taskExecutionId);
    if (!execution) {
      return errResult({
        code: 'EXECUTION_NOT_FOUND',
        message: 'Task execution not found',
        level: 'ERROR',
      });
    }
    return okResult(execution);
  }
}
