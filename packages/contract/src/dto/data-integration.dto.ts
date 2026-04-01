import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsArray,
  IsEnum,
  IsObject,
} from 'class-validator';
import { RequestMetaDto } from './common.dto';

// ============================================================================
// 数据源相关
// ============================================================================

export enum DataSourceTypeDto {
  MYSQL = 'MYSQL',
  POSTGRESQL = 'POSTGRESQL',
  HIVE = 'HIVE',
  CLICKHOUSE = 'CLICKHOUSE',
}

export class DataSourceDto {
  @ApiProperty({ description: 'ID' })
  id: string;

  @ApiProperty({ description: '名称' })
  name: string;

  @ApiProperty({ description: '类型', enum: DataSourceTypeDto })
  type: DataSourceTypeDto;

  @ApiProperty({ description: '主机地址' })
  host: string;

  @ApiProperty({ description: '端口' })
  port: number;

  @ApiProperty({ description: '用户名' })
  username: string;

  @ApiPropertyOptional({ description: '数据库名' })
  @IsOptional()
  database?: string;

  @ApiProperty({ description: '状态', enum: ['ACTIVE', 'INACTIVE', 'ERROR'] })
  status: string;

  @ApiPropertyOptional({ description: '最后采集时间' })
  @IsOptional()
  lastCollectedAt?: string;

  @ApiProperty({ description: '创建时间' })
  createdAt: string;

  @ApiProperty({ description: '更新时间' })
  updatedAt: string;
}

export class CreateDataSourceRequestDto {
  @ApiPropertyOptional({ description: '请求元数据' })
  @IsOptional()
  meta?: RequestMetaDto;

