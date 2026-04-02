import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { FastifyInstance } from 'fastify';
import {
  createTraceId,
  getTraceIdFromHeaders,
  createLogger,
} from '@ai-datahub/shared';

import { AppModule } from './AppModule';

const logger = createLogger({ service: 'metadata-service' });

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

function setupSwagger(app: NestFastifyApplication) {
  const config = new DocumentBuilder()
    .setTitle('Metadata Service')
    .setDescription(
      '元数据管理服务 - 数据源连接管理、数据资产管理、元数据采集、版本历史管理'
    )
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
}

async function bootstrap() {
  const adapter = new FastifyAdapter();
  registerTraceMiddleware(adapter.getInstance());

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    adapter,
    { logger: ['error', 'warn', 'log'] }
  );

  // Setup Swagger API documentation
  setupSwagger(app);

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port, '0.0.0.0');
  const dbPath = process.env.DATABASE_URL;
  logger.info('Database URL configured', { dbPath });
  logger.info('service started', { port, service: 'metadata-service' });
  logger.info('Swagger documentation available', {
    url: `http://localhost:${port}/api/docs`,
  });
}

bootstrap().catch((e) => {
  // 进程启动失败不能静默
  logger.error('failed to start service', e);
  process.exit(1);
});
