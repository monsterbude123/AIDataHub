/**
 * 数据资产模块类型定义
 */

/**
 * 数据分层类型
 */
export type DataLayer = "business" | "raw" | "resource" | "topic";

/**
 * 数据分层标签
 */
export const DATA_LAYER_LABELS: Record<DataLayer, string> = {
  business: "业务库",
  raw: "原始库",
  resource: "资源库",
  topic: "主题库",
};

/**
 * 获取方式
 */
export type AcquisitionMethod = "collect" | "exchange" | "import" | "compute";

/**
 * 获取方式标签
 */
export const ACQUISITION_METHOD_LABELS: Record<AcquisitionMethod, string> = {
  collect: "采集",
  exchange: "交换",
  import: "导入",
  compute: "计算",
};

/**
 * 资源位置类型
 */
export type ResourceLocation = "database" | "hdfs" | "object_storage";

/**
 * 资源位置标签
 */
export const RESOURCE_LOCATION_LABELS: Record<ResourceLocation, string> = {
  database: "数据库",
  hdfs: "HDFS",
  object_storage: "对象存储",
};

/**
 * 数据资产
 */
export interface DataAsset {
  id: string;
  name: string;
  path: string;
  layer: DataLayer;
  acquisitionMethod: AcquisitionMethod;
  location: ResourceLocation;
  sensitivityLevel: "public" | "internal" | "secret" | "confidential";
  rowCount: number;
  dataSize: string;
  updatedAt: string;
  tags: string[];
  description?: string;
  fields?: DataAssetField[];
}

/**
 * 数据资产字段
 */
export interface DataAssetField {
  name: string;
  type: string;
  description?: string;
}

/**
 * 筛选条件
 */
export interface DataMapFilters {
  layers: DataLayer[];
  acquisitionMethods: AcquisitionMethod[];
  locations: ResourceLocation[];
  sensitivityLevels: string[];
  keyword: string;
}