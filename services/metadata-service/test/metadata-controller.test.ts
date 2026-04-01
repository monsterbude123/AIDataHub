import 'reflect-metadata';

import { describe, it, expect, beforeAll } from 'vitest';
import { MetadataController } from '../src/modules/metadata/metadata.controller';
import { MetadataService } from '../src/modules/metadata/metadata.service';
import type {
  CreateMetadataSourceRequest,
  TestMetadataConnectionRequest,
  ListMetadataSourcesRequest,
} from '@ai-datahub/contract';

describe('MetadataController', () => {
  let controller: MetadataController;
  let service: MetadataService;

  beforeAll(() => {
    service = new MetadataService();
    controller = new MetadataController(service);
  });

  describe('POST /metadata/sources', () => {
    it('should create a metadata source', async () => {
      const request: CreateMetadataSourceRequest = {
        name: 'Test MySQL',
        type: 'MYSQL',
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: 'secret',
        database: 'test',
      };

      const result = await controller.createSource(request);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.id).toBeDefined();
        expect(result.data.name).toBe('Test MySQL');
        expect(result.data.type).toBe('MYSQL');
      }
    });
  });

  describe('POST /metadata/sources/test-connection', () => {
    it('should test connection to a database', async () => {
      const request: TestMetadataConnectionRequest = {
        type: 'MYSQL',
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: '',
      };

      const result = await controller.testConnection(request);

      expect(result.ok).toBe(true);
    });
  });

  describe('GET /metadata/sources', () => {
    it('should list metadata sources', async () => {
      // 先创建一些数据源
      await service.createMetadataSource({
        name: 'Source 1',
        type: 'MYSQL',
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: 'secret',
      });

      const request: ListMetadataSourcesRequest = {};
      const result = await controller.listSources(request);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.items.length).toBeGreaterThanOrEqual(1);
        expect(result.data.total).toBeGreaterThanOrEqual(1);
      }
    });

    it('should filter by type', async () => {
      const request: ListMetadataSourcesRequest = { type: 'MYSQL' };
      const result = await controller.listSources(request);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.items.every((s) => s.type === 'MYSQL')).toBe(true);
      }
    });
  });

  describe('GET /metadata/sources/:id', () => {
    it('should get a source by id', async () => {
      const createResult = await service.createMetadataSource({
        name: 'Test Source',
        type: 'POSTGRESQL',
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        password: 'secret',
      });

      if (createResult.ok) {
        const result = await controller.getSource(createResult.data.id);

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.data.name).toBe('Test Source');
        }
      }
    });

    it('should return 404 for non-existent source', async () => {
      const result = await controller.getSource('non-existent-id');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe('SOURCE_NOT_FOUND');
      }
    });
  });

  describe('POST /metadata/sources/:id/collect', () => {
    it('should collect metadata from a source', async () => {
      const createResult = await service.createMetadataSource({
        name: 'MySQL Test',
        type: 'MYSQL',
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: '',
        database: 'test',
      });

      if (createResult.ok) {
        const result = await controller.collectFromSource(createResult.data.id);

        // 如果MySQL不可用，测试仍然应该返回ok（即使数据为空）
        expect(result.ok).toBe(true);
      }
    });
  });
});
