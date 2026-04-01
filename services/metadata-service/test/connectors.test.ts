import { describe, it, expect } from 'vitest';
import type {
  MetadataSourceConfig,
  DataSourceConnectionTest,
  CollectedMetadata,
} from '@ai-datahub/contract';
import type { DatabaseConnector } from '../src/connectors/base';

// Mock connector for testing the interface
class MockConnector implements DatabaseConnector {
  async testConnection(
    config: MetadataSourceConfig
  ): Promise<DataSourceConnectionTest> {
    if (config.host === 'fail.example.com') {
      return { success: false, error: 'Connection refused' };
    }
    return { success: true, latency: 45, serverVersion: '1.0.0-mock' };
  }

  async collectMetadata(
    config: MetadataSourceConfig
  ): Promise<CollectedMetadata> {
    return {
      databases: [{ name: config.database ?? 'mock_db' }],
      tables: [
        {
          name: 'users',
          database: config.database ?? 'mock_db',
          type: 'TABLE',
          rowCount: 100,
        },
      ],
      columns: [
        {
          name: 'id',
          tableName: 'users',
          database: config.database ?? 'mock_db',
          type: 'int',
          nullable: false,
          primaryKey: true,
          autoIncrement: true,
          ordinalPosition: 1,
        },
      ],
      indexes: [],
      partitions: [],
      collectedAt: new Date().toISOString(),
    };
  }
}

describe('DatabaseConnector Interface', () => {
  const mockConfig: MetadataSourceConfig = {
    type: 'MYSQL',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: 'secret',
    database: 'testdb',
  };

  it('should define testConnection method', async () => {
    const connector = new MockConnector();
    const result = await connector.testConnection(mockConfig);

    expect(result.success).toBe(true);
    expect(result.latency).toBeDefined();
    expect(result.serverVersion).toBeDefined();
  });

  it('should handle connection failure', async () => {
    const connector = new MockConnector();
    const failConfig = { ...mockConfig, host: 'fail.example.com' };
    const result = await connector.testConnection(failConfig);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should define collectMetadata method', async () => {
    const connector = new MockConnector();
    const result = await connector.collectMetadata(mockConfig);

    expect(result.databases).toHaveLength(1);
    expect(result.tables).toHaveLength(1);
    expect(result.columns).toHaveLength(1);
    expect(result.collectedAt).toBeDefined();
  });

  it('should return metadata with correct structure', async () => {
    const connector = new MockConnector();
    const result = await connector.collectMetadata(mockConfig);

    const table = result.tables[0];
    expect(table.name).toBe('users');
    expect(table.type).toBe('TABLE');

    const column = result.columns[0];
    expect(column.name).toBe('id');
    expect(column.primaryKey).toBe(true);
  });
});

describe('ConnectorFactory', () => {
  it('should be defined', async () => {
    const { ConnectorFactory } = await import('../src/connectors/factory');
    expect(ConnectorFactory).toBeDefined();
  });

  it('should create MySQL connector', async () => {
    const { ConnectorFactory } = await import('../src/connectors/factory');
    const connector = ConnectorFactory.create('MYSQL');
    expect(connector).toBeDefined();
  });

  it('should create PostgreSQL connector', async () => {
    const { ConnectorFactory } = await import('../src/connectors/factory');
    const connector = ConnectorFactory.create('POSTGRESQL');
    expect(connector).toBeDefined();
  });

  it('should throw for unsupported type', async () => {
    const { ConnectorFactory } = await import('../src/connectors/factory');
    expect(() => ConnectorFactory.create('HIVE')).toThrow(
      'Unsupported connector type: HIVE'
    );
  });
});
