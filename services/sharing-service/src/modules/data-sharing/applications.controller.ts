import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import type {
  PageResult,
  Result,
  ServiceApplication,
  ServiceApplicationStatus,
} from '@ai-datahub/contract';
import { DataSharingStore } from './data-sharing.store';
import { invalidArgument, nowIso } from './data-sharing.utils';

type PageQuery = { page?: string; pageSize?: string; applicantUserId?: string };
type ProviderQuery = {
  page?: string;
  pageSize?: string;
  ownerOrgId?: string;
  status?: ServiceApplicationStatus;
};
type CreateServiceApplicationBody = {
  serviceId?: string;
  applicantUserId?: string;
  applicantOrgId?: string;
  payload?: Record<string, unknown>;
  submit?: boolean;
};

@Controller('applications')
export class ApplicationsController {
  constructor(
    @Inject(DataSharingStore) private readonly store: DataSharingStore
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  createServiceApplication(@Body() body: CreateServiceApplicationBody): Result<{
    applicationId: string;
    status: ServiceApplicationStatus;
    approvalId?: string;
  }> {
    if (!body?.serviceId) return invalidArgument('serviceId is required');
    if (!body?.applicantUserId)
      return invalidArgument('applicantUserId is required');
    if (!body?.applicantOrgId)
      return invalidArgument('applicantOrgId is required');
    if (!body?.payload || typeof body.payload !== 'object')
      return invalidArgument('payload is required');
    const id = `app_${this.store.applications.length + 1}`;
    const ts = nowIso();
    const status: ServiceApplicationStatus = body.submit
      ? 'SUBMITTED'
      : 'DRAFT';
    const approvalId = status === 'SUBMITTED' ? `ap_${Date.now()}` : undefined;
    const app: ServiceApplication = {
      id,
      serviceId: body.serviceId,
      applicantUserId: body.applicantUserId,
      applicantOrgId: body.applicantOrgId,
      status,
      approvalId,
      createdAt: ts,
      updatedAt: ts,
    };
    this.store.applications.push(app);
    return { ok: true, data: { applicationId: id, status, approvalId } };
  }

  @Get(':id')
  getServiceApplication(@Param('id') id: string): Result<ServiceApplication> {
    const app = this.store.applications.find((x) => x.id === id);
    if (!app) {
      return {
        ok: false,
        error: {
          code: 'APPLICATION_NOT_FOUND',
          message: 'Application not found',
          level: 'ERROR',
        },
      };
    }
    return { ok: true, data: app };
  }

  @Get()
  listMyApplications(
    @Query() q: PageQuery
  ): Result<PageResult<ServiceApplication>> {
    if (!q.applicantUserId)
      return invalidArgument('applicantUserId is required');
    const page = Math.max(1, Number(q.page ?? '1') || 1);
    const pageSize = Math.max(1, Number(q.pageSize ?? '20') || 20);
    const itemsAll = this.store.applications.filter(
      (a) => a.applicantUserId === q.applicantUserId
    );
    const total = itemsAll.length;
    const start = (page - 1) * pageSize;
    const items = itemsAll.slice(start, start + pageSize);
    return { ok: true, data: { page, pageSize, total, items } };
  }

  @Get('provider')
  listApplicationsForProvider(
    @Query() q: ProviderQuery
  ): Result<PageResult<ServiceApplication>> {
    if (!q.ownerOrgId) return invalidArgument('ownerOrgId is required');
    const page = Math.max(1, Number(q.page ?? '1') || 1);
    const pageSize = Math.max(1, Number(q.pageSize ?? '20') || 20);
    let itemsAll = [...this.store.applications];
    if (q.status) itemsAll = itemsAll.filter((a) => a.status === q.status);
    const total = itemsAll.length;
    const start = (page - 1) * pageSize;
    const items = itemsAll.slice(start, start + pageSize);
    return { ok: true, data: { page, pageSize, total, items } };
  }

  @Post(':id/urge')
  @HttpCode(HttpStatus.OK)
  urgeApproval(
    @Param('id') id: string,
    @Body() _body: { message?: string }
  ): Result<{ success: boolean }> {
    const idx = this.store.applications.findIndex((x) => x.id === id);
    if (idx < 0) {
      return {
        ok: false,
        error: {
          code: 'APPLICATION_NOT_FOUND',
          message: 'Application not found',
          level: 'ERROR',
        },
      };
    }
    return { ok: true, data: { success: true } };
  }
}
