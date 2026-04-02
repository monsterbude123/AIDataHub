import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { DataConnectionService } from './data-connection.service';
import type {
  Result,
  MetadataSource,
  MetadataSourceListResult,
  DataSourceConnectionTest,
} from '@ai-datahub/contract';
import {
  TestConnectionDto,
  CreateSourceDto,
  ListSourcesDto,
} from './data-connection.dtos';

@ApiTags('数据源连接管理')
@ApiBearerAuth()
@Controller('data-connection')
export class DataConnectionController {
  constructor(private readonly service: DataConnectionService) {}

  @Post('test')
  @ApiOperation({
    summary: '测试数据库连接',
    description: '使用提供的配置测试到数据源的连接',
  })
  @ApiResponse({ status: 200, description: '测试完成，返回连接结果' })
  testConnection(
    @Body() body: TestConnectionDto
  ): Promise<Result<DataSourceConnectionTest>> {
    return this.service.testConnection(body);
  }

  @Post()
  @ApiOperation({
    summary: '创建数据源',
    description: '创建新的数据源连接配置',
  })
  @ApiResponse({ status: 201, description: '成功创建数据源' })
  @ApiResponse({ status: 400, description: '数据源名称重复' })
  createSource(@Body() body: CreateSourceDto): Promise<Result<MetadataSource>> {
    return this.service.createMetadataSource(body);
  }

  @Get()
  @ApiOperation({
    summary: '获取数据源列表',
    description: '分页查询数据源列表，支持按类型和状态过滤',
  })
  @ApiResponse({ status: 200, description: '成功返回数据源列表' })
  @ApiQuery({ name: 'type', description: '按类型过滤', required: false })
  @ApiQuery({ name: 'status', description: '按状态过滤', required: false })
  @ApiQuery({ name: 'page', description: '页码', required: false })
  @ApiQuery({ name: 'pageSize', description: '每页数量', required: false })
  listSources(
    @Query() query: ListSourcesDto
  ): Promise<Result<MetadataSourceListResult>> {
    return this.service.listMetadataSources(query);
  }
}
