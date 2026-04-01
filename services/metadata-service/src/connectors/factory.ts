import type { MetadataSourceType } from '@ai-datahub/contract';
import type { DatabaseConnector } from './base';
import { MySQLConnector } from './mysql.connector';
import { PostgreSQLConnector } from './postgres.connector';

/**
 * Factory for creating database connectors.
 */
export const ConnectorFactory = {
  /**
   * Create a connector for the specified database type.
   * @param type - Database type
   * @returns Database connector instance
   * @throws Error if the connector type is not supported
   */
  create(type: MetadataSourceType): DatabaseConnector {
    switch (type) {
      case 'MYSQL':
        return new MySQLConnector();
      case 'POSTGRESQL':
        return new PostgreSQLConnector();
      case 'HIVE':
      case 'CLICKHOUSE':
        throw new Error(`Unsupported connector type: ${type}`);
      default:
        throw new Error(`Unknown connector type: ${type}`);
    }
  },
};
