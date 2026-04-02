import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import type {
  PageResult,
  Result,
  SharingService,
  SharingServiceStatus,
} from '@ai-datahub/contract';
import { DataSharingStore } from './data-sharing.store';
import { invalidArgument, nowIso } from './data-sharing.utils';

type PageQuery = {
  page?: string;
  pageSize?: string;
  keyword?: string;
  status?: SharingServiceStatus;
  compiledResourceId?: string;
};
type CreateSharingServiceBody = {
  service: Omit<SharingService, 'id' | 'status' | 'createdAt' | 'updatedAt'> & {
    status?: SharingServiceStatus;
  };
};
type UpdateSharingServiceBody = {
  service: Partial<SharingService> & { id?: string };
};

@Controller('services')
export class SharingServicesController {
  constructor(
    @Inject(DataSharingStore) private readonly store: DataSharingStore
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createSharingService(
    @Body() body: CreateSharingServiceBody
  ): Result<{ serviceId: string }> {
    if (!body?.service) return invalidArgument('Missing service');
    const s = body.service as Omit<
      SharingService,
      'id' | 'status' | 'createdAt' | 'updatedAt'
    > & { status?: SharingServiceStatus };
    if (!s.compiledResourceId)
      return invalidArgument('service.compiledResourceId is required');
    if (!s.name) return invalidArgument('service.name is required');
    if (!s.type) return invalidArgument('service.type is required');
    const id = `ss_${this.store.services.length + 1}`;
    const ts = nowIso();
    this.store.services.push({
      id,
      ...s,
      status: s.status ?? 'DRAFT',
      createdAt: ts,
      updatedAt: ts,
    });
    return { ok: true, data: { serviceId: id } };
  }

  @Put()
  updateSharingService(
    @Body() body: UpdateSharingServiceBody
  ): Result<{ success: boolean }> {
    if (!body?.service) return invalidArgument('Missing service');
    const id = (body.service as { id?: string }).id;
    if (!id) return invalidArgument('service.id is required');
    const idx = this.store.services.findIndex((x) => x.id === id);
    if (idx < 0) {
      return {
        ok: false,
        error: {
          code: 'SERVICE_NOT_FOUND',
          message: 'Service not found',
          level: 'ERROR',
        },
      };
    }
    const existing = this.store.services[idx];
    this.store.services[idx] = {
      ...existing,
      ...body.service,
      updatedAt: nowIso(),
    };
    return { ok: true, data: { success: true } };
  }

  @Delete(':id')
  deleteSharingService(@Param('id') id: string): Result<{ success: boolean }> {
    const before = this.store.services.length;
    this.store.services = this.store.services.filter((x) => x.id !== id);
    if (this.store.services.length === before) {
      return {
        ok: false,
        error: {
          code: 'SERVICE_NOT_FOUND',
          message: 'Service not found',
          level: 'ERROR',
        },
      };
    }
    return { ok: true, data: { success: true } };
  }

  @Get(':id')
  getSharingService(@Param('id') id: string): Result<SharingService> {
    const s = this.store.services.find((x) => x.id === id);
    if (!s) {
      return {
        ok: false,
        error: {
          code: 'SERVICE_NOT_FOUND',
          message: 'Service not found',
          level: 'ERROR',
        },
      };
    }
    return { ok: true, data: s };
  }

  @Get()
  searchSharingServices(
    @Query() q: PageQuery
  ): Result<PageResult<SharingService>> {
    const page = Math.max(1, Number(q.page ?? '1') || 1);
    const pageSize = Math.max(1, Number(q.pageSize ?? '20') || 20);
    let items = [...this.store.services];
    if (q.compiledResourceId)
      items = items.filter(
        (s) => s.compiledResourceId === q.compiledResourceId
      );
    if (q.status) items = items.filter((s) => s.status === q.status);
    if (q.keyword) {
      const kw = q.keyword.toLowerCase();
      items = items.filter((s) => s.name.toLowerCase().includes(kw));
    }
    const total = items.length;
    const start = (page - 1) * pageSize;
    const paged = items.slice(start, start + pageSize);
    return { ok: true, data: { page, pageSize, total, items: paged } };
  }

  @Post(':id/publish')
  @HttpCode(HttpStatus.OK)
  publishSharingService(
    @Param('id') id: string,
    @Body() body: { publish?: boolean }
  ): Result<{ success: boolean }> {
    const idx = this.store.services.findIndex((x) => x.id === id);
    if (idx < 0) {
      return {
        ok: false,
        error: {
          code: 'SERVICE_NOT_FOUND',
          message: 'Service not found',
          level: 'ERROR',
        },
      };
    }
    if (typeof body?.publish !== 'boolean')
      return invalidArgument('publish is required');
    const existing = this.store.services[idx];
    this.store.services[idx] = {
      ...existing,
      status: body.publish ? 'PUBLISHED' : 'OFFLINE',
      updatedAt: nowIso(),
    };
    return { ok: true, data: { success: true } };
  }
}
