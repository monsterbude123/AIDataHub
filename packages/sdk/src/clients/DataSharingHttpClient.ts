import type {
  AttachResourceRequest,
  AttachResourceResponse,
  CompiledResource,
  CompiledResourceStatus,
  CreateServiceApplicationRequest,
  CreateServiceApplicationResponse,
  CreateSharingServiceRequest,
  DataSharingClient,
  PageRequest,
  PageResult,
  PortalHomeStats,
  PublishCompiledResourceRequest,
  PublishSharingServiceRequest,
  RegisteredResource,
  ResourceDirectoryNode,
  ResourceMapping,
  ReRunExchangeExecutionRequest,
  SharingService,
  SharingServiceStatus,
  ShareResourceType,
  ServiceApplication,
  ServiceApplicationStatus,
  TaskExecution,
  TestRegisteredApiRequest,
  TestRegisteredApiResponse,
  UpdateExchangeScheduleRequest,
  UpdateSharingServiceRequest,
  UrgeApprovalRequest,
  RequestMeta,
  ISODateTime,
} from '@ai-datahub/contract';
import type { Result } from '@ai-datahub/contract';

import type { HttpClient } from '../http/HttpClient';

export class DataSharingHttpClient implements DataSharingClient {
  constructor(private readonly http: HttpClient) {}

  getPortalHomeStats(req: {
    meta?: RequestMeta;
    orgId: string;
  }): Promise<Result<PortalHomeStats>> {
    return this.http.request({
      path: '/portal/stats',
      method: 'GET',
      meta: req.meta,
      query: { orgId: req.orgId },
    });
  }

  getApplicationDetailForApproval(req: {
    meta?: RequestMeta;
    applicationId: string;
  }): Promise<Result<ServiceApplication>> {
    return this.http.request({
      path: `/applications/${req.applicationId}`,
      method: 'GET',
      meta: req.meta,
    });
  }

  // directories
  listResourceDirectories(req: {
    meta?: RequestMeta;
    parentId?: string;
  }): Promise<Result<ResourceDirectoryNode[]>> {
    return this.http.request({
      path: '/directories',
      method: 'GET',
      meta: req.meta,
      query: { parentId: req.parentId },
    });
  }

