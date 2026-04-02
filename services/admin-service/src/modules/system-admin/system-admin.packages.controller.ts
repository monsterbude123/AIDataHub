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
  Query,
} from '@nestjs/common';
import type { PackageDef, PageResult, Result } from '@ai-datahub/contract';
import { SystemAdminStore } from './system-admin.store';

type PageQuery = { page?: string; pageSize?: string; keyword?: string };
type CreatePackageBody = { pkg: Omit<PackageDef, 'id' | 'createdAt'> };

function invalidArgument(message: string): Result<never> {
  return {
    ok: false,
    error: { code: 'INVALID_ARGUMENT', message, level: 'ERROR' },
  };
}
function nowIso(): string {
  return new Date().toISOString();
}

@Controller('packages')
export class PackagesController {
  constructor(
    @Inject(SystemAdminStore) private readonly store: SystemAdminStore
  ) {}

  @Get()
  listPackages(@Query() q: PageQuery): Result<PageResult<PackageDef>> {
    const page = Math.max(1, Number(q.page ?? '1') || 1);
    const pageSize = Math.max(1, Number(q.pageSize ?? '20') || 20);
    let items = [...this.store.packages];
    if (q.keyword) {
      const kw = q.keyword.toLowerCase();
      items = items.filter((p) => p.name.toLowerCase().includes(kw));
    }
    const total = items.length;
    const start = (page - 1) * pageSize;
    const paged = items.slice(start, start + pageSize);
    return { ok: true, data: { page, pageSize, total, items: paged } };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createPackage(
    @Body() body: CreatePackageBody
  ): Result<{ packageId: string }> {
    if (!body?.pkg) return invalidArgument('Missing pkg');
    if (!body.pkg.name) return invalidArgument('pkg.name is required');
    if (!body.pkg.artifactRef)
      return invalidArgument('pkg.artifactRef is required');
    const id = `pkg_${this.store.packages.length + 1}`;
    this.store.packages.push({ id, ...body.pkg, createdAt: nowIso() });
    return { ok: true, data: { packageId: id } };
  }

  @Delete(':id')
  deletePackage(@Param('id') id: string): Result<{ success: boolean }> {
    const before = this.store.packages.length;
    this.store.packages = this.store.packages.filter((x) => x.id !== id);
    if (this.store.packages.length === before) {
      return {
        ok: false,
        error: {
          code: 'PACKAGE_NOT_FOUND',
          message: 'Package not found',
          level: 'ERROR',
        },
      };
    }
    return { ok: true, data: { success: true } };
  }
}
