import { describe, it, expect } from 'vitest';
import type {
  MetadataSourceType,
  MetadataSourceConfig,
  MetadataSource,
  DataSourceConnectionTest,
  CollectedMetadata,
  TableInfo,
  ColumnInfo,
  IndexInfo,
  CreateMetadataSourceRequest,
  TestMetadataConnectionRequest,
} from '../src/modules/datasource';

describe('MetadataSource Types', () => {
  it('should define MetadataSourceType correctly', () => {
    const types: MetadataSourceType[] = [
      'MYSQL',
      'POSTGRESQL',
      'HIVE',
      'CLICKHOUSE',
    ];
    expect(types).toHaveLength(4);
  });

  it('should define MetadataSourceConfig with required fields', () => {
    const config: MetadataSourceConfig = {
      type: 'MYSQL',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'secret',
      database: 'testdb',
    };

    expect(config.type).toBe('MYSQL');
    expect(config.host).toBe('localhost');
    expect(config.port).toBe(3306);
    expect(config.ssl).toBeUndefined();
  });

  it('should define MetadataSourceConfig with optional fields', () => {
    const config: MetadataSourceConfig = {
      type: 'POSTGRESQL',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'secret',
      database: 'testdb',
      ssl: true,
      extra: {
        schema: 'public',
        connectionTimeout: 30000,
      },
    };

    expect(config.ssl).toBe(true);
    expect(config.extra?.schema).toBe('public');
  });

  it('should define MetadataSource with all fields', () => {
    const source: MetadataSource = {
      id: 'ds-001',
      name: 'Production MySQL',
      type: 'MYSQL',
      host: 'db.example.com',
      port: 3306,
      username: 'app_user',
      passwordEncrypted: 'encrypted_string',
      database: 'production',
      status: 'ACTIVE',
      lastCollectedAt: '2026-04-01T00:00:00Z',
      createdAt: '2026-04-01T00:00:00Z',
      updatedAt: '2026-04-01T00:00:00Z',
    };

    expect(source.id).toBe('ds-001');
    expect(source.status).toBe('ACTIVE');
    expect(source.passwordEncrypted).toBeDefined();
  });

  it('should define TableInfo with all fields', () => {
    const table: TableInfo = {
      name: 'users',
      database: 'production',
      schema: 'public',
      type: 'TABLE',
      rowCount: 10000,
      comment: 'User accounts table',
      createdAt: '2026-01-01T00:00:00Z',
    };

    expect(table.name).toBe('users');
    expect(table.type).toBe('TABLE');
    expect(table.rowCount).toBe(10000);
  });

  it('should define ColumnInfo with all fields', () => {
    const column: ColumnInfo = {
      name: 'id',
      tableName: 'users',
      database: 'production',
      type: 'int',
      nullable: false,
      primaryKey: true,
      autoIncrement: true,
      defaultValue: null,
      comment: 'Primary key',
      ordinalPosition: 1,
    };

    expect(column.name).toBe('id');
    expect(column.primaryKey).toBe(true);
    expect(column.ordinalPosition).toBe(1);
  });

  it('should define IndexInfo with all fields', () => {
    const index: IndexInfo = {
      name: 'idx_users_email',
      tableName: 'users',
      database: 'production',
      columns: ['email'],
      unique: true,
      type: 'BTREE',
    };

    expect(index.name).toBe('idx_users_email');
    expect(index.unique).toBe(true);
    expect(index.columns).toContain('email');
  });

  it('should define CollectedMetadata structure', () => {
    const metadata: CollectedMetadata = {
      databases: [{ name: 'production', charset: 'utf8mb4' }],
      tables: [],
      columns: [],
      indexes: [],
      partitions: [],
      collectedAt: '2026-04-01T00:00:00Z',
    };

    expect(metadata.databases).toHaveLength(1);
    expect(metadata.collectedAt).toBeDefined();
  });

  it('should define CreateMetadataSourceRequest', () => {
    const req: CreateMetadataSourceRequest = {
      name: 'New MySQL',
      type: 'MYSQL',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'secret',
      database: 'test',
    };

    expect(req.name).toBe('New MySQL');
    expect(req.type).toBe('MYSQL');
  });

  it('should define TestMetadataConnectionRequest', () => {
    const req: TestMetadataConnectionRequest = {
      type: 'MYSQL',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'secret',
      database: 'test',
    };

    expect(req.type).toBe('MYSQL');
  });

  it('should define DataSourceConnectionTest success case', () => {
    const result: DataSourceConnectionTest = {
      success: true,
      latency: 45,
      serverVersion: '8.0.32',
    };

    expect(result.success).toBe(true);
    expect(result.latency).toBe(45);
    expect(result.serverVersion).toBe('8.0.32');
  });

  it('should define DataSourceConnectionTest error case', () => {
    const result: DataSourceConnectionTest = {
      success: false,
      error: 'Connection refused',
    };

    expect(result.success).toBe(false);
    expect(result.error).toBe('Connection refused');
  });
});
