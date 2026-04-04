import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { loadRouteConfig } from '../src/modules/proxy/proxy.config';

const ROUTE_ENV_KEYS = [
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

describe('loadRouteConfig (M1 gateway prefix contract)', () => {
  let snapshot: Record<string, string | undefined>;

  beforeEach(() => {
    snapshot = {};
    for (const k of ROUTE_ENV_KEYS) {
      snapshot[k] = process.env[k];
      delete process.env[k];
    }
  });

  afterEach(() => {
    for (const k of ROUTE_ENV_KEYS) {
      const v = snapshot[k];
      if (v === undefined) {
        delete process.env[k];
      } else {
        process.env[k] = v;
      }
    }
  });

  it('returns no routes when no SERVICE_URL is set', () => {
    expect(loadRouteConfig()).toEqual([]);
  });

  it('registers stable path prefixes in priority order when all URLs are set', () => {
    process.env.AUTH_SERVICE_URL = 'http://auth';
    process.env.METADATA_SERVICE_URL = 'http://metadata';
    process.env.DATA_SERVICE_URL = 'http://data';
    process.env.TASK_SERVICE_URL = 'http://tasks';
    process.env.OPS_SERVICE_URL = 'http://ops';
    process.env.INTEGRATION_SERVICE_URL = 'http://integration';
    process.env.ADMIN_SERVICE_URL = 'http://admin';
    process.env.SHARING_SERVICE_URL = 'http://sharing';
    process.env.ANALYTICS_SERVICE_URL = 'http://analytics';
    process.env.SECURITY_SERVICE_URL = 'http://security';

    const routes = loadRouteConfig();
    expect(routes.map((r) => r.prefix)).toEqual([
      '/api/auth',
      '/api/metadata',
      '/api/data',
      '/api/tasks',
      '/api/ops',
      '/api/integration',
      '/api/admin',
      '/api/sharing',
      '/api/analytics',
      '/api/security',
    ]);
    expect(routes.every((r) => r.stripPrefix === true)).toBe(true);
  });
});
