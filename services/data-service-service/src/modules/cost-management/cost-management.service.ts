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

const logger = createLogger({ module: 'cost-management' });

@Injectable()
export class CostManagementService implements CostManagementClient {
  private readonly quotaRepository = new InMemoryQuotaRepository();

  /**
   * Get cost series grouped by dimension and resource type
   */
  async getCostSeries(
    req: GetCostSeriesRequest
  ): Promise<Result<CostSeries[]>> {
    const traceId = req.meta?.traceId;
    logger.debug('getCostSeries', { query: req.query, traceId });

    // In-memory mock implementation - returns empty series for now
    // In production this would query the cost database
    const result: CostSeries[] = [];

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
    projectId?: string;
    page: PageRequest;
  }): Promise<Result<PageResult<OptimizationHint>>> {
    const traceId = req.meta?.traceId;
    logger.debug('listOptimizationHints', { ...req, traceId });

    // Mock implementation - returns empty list for now
    const result: PageResult<OptimizationHint> = {
      page: req.page.page,
      pageSize: req.page.pageSize,
      total: 0,
      items: [],
    };

    return okResult(result, traceId);
  }
}
