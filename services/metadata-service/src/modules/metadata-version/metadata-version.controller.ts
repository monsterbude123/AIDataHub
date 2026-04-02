import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { MetadataVersionService } from './metadata-version.service';
import type {
  Result,
  PageResult,
  MetadataVersion,
  MetadataVersionDiff,
} from '@ai-datahub/contract';
import { GetVersionsDto, CompareVersionsDto } from './metadata-version.dtos';

@ApiTags('元数据版本管理')
@ApiBearerAuth()
@Controller('metadata-versions')
export class MetadataVersionController {
  constructor(private readonly service: MetadataVersionService) {}

  @Get()
  @ApiOperation({
    summary: '获取版本列表',
    description: '分页获取数据资产的元数据版本历史',
  })
  @ApiResponse({ status: 200, description: '成功返回版本列表' })
  @ApiQuery({ name: 'dataAssetId', description: '数据资产ID' })
  @ApiQuery({ name: 'page', description: '页码', required: false })
  @ApiQuery({ name: 'pageSize', description: '每页数量', required: false })
  getVersions(
    @Query() query: GetVersionsDto
  ): Promise<Result<PageResult<MetadataVersion>>> {
    return this.service.getMetadataVersions(query);
  }

  @Post('compare')
  @ApiOperation({
    summary: '比较版本差异',
    description: '比较两个元数据版本之间的差异',
  })
  @ApiResponse({ status: 200, description: '成功返回差异列表' })
  compareVersions(
    @Body() body: CompareVersionsDto
  ): Promise<Result<{ diffs: MetadataVersionDiff[] }>> {
    return this.service.compareMetadataVersions(body);
  }
}
