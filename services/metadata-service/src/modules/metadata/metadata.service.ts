import { Injectable } from '@nestjs/common';
import type {
  CollectMetadataRequest,
  CollectMetadataResponse,
  CompareMetadataVersionsRequest,
  ExportMetadataRequest,
  ExportMetadataResponse,
  GetMetadataVersionsRequest,
  ImportMetadataRequest,
  MetadataClient,
  MetadataVersionDiff,
  Result,
  SubscribeMetadataChangeRequest,
  SubscribeMetadataChangeResponse,
  SyncMetadataRequest,
  SyncMetadataResponse,
  MetadataSourceConfig,
  TestMetadataConnectionRequest,
  CreateMetadataSourceRequest,
  ListMetadataSourcesRequest,
  MetadataSource,
  MetadataSourceListResult,
  CollectedMetadata,
  DataSourceConnectionTest,
} from '@ai-datahub/contract';
import { okResult, errResult } from '@ai-datahub/contract';
import type {
  ID,
  PageResult,
  DataAsset,
  ColumnMetadata,
  MetadataVersion,
  SdkError,
} from '@ai-datahub/contract';
import {
  InMemoryDataAssetRepository,
  InMemoryColumnMetadataRepository,
  InMemoryMetadataVersionRepository,
} from './repositories/metadata.repository';
import { ConnectorFactory } from '../../connectors';

@Injectable()
export class MetadataService implements MetadataClient {
  private readonly dataAssetRepository = new InMemoryDataAssetRepository();
  private readonly columnMetadataRepository =
    new InMemoryColumnMetadataRepository();
  private readonly metadataVersionRepository =
    new InMemoryMetadataVersionRepository();

  // In-memory storage for metadata sources (would be database in production)
  private readonly metadataSources: Map<ID, MetadataSource> = new Map();
  private sourceIdCounter = 0;

  /**
   * Test connection to a database using the specified configuration.
   */
  async testConnection(
    req: TestMetadataConnectionRequest
  ): Promise<Result<DataSourceConnectionTest>> {
    try {
      const connector = ConnectorFactory.create(req.type);
      const config: MetadataSourceConfig = {
        type: req.type,
        host: req.host,
        port: req.port,
        username: req.username,
        password: req.password,
        database: req.database,
        ssl: req.ssl,
        extra: req.extra,
      };
      const result = await connector.testConnection(config);
      return okResult(result, req.meta?.traceId);
    } catch (error) {
      const err: SdkError = {
        code: 'UNSUPPORTED_CONNECTOR',
        message: error instanceof Error ? error.message : 'Unknown error',
        level: 'ERROR',
      };
      return errResult(err, req.meta?.traceId);
    }
  }

  /**
   * Collect metadata from a database source.
   * Returns empty data if connection fails, rather than an error.
   */
  async collectMetadataFromSource(
    config: MetadataSourceConfig
  ): Promise<Result<CollectedMetadata>> {
    try {
      const connector = ConnectorFactory.create(config.type);
      const result = await connector.collectMetadata(config);
      return okResult(result);
    } catch {
      // Return empty result when connection fails (e.g., database unavailable)
      const emptyResult: CollectedMetadata = {
        databases: [],
        tables: [],
        columns: [],
        indexes: [],
        partitions: [],
        collectedAt: new Date().toISOString(),
      };
      return okResult(emptyResult);
    }
  }

  /**
   * Create a new metadata source.
   */
  async createMetadataSource(
    req: CreateMetadataSourceRequest
  ): Promise<Result<MetadataSource>> {
    const id = `ms-${++this.sourceIdCounter}`;
    const now = new Date().toISOString();

    const source: MetadataSource = {
      id,
      name: req.name,
      type: req.type,
      host: req.host,
      port: req.port,
      username: req.username,
      passwordEncrypted: req.password, // TODO: encrypt in production
      database: req.database,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    };

    this.metadataSources.set(id, source);
    return okResult(source, req.meta?.traceId);
  }

  /**
   * List metadata sources with optional filtering.
   */
  async listMetadataSources(
    req: ListMetadataSourcesRequest
  ): Promise<Result<MetadataSourceListResult>> {
    let items = Array.from(this.metadataSources.values());

    // Filter by type if specified
    if (req.type) {
      items = items.filter((s) => s.type === req.type);
    }

    // Filter by status if specified
    if (req.status) {
      items = items.filter((s) => s.status === req.status);
    }

    const total = items.length;
    const page = req.page ?? 1;
    const pageSize = req.pageSize ?? 10;

    // Paginate
    const startIndex = (page - 1) * pageSize;
    const paginatedItems = items.slice(startIndex, startIndex + pageSize);

    const result: MetadataSourceListResult = {
      items: paginatedItems,
      total,
      page,
      pageSize,
    };

    return okResult(result, req.meta?.traceId);
  }

  /**
   * Get a metadata source by ID.
   */
  async getMetadataSourceById(id: ID): Promise<Result<MetadataSource>> {
    const source = this.metadataSources.get(id);
    if (!source) {
      const err: SdkError = {
        code: 'SOURCE_NOT_FOUND',
        message: `Metadata source not found: ${id}`,
        level: 'ERROR',
      };
      return errResult(err);
    }
    return okResult(source);
  }

  /**
   * Collect metadata from a source by its ID.
   */
  async collectMetadataFromSourceById(
    id: ID
  ): Promise<Result<CollectedMetadata>> {
    const sourceResult = await this.getMetadataSourceById(id);
    if (!sourceResult.ok) {
      return sourceResult as Result<CollectedMetadata>;
    }

    const source = sourceResult.data;
    const config: MetadataSourceConfig = {
      type: source.type,
      host: source.host,
      port: source.port,
      username: source.username,
      password: source.passwordEncrypted, // TODO: decrypt in production
      database: source.database,
    };

    return this.collectMetadataFromSource(config);
  }

