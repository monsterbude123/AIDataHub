import type {
  DataExploreRequest,
  DataExploreResponse,
  ExecuteSavedQueryRequest,
  ExportQueryResultRequest,
  ExportQueryResultResponse,
  PageRequest,
  PageResult,
  QueryResult,
  RequestMeta,
  Result,
  SaveQueryRequest,
  SavedQuery,
  SelfServiceAnalyticsClient,
  ShareQueryRequest,
  VisualizationSpec,
} from '@ai-datahub/contract';

import type { HttpClient } from '../http/HttpClient';

export class SelfServiceAnalyticsHttpClient implements SelfServiceAnalyticsClient {
  constructor(private readonly http: HttpClient) {}

  saveQuery(req: SaveQueryRequest): Promise<Result<{ queryId: string }>> {
    return this.http.request({
      path: '/queries',
      method: 'POST',
      meta: req.meta,
      body: req,
    });
  }

  updateQuery(req: {
    meta?: RequestMeta;
    query: Partial<Omit<SavedQuery, 'createdAt' | 'updatedAt'>> & {
      id: string;
    };
  }): Promise<Result<{ success: boolean }>> {
    return this.http.request({
      path: '/queries',
      method: 'PUT',
      meta: req.meta,
      body: req,
    });
  }

  deleteQuery(req: {
    meta?: RequestMeta;
    queryId: string;
  }): Promise<Result<{ success: boolean }>> {
    return this.http.request({
      path: `/queries/${req.queryId}`,
      method: 'DELETE',
      meta: req.meta,
    });
  }

  listQueries(req: {
    meta?: RequestMeta;
    createdBy: string;
    page: PageRequest;
  }): Promise<Result<PageResult<SavedQuery>>> {
    return this.http.request({
      path: '/queries',
      method: 'GET',
      meta: req.meta,
      query: {
        createdBy: req.createdBy,
        page: req.page.page,
        pageSize: req.page.pageSize,
      },
    });
  }

  executeSavedQuery(
    req: ExecuteSavedQueryRequest
  ): Promise<Result<QueryResult>> {
    return this.http.request({
      path: `/queries/${req.queryId}/execute`,
      method: 'POST',
      meta: req.meta,
      body: req,
    });
  }

  exportQueryResult(
    req: ExportQueryResultRequest
  ): Promise<Result<ExportQueryResultResponse>> {
    return this.http.request({
      path: `/queries/${req.queryId}/export`,
      method: 'POST',
      meta: req.meta,
      body: req,
    });
  }

  createVisualization(req: {
    meta?: RequestMeta;
    visualization: Omit<VisualizationSpec, 'id' | 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ visualizationId: string }>> {
    return this.http.request({
      path: '/visualizations',
      method: 'POST',
      meta: req.meta,
      body: req,
    });
  }

  updateVisualization(req: {
    meta?: RequestMeta;
    visualization: Omit<VisualizationSpec, 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ success: boolean }>> {
    return this.http.request({
      path: '/visualizations',
      method: 'PUT',
      meta: req.meta,
      body: req,
    });
  }

  listVisualizations(req: {
    meta?: RequestMeta;
    queryId: string;
    page: PageRequest;
  }): Promise<Result<PageResult<VisualizationSpec>>> {
    return this.http.request({
      path: '/visualizations',
      method: 'GET',
      meta: req.meta,
      query: {
        queryId: req.queryId,
        page: req.page.page,
        pageSize: req.page.pageSize,
      },
    });
  }

  exploreData(req: DataExploreRequest): Promise<Result<DataExploreResponse>> {
    return this.http.request({
      path: '/explore',
      method: 'POST',
      meta: req.meta,
      body: req,
    });
  }

  shareQuery(req: ShareQueryRequest): Promise<Result<{ success: boolean }>> {
    return this.http.request({
      path: `/queries/${req.queryId}/share`,
      method: 'POST',
      meta: req.meta,
      body: req,
    });
  }
}
