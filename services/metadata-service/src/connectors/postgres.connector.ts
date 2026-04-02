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
import type { Pool, PoolClient } from 'pg';
import { Pool as PgPool } from 'pg';

/**
 * PostgreSQL database connector implementation using pg driver.
 */
export class PostgreSQLConnector implements DatabaseConnector {
  private pool: Pool | null = null;

  async testConnection(
    config: MetadataSourceConfig
  ): Promise<DataSourceConnectionTest> {
    const start = Date.now();
    let client: PoolClient | null = null;

    try {
      const pool = new PgPool({
        host: config.host,
        port: config.port,
        user: config.username,
        password: config.password,
        database: config.database ?? 'postgres',
        ssl: config.ssl ? { rejectUnauthorized: false } : undefined,
        connectionTimeoutMillis: 10000,
        max: 1,
      });

      client = await pool.connect();

      // 获取服务器版本
      const result = await client.query<{ version: string }>(
        'SELECT version()'
      );
      const versionString = result.rows[0]?.version ?? '';
      const versionMatch = versionString.match(/PostgreSQL\s+(\d+\.\d+)/);
      const serverVersion = versionMatch?.[1] ?? versionString.split(',')[0];

      const latency = Date.now() - start;

      client.release();
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
      if (client) {
        try {
          client.release();
        } catch {
          // Ignore release errors
        }
      }
    }
  }