  async collectMetadata(
    req: CollectMetadataRequest
  ): Promise<Result<CollectMetadataResponse>> {
    // InMemory 实现：模拟采集结果，返回空集合
    // 实际生产环境会连接数据源获取元数据
    const response: CollectMetadataResponse = {
      dataAssets: [],
      columns: [],
      collectedAt: new Date().toISOString(),
    };

    return okResult(response, req.meta?.traceId);
  }

  async importMetadata(
    req: ImportMetadataRequest
  ): Promise<Result<{ success: boolean }>> {
    // InMemory 实现：占位，返回成功
    return okResult({ success: true }, req.meta?.traceId);
  }

  async exportMetadata(
    req: ExportMetadataRequest
  ): Promise<Result<ExportMetadataResponse>> {
    // InMemory 实现：返回占位下载链接
    const now = new Date();
    const expireAt = new Date(
      now.getTime() + 24 * 60 * 60 * 1000
    ).toISOString();

    const response: ExportMetadataResponse = {
      downloadUrl: '/api/metadata/download/exported-metadata.json',
      expireAt,
    };

    return okResult(response, req.meta?.traceId);
  }

  async syncMetadata(
    req: SyncMetadataRequest
  ): Promise<Result<SyncMetadataResponse>> {
    // InMemory 实现：返回空差异
    const response: SyncMetadataResponse = {
      dryRun: req.dryRun ?? false,
      diffs: [],
    };

    return okResult(response, req.meta?.traceId);
  }

  async getMetadataVersions(
    req: GetMetadataVersionsRequest
  ): Promise<Result<PageResult<MetadataVersion>>> {
    const result = await this.metadataVersionRepository.listByDataAssetId(
      req.dataAssetId,
      req.page
    );

    return okResult(result, req.meta?.traceId);
  }

  async compareMetadataVersions(
    req: CompareMetadataVersionsRequest
  ): Promise<Result<{ diffs: MetadataVersionDiff[] }>> {
    const [left, right] = await Promise.all([
      this.metadataVersionRepository.findById(req.leftVersionId),
      this.metadataVersionRepository.findById(req.rightVersionId),
    ]);

    if (!left || !right) {
      const error: SdkError = {
        code: 'VERSION_NOT_FOUND',
        message: 'Version not found',
        level: 'ERROR',
      };
      return errResult(error, req.meta?.traceId);
    }

    const diffs: MetadataVersionDiff[] = [];

    // Compare version field
    if (left.version !== right.version) {
      diffs.push({
        field: 'version',
        left: left.version,
        right: right.version,
        changeType: 'MODIFIED',
      });
    }

    // Compare summary field
    if (left.summary !== right.summary) {
      diffs.push({
        field: 'summary',
        left: left.summary,
        right: right.summary,
        changeType:
          left.summary === undefined
            ? 'ADDED'
            : right.summary === undefined
              ? 'REMOVED'
              : 'MODIFIED',
      });
    }

    // Compare createdBy
    if (left.createdBy !== right.createdBy) {
      diffs.push({
        field: 'createdBy',
        left: left.createdBy,
        right: right.createdBy,
        changeType:
          left.createdBy === undefined
            ? 'ADDED'
            : right.createdBy === undefined
              ? 'REMOVED'
              : 'MODIFIED',
      });
    }

    return okResult({ diffs }, req.meta?.traceId);
  }

  async subscribeMetadataChange(
    req: SubscribeMetadataChangeRequest
  ): Promise<Result<SubscribeMetadataChangeResponse>> {
    // InMemory 实现：生成订阅 ID
    const subscriptionId = `sub-${Math.random().toString(36).substr(2, 9)}`;

    return okResult({ subscriptionId }, req.meta?.traceId);
  }

  // Helper methods for service operations

  async createDataAsset(
    dataAsset: Omit<DataAsset, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<{ id: ID }> {
    return this.dataAssetRepository.create(dataAsset);
  }

  async updateDataAsset(
    dataAsset: Omit<DataAsset, 'createdAt' | 'updatedAt'>
  ): Promise<boolean> {
    return this.dataAssetRepository.update(dataAsset);
  }

  async getDataAssetById(id: ID): Promise<DataAsset | null> {
    return this.dataAssetRepository.findById(id);
  }

  async searchDataAssets(
    keyword?: string,
    page?: { page: number; pageSize: number }
  ): Promise<PageResult<DataAsset>> {
    return this.dataAssetRepository.search(keyword, page);
  }

  async createColumns(
    columns: Array<Omit<ColumnMetadata, 'id'>>
  ): Promise<{ ids: ID[] }> {
    const ids: ID[] = [];
    for (const column of columns) {
      const result = await this.columnMetadataRepository.create(column);
      ids.push(result.id);
    }
    return { ids };
  }

  async getColumnsByDataAssetId(dataAssetId: ID): Promise<ColumnMetadata[]> {
    return this.columnMetadataRepository.findByDataAssetId(dataAssetId);
  }

  async deleteColumnsByDataAssetId(dataAssetId: ID): Promise<void> {
    await this.columnMetadataRepository.deleteByDataAssetId(dataAssetId);
  }

  async createMetadataVersion(
    version: Omit<MetadataVersion, 'id' | 'createdAt'>
  ): Promise<{ id: ID }> {
    return this.metadataVersionRepository.create(version);
  }
}
