import type {
  MetadataSourceConfig,
  DataSourceConnectionTest,
  CollectedMetadata,
  DatabaseInfo,
  TableInfo,
  ColumnInfo,
  IndexInfo,
  PartitionInfo,
} from '@ai-datahub/contract';
import type { DatabaseConnector } from './base';
import type { Pool, PoolConnection, RowDataPacket } from 'mysql2/promise';
import mysql from 'mysql2/promise';

/**
 * MySQL database connector implementation using mysql2 driver.
 */
export class MySQLConnector implements DatabaseConnector {
  private pool: Pool | null = null;

  async testConnection(
    config: MetadataSourceConfig
  ): Promise<DataSourceConnectionTest> {
    const start = Date.now();
    let connection: PoolConnection | null = null;

    try {
      // 创建临时连接池
      const pool = mysql.createPool({
        host: config.host,
        port: config.port,
        user: config.username,
        password: config.password,
        database: config.database,
        ssl: config.ssl ? { rejectUnauthorized: false } : undefined,
        connectTimeout: 10000,
        connectionLimit: 1,
      });

      connection = await pool.getConnection();

      // 获取服务器版本
      const [rows] = await connection.query<RowDataPacket[]>(
        'SELECT VERSION() as version'
      );
      const serverVersion =
        (rows as Array<{ version: string }>)[0]?.version ?? 'unknown';

      const latency = Date.now() - start;

      await connection.release();
      await pool.end();

      return {
        success: true,
        latency,
        serverVersion,
      };
    } catch (error) {
      const latency = Date.now() - start;

      return {
        success: false,
        latency,
        error:
          error instanceof Error ? error.message : 'Unknown connection error',
      };
    } finally {
      if (connection) {
        try {
          await connection.release();
        } catch {
          // Ignore release errors
        }
      }
    }
  }

  async collectMetadata(
    config: MetadataSourceConfig
  ): Promise<CollectedMetadata> {
    const pool = mysql.createPool({
      host: config.host,
      port: config.port,
      user: config.username,
      password: config.password,
      database: config.database,
      ssl: config.ssl ? { rejectUnauthorized: false } : undefined,
      connectTimeout: 30000,
      connectionLimit: 5,
    });

    try {
      const databases = await this.collectDatabases(pool, config);
      const tables = await this.collectTables(pool, config);
      const columns = await this.collectColumns(pool, config);
      const indexes = await this.collectIndexes(pool, config);
      const partitions = await this.collectPartitions(pool, config);

      return {
        databases,
        tables,
        columns,
        indexes,
        partitions,
        collectedAt: new Date().toISOString(),
      };
    } finally {
      await pool.end();
    }
  }

  private async collectDatabases(
    pool: Pool,
    config: MetadataSourceConfig
  ): Promise<DatabaseInfo[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT
        SCHEMA_NAME,
        DEFAULT_CHARACTER_SET_NAME,
        DEFAULT_COLLATION_NAME
      FROM information_schema.SCHEMATA
      WHERE SCHEMA_NAME NOT IN ('information_schema', 'mysql', 'performance_schema', 'sys')
        ${config.database ? 'AND SCHEMA_NAME = ?' : ''}
    `,
      config.database ? [config.database] : []
    );

    const typedRows = rows as Array<{
      SCHEMA_NAME: string;
      DEFAULT_CHARACTER_SET_NAME: string;
      DEFAULT_COLLATION_NAME: string;
    }>;

    return typedRows.map((row) => ({
      name: row.SCHEMA_NAME,
      charset: row.DEFAULT_CHARACTER_SET_NAME,
      collation: row.DEFAULT_COLLATION_NAME,
    }));
  }

  private async collectTables(
    pool: Pool,
    config: MetadataSourceConfig
  ): Promise<TableInfo[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT
        TABLE_SCHEMA,
        TABLE_NAME,
        TABLE_TYPE,
        TABLE_ROWS,
        DATA_LENGTH,
        TABLE_COMMENT,
        CREATE_TIME,
        UPDATE_TIME
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA NOT IN ('information_schema', 'mysql', 'performance_schema', 'sys')
        ${config.database ? 'AND TABLE_SCHEMA = ?' : ''}
    `,
      config.database ? [config.database] : []
    );

    const typedRows = rows as Array<{
      TABLE_SCHEMA: string;
      TABLE_NAME: string;
      TABLE_TYPE: string;
      TABLE_ROWS: number;
      DATA_LENGTH: number;
      TABLE_COMMENT: string;
      CREATE_TIME: Date;
      UPDATE_TIME: Date | null;
    }>;

