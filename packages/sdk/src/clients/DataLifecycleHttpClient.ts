import type {
  ArchiveRecord,
  DataLifecycleClient,
  DeleteExpiredDataRequest,
  GetLifecycleReportRequest,
  LifecyclePolicy,
  LifecycleReportPoint,
  ListArchiveRecordsRequest,
  PageResult,
  RequestMeta,
  Result,
} from '@ai-datahub/contract';
import type { HttpClient } from '../http/HttpClient';

export class DataLifecycleHttpClient implements DataLifecycleClient {
  constructor(private readonly http: HttpClient) {}

  configurePolicy(req: {
    meta?: RequestMeta;
    policy: Omit<LifecyclePolicy, 'id' | 'createdAt' | 'updatedAt'> & {
      id?: string;
    };
  }): Promise<Result<{ policyId: string }>> {
    return this.http.request({
      path: '/lifecycle/policies',
      method: 'POST',
      meta: req.meta,
      body: req,
    });
  }
  listPolicies(req: {
    meta?: RequestMeta;
    enabled?: boolean;
  }): Promise<Result<LifecyclePolicy[]>> {
    return this.http.request({
      path: '/lifecycle/policies',
      method: 'GET',
      meta: req.meta,
      query: { enabled: req.enabled },
    });
  }
  archiveData(req: {
    meta?: RequestMeta;
    dataAssetId: string;
    policyId: string;
  }): Promise<Result<{ archiveId: string }>> {
    return this.http.request({
      path: '/lifecycle/archive',
      method: 'POST',
      meta: req.meta,
      body: req,
    });
  }
  restoreData(req: {
    meta?: RequestMeta;
    archiveId: string;
  }): Promise<Result<{ success: boolean }>> {
    return this.http.request({
      path: '/lifecycle/restore',
      method: 'POST',
      meta: req.meta,
      body: req,
    });
  }
  listArchiveRecords(
    req: ListArchiveRecordsRequest
  ): Promise<Result<PageResult<ArchiveRecord>>> {
    return this.http.request({
      path: '/lifecycle/records',
      method: 'GET',
      meta: req.meta,
      query: {
        dataAssetId: req.dataAssetId,
        policyId: req.policyId,
        status: req.status,
        page: req.page.page,
        pageSize: req.page.pageSize,
      },
    });
  }
  getArchiveRecord(req: {
    meta?: RequestMeta;
    archiveId: string;
  }): Promise<Result<ArchiveRecord>> {
    return this.http.request({
      path: `/lifecycle/records/${req.archiveId}`,
      method: 'GET',
      meta: req.meta,
    });
  }
  deleteExpiredData(
    req: DeleteExpiredDataRequest
  ): Promise<Result<{ dryRun: boolean; deletedCount: number }>> {
    return this.http.request({
      path: '/lifecycle/expired',
      method: 'POST',
      meta: req.meta,
      body: req,
    });
  }
  getLifecycleReport(
    req: GetLifecycleReportRequest
  ): Promise<Result<{ points: LifecycleReportPoint[] }>> {
    return this.http.request({
      path: '/lifecycle/report',
      method: 'GET',
      meta: req.meta,
      query: {
        orgId: req.orgId,
        projectId: req.projectId,
        startAt: req.startAt,
        endAt: req.endAt,
      },
    });
  }
}
