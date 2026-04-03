/**
 * 元数据管理模块类型定义
 */

/**
 * 元数据类型
 */
export type MetadataType =
  | "table"
  | "view"
  | "column"
  | "function"
  | "procedure"
  | "database";

/**
 * 元数据类型标签
 */
export const METADATA_TYPE_LABELS: Record<MetadataType, string> = {
  table: "数据表",
  view: "视图",
  column: "字段",
  function: "函数",
  procedure: "存储过程",
  database: "数据库",
};

/**
 * 元数据分类
 */
export interface MetadataCategory {
  id: string;
  name: string;
  code: string;
  parentId?: string;
  children?: MetadataCategory[];
}

/**
 * 元数据信息
 */
export interface Metadata {
  id: string;
  name: string;
  type: MetadataType;
  dataSource: string;
  currentVersion: string;
  updatedAt: string;
  updatedBy: string;
  subscribed: boolean;
  description?: string;
  categoryId?: string;
}

/**
 * 元数据表单数据
 */
export interface MetadataFormData {
  name: string;
  type: MetadataType;
  dataSource: string;
  description?: string;
  categoryId?: string;
}