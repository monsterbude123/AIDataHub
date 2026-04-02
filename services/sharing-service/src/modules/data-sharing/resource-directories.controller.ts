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
import type { ResourceDirectoryNode, Result } from '@ai-datahub/contract';
import { DataSharingStore } from './data-sharing.store';
import { invalidArgument, nowIso } from './data-sharing.utils';

@Controller('directories')
export class DirectoriesController {
  constructor(
    @Inject(DataSharingStore) private readonly store: DataSharingStore
  ) {}

  @Get()
  listResourceDirectories(
    @Query() q: { parentId?: string }
  ): Result<ResourceDirectoryNode[]> {
    const items = q.parentId
      ? this.store.directories.filter((d) => d.parentId === q.parentId)
      : this.store.directories.filter((d) => !d.parentId);
    return { ok: true, data: items };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createResourceDirectory(
    @Body()
    body: {
      node: Omit<ResourceDirectoryNode, 'id' | 'createdAt' | 'updatedAt'>;
    }
  ): Result<{ directoryId: string }> {
    if (!body?.node) return invalidArgument('Missing node');
    if (!body.node.name) return invalidArgument('node.name is required');
    if (!body.node.code) return invalidArgument('node.code is required');
    const id = `dir_${this.store.directories.length + 1}`;
    const ts = nowIso();
    this.store.directories.push({
      id,
      ...body.node,
      createdAt: ts,
      updatedAt: ts,
    });
    return { ok: true, data: { directoryId: id } };
  }

  @Put()
  updateResourceDirectory(
    @Body()
    body: {
      node: Omit<ResourceDirectoryNode, 'createdAt' | 'updatedAt'>;
    }
  ): Result<{ success: boolean }> {
    if (!body?.node) return invalidArgument('Missing node');
    if (!body.node.id) return invalidArgument('node.id is required');
    const idx = this.store.directories.findIndex((d) => d.id === body.node.id);
    if (idx < 0) {
      return {
        ok: false,
        error: {
          code: 'DIRECTORY_NOT_FOUND',
          message: 'Directory not found',
          level: 'ERROR',
        },
      };
    }
    const existing = this.store.directories[idx];
    this.store.directories[idx] = {
      ...existing,
      ...body.node,
      updatedAt: nowIso(),
    };
    return { ok: true, data: { success: true } };
  }

  @Delete(':id')
  deleteResourceDirectory(
    @Param('id') id: string
  ): Result<{ success: boolean }> {
    const before = this.store.directories.length;
    this.store.directories = this.store.directories.filter((d) => d.id !== id);
    if (this.store.directories.length === before) {
      return {
        ok: false,
        error: {
          code: 'DIRECTORY_NOT_FOUND',
          message: 'Directory not found',
          level: 'ERROR',
        },
      };
    }
    return { ok: true, data: { success: true } };
  }
}