  @ApiProperty({ description: '名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '类型', enum: DataSourceTypeDto })
  @IsEnum(DataSourceTypeDto)
  type: DataSourceTypeDto;

  @ApiProperty({ description: '主机地址' })
  @IsString()
  host: string;

  @ApiProperty({ description: '端口' })
  @IsNumber()
  port: number;

  @ApiProperty({ description: '用户名' })
  @IsString()
  username: string;

  @ApiProperty({ description: '密码' })
  @IsString()
  password: string;

  @ApiPropertyOptional({ description: '数据库名' })
  @IsOptional()
  @IsString()
  database?: string;

  @ApiPropertyOptional({ description: '是否启用SSL' })
  @IsOptional()
  @IsBoolean()
  ssl?: boolean;

  @ApiPropertyOptional({ description: '额外配置' })
  @IsOptional()
  @IsObject()
  extra?: Record<string, unknown>;
}

export class UpdateDataSourceRequestDto {
  @ApiPropertyOptional({ description: '请求元数据' })
  @IsOptional()
  meta?: RequestMetaDto;

  @ApiProperty({ description: '数据源ID' })
  @IsString()
  id: string;

  @ApiPropertyOptional({ description: '名称' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '主机地址' })
  @IsOptional()
  @IsString()
  host?: string;

  @ApiPropertyOptional({ description: '端口' })
  @IsOptional()
  @IsNumber()
  port?: number;

  @ApiPropertyOptional({ description: '用户名' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({ description: '密码' })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional({ description: '数据库名' })
  @IsOptional()
  @IsString()
  database?: string;

  @ApiPropertyOptional({ description: '是否启用SSL' })
  @IsOptional()
  @IsBoolean()
  ssl?: boolean;

  @ApiPropertyOptional({ description: '额外配置' })
  @IsOptional()
  @IsObject()
  extra?: Record<string, unknown>;
}

export class DeleteDataSourceRequestDto {
  @ApiPropertyOptional({ description: '请求元数据' })
  @IsOptional()
  meta?: RequestMetaDto;

  @ApiProperty({ description: '数据源ID' })
  @IsString()
  id: string;
}

export class TestConnectionRequestDto {
  @ApiPropertyOptional({ description: '请求元数据' })
  @IsOptional()
  meta?: RequestMetaDto;

  @ApiProperty({ description: '类型', enum: DataSourceTypeDto })
  @IsEnum(DataSourceTypeDto)
  type: DataSourceTypeDto;

  @ApiProperty({ description: '主机地址' })
  @IsString()
  host: string;

  @ApiProperty({ description: '端口' })
  @IsNumber()
  port: number;

  @ApiProperty({ description: '用户名' })
  @IsString()
  username: string;

  @ApiProperty({ description: '密码' })
  @IsString()
  password: string;

  @ApiPropertyOptional({ description: '数据库名' })
  @IsOptional()
  @IsString()
  database?: string;

  @ApiPropertyOptional({ description: '是否启用SSL' })
  @IsOptional()
  @IsBoolean()
  ssl?: boolean;

  @ApiPropertyOptional({ description: '额外配置' })
  @IsOptional()
  @IsObject()
  extra?: Record<string, unknown>;
}

export class ConnectionTestResultDto {
  @ApiProperty({ description: '是否成功' })
  success: boolean;

  @ApiPropertyOptional({ description: '延迟(ms)' })
  @IsOptional()
  latency?: number;

  @ApiPropertyOptional({ description: '服务器版本' })
  @IsOptional()
  serverVersion?: string;

  @ApiPropertyOptional({ description: '错误信息' })
  @IsOptional()
  error?: string;
}

export class ListDataSourcesRequestDto {
  @ApiPropertyOptional({ description: '请求元数据' })
  @IsOptional()
  meta?: RequestMetaDto;

  @ApiPropertyOptional({ description: '类型过滤', enum: DataSourceTypeDto })
  @IsOptional()
  @IsEnum(DataSourceTypeDto)
  type?: DataSourceTypeDto;

  @ApiPropertyOptional({ description: '状态过滤' })
  @IsOptional()
  @IsString()
  status?: string;
}

// ============================================================================
// 元数据采集相关
// ============================================================================

export class CollectMetadataRequestDto {
  @ApiPropertyOptional({ description: '请求元数据' })
  @IsOptional()
  meta?: RequestMetaDto;

  @ApiProperty({ description: '数据源ID' })
  @IsString()
  dataSourceId: string;

  @ApiProperty({ description: '采集范围', enum: ['FULL', 'INCREMENTAL'] })
  @IsEnum(['FULL', 'INCREMENTAL'])
  scope: string;

  @ApiPropertyOptional({ description: '包含的数据库', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  includeDatabases?: string[];

  @ApiPropertyOptional({ description: '排除的数据库', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludeDatabases?: string[];

  @ApiPropertyOptional({ description: '包含的表', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  includeTables?: string[];

  @ApiPropertyOptional({ description: '排除的表', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludeTables?: string[];
}

// ============================================================================
// 数据访问相关
// ============================================================================

export class SubmitAccessTaskRequestDto {
  @ApiPropertyOptional({ description: '请求元数据' })
  @IsOptional()
  meta?: RequestMetaDto;

  @ApiProperty({ description: '数据资产ID' })
  @IsString()
  dataAssetId: string;

  @ApiProperty({ description: '访问类型', example: 'SELECT' })
  @IsString()
  accessType: string;

  @ApiPropertyOptional({ description: '查询条件' })
  @IsOptional()
  @IsObject()
  conditions?: Record<string, unknown>;
}

export class ProfileDataRequestDto {
  @ApiPropertyOptional({ description: '请求元数据' })
  @IsOptional()
  meta?: RequestMetaDto;

  @ApiProperty({ description: '数据资产ID' })
  @IsString()
  dataAssetId: string;

  @ApiPropertyOptional({ description: '列名列表', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  columns?: string[];
}

export class PreviewDataRequestDto {
  @ApiPropertyOptional({ description: '请求元数据' })
  @IsOptional()
  meta?: RequestMetaDto;

  @ApiProperty({ description: '数据资产ID' })
  @IsString()
  dataAssetId: string;

  @ApiPropertyOptional({ description: '限制行数' })
  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class ExecuteSqlRequestDto {
  @ApiPropertyOptional({ description: '请求元数据' })
  @IsOptional()
  meta?: RequestMetaDto;

  @ApiProperty({ description: '数据源ID' })
  @IsString()
  dataSourceId: string;

  @ApiProperty({ description: 'SQL语句' })
  @IsString()
  sql: string;

  @ApiPropertyOptional({ description: '最大返回行数' })
  @IsOptional()
  @IsNumber()
  maxRows?: number;
}

export class GetTaskExecutionRequestDto {
  @ApiPropertyOptional({ description: '请求元数据' })
  @IsOptional()
  meta?: RequestMetaDto;

  @ApiProperty({ description: '任务执行ID' })
  @IsString()
  executionId: string;
}
