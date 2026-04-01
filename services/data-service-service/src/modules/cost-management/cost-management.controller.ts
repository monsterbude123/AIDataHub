import { Controller, Post, Body } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import type { Result, PageResult } from '@ai-datahub/contract';
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
    return this.service.getCostSeries(req);
  }

  @Post('quota/upsert')
  @ApiBody({ type: UpsertQuotaRequestDto })
  async upsertQuota(
    @Body() req: UpsertQuotaRequestDto
  ): Promise<Result<{ quotaId: string }>> {
    return this.service.upsertQuota(req);
  }

  @Post('quotas')
  @ApiBody({ type: ListQuotasRequestDto })
  async listQuotas(
    @Body() req: ListQuotasRequestDto
  ): Promise<Result<QuotaDto[]>> {
    return this.service.listQuotas(req);
  }

  @Post('optimization-hints')
  @ApiBody({ type: ListOptimizationHintsRequestDto })
  async listOptimizationHints(
    @Body() req: ListOptimizationHintsRequestDto
  ): Promise<Result<PageResult<OptimizationHintDto>>> {
    return this.service.listOptimizationHints(req);
  }
}
