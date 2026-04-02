import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import type {
  Result,
  LayerDirectoryNode,
  PageResult,
  DataAsset,
  AssetMapping,
  MappingPreviewResponse,
  SubmitIngestionTaskResponse,
  TaskExecution,
  ID,
} from '@ai-datahub/contract';
import {
  ListLayerDirectoriesRequestDto,
  CreateLayerDirectoryRequestDto,
  UpdateLayerDirectoryRequestDto,
  DeleteLayerDirectoryRequestDto,
  ListAssetsByLayerRequestDto,
  CreateMappingRequestDto,
  UpdateMappingRequestDto,
  DeleteMappingRequestDto,
  ListMappingsRequestDto,
  GetMappingRequestDto,
  PreviewMappingRequestDto,
  SubmitIngestionTaskRequestDto,
  GetTaskExecutionRequestDto,
} from '@ai-datahub/contract';

import { DataOrganizationService } from './data-organization.service';

@ApiTags('DataOrganization')
@Controller('api/data-organization')
export class DataOrganizationController {
  constructor(private readonly service: DataOrganizationService) {}

  @Post('list-layer-directories')
  @ApiBody({ type: ListLayerDirectoriesRequestDto })
  listLayerDirectories(
    @Body() req: ListLayerDirectoriesRequestDto
  ): Promise<Result<LayerDirectoryNode[]>> {
    return this.service.listLayerDirectories({
      layer: req.layer,
      parentId: req.parentId,
      meta: req.meta,
    });
  }

  @Post('create-layer-directory')
  @ApiBody({ type: CreateLayerDirectoryRequestDto })
  createLayerDirectory(
    @Body() req: CreateLayerDirectoryRequestDto
  ): Promise<Result<{ directoryId: ID }>> {
    return this.service.createLayerDirectory({
      node: {
        layer: req.layer,
        parentId: req.parentId,
        name: req.name,
        code: req.code,
        sort: req.sort,
      },
      meta: req.meta,
    });
  }

  @Post('update-layer-directory')
  @ApiBody({ type: UpdateLayerDirectoryRequestDto })
  updateLayerDirectory(
    @Body() req: UpdateLayerDirectoryRequestDto
  ): Promise<Result<{ success: boolean }>> {
    return this.service.updateLayerDirectory({
      node: {
        id: req.id,
        layer: req.layer,
        parentId: req.parentId,
        name: req.name,
        code: req.code,
        sort: req.sort,
      },
      meta: req.meta,
    });
  }

  @Post('delete-layer-directory')
  @ApiBody({ type: DeleteLayerDirectoryRequestDto })
  deleteLayerDirectory(
    @Body() req: DeleteLayerDirectoryRequestDto
  ): Promise<Result<{ success: boolean }>> {
    return this.service.deleteLayerDirectory({
      directoryId: req.directoryId,
      meta: req.meta,
    });
  }

  @Post('list-assets-by-layer')
  @ApiBody({ type: ListAssetsByLayerRequestDto })
  listAssetsByLayer(
    @Body() req: ListAssetsByLayerRequestDto
  ): Promise<Result<PageResult<DataAsset>>> {
    return this.service.listAssetsByLayer({
      layer: req.layer,
      keyword: req.keyword,
      page: {
        page: req.page,
        pageSize: req.pageSize,
      },
      meta: req.meta,
    });
  }

  @Post('create-mapping')
  @ApiBody({ type: CreateMappingRequestDto })
  createMapping(
    @Body() req: CreateMappingRequestDto
  ): Promise<Result<{ mappingId: ID }>> {
    return this.service.createMapping({
      mapping: {
        fromAssetId: req.fromAssetId,
        toAssetId: req.toAssetId,
        fieldMappings: req.fieldMappings,
      },
      meta: req.meta,
    });
  }

  @Post('update-mapping')
  @ApiBody({ type: UpdateMappingRequestDto })
  updateMapping(
    @Body() req: UpdateMappingRequestDto
  ): Promise<Result<{ success: boolean }>> {
    return this.service.updateMapping({
      mapping: {
        id: req.id,
        fromAssetId: req.fromAssetId,
        toAssetId: req.toAssetId,
        fieldMappings: req.fieldMappings,
      },
      meta: req.meta,
    });
  }

  @Post('delete-mapping')
  @ApiBody({ type: DeleteMappingRequestDto })
  deleteMapping(
    @Body() req: DeleteMappingRequestDto
  ): Promise<Result<{ success: boolean }>> {
    return this.service.deleteMapping({
      mappingId: req.mappingId,
      meta: req.meta,
    });
  }

  @Post('list-mappings')
  @ApiBody({ type: ListMappingsRequestDto })
  listMappings(
    @Body() req: ListMappingsRequestDto
  ): Promise<Result<PageResult<AssetMapping>>> {
    return this.service.listMappings({
      fromAssetId: req.fromAssetId,
      toAssetId: req.toAssetId,
      page: {
        page: req.page,
        pageSize: req.pageSize,
      },
      meta: req.meta,
    });
  }

  @Post('get-mapping')
  @ApiBody({ type: GetMappingRequestDto })
  getMapping(@Body() req: GetMappingRequestDto): Promise<Result<AssetMapping>> {
    return this.service.getMapping({
      mappingId: req.mappingId,
      meta: req.meta,
    });
  }

  @Post('preview-mapping')
  @ApiBody({ type: PreviewMappingRequestDto })
  previewMapping(
    @Body() req: PreviewMappingRequestDto
  ): Promise<Result<MappingPreviewResponse>> {
    return this.service.previewMapping({
      mappingId: req.mappingId,
      limit: req.limit,
      meta: req.meta,
    });
  }

  @Post('submit-ingestion-task')
  @ApiBody({ type: SubmitIngestionTaskRequestDto })
  submitIngestionTask(
    @Body() req: SubmitIngestionTaskRequestDto
  ): Promise<Result<SubmitIngestionTaskResponse>> {
    return this.service.submitIngestionTask({
      mappingId: req.mappingId,
      schedule: req.schedule,
      priority: req.priority,
      config: req.config,
      meta: req.meta,
    });
  }

  @Post('get-task-execution')
  @ApiBody({ type: GetTaskExecutionRequestDto })
  getTaskExecution(
    @Body() req: GetTaskExecutionRequestDto
  ): Promise<Result<TaskExecution>> {
    return this.service.getTaskExecution({
      taskExecutionId: req.executionId,
      meta: req.meta,
    });
  }
}
