import { Controller, Post, Body } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import type { Result, PageResult } from '@ai-datahub/contract';
import type { CostDimension, ResourceType } from '@ai-datahub/contract';
import {
  CostSeriesRequestDto,
  CostSeriesPointDto,
  UpsertQuotaRequestDto,
  QuotaDto,
  ListQuotasRequestDto,
  OptimizationHintDto,
  ListOptimizationHintsRequestDto,
} from '@ai-datahub/contract';
import { CostManagementService } from './cost-management.service';

@ApiTags('CostManagement')
@Controller('api/cost')
export class CostManagementController {
  constructor(private readonly service: CostManagementService) {}

  @Post('series')
  @ApiBody({ type: CostSeriesRequestDto })
  async getCostSeries(
    @Body() req: CostSeriesRequestDto
  ): Promise<Result<CostSeriesPointDto[]>> {
    // Map DTO to service request
    const result = await this.service.getCostSeries({
      meta: req.meta,
      query: {
        dimension: req.projectId ? 'PROJECT' : 'ORG',
        orgId: '',
        projectId: req.projectId,
        startAt: req.startDate,
        endAt: req.endDate,
      },
    });

    if (!result.ok) {
      return result;
    }

    // Flatten to CostSeriesPointDto[] for simpler client consumption
    const points: CostSeriesPointDto[] = [];
    for (const series of result.data) {
      for (const point of series.points) {
        if (series.resourceType === 'COMPUTE') {
          points.push({
            date: point.time,
            cost: point.amount,
            computeCost: point.amount,
          });
        } else if (series.resourceType === 'STORAGE') {
          points.push({
            date: point.time,
            cost: point.amount,
            storageCost: point.amount,
          });
        }
      }
    }

    return {
      ...result,
      data: points,
    };
  }

  @Post('quota/upsert')
  @ApiBody({ type: UpsertQuotaRequestDto })
  async upsertQuota(
    @Body() req: UpsertQuotaRequestDto
  ): Promise<Result<{ quotaId: string }>> {
    // UpsertQuotaRequestDto.quota already contains:
    // id, name, resourceType, limit, used, unit, projectId, dataSourceId, createdAt, updatedAt
    // We need to map to contract which requires: dimension, resourceType, limit, enabled
    const quota = req.quota;
    const dimension: CostDimension = quota.projectId ? 'PROJECT' : 'ORG';
    return this.service.upsertQuota({
      meta: req.meta,
      quota: {
        dimension,
        resourceType: quota.resourceType as ResourceType,
        limit: quota.limit,
        enabled: true,
        projectId: quota.projectId,
        orgId: '',
      },
    });
  }

  @Post('quotas')
  @ApiBody({ type: ListQuotasRequestDto })
  async listQuotas(
    @Body() req: ListQuotasRequestDto
  ): Promise<Result<QuotaDto[]>> {
    // Map DTO to service request - orgId is empty for now (will come from auth context)
    const result = await this.service.listQuotas({
      meta: req.meta,
      dimension: req.projectId ? 'PROJECT' : undefined,
      projectId: req.projectId,
      orgId: '',
    });

    if (!result.ok) {
      return result;
    }

    // Map internal Quota to QuotaDto
    const dto: QuotaDto[] = result.data.map((q) => ({
      id: q.id,
      name: `${q.resourceType}-${q.dimension}`,
      resourceType: q.resourceType,
      limit: q.limit,
      used: 0,
      unit: q.resourceType === 'STORAGE' ? 'GB' : 'CU',
      projectId: q.projectId,
      dataSourceId: undefined,
      createdAt: q.createdAt,
      updatedAt: q.updatedAt,
    }));

    return {
      ...result,
      data: dto,
    };
  }

  @Post('optimization-hints')
  @ApiBody({ type: ListOptimizationHintsRequestDto })
  async listOptimizationHints(
    @Body() req: ListOptimizationHintsRequestDto
  ): Promise<Result<PageResult<OptimizationHintDto>>> {
    // Map DTO to service request
    const result = await this.service.listOptimizationHints({
      meta: req.meta,
      orgId: '',
      projectId: '',
      page: {
        page: 1,
        pageSize: 100,
      },
    });

    if (!result.ok) {
      return result;
    }

    // Map internal OptimizationHint to OptimizationHintDto
    const dto: PageResult<OptimizationHintDto> = {
      ...result.data,
      items: result.data.items.map((h) => ({
        id: h.id,
        type: h.type,
        title: h.title,
        description: h.detail,
        potentialSavings: 0,
        priority: h.severity,
        processed: false,
        createdAt: h.createdAt,
      })),
    };

    return {
      ...result,
      data: dto,
    };
  }
}
