import { Controller, Post, Body } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import type { Result, PageResult, AuditTask } from '@ai-datahub/contract';
import {
  SearchAssetsRequestDto,
  TagAssetRequestDto,
  ListAssetTagsRequestDto,
  ExportLedgerRequestDto,
  ExportLedgerResponseDto,
  StandardDataElementDto,
  CreateStandardDataElementRequestDto,
  UpdateStandardDataElementRequestDto,
  DeleteStandardDataElementRequestDto,
  ListStandardDataElementsRequestDto,
  StandardTypeMappingDto,
  UpsertStandardTypeMappingRequestDto,
  ListStandardTypeMappingsRequestDto,
  DictionaryDto,
  DictionaryItemDto,
  CreateDictionaryRequestDto,
  UpdateDictionaryRequestDto,
  DeleteDictionaryRequestDto,
  ListDictionariesRequestDto,
  GetDictionaryDataRequestDto,
  ImportDictionaryRequestDto,
  DictionaryCategoryNodeDto,
  ListDictionaryCategoriesRequestDto,
  CreateDictionaryCategoryRequestDto,
  UpdateDictionaryCategoryRequestDto,
  DeleteDictionaryCategoryRequestDto,
  DataModelDto,
  CreateModelRequestDto,
  ApproveModelRequestDto,
  PublishModelRequestDto,
  CreatePhysicalTablesRequestDto,
  ListModelsRequestDto,
  AuditTaskDto,
  AuditRunDto,
  UpsertAuditTaskRequestDto,
  ListAuditTasksRequestDto,
  RunAuditTaskRequestDto,
  ListAuditRunsRequestDto,
  AssetTagDto,
  DictionaryType,
  DataModelStatus,
} from '@ai-datahub/contract';
import { DataGovernanceCoreService } from './data-governance-core.service';

@ApiTags('DataGovernanceCore')
@Controller('api/governance')
export class DataGovernanceCoreController {
  constructor(private readonly service: DataGovernanceCoreService) {}

  @Post('assets/search')
  @ApiBody({ type: SearchAssetsRequestDto })
  async searchAssets(
    @Body() req: SearchAssetsRequestDto
  ): Promise<Result<PageResult<AssetTagDto>>> {
    return this.service.searchAssets({
      meta: req.meta,
      keyword: req.keyword,
      tags: req.tags,
      filters: req.filters,
      page: {
        page: req.page.page,
        pageSize: req.page.pageSize,
      },
    });
  }

  @Post('assets/tag')
  @ApiBody({ type: TagAssetRequestDto })
  async tagAsset(
    @Body() req: TagAssetRequestDto
  ): Promise<Result<{ success: boolean }>> {
    return this.service.tagAsset({
      meta: req.meta,
      dataAssetId: req.dataAssetId,
      tags: req.tags,
    });
  }

  @Post('tags')
  @ApiBody({ type: ListAssetTagsRequestDto })
  async listAssetTags(
    @Body() req: ListAssetTagsRequestDto
  ): Promise<Result<AssetTagDto[]>> {
    const result = await this.service.listAssetTags({
      meta: req.meta,
      keyword: req.keyword,
    });

    if (!result.ok) {
      return result;
    }

    const dto: AssetTagDto[] = result.data.map((t) => ({
      id: t.id,
      name: t.name,
      createdAt: t.createdAt,
    }));

    return {
      ...result,
      data: dto,
    };
  }

  @Post('export-ledger')
  @ApiBody({ type: ExportLedgerRequestDto })
  async exportLedger(
    @Body() req: ExportLedgerRequestDto
  ): Promise<Result<ExportLedgerResponseDto>> {
    return this.service.exportLedger({
      meta: req.meta,
      type: req.type,
      format: req.format,
      filters: req.filters,
    });
  }

  @Post('standard-element/create')
  @ApiBody({ type: CreateStandardDataElementRequestDto })
  async createStandardDataElement(
    @Body() req: CreateStandardDataElementRequestDto
  ): Promise<Result<{ elementId: string }>> {
    return this.service.createStandardDataElement({
      meta: req.meta,
      element: req.element,
    });
  }

