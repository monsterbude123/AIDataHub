import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
  IsObject,
} from 'class-validator';
import { RequestMetaDto } from './common.dto';
import { GetTaskExecutionRequestDto } from './data-integration.dto';

export { GetTaskExecutionRequestDto };

// ============================================================================
// 分层目录相关
// ============================================================================

export type DataLayerNodeDto = 'BUSINESS' | 'RAW' | 'RESOURCE' | 'THEME';

export class ListLayerDirectoriesRequestDto {
  @ApiPropertyOptional({ description: '请求元数据' })
  @IsOptional()
  meta?: RequestMetaDto;

  @ApiProperty({
    description: '数据分层',
    enum: ['BUSINESS', 'RAW', 'RESOURCE', 'THEME'],
  })
  @IsString()
  layer: DataLayerNodeDto;

  @ApiPropertyOptional({ description: '父目录ID' })
  @IsOptional()
  @IsString()
  parentId?: string;
}

export class CreateLayerDirectoryRequestDto {
  @ApiPropertyOptional({ description: '请求元数据' })
  @IsOptional()
  meta?: RequestMetaDto;

  @ApiProperty({
    description: '分层类型',
    enum: ['BUSINESS', 'RAW', 'RESOURCE', 'THEME'],
  })
  @IsString()
  layer: DataLayerNodeDto;

  @ApiPropertyOptional({ description: '父目录ID' })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiProperty({ description: '目录名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '目录编码' })
  @IsString()
  code: string;

  @ApiPropertyOptional({ description: '排序' })
  @IsOptional()
  @IsNumber()
  sort?: number;
}

export class UpdateLayerDirectoryRequestDto {
  @ApiPropertyOptional({ description: '请求元数据' })
  @IsOptional()
  meta?: RequestMetaDto;

  @ApiProperty({ description: '目录ID' })
  @IsString()
  id: string;

  @ApiProperty({
    description: '分层类型',
    enum: ['BUSINESS', 'RAW', 'RESOURCE', 'THEME'],
  })
  @IsString()
  layer: DataLayerNodeDto;

  @ApiPropertyOptional({ description: '父目录ID' })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiProperty({ description: '目录名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '目录编码' })
  @IsString()
  code: string;

  @ApiPropertyOptional({ description: '排序' })
  @IsOptional()
  @IsNumber()
  sort?: number;
}

export class DeleteLayerDirectoryRequestDto {
  @ApiPropertyOptional({ description: '请求元数据' })
  @IsOptional()
  meta?: RequestMetaDto;

  @ApiProperty({ description: '目录ID' })
  @IsString()
  directoryId: string;
}

export class ListAssetsByLayerRequestDto {
  @ApiPropertyOptional({ description: '请求元数据' })
  @IsOptional()
  meta?: RequestMetaDto;

  @ApiProperty({
    description: '数据分层',
    enum: ['BUSINESS', 'RAW', 'RESOURCE', 'THEME'],
  })
  @IsString()
  layer: DataLayerNodeDto;

  @ApiPropertyOptional({ description: '搜索关键词' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiProperty({ description: '页码' })
  @IsNumber()
  page: number;

  @ApiProperty({ description: '每页数量' })
  @IsNumber()
  pageSize: number;
}

// ============================================================================
// 资产映射相关
// ============================================================================

export class FieldMappingDto {
  @ApiProperty({ description: '源字段' })
  @IsString()
  fromField: string;

  @ApiProperty({ description: '目标字段' })
  @IsString()
  toField: string;

  @ApiPropertyOptional({ description: '转换表达式' })
  @IsOptional()
  @IsString()
  transform?: string;
}

export class CreateMappingRequestDto {
  @ApiPropertyOptional({ description: '请求元数据' })
  @IsOptional()
  meta?: RequestMetaDto;

  @ApiProperty({ description: '源资产ID' })
  @IsString()
  fromAssetId: string;

  @ApiProperty({ description: '目标资产ID' })
  @IsString()
  toAssetId: string;

  @ApiProperty({ description: '字段映射', type: [FieldMappingDto] })
  @IsArray()
  @IsObject({ each: true })
  fieldMappings: FieldMappingDto[];
}

export class UpdateMappingRequestDto {
  @ApiPropertyOptional({ description: '请求元数据' })
  @IsOptional()
  meta?: RequestMetaDto;

  @ApiProperty({ description: '映射ID' })
  @IsString()
  id: string;

  @ApiProperty({ description: '源资产ID' })
  @IsString()
  fromAssetId: string;

  @ApiProperty({ description: '目标资产ID' })
  @IsString()
  toAssetId: string;

  @ApiProperty({ description: '字段映射', type: [FieldMappingDto] })
  @IsArray()
  @IsObject({ each: true })
  fieldMappings: FieldMappingDto[];
}

export class DeleteMappingRequestDto {
  @ApiPropertyOptional({ description: '请求元数据' })
  @IsOptional()
  meta?: RequestMetaDto;

  @ApiProperty({ description: '映射ID' })
  @IsString()
  mappingId: string;
}

export class ListMappingsRequestDto {
  @ApiPropertyOptional({ description: '请求元数据' })
  @IsOptional()
  meta?: RequestMetaDto;

  @ApiPropertyOptional({ description: '源资产ID过滤' })
  @IsOptional()
  @IsString()
  fromAssetId?: string;

  @ApiPropertyOptional({ description: '目标资产ID过滤' })
  @IsOptional()
  @IsString()
  toAssetId?: string;

  @ApiProperty({ description: '页码' })
  @IsNumber()
  page: number;

  @ApiProperty({ description: '每页数量' })
  @IsNumber()
  pageSize: number;
}

export class GetMappingRequestDto {
  @ApiPropertyOptional({ description: '请求元数据' })
  @IsOptional()
  meta?: RequestMetaDto;

  @ApiProperty({ description: '映射ID' })
  @IsString()
  mappingId: string;
}

export class PreviewMappingRequestDto {
  @ApiPropertyOptional({ description: '请求元数据' })
  @IsOptional()
  meta?: RequestMetaDto;

  @ApiProperty({ description: '映射ID' })
  @IsString()
  mappingId: string;

  @ApiPropertyOptional({ description: '预览行数' })
  @IsOptional()
  @IsNumber()
  limit?: number;
}

// ============================================================================
// 数据导入任务相关
// ============================================================================

export class SubmitIngestionTaskRequestDto {
  @ApiPropertyOptional({ description: '请求元数据' })
  @IsOptional()
  meta?: RequestMetaDto;

  @ApiProperty({ description: '映射ID' })
  @IsString()
  mappingId: string;

  @ApiPropertyOptional({ description: '定时调度表达式' })
  @IsOptional()
  @IsString()
  schedule?: string;

  @ApiPropertyOptional({ description: '优先级' })
  @IsOptional()
  @IsNumber()
  priority?: number;

  @ApiPropertyOptional({ description: '额外配置' })
  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;
}
