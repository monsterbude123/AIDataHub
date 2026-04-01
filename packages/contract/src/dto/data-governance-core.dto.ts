import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsBoolean,
  IsArray,
  IsEnum,
  IsObject,
} from 'class-validator';
import { RequestMetaDto, PageRequestDto } from './common.dto';

// ============================================================================
// 资产标签相关
// ============================================================================

export class AssetTagDto {
  @ApiProperty({ description: '标签ID' })
  id: string;

  @ApiProperty({ description: '标签名称' })
  name: string;

  @ApiProperty({ description: '创建时间' })
  createdAt: string;
}

export class SearchAssetsRequestDto {
  @ApiPropertyOptional({ description: '请求元数据' })
  @IsOptional()
  meta?: RequestMetaDto;

  @ApiPropertyOptional({ description: '关键词搜索' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ description: '标签过滤', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: '其他过滤条件' })
  @IsOptional()
  @IsObject()
  filters?: Record<string, unknown>;

  @ApiProperty({ description: '分页参数' })
  page: PageRequestDto;
}

export class TagAssetRequestDto {
  @ApiPropertyOptional({ description: '请求元数据' })
  @IsOptional()
  meta?: RequestMetaDto;

  @ApiProperty({ description: '数据资产ID' })
  @IsString()
  dataAssetId: string;

  @ApiProperty({ description: '标签列表', type: [String] })
  @IsArray()
  @IsString({ each: true })
  tags: string[];
}

export class ListAssetTagsRequestDto {
  @ApiPropertyOptional({ description: '请求元数据' })
  @IsOptional()
  meta?: RequestMetaDto;

  @ApiPropertyOptional({ description: '关键词搜索' })
  @IsOptional()
  @IsString()
  keyword?: string;
}

// ============================================================================
// 导出账本相关
// ============================================================================

export enum ExportLedgerType {
  ASSET_LEDGER = 'ASSET_LEDGER',
  LINEAGE_LEDGER = 'LINEAGE_LEDGER',
}

export enum ExportFormat {
  CSV = 'CSV',
  XLSX = 'XLSX',
}

export class ExportLedgerRequestDto {
  @ApiPropertyOptional({ description: '请求元数据' })
  @IsOptional()
  meta?: RequestMetaDto;

  @ApiProperty({ description: '导出类型', enum: ExportLedgerType })
  @IsEnum(ExportLedgerType)
  type: ExportLedgerType;

  @ApiPropertyOptional({ description: '过滤条件' })
  @IsOptional()
  @IsObject()
  filters?: Record<string, unknown>;

  @ApiProperty({ description: '导出格式', enum: ExportFormat })
  @IsEnum(ExportFormat)
  format: ExportFormat;
}

export class ExportLedgerResponseDto {
  @ApiProperty({ description: '下载链接' })
  downloadUrl: string;

  @ApiProperty({ description: '链接过期时间' })
  expireAt: string;
}

// ============================================================================
// 标准数据元相关
// ============================================================================

export class StandardDataElementDto {
  @ApiProperty({ description: 'ID' })
  id: string;

  @ApiProperty({ description: '名称' })
  name: string;

  @ApiProperty({ description: '标识符' })
  identifier: string;

  @ApiProperty({ description: '类型' })
  type: string;

  @ApiPropertyOptional({ description: '长度' })
  @IsOptional()
  length?: number;

  @ApiPropertyOptional({ description: '描述' })
  @IsOptional()
  description?: string;

  @ApiProperty({ description: '创建时间' })
  createdAt: string;

  @ApiProperty({ description: '更新时间' })
  updatedAt: string;
}

export class CreateStandardDataElementRequestDto {
  @ApiPropertyOptional({ description: '请求元数据' })
  @IsOptional()
  meta?: RequestMetaDto;

  @ApiProperty({ description: '标准数据元' })
  element: Omit<StandardDataElementDto, 'id' | 'createdAt' | 'updatedAt'>;
}

