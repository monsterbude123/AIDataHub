import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsDateString } from 'class-validator';
import { RequestMetaDto } from './common.dto';

// ============================================================================
// 成本管理相关
// ============================================================================

export class CostSeriesRequestDto {
  @ApiPropertyOptional({ description: '请求元数据' })
  @IsOptional()
  meta?: RequestMetaDto;

  @ApiProperty({ description: '开始时间 (ISO格式)' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: '结束时间 (ISO格式)' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ description: '数据源ID' })
  @IsOptional()
  @IsString()
  dataSourceId?: string;

  @ApiPropertyOptional({ description: '项目ID' })
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiProperty({ description: '聚合粒度', example: 'day' })
  @IsString()
  granularity: string;
}

export class CostSeriesPointDto {
  @ApiProperty({ description: '时间点' })
  date: string;

  @ApiProperty({ description: '成本金额' })
  cost: number;

  @ApiPropertyOptional({ description: '计算资源成本' })
  @IsOptional()
  computeCost?: number;

  @ApiPropertyOptional({ description: '存储成本' })
  @IsOptional()
  storageCost?: number;
}

export class QuotaDto {
  @ApiProperty({ description: 'ID' })
  id: string;

  @ApiProperty({ description: '名称' })
  name: string;

  @ApiProperty({ description: '资源类型' })
  resourceType: string;

  @ApiProperty({ description: '配额限制' })
  limit: number;

  @ApiProperty({ description: '已使用量' })
  used: number;

  @ApiProperty({ description: '单位' })
  unit: string;

  @ApiPropertyOptional({ description: '项目ID' })
  @IsOptional()
  projectId?: string;

  @ApiPropertyOptional({ description: '数据源ID' })
  @IsOptional()
  dataSourceId?: string;

  @ApiProperty({ description: '创建时间' })
  createdAt: string;

  @ApiProperty({ description: '更新时间' })
  updatedAt: string;
}

export class UpsertQuotaRequestDto {
  @ApiPropertyOptional({ description: '请求元数据' })
  @IsOptional()
  meta?: RequestMetaDto;

  @ApiProperty({ description: '配额（含ID时更新，不含时创建）' })
  quota: Omit<QuotaDto, 'used' | 'createdAt' | 'updatedAt'> & { id?: string };
}

export class ListQuotasRequestDto {
  @ApiPropertyOptional({ description: '请求元数据' })
  @IsOptional()
  meta?: RequestMetaDto;

  @ApiPropertyOptional({ description: '项目ID过滤' })
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiPropertyOptional({ description: '数据源ID过滤' })
  @IsOptional()
  @IsString()
  dataSourceId?: string;
}

export class OptimizationHintDto {
  @ApiProperty({ description: 'ID' })
  id: string;

  @ApiProperty({ description: '类型' })
  type: string;

  @ApiProperty({ description: '标题' })
  title: string;

  @ApiProperty({ description: '描述' })
  description: string;

  @ApiProperty({ description: '预计节省成本' })
  potentialSavings: number;

  @ApiProperty({ description: '优先级', example: 'HIGH' })
  priority: string;

  @ApiPropertyOptional({ description: '相关资源ID' })
  @IsOptional()
  resourceId?: string;

  @ApiPropertyOptional({ description: '相关资源类型' })
  @IsOptional()
  resourceType?: string;

  @ApiProperty({ description: '是否已处理' })
  processed: boolean;

  @ApiProperty({ description: '创建时间' })
  createdAt: string;
}

export class ListOptimizationHintsRequestDto {
  @ApiPropertyOptional({ description: '请求元数据' })
  @IsOptional()
  meta?: RequestMetaDto;

  @ApiPropertyOptional({ description: '是否只看未处理' })
  @IsOptional()
  @IsBoolean()
  unprocessedOnly?: boolean;
}
