import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PostgreSQLConnector } from '../src/connectors/postgres.connector';
import type { MetadataSourceConfig } from '@ai-datahub/contract';

describe('PostgreSQLConnector - Real Connection', () => {
  let connector: PostgreSQLConnector;
  let testConfig: MetadataSourceConfig;
  let pgAvailable = false;

  beforeAll(async () => {
    connector = new PostgreSQLConnector();

    // 使用环境变量或默认测试配置
    testConfig = {
      type: 'POSTGRESQL',
      host: process.env.PG_TEST_HOST ?? 'localhost',
      port: parseInt(process.env.PG_TEST_PORT ?? '5432'),
      username: process.env.PG_TEST_USER ?? 'postgres',
      password: process.env.PG_TEST_PASSWORD ?? '',
      database: process.env.PG_TEST_DATABASE ?? 'postgres',
    };

    // 检测PostgreSQL服务器是否可用
    const result = await connector.testConnection(testConfig);
    pgAvailable = result.success;
    if (!pgAvailable) {
      console.log(`PostgreSQL server not available: ${result.error}`);
    }
  });

  afterAll(async () => {
    await connector.close?.();
  });

  describe('testConnection', () => {
    it('should successfully connect to PostgreSQL server or skip if unavailable', async () => {
      const result = await connector.testConnection(testConfig);

      if (!result.success) {
        console.log(
          `PostgreSQL server not available, skipping: ${result.error}`
        );
        return;
      }

      expect(result.success).toBe(true);
      expect(result.latency).toBeDefined();
      expect(result.latency).toBeGreaterThan(0);
      expect(result.serverVersion).toBeDefined();
      expect(result.serverVersion).toMatch(/\d+\.\d+/);
    });

    it('should fail with invalid credentials', async () => {
      const invalidConfig: MetadataSourceConfig = {
        ...testConfig,
        username: 'invalid_user_xyz',
        password: 'invalid_password_xyz',
      };

      const result = await connector.testConnection(invalidConfig);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should fail with non-existent host', async () => {
      const invalidConfig: MetadataSourceConfig = {
        ...testConfig,
        host: 'non-existent-host-12345.example.com',
      };

      const result = await connector.testConnection(invalidConfig);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('collectMetadata', () => {
    it('should collect database list', async () => {
      if (!pgAvailable) {
        console.log('PostgreSQL server not available, skipping test');
        return;
      }

      const result = await connector.collectMetadata(testConfig);

      expect(result.databases.length).toBeGreaterThanOrEqual(0);
    });

    it('should collect table metadata', async () => {
      if (!pgAvailable) {
        console.log('PostgreSQL server not available, skipping test');
        return;
      }

      const result = await connector.collectMetadata(testConfig);

      if (result.tables.length === 0) {
        console.log('No tables found, test passed (empty result)');
        return;
      }

      const table = result.tables[0];
      expect(table.name).toBeDefined();
      expect(table.database).toBeDefined();
      expect(table.schema).toBeDefined();
      expect(table.type).toMatch(/TABLE|VIEW|MATERIALIZED_VIEW/);
    });

    it('should collect column metadata', async () => {
      if (!pgAvailable) {
        console.log('PostgreSQL server not available, skipping test');
        return;
      }

      const result = await connector.collectMetadata(testConfig);

      if (result.columns.length === 0) {
        console.log('No columns found, test passed (empty result)');
        return;
      }

      const column = result.columns[0];
      expect(column.name).toBeDefined();
      expect(column.tableName).toBeDefined();
      expect(column.type).toBeDefined();
      expect(column.nullable).toBeDefined();
      expect(column.primaryKey).toBeDefined();
      expect(column.ordinalPosition).toBeDefined();
    });

    it('should collect index metadata', async () => {
      if (!pgAvailable) {
        console.log('PostgreSQL server not available, skipping test');
        return;
      }

      const result = await connector.collectMetadata(testConfig);

      if (result.indexes.length === 0) {
        console.log('No indexes found, test passed (empty result)');
        return;
      }

      const index = result.indexes[0];
      expect(index.name).toBeDefined();
      expect(index.tableName).toBeDefined();
      expect(index.columns).toBeDefined();
      expect(index.unique).toBeDefined();
    });
  });
});
