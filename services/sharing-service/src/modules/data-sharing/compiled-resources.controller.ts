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
  CompiledResource,
  CompiledResourceStatus,
  ISODateTime,
  PageResult,
  ShareResourceType,
} from '@ai-datahub/contract';
import type { Result } from '@ai-datahub/contract';
import { DataSharingStore } from './data-sharing.store';
import { invalidArgument, nowIso } from './data-sharing.utils';

type PageQuery = {
  page?: string;
  pageSize?: string;
  keyword?: string;
  directoryId?: string;
  type?: ShareResourceType;
  status?: CompiledResourceStatus;
};
type CreateCompiledResourceBody = {
  resource: Omit<
    CompiledResource,
    'id' | 'status' | 'createdAt' | 'updatedAt'
  > & {
    status?: CompiledResourceStatus;
  };
};
type UpdateCompiledResourceBody = {
  resource: Partial<CompiledResource> & { id?: string };
};

@Controller('resources/compiled')
export class CompiledResourcesController {
  constructor(
    @Inject(DataSharingStore) private readonly store: DataSharingStore
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createCompiledResource(
    @Body() body: CreateCompiledResourceBody
  ): Result<{ compiledResourceId: string }> {
    if (!body?.resource) return invalidArgument('Missing resource');
    const r = body.resource;
    if (!r.directoryId)
      return invalidArgument('resource.directoryId is required');
    if (!r.name) return invalidArgument('resource.name is required');
    if (!r.type) return invalidArgument('resource.type is required');
    if (!r.shareType) return invalidArgument('resource.shareType is required');
    if (!Array.isArray(r.dataItems))
      return invalidArgument('resource.dataItems is required');
    const id = `cr_${this.store.compiledResources.length + 1}`;
    const ts = nowIso() as ISODateTime;
    const resource: CompiledResource = {
      id,
      directoryId: r.directoryId,
      name: r.name,
      type: r.type,
      shareType: r.shareType,
      status: r.status ?? 'DRAFT',
      dataItems: r.dataItems,
      tags: r.tags,
      createdAt: ts,
      updatedAt: ts,
    };
    this.store.compiledResources.push(resource);
    return { ok: true, data: { compiledResourceId: id } };
  }

  @Put()
  updateCompiledResource(
    @Body() body: UpdateCompiledResourceBody
  ): Result<{ success: boolean }> {
    if (!body?.resource) return invalidArgument('Missing resource');
    const id = (body.resource as { id?: string }).id;
    if (!id) return invalidArgument('resource.id is required');
    const idx = this.store.compiledResources.findIndex((x) => x.id === id);
    if (idx < 0) {
      return {
        ok: false,
        error: {
          code: 'COMPILED_RESOURCE_NOT_FOUND',
          message: 'Compiled resource not found',
          level: 'ERROR',
        },
      };
    }
    const existing = this.store.compiledResources[idx];
    this.store.compiledResources[idx] = {
      ...existing,
      ...body.resource,
      updatedAt: nowIso(),
    };
    return { ok: true, data: { success: true } };
  }

  @Delete(':id')
  deleteCompiledResource(
    @Param('id') id: string
  ): Result<{ success: boolean }> {
    const idx = this.store.compiledResources.findIndex((x) => x.id === id);
    if (idx < 0) {
      return {
        ok: false,
        error: {
          code: 'COMPILED_RESOURCE_NOT_FOUND',
          message: 'Compiled resource not found',
          level: 'ERROR',
        },
      };
    }
    const existing = this.store.compiledResources[idx];
    this.store.compiledResources[idx] = {
      ...existing,
      status: 'DELETED',
      updatedAt: nowIso(),
    };
    return { ok: true, data: { success: true } };
  }

  @Get(':id')
  getCompiledResource(@Param('id') id: string): Result<CompiledResource> {
    const r = this.store.compiledResources.find(
      (x) => x.id === id && x.status !== 'DELETED'
    );
    if (!r) {
      return {
        ok: false,
        error: {
          code: 'COMPILED_RESOURCE_NOT_FOUND',
          message: 'Compiled resource not found',
          level: 'ERROR',
        },
      };
    }
    return { ok: true, data: r };
  }

  @Get()
  searchCompiledResources(
    @Query() q: PageQuery
  ): Result<PageResult<CompiledResource>> {
    const page = Math.max(1, Number(q.page ?? '1') || 1);
    const pageSize = Math.max(1, Number(q.pageSize ?? '20') || 20);
    let items = this.store.compiledResources.filter(
      (r) => r.status !== 'DELETED'
    );
    if (q.directoryId)
      items = items.filter((r) => r.directoryId === q.directoryId);
    if (q.type) items = items.filter((r) => r.type === q.type);
    if (q.status) items = items.filter((r) => r.status === q.status);
    if (q.keyword) {
      const kw = q.keyword.toLowerCase();
      items = items.filter((r) => r.name.toLowerCase().includes(kw));
    }
    const total = items.length;
    const start = (page - 1) * pageSize;
    const paged = items.slice(start, start + pageSize);
    return { ok: true, data: { page, pageSize, total, items: paged } };
  }

  @Post('import')
  @HttpCode(HttpStatus.OK)
  importCompiledResources(
    @Body() body: { format: string; payload: Record<string, unknown> }
  ): Result<{ success: boolean }> {
    if (!body?.format) return invalidArgument('format is required');
    return { ok: true, data: { success: true } };
  }

  @Get('export')
  exportCompiledResources(
    @Query() q: { directoryId?: string; format?: string }
  ): Result<{ downloadUrl: string; expireAt: ISODateTime }> {
    if (!q.directoryId) return invalidArgument('directoryId is required');
    if (!q.format) return invalidArgument('format is required');
    const expireAt = new Date(
      Date.now() + 10 * 60_000
    ).toISOString() as ISODateTime;
    return {
      ok: true,
      data: {
        downloadUrl: `https://download.local/compiled-${encodeURIComponent(q.directoryId)}`,
        expireAt,
      },
    };
  }

  @Post(':id/publish')
  @HttpCode(HttpStatus.OK)
  publishCompiledResource(
    @Param('id') id: string,
    @Body() body: { action?: 'SUBMIT' | 'CANCEL_PUBLISH' }
  ): Result<{ success: boolean }> {
    const idx = this.store.compiledResources.findIndex((x) => x.id === id);
    if (idx < 0) {
      return {
        ok: false,
        error: {
          code: 'COMPILED_RESOURCE_NOT_FOUND',
          message: 'Compiled resource not found',
          level: 'ERROR',
        },
      };
    }
    const existing = this.store.compiledResources[idx];
    const action = body?.action;
    if (action !== 'SUBMIT' && action !== 'CANCEL_PUBLISH')
      return invalidArgument('action is required');
    const next: CompiledResourceStatus =
      action === 'SUBMIT' ? 'SUBMITTED' : 'CANCELED';
    this.store.compiledResources[idx] = {
      ...existing,
      status: next,
      updatedAt: nowIso(),
    };
    return { ok: true, data: { success: true } };
  }
}
