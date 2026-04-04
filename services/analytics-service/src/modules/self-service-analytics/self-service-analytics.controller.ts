import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import type {
  DataExploreResponse,
  ExportQueryResultResponse,
  PageResult,
  QueryResult,
  Result,
  SavedQuery,
  VisualizationSpec,
  VisualizationType,
} from '@ai-datahub/contract';

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
export class SelfServiceAnalyticsController {
  private queries: SavedQuery[] = [];
  private visualizations: VisualizationSpec[] = [];
  private shares = new Map<string, string[]>();

  @Post('queries')
  @HttpCode(HttpStatus.CREATED)
  saveQuery(
    @Body() body: { query: Omit<SavedQuery, 'id' | 'createdAt' | 'updatedAt'> }
  ): Result<{ queryId: string }> {
    if (!body?.query) return invalidArgument('Missing query');
    if (!body.query.name) return invalidArgument('query.name is required');
    if (!body.query.createdBy)
      return invalidArgument('query.createdBy is required');
    if (!body.query.definition || typeof body.query.definition !== 'object')
      return invalidArgument('query.definition is required');
    const id = `q_${this.queries.length + 1}`;
    const ts = nowIso();
    this.queries.push({ id, ...body.query, createdAt: ts, updatedAt: ts });
    return { ok: true, data: { queryId: id } };
  }

  @Put('queries')
  updateQuery(
    @Body()
    body: {
      query: Partial<Omit<SavedQuery, 'createdAt' | 'updatedAt'>> & {
        id: string;
      };
    }
  ): Result<{ success: boolean }> {
    if (!body?.query?.id) return invalidArgument('query.id is required');
    const idx = this.queries.findIndex((q) => q.id === body.query.id);
    if (idx < 0) {
      return {
        ok: false,
        error: {
          code: 'QUERY_NOT_FOUND',
          message: 'Query not found',
          level: 'ERROR',
        },
      };
    }
    const existing = this.queries[idx];
    this.queries[idx] = { ...existing, ...body.query, updatedAt: nowIso() };
    return { ok: true, data: { success: true } };
  }

  @Delete('queries/:id')
  deleteQuery(@Param('id') id: string): Result<{ success: boolean }> {
    const before = this.queries.length;
    this.queries = this.queries.filter((q) => q.id !== id);
    if (this.queries.length === before) {
      return {
        ok: false,
        error: {
          code: 'QUERY_NOT_FOUND',
          message: 'Query not found',
          level: 'ERROR',
        },
      };
    }
    return { ok: true, data: { success: true } };
  }

  @Get('queries')
  listQueries(
    @Query() q: { createdBy?: string; page?: string; pageSize?: string }
  ): Result<PageResult<SavedQuery>> {
    if (!q.createdBy) return invalidArgument('createdBy is required');
    const page = Math.max(1, Number(q.page ?? '1') || 1);
    const pageSize = Math.max(1, Number(q.pageSize ?? '20') || 20);
    const itemsAll = this.queries.filter((x) => x.createdBy === q.createdBy);
    const total = itemsAll.length;
    const start = (page - 1) * pageSize;
    const items = itemsAll.slice(start, start + pageSize);
    return { ok: true, data: { page, pageSize, total, items } };
  }

  @Post('queries/:id/execute')
  @HttpCode(HttpStatus.OK)
  executeSavedQuery(@Param('id') id: string): Result<QueryResult> {
    const query = this.queries.find((x) => x.id === id);
    if (!query) {
      return {
        ok: false,
        error: {
          code: 'QUERY_NOT_FOUND',
          message: 'Query not found',
          level: 'ERROR',
        },
      };
    }
    return {
      ok: true,
      data: {
        columns: ['id', 'value'],
        rows: [{ id: 'r1', value: 1 }],
        rowCount: 1,
      },
    };
  }

  @Post('queries/:id/export')
  @HttpCode(HttpStatus.OK)
  exportQueryResult(
    @Param('id') id: string,
    @Body() body: { format?: 'CSV' | 'XLSX' }
  ): Result<ExportQueryResultResponse> {
    const query = this.queries.find((x) => x.id === id);
    if (!query) {
      return {
        ok: false,
        error: {
          code: 'QUERY_NOT_FOUND',
          message: 'Query not found',
          level: 'ERROR',
        },
      };
    }
    if (!body?.format) return invalidArgument('format is required');
    const expireAt = new Date(Date.now() + 10 * 60_000).toISOString();
    return {
      ok: true,
      data: {
        downloadUrl: `https://download.local/query-${encodeURIComponent(id)}.${body.format.toLowerCase()}`,
        expireAt,
      },
    };
  }

  @Post('queries/:id/share')
  @HttpCode(HttpStatus.OK)
  shareQuery(
    @Param('id') id: string,
    @Body() body: { toUserIds?: string[] }
  ): Result<{ success: boolean }> {
    const query = this.queries.find((x) => x.id === id);
    if (!query) {
      return {
        ok: false,
        error: {
          code: 'QUERY_NOT_FOUND',
          message: 'Query not found',
          level: 'ERROR',
        },
      };
    }
    if (!Array.isArray(body?.toUserIds) || body.toUserIds.length === 0) {
      return invalidArgument('toUserIds is required');
    }
    this.shares.set(id, [...body.toUserIds]);
    return { ok: true, data: { success: true } };
  }

  @Post('visualizations')
  @HttpCode(HttpStatus.CREATED)
  createVisualization(
    @Body()
    body: {
      visualization: Omit<VisualizationSpec, 'id' | 'createdAt' | 'updatedAt'>;
    }
  ): Result<{ visualizationId: string }> {
    if (!body?.visualization) return invalidArgument('Missing visualization');
    const v = body.visualization;
    if (!v.queryId) return invalidArgument('visualization.queryId is required');
    if (!v.type) return invalidArgument('visualization.type is required');
    if (!v.config || typeof v.config !== 'object')
      return invalidArgument('visualization.config is required');
    if (!v.createdBy)
      return invalidArgument('visualization.createdBy is required');
    const allowed = new Set<VisualizationType>([
      'BAR',
      'LINE',
      'PIE',
      'MAP',
      'TABLE',
    ]);
    if (!allowed.has(v.type)) {
      return {
        ok: false,
        error: {
          code: 'VISUALIZATION_NOT_SUPPORTED',
          message: 'Visualization type not supported',
          level: 'ERROR',
        },
      };
    }
    const id = `vz_${this.visualizations.length + 1}`;
    const ts = nowIso();
    this.visualizations.push({ id, ...v, createdAt: ts, updatedAt: ts });
    return { ok: true, data: { visualizationId: id } };
  }

  @Put('visualizations')
  updateVisualization(
    @Body()
    body: {
      visualization: Omit<VisualizationSpec, 'createdAt' | 'updatedAt'>;
    }
  ): Result<{ success: boolean }> {
    if (!body?.visualization?.id)
      return invalidArgument('visualization.id is required');
    const idx = this.visualizations.findIndex(
      (x) => x.id === body.visualization.id
    );
    if (idx < 0) {
      return {
        ok: false,
        error: {
          code: 'QUERY_NOT_FOUND',
          message: 'Visualization not found',
          level: 'ERROR',
        },
      };
    }
    const existing = this.visualizations[idx];
    this.visualizations[idx] = {
      ...existing,
      ...body.visualization,
      updatedAt: nowIso(),
    };
    return { ok: true, data: { success: true } };
  }

  @Get('visualizations')
  listVisualizations(
    @Query() q: { queryId?: string; page?: string; pageSize?: string }
  ): Result<PageResult<VisualizationSpec>> {
    if (!q.queryId) return invalidArgument('queryId is required');
    const page = Math.max(1, Number(q.page ?? '1') || 1);
    const pageSize = Math.max(1, Number(q.pageSize ?? '20') || 20);
    const itemsAll = this.visualizations.filter((x) => x.queryId === q.queryId);
    const total = itemsAll.length;
    const start = (page - 1) * pageSize;
    const items = itemsAll.slice(start, start + pageSize);
    return { ok: true, data: { page, pageSize, total, items } };
  }

  @Post('explore')
  @HttpCode(HttpStatus.OK)
  exploreData(
    @Body()
    body: {
      dataAssetId?: string;
      sampleSize?: number;
      options?: Record<string, unknown>;
    }
  ): Result<DataExploreResponse> {
    if (!body?.dataAssetId) return invalidArgument('dataAssetId is required');
    return {
      ok: true,
      data: {
        metrics: [{ name: 'sampleSize', value: body.sampleSize ?? 100 }],
        sampleRows: [{ id: 'row1', value: 123 }],
      },
    };
  }
}