  @Post('standard-element/update')
  @ApiBody({ type: UpdateStandardDataElementRequestDto })
  async updateStandardDataElement(
    @Body() req: UpdateStandardDataElementRequestDto
  ): Promise<Result<{ success: boolean }>> {
    return this.service.updateStandardDataElement({
      meta: req.meta,
      element: req.element,
    });
  }

  @Post('standard-element/delete')
  @ApiBody({ type: DeleteStandardDataElementRequestDto })
  async deleteStandardDataElement(
    @Body() req: DeleteStandardDataElementRequestDto
  ): Promise<Result<{ success: boolean }>> {
    return this.service.deleteStandardDataElement({
      meta: req.meta,
      elementId: req.elementId,
    });
  }

  @Post('standard-element/list')
  @ApiBody({ type: ListStandardDataElementsRequestDto })
  async listStandardDataElements(
    @Body() req: ListStandardDataElementsRequestDto
  ): Promise<Result<PageResult<StandardDataElementDto>>> {
    const result = await this.service.listStandardDataElements({
      meta: req.meta,
      keyword: req.keyword,
      page: {
        page: req.page.page,
        pageSize: req.page.pageSize,
      },
    });

    if (!result.ok) {
      return result;
    }

    const dto: PageResult<StandardDataElementDto> = {
      ...result.data,
      items: result.data.items.map((e) => ({
        id: e.id,
        name: e.name,
        identifier: e.identifier,
        type: e.type,
        length: e.length,
        description: e.description,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
      })),
    };

    return {
      ...result,
      data: dto,
    };
  }

  @Post('type-mapping/upsert')
  @ApiBody({ type: UpsertStandardTypeMappingRequestDto })
  async upsertStandardTypeMapping(
    @Body() req: UpsertStandardTypeMappingRequestDto
  ): Promise<Result<{ mappingId: string }>> {
    return this.service.upsertStandardTypeMapping({
      meta: req.meta,
      mapping: req.mapping,
    });
  }

  @Post('type-mapping/list')
  @ApiBody({ type: ListStandardTypeMappingsRequestDto })
  async listStandardTypeMappings(
    @Body() req: ListStandardTypeMappingsRequestDto
  ): Promise<Result<PageResult<StandardTypeMappingDto>>> {
    const result = await this.service.listStandardTypeMappings({
      meta: req.meta,
      sourceSystem: req.sourceSystem,
      page: {
        page: req.page.page,
        pageSize: req.page.pageSize,
      },
    });

    if (!result.ok) {
      return result;
    }

    const dto: PageResult<StandardTypeMappingDto> = {
      ...result.data,
      items: result.data.items.map((m) => ({
        id: m.id,
        sourceSystem: m.sourceSystem,
        sourceType: m.sourceType,
        standardType: m.standardType,
        createdAt: m.createdAt,
      })),
    };

    return {
      ...result,
      data: dto,
    };
  }

  @Post('dictionary/create')
  @ApiBody({ type: CreateDictionaryRequestDto })
  async createDictionary(
    @Body() req: CreateDictionaryRequestDto
  ): Promise<Result<{ dictionaryId: string }>> {
    return this.service.createDictionary({
      meta: req.meta,
      dictionary: req.dictionary,
    });
  }

  @Post('dictionary/update')
  @ApiBody({ type: UpdateDictionaryRequestDto })
  async updateDictionary(
    @Body() req: UpdateDictionaryRequestDto
  ): Promise<Result<{ success: boolean }>> {
    return this.service.updateDictionary({
      meta: req.meta,
      dictionary: req.dictionary,
    });
  }

  @Post('dictionary/delete')
  @ApiBody({ type: DeleteDictionaryRequestDto })
  async deleteDictionary(
    @Body() req: DeleteDictionaryRequestDto
  ): Promise<Result<{ success: boolean }>> {
    return this.service.deleteDictionary({
      meta: req.meta,
      dictionaryId: req.dictionaryId,
    });
  }

