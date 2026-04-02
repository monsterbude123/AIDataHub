import { Controller, Post, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MetadataCollectionService } from './metadata-collection.service';
import type {
  Result,
  CollectMetadataResponse,
  SyncMetadataResponse,
  ExportMetadataResponse,
  SubscribeMetadataChangeResponse,
} from '@ai-datahub/contract';
import {
  CollectMetadataDto,
  SyncMetadataDto,
  ImportMetadataDto,
  ExportMetadataDto,
  SubscribeMetadataChangeDto,
} from './metadata-collection.dtos';

@ApiTags('元数据采集')
@ApiBearerAuth()
@Controller('metadata-collection')
export class MetadataCollectionController {
  constructor(private readonly service: MetadataCollectionService) {}

  @Post()
  @ApiOperation({
    summary: '采集元数据',
    description: '从指定数据源采集元数据',
  })
  @ApiResponse({ status: 200, description: '采集完成，返回采集结果' })
  collectMetadata(
    @Body() body: CollectMetadataDto
  ): Promise<Result<CollectMetadataResponse>> {
    return this.service.collectMetadata(body);
  }

  @Post('sync')
  @ApiOperation({
    summary: '同步元数据',
    description: '将采集到的元数据同步到数据资产目录',
  })
  @ApiResponse({ status: 200, description: '同步完成，返回变更列表' })
  syncMetadata(
    @Body() body: SyncMetadataDto
  ): Promise<Result<SyncMetadataResponse>> {
    return this.service.syncMetadata(body);
  }

  @Post('import')
  @ApiOperation({
    summary: '导入元数据',
    description: '从外部文件/URL导入元数据',
  })
  @ApiResponse({ status: 200, description: '导入完成' })
  importMetadata(
    @Body() body: ImportMetadataDto
  ): Promise<Result<{ success: boolean }>> {
    return this.service.importMetadata(body);
  }

  @Post('export')
  @ApiOperation({
    summary: '导出元数据',
    description: '导出数据资产元数据到文件',
  })
  @ApiResponse({ status: 200, description: '导出完成，返回下载链接' })
  exportMetadata(
    @Body() body: ExportMetadataDto
  ): Promise<Result<ExportMetadataResponse>> {
    return this.service.exportMetadata(body);
  }

  @Post('subscribe')
  @ApiOperation({
    summary: '订阅元数据变更',
    description: '订阅数据资产元数据变更通知',
  })
  @ApiResponse({ status: 200, description: '订阅成功' })
  subscribeMetadataChange(
    @Body() body: SubscribeMetadataChangeDto
  ): Promise<Result<SubscribeMetadataChangeResponse>> {
    return this.service.subscribeMetadataChange(body);
  }
}
