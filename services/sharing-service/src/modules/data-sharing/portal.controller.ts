import { Controller, Get, Inject, Query } from '@nestjs/common';
import type { PortalHomeStats, Result } from '@ai-datahub/contract';
import { DataSharingStore } from './data-sharing.store';

@Controller('portal')
export class PortalController {
  constructor(
    @Inject(DataSharingStore) private readonly store: DataSharingStore
  ) {}

  @Get('stats')
  getPortalHomeStats(@Query() _q: { orgId?: string }): Result<PortalHomeStats> {
    // MVP：基于内存数据给出可用结构
    const todoCount = this.store.applications.filter(
      (a) => a.status === 'SUBMITTED'
    ).length;
    return {
      ok: true,
      data: {
        todoCount,
        hotResourcesTop10: this.store.services.slice(0, 10).map((s) => ({
          id: s.id,
          name: s.name,
          visits: 0,
        })),
        resourceDirectoryStats: [
          {
            type: 'TABLE',
            count: this.store.registeredResources.filter(
              (r) => r.type === 'TABLE'
            ).length,
          },
          {
            type: 'API',
            count: this.store.registeredResources.filter(
              (r) => r.type === 'API'
            ).length,
          },
          {
            type: 'FILE',
            count: this.store.registeredResources.filter(
              (r) => r.type === 'FILE'
            ).length,
          },
        ],
      },
    };
  }
}
