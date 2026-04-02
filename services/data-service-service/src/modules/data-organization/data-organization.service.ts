import { Injectable } from '@nestjs/common';
import type {
  DataOrganizationClient,
  LayerDirectoryNode,
  ListAssetsByLayerRequest,
  PageResult,
  DataAsset,
  CreateMappingRequest,
  AssetMapping,
  UpdateMappingRequest,
  DeleteMappingRequest,
  ListMappingsRequest,
  GetMappingRequest,
  MappingPreviewRequest,
  MappingPreviewResponse,
  SubmitIngestionTaskRequest,
  SubmitIngestionTaskResponse,
  Result,
  TaskExecution,
  ID,
  DataLayerNode,
} from '@ai-datahub/contract';
import { okResult, errResult } from '@ai-datahub/contract';

import { InMemoryLayerDirectoryRepository } from './repositories/layer-directory.repository';
import { InMemoryAssetMappingRepository } from './repositories/asset-mapping.repository';
import { InMemoryExecutionRepository } from '../data-governance-ops/repositories/execution.repository';

@Injectable()
export class DataOrganizationService implements DataOrganizationClient {
  private readonly layerDirectoryRepo = new InMemoryLayerDirectoryRepository();
  private readonly assetMappingRepo = new InMemoryAssetMappingRepository();
  private readonly executionRepo = new InMemoryExecutionRepository();

  async listLayerDirectories(req: {
    meta?: { traceId?: string };
    layer: DataLayerNode;
    parentId?: ID;
  }): Promise<Result<LayerDirectoryNode[]>> {
    const directories = await this.layerDirectoryRepo.listByLayer(
      req.layer,
      req.parentId
    );
    return okResult(directories);
  }

  async createLayerDirectory(req: {
    meta?: { traceId?: string };
    node: Omit<LayerDirectoryNode, 'id' | 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ directoryId: ID }>> {
    const exists = await this.layerDirectoryRepo.existsByCode(
      req.node.code,
      req.node.layer,
      req.node.parentId
    );
    if (exists) {
      return errResult({
        code: 'DUPLICATE_NAME',
        message: 'Directory with this code already exists in this location',
        level: 'ERROR',
      });
    }
    const { id } = await this.layerDirectoryRepo.create(req.node);
    return okResult({ directoryId: id });
  }

  async updateLayerDirectory(req: {
    meta?: { traceId?: string };
    node: Omit<LayerDirectoryNode, 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ success: boolean }>> {
    const existing = await this.layerDirectoryRepo.findById(req.node.id);
    if (!existing) {
      return errResult({
        code: 'DIRECTORY_NOT_FOUND',
        message: 'Directory not found',
        level: 'ERROR',
      });
    }
    const exists = await this.layerDirectoryRepo.existsByCode(
      req.node.code,
      req.node.layer,
      req.node.parentId,
      req.node.id
    );
    if (exists) {
      return errResult({
        code: 'DUPLICATE_NAME',
        message: 'Directory with this code already exists in this location',
        level: 'ERROR',
      });
    }
    const success = await this.layerDirectoryRepo.update(req.node);
    if (!success) {
      return errResult({
        code: 'DIRECTORY_NOT_FOUND',
        message: 'Directory not found',
        level: 'ERROR',
      });
    }
    return okResult({ success: true });
  }

  async deleteLayerDirectory(req: {
    meta?: { traceId?: string };
    directoryId: ID;
  }): Promise<Result<{ success: boolean }>> {
    const success = await this.layerDirectoryRepo.delete(req.directoryId);
    if (!success) {
      return errResult({
        code: 'DIRECTORY_NOT_FOUND',
        message: 'Directory not found',
        level: 'ERROR',
      });
    }
    return okResult({ success: true });
  }

  async listAssetsByLayer(
    req: ListAssetsByLayerRequest
  ): Promise<Result<PageResult<DataAsset>>> {
    // In-memory implementation: returns empty page
    // In production, this would query metadata-service for assets by layer
    return okResult({
      items: [],
      total: 0,
      page: req.page.page,
      pageSize: req.page.pageSize,
    });
  }

  async createMapping(
    req: CreateMappingRequest
  ): Promise<Result<{ mappingId: ID }>> {
    const { id } = await this.assetMappingRepo.create(req.mapping);
    return okResult({ mappingId: id });
  }

  async updateMapping(
    req: UpdateMappingRequest
  ): Promise<Result<{ success: boolean }>> {
    const existing = await this.assetMappingRepo.findById(req.mapping.id);
    if (!existing) {
      return errResult({
        code: 'MAPPING_NOT_FOUND',
        message: 'Mapping not found',
        level: 'ERROR',
      });
    }
    const success = await this.assetMappingRepo.update(req.mapping);
    if (!success) {
      return errResult({
        code: 'MAPPING_NOT_FOUND',
        message: 'Mapping not found',
        level: 'ERROR',
      });
    }
    return okResult({ success: true });
  }

  async deleteMapping(
    req: DeleteMappingRequest
  ): Promise<Result<{ success: boolean }>> {
    const success = await this.assetMappingRepo.delete(req.mappingId);
    if (!success) {
      return errResult({
        code: 'MAPPING_NOT_FOUND',
        message: 'Mapping not found',
        level: 'ERROR',
      });
    }
    return okResult({ success: true });
  }

  async listMappings(
    req: ListMappingsRequest
  ): Promise<Result<PageResult<AssetMapping>>> {
    const result = await this.assetMappingRepo.list(
      req.fromAssetId,
      req.toAssetId,
      req.page
    );
    return okResult(result);
  }

  async getMapping(req: GetMappingRequest): Promise<Result<AssetMapping>> {
    const mapping = await this.assetMappingRepo.findById(req.mappingId);
    if (!mapping) {
      return errResult({
        code: 'MAPPING_NOT_FOUND',
        message: 'Mapping not found',
        level: 'ERROR',
      });
    }
    return okResult(mapping);
  }

  async previewMapping(
    _req: MappingPreviewRequest
  ): Promise<Result<MappingPreviewResponse>> {
    // In-memory implementation: returns empty preview
    // In production, this would query the source and return sample data
    return okResult({
      columns: [],
      rows: [],
    });
  }

  async submitIngestionTask(
    req: SubmitIngestionTaskRequest
  ): Promise<Result<SubmitIngestionTaskResponse>> {
    // In-memory implementation: creates a successful execution
    const now = new Date().toISOString();
    const execution: Omit<TaskExecution, 'id'> = {
      taskId: req.mappingId,
      status: 'SUCCESS',
      triggerType: 'MANUAL',
      startedAt: now,
      endedAt: now,
    };
    const { executionId } = await this.executionRepo.create(execution);
    return okResult({ taskExecutionId: executionId });
  }

  async getTaskExecution(req: {
    meta?: { traceId?: string };
    taskExecutionId: ID;
  }): Promise<Result<TaskExecution>> {
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
