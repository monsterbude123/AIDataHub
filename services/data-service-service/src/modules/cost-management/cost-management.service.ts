import { Injectable } from '@nestjs/common';
import type {
  CostManagementClient,
  GetCostSeriesRequest,
  CostSeries,
  UpsertQuotaRequest,
  Quota,
  OptimizationHint,
  PageResult,
  PageRequest,
  Result,
} from '@ai-datahub/contract';
import { okResult } from '@ai-datahub/contract';
import { createLogger } from '@ai-datahub/shared';
import type { RequestMeta } from '@ai-datahub/contract';
import { InMemoryQuotaRepository } from './interfaces/quota.repository';
import { InMemoryOptimizationHintRepository } from './interfaces/optimization-hint.repository';

const logger = createLogger({ module: 'cost-management' });

@Injectable()
export class CostManagementService implements CostManagementClient {
  private readonly quotaRepository = new InMemoryQuotaRepository();
  private readonly hintRepository = new InMemoryOptimizationHintRepository();

  constructor() {
    // Seed with some mock optimization hints for demonstration
    this.seedMockHints();
  }

  /**
   * Get cost series grouped by dimension and resource type
   */
  async getCostSeries(
    req: GetCostSeriesRequest
  ): Promise<Result<CostSeries[]>> {
    const traceId = req.meta?.traceId;
    logger.debug('getCostSeries', { query: req.query, traceId });

    // In-memory mock implementation - generates synthetic data for demonstration
    const result: CostSeries[] = [];
    const { startAt, endAt } = req.query;

    // Generate weekly points between start and end
    const start = new Date(startAt);
    const end = new Date(endAt);
    const computePoints: CostSeries['points'] = [];
    const storagePoints: CostSeries['points'] = [];

    const current = new Date(start);
    while (current <= end) {
      const timeStr = current.toISOString().split('T')[0];
      // Random mock data between reasonable ranges
      computePoints.push({
        time: timeStr,
        amount: 10 + Math.random() * 20,
      });
      storagePoints.push({
        time: timeStr,
        amount: 50 + Math.random() * 100,
      });
      // Next week
      current.setDate(current.getDate() + 7);
    }

    result.push({
      resourceType: 'COMPUTE',
      points: computePoints,
    });
    result.push({
      resourceType: 'STORAGE',
      points: storagePoints,
    });

    return okResult(result, traceId);
  }

  /**
   * Create or update a cost quota
   */
  async upsertQuota(
    req: UpsertQuotaRequest
  ): Promise<Result<{ quotaId: string }>> {
    const traceId = req.meta?.traceId;
    logger.debug('upsertQuota', { quota: req.quota, traceId });

    const result = await this.quotaRepository.upsert(req.quota);
    return okResult(result, traceId);
  }

  /**
   * List all quotas matching filter
   */
  async listQuotas(req: {
    meta?: RequestMeta;
    dimension?: import('@ai-datahub/contract').CostDimension;
    orgId?: string;
    projectId?: string;
  }): Promise<Result<Quota[]>> {
    const traceId = req.meta?.traceId;
    logger.debug('listQuotas', { ...req, traceId });

    const result = await this.quotaRepository.findAll({
      dimension: req.dimension,
      orgId: req.orgId,
      projectId: req.projectId,
    });

    return okResult(result, traceId);
  }

  /**
   * List cost optimization hints with pagination
   */
  async listOptimizationHints(req: {
    meta?: RequestMeta;
    orgId: string;
    projectId: string;
    page: PageRequest;
  }): Promise<Result<PageResult<OptimizationHint>>> {
    const traceId = req.meta?.traceId;
    logger.debug('listOptimizationHints', { ...req, traceId });

    const result = await this.hintRepository.findAll({
      orgId: req.orgId,
      projectId: req.projectId,
      page: req.page,
    });

    return okResult(result, traceId);
  }

  private seedMockHints(): void {
    this.hintRepository.addHint({
      type: 'ZOMBIE_TABLE',
      title: 'Unused partitioned table',
      detail:
        "Table sales.events hasn't been queried in 30 days and contains 120GB of data",
      severity: 'HIGH',
    });

    this.hintRepository.addHint({
      type: 'UNUSED_DATA',
      title: 'Stale backup data',
      detail: 'Multiple backup partitions from 6 months ago are still retained',
      severity: 'MEDIUM',
    });

    this.hintRepository.addHint({
      type: 'OVER_QUOTA',
      title: 'Storage quota approaching limit',
      detail: 'Current usage is 85% of the project storage quota',
      severity: 'MEDIUM',
    });
  }
}