export class UpdateStandardDataElementRequestDto {
  @ApiPropertyOptional({ description: '请求元数据' })
  @IsOptional()
  meta?: RequestMetaDto;

  @ApiProperty({ description: '标准数据元（含ID）' })
  element: Omit<StandardDataElementDto, 'createdAt' | 'updatedAt'>;
}

export class DeleteStandardDataElementRequestDto {
  @ApiPropertyOptional({ description: '请求元数据' })
  @IsOptional()
  meta?: RequestMetaDto;

  @ApiProperty({ description: '标准数据元ID' })
  @IsString()
  elementId: string;
}

export class ListStandardDataElementsRequestDto {
  @ApiPropertyOptional({ description: '请求元数据' })
  @IsOptional()
  meta?: RequestMetaDto;

  @ApiPropertyOptional({ description: '关键词搜索' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiProperty({ description: '分页参数' })
  page: PageRequestDto;
}

// ============================================================================
// 标准类型映射相关
// ============================================================================

export class StandardTypeMappingDto {
  @ApiProperty({ description: 'ID' })
  id: string;

  @ApiProperty({ description: '来源系统（如 mysql, postgres, oracle, hive）' })
  sourceSystem: string;

  @ApiProperty({ description: '来源类型' })
  sourceType: string;

  @ApiProperty({ description: '标准类型' })
  standardType: string;

  @ApiProperty({ description: '创建时间' })
  createdAt: string;
}

export class UpsertStandardTypeMappingRequestDto {
  @ApiPropertyOptional({ description: '请求元数据' })
  @IsOptional()
  meta?: RequestMetaDto;

  @ApiProperty({ description: '类型映射' })
  mapping: Omit<StandardTypeMappingDto, 'createdAt'> & { id?: string };
}

export class ListStandardTypeMappingsRequestDto {
  @ApiPropertyOptional({ description: '请求元数据' })
  @IsOptional()
  meta?: RequestMetaDto;

  @ApiPropertyOptional({ description: '来源系统过滤' })
  @IsOptional()
  @IsString()
  sourceSystem?: string;

  @ApiProperty({ description: '分页参数' })
  page: PageRequestDto;
}

// ============================================================================
// 数据字典相关
// ============================================================================

export enum DictionaryType {
  CUSTOM = 'CUSTOM',
  DATASET = 'DATASET',
}

export class DictionaryDto {
  @ApiProperty({ description: 'ID' })
  id: string;

  @ApiProperty({ description: '名称' })
  name: string;

  @ApiProperty({ description: '类型', enum: DictionaryType })
  type: DictionaryType;

  @ApiProperty({ description: '配置' })
  config: Record<string, unknown>;

  @ApiProperty({ description: '创建时间' })
  createdAt: string;

  @ApiProperty({ description: '更新时间' })
  updatedAt: string;
}

export class DictionaryItemDto {
  @ApiProperty({ description: 'ID' })
  id: string;

  @ApiProperty({ description: '字典ID' })
  dictionaryId: string;

  @ApiProperty({ description: '键' })
  key: string;

  @ApiProperty({ description: '值' })
  value: string;

  @ApiPropertyOptional({ description: '描述' })
  @IsOptional()
  description?: string;
}

export class CreateDictionaryRequestDto {
  @ApiPropertyOptional({ description: '请求元数据' })
  @IsOptional()
  meta?: RequestMetaDto;

  @ApiProperty({ description: '字典' })
  dictionary: Omit<DictionaryDto, 'id' | 'createdAt' | 'updatedAt'>;
}

export class UpdateDictionaryRequestDto {
  @ApiPropertyOptional({ description: '请求元数据' })
  @IsOptional()
  meta?: RequestMetaDto;

  @ApiProperty({ description: '字典（含ID）' })
  dictionary: Omit<DictionaryDto, 'createdAt' | 'updatedAt'>;
}

export class DeleteDictionaryRequestDto {
  @ApiPropertyOptional({ description: '请求元数据' })
  @IsOptional()
  meta?: RequestMetaDto;

  @ApiProperty({ description: '字典ID' })
  @IsString()
  dictionaryId: string;
}

export class ListDictionariesRequestDto {
  @ApiPropertyOptional({ description: '请求元数据' })
  @IsOptional()
  meta?: RequestMetaDto;

  @ApiPropertyOptional({ description: '关键词搜索' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiProperty({ description: '分页参数' })
  page: PageRequestDto;
}

export class GetDictionaryDataRequestDto {
  @ApiPropertyOptional({ description: '请求元数据' })
  @IsOptional()
  meta?: RequestMetaDto;

  @ApiProperty({ description: '字典ID' })
  @IsString()
  dictionaryId: string;

  @ApiPropertyOptional({ description: '是否使用缓存' })
  @IsOptional()
  @IsBoolean()
  useCache?: boolean;

  @ApiProperty({ description: '分页参数' })
  page: PageRequestDto;
}

export class ImportDictionaryRequestDto {
  @ApiPropertyOptional({ description: '请求元数据' })
  @IsOptional()
  meta?: RequestMetaDto;

  @ApiProperty({ description: '字典ID' })
  @IsString()
  dictionaryId: string;

  @ApiProperty({ description: '导入格式', example: 'TEMPLATE_V1' })
  @IsString()
  format: string;

  @ApiProperty({ description: '导入数据' })
  @IsObject()
  payload: Record<string, unknown>;
}

// ============================================================================
// 字典目录相关
// ============================================================================

export class DictionaryCategoryNodeDto {
  @ApiProperty({ description: 'ID' })
  id: string;

  @ApiPropertyOptional({ description: '父节点ID' })
  @IsOptional()
  parentId?: string;

  @ApiProperty({ description: '名称' })
  name: string;

  @ApiProperty({ description: '编码' })
  code: string;

  @ApiPropertyOptional({ description: '排序' })
  @IsOptional()
  sort?: number;

  @ApiProperty({ description: '创建时间' })
  createdAt: string;

  @ApiProperty({ description: '更新时间' })
  updatedAt: string;
}

export class ListDictionaryCategoriesRequestDto {
  @ApiPropertyOptional({ description: '请求元数据' })
  @IsOptional()
  meta?: RequestMetaDto;

  @ApiPropertyOptional({ description: '父节点ID' })
  @IsOptional()
  @IsString()
  parentId?: string;
}

export class CreateDictionaryCategoryRequestDto {
  @ApiPropertyOptional({ description: '请求元数据' })
  @IsOptional()
  meta?: RequestMetaDto;

  @ApiProperty({ description: '目录节点' })
  node: Omit<DictionaryCategoryNodeDto, 'id' | 'createdAt' | 'updatedAt'>;
}

export class UpdateDictionaryCategoryRequestDto {
  @ApiPropertyOptional({ description: '请求元数据' })
  @IsOptional()
  meta?: RequestMetaDto;

  @ApiProperty({ description: '目录节点（含ID）' })
  node: Omit<DictionaryCategoryNodeDto, 'createdAt' | 'updatedAt'>;
}

export class DeleteDictionaryCategoryRequestDto {
  @ApiPropertyOptional({ description: '请求元数据' })
  @IsOptional()
  meta?: RequestMetaDto;

  @ApiProperty({ description: '目录ID' })
  @IsString()
  categoryId: string;
}

// ============================================================================
// 数据模型相关
// ============================================================================

export enum DataModelStatus {
  DRAFT = 'DRAFT',
  APPROVED = 'APPROVED',
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
}

export class DataModelDto {
  @ApiProperty({ description: 'ID' })
  id: string;

  @ApiProperty({ description: '名称' })
  name: string;

  @ApiProperty({ description: '版本' })
  version: string;

  @ApiProperty({ description: '状态', enum: DataModelStatus })
  status: DataModelStatus;

  @ApiProperty({ description: '模型定义' })
  definition: Record<string, unknown>;

  @ApiProperty({ description: '创建时间' })
  createdAt: string;

  @ApiProperty({ description: '更新时间' })
  updatedAt: string;
}

export class CreateModelRequestDto {
  @ApiPropertyOptional({ description: '请求元数据' })
  @IsOptional()
  meta?: RequestMetaDto;

  @ApiProperty({ description: '数据模型' })
  model: Omit<DataModelDto, 'id' | 'createdAt' | 'updatedAt'>;
}

export class ApproveModelRequestDto {
  @ApiPropertyOptional({ description: '请求元数据' })
  @IsOptional()
  meta?: RequestMetaDto;

  @ApiProperty({ description: '模型ID' })
  @IsString()
  modelId: string;
}

export class PublishModelRequestDto {
  @ApiPropertyOptional({ description: '请求元数据' })
  @IsOptional()
  meta?: RequestMetaDto;

  @ApiProperty({ description: '模型ID' })
  @IsString()
  modelId: string;

  @ApiProperty({ description: '是否上线' })
  @IsBoolean()
  online: boolean;
}

export class CreatePhysicalTablesRequestDto {
  @ApiPropertyOptional({ description: '请求元数据' })
  @IsOptional()
  meta?: RequestMetaDto;

  @ApiProperty({ description: '模型ID' })
  @IsString()
  modelId: string;

  @ApiProperty({ description: '数据源ID' })
  @IsString()
  dataSourceId: string;

  @ApiPropertyOptional({ description: '选项' })
  @IsOptional()
  @IsObject()
  options?: Record<string, unknown>;
}

export class ListModelsRequestDto {
  @ApiPropertyOptional({ description: '请求元数据' })
  @IsOptional()
  meta?: RequestMetaDto;

  @ApiPropertyOptional({ description: '关键词搜索' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiProperty({ description: '分页参数' })
  page: PageRequestDto;
}

// ============================================================================
// 稽核任务相关
// ============================================================================

export class AuditTaskDto {
  @ApiProperty({ description: 'ID' })
  id: string;

  @ApiProperty({ description: '任务类型', example: 'MODEL_AUDIT' })
  type: string;

  @ApiProperty({ description: '是否启用' })
  enabled: boolean;

  @ApiPropertyOptional({ description: '调度表达式' })
  @IsOptional()
  schedule?: string;

  @ApiProperty({ description: '创建时间' })
  createdAt: string;

  @ApiProperty({ description: '更新时间' })
  updatedAt: string;
}

export class AuditRunDto {
  @ApiProperty({ description: 'ID' })
  id: string;

  @ApiProperty({ description: '任务ID' })
  taskId: string;

  @ApiProperty({ description: '开始时间' })
  startedAt: string;

  @ApiPropertyOptional({ description: '结束时间' })
  @IsOptional()
  endedAt?: string;

  @ApiProperty({ description: '状态', enum: ['RUNNING', 'SUCCESS', 'FAILED'] })
  status: string;

  @ApiPropertyOptional({ description: '摘要' })
  @IsOptional()
  summary?: Record<string, unknown>;
}

export class UpsertAuditTaskRequestDto {
  @ApiPropertyOptional({ description: '请求元数据' })
  @IsOptional()
  meta?: RequestMetaDto;

  @ApiProperty({ description: '稽核任务' })
  task: Omit<AuditTaskDto, 'createdAt' | 'updatedAt'> & { id?: string };
}

export class ListAuditTasksRequestDto {
  @ApiPropertyOptional({ description: '请求元数据' })
  @IsOptional()
  meta?: RequestMetaDto;
}

export class RunAuditTaskRequestDto {
  @ApiPropertyOptional({ description: '请求元数据' })
  @IsOptional()
  meta?: RequestMetaDto;

  @ApiProperty({ description: '任务ID' })
  @IsString()
  taskId: string;
}

export class ListAuditRunsRequestDto {
  @ApiPropertyOptional({ description: '请求元数据' })
  @IsOptional()
  meta?: RequestMetaDto;

  @ApiProperty({ description: '任务ID' })
  @IsString()
  taskId: string;

  @ApiProperty({ description: '分页参数' })
  page: PageRequestDto;
}
