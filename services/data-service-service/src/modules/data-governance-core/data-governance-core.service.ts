import { Injectable } from '@nestjs/common';
import type {
  DataGovernanceCoreClient,
  SearchAssetsRequest,
  DataAsset,
  PageResult,
  Result,
  ExportLedgerRequest,
  ExportLedgerResponse,
  StandardDataElement,
  StandardTypeMapping,
  Dictionary,
  DictionaryItem,
  DictionaryCategoryNode,
  DataModel,
  AuditTask,
  AuditRun,
} from '@ai-datahub/contract';
import { okResult } from '@ai-datahub/contract';
import { createLogger } from '@ai-datahub/shared';
import type { RequestMeta, PageRequest, ID } from '@ai-datahub/contract';
import { InMemoryAssetTagRepository } from './repositories/asset-tag.repository';
import { InMemoryStandardDataElementRepository } from './repositories/standard-data-element.repository';
import { InMemoryStandardTypeMappingRepository } from './repositories/standard-type-mapping.repository';
import { InMemoryDictionaryRepository } from './repositories/dictionary.repository';
import { InMemoryDictionaryItemRepository } from './repositories/dictionary-item.repository';
import { InMemoryDictionaryCategoryRepository } from './repositories/dictionary-category.repository';
import { InMemoryDataModelRepository } from './repositories/data-model.repository';
import { InMemoryAuditRepository } from './repositories/audit.repository';

const logger = createLogger({ module: 'data-governance-core' });

@Injectable()
export class DataGovernanceCoreService implements DataGovernanceCoreClient {
  private readonly assetTagRepo = new InMemoryAssetTagRepository();
  private readonly standardDataElementRepo =
    new InMemoryStandardDataElementRepository();
  private readonly standardTypeMappingRepo =
    new InMemoryStandardTypeMappingRepository();
  private readonly dictionaryRepo = new InMemoryDictionaryRepository();
  private readonly dictionaryItemRepo = new InMemoryDictionaryItemRepository();
  private readonly dictionaryCategoryRepo =
    new InMemoryDictionaryCategoryRepository();
  private readonly dataModelRepo = new InMemoryDataModelRepository();
  private readonly auditRepo = new InMemoryAuditRepository();

  /**
   * Search data assets by keyword and filters
   */
  async searchAssets(
    req: SearchAssetsRequest
  ): Promise<Result<PageResult<DataAsset>>> {
    const traceId = req.meta?.traceId;
    logger.debug('searchAssets', {
      keyword: req.keyword,
      page: req.page,
      traceId,
    });

    // In-memory mock implementation - returns empty for now
    // In production this would query the database
    const result: PageResult<DataAsset> = {
      page: req.page.page,
      pageSize: req.page.pageSize,
      total: 0,
      items: [],
    };

    return okResult(result, traceId);
  }

  /**
   * Tag a data asset with tags
   */
  async tagAsset(req: {
    meta?: RequestMeta;
    dataAssetId: ID;
    tags: string[];
  }): Promise<Result<{ success: boolean }>> {
    const traceId = req.meta?.traceId;
    logger.debug('tagAsset', {
      dataAssetId: req.dataAssetId,
      tags: req.tags,
      traceId,
    });

    // In mock implementation, always succeed
    // In production would update the asset tags in database
    return okResult({ success: true }, traceId);
  }

  /**
   * List all asset tags matching keyword
   */
  async listAssetTags(req: {
    meta?: RequestMeta;
    keyword?: string;
  }): Promise<Result<import('@ai-datahub/contract').AssetTag[]>> {
    const traceId = req.meta?.traceId;
    logger.debug('listAssetTags', { keyword: req.keyword, traceId });

    const result = await this.assetTagRepo.findAll(req.keyword);
    return okResult(result, traceId);
  }

  /**
   * Export governance ledger (asset lineage/ledger)
   */
  async exportLedger(
    req: ExportLedgerRequest
  ): Promise<Result<ExportLedgerResponse>> {
    const traceId = req.meta?.traceId;
    logger.debug('exportLedger', {
      type: req.type,
      format: req.format,
      traceId,
    });

    // Mock implementation - returns placeholder download URL
    const expireAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    return okResult(
      {
        downloadUrl: `/api/download/ledger-export.${req.format.toLowerCase()}`,
        expireAt,
      },
      traceId
    );
  }

