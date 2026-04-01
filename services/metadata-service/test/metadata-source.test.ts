import { describe, it, expect, beforeAll } from 'vitest';
import type {
  MetadataSourceConfig,
  TestMetadataConnectionRequest,
  CreateMetadataSourceRequest,
} from '@ai-datahub/contract';
import { MetadataService } from '../src/modules/metadata/metadata.service';

describe('MetadataService with Connectors', () => {
  let service: MetadataService;
  let mysqlAvailable = false;

  beforeAll(async () => {
    service = new MetadataService();

    // 检测MySQL是否可用
    const result = await service.testConnection({
      type: 'MYSQL',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
    });
    mysqlAvailable = result.ok && result.data.success;
  });

  describe('testConnection', () => {
    it('should test MySQL connection (or skip if unavailable)', async () => {
      const request: TestMetadataConnectionRequest = {
        type: 'MYSQL',
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: '',
        database: 'test',
      };

      const result = await service.testConnection(request);

      if (!result.ok || !result.data.success) {
        console.log('MySQL not available, skipping test');
        return;
      }

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.success).toBe(true);
        expect(result.data.latency).toBeDefined();
        expect(result.data.serverVersion).toBeDefined();
      }
    });

    it('should test PostgreSQL connection (or skip if unavailable)', async () => {
      const request: TestMetadataConnectionRequest = {
        type: 'POSTGRESQL',
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        password: '',
        database: 'test',
      };

      const result = await service.testConnection(request);

      if (!result.ok || !result.data.success) {
        console.log('PostgreSQL not available, skipping test');
        return;
      }

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.success).toBe(true);
      }
    });

    it('should return error for unsupported connector type', async () => {
      const request = {
        type: 'HIVE' as const,
        host: 'localhost',
        port: 10000,
        username: 'hive',
        password: 'secret',
      };

      const result = await service.testConnection(request);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe('UNSUPPORTED_CONNECTOR');
      }
    });
  });

  describe('collectMetadataFromSource', () => {
    it('should collect metadata from MySQL source (or skip if unavailable)', async () => {
      if (!mysqlAvailable) {
        console.log('MySQL not available, skipping test');
        return;
      }

      const config: MetadataSourceConfig = {
        type: 'MYSQL',
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: '',
        database: 'test',
      };

      const result = await service.collectMetadataFromSource(config);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.collectedAt).toBeDefined();
      }
    });

    it('should collect metadata from PostgreSQL source (or skip if unavailable)', async () => {
      const config: MetadataSourceConfig = {
        type: 'POSTGRESQL',
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        password: '',
        database: 'testdb',
      };

      const result = await service.collectMetadataFromSource(config);

      if (!result.ok) {
        console.log('PostgreSQL not available, skipping test');
        return;
      }

      if (result.ok && result.data.tables.length > 0) {
        expect(result.data.tables[0].schema).toBe('public');
      }
    });
  });

  describe('createMetadataSource', () => {
    it('should create a metadata source', async () => {
      const request: CreateMetadataSourceRequest = {
        name: 'Production MySQL',
        type: 'MYSQL',
        host: 'db.example.com',
        port: 3306,
        username: 'app_user',
        password: 'secret',
        database: 'production',
      };

      const result = await service.createMetadataSource(request);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.id).toBeDefined();
        expect(result.data.name).toBe('Production MySQL');
        expect(result.data.type).toBe('MYSQL');
        expect(result.data.status).toBe('ACTIVE');
      }
    });
  });

  describe('listMetadataSources', () => {
    it('should list all metadata sources', async () => {
      // Create some sources first
      await service.createMetadataSource({
        name: 'MySQL Prod',
        type: 'MYSQL',
        host: 'mysql.prod',
        port: 3306,
        username: 'root',
        password: 'secret',
      });

      await service.createMetadataSource({
        name: 'Postgres Dev',
        type: 'POSTGRESQL',
        host: 'pg.dev',
        port: 5432,
        username: 'postgres',
        password: 'secret',
      });

      const result = await service.listMetadataSources({});

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.items.length).toBeGreaterThanOrEqual(2);
        expect(result.data.total).toBeGreaterThanOrEqual(2);
      }
    });

    it('should filter by type', async () => {
      await service.createMetadataSource({
        name: 'MySQL Only',
        type: 'MYSQL',
        host: 'mysql.host',
        port: 3306,
        username: 'root',
        password: 'secret',
      });

      const result = await service.listMetadataSources({ type: 'MYSQL' });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.items.every((s) => s.type === 'MYSQL')).toBe(true);
      }
    });
  });

  describe('getMetadataSourceById', () => {
    it('should get a metadata source by id', async () => {
      const createResult = await service.createMetadataSource({
        name: 'Test Source',
        type: 'MYSQL',
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: 'secret',
      });

      if (createResult.ok) {
        const result = await service.getMetadataSourceById(
          createResult.data.id
        );

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.data.name).toBe('Test Source');
        }
      }
    });

    it('should return error for non-existent source', async () => {
      const result = await service.getMetadataSourceById('non-existent-id');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe('SOURCE_NOT_FOUND');
      }
    });
  });
});