  @Post('dictionary/list')
  @ApiBody({ type: ListDictionariesRequestDto })
  async listDictionaries(
    @Body() req: ListDictionariesRequestDto
  ): Promise<Result<PageResult<DictionaryDto>>> {
    const result = await this.service.listDictionaries({
      meta: req.meta,
      keyword: req.keyword,
      page: {
        page: req.page.page,
        pageSize: req.page.pageSize,
      },
    });

    if (!result.ok) {
      return result;
    }

    const dto: PageResult<DictionaryDto> = {
      ...result.data,
      items: result.data.items.map((d) => ({
        id: d.id,
        name: d.name,
        type: d.type as DictionaryType,
        config: d.config,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      })),
    };

    return {
      ...result,
      data: dto,
    };
  }

  @Post('dictionary/data')
  @ApiBody({ type: GetDictionaryDataRequestDto })
  async getDictionaryData(
    @Body() req: GetDictionaryDataRequestDto
  ): Promise<Result<PageResult<DictionaryItemDto>>> {
    const result = await this.service.getDictionaryData({
      meta: req.meta,
      dictionaryId: req.dictionaryId,
      useCache: req.useCache,
      page: {
        page: req.page.page,
        pageSize: req.page.pageSize,
      },
    });

    if (!result.ok) {
      return result;
    }

    const dto: PageResult<DictionaryItemDto> = {
      ...result.data,
      items: result.data.items.map((item) => ({
        id: item.id,
        dictionaryId: item.dictionaryId,
        key: item.key,
        value: item.value,
        description: item.description,
      })),
    };

    return {
      ...result,
      data: dto,
    };
  }

  @Post('dictionary/import')
  @ApiBody({ type: ImportDictionaryRequestDto })
  async importDictionary(
    @Body() req: ImportDictionaryRequestDto
  ): Promise<Result<{ success: boolean }>> {
    return this.service.importDictionary({
      meta: req.meta,
      dictionaryId: req.dictionaryId,
      format: req.format as 'TEMPLATE_V1',
      payload: req.payload,
    });
  }

  @Post('dictionary/categories')
  @ApiBody({ type: ListDictionaryCategoriesRequestDto })
  async listDictionaryCategories(
    @Body() req: ListDictionaryCategoriesRequestDto
  ): Promise<Result<DictionaryCategoryNodeDto[]>> {
    const result = await this.service.listDictionaryCategories({
      meta: req.meta,
      parentId: req.parentId,
    });

    if (!result.ok) {
      return result;
    }

    const dto: DictionaryCategoryNodeDto[] = result.data.map((node) => ({
      id: node.id,
      parentId: node.parentId,
      name: node.name,
      code: node.code,
      sort: node.sort,
      createdAt: node.createdAt,
      updatedAt: node.updatedAt,
    }));

    return {
      ...result,
      data: dto,
    };
  }

  @Post('dictionary/category/create')
  @ApiBody({ type: CreateDictionaryCategoryRequestDto })
  async createDictionaryCategory(
    @Body() req: CreateDictionaryCategoryRequestDto
  ): Promise<Result<{ categoryId: string }>> {
    return this.service.createDictionaryCategory({
      meta: req.meta,
      node: req.node,
    });
  }

  @Post('dictionary/category/update')
  @ApiBody({ type: UpdateDictionaryCategoryRequestDto })
  async updateDictionaryCategory(
    @Body() req: UpdateDictionaryCategoryRequestDto
  ): Promise<Result<{ success: boolean }>> {
    return this.service.updateDictionaryCategory({
      meta: req.meta,
      node: req.node,
    });
  }

  @Post('dictionary/category/delete')
  @ApiBody({ type: DeleteDictionaryCategoryRequestDto })
  async deleteDictionaryCategory(
    @Body() req: DeleteDictionaryCategoryRequestDto
  ): Promise<Result<{ success: boolean }>> {
    return this.service.deleteDictionaryCategory({
      meta: req.meta,
      categoryId: req.categoryId,
    });
  }

  @Post('model/create')
  @ApiBody({ type: CreateModelRequestDto })
  async createModel(
    @Body() req: CreateModelRequestDto
  ): Promise<Result<{ modelId: string }>> {
    return this.service.createModel({
      meta: req.meta,
      model: req.model,
    });
  }

