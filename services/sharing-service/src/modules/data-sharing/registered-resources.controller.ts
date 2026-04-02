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
  RegisteredResource,
  ShareResourceType,
  TestRegisteredApiResponse,
} from '@ai-datahub/contract';
import type { Result } from '@ai-datahub/contract';
import { DataSharingStore } from './data-sharing.store';
import { invalidArgument, nowIso } from './data-sharing.utils';

type PageQuery = {
  page?: string;
  pageSize?: string;
  keyword?: string;
  ownerOrgId?: string;
  type?: ShareResourceType;
};
type CreateRegisteredResourceBody = {
  resource: Omit<
    RegisteredResource,
    'id' | 'status' | 'createdAt' | 'updatedAt'
  >;
};
type UpdateRegisteredResourceBody = {
  resource: Partial<RegisteredResource> & { id?: string };
};

@Controller('resources/registered')
export class RegisteredResourcesController {
  constructor(
    @Inject(DataSharingStore) private readonly store: DataSharingStore
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createRegisteredResource(
    @Body() body: CreateRegisteredResourceBody
  ): Result<{ resourceId: string }> {
    if (!body?.resource) return invalidArgument('Missing resource');
    const r = body.resource as Omit<
      RegisteredResource,
      'id' | 'status' | 'createdAt' | 'updatedAt'
    >;
    if (!r.type) return invalidArgument('resource.type is required');
    if (!r.name) return invalidArgument('resource.name is required');
    if (!r.ownerOrgId)
      return invalidArgument('resource.ownerOrgId is required');
    const id = `rr_${this.store.registeredResources.length + 1}`;
    const ts = nowIso();
    const resource: RegisteredResource = {
      ...r,
      id,
      status: 'ACTIVE',
      createdAt: ts,
      updatedAt: ts,
    };
    this.store.registeredResources.push(resource);
    return { ok: true, data: { resourceId: id } };
  }

  @Put()
  updateRegisteredResource(
    @Body() body: UpdateRegisteredResourceBody
  ): Result<{ success: boolean }> {
    if (!body?.resource) return invalidArgument('Missing resource');
    const id = (body.resource as { id?: string }).id;
    if (!id) return invalidArgument('resource.id is required');
    const idx = this.store.registeredResources.findIndex((x) => x.id === id);
    if (idx < 0) {
      return {
        ok: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Resource not found',
          level: 'ERROR',
        },
      };
    }
    const existing = this.store.registeredResources[idx];
    this.store.registeredResources[idx] = {
      ...existing,
      ...body.resource,
      updatedAt: nowIso(),
    };
    return { ok: true, data: { success: true } };
  }

  @Delete(':id')
  deleteRegisteredResource(
    @Param('id') id: string
  ): Result<{ success: boolean }> {
    const idx = this.store.registeredResources.findIndex((x) => x.id === id);
    if (idx < 0) {
      return {
        ok: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Resource not found',
          level: 'ERROR',
        },
      };
    }
    const existing = this.store.registeredResources[idx];
    this.store.registeredResources[idx] = {
      ...existing,
      status: 'DELETED',
      updatedAt: nowIso(),
    };
    return { ok: true, data: { success: true } };
  }

  @Get(':id')
  getRegisteredResource(@Param('id') id: string): Result<RegisteredResource> {
    const r = this.store.registeredResources.find(
      (x) => x.id === id && x.status !== 'DELETED'
    );
    if (!r) {
      return {
        ok: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Resource not found',
          level: 'ERROR',
        },
      };
    }
    return { ok: true, data: r };
  }

  @Get()
  listRegisteredResources(
    @Query() q: PageQuery
  ): Result<PageResult<RegisteredResource>> {
    const page = Math.max(1, Number(q.page ?? '1') || 1);
    const pageSize = Math.max(1, Number(q.pageSize ?? '20') || 20);
    let items = this.store.registeredResources.filter(
      (r) => r.status !== 'DELETED'
    );
    if (q.ownerOrgId)
      items = items.filter((r) => r.ownerOrgId === q.ownerOrgId);
    if (q.type) items = items.filter((r) => r.type === q.type);
    if (q.keyword) {
      const kw = q.keyword.toLowerCase();
      items = items.filter((r) => r.name.toLowerCase().includes(kw));
    }
    const total = items.length;
    const start = (page - 1) * pageSize;
    const paged = items.slice(start, start + pageSize);
    return { ok: true, data: { page, pageSize, total, items: paged } };
  }

  @Post(':id/test')
  @HttpCode(HttpStatus.OK)
  testRegisteredApi(
    @Param('id') id: string
  ): Result<TestRegisteredApiResponse> {
    const r = this.store.registeredResources.find(
      (x) => x.id === id && x.status !== 'DELETED'
    );
    if (!r) {
      return {
        ok: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Resource not found',
          level: 'ERROR',
        },
      };
    }
    if (r.type !== 'API') {
      return invalidArgument('Only API resource can be tested');
    }
    return {
      ok: true,
      data: {
        success: true,
        statusCode: 200,
        response: { ok: true },
        testedAt: nowIso(),
      },
    };
  }
}
