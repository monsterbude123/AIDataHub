import { Body, Controller, Post, Get, Param, Query } from '@nestjs/common';
import { MetadataService } from './metadata.service';
import type {
  CollectMetadataRequest,
  CollectMetadataResponse,
  CompareMetadataVersionsRequest,
  ExportMetadataRequest,
  ExportMetadataResponse,
  GetMetadataVersionsRequest,
  ImportMetadataRequest,
  Result,
  MetadataVersionDiff,
  SubscribeMetadataChangeRequest,
  SubscribeMetadataChangeResponse,
  SyncMetadataRequest,
  SyncMetadataResponse,
  PageResult,
  MetadataVersion,
  CreateMetadataSourceRequest,
  MetadataSource,
  TestMetadataConnectionRequest,
  DataSourceConnectionTest,
  ListMetadataSourcesRequest,
  MetadataSourceListResult,
  CollectedMetadata,
} from '@ai-datahub/contract';

@Controller('api/metadata')
export class MetadataController {
  constructor(private readonly metadataService: MetadataService) {}

  // ============================================================================
  // 数据源管理
  // ============================================================================

  @Post('sources')
  async createSource(
    @Body() req: CreateMetadataSourceRequest
  ): Promise<Result<MetadataSource>> {
    return this.metadataService.createMetadataSource(req);
  }

  @Post('sources/test-connection')
  async testConnection(
    @Body() req: TestMetadataConnectionRequest
  ): Promise<Result<DataSourceConnectionTest>> {
    return this.metadataService.testConnection(req);
  }

  @Get('sources')
  async listSources(
    @Query() query: ListMetadataSourcesRequest
  ): Promise<Result<MetadataSourceListResult>> {
    return this.metadataService.listMetadataSources(query);
  }

  @Get('sources/:id')
  async getSource(@Param('id') id: string): Promise<Result<MetadataSource>> {
    return this.metadataService.getMetadataSourceById(id);
  }

  @Post('sources/:id/collect')
  async collectFromSource(
    @Param('id') id: string
  ): Promise<Result<CollectedMetadata>> {
    return this.metadataService.collectMetadataFromSourceById(id);
  }

  // ============================================================================
  // 元数据采集
  // ============================================================================

  @Post('collect')
  async collectMetadata(
    @Body() req: CollectMetadataRequest
  ): Promise<Result<CollectMetadataResponse>> {
    return this.metadataService.collectMetadata(req);
  }

  @Post('import')
  async importMetadata(
    @Body() req: ImportMetadataRequest
  ): Promise<Result<{ success: boolean }>> {
    return this.metadataService.importMetadata(req);
  }

  @Post('export')
  async exportMetadata(
    @Body() req: ExportMetadataRequest
  ): Promise<Result<ExportMetadataResponse>> {
    return this.metadataService.exportMetadata(req);
  }

  @Post('sync')
  async syncMetadata(
    @Body() req: SyncMetadataRequest
  ): Promise<Result<SyncMetadataResponse>> {
    return this.metadataService.syncMetadata(req);
  }

  @Post('versions')
  async getMetadataVersions(
    @Body() req: GetMetadataVersionsRequest
  ): Promise<Result<PageResult<MetadataVersion>>> {
    return this.metadataService.getMetadataVersions(req);
  }

  @Post('compare')
  async compareMetadataVersions(
    @Body() req: CompareMetadataVersionsRequest
  ): Promise<Result<{ diffs: MetadataVersionDiff[] }>> {
    return this.metadataService.compareMetadataVersions(req);
  }

  @Post('subscribe')
  async subscribeMetadataChange(
    @Body() req: SubscribeMetadataChangeRequest
  ): Promise<Result<SubscribeMetadataChangeResponse>> {
    return this.metadataService.subscribeMetadataChange(req);
  }
}
