import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import type { FastifyInstance } from 'fastify';
import { createTraceId, getTraceIdFromHeaders } from '@ai-datahub/shared';

// Import all DTOs for Swagger schema registration
import {
  // Common DTOs
  RequestMetaDto,
  PageRequestDto,
  // Cost Management DTOs
  CostSeriesRequestDto,
  UpsertQuotaRequestDto,
  ListQuotasRequestDto,
  ListOptimizationHintsRequestDto,
  // Data Integration DTOs
  CreateDataSourceRequestDto,
  UpdateDataSourceRequestDto,
  DeleteDataSourceRequestDto,
  TestConnectionRequestDto,
  ListDataSourcesRequestDto,
  CollectMetadataRequestDto,
  SubmitAccessTaskRequestDto,
  ProfileDataRequestDto,
  PreviewDataRequestDto,
  ExecuteSqlRequestDto,
  GetTaskExecutionRequestDto,
  // Data Governance Core DTOs
  SearchAssetsRequestDto,
  TagAssetRequestDto,
  ListAssetTagsRequestDto,
  ExportLedgerRequestDto,
  CreateStandardDataElementRequestDto,
  UpdateStandardDataElementRequestDto,
  DeleteStandardDataElementRequestDto,
  ListStandardDataElementsRequestDto,
  UpsertStandardTypeMappingRequestDto,
  ListStandardTypeMappingsRequestDto,
  CreateDictionaryRequestDto,
  UpdateDictionaryRequestDto,
  DeleteDictionaryRequestDto,
  ListDictionariesRequestDto,
  GetDictionaryDataRequestDto,
  ImportDictionaryRequestDto,
  ListDictionaryCategoriesRequestDto,
  CreateDictionaryCategoryRequestDto,
  UpdateDictionaryCategoryRequestDto,
  DeleteDictionaryCategoryRequestDto,
  CreateModelRequestDto,
  ApproveModelRequestDto,
  PublishModelRequestDto,
  CreatePhysicalTablesRequestDto,
  ListModelsRequestDto,
  UpsertAuditTaskRequestDto,
  ListAuditTasksRequestDto,
  RunAuditTaskRequestDto,
  ListAuditRunsRequestDto,
} from '@ai-datahub/contract';

import { AppModule } from './AppModule';

function registerTraceMiddleware(fastify: FastifyInstance) {
  fastify.addHook('onRequest', async (req, reply) => {
    const traceId =
      getTraceIdFromHeaders(
        req.headers as Record<string, string | string[] | undefined>
      ) ?? createTraceId();
    reply.header('x-trace-id', traceId);
    (req as unknown as { traceId?: string }).traceId = traceId;
  });
}

async function bootstrap() {
  const adapter = new FastifyAdapter();
  registerTraceMiddleware(adapter.getInstance());

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    adapter,
    { logger: ['error', 'warn', 'log'] }
  );

  // Setup Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('AIDataHub Data Service API')
    .setDescription('AIDataHub 数据治理服务 API 文档')
    .setVersion('0.1.0')
    .addTag('CostManagement', '成本管理')
    .addTag('DataGovernanceCore', '数据治理核心')
    .addTag('DataIntegration', '数据集成')
    .build();

  // All request DTOs for Swagger schema registration
  const extraModels = [
    RequestMetaDto,
    PageRequestDto,
    CostSeriesRequestDto,
    UpsertQuotaRequestDto,
    ListQuotasRequestDto,
    ListOptimizationHintsRequestDto,
    CreateDataSourceRequestDto,
    UpdateDataSourceRequestDto,
    DeleteDataSourceRequestDto,
    TestConnectionRequestDto,
    ListDataSourcesRequestDto,
    CollectMetadataRequestDto,
    SubmitAccessTaskRequestDto,
    ProfileDataRequestDto,
    PreviewDataRequestDto,
    ExecuteSqlRequestDto,
    GetTaskExecutionRequestDto,
    SearchAssetsRequestDto,
    TagAssetRequestDto,
    ListAssetTagsRequestDto,
    ExportLedgerRequestDto,
    CreateStandardDataElementRequestDto,
    UpdateStandardDataElementRequestDto,
    DeleteStandardDataElementRequestDto,
    ListStandardDataElementsRequestDto,
    UpsertStandardTypeMappingRequestDto,
    ListStandardTypeMappingsRequestDto,
    CreateDictionaryRequestDto,
    UpdateDictionaryRequestDto,
    DeleteDictionaryRequestDto,
    ListDictionariesRequestDto,
    GetDictionaryDataRequestDto,
    ImportDictionaryRequestDto,
    ListDictionaryCategoriesRequestDto,
    CreateDictionaryCategoryRequestDto,
    UpdateDictionaryCategoryRequestDto,
    DeleteDictionaryCategoryRequestDto,
    CreateModelRequestDto,
    ApproveModelRequestDto,
    PublishModelRequestDto,
    CreatePhysicalTablesRequestDto,
    ListModelsRequestDto,
    UpsertAuditTaskRequestDto,
    ListAuditTasksRequestDto,
    RunAuditTaskRequestDto,
    ListAuditRunsRequestDto,
  ];

  const document = SwaggerModule.createDocument(app, config, { extraModels });
  SwaggerModule.setup('api', app, document);

  const port = Number(process.env.PORT ?? 3002);
  await app.listen(port, '0.0.0.0');
}

bootstrap().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
