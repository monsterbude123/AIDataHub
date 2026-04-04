/**
 * M1 §1.2 跨服务依赖 — 契约/SDK 消费面验证（mock HTTP）。
 *
 * 说明：各服务进程内是否已发起真实 HTTP 调用属于实现细节；本测试保证
 * 「依赖链两端」在 @ai-datahub/contract + SDK 上均有可组合的 Consumer，
 * 联调时可通过 Gateway 或直连分别挂载对应 baseUrl。
 */
import { describe, expect, it } from 'vitest';

import type { Result } from '@ai-datahub/contract';

import type { HttpClient } from '../src/http/HttpClient';
import { DataOperationsHttpClient } from '../src/clients/DataOperationsHttpClient';
import { DataSecurityHttpClient } from '../src/clients/DataSecurityHttpClient';
import { DataServiceHttpClient } from '../src/clients/DataServiceHttpClient';
import { DataSharingHttpClient } from '../src/clients/DataSharingHttpClient';
import { SelfServiceAnalyticsHttpClient } from '../src/clients/SelfServiceAnalyticsHttpClient';
import { SystemAuthHttpClient } from '../src/clients/SystemAuthHttpClient';
import { SystemIntegrationHttpClient } from '../src/clients/SystemIntegrationHttpClient';

function ok<T>(data: T): Result<T> {
  return { ok: true, data };
}

function mockHttp(): HttpClient {
  return {
    request: async <T>() => ok<T>({} as T),
  };
}

describe('M1 cross-service consumer matrix (SDK + Contract)', () => {
  it('sharing ↔ system-auth: portal + approval todo (审批/门户)', async () => {
    const http = mockHttp();
    const sharing = new DataSharingHttpClient(http);
    const auth = new SystemAuthHttpClient(http);

    const portal = await sharing.getPortalHomeStats({
      meta: { traceId: 'm1' },
      orgId: 'org_1',
    });
    const todo = await auth.listMyTodoApprovals({
      meta: { traceId: 'm1' },
      userId: 'u1',
      page: { page: 1, pageSize: 10 },
    });

    expect(portal.ok).toBe(true);
    expect(todo.ok).toBe(true);
  });

  it('sharing ↔ ops: exchange executions + ops alerts (调度/告警域)', async () => {
    const http = mockHttp();
    const sharing = new DataSharingHttpClient(http);
    const ops = new DataOperationsHttpClient(http);

    const ex = await sharing.listExchangeExecutions({
      meta: { traceId: 'm1' },
      page: { page: 1, pageSize: 10 },
    });
    const rules = await ops.listAlertRules({ meta: { traceId: 'm1' } });

    expect(ex.ok).toBe(true);
    expect(rules.ok).toBe(true);
  });

  it('analytics ↔ data-service: queries + data-services search', async () => {
    const http = mockHttp();
    const analytics = new SelfServiceAnalyticsHttpClient(http);
    const data = new DataServiceHttpClient(http);

    const queries = await analytics.listQueries({
      meta: { traceId: 'm1' },
      createdBy: 'u1',
      page: { page: 1, pageSize: 10 },
    });
    const services = await data.searchDataService({
      meta: { traceId: 'm1' },
      keyword: 'k',
      page: { page: 1, pageSize: 10 },
    });

    expect(queries.ok).toBe(true);
    expect(services.ok).toBe(true);
  });

  it('security ↔ ops: masking algorithms + alert rules (安全策略与运维侧)', async () => {
    const http = mockHttp();
    const security = new DataSecurityHttpClient(http);
    const ops = new DataOperationsHttpClient(http);

    const mask = await security.listMaskingAlgorithms({
      meta: { traceId: 'm1' },
    });
    const rules = await ops.listAlertRules({ meta: { traceId: 'm1' } });

    expect(mask.ok).toBe(true);
    expect(rules.ok).toBe(true);
  });

  it('ops ↔ integration: alert rules + connectors (告警与通知通道)', async () => {
    const http = mockHttp();
    const ops = new DataOperationsHttpClient(http);
    const integration = new SystemIntegrationHttpClient(http);

    const rules = await ops.listAlertRules({ meta: { traceId: 'm1' } });
    const connectors = await integration.listConnectors({
      meta: { traceId: 'm1' },
    });

    expect(rules.ok).toBe(true);
    expect(connectors.ok).toBe(true);
  });
});
