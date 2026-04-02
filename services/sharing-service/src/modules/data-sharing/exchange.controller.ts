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
import type { PageResult, Result, TaskExecution } from '@ai-datahub/contract';
import { DataSharingStore } from './data-sharing.store';
import { invalidArgument } from './data-sharing.utils';

type PageQuery = {
  page?: string;
  pageSize?: string;
  serviceId?: string;
  status?: string;
};
type ExchangeExecution = TaskExecution & { serviceId?: string };

@Controller('exchange')
export class ExchangeController {
  constructor(
    @Inject(DataSharingStore) private readonly store: DataSharingStore
  ) {}

  @Get('executions')
  listExchangeExecutions(
    @Query() q: PageQuery
  ): Result<PageResult<TaskExecution>> {
    const page = Math.max(1, Number(q.page ?? '1') || 1);
    const pageSize = Math.max(1, Number(q.pageSize ?? '20') || 20);
    let items: ExchangeExecution[] = [...this.store.exchangeExecutions];
    if (q.serviceId) items = items.filter((e) => e.serviceId === q.serviceId);
    if (q.status) items = items.filter((e) => e.status === q.status);
    const total = items.length;
    const start = (page - 1) * pageSize;
    const paged = items.slice(start, start + pageSize);
    return { ok: true, data: { page, pageSize, total, items: paged } };
  }

  @Post('executions/:id/rerun')
  @HttpCode(HttpStatus.OK)
  reRunExchangeExecution(
    @Param('id') _id: string
  ): Result<{ newExecutionId: string }> {
    // MVP：不依赖 scheduler，直接生成新的 executionId
    return { ok: true, data: { newExecutionId: `ex_${Date.now()}` } };
  }

  @Post('schedule')
  @HttpCode(HttpStatus.OK)
  updateExchangeSchedule(
    @Body() body: { executionId?: string; schedule?: string; enabled?: boolean }
  ): Result<{ success: boolean }> {
    if (!body?.executionId) return invalidArgument('executionId is required');
    // MVP：仅返回成功
    return { ok: true, data: { success: true } };
  }
}
