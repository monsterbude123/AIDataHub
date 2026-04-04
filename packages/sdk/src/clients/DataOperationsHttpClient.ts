import type {
  AlertRule,
  DataOperationsClient,
  PageResult,
  RequestMeta,
  Result,
  SearchAlertRulesRequest,
} from '@ai-datahub/contract';

import type { HttpClient } from '../http/HttpClient';

/** MVP 仅覆盖告警查询；其余 ops 端点由服务内或其它 wave 补齐。 */
export class DataOperationsHttpClient implements Pick<
  DataOperationsClient,
  'listAlertRules' | 'searchAlertRules'
> {
  constructor(private readonly http: HttpClient) {}

  listAlertRules(req: { meta?: RequestMeta }): Promise<Result<AlertRule[]>> {
    return this.http.request<AlertRule[]>({
      path: '/alerts/rules',
      method: 'GET',
      meta: req.meta,
    });
  }

  searchAlertRules(
    req: SearchAlertRulesRequest
  ): Promise<Result<PageResult<AlertRule>>> {
    return this.http.request<PageResult<AlertRule>>({
      path: '/alerts/rules/search',
      method: 'GET',
      meta: req.meta,
      query: {
        keyword: req.keyword,
        enabled: req.enabled,
        type: req.type,
        page: req.page.page,
        pageSize: req.page.pageSize,
      },
    });
  }
}
