import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsArray,
  IsNotEmpty,
} from 'class-validator';
import type {
  CollectMetadataRequest,
  SyncMetadataRequest,
  ImportMetadataRequest,
  ExportMetadataRequest,
  SubscribeMetadataChangeRequest,
} from '@ai-datahub/contract';

export class CollectMetadataDto implements CollectMetadataRequest {
  @ApiProperty({ description: 'Metadata source ID' })
  @IsString()
  @IsNotEmpty()
  dataSourceId!: string;

  @ApiProperty({
    description: 'Collection mode',
    enum: ['AUTO', 'SUBSCRIPTION', 'MANUAL'],
  })
  @IsEnum(['AUTO', 'SUBSCRIPTION', 'MANUAL'])
  @IsNotEmpty()
  mode!: 'AUTO' | 'SUBSCRIPTION' | 'MANUAL';

  @ApiProperty({
    description: 'Collection scope',
    enum: ['FULL', 'INCREMENTAL'],
  })
  @IsEnum(['FULL', 'INCREMENTAL'])
  @IsNotEmpty()
  scope!: 'FULL' | 'INCREMENTAL';

  @ApiProperty({ description: 'Include databases', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  includeDatabases?: string[];

  @ApiProperty({ description: 'Exclude databases', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludeDatabases?: string[];

  @ApiProperty({ description: 'Include tables', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  includeTables?: string[];

  @ApiProperty({ description: 'Exclude tables', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludeTables?: string[];

  @ApiProperty({ description: 'Request metadata', required: false })
  @IsOptional()
  meta?: { traceId?: string };
}

export class SyncMetadataDto implements SyncMetadataRequest {
  @ApiProperty({ description: 'Source ID to sync' })
  @IsString()
  @IsNotEmpty()
  dataSourceId!: string;

  @ApiProperty({ description: 'Dry run (no changes applied)', required: false })
  @IsOptional()
  @IsBoolean()
  dryRun?: boolean;

  @ApiProperty({ description: 'Request metadata', required: false })
  @IsOptional()
  meta?: { traceId?: string };
}

export class ImportMetadataDto implements ImportMetadataRequest {
  @ApiProperty({ description: 'Import source (URL or file path)' })
  @IsString()
  @IsNotEmpty()
  source!: string;

  @ApiProperty({ description: 'Import format', default: 'TEMPLATE_V1' })
  @IsEnum(['TEMPLATE_V1'])
  @IsNotEmpty()
  format!: 'TEMPLATE_V1';

  @ApiProperty({ description: 'Import payload (inline content)' })
  payload!: Record<string, unknown>;

  @ApiProperty({ description: 'Target data asset ID', required: false })
  @IsOptional()
  @IsString()
  targetDataAssetId?: string;

  @ApiProperty({ description: 'Request metadata', required: false })
  @IsOptional()
  meta?: { traceId?: string };
}

export class ExportMetadataDto implements ExportMetadataRequest {
  @ApiProperty({
    description: 'Export scope',
    enum: ['ALL', 'BY_DATA_SOURCE', 'BY_ASSET'],
  })
  @IsEnum(['ALL', 'BY_DATA_SOURCE', 'BY_ASSET'])
  @IsNotEmpty()
  scope!: 'ALL' | 'BY_DATA_SOURCE' | 'BY_ASSET';

  @ApiProperty({ description: 'Data source ID to export', required: false })
  @IsOptional()
  @IsString()
  dataSourceId?: string;

  @ApiProperty({ description: 'Data asset IDs to export', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dataAssetIds?: string[];

  @ApiProperty({ description: 'Export format', default: 'TEMPLATE_V1' })
  @IsEnum(['TEMPLATE_V1'])
  @IsNotEmpty()
  format!: 'TEMPLATE_V1';

  @ApiProperty({ description: 'Request metadata', required: false })
  @IsOptional()
  meta?: { traceId?: string };
}

export class SubscribeMetadataChangeDto implements SubscribeMetadataChangeRequest {
  @ApiProperty({ description: 'Data asset ID to subscribe' })
  @IsString()
  @IsNotEmpty()
  dataAssetId!: string;

  @ApiProperty({ description: 'Notification channels' })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  channels!: ('EMAIL' | 'WEBHOOK')[];

  @ApiProperty({ description: 'Target webhook URL' })
  @IsString()
  @IsNotEmpty()
  target!: string;

  @ApiProperty({ description: 'Request metadata', required: false })
  @IsOptional()
  meta?: { traceId?: string };
}
