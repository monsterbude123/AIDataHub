import type {
  CollectMetadataRequest,
  CollectMetadataResponse,
  CompareMetadataVersionsRequest,
  ExportMetadataRequest,
  ExportMetadataResponse,
  GetMetadataVersionsRequest,
  ImportMetadataRequest,
  MetadataClient,
  MetadataVersion,
  MetadataVersionDiff,
  PageResult,
  SubscribeMetadataChangeRequest,
  SubscribeMetadataChangeResponse,
  SyncMetadataRequest,
  SyncMetadataResponse,
} from '@ai-datahub/contract';
import type { Result } from '@ai-datahub/contract';

import type { HttpClient } from '../http/HttpClient';

export class MetadataHttpClient implements MetadataClient {
  constructor(private readonly http: HttpClient) {}

  collectMetadata(
    req: CollectMetadataRequest
  ): Promise<Result<CollectMetadataResponse>> {
    return this.http.request({
      path: '/metadata/collect',
      method: 'POST',
      meta: req.meta,
      body: req,
    });
  }

  importMetadata(
    req: ImportMetadataRequest
  ): Promise<Result<{ success: boolean }>> {
    return this.http.request({
      path: '/metadata/import',
      method: 'POST',
      meta: req.meta,
      body: req,
    });
  }

  exportMetadata(
    req: ExportMetadataRequest
  ): Promise<Result<ExportMetadataResponse>> {
    return this.http.request({
      path: '/metadata/export',
      method: 'POST',
      meta: req.meta,
      body: req,
    });
  }

  syncMetadata(
    req: SyncMetadataRequest
  ): Promise<Result<SyncMetadataResponse>> {
    return this.http.request({
      path: '/metadata/sync',
      method: 'POST',
      meta: req.meta,
      body: req,
    });
  }

  getMetadataVersions(
    req: GetMetadataVersionsRequest
  ): Promise<Result<PageResult<MetadataVersion>>> {
    return this.http.request({
      path: `/metadata/assets/${req.dataAssetId}/versions`,
      method: 'GET',
      meta: req.meta,
      query: { page: req.page.page, pageSize: req.page.pageSize },
    });
  }

  compareMetadataVersions(
    req: CompareMetadataVersionsRequest
  ): Promise<Result<{ diffs: MetadataVersionDiff[] }>> {
    return this.http.request({
      path: '/metadata/versions/compare',
      method: 'POST',
      meta: req.meta,
      body: req,
    });
  }

  subscribeMetadataChange(
    req: SubscribeMetadataChangeRequest
  ): Promise<Result<SubscribeMetadataChangeResponse>> {
    return this.http.request({
      path: '/metadata/changes/subscribe',
      method: 'POST',
      meta: req.meta,
      body: req,
    });
  }
}
