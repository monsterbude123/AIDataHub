import type {
  MetadataSourceConfig,
  DataSourceConnectionTest,
  CollectedMetadata,
} from '@ai-datahub/contract';

/**
 * Base interface for all database connectors.
 * Each connector implements connection testing and metadata collection
 * for a specific database type.
 */
export interface DatabaseConnector {
  /**
   * Test the connection to the database.
   * @param config - Connection configuration
   * @returns Connection test result with latency and server version on success
   */
  testConnection(
    config: MetadataSourceConfig
  ): Promise<DataSourceConnectionTest>;

  /**
   * Collect metadata from the database.
   * @param config - Connection configuration
   * @returns Collected metadata including databases, tables, columns, and indexes
   */
  collectMetadata(config: MetadataSourceConfig): Promise<CollectedMetadata>;
}
