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
import type {
  ArchiveRecord,
  LifecyclePolicy,
  PageResult,
  Result,
} from '@ai-datahub/contract';
import { SecurityStore } from './security.store';
import { invalidArgument, nowIso } from './security.utils';

@Controller()
export class DataLifecycleController {
  constructor(@Inject(SecurityStore) private readonly store: SecurityStore) {}

  @Post('lifecycle/policies')
  @HttpCode(HttpStatus.OK)
  configurePolicy(
    @Body()
    body: {
      policy: Omit<LifecyclePolicy, 'id' | 'createdAt' | 'updatedAt'> & {
        id?: string;
      };
    }
  ): Result<{ policyId: string }> {
    if (!body?.policy?.name) return invalidArgument('policy.name is required');
    if (!body.policy.tier) return invalidArgument('policy.tier is required');
    if (!body.policy.rules || typeof body.policy.rules !== 'object')
      return invalidArgument('policy.rules is required');
    if (typeof body.policy.enabled !== 'boolean')
      return invalidArgument('policy.enabled is required');
    if (body.policy.id) {
      const idx = this.store.lifecyclePolicies.findIndex(
        (p) => p.id === body.policy.id
      );
      if (idx >= 0) {
        const existing = this.store.lifecyclePolicies[idx];
        this.store.lifecyclePolicies[idx] = {
          ...existing,
          ...body.policy,
          updatedAt: nowIso(),
        };
        return { ok: true, data: { policyId: existing.id } };
      }
    }
    const id = this.store.nextId('lcp');
    const ts = nowIso();
    this.store.lifecyclePolicies.push({
      id,
      ...body.policy,
      createdAt: ts,
      updatedAt: ts,
    });
    return { ok: true, data: { policyId: id } };
  }

  @Get('lifecycle/policies')
  listPolicies(@Query() q: { enabled?: string }): Result<LifecyclePolicy[]> {
    let items = [...this.store.lifecyclePolicies];
    if (q.enabled !== undefined)
      items = items.filter((p) => p.enabled === (q.enabled === 'true'));
    return { ok: true, data: items };
  }

  @Post('lifecycle/archive')
  @HttpCode(HttpStatus.OK)
  archiveData(
    @Body() body: { dataAssetId?: string; policyId?: string }
  ): Result<{ archiveId: string }> {
    if (!body?.dataAssetId) return invalidArgument('dataAssetId is required');
    if (!body.policyId) return invalidArgument('policyId is required');
    const id = this.store.nextId('ar');
    const ts = nowIso();
    this.store.archiveRecords.push({
      id,
      dataAssetId: body.dataAssetId,
      policyId: body.policyId,
      status: 'SUCCESS',
      createdAt: ts,
      updatedAt: ts,
      archiveRef: `archive://${id}`,
    });
    return { ok: true, data: { archiveId: id } };
  }

  @Post('lifecycle/restore')
  @HttpCode(HttpStatus.OK)
  restoreData(
    @Body() body: { archiveId?: string }
  ): Result<{ success: boolean }> {
    if (!body?.archiveId) return invalidArgument('archiveId is required');
    const record = this.store.archiveRecords.find(
      (x) => x.id === body.archiveId
    );
    if (!record)
      return {
        ok: false,
        error: {
          code: 'ARCHIVE_NOT_FOUND',
          message: 'Archive not found',
          level: 'ERROR',
        },
      };
    return { ok: true, data: { success: true } };
  }

  @Get('lifecycle/records')
  listArchiveRecords(
    @Query()
    q: {
      page?: string;
      pageSize?: string;
      dataAssetId?: string;
      policyId?: string;
      status?: string;
    }
  ): Result<PageResult<ArchiveRecord>> {
    const page = Math.max(1, Number(q.page ?? '1') || 1);
    const pageSize = Math.max(1, Number(q.pageSize ?? '20') || 20);
    let items = [...this.store.archiveRecords];
    if (q.dataAssetId)
      items = items.filter((x) => x.dataAssetId === q.dataAssetId);
    if (q.policyId) items = items.filter((x) => x.policyId === q.policyId);
    if (q.status) items = items.filter((x) => x.status === q.status);
    const total = items.length;
    const start = (page - 1) * pageSize;
    return {
      ok: true,
      data: {
        page,
        pageSize,
        total,
        items: items.slice(start, start + pageSize),
      },
    };
  }

  @Get('lifecycle/records/:id')
  getArchiveRecord(@Param('id') id: string): Result<ArchiveRecord> {
    const r = this.store.archiveRecords.find((x) => x.id === id);
    if (!r)
      return {
        ok: false,
        error: {
          code: 'ARCHIVE_NOT_FOUND',
          message: 'Archive not found',
          level: 'ERROR',
        },
      };
    return { ok: true, data: r };
  }

  @Post('lifecycle/expired')
  @HttpCode(HttpStatus.OK)
  deleteExpiredData(
    @Body() body: { policyId?: string; dryRun?: boolean }
  ): Result<{ dryRun: boolean; deletedCount: number }> {
    if (!body?.policyId) return invalidArgument('policyId is required');
    return {
      ok: true,
      data: { dryRun: body.dryRun ?? false, deletedCount: body.dryRun ? 0 : 1 },
    };
  }

  @Get('lifecycle/report')
  getLifecycleReport(
    @Query()
    q: {
      startAt?: string;
      endAt?: string;
      orgId?: string;
      projectId?: string;
    }
  ): Result<{
    points: Array<{ time: string; hot: number; warm: number; cold: number }>;
  }> {
    if (!q.startAt || !q.endAt)
      return invalidArgument('startAt and endAt are required');
    return {
      ok: true,
      data: { points: [{ time: nowIso(), hot: 10, warm: 5, cold: 2 }] },
    };
  }
}
