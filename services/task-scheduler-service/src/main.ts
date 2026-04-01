import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
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

async function bootstrap() {
  const adapter = new FastifyAdapter();
  registerTraceMiddleware(adapter.getInstance());

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    adapter,
    { logger: ['error', 'warn', 'log'] }
  );
  const port = Number(process.env.PORT ?? 3003);
  await app.listen(port, '0.0.0.0');
}

bootstrap().catch((e) => {
  // 进程启动失败不能静默
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
