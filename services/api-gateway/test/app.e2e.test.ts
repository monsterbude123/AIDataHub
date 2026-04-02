import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from '../src/AppModule';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createServer } from 'http';

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
  let closeOps: (() => Promise<void>) | undefined;
  let closeAdmin: (() => Promise<void>) | undefined;
  let closeIntegration: (() => Promise<void>) | undefined;
  let closeSharing: (() => Promise<void>) | undefined;
  let closeAnalytics: (() => Promise<void>) | undefined;
  let closeSecurity: (() => Promise<void>) | undefined;
  let closeTasks: (() => Promise<void>) | undefined;
  let gatewayListener: { close: () => void } | undefined;

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
            },
          },
        };
      }
      return { status: 404, body: { ok: false, error: { code: 'NOT_FOUND' } } };
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

    // Configure gateway routes for this test run
    process.env.OPS_SERVICE_URL = opsTargetUrl;
    process.env.ADMIN_SERVICE_URL = adminTargetUrl;
    process.env.INTEGRATION_SERVICE_URL = integrationTargetUrl;
    process.env.SHARING_SERVICE_URL = sharingTargetUrl;
    process.env.ANALYTICS_SERVICE_URL = analyticsTargetUrl;
    process.env.SECURITY_SERVICE_URL = securityTargetUrl;
    process.env.TASK_SERVICE_URL = tasksTargetUrl;
    process.env.AUTH_SERVICE_URL = undefined;
    process.env.METADATA_SERVICE_URL = undefined;
    process.env.DATA_SERVICE_URL = undefined;

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
  });

  it('/health (GET)', () => {
    return app.inject({ method: 'GET', url: '/health' }).then((res) => {
      expect(res.statusCode).toBe(200);
      const body = res.json();
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
    const body = await res.json();
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
    const body = await res.json();
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
    const body = await res.json();
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
    const body = await res.json();
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
    const body = await res.json();
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
    const body = await res.json();
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
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.data.backend).toBe('tasks');
    expect(body.data.url).toBe('/scheduler/status');
    expect(body.data.method).toBe('GET');
    expect(typeof body.data.traceId).toBe('string');
    expect(body.data.traceId.length).toBeGreaterThan(0);
    expect(res.headers.get('x-trace-id')).toBeTruthy();
  });
});
