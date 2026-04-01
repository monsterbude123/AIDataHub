import { Controller, Post, Body } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import type { Result, DataAsset, PageResult } from '@ai-datahub/contract';
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
  PageRequestDto,
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
  ): Promise<Result<PageResult<DataAsset>>> {
    return this.service.searchAssets(req);
  }

  @Post('assets/tag')
  @ApiBody({ type: TagAssetRequestDto })
  async tagAsset(
    @Body() req: TagAssetRequestDto
  ): Promise<Result<{ success: boolean }>> {
    return this.service.tagAsset(req);
  }

  @Post('tags')
  @ApiBody({ type: ListAssetTagsRequestDto })
  async listAssetTags(
    @Body() req: ListAssetTagsRequestDto
  ): Promise<Result<AssetTagDto[]>> {
    return this.service.listAssetTags(req);
  }

  @Post('export-ledger')
  @ApiBody({ type: ExportLedgerRequestDto })
  async exportLedger(
    @Body() req: ExportLedgerRequestDto
  ): Promise<Result<ExportLedgerResponseDto>> {
    return this.service.exportLedger(req);
  }

  @Post('standard-element/create')
  @ApiBody({ type: CreateStandardDataElementRequestDto })
  async createStandardDataElement(
    @Body() req: CreateStandardDataElementRequestDto
  ): Promise<Result<{ elementId: string }>> {
    return this.service.createStandardDataElement(req);
  }

  @Post('standard-element/update')
  @ApiBody({ type: UpdateStandardDataElementRequestDto })
  async updateStandardDataElement(
    @Body() req: UpdateStandardDataElementRequestDto
  ): Promise<Result<{ success: boolean }>> {
    return this.service.updateStandardDataElement(req);
  }

  @Post('standard-element/delete')
  @ApiBody({ type: DeleteStandardDataElementRequestDto })
  async deleteStandardDataElement(
    @Body() req: DeleteStandardDataElementRequestDto
  ): Promise<Result<{ success: boolean }>> {
    return this.service.deleteStandardDataElement(req);
  }

  @Post('standard-element/list')
  @ApiBody({ type: ListStandardDataElementsRequestDto })
  async listStandardDataElements(
    @Body() req: ListStandardDataElementsRequestDto
  ): Promise<Result<PageResult<StandardDataElementDto>>> {
    return this.service.listStandardDataElements(req);
  }

  @Post('type-mapping/upsert')
  @ApiBody({ type: UpsertStandardTypeMappingRequestDto })
  async upsertStandardTypeMapping(
    @Body() req: UpsertStandardTypeMappingRequestDto
  ): Promise<Result<{ mappingId: string }>> {
    return this.service.upsertStandardTypeMapping(req);
  }

  @Post('type-mapping/list')
  @ApiBody({ type: ListStandardTypeMappingsRequestDto })
  async listStandardTypeMappings(
    @Body() req: ListStandardTypeMappingsRequestDto
  ): Promise<Result<PageResult<StandardTypeMappingDto>>> {
    return this.service.listStandardTypeMappings(req);
  }

  @Post('dictionary/create')
  @ApiBody({ type: CreateDictionaryRequestDto })
  async createDictionary(
    @Body() req: CreateDictionaryRequestDto
  ): Promise<Result<{ dictionaryId: string }>> {
    return this.service.createDictionary(req);
  }

  @Post('dictionary/update')
  @ApiBody({ type: UpdateDictionaryRequestDto })
  async updateDictionary(
    @Body() req: UpdateDictionaryRequestDto
  ): Promise<Result<{ success: boolean }>> {
    return this.service.updateDictionary(req);
  }

  @Post('dictionary/delete')
  @ApiBody({ type: DeleteDictionaryRequestDto })
  async deleteDictionary(
    @Body() req: DeleteDictionaryRequestDto
  ): Promise<Result<{ success: boolean }>> {
    return this.service.deleteDictionary(req);
  }

  @Post('dictionary/list')
  @ApiBody({ type: ListDictionariesRequestDto })
  async listDictionaries(
    @Body() req: ListDictionariesRequestDto
  ): Promise<Result<PageResult<DictionaryDto>>> {
    return this.service.listDictionaries(req);
  }

  @Post('dictionary/data')
  @ApiBody({ type: GetDictionaryDataRequestDto })
  async getDictionaryData(
    @Body() req: GetDictionaryDataRequestDto
  ): Promise<Result<PageResult<DictionaryItemDto>>> {
    return this.service.getDictionaryData(req);
  }

  @Post('dictionary/import')
  @ApiBody({ type: ImportDictionaryRequestDto })
  async importDictionary(
    @Body() req: ImportDictionaryRequestDto
  ): Promise<Result<{ success: boolean }>> {
    return this.service.importDictionary(req);
  }

  @Post('dictionary/categories')
  @ApiBody({ type: ListDictionaryCategoriesRequestDto })
  async listDictionaryCategories(
    @Body() req: ListDictionaryCategoriesRequestDto
  ): Promise<Result<DictionaryCategoryNodeDto[]>> {
    return this.service.listDictionaryCategories(req);
  }

  @Post('dictionary/category/create')
  @ApiBody({ type: CreateDictionaryCategoryRequestDto })
  async createDictionaryCategory(
    @Body() req: CreateDictionaryCategoryRequestDto
  ): Promise<Result<{ categoryId: string }>> {
    return this.service.createDictionaryCategory(req);
  }

  @Post('dictionary/category/update')
  @ApiBody({ type: UpdateDictionaryCategoryRequestDto })
  async updateDictionaryCategory(
    @Body() req: UpdateDictionaryCategoryRequestDto
  ): Promise<Result<{ success: boolean }>> {
    return this.service.updateDictionaryCategory(req);
  }

  @Post('dictionary/category/delete')
  @ApiBody({ type: DeleteDictionaryCategoryRequestDto })
  async deleteDictionaryCategory(
    @Body() req: DeleteDictionaryCategoryRequestDto
  ): Promise<Result<{ success: boolean }>> {
    return this.service.deleteDictionaryCategory(req);
  }

  @Post('model/create')
  @ApiBody({ type: CreateModelRequestDto })
  async createModel(
    @Body() req: CreateModelRequestDto
  ): Promise<Result<{ modelId: string }>> {
    return this.service.createModel(req);
  }

  @Post('model/approve')
  @ApiBody({ type: ApproveModelRequestDto })
  async approveModel(
    @Body() req: ApproveModelRequestDto
  ): Promise<Result<{ success: boolean }>> {
    return this.service.approveModel(req);
  }

  @Post('model/publish')
  @ApiBody({ type: PublishModelRequestDto })
  async publishModel(
    @Body() req: PublishModelRequestDto
  ): Promise<Result<{ success: boolean }>> {
    return this.service.publishModel(req);
  }

  @Post('model/create-physical')
  @ApiBody({ type: CreatePhysicalTablesRequestDto })
  async createPhysicalTables(
    @Body() req: CreatePhysicalTablesRequestDto
  ): Promise<Result<{ success: boolean }>> {
    return this.service.createPhysicalTables(req);
  }

  @Post('model/list')
  @ApiBody({ type: ListModelsRequestDto })
  async listModels(
    @Body() req: ListModelsRequestDto
  ): Promise<Result<PageResult<DataModelDto>>> {
    return this.service.listModels(req);
  }

  @Post('audit/task/upsert')
  @ApiBody({ type: UpsertAuditTaskRequestDto })
  async upsertAuditTask(
    @Body() req: UpsertAuditTaskRequestDto
  ): Promise<Result<{ taskId: string }>> {
    return this.service.upsertAuditTask(req);
  }

  @Post('audit/task/list')
  @ApiBody({ type: ListAuditTasksRequestDto })
  async listAuditTasks(
    @Body() req: ListAuditTasksRequestDto
  ): Promise<Result<AuditTaskDto[]>> {
    return this.service.listAuditTasks(req);
  }

  @Post('audit/task/run')
  @ApiBody({ type: RunAuditTaskRequestDto })
  async runAuditTask(
    @Body() req: RunAuditTaskRequestDto
  ): Promise<Result<{ runId: string }>> {
    return this.service.runAuditTask(req);
  }

  @Post('audit/run/list')
  @ApiBody({ type: ListAuditRunsRequestDto })
  async listAuditRuns(
    @Body() req: ListAuditRunsRequestDto
  ): Promise<Result<PageResult<AuditRunDto>>> {
    return this.service.listAuditRuns(req);
  }
}
