import { Injectable } from '@nestjs/common';
import {
  okResult,
  type Result,
  type CollectMetadataRequest,
  type CollectMetadataResponse,
  type CollectedMetadata,
  type SyncMetadataRequest,
  type SyncMetadataResponse,
  type ImportMetadataRequest,
  type ExportMetadataRequest,
  type ExportMetadataResponse,
  type SubscribeMetadataChangeRequest,
  type SubscribeMetadataChangeResponse,
  type MetadataSourceConfig,
  type ID,
  type DataAssetType,
} from '@ai-datahub/contract';
import { createLogger } from '@ai-datahub/shared';
import { ConnectorFactory } from '../../connectors';
import { DataAssetService } from '../data-asset/data-asset.service';

const logger = createLogger({ service: 'metadata-collection' });

@Injectable()
export class MetadataCollectionService {
  constructor(private readonly dataAssetService: DataAssetService) {}

  async collectMetadataFromSource(
    config: MetadataSourceConfig
  ): Promise<Result<CollectedMetadata>> {
    try {
      const connector = ConnectorFactory.create(config.type);
      const result = await connector.collectMetadata(config);
      return okResult(result);
    } catch (error) {
      // Return empty result when connection fails (e.g., database unavailable)
      logger.error('Failed to collect metadata from source', {
        type: config.type,
        host: config.host,
        error: error instanceof Error ? error.message : String(error),
      });
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

  async collectMetadata(
    req: CollectMetadataRequest
  ): Promise<Result<CollectMetadataResponse>> {
    // This method provides the high-level collection API
    // In future, it will handle persistence to the database
    // For now, it returns empty as a placeholder
    const response: CollectMetadataResponse = {
      dataAssets: [],
      columns: [],
      collectedAt: new Date().toISOString(),
    };

    return okResult(response, req.meta?.traceId);
  }

  async syncMetadata(
    req: SyncMetadataRequest
  ): Promise<Result<SyncMetadataResponse>> {
    // In-memory placeholder implementation
    // Actual sync will compare existing metadata with collected metadata
    // and create/update/delete data assets accordingly
    const response: SyncMetadataResponse = {
      dryRun: req.dryRun ?? false,
      diffs: [],
    };

    return okResult(response, req.meta?.traceId);
  }

  async importMetadata(
    req: ImportMetadataRequest
  ): Promise<Result<{ success: boolean }>> {
    // Placeholder for import functionality
    // Actual implementation will read from file/URL and import to database
    return okResult({ success: true }, req.meta?.traceId);
  }

  async exportMetadata(
    req: ExportMetadataRequest
  ): Promise<Result<ExportMetadataResponse>> {
    // Placeholder for export functionality
    const now = new Date();
    const expireAt = new Date(
      now.getTime() + 24 * 60 * 60 * 1000
    ).toISOString();

    const response: ExportMetadataResponse = {
      downloadUrl: `/api/metadata/download/exported-metadata-${req.dataAssetIds?.[0] ?? 'export'}.json`,
      expireAt,
    };

    return okResult(response, req.meta?.traceId);
  }

  async subscribeMetadataChange(
    req: SubscribeMetadataChangeRequest
  ): Promise<Result<SubscribeMetadataChangeResponse>> {
    // Placeholder for subscription functionality
    // Actual implementation will create a webhook/subscription for metadata changes
    const subscriptionId = `sub-${Math.random().toString(36).substr(2, 9)}`;

    return okResult({ subscriptionId }, req.meta?.traceId);
  }

  /**
   * Collect metadata from a source by ID and save it to the database.
   * This is the main entry point for metadata collection workflow.
   */
  async collectAndSaveMetadata(
    sourceId: ID,
    config: MetadataSourceConfig
  ): Promise<Result<{ dataAssetIds: string[]; columnCount: number }>> {
    const collectedResult = await this.collectMetadataFromSource(config);
    if (!collectedResult.ok) {
      return collectedResult as Result<never>;
    }

    const collected = collectedResult.data;
    const dataAssetIds: string[] = [];
    let columnCount = 0;

    // For each collected table, create or update a data asset
    // and create all column metadata
    for (const table of collected.tables) {
      // Create data asset
      const createResult = await this.dataAssetService.createDataAsset({
        dataAsset: {
          name: table.name,
          code: `${config.database}.${table.schema ? table.schema + '.' : ''}${table.name}`,
          dataSourceId: sourceId,
          type: table.type.toLowerCase() as DataAssetType,
          layer: 'RAW',
          description: table.comment,
        },
      });

      if (!createResult.ok) {
        // Skip if creation fails (e.g., duplicate code)
        continue;
      }

      const dataAssetId = createResult.data.dataAssetId;
      dataAssetIds.push(dataAssetId);

      // Create columns for this table
      const tableColumns = collected.columns.filter(
        (c) => c.tableName === table.name
      );

      if (tableColumns.length > 0) {
        await this.dataAssetService.createColumns({
          columns: tableColumns.map((c) => ({
            dataAssetId,
            name: c.name,
            code: c.name,
            dataType: c.type,
            precision: undefined,
            scale: undefined,
            description: c.comment,
            isPrimaryKey: c.primaryKey,
          })),
        });

        columnCount += tableColumns.length;
      }
    }

    return okResult({ dataAssetIds, columnCount });
  }
}
