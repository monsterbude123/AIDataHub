import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Put,
  Query,
} from '@nestjs/common';
import type { PageResult, Result, WorkTicket } from '@ai-datahub/contract';
import { SystemAdminStore } from './system-admin.store';

type PageQuery = { page?: string; pageSize?: string; assigneeUserId?: string };

function invalidArgument(message: string): Result<never> {
  return {
    ok: false,
    error: { code: 'INVALID_ARGUMENT', message, level: 'ERROR' },
  };
}

@Controller('tickets')
export class TicketsController {
  constructor(
    @Inject(SystemAdminStore) private readonly store: SystemAdminStore
  ) {}

  @Get()
  listMyTickets(@Query() q: PageQuery): Result<PageResult<WorkTicket>> {
    if (!q.assigneeUserId) return invalidArgument('assigneeUserId is required');
    const page = Math.max(1, Number(q.page ?? '1') || 1);
    const pageSize = Math.max(1, Number(q.pageSize ?? '20') || 20);
    const items = this.store.tickets.filter(
      (t) => t.assigneeUserId === q.assigneeUserId
    );
    const total = items.length;
    const start = (page - 1) * pageSize;
    const paged = items.slice(start, start + pageSize);
    return { ok: true, data: { page, pageSize, total, items: paged } };
  }

  @Get(':id')
  getWorkTicket(@Param('id') id: string): Result<WorkTicket> {
    const t = this.store.tickets.find((x) => x.id === id);
    if (!t) {
      return {
        ok: false,
        error: {
          code: 'TICKET_NOT_FOUND',
          message: 'Ticket not found',
          level: 'ERROR',
        },
      };
    }
    return { ok: true, data: t };
  }

  @Put(':id')
  updateWorkTicket(
    @Param('id') id: string,
    @Body() body: { status?: WorkTicket['status']; resolution?: string }
  ): Result<{ success: boolean }> {
    const idx = this.store.tickets.findIndex((x) => x.id === id);
    if (idx < 0) {
      return {
        ok: false,
        error: {
          code: 'TICKET_NOT_FOUND',
          message: 'Ticket not found',
          level: 'ERROR',
        },
      };
    }
    const existing = this.store.tickets[idx];
    this.store.tickets[idx] = {
      ...existing,
      status: body.status ?? existing.status,
      resolution: body.resolution ?? existing.resolution,
      updatedAt: new Date().toISOString(),
    };
    return { ok: true, data: { success: true } };
  }
}
