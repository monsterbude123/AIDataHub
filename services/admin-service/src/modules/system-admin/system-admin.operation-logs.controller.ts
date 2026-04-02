import { Controller, Get, Inject, Query } from '@nestjs/common';
import type { OperationLog, PageResult, Result } from '@ai-datahub/contract';
import { SystemAdminStore } from './system-admin.store';

type PageQuery = { page?: string; pageSize?: string; actorUserId?: string };

@Controller('logs')
export class OperationLogsController {
  constructor(
    @Inject(SystemAdminStore) private readonly store: SystemAdminStore
  ) {}

  @Get()
  listOperationLogs(@Query() q: PageQuery): Result<PageResult<OperationLog>> {
    const page = Math.max(1, Number(q.page ?? '1') || 1);
    const pageSize = Math.max(1, Number(q.pageSize ?? '20') || 20);
    let items = [...this.store.operationLogs];
    if (q.actorUserId)
      items = items.filter((l) => l.actorUserId === q.actorUserId);
    const total = items.length;
    const start = (page - 1) * pageSize;
    const paged = items.slice(start, start + pageSize);
    return { ok: true, data: { page, pageSize, total, items: paged } };
  }
}