    return typedRows.map((row) => ({
      name: row.TABLE_NAME,
      database: row.TABLE_SCHEMA,
      type: this.mapTableType(row.TABLE_TYPE),
      rowCount: row.TABLE_ROWS,
      sizeBytes: row.DATA_LENGTH,
      comment: row.TABLE_COMMENT || undefined,
      createdAt: row.CREATE_TIME?.toISOString(),
      lastModifiedAt: row.UPDATE_TIME?.toISOString(),
    }));
  }

  private mapTableType(
    mysqlType: string
  ): 'TABLE' | 'VIEW' | 'MATERIALIZED_VIEW' {
    switch (mysqlType) {
      case 'BASE TABLE':
        return 'TABLE';
      case 'VIEW':
        return 'VIEW';
      default:
        return 'TABLE';
    }
  }

  private async collectColumns(
    pool: Pool,
    config: MetadataSourceConfig
  ): Promise<ColumnInfo[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT
        TABLE_SCHEMA,
        TABLE_NAME,
        COLUMN_NAME,
        COLUMN_TYPE,
        IS_NULLABLE,
        COLUMN_KEY,
        EXTRA,
        COLUMN_DEFAULT,
        COLUMN_COMMENT,
        ORDINAL_POSITION,
        CHARACTER_SET_NAME,
        COLLATION_NAME
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA NOT IN ('information_schema', 'mysql', 'performance_schema', 'sys')
        ${config.database ? 'AND TABLE_SCHEMA = ?' : ''}
      ORDER BY TABLE_SCHEMA, TABLE_NAME, ORDINAL_POSITION
    `,
      config.database ? [config.database] : []
    );

    const typedRows = rows as Array<{
      TABLE_SCHEMA: string;
      TABLE_NAME: string;
      COLUMN_NAME: string;
      COLUMN_TYPE: string;
      IS_NULLABLE: string;
      COLUMN_KEY: string;
      EXTRA: string;
      COLUMN_DEFAULT: string | null;
      COLUMN_COMMENT: string;
      ORDINAL_POSITION: number;
      CHARACTER_SET_NAME: string | null;
      COLLATION_NAME: string | null;
    }>;

    return typedRows.map((row) => ({
      name: row.COLUMN_NAME,
      tableName: row.TABLE_NAME,
      database: row.TABLE_SCHEMA,
      type: row.COLUMN_TYPE,
      nullable: row.IS_NULLABLE === 'YES',
      primaryKey: row.COLUMN_KEY === 'PRI',
      autoIncrement: row.EXTRA.includes('auto_increment'),
      defaultValue: row.COLUMN_DEFAULT,
      comment: row.COLUMN_COMMENT || undefined,
      ordinalPosition: row.ORDINAL_POSITION,
      charset: row.CHARACTER_SET_NAME || undefined,
      collation: row.COLLATION_NAME || undefined,
    }));
  }

  private async collectIndexes(
    pool: Pool,
    config: MetadataSourceConfig
  ): Promise<IndexInfo[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT
        TABLE_SCHEMA,
        TABLE_NAME,
        INDEX_NAME,
        COLUMN_NAME,
        NON_UNIQUE,
        INDEX_TYPE
      FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA NOT IN ('information_schema', 'mysql', 'performance_schema', 'sys')
        ${config.database ? 'AND TABLE_SCHEMA = ?' : ''}
      ORDER BY TABLE_SCHEMA, TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX
    `,
      config.database ? [config.database] : []
    );

    const typedRows = rows as Array<{
      TABLE_SCHEMA: string;
      TABLE_NAME: string;
      INDEX_NAME: string;
      COLUMN_NAME: string;
      NON_UNIQUE: number;
      INDEX_TYPE: string;
    }>;

    // 聚合同一索引的多个列
    const indexMap = new Map<string, IndexInfo>();

    for (const row of typedRows) {
      const key = `${row.TABLE_SCHEMA}.${row.TABLE_NAME}.${row.INDEX_NAME}`;

      if (!indexMap.has(key)) {
        indexMap.set(key, {
          name: row.INDEX_NAME,
          tableName: row.TABLE_NAME,
          database: row.TABLE_SCHEMA,
          columns: [],
          unique: row.NON_UNIQUE === 0,
          type: row.INDEX_TYPE,
        });
      }

      indexMap.get(key)!.columns.push(row.COLUMN_NAME);
    }

    return Array.from(indexMap.values());
  }

  private async collectPartitions(
    pool: Pool,
    config: MetadataSourceConfig
  ): Promise<PartitionInfo[]> {
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        `
        SELECT
          TABLE_SCHEMA,
          TABLE_NAME,
          PARTITION_NAME,
          PARTITION_EXPRESSION,
          TABLE_ROWS,
          DATA_LENGTH
        FROM information_schema.PARTITIONS
        WHERE TABLE_SCHEMA NOT IN ('information_schema', 'mysql', 'performance_schema', 'sys')
          AND PARTITION_NAME IS NOT NULL
          ${config.database ? 'AND TABLE_SCHEMA = ?' : ''}
      `,
        config.database ? [config.database] : []
      );

      const typedRows = rows as Array<{
        TABLE_SCHEMA: string;
        TABLE_NAME: string;
        PARTITION_NAME: string;
        PARTITION_EXPRESSION: string;
        TABLE_ROWS: number;
        DATA_LENGTH: number;
      }>;

      return typedRows.map((row) => ({
        name: row.PARTITION_NAME,
        tableName: row.TABLE_NAME,
        database: row.TABLE_SCHEMA,
        value: row.PARTITION_EXPRESSION || undefined,
        rowCount: row.TABLE_ROWS,
        sizeBytes: row.DATA_LENGTH,
      }));
    } catch {
      // 分区表可能不存在
      return [];
    }
  }

  /**
   * Close connection pool if exists.
   */
  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }
}
