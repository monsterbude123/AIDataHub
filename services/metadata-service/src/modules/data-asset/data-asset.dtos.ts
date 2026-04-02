import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsIn, IsNotEmpty } from 'class-validator';
import type { DataAssetType, DataLayer } from '@ai-datahub/contract';

const dataAssetTypes = ['table', 'view', 'file', 'api'];
const dataLayers = ['bronze', 'silver', 'gold', 'golden'];

export class CreateDataAssetDto {
  @ApiProperty({ description: 'Data asset name' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Data asset unique code' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ description: 'Data source ID this asset belongs to' })
  @IsString()
  @IsNotEmpty()
  dataSourceId!: string;

  @ApiProperty({
    description: 'Data asset type',
    enum: ['table', 'view', 'file', 'api'],
  })
  @IsIn(dataAssetTypes)
  type!: DataAssetType;

  @ApiProperty({
    description: 'Data layer',
    enum: ['bronze', 'silver', 'gold', 'golden'],
  })
  @IsIn(dataLayers)
  layer!: DataLayer;

  @ApiProperty({ description: 'Description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Owner user ID', required: false })
  @IsOptional()
  @IsString()
  ownerId?: string;

  @ApiProperty({ description: 'Security level (1-5)', required: false })
  @IsOptional()
  @IsInt()
  securityLevel?: number;

  @ApiProperty({ description: 'Security category', required: false })
  @IsOptional()
  @IsString()
  securityCategory?: string;
}

export class UpdateDataAssetDto {
  @ApiProperty({ description: 'Data asset ID' })
  @IsString()
  @IsNotEmpty()
  id!: string;

  @ApiProperty({ description: 'Data asset name' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Data asset unique code' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ description: 'Data source ID this asset belongs to' })
  @IsString()
  @IsNotEmpty()
  dataSourceId!: string;

  @ApiProperty({
    description: 'Data asset type',
    enum: ['table', 'view', 'file', 'api'],
  })
  @IsIn(dataAssetTypes)
  type!: DataAssetType;

  @ApiProperty({
    description: 'Data layer',
    enum: ['bronze', 'silver', 'gold', 'golden'],
  })
  @IsIn(dataLayers)
  layer!: DataLayer;

  @ApiProperty({ description: 'Description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Owner user ID', required: false })
  @IsOptional()
  @IsString()
  ownerId?: string;

  @ApiProperty({ description: 'Security level (1-5)', required: false })
  @IsOptional()
  @IsInt()
  securityLevel?: number;

  @ApiProperty({ description: 'Security category', required: false })
  @IsOptional()
  @IsString()
  securityCategory?: string;
}

export class SearchDataAssetsDto {
  @ApiProperty({ description: 'Search keyword', required: false })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiProperty({ description: 'Page number', required: false, default: 1 })
  @IsOptional()
  @IsInt()
  page?: number;

  @ApiProperty({ description: 'Items per page', required: false, default: 10 })
  @IsOptional()
  @IsInt()
  pageSize?: number;
}
