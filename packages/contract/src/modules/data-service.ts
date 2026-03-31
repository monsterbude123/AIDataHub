import type {
  ID,
  ISODateTime,
  PageRequest,
  PageResult,
  RequestMeta,
  Result,
} from '../types';

export type DataServiceErrorCode =
  | 'DATA_ASSET_NOT_FOUND'
  | 'SERVICE_NOT_FOUND'
  | 'SERVICE_NAME_DUPLICATE'
  | 'SERVICE_NOT_PUBLISHED'
  | 'SERVICE_PUBLISHED_IMMUTABLE'
  | 'AUTHORIZATION_INVALID'
  | 'RATE_LIMIT_EXCEEDED'
  | 'PERMISSION_DENIED'
  | 'INVALID_ARGUMENT'
  | 'EXECUTION_FAILED';

export type DataServiceType = 'QUERY' | 'DOWNLOAD' | 'COMPARE';

export type FieldInfo = {
  name: string;
  type?: string;
  description?: string;
};

export type DataServiceInfo = {
  id: ID;
  code: string;
  name: string;
  type: DataServiceType;
  published: boolean;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};

export type DataServiceDetail = DataServiceInfo & {
  dataAssetId: ID;
  queryConfig: Record<string, unknown>;
  responseFields: FieldInfo[];
};

export type CreateDataServiceRequest = {
  meta?: RequestMeta;
  dataAssetId: ID;
  name: string;
  type: DataServiceType;
  queryConfig: Record<string, unknown>;
  responseFields: FieldInfo[];
};

export type CreateDataServiceResponse = {
  serviceId: ID;
  serviceCode: string;
};

export type UpdateDataServiceRequest = {
  meta?: RequestMeta;
  serviceId: ID;
  name?: string;
  queryConfig?: Record<string, unknown>;
  responseFields?: FieldInfo[];
};

export type PublishDataServiceRequest = {
  meta?: RequestMeta;
  serviceId: ID;
  publish: boolean;
};

export type GetDataServiceRequest = {
  meta?: RequestMeta;
  serviceId: ID;
};

export type SearchDataServiceRequest = {
  meta?: RequestMeta;
  keyword?: string;
  page: PageRequest;
};

export type AddAuthorizationRequest = {
  meta?: RequestMeta;
  serviceId: ID;
  userId: ID;
  maxDailyCalls: number;
  expireAt: ISODateTime;
};

export type AddAuthorizationResponse = {
  authorizationId: ID;
  accessKey: string;
};

export type CheckAuthorizationRequest = {
  meta?: RequestMeta;
  serviceCode: string;
  accessKey: string;
};

export type CheckAuthorizationResponse = {
  allowed: boolean;
  message: string;
  expireAt?: ISODateTime;
};

export type InvokeDataServiceRequest = {
  meta?: RequestMeta;
  serviceCode: string;
  params: Record<string, unknown>;
  accessKey: string;
};

export type InvokeDataServiceResponse = {
  rows: Array<Record<string, unknown>>;
  total?: number;
};

export type ServiceCallLog = {
  id: ID;
  serviceId: ID;
  userId?: ID;
  ip?: string;
  mac?: string;
  durationMs: number;
  calledAt: ISODateTime;
  success: boolean;
  errorCode?: string;
};

export type GetServiceCallLogsRequest = {
  meta?: RequestMeta;
  serviceId: ID;
  startAt: ISODateTime;
  endAt: ISODateTime;
};

export interface DataServiceClient {
  createDataService(
    req: CreateDataServiceRequest
  ): Promise<Result<CreateDataServiceResponse>>;
  updateDataService(
    req: UpdateDataServiceRequest
  ): Promise<Result<{ success: boolean }>>;
  publishDataService(
    req: PublishDataServiceRequest
  ): Promise<Result<{ success: boolean }>>;
  getDataService(
    req: GetDataServiceRequest
  ): Promise<Result<DataServiceDetail>>;
  searchDataService(
    req: SearchDataServiceRequest
  ): Promise<Result<PageResult<DataServiceInfo>>>;
  addAuthorization(
    req: AddAuthorizationRequest
  ): Promise<Result<AddAuthorizationResponse>>;
  checkAuthorization(
    req: CheckAuthorizationRequest
  ): Promise<Result<CheckAuthorizationResponse>>;
  invokeDataService(
    req: InvokeDataServiceRequest
  ): Promise<Result<InvokeDataServiceResponse>>;
  getServiceCallLogs(
    req: GetServiceCallLogsRequest
  ): Promise<Result<ServiceCallLog[]>>;
}