  createResourceDirectory(req: {
    meta?: RequestMeta;
    node: Omit<ResourceDirectoryNode, 'id' | 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ directoryId: string }>> {
    return this.http.request({
      path: '/directories',
      method: 'POST',
      meta: req.meta,
      body: req,
    });
  }

  updateResourceDirectory(req: {
    meta?: RequestMeta;
    node: Omit<ResourceDirectoryNode, 'createdAt' | 'updatedAt'>;
  }): Promise<Result<{ success: boolean }>> {
    return this.http.request({
      path: '/directories',
      method: 'PUT',
      meta: req.meta,
      body: req,
    });
  }

  deleteResourceDirectory(req: {
    meta?: RequestMeta;
    directoryId: string;
  }): Promise<Result<{ success: boolean }>> {
    return this.http.request({
      path: `/directories/${req.directoryId}`,
      method: 'DELETE',
      meta: req.meta,
    });
  }

  // registered resources
  createRegisteredResource(req: {
    meta?: RequestMeta;
    resource: Omit<
      RegisteredResource,
      'id' | 'status' | 'createdAt' | 'updatedAt'
    >;
  }): Promise<Result<{ resourceId: string }>> {
    return this.http.request({
      path: '/resources/registered',
      method: 'POST',
      meta: req.meta,
      body: req,
    });
  }

  updateRegisteredResource(req: {
    meta?: RequestMeta;
    resource: Partial<Omit<RegisteredResource, 'createdAt' | 'updatedAt'>> & {
      id: string;
    };
  }): Promise<Result<{ success: boolean }>> {
    return this.http.request({
      path: '/resources/registered',
      method: 'PUT',
      meta: req.meta,
      body: req,
    });
  }

  deleteRegisteredResource(req: {
    meta?: RequestMeta;
    resourceId: string;
  }): Promise<Result<{ success: boolean }>> {
    return this.http.request({
      path: `/resources/registered/${req.resourceId}`,
      method: 'DELETE',
      meta: req.meta,
    });
  }

  getRegisteredResource(req: {
    meta?: RequestMeta;
    resourceId: string;
  }): Promise<Result<RegisteredResource>> {
    return this.http.request({
      path: `/resources/registered/${req.resourceId}`,
      method: 'GET',
      meta: req.meta,
    });
  }

  listRegisteredResources(req: {
    meta?: RequestMeta;
    ownerOrgId?: string;
    type?: ShareResourceType;
    keyword?: string;
    page: PageRequest;
  }): Promise<Result<PageResult<RegisteredResource>>> {
    return this.http.request({
      path: '/resources/registered',
      method: 'GET',
      meta: req.meta,
      query: {
        ownerOrgId: req.ownerOrgId,
        type: req.type,
        keyword: req.keyword,
        page: req.page.page,
        pageSize: req.page.pageSize,
      },
    });
  }

  testRegisteredApi(
    req: TestRegisteredApiRequest
  ): Promise<Result<TestRegisteredApiResponse>> {
    return this.http.request({
      path: `/resources/registered/${req.resourceId}/test`,
      method: 'POST',
      meta: req.meta,
      body: req,
    });
  }

  // compiled resources
  createCompiledResource(req: {
    meta?: RequestMeta;
    resource: Omit<
      CompiledResource,
      'id' | 'status' | 'createdAt' | 'updatedAt'
    > & { status?: CompiledResourceStatus };
  }): Promise<Result<{ compiledResourceId: string }>> {
    return this.http.request({
      path: '/resources/compiled',
      method: 'POST',
      meta: req.meta,
      body: req,
    });
  }

  updateCompiledResource(req: {
    meta?: RequestMeta;
    resource: Partial<Omit<CompiledResource, 'createdAt' | 'updatedAt'>> & {
      id: string;
    };
  }): Promise<Result<{ success: boolean }>> {
    return this.http.request({
      path: '/resources/compiled',
      method: 'PUT',
      meta: req.meta,
      body: req,
    });
  }

  deleteCompiledResource(req: {
    meta?: RequestMeta;
    compiledResourceId: string;
  }): Promise<Result<{ success: boolean }>> {
    return this.http.request({
      path: `/resources/compiled/${req.compiledResourceId}`,
      method: 'DELETE',
      meta: req.meta,
    });
  }

  getCompiledResource(req: {
    meta?: RequestMeta;
    compiledResourceId: string;
  }): Promise<Result<CompiledResource>> {
    return this.http.request({
      path: `/resources/compiled/${req.compiledResourceId}`,
      method: 'GET',
      meta: req.meta,
    });
  }

  searchCompiledResources(req: {
    meta?: RequestMeta;
    directoryId?: string;
    type?: ShareResourceType;
    status?: CompiledResourceStatus;
    keyword?: string;
    page: PageRequest;
  }): Promise<Result<PageResult<CompiledResource>>> {
    return this.http.request({
      path: '/resources/compiled',
      method: 'GET',
      meta: req.meta,
      query: {
        directoryId: req.directoryId,
        type: req.type,
        status: req.status,
        keyword: req.keyword,
        page: req.page.page,
        pageSize: req.page.pageSize,
      },
    });
  }

  importCompiledResources(req: {
    meta?: RequestMeta;
    format: 'TEMPLATE_V1';
    payload: Record<string, unknown>;
  }): Promise<Result<{ success: boolean }>> {
    return this.http.request({
      path: '/resources/compiled/import',
      method: 'POST',
      meta: req.meta,
      body: req,
    });
  }

  exportCompiledResources(req: {
    meta?: RequestMeta;
    directoryId: string;
    format: 'TEMPLATE_V1';
  }): Promise<Result<{ downloadUrl: string; expireAt: ISODateTime }>> {
    return this.http.request({
      path: '/resources/compiled/export',
      method: 'GET',
      meta: req.meta,
      query: { directoryId: req.directoryId, format: req.format },
    });
  }

  publishCompiledResource(
    req: PublishCompiledResourceRequest
  ): Promise<Result<{ success: boolean }>> {
    return this.http.request({
      path: `/resources/compiled/${req.compiledResourceId}/publish`,
      method: 'POST',
      meta: req.meta,
      body: req,
    });
  }

  // mappings
  attachResource(
    req: AttachResourceRequest
  ): Promise<Result<AttachResourceResponse>> {
    return this.http.request({
      path: '/mappings',
      method: 'POST',
      meta: req.meta,
      body: req,
    });
  }

  detachResource(req: {
    meta?: RequestMeta;
    compiledResourceId: string;
  }): Promise<Result<{ success: boolean }>> {
    return this.http.request({
      path: '/mappings',
      method: 'DELETE',
      meta: req.meta,
      body: req,
    });
  }

  getResourceMapping(req: {
    meta?: RequestMeta;
    compiledResourceId: string;
  }): Promise<Result<ResourceMapping>> {
    return this.http.request({
      path: '/mappings',
      method: 'GET',
      meta: req.meta,
      query: { compiledResourceId: req.compiledResourceId },
    });
  }

  listRegistrableCompiledResources(req: {
    meta?: RequestMeta;
    directoryId?: string;
    keyword?: string;
    page: PageRequest;
  }): Promise<Result<PageResult<CompiledResource>>> {
    // MVP：和 searchCompiledResources 同一路由形状（后续可按后端能力细化）
    return this.http.request({
      path: '/resources/compiled',
      method: 'GET',
      meta: req.meta,
      query: {
        directoryId: req.directoryId,
        keyword: req.keyword,
        page: req.page.page,
        pageSize: req.page.pageSize,
      },
    });
  }

  // sharing services
  createSharingService(
    req: CreateSharingServiceRequest
  ): Promise<Result<{ serviceId: string }>> {
    return this.http.request({
      path: '/services',
      method: 'POST',
      meta: req.meta,
      body: req,
    });
  }

  updateSharingService(
    req: UpdateSharingServiceRequest
  ): Promise<Result<{ success: boolean }>> {
    return this.http.request({
      path: '/services',
      method: 'PUT',
      meta: req.meta,
      body: req,
    });
  }

  deleteSharingService(req: {
    meta?: RequestMeta;
    serviceId: string;
  }): Promise<Result<{ success: boolean }>> {
    return this.http.request({
      path: `/services/${req.serviceId}`,
      method: 'DELETE',
      meta: req.meta,
    });
  }

  getSharingService(req: {
    meta?: RequestMeta;
    serviceId: string;
  }): Promise<Result<SharingService>> {
    return this.http.request({
      path: `/services/${req.serviceId}`,
      method: 'GET',
      meta: req.meta,
    });
  }

  searchSharingServices(req: {
    meta?: RequestMeta;
    compiledResourceId?: string;
    status?: SharingServiceStatus;
    keyword?: string;
    page: PageRequest;
  }): Promise<Result<PageResult<SharingService>>> {
    return this.http.request({
      path: '/services',
      method: 'GET',
      meta: req.meta,
      query: {
        compiledResourceId: req.compiledResourceId,
        status: req.status,
        keyword: req.keyword,
        page: req.page.page,
        pageSize: req.page.pageSize,
      },
    });
  }

  publishSharingService(
    req: PublishSharingServiceRequest
  ): Promise<Result<{ success: boolean }>> {
    return this.http.request({
      path: `/services/${req.serviceId}/publish`,
      method: 'POST',
      meta: req.meta,
      body: req,
    });
  }

  // applications
  createServiceApplication(
    req: CreateServiceApplicationRequest
  ): Promise<Result<CreateServiceApplicationResponse>> {
    return this.http.request({
      path: '/applications',
      method: 'POST',
      meta: req.meta,
      body: req,
    });
  }

  getServiceApplication(req: {
    meta?: RequestMeta;
    applicationId: string;
  }): Promise<Result<ServiceApplication>> {
    return this.http.request({
      path: `/applications/${req.applicationId}`,
      method: 'GET',
      meta: req.meta,
    });
  }

  listMyApplications(req: {
    meta?: RequestMeta;
    applicantUserId: string;
    page: PageRequest;
  }): Promise<Result<PageResult<ServiceApplication>>> {
    return this.http.request({
      path: '/applications',
      method: 'GET',
      meta: req.meta,
      query: {
        applicantUserId: req.applicantUserId,
        page: req.page.page,
        pageSize: req.page.pageSize,
      },
    });
  }

  listApplicationsForProvider(req: {
    meta?: RequestMeta;
    ownerOrgId: string;
    status?: ServiceApplicationStatus;
    page: PageRequest;
  }): Promise<Result<PageResult<ServiceApplication>>> {
    return this.http.request({
      path: '/applications/provider',
      method: 'GET',
      meta: req.meta,
      query: {
        ownerOrgId: req.ownerOrgId,
        status: req.status,
        page: req.page.page,
        pageSize: req.page.pageSize,
      },
    });
  }

  urgeApproval(
    req: UrgeApprovalRequest
  ): Promise<Result<{ success: boolean }>> {
    return this.http.request({
      path: `/applications/${req.applicationId}/urge`,
      method: 'POST',
      meta: req.meta,
      body: req,
    });
  }

  // exchange
  listExchangeExecutions(req: {
    meta?: RequestMeta;
    serviceId?: string;
    status?: string;
    page: PageRequest;
  }): Promise<Result<PageResult<TaskExecution>>> {
    return this.http.request({
      path: '/exchange/executions',
      method: 'GET',
      meta: req.meta,
      query: {
        serviceId: req.serviceId,
        status: req.status,
        page: req.page.page,
        pageSize: req.page.pageSize,
      },
    });
  }

  reRunExchangeExecution(
    req: ReRunExchangeExecutionRequest
  ): Promise<Result<{ newExecutionId: string }>> {
    return this.http.request({
      path: `/exchange/executions/${req.executionId}/rerun`,
      method: 'POST',
      meta: req.meta,
      body: req,
    });
  }

  updateExchangeSchedule(
    req: UpdateExchangeScheduleRequest
  ): Promise<Result<{ success: boolean }>> {
    return this.http.request({
      path: '/exchange/schedule',
      method: 'POST',
      meta: req.meta,
      body: req,
    });
  }
}
