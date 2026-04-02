import { Controller, Get, Post, Put, Body, Query, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { DataAssetService } from './data-asset.service';
import type {
  Result,
  DataAsset,
  PageResult,
  ColumnMetadata,
} from '@ai-datahub/contract';
import {
  CreateDataAssetDto,
  UpdateDataAssetDto,
  SearchDataAssetsDto,
} from './data-asset.dtos';

@ApiTags('数据资产管理')
@ApiBearerAuth()
@Controller('data-assets')
export class DataAssetController {
  constructor(private readonly service: DataAssetService) {}

  @Post()
  @ApiOperation({ summary: '创建数据资产', description: '创建新的数据资产' })
  @ApiResponse({ status: 201, description: '成功创建数据资产' })
  @ApiResponse({ status: 400, description: '数据资产编码重复' })
  createDataAsset(
    @Body() body: CreateDataAssetDto
  ): Promise<Result<{ dataAssetId: string }>> {
    return this.service.createDataAsset({ dataAsset: body });
  }

  @Put()
  @ApiOperation({
    summary: '更新数据资产',
    description: '更新现有数据资产信息',
  })
  @ApiResponse({ status: 200, description: '成功更新数据资产' })
  @ApiResponse({ status: 404, description: '数据资产不存在' })
  updateDataAsset(
    @Body() body: UpdateDataAssetDto
  ): Promise<Result<{ success: boolean }>> {
    return this.service.updateDataAsset({ dataAsset: body });
  }

  @Get(':id')
  @ApiOperation({
    summary: '获取数据资产详情',
    description: '根据ID获取数据资产详情',
  })
  @ApiResponse({ status: 200, description: '成功返回数据资产详情' })
  @ApiResponse({ status: 404, description: '数据资产不存在' })
  @ApiParam({ name: 'id', description: '数据资产ID' })
  getDataAssetById(@Param('id') id: string): Promise<Result<DataAsset>> {
    return this.service.getDataAssetById(id);
  }

  @Get()
  @ApiOperation({
    summary: '搜索数据资产',
    description: '根据关键字分页搜索数据资产',
  })
  @ApiResponse({ status: 200, description: '成功返回数据资产列表' })
  @ApiQuery({ name: 'keyword', description: '搜索关键字', required: false })
  @ApiQuery({ name: 'page', description: '页码', required: false })
  @ApiQuery({ name: 'pageSize', description: '每页数量', required: false })
  searchDataAssets(
    @Query() query: SearchDataAssetsDto
  ): Promise<Result<PageResult<DataAsset>>> {
    return this.service.searchDataAssets({
      keyword: query.keyword,
      page: { page: query.page || 1, pageSize: query.pageSize || 10 },
    });
  }

  @Get(':id/columns')
  @ApiOperation({
    summary: '获取列元数据',
    description: '获取数据资产的所有列元数据',
  })
  @ApiResponse({ status: 200, description: '成功返回列元数据列表' })
  @ApiParam({ name: 'id', description: '数据资产ID' })
  getColumnsByDataAssetId(@Param('id') id: string): Promise<ColumnMetadata[]> {
    return this.service.getColumnsByDataAssetId(id);
  }
}
