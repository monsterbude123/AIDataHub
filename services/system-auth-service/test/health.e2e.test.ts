import { describe, expect, it } from 'vitest';
import { Test } from '@nestjs/testing';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

import { HealthController } from '../src/controllers/HealthController';

// Mock guard that always allows access
@Injectable()
class MockAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    return true;
  }
}

describe('system-auth-service health', () => {
  it('GET /health should return ok Result', async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [MockAuthGuard],
    })
      .overrideGuard(MockAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    const app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter()
    );
    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    const res = await app.inject({ method: 'GET', url: '/health' });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body).toEqual({
      ok: true,
      data: { service: 'system-auth-service' },
    });

    await app.close();
  });
});
