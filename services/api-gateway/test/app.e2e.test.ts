import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from '../src/AppModule';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createServer, type Server } from 'http';

describe('AppController (e2e)', () => {
  let app: NestFastifyApplication;
  let gatewayBaseUrl: string;
  let opsTargetUrl: string;
  let adminTargetUrl: string;
  let integrationTargetUrl: string;
  let sharingTargetUrl: string;
  let analyticsTargetUrl: string;
  let securityTargetUrl: string;
  let tasksTargetUrl: string;
  let authTargetUrl: string;
  let metadataTargetUrl: string;
  let dataTargetUrl: string;
  let closeOps: (() => Promise<void>) | undefined;
  let closeAdmin: (() => Promise<void>) | undefined;
  let closeIntegration: (() => Promise<void>) | undefined;
  let closeSharing: (() => Promise<void>) | undefined;
  let closeAnalytics: (() => Promise<void>) | undefined;
  let closeSecurity: (() => Promise<void>) | undefined;
  let closeTasks: (() => Promise<void>) | undefined;
  let closeAuth: (() => Promise<void>) | undefined;
  let closeMetadata: (() => Promise<void>) | undefined;
  let closeData: (() => Promise<void>) | undefined;
  let gatewayListener: Server | undefined;

  beforeAll(async () => {
    const makeBackend = async (
      responder: (req: import('http').IncomingMessage) => {
        status: number;
        body: unknown;
        headers?: Record<string, string>;
      }
    ) => {
      const server = createServer(async (req, res) => {
        const result = responder(req);
        res.statusCode = result.status;
        res.setHeader('content-type', 'application/json');
        if (result.headers) {
          for (const [k, v] of Object.entries(result.headers)) {
            res.setHeader(k, v);
          }
        }
        res.end(JSON.stringify(result.body));
      });
      await new Promise<void>((resolve) => server.listen(0, resolve));
      const addr = server.address();
      if (!addr || typeof addr === 'string') {
        throw new Error('Failed to bind backend server');
      }
      const baseUrl = `http://127.0.0.1:${addr.port}`;
      const close = () =>
        new Promise<void>((resolve, reject) => {
          server.close((err) => (err ? reject(err) : resolve()));
        });
      return { baseUrl, close };
    };

    // Stub ops backend
    const ops = await makeBackend((req) => {
      if (req.url === '/alerts/rules' && req.method === 'GET') {
        return {
          status: 200,
          body: {
            ok: true,
            data: {
              backend: 'ops',
              url: req.url,
              method: req.method,
              traceId: req.headers['x-trace-id'] ?? null,
              authorization: req.headers['authorization'] ?? null,
            },
          },
        };
      }
      return {
        status: 404,
        body: {
          ok: false,
          error: {
            code: 'NOT_FOUND',
            message: 'no route',
            level: 'ERROR',
          },
        },
      };
    });
    opsTargetUrl = ops.baseUrl;
    closeOps = ops.close;

    // Stub admin backend
    const admin = await makeBackend((req) => {
      if (req.url === '/projects' && req.method === 'GET') {
        return {
          status: 200,
          body: {
            ok: true,
            data: {
              backend: 'admin',
              url: req.url,
              method: req.method,
              traceId: req.headers['x-trace-id'] ?? null,
            },
          },
        };
      }
      return { status: 404, body: { ok: false, error: { code: 'NOT_FOUND' } } };
    });
    adminTargetUrl = admin.baseUrl;
    closeAdmin = admin.close;

    // Stub integration backend
    const integration = await makeBackend((req) => {
      if (req.url === '/connectors' && req.method === 'GET') {
        return {
          status: 200,
          body: {
            ok: true,
            data: {
              backend: 'integration',
              url: req.url,
              method: req.method,
              traceId: req.headers['x-trace-id'] ?? null,
            },
          },
        };
      }
      return { status: 404, body: { ok: false, error: { code: 'NOT_FOUND' } } };
    });
    integrationTargetUrl = integration.baseUrl;
    closeIntegration = integration.close;

    // Stub sharing backend
    const sharing = await makeBackend((req) => {
      if (req.url === '/portal/stats' && req.method === 'GET') {
        return {
          status: 200,
          body: {
            ok: true,
            data: {
              backend: 'sharing',
              url: req.url,
              method: req.method,
              traceId: req.headers['x-trace-id'] ?? null,
            },
          },
        };
      }
      return { status: 404, body: { ok: false, error: { code: 'NOT_FOUND' } } };
    });
    sharingTargetUrl = sharing.baseUrl;
    closeSharing = sharing.close;

    // Stub analytics backend
    const analytics = await makeBackend((req) => {
      if (req.url === '/queries' && req.method === 'GET') {
        return {
          status: 200,
          body: {
            ok: true,
            data: {
              backend: 'analytics',
              url: req.url,
              method: req.method,
              traceId: req.headers['x-trace-id'] ?? null,
            },
          },
        };
      }
      return { status: 404, body: { ok: false, error: { code: 'NOT_FOUND' } } };
    });
    analyticsTargetUrl = analytics.baseUrl;
    closeAnalytics = analytics.close;

    // Stub security backend
    const security = await makeBackend((req) => {
      if (req.url === '/masking/algorithms' && req.method === 'GET') {
        return {
          status: 200,
          body: {
            ok: true,
            data: {
              backend: 'security',
              url: req.url,
              method: req.method,
              traceId: req.headers['x-trace-id'] ?? null,
            },
          },
        };
      }
      return { status: 404, body: { ok: false, error: { code: 'NOT_FOUND' } } };
    });
    securityTargetUrl = security.baseUrl;
    closeSecurity = security.close;

    // Stub tasks backend
    const tasks = await makeBackend((req) => {
      if (req.url === '/scheduler/status' && req.method === 'GET') {
        return {
          status: 200,
          body: {
            ok: true,
            data: {
              backend: 'tasks',
              url: req.url,
              method: req.method,
              traceId: req.headers['x-trace-id'] ?? null,
            },
          },
        };
      }
      return { status: 404, body: { ok: false, error: { code: 'NOT_FOUND' } } };
    });
    tasksTargetUrl = tasks.baseUrl;
    closeTasks = tasks.close;

    // Stub auth backend (/api/auth → /*)
    const auth = await makeBackend((req) => {
      if (req.url === '/health' && req.method === 'GET') {
        return {
          status: 200,
          body: {
            ok: true,
            data: {
              backend: 'auth',
              traceId: req.headers['x-trace-id'] ?? null,
              authorization: req.headers['authorization'] ?? null,
            },
          },
        };
      }
      return {
        status: 404,
        body: {
          ok: false,
          error: {
            code: 'NOT_FOUND',
            message: 'no route',
            level: 'ERROR',
          },
        },
      };
    });
    authTargetUrl = auth.baseUrl;
    closeAuth = auth.close;

    // Stub metadata backend
    const metadata = await makeBackend((req) => {
      if (req.url === '/catalog' && req.method === 'GET') {
        return {
          status: 200,
          body: {
            ok: true,
            data: {
              backend: 'metadata',
              traceId: req.headers['x-trace-id'] ?? null,
            },
          },
        };
      }
      return {
        status: 404,
        body: {
          ok: false,
          error: {
            code: 'NOT_FOUND',
            message: 'no route',
            level: 'ERROR',
          },
        },
      };
    });
    metadataTargetUrl = metadata.baseUrl;
    closeMetadata = metadata.close;

    // Stub data-service backend
    const data = await makeBackend((req) => {
      if (req.url === '/datasets' && req.method === 'GET') {
        return {
          status: 200,
          body: {
            ok: true,
            data: {
              backend: 'data',
              traceId: req.headers['x-trace-id'] ?? null,
            },
          },
        };
      }
      return {
        status: 404,
        body: {
          ok: false,
          error: {
            code: 'NOT_FOUND',
            message: 'no route',
            level: 'ERROR',
          },
        },
      };
    });
    dataTargetUrl = data.baseUrl;
    closeData = data.close;

    // Configure gateway routes for this test run
    process.env.AUTH_SERVICE_URL = authTargetUrl;
    process.env.METADATA_SERVICE_URL = metadataTargetUrl;
    process.env.DATA_SERVICE_URL = dataTargetUrl;
    process.env.OPS_SERVICE_URL = opsTargetUrl;
    process.env.ADMIN_SERVICE_URL = adminTargetUrl;
    process.env.INTEGRATION_SERVICE_URL = integrationTargetUrl;
    process.env.SHARING_SERVICE_URL = sharingTargetUrl;
    process.env.ANALYTICS_SERVICE_URL = analyticsTargetUrl;
    process.env.SECURITY_SERVICE_URL = securityTargetUrl;
    process.env.TASK_SERVICE_URL = tasksTargetUrl;

    // Start gateway on ephemeral port using real network (required by http-proxy)
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter()
    );
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
    gatewayListener = await app.listen(0, '127.0.0.1');
    const address = gatewayListener.address();
    if (!address || typeof address === 'string') {
      throw new Error('Failed to bind gateway listener');
    }
    gatewayBaseUrl = `http://127.0.0.1:${address.port}`;
  });

  beforeEach(async () => {
    // no-op: gateway is started once in beforeAll for proxy E2E
  });

  afterAll(async () => {
    if (gatewayListener) {
      await new Promise<void>(
        (resolve) => gatewayListener?.close?.() && resolve()
      );
    }
    await app?.close?.();
    await closeOps?.();
    await closeAdmin?.();
    await closeIntegration?.();
    await closeSharing?.();
    await closeAnalytics?.();
    await closeSecurity?.();
    await closeTasks?.();
    await closeAuth?.();
    await closeMetadata?.();
    await closeData?.();
  });

  it('/health (GET)', () => {
    return app.inject({ method: 'GET', url: '/health' }).then((res) => {
      expect(res.statusCode).toBe(200);
      const body = res.json() as Record<string, unknown>;
      expect(body.ok).toBe(true);
      expect(body.data.status).toBe('ok');
    });
  });

  it('should return 404 for unknown routes', () => {
    return app
      .inject({ method: 'GET', url: '/non-existent' })
      .then((res) => expect(res.statusCode).toBe(404));
  });

  it('should proxy /api/ops/* to ops backend with stripPrefix and traceId', async () => {
    const res = await fetch(`${gatewayBaseUrl}/api/ops/alerts/rules`, {
      method: 'GET',
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.ok).toBe(true);
    expect(body.data.backend).toBe('ops');
    expect(body.data.url).toBe('/alerts/rules');
    expect(body.data.method).toBe('GET');
    expect(typeof body.data.traceId).toBe('string');
    expect(body.data.traceId.length).toBeGreaterThan(0);
    expect(res.headers.get('x-trace-id')).toBeTruthy();
  });

  it('should proxy /api/admin/* to admin backend with stripPrefix and traceId', async () => {
    const res = await fetch(`${gatewayBaseUrl}/api/admin/projects`, {
      method: 'GET',
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.ok).toBe(true);
    expect(body.data.backend).toBe('admin');
    expect(body.data.url).toBe('/projects');
    expect(body.data.method).toBe('GET');
    expect(typeof body.data.traceId).toBe('string');
    expect(body.data.traceId.length).toBeGreaterThan(0);
    expect(res.headers.get('x-trace-id')).toBeTruthy();
  });

  it('should proxy /api/integration/* to integration backend with stripPrefix and traceId', async () => {
    const res = await fetch(`${gatewayBaseUrl}/api/integration/connectors`, {
      method: 'GET',
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.ok).toBe(true);
    expect(body.data.backend).toBe('integration');
    expect(body.data.url).toBe('/connectors');
    expect(body.data.method).toBe('GET');
    expect(typeof body.data.traceId).toBe('string');
    expect(body.data.traceId.length).toBeGreaterThan(0);
    expect(res.headers.get('x-trace-id')).toBeTruthy();
  });

  it('should proxy /api/sharing/* to sharing backend with stripPrefix and traceId', async () => {
    const res = await fetch(`${gatewayBaseUrl}/api/sharing/portal/stats`, {
      method: 'GET',
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.ok).toBe(true);
    expect(body.data.backend).toBe('sharing');
    expect(body.data.url).toBe('/portal/stats');
    expect(body.data.method).toBe('GET');
    expect(typeof body.data.traceId).toBe('string');
    expect(body.data.traceId.length).toBeGreaterThan(0);
    expect(res.headers.get('x-trace-id')).toBeTruthy();
  });

  it('should proxy /api/analytics/* to analytics backend with stripPrefix and traceId', async () => {
    const res = await fetch(`${gatewayBaseUrl}/api/analytics/queries`, {
      method: 'GET',
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.ok).toBe(true);
    expect(body.data.backend).toBe('analytics');
    expect(body.data.url).toBe('/queries');
    expect(body.data.method).toBe('GET');
    expect(typeof body.data.traceId).toBe('string');
    expect(body.data.traceId.length).toBeGreaterThan(0);
    expect(res.headers.get('x-trace-id')).toBeTruthy();
  });

  it('should proxy /api/security/* to security backend with stripPrefix and traceId', async () => {
    const res = await fetch(
      `${gatewayBaseUrl}/api/security/masking/algorithms`,
      {
        method: 'GET',
      }
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.ok).toBe(true);
    expect(body.data.backend).toBe('security');
    expect(body.data.url).toBe('/masking/algorithms');
    expect(body.data.method).toBe('GET');
    expect(typeof body.data.traceId).toBe('string');
    expect(body.data.traceId.length).toBeGreaterThan(0);
    expect(res.headers.get('x-trace-id')).toBeTruthy();
  });

  it('should proxy /api/tasks/* to tasks backend with stripPrefix and traceId', async () => {
    const res = await fetch(`${gatewayBaseUrl}/api/tasks/scheduler/status`, {
      method: 'GET',
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.ok).toBe(true);
    expect(body.data.backend).toBe('tasks');
    expect(body.data.url).toBe('/scheduler/status');
    expect(body.data.method).toBe('GET');
    expect(typeof body.data.traceId).toBe('string');
    expect(body.data.traceId.length).toBeGreaterThan(0);
    expect(res.headers.get('x-trace-id')).toBeTruthy();
  });

  it('should proxy /api/auth/* to auth backend with stripPrefix and traceId', async () => {
    const res = await fetch(`${gatewayBaseUrl}/api/auth/health`, {
      method: 'GET',
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.ok).toBe(true);
    expect(body.data.backend).toBe('auth');
    expect(typeof body.data.traceId).toBe('string');
    expect(res.headers.get('x-trace-id')).toBeTruthy();
  });

  it('should proxy /api/metadata/* to metadata backend with stripPrefix and traceId', async () => {
    const res = await fetch(`${gatewayBaseUrl}/api/metadata/catalog`, {
      method: 'GET',
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.ok).toBe(true);
    expect(body.data.backend).toBe('metadata');
    expect(res.headers.get('x-trace-id')).toBeTruthy();
  });

  it('should proxy /api/data/* to data backend with stripPrefix and traceId', async () => {
    const res = await fetch(`${gatewayBaseUrl}/api/data/datasets`, {
      method: 'GET',
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.ok).toBe(true);
    expect(body.data.backend).toBe('data');
    expect(res.headers.get('x-trace-id')).toBeTruthy();
  });

  it('should propagate client x-trace-id to downstream (ops)', async () => {
    const tid = 'm1-client-trace-id-0001';
    const res = await fetch(`${gatewayBaseUrl}/api/ops/alerts/rules`, {
      method: 'GET',
      headers: { 'x-trace-id': tid },
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.data.traceId).toBe(tid);
    expect(res.headers.get('x-trace-id')).toBe(tid);
  });

  it('should forward Authorization header to downstream (JWT chain smoke)', async () => {
    const res = await fetch(`${gatewayBaseUrl}/api/ops/alerts/rules`, {
      method: 'GET',
      headers: { Authorization: 'Bearer m1-test-jwt' },
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.data.authorization).toBe('Bearer m1-test-jwt');
  });

  it('should pass through backend 404 with Result error shape', async () => {
    const res = await fetch(`${gatewayBaseUrl}/api/ops/no/such/resource`, {
      method: 'GET',
    });
    expect(res.status).toBe(404);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.ok).toBe(false);
    expect(body.error?.code).toBe('NOT_FOUND');
    expect(body.error?.level).toBe('ERROR');
  });

  it('success responses use ok:true Result shape', async () => {
    const res = await fetch(`${gatewayBaseUrl}/api/admin/projects`, {
      method: 'GET',
    });
    const body = (await res.json()) as Record<string, unknown>;
    expect(body).toMatchObject({
      ok: true,
      data: expect.anything(),
    });
    expect(body.traceId === undefined || typeof body.traceId === 'string').toBe(
      true
    );
  });
});

const GATEWAY_ROUTE_ENV_KEYS = [
  'AUTH_SERVICE_URL',
  'METADATA_SERVICE_URL',
  'DATA_SERVICE_URL',
  'TASK_SERVICE_URL',
  'OPS_SERVICE_URL',
  'INTEGRATION_SERVICE_URL',
  'ADMIN_SERVICE_URL',
  'SHARING_SERVICE_URL',
  'ANALYTICS_SERVICE_URL',
  'SECURITY_SERVICE_URL',
] as const;

function snapshotGatewayEnv(): Record<string, string | undefined> {
  const o: Record<string, string | undefined> = {};
  for (const k of GATEWAY_ROUTE_ENV_KEYS) {
    o[k] = process.env[k];
  }
  return o;
}

function restoreGatewayEnv(saved: Record<string, string | undefined>): void {
  for (const k of GATEWAY_ROUTE_ENV_KEYS) {
    const v = saved[k];
    if (v === undefined) {
      delete process.env[k];
    } else {
      process.env[k] = v;
    }
  }
}

describe('Gateway proxy when backend is unreachable (M1)', () => {
  let app: NestFastifyApplication | undefined;
  let gatewayBaseUrl: string;
  let savedEnv: Record<string, string | undefined>;

  beforeAll(async () => {
    savedEnv = snapshotGatewayEnv();
    for (const k of GATEWAY_ROUTE_ENV_KEYS) {
      delete process.env[k];
    }
    process.env.OPS_SERVICE_URL = 'http://127.0.0.1:65433';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter()
    );
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
    const listener = await app.listen(0, '127.0.0.1');
    const address = listener.address();
    if (!address || typeof address === 'string') {
      throw new Error('Failed to bind gateway listener');
    }
    gatewayBaseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    await app?.close?.();
    restoreGatewayEnv(savedEnv);
  });

  it('should return 503 Result with PROXY_ERROR when upstream refuses connection', async () => {
    const res = await fetch(`${gatewayBaseUrl}/api/ops/alerts/rules`, {
      method: 'GET',
    });
    expect(res.status).toBe(503);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.ok).toBe(false);
    expect(body.error?.code).toBe('PROXY_ERROR');
    expect(body.error?.level).toBe('ERROR');
    expect(typeof body.error?.message).toBe('string');
  });
});