  @Post('model/approve')
  @ApiBody({ type: ApproveModelRequestDto })
  async approveModel(
    @Body() req: ApproveModelRequestDto
  ): Promise<Result<{ success: boolean }>> {
    return this.service.approveModel({
      meta: req.meta,
      modelId: req.modelId,
    });
  }

  @Post('model/publish')
  @ApiBody({ type: PublishModelRequestDto })
  async publishModel(
    @Body() req: PublishModelRequestDto
  ): Promise<Result<{ success: boolean }>> {
    return this.service.publishModel({
      meta: req.meta,
      modelId: req.modelId,
      online: req.online,
    });
  }

  @Post('model/create-physical')
  @ApiBody({ type: CreatePhysicalTablesRequestDto })
  async createPhysicalTables(
    @Body() req: CreatePhysicalTablesRequestDto
  ): Promise<Result<{ success: boolean }>> {
    return this.service.createPhysicalTables({
      meta: req.meta,
      modelId: req.modelId,
      dataSourceId: req.dataSourceId,
      options: req.options,
    });
  }

  @Post('model/list')
  @ApiBody({ type: ListModelsRequestDto })
  async listModels(
    @Body() req: ListModelsRequestDto
  ): Promise<Result<PageResult<DataModelDto>>> {
    const result = await this.service.listModels({
      meta: req.meta,
      keyword: req.keyword,
      page: {
        page: req.page.page,
        pageSize: req.page.pageSize,
      },
    });

    if (!result.ok) {
      return result;
    }

    const dto: PageResult<DataModelDto> = {
      ...result.data,
      items: result.data.items.map((model) => ({
        id: model.id,
        name: model.name,
        version: model.version,
        status: model.status as DataModelStatus,
        definition: model.definition,
        createdAt: model.createdAt,
        updatedAt: model.updatedAt,
      })),
    };

    return {
      ...result,
      data: dto,
    };
  }

  @Post('audit/task/upsert')
  @ApiBody({ type: UpsertAuditTaskRequestDto })
  async upsertAuditTask(
    @Body() req: UpsertAuditTaskRequestDto
  ): Promise<Result<{ taskId: string }>> {
    return this.service.upsertAuditTask({
      meta: req.meta,
      task: req.task as unknown as Omit<
        AuditTask,
        'createdAt' | 'updatedAt'
      > & { id?: string },
    });
  }

  @Post('audit/task/list')
  @ApiBody({ type: ListAuditTasksRequestDto })
  async listAuditTasks(
    @Body() req: ListAuditTasksRequestDto
  ): Promise<Result<AuditTaskDto[]>> {
    const result = await this.service.listAuditTasks({
      meta: req.meta,
    });

    if (!result.ok) {
      return result;
    }

    const dto: AuditTaskDto[] = result.data.map((task) => ({
      id: task.id,
      type: task.type,
      enabled: task.enabled,
      schedule: task.schedule,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    }));

    return {
      ...result,
      data: dto,
    };
  }

  @Post('audit/task/run')
  @ApiBody({ type: RunAuditTaskRequestDto })
  async runAuditTask(
    @Body() req: RunAuditTaskRequestDto
  ): Promise<Result<{ runId: string }>> {
    return this.service.runAuditTask({
      meta: req.meta,
      taskId: req.taskId,
    });
  }

  @Post('audit/run/list')
  @ApiBody({ type: ListAuditRunsRequestDto })
  async listAuditRuns(
    @Body() req: ListAuditRunsRequestDto
  ): Promise<Result<PageResult<AuditRunDto>>> {
    const result = await this.service.listAuditRuns({
      meta: req.meta,
      taskId: req.taskId,
      page: {
        page: req.page.page,
        pageSize: req.page.pageSize,
      },
    });

    if (!result.ok) {
      return result;
    }

    const dto: PageResult<AuditRunDto> = {
      ...result.data,
      items: result.data.items.map((run) => ({
        id: run.id,
        taskId: run.taskId,
        startedAt: run.startedAt,
        endedAt: run.endedAt,
        status: run.status,
        summary: run.summary,
      })),
    };

    return {
      ...result,
      data: dto,
    };
  }
}