  /**
   * Create a new standard data element
   */
  async createStandardDataElement(req: {
    meta?: RequestMeta;
    element: Omit<StandardDataElement, 'id' | 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ elementId: ID }>> {
    const traceId = req.meta?.traceId;
    logger.debug('createStandardDataElement', {
      name: req.element.name,
      traceId,
    });

    const result = await this.standardDataElementRepo.create(req.element);
    return okResult(result, traceId);
  }

  /**
   * Update an existing standard data element
   */
  async updateStandardDataElement(req: {
    meta?: RequestMeta;
    element: Omit<StandardDataElement, 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ success: boolean }>> {
    const traceId = req.meta?.traceId;
    logger.debug('updateStandardDataElement', { id: req.element.id, traceId });

    const success = await this.standardDataElementRepo.update(req.element);
    return okResult({ success }, traceId);
  }

  /**
   * Delete a standard data element
   */
  async deleteStandardDataElement(req: {
    meta?: RequestMeta;
    elementId: ID;
  }): Promise<Result<{ success: boolean }>> {
    const traceId = req.meta?.traceId;
    logger.debug('deleteStandardDataElement', {
      elementId: req.elementId,
      traceId,
    });

    const success = await this.standardDataElementRepo.delete(req.elementId);
    return okResult({ success }, traceId);
  }

  /**
   * List standard data elements with pagination
   */
  async listStandardDataElements(req: {
    meta?: RequestMeta;
    keyword?: string;
    page: PageRequest;
  }): Promise<Result<PageResult<StandardDataElement>>> {
    const traceId = req.meta?.traceId;
    logger.debug('listStandardDataElements', {
      keyword: req.keyword,
      page: req.page,
      traceId,
    });

    const result = await this.standardDataElementRepo.list(
      req.keyword,
      req.page
    );
    return okResult(result, traceId);
  }

  /**
   * Create or update a standard type mapping
   */
  async upsertStandardTypeMapping(req: {
    meta?: RequestMeta;
    mapping: Omit<StandardTypeMapping, 'createdAt'> & { id?: ID };
  }): Promise<Result<{ mappingId: ID }>> {
    const traceId = req.meta?.traceId;
    logger.debug('upsertStandardTypeMapping', {
      sourceSystem: req.mapping.sourceSystem,
      sourceType: req.mapping.sourceType,
      traceId,
    });

    const result = await this.standardTypeMappingRepo.upsert(req.mapping);
    return okResult(result, traceId);
  }

  /**
   * List standard type mappings with pagination
   */
  async listStandardTypeMappings(req: {
    meta?: RequestMeta;
    sourceSystem?: string;
    page: PageRequest;
  }): Promise<Result<PageResult<StandardTypeMapping>>> {
    const traceId = req.meta?.traceId;
    logger.debug('listStandardTypeMappings', {
      sourceSystem: req.sourceSystem,
      page: req.page,
      traceId,
    });

    const result = await this.standardTypeMappingRepo.list(
      req.sourceSystem,
      req.page
    );
    return okResult(result, traceId);
  }

  /**
   * Create a new dictionary
   */
  async createDictionary(req: {
    meta?: RequestMeta;
    dictionary: Omit<Dictionary, 'id' | 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ dictionaryId: ID }>> {
    const traceId = req.meta?.traceId;
    logger.debug('createDictionary', { name: req.dictionary.name, traceId });

    const result = await this.dictionaryRepo.create(req.dictionary);
    return okResult(result, traceId);
  }

  /**
   * Update an existing dictionary
   */
  async updateDictionary(req: {
    meta?: RequestMeta;
    dictionary: Omit<Dictionary, 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ success: boolean }>> {
    const traceId = req.meta?.traceId;
    logger.debug('updateDictionary', { id: req.dictionary.id, traceId });

    const success = await this.dictionaryRepo.update(req.dictionary);
    return okResult({ success }, traceId);
  }

  /**
   * Delete a dictionary
   */
  async deleteDictionary(req: {
    meta?: RequestMeta;
    dictionaryId: ID;
  }): Promise<Result<{ success: boolean }>> {
    const traceId = req.meta?.traceId;
    logger.debug('deleteDictionary', {
      dictionaryId: req.dictionaryId,
      traceId,
    });

    const success = await this.dictionaryRepo.delete(req.dictionaryId);
    return okResult({ success }, traceId);
  }

  /**
   * List dictionaries with pagination
   */
  async listDictionaries(req: {
    meta?: RequestMeta;
    keyword?: string;
    page: PageRequest;
  }): Promise<Result<PageResult<Dictionary>>> {
    const traceId = req.meta?.traceId;
    logger.debug('listDictionaries', {
      keyword: req.keyword,
      page: req.page,
      traceId,
    });

    const result = await this.dictionaryRepo.list(req.keyword, req.page);
    return okResult(result, traceId);
  }

  /**
   * Get dictionary items with pagination
   */
  async getDictionaryData(req: {
    meta?: RequestMeta;
    dictionaryId: ID;
    useCache?: boolean;
    page: PageRequest;
  }): Promise<Result<PageResult<DictionaryItem>>> {
    const traceId = req.meta?.traceId;
    logger.debug('getDictionaryData', {
      dictionaryId: req.dictionaryId,
      page: req.page,
      traceId,
    });

    const result = await this.dictionaryItemRepo.list(
      req.dictionaryId,
      req.useCache ?? true,
      req.page
    );
    return okResult(result, traceId);
  }

  /**
   * Import dictionary data
   */
  async importDictionary(req: {
    meta?: RequestMeta;
    dictionaryId: ID;
    format: 'TEMPLATE_V1';
    payload: Record<string, unknown>;
  }): Promise<Result<{ success: boolean }>> {
    const traceId = req.meta?.traceId;
    logger.debug('importDictionary', {
      dictionaryId: req.dictionaryId,
      format: req.format,
      traceId,
    });

    // Mock implementation - always succeeds
    return okResult({ success: true }, traceId);
  }

  /**
   * List dictionary category nodes by parent
   */
  async listDictionaryCategories(req: {
    meta?: RequestMeta;
    parentId?: ID;
  }): Promise<Result<DictionaryCategoryNode[]>> {
    const traceId = req.meta?.traceId;
    logger.debug('listDictionaryCategories', {
      parentId: req.parentId,
      traceId,
    });

    const result = await this.dictionaryCategoryRepo.list(req.parentId);
    return okResult(result, traceId);
  }

  /**
   * Create a new dictionary category
   */
  async createDictionaryCategory(req: {
    meta?: RequestMeta;
    node: Omit<DictionaryCategoryNode, 'id' | 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ categoryId: ID }>> {
    const traceId = req.meta?.traceId;
    logger.debug('createDictionaryCategory', {
      name: req.node.name,
      parentId: req.node.parentId,
      traceId,
    });

    const result = await this.dictionaryCategoryRepo.create(req.node);
    return okResult(result, traceId);
  }

  /**
   * Update an existing dictionary category
   */
  async updateDictionaryCategory(req: {
    meta?: RequestMeta;
    node: Omit<DictionaryCategoryNode, 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ success: boolean }>> {
    const traceId = req.meta?.traceId;
    logger.debug('updateDictionaryCategory', { id: req.node.id, traceId });

    const success = await this.dictionaryCategoryRepo.update(req.node);
    return okResult({ success }, traceId);
  }

  /**
   * Delete a dictionary category
   */
  async deleteDictionaryCategory(req: {
    meta?: RequestMeta;
    categoryId: ID;
  }): Promise<Result<{ success: boolean }>> {
    const traceId = req.meta?.traceId;
    logger.debug('deleteDictionaryCategory', {
      categoryId: req.categoryId,
      traceId,
    });

    const success = await this.dictionaryCategoryRepo.delete(req.categoryId);
    return okResult({ success }, traceId);
  }

  /**
   * Create a new data model
   */
  async createModel(req: {
    meta?: RequestMeta;
    model: Omit<DataModel, 'id' | 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ modelId: ID }>> {
    const traceId = req.meta?.traceId;
    logger.debug('createModel', { name: req.model.name, traceId });

    const result = await this.dataModelRepo.create(req.model);
    return okResult(result, traceId);
  }

  /**
   * Approve a data model
   */
  async approveModel(req: {
    meta?: RequestMeta;
    modelId: ID;
  }): Promise<Result<{ success: boolean }>> {
    const traceId = req.meta?.traceId;
    logger.debug('approveModel', { modelId: req.modelId, traceId });

    // Mock implementation - always succeeds
    return okResult({ success: true }, traceId);
  }

  /**
   * Publish/unpublish a data model
   */
  async publishModel(req: {
    meta?: RequestMeta;
    modelId: ID;
    online: boolean;
  }): Promise<Result<{ success: boolean }>> {
    const traceId = req.meta?.traceId;
    logger.debug('publishModel', {
      modelId: req.modelId,
      online: req.online,
      traceId,
    });

    // Mock implementation - always succeeds
    return okResult({ success: true }, traceId);
  }

  /**
   * Create physical tables from the data model
   */
  async createPhysicalTables(req: {
    meta?: RequestMeta;
    modelId: ID;
    dataSourceId: ID;
    options?: Record<string, unknown>;
  }): Promise<Result<{ success: boolean }>> {
    const traceId = req.meta?.traceId;
    logger.debug('createPhysicalTables', {
      modelId: req.modelId,
      dataSourceId: req.dataSourceId,
      traceId,
    });

    // Mock implementation - always succeeds
    return okResult({ success: true }, traceId);
  }

  /**
   * List data models with pagination
   */
  async listModels(req: {
    meta?: RequestMeta;
    keyword?: string;
    page: PageRequest;
  }): Promise<Result<PageResult<DataModel>>> {
    const traceId = req.meta?.traceId;
    logger.debug('listModels', {
      keyword: req.keyword,
      page: req.page,
      traceId,
    });

    const result = await this.dataModelRepo.list(req.keyword, req.page);
    return okResult(result, traceId);
  }

  /**
   * Create or update an audit task
   */
  async upsertAuditTask(req: {
    meta?: RequestMeta;
    task: Omit<AuditTask, 'createdAt' | 'updatedAt'> & { id?: ID };
  }): Promise<Result<{ taskId: ID }>> {
    const traceId = req.meta?.traceId;
    logger.debug('upsertAuditTask', {
      type: req.task.type,
      enabled: req.task.enabled,
      traceId,
    });

    const result = await this.auditRepo.upsert(req.task);
    return okResult(result, traceId);
  }

  /**
   * List all audit tasks
   */
  async listAuditTasks(req: {
    meta?: RequestMeta;
  }): Promise<Result<AuditTask[]>> {
    const traceId = req.meta?.traceId;
    logger.debug('listAuditTasks', { traceId });

    const result = await this.auditRepo.list();
    return okResult(result, traceId);
  }

  /**
   * Trigger an audit task run
   */
  async runAuditTask(req: {
    meta?: RequestMeta;
    taskId: ID;
  }): Promise<Result<{ runId: ID }>> {
    const traceId = req.meta?.traceId;
    logger.debug('runAuditTask', { taskId: req.taskId, traceId });

    const result = await this.auditRepo.createRun(req.taskId);
    return okResult(result, traceId);
  }

  /**
   * List audit runs for a task with pagination
   */
  async listAuditRuns(req: {
    meta?: RequestMeta;
    taskId: ID;
    page: PageRequest;
  }): Promise<Result<PageResult<AuditRun>>> {
    const traceId = req.meta?.traceId;
    logger.debug('listAuditRuns', {
      taskId: req.taskId,
      page: req.page,
      traceId,
    });

    const result = await this.auditRepo.listRuns(req.taskId, req.page);
    return okResult(result, traceId);
  }
}
