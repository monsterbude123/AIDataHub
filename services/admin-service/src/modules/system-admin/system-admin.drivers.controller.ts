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
import type { DriverDef, PageResult, Result } from '@ai-datahub/contract';
import { SystemAdminStore } from './system-admin.store';

type PageQuery = { page?: string; pageSize?: string };
type CreateDriverBody = { driver: Omit<DriverDef, 'id' | 'createdAt'> };

function invalidArgument(message: string): Result<never> {
  return {
    ok: false,
    error: { code: 'INVALID_ARGUMENT', message, level: 'ERROR' },
  };
}
function nowIso(): string {
  return new Date().toISOString();
}

@Controller('drivers')
export class DriversController {
  constructor(
    @Inject(SystemAdminStore) private readonly store: SystemAdminStore
  ) {}

  @Get()
  listDrivers(@Query() q: PageQuery): Result<PageResult<DriverDef>> {
    const page = Math.max(1, Number(q.page ?? '1') || 1);
    const pageSize = Math.max(1, Number(q.pageSize ?? '20') || 20);
    const items = [...this.store.drivers];
    const total = items.length;
    const start = (page - 1) * pageSize;
    const paged = items.slice(start, start + pageSize);
    return { ok: true, data: { page, pageSize, total, items: paged } };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createDriver(@Body() body: CreateDriverBody): Result<{ driverId: string }> {
    if (!body?.driver) return invalidArgument('Missing driver');
    if (!body.driver.name) return invalidArgument('driver.name is required');
    if (!body.driver.version)
      return invalidArgument('driver.version is required');
    if (!body.driver.artifactRef)
      return invalidArgument('driver.artifactRef is required');
    const id = `drv_${this.store.drivers.length + 1}`;
    this.store.drivers.push({ id, ...body.driver, createdAt: nowIso() });
    return { ok: true, data: { driverId: id } };
  }

  @Delete(':id')
  deleteDriver(@Param('id') id: string): Result<{ success: boolean }> {
    const before = this.store.drivers.length;
    this.store.drivers = this.store.drivers.filter((x) => x.id !== id);
    if (this.store.drivers.length === before) {
      return {
        ok: false,
        error: {
          code: 'DRIVER_NOT_FOUND',
          message: 'Driver not found',
          level: 'ERROR',
        },
      };
    }
    return { ok: true, data: { success: true } };
  }
}
