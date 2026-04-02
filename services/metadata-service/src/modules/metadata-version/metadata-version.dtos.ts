import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsOptional,
  IsObject,
  IsNotEmpty,
} from 'class-validator';
import type {
  GetMetadataVersionsRequest,
  CompareMetadataVersionsRequest,
} from '@ai-datahub/contract';
import type { PageRequest } from '@ai-datahub/contract';

export class PageRequestDto implements PageRequest {
  @ApiProperty({ description: 'Page number', default: 1 })
  @IsInt()
  @IsOptional()
  page!: number;

  @ApiProperty({ description: 'Items per page', default: 10 })
  @IsInt()
  @IsOptional()
  pageSize!: number;
}

export class GetVersionsDto implements GetMetadataVersionsRequest {
  @ApiProperty({ description: 'Data asset ID' })
  @IsString()
  @IsNotEmpty()
  dataAssetId!: string;

  @ApiProperty({ description: 'Pagination request' })
  @IsObject()
  @IsNotEmpty()
  page!: PageRequest;

  @ApiProperty({ description: 'Request metadata', required: false })
  @IsOptional()
  meta?: { traceId?: string };
}

export class CompareVersionsDto implements CompareMetadataVersionsRequest {
  @ApiProperty({ description: 'Left version ID' })
  @IsString()
  leftVersionId!: string;

  @ApiProperty({ description: 'Right version ID' })
  @IsString()
  rightVersionId!: string;

  @ApiProperty({ description: 'Request metadata', required: false })
  @IsOptional()
  meta?: { traceId?: string };
}
