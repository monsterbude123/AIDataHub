import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import type { FastifyInstance } from 'fastify';
import { AppModule } from '../src/AppModule';
import type {
  CollectMetadataRequest,
  CollectMetadataResponse,
  CompareMetadataVersionsRequest,
  ExportMetadataRequest,
  ExportMetadataResponse,
  GetMetadataVersionsRequest,
  ImportMetadataRequest,
  Result,
  SubscribeMetadataChangeRequest,
  SubscribeMetadataChangeResponse,
  SyncMetadataRequest,
  SyncMetadataResponse,
  MetadataVersionDiff,
  PageResult,
  MetadataVersion,
} from '@ai-datahub/contract';
import { isOk } from '@ai-datahub/contract';

describe('MetadataService (e2e)', () => {
  let app: INestApplication;
  let fastify: FastifyInstance;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication(new FastifyAdapter());
    fastify = app.getHttpAdapter().getInstance();
    await app.init();
    await fastify.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/metadata/collect', async () => {
    const req: CollectMetadataRequest = {
      mode: 'MANUAL',
      dataSourceId: 'ds-1',
    };
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/metadata/collect',
      payload: req,
    });
    expect(res.statusCode).toBe(201);
    const body: Result<CollectMetadataResponse> = JSON.parse(res.payload);
    expect(isOk(body)).toBe(true);
    if (isOk(body)) {
      expect(body.data.dataAssets).toBeDefined();
      expect(body.data.columns).toBeDefined();
      expect(body.data.collectedAt).toBeDefined();
    }
  });

  it('POST /api/metadata/import', async () => {
    const req: ImportMetadataRequest = {
      format: 'TEMPLATE_V1',
      payload: {},
    };
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/metadata/import',
      payload: req,
    });
    expect(res.statusCode).toBe(201);
    const body: Result<{ success: boolean }> = JSON.parse(res.payload);
    expect(isOk(body)).toBe(true);
    if (isOk(body)) {
      expect(body.data.success).toBe(true);
    }
  });

  it('POST /api/metadata/export', async () => {
    const req: ExportMetadataRequest = {
      scope: 'ALL',
      format: 'TEMPLATE_V1',
    };
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/metadata/export',
      payload: req,
    });
    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.payload) as Result<ExportMetadataResponse>;
    expect(isOk(body)).toBe(true);
    if (isOk(body)) {
      expect(body.data.downloadUrl).toBeDefined();
      expect(body.data.expireAt).toBeDefined();
    }
  });

  it('POST /api/metadata/sync', async () => {
    const req: SyncMetadataRequest = {
      dataSourceId: 'ds-1',
      dryRun: true,
    };
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/metadata/sync',
      payload: req,
    });
    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.payload) as Result<SyncMetadataResponse>;
    expect(isOk(body)).toBe(true);
    if (isOk(body)) {
      expect(body.data.dryRun).toBe(true);
      expect(body.data.diffs).toBeDefined();
    }
  });

  it('POST /api/metadata/versions', async () => {
    const req: GetMetadataVersionsRequest = {
      dataAssetId: 'asset-1',
      page: { page: 1, pageSize: 10 },
    };
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/metadata/versions',
      payload: req,
    });
    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.payload) as Result<PageResult<MetadataVersion>>;
    expect(isOk(body)).toBe(true);
    if (isOk(body)) {
      expect(body.data.items).toBeDefined();
      expect(body.data.total).toBeDefined();
    }
  });

  it('POST /api/metadata/compare', async () => {
    const req: CompareMetadataVersionsRequest = {
      leftVersionId: 'ver-1',
      rightVersionId: 'ver-2',
    };
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/metadata/compare',
      payload: req,
    });
    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.payload) as Result<{
      diffs: MetadataVersionDiff[];
    }>;
    // Will return error since versions don't exist in empty in-memory store
    expect(isOk(body)).toBe(false);
  });

  it('POST /api/metadata/subscribe', async () => {
    const req: SubscribeMetadataChangeRequest = {
      dataSourceId: 'ds-1',
      channels: ['EMAIL'],
      target: 'user@example.com',
    };
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/metadata/subscribe',
      payload: req,
    });
    expect(res.statusCode).toBe(201);
    const body = JSON.parse(
      res.payload
    ) as Result<SubscribeMetadataChangeResponse>;
    expect(isOk(body)).toBe(true);
    if (isOk(body)) {
      expect(body.data.subscriptionId).toBeDefined();
    }
  });
});