  async collectMetadata(
    config: MetadataSourceConfig
  ): Promise<CollectedMetadata> {
    const pool = new PgPool({
      host: config.host,
      port: config.port,
      user: config.username,
      password: config.password,
      database: config.database ?? 'postgres',
      ssl: config.ssl ? { rejectUnauthorized: false } : undefined,
      connectionTimeoutMillis: 30000,
      max: 5,
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
    const result = await pool.query<{
      datname: string;
      encoding: string;
      collate: string;
    }>(
      `
      SELECT
        datname,
        pg_encoding_to_char(encoding) as encoding,
        datcollate as collate
      FROM pg_database
      WHERE datistemplate = false
        AND datname NOT IN ('postgres')
        ${config.database ? 'AND datname = $1' : ''}
    `,
      config.database ? [config.database] : []
    );

    return result.rows.map(
      (row: { datname: string; encoding: string; collate: string }) => ({
        name: row.datname,
        charset: row.encoding,
        collation: row.collate,
      })
    );
  }

  private async collectTables(
    pool: Pool,
    config: MetadataSourceConfig
  ): Promise<TableInfo[]> {
    const schema = (config.extra?.schema as string) ?? 'public';

    const result = await pool.query<{
      table_schema: string;
      table_name: string;
      table_type: string;
      row_count: number | null;
      table_size: string | null;
      table_comment: string | null;
    }>(
      `
      SELECT
        t.table_schema,
        t.table_name,
        t.table_type,
        c.reltuples::bigint as row_count,
        pg_size_pretty(pg_total_relation_size(c.oid)) as table_size,
        obj_description(c.oid) as table_comment
      FROM information_schema.tables t
      LEFT JOIN pg_class c ON c.relname = t.table_name
      LEFT JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = t.table_schema
      WHERE t.table_schema = $1
        AND t.table_type IN ('BASE TABLE', 'VIEW')
    `,
      [schema]
    );

    return result.rows.map(
      (row: {
        table_schema: string;
        table_name: string;
        table_type: string;
        row_count: number | null;
        table_size: string | null;
        table_comment: string | null;
      }) => ({
        name: row.table_name,
        database: config.database ?? 'postgres',
        schema: row.table_schema,
        type: this.mapTableType(row.table_type),
        rowCount: row.row_count ?? undefined,
        comment: row.table_comment ?? undefined,
      })
    );
  }

  private mapTableType(pgType: string): 'TABLE' | 'VIEW' | 'MATERIALIZED_VIEW' {
    switch (pgType) {
      case 'BASE TABLE':
        return 'TABLE';
      case 'VIEW':
        return 'VIEW';
      case 'MATERIALIZED VIEW':
        return 'MATERIALIZED_VIEW';
      default:
        return 'TABLE';
    }
  }

  private async collectColumns(
    pool: Pool,
    config: MetadataSourceConfig
  ): Promise<ColumnInfo[]> {
    const schema = (config.extra?.schema as string) ?? 'public';

    const result = await pool.query<{
      table_schema: string;
      table_name: string;
      column_name: string;
      data_type: string;
      is_nullable: string;
      column_default: string | null;
      ordinal_position: number;
      character_maximum_length: number | null;
      numeric_precision: number | null;
      numeric_scale: number | null;
      column_comment: string | null;
    }>(
      `
      SELECT
        c.table_schema,
        c.table_name,
        c.column_name,
        c.data_type,
        c.is_nullable,
        c.column_default,
        c.ordinal_position,
        c.character_maximum_length,
        c.numeric_precision,
        c.numeric_scale,
        col_description(pgc.oid, c.ordinal_position) as column_comment
      FROM information_schema.columns c
      LEFT JOIN pg_class pgc ON pgc.relname = c.table_name
      LEFT JOIN pg_namespace n ON n.oid = pgc.relnamespace AND n.nspname = c.table_schema
      WHERE c.table_schema = $1
      ORDER BY c.table_name, c.ordinal_position
    `,
      [schema]
    );

    // 获取主键信息
    const pkResult = await pool.query<{
      table_name: string;
      column_name: string;
    }>(
      `
      SELECT
        kcu.table_name,
        kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      WHERE tc.constraint_type = 'PRIMARY KEY'
        AND tc.table_schema = $1
    `,
      [schema]
    );

    const primaryKeys = new Set(
      pkResult.rows.map(
        (r: { table_name: string; column_name: string }) =>
          `${r.table_name}.${r.column_name}`
      )
    );

    return result.rows.map(
      (row: {
        table_schema: string;
        table_name: string;
        column_name: string;
        data_type: string;
        is_nullable: string;
        column_default: string | null;
        ordinal_position: number;
        character_maximum_length: number | null;
        numeric_precision: number | null;
        numeric_scale: number | null;
        column_comment: string | null;
      }) => {
        let type = row.data_type;
        if (row.character_maximum_length) {
          type = `${type}(${row.character_maximum_length})`;
        } else if (row.numeric_precision && row.numeric_scale) {
          type = `${type}(${row.numeric_precision},${row.numeric_scale})`;
        } else if (row.numeric_precision) {
          type = `${type}(${row.numeric_precision})`;
        }

        const key = `${row.table_name}.${row.column_name}`;

        return {
          name: row.column_name,
          tableName: row.table_name,
          database: config.database ?? 'postgres',
          schema: row.table_schema,
          type,
          nullable: row.is_nullable === 'YES',
          primaryKey: primaryKeys.has(key),
          autoIncrement:
            row.column_default?.includes('nextval') ??
            row.column_default?.includes('serial') ??
            false,
          defaultValue: row.column_default,
          comment: row.column_comment ?? undefined,
          ordinalPosition: row.ordinal_position,
        };
      }
    );
  }

  private async collectIndexes(
    pool: Pool,
    config: MetadataSourceConfig
  ): Promise<IndexInfo[]> {
    const schema = (config.extra?.schema as string) ?? 'public';

    const result = await pool.query<{
      schemaname: string;
      tablename: string;
      indexname: string;
      indexdef: string;
    }>(
      `
      SELECT
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE schemaname = $1
    `,
      [schema]
    );

    return result.rows.map(
      (row: {
        schemaname: string;
        tablename: string;
        indexname: string;
        indexdef: string;
      }) => {
        const isUnique = row.indexdef.includes(' UNIQUE ');
        const columnsMatch = row.indexdef.match(/\(([^)]+)\)/);
        const columns = columnsMatch
          ? columnsMatch[1]
              .split(',')
              .map((c: string) => c.trim().replace(/"/g, ''))
          : [];

        return {
          name: row.indexname,
          tableName: row.tablename,
          database: config.database ?? 'postgres',
          columns,
          unique: isUnique,
          type: 'btree',
        };
      }
    );
  }

  private async collectPartitions(
    pool: Pool,
    config: MetadataSourceConfig
  ): Promise<PartitionInfo[]> {
    try {
      const schema = (config.extra?.schema as string) ?? 'public';

      const result = await pool.query<{
        parent_table: string;
        partition_name: string;
        expression: string | null;
      }>(
        `
        SELECT
          parent.relname as parent_table,
          child.relname as partition_name,
          pg_get_expr(child.relpartbound, child.oid) as expression
        FROM pg_inherits
        JOIN pg_class parent ON pg_inherits.inhparent = parent.oid
        JOIN pg_class child ON pg_inherits.inhrelid = child.oid
        JOIN pg_namespace n ON n.oid = parent.relnamespace
        WHERE n.nspname = $1
      `,
        [schema]
      );

      return result.rows.map(
        (row: {
          parent_table: string;
          partition_name: string;
          expression: string | null;
        }) => ({
          name: row.partition_name,
          tableName: row.parent_table,
          database: config.database ?? 'postgres',
          value: row.expression ?? undefined,
        })
      );
    } catch {
      // 分区表可能不存在或权限不足
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
