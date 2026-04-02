import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import type {
  DataSourceHealth,
  DatasetSyncRecord,
  EtlConnection,
  ISODateTime,
  OpsReport,
  PageResult,
  Result,
  TaskExecution,
} from '@ai-datahub/contract';
import type { FastifyReply } from 'fastify';

type GetOpsReportQuery = {
  startAt?: string;
  endAt?: string;
  module?: string;
};

type PageQuery = { page?: string; pageSize?: string };

type ListEtlConnectionsQuery = PageQuery & { keyword?: string };
type CreateEtlConnectionBody = {
  connection: Omit<EtlConnection, 'id' | 'createdAt' | 'updatedAt'>;
};
type UpdateEtlConnectionBody = {
  connection: Omit<EtlConnection, 'createdAt' | 'updatedAt'>;
};

function nowIso(): string {
  return new Date().toISOString();
}

function invalidArgument(message: string): Result<never> {
  return {
    ok: false,
    error: { code: 'INVALID_ARGUMENT', message, level: 'ERROR' },
  };
}

@Controller()
export class OpsController {
  private etlConnections: EtlConnection[] = [];
  private datasetSyncRecords: DatasetSyncRecord[] = [];
  private dataSourceHealth: DataSourceHealth[] = [];
  private executions: TaskExecution[] = [];

  @Get('report')
  getOpsReport(@Query() q: GetOpsReportQuery): Result<OpsReport> {
    if (!q?.startAt || !q?.endAt) {
      return invalidArgument('startAt and endAt are required');
    }
    const start = new Date(q.startAt);
    const end = new Date(q.endAt);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return invalidArgument('startAt/endAt must be ISO datetime');
    }
    if (end.getTime() < start.getTime()) {
      return invalidArgument('endAt must be >= startAt');
    }

    const generatedAt = nowIso() as ISODateTime;
    const totalExecutions = this.executions.length;
    const failedExecutions = this.executions.filter(
      (e) => (e as unknown as { status?: string }).status === 'FAILED'
    ).length;
    const successRate =
      totalExecutions === 0
        ? 1
        : (totalExecutions - failedExecutions) / totalExecutions;

    return {
      ok: true,
      data: {
        successRate,
        totalExecutions,
        failedExecutions,
        generatedAt,
      },
    };
  }

  @Get('health/data-sources')
  listDataSourceHealth(
    @Query() q: PageQuery
  ): Result<PageResult<DataSourceHealth>> {
    const page = Math.max(1, Number(q.page ?? '1') || 1);
    const pageSize = Math.max(1, Number(q.pageSize ?? '20') || 20);

    const items = [...this.dataSourceHealth];
    const total = items.length;
    const start = (page - 1) * pageSize;
    const paged = items.slice(start, start + pageSize);
    return { ok: true, data: { page, pageSize, total, items: paged } };
  }

  @Post('etl/connections')
  createEtlConnection(
    @Body() body: CreateEtlConnectionBody,
    @Res({ passthrough: true }) reply: FastifyReply
  ): Result<{ connectionId: string }> {
    if (!body || typeof body !== 'object' || !('connection' in body)) {
      reply.code(HttpStatus.OK);
      return invalidArgument('Missing connection');
    }
    const c = body.connection as CreateEtlConnectionBody['connection'];
    if (!c.name || typeof c.name !== 'string') {
      reply.code(HttpStatus.OK);
      return invalidArgument('connection.name is required');
    }
    if (!c.connectionRef || typeof c.connectionRef !== 'string') {
      reply.code(HttpStatus.OK);
      return invalidArgument('connection.connectionRef is required');
    }

    const id = `ec_${this.etlConnections.length + 1}`;
    const ts = nowIso() as ISODateTime;
    const conn: EtlConnection = {
      id,
      name: c.name,
      connectionRef: c.connectionRef,
      status: c.status,
      lastCheckedAt: c.lastCheckedAt,
      lastErrorMessage: c.lastErrorMessage,
      createdAt: ts,
      updatedAt: ts,
    };
    this.etlConnections.push(conn);
    reply.code(HttpStatus.CREATED);
    return { ok: true, data: { connectionId: id } };
  }

  @Put('etl/connections')
  updateEtlConnection(
    @Body() body: UpdateEtlConnectionBody
  ): Result<{ success: boolean }> {
    if (!body || typeof body !== 'object' || !('connection' in body)) {
      return invalidArgument('Missing connection');
    }
    const c = body.connection as UpdateEtlConnectionBody['connection'];
    if (!c.id || typeof c.id !== 'string')
      return invalidArgument('connection.id is required');
    const idx = this.etlConnections.findIndex((x) => x.id === c.id);
    if (idx < 0) {
      return {
        ok: false,
        error: {
          code: 'ETL_CONNECTION_NOT_FOUND',
          message: 'ETL connection not found',
          level: 'ERROR',
        },
      };
    }
    const existing = this.etlConnections[idx];
    this.etlConnections[idx] = {
      ...existing,
      ...c,
      updatedAt: nowIso() as ISODateTime,
    };
    return { ok: true, data: { success: true } };
  }

  @Delete('etl/connections/:id')
  deleteEtlConnection(@Param('id') id: string): Result<{ success: boolean }> {
    const before = this.etlConnections.length;
    this.etlConnections = this.etlConnections.filter((c) => c.id !== id);
    if (this.etlConnections.length === before) {
      return {
        ok: false,
        error: {
          code: 'ETL_CONNECTION_NOT_FOUND',
          message: 'ETL connection not found',
          level: 'ERROR',
        },
      };
    }
    return { ok: true, data: { success: true } };
  }

  @Get('etl/connections')
  listEtlConnections(
    @Query() q: ListEtlConnectionsQuery
  ): Result<PageResult<EtlConnection>> {
    const page = Math.max(1, Number(q.page ?? '1') || 1);
    const pageSize = Math.max(1, Number(q.pageSize ?? '20') || 20);
    let items = [...this.etlConnections];
    if (q.keyword) {
      const kw = q.keyword.toLowerCase();
      items = items.filter((c) => c.name.toLowerCase().includes(kw));
    }
    const total = items.length;
    const start = (page - 1) * pageSize;
    const paged = items.slice(start, start + pageSize);
    return { ok: true, data: { page, pageSize, total, items: paged } };
  }

  @Get('sync/records')
  listDatasetSyncRecords(
    @Query() q: PageQuery
  ): Result<PageResult<DatasetSyncRecord>> {
    const page = Math.max(1, Number(q.page ?? '1') || 1);
    const pageSize = Math.max(1, Number(q.pageSize ?? '20') || 20);
    const items = [...this.datasetSyncRecords];
    const total = items.length;
    const start = (page - 1) * pageSize;
    const paged = items.slice(start, start + pageSize);
    return { ok: true, data: { page, pageSize, total, items: paged } };
  }

  @Get('executions')
  listExecutions(@Query() q: PageQuery): Result<PageResult<TaskExecution>> {
    const page = Math.max(1, Number(q.page ?? '1') || 1);
    const pageSize = Math.max(1, Number(q.pageSize ?? '20') || 20);
    const items = [...this.executions];
    const total = items.length;
    const start = (page - 1) * pageSize;
    const paged = items.slice(start, start + pageSize);
    return { ok: true, data: { page, pageSize, total, items: paged } };
  }
}
