import type {
  AddAuthorizationRequest,
  AddAuthorizationResponse,
  CheckAuthorizationRequest,
  CheckAuthorizationResponse,
  CreateDataServiceRequest,
  CreateDataServiceResponse,
  DataServiceClient,
  DataServiceDetail,
  DataServiceInfo,
  GetDataServiceRequest,
  GetServiceCallLogsRequest,
  InvokeDataServiceRequest,
  InvokeDataServiceResponse,
  PageResult,
  PublishDataServiceRequest,
  SearchDataServiceRequest,
  ServiceCallLog,
  UpdateDataServiceRequest,
} from '@ai-datahub/contract';
import type { Result } from '@ai-datahub/contract';

import type { HttpClient } from '../http/HttpClient';

export class DataServiceHttpClient implements DataServiceClient {
  constructor(private readonly http: HttpClient) {}

  createDataService(
    req: CreateDataServiceRequest
  ): Promise<Result<CreateDataServiceResponse>> {
    return this.http.request({
      path: '/data-services',
      method: 'POST',
      meta: req.meta,
      body: req,
    });
  }

  updateDataService(
    req: UpdateDataServiceRequest
  ): Promise<Result<{ success: boolean }>> {
    return this.http.request({
      path: `/data-services/${req.serviceId}`,
      method: 'PATCH',
      meta: req.meta,
      body: req,
    });
  }

  publishDataService(
    req: PublishDataServiceRequest
  ): Promise<Result<{ success: boolean }>> {
    return this.http.request({
      path: `/data-services/${req.serviceId}/publish`,
      method: 'POST',
      meta: req.meta,
      body: req,
    });
  }

  getDataService(
    req: GetDataServiceRequest
  ): Promise<Result<DataServiceDetail>> {
    return this.http.request({
      path: `/data-services/${req.serviceId}`,
      method: 'GET',
      meta: req.meta,
    });
  }

  searchDataService(
    req: SearchDataServiceRequest
  ): Promise<Result<PageResult<DataServiceInfo>>> {
    return this.http.request({
      path: '/data-services/search',
      method: 'GET',
      meta: req.meta,
      query: {
        keyword: req.keyword,
        page: req.page.page,
        pageSize: req.page.pageSize,
      },
    });
  }

  addAuthorization(
    req: AddAuthorizationRequest
  ): Promise<Result<AddAuthorizationResponse>> {
    return this.http.request({
      path: `/data-services/${req.serviceId}/authorizations`,
      method: 'POST',
      meta: req.meta,
      body: req,
    });
  }

  checkAuthorization(
    req: CheckAuthorizationRequest
  ): Promise<Result<CheckAuthorizationResponse>> {
    return this.http.request({
      path: `/data-services/${req.serviceCode}/authorizations/check`,
      method: 'POST',
      meta: req.meta,
      body: req,
    });
  }

  invokeDataService(
    req: InvokeDataServiceRequest
  ): Promise<Result<InvokeDataServiceResponse>> {
    return this.http.request({
      path: `/data-services/${req.serviceCode}:invoke`,
      method: 'POST',
      meta: req.meta,
      body: req,
    });
  }

  getServiceCallLogs(
    req: GetServiceCallLogsRequest
  ): Promise<Result<ServiceCallLog[]>> {
    return this.http.request({
      path: `/data-services/${req.serviceId}/call-logs`,
      method: 'GET',
      meta: req.meta,
      query: { startAt: req.startAt, endAt: req.endAt },
    });
  }
}
