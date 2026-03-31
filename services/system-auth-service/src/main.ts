import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { FastifyInstance } from 'fastify';
import { createTraceId, getTraceIdFromHeaders } from '@ai-datahub/shared';

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

function setupSwagger(app: NestFastifyApplication) {
  const config = new DocumentBuilder()
    .setTitle('System Auth Service')
    .setDescription(
      '统一身份认证与访问控制服务 - 组织/用户/角色/权限管理，审批流程框架'
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

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, '0.0.0.0');
  // eslint-disable-next-line no-console
  console.log(`system-auth-service listening on port ${port}`);
  // eslint-disable-next-line no-console
  console.log(`Swagger documentation: http://localhost:${port}/api/docs`);
}

bootstrap().catch((e) => {
  // 进程启动失败不能静默
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
