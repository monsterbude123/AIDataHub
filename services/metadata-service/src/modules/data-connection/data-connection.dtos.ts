import { ApiProperty } from '@nestjs/swagger';
import {
  TestMetadataConnectionRequest,
  CreateMetadataSourceRequest,
  ListMetadataSourcesRequest,
  MetadataSourceType,
} from '@ai-datahub/contract';
import {
  IsString,
  IsInt,
  IsOptional,
  IsBoolean,
  IsObject,
} from 'class-validator';

export class TestConnectionDto implements TestMetadataConnectionRequest {
  @ApiProperty({ description: 'Database type (mysql/postgres)' })
  @IsString()
  type!: MetadataSourceType;

  @ApiProperty({ description: 'Database host' })
  @IsString()
  host!: string;

  @ApiProperty({ description: 'Database port' })
  @IsInt()
  port!: number;

  @ApiProperty({ description: 'Database username' })
  @IsString()
  username!: string;

  @ApiProperty({ description: 'Database password' })
  @IsString()
  password!: string;

  @ApiProperty({ description: 'Database name' })
  @IsString()
  database!: string;

  @ApiProperty({ description: 'Use SSL connection', required: false })
  @IsOptional()
  @IsBoolean()
  ssl?: boolean;

  @ApiProperty({
    description: 'Extra connection configuration',
    required: false,
  })
  @IsOptional()
  @IsObject()
  extra?: Record<string, unknown>;

  @ApiProperty({ description: 'Request metadata', required: false })
  @IsOptional()
  meta?: { traceId?: string };
}

export class CreateSourceDto implements CreateMetadataSourceRequest {
  @ApiProperty({ description: 'Source name' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Database type (mysql/postgres)' })
  @IsString()
  type!: MetadataSourceType;

  @ApiProperty({ description: 'Database host' })
  @IsString()
  host!: string;

  @ApiProperty({ description: 'Database port' })
  @IsInt()
  port!: number;

  @ApiProperty({ description: 'Database username' })
  @IsString()
  username!: string;

  @ApiProperty({ description: 'Database password' })
  @IsString()
  password!: string;

  @ApiProperty({ description: 'Database name' })
  @IsString()
  database!: string;

  @ApiProperty({ description: 'Use SSL connection', required: false })
  @IsOptional()
  @IsBoolean()
  ssl?: boolean;

  @ApiProperty({
    description: 'Extra connection configuration',
    required: false,
  })
  @IsOptional()
  @IsObject()
  extra?: Record<string, unknown>;

  @ApiProperty({ description: 'Request metadata', required: false })
  @IsOptional()
  meta?: { traceId?: string };
}

export class ListSourcesDto implements ListMetadataSourcesRequest {
  @ApiProperty({ description: 'Filter by type', required: false })
  @IsOptional()
  @IsString()
  type?: MetadataSourceType;

  @ApiProperty({ description: 'Filter by status', required: false })
  @IsOptional()
  @IsString()
  status?: 'ACTIVE' | 'INACTIVE';

  @ApiProperty({ description: 'Page number', required: false, default: 1 })
  @IsOptional()
  @IsInt()
  page?: number;

  @ApiProperty({ description: 'Items per page', required: false, default: 10 })
  @IsOptional()
  @IsInt()
  pageSize?: number;
}
