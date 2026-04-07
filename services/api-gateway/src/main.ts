import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import { AppModule } from './AppModule';

/**
 * API Gateway main entry point
 *
 * Responsibilities:
 * - Unified entry point for all API requests
 * - CORS handling for browser clients
 * - traceId generation and propagation
 * - Request logging
 * - Path-based routing to backend microservices
 */
async function bootstrap() {
  const port = process.env.PORT || 3000;
  // Fix: When using FastifyAdapter with NestJS, do NOT call app.enableCors()
  // NestJS automatically registers @fastify/cors which causes duplicate OPTIONS route
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    { logger: ['log', 'warn', 'error'] }
  );

  // DO NOT enableCors here - it causes duplicate OPTIONS route registration with FastifyAdapter

  // Setup Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('AIDataHub API Gateway')
    .setDescription('AI DataHub Unified API Gateway')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Start server
  await app.listen(port, '0.0.0.0');

  const logger = new Logger('Bootstrap');
  logger.log(`API Gateway listening on http://0.0.0.0:${port}`);
  logger.log(`Swagger UI available at http://0.0.0.0:${port}/api/docs`);
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start API Gateway', err);
  process.exit(1);
});
