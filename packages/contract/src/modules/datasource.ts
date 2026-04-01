import type { ID, ISODateTime } from '../types';

// ============================================================================
// Metadata Source Types (for structured database connectors)
// ============================================================================

/**
 * Supported database types for metadata collection.
 * Distinct from the generic DataSourceType in types/index.ts which uses JDBC-style connections.
 */
export type MetadataSourceType = 'MYSQL' | 'POSTGRESQL' | 'HIVE' | 'CLICKHOUSE';

/**
 * Status of a metadata source.
 */
export type MetadataSourceStatus = 'ACTIVE' | 'INACTIVE' | 'ERROR';

/**
 * Configuration for connecting to a database for metadata collection.
 */
export interface MetadataSourceConfig {
  type: MetadataSourceType;
  host: string;
  port: number;
  username: string;
  password: string;
  database?: string;
  ssl?: boolean;
  extra?: Record<string, unknown>;
}

/**
 * A configured database source for metadata collection.
 */
export interface MetadataSource {
  id: ID;
  name: string;
  type: MetadataSourceType;
  host: string;
  port: number;
  username: string;
  passwordEncrypted: string;
  database?: string;
  status: MetadataSourceStatus;
  lastCollectedAt?: ISODateTime;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface DataSourceConnectionTest {
  success: boolean;
  latency?: number;
  serverVersion?: string;
  error?: string;
}

// ============================================================================
// Collected Metadata Types
// ============================================================================

export interface DatabaseInfo {
  name: string;
  charset?: string;
  collation?: string;
  sizeBytes?: number;
}

export interface TableInfo {
  name: string;
  database: string;
  schema?: string;
  type: 'TABLE' | 'VIEW' | 'MATERIALIZED_VIEW';
  rowCount?: number;
  sizeBytes?: number;
  comment?: string;
  createdAt?: ISODateTime;
  lastModifiedAt?: ISODateTime;
}

export interface ColumnInfo {
  name: string;
  tableName: string;
  database: string;
  type: string;
  nullable: boolean;
  primaryKey: boolean;
  autoIncrement: boolean;
  defaultValue?: unknown;
  comment?: string;
  ordinalPosition: number;
  charset?: string;
  collation?: string;
}

export interface IndexInfo {
  name: string;
  tableName: string;
  database: string;
  columns: string[];
  unique: boolean;
  type?: string;
  comment?: string;
}

export interface PartitionInfo {
  name: string;
  tableName: string;
  database: string;
  value?: string;
  rowCount?: number;
  sizeBytes?: number;
}

export interface CollectedMetadata {
  databases: DatabaseInfo[];
  tables: TableInfo[];
  columns: ColumnInfo[];
  indexes: IndexInfo[];
  partitions: PartitionInfo[];
  collectedAt: ISODateTime;
}

// ============================================================================
// Request/Response Types (renamed to avoid conflicts with data-integration module)
// ============================================================================

export interface CreateMetadataSourceRequest {
  meta?: { traceId?: string };
  name: string;
  type: MetadataSourceType;
  host: string;
  port: number;
  username: string;
  password: string;
  database?: string;
  ssl?: boolean;
  extra?: Record<string, unknown>;
}

export interface UpdateMetadataSourceRequest {
  meta?: { traceId?: string };
  name?: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
  ssl?: boolean;
  extra?: Record<string, unknown>;
}

export interface TestMetadataConnectionRequest {
  meta?: { traceId?: string };
  type: MetadataSourceType;
  host: string;
  port: number;
  username: string;
  password: string;
  database?: string;
  ssl?: boolean;
  extra?: Record<string, unknown>;
}

export interface ListMetadataSourcesRequest {
  meta?: { traceId?: string };
  type?: MetadataSourceType;
  status?: MetadataSourceStatus;
  page?: number;
  pageSize?: number;
}

export interface MetadataSourceListResult {
  items: MetadataSource[];
  total: number;
  page: number;
  pageSize: number;
}

// ============================================================================
// Extended CollectMetadataRequest (with inline config)
// ============================================================================

export interface ExtendedCollectMetadataRequest {
  meta?: { traceId?: string };
  dataSourceId?: ID;
  config?: MetadataSourceConfig;
  scope: 'FULL' | 'INCREMENTAL';
  includeDatabases?: string[];
  excludeDatabases?: string[];
  includeTables?: string[];
  excludeTables?: string[];
}
