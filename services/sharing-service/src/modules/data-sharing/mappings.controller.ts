import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Query,
} from '@nestjs/common';
import type { ResourceMapping, Result } from '@ai-datahub/contract';
import { DataSharingStore } from './data-sharing.store';
import { invalidArgument, nowIso } from './data-sharing.utils';

type AttachResourceBody = {
  compiledResourceId?: string;
  registeredResourceId?: string;
  mode?: ResourceMapping['mode'];
  fieldMappings?: ResourceMapping['fieldMappings'];
};

@Controller('mappings')
export class MappingsController {
  constructor(
    @Inject(DataSharingStore) private readonly store: DataSharingStore
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  attachResource(
    @Body() body: AttachResourceBody
  ): Result<{ mappingId: string }> {
    if (!body?.compiledResourceId)
      return invalidArgument('compiledResourceId is required');
    if (!body?.registeredResourceId)
      return invalidArgument('registeredResourceId is required');
    if (!body?.mode) return invalidArgument('mode is required');
    const mappingId = `map_${Date.now()}`;
    const m: ResourceMapping = {
      id: mappingId,
      compiledResourceId: body.compiledResourceId,
      registeredResourceId: body.registeredResourceId,
      mode: body.mode,
      fieldMappings: body.fieldMappings,
      createdAt: nowIso(),
    };
    this.store.mappings.set(body.compiledResourceId, m);
    return { ok: true, data: { mappingId } };
  }

  @Delete()
  detachResource(
    @Body() body: { compiledResourceId?: string }
  ): Result<{ success: boolean }> {
    if (!body?.compiledResourceId)
      return invalidArgument('compiledResourceId is required');
    this.store.mappings.delete(body.compiledResourceId);
    return { ok: true, data: { success: true } };
  }

  @Get()
  getResourceMapping(
    @Query() q: { compiledResourceId?: string }
  ): Result<ResourceMapping> {
    if (!q.compiledResourceId)
      return invalidArgument('compiledResourceId is required');
    const m = this.store.mappings.get(q.compiledResourceId);
    if (!m) {
      return {
        ok: false,
        error: {
          code: 'COMPILED_RESOURCE_NOT_FOUND',
          message: 'Mapping not found',
          level: 'ERROR',
        },
      };
    }
    return { ok: true, data: m };
  }
}
