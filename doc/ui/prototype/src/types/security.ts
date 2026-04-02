/**
 * 数据安全模块类型定义
 */

/**
 * 敏感分级
 */
export interface SensitivityLevel {
  id: string;
  code: number;
  name: string;
  description: string;
  accessRequirement: string;
  order: number;
}

/**
 * 预定义分级
 */
export const DEFAULT_SENSITIVITY_LEVELS: SensitivityLevel[] = [
  { id: "1", code: 1, name: "公开", description: "可公开访问", accessRequirement: "任何用户", order: 1 },
  { id: "2", code: 2, name: "内部", description: "单位内部访问", accessRequirement: "授权用户", order: 2 },
  { id: "3", code: 3, name: "秘密", description: "需要授权", accessRequirement: "仅限授权人员", order: 3 },
  { id: "4", code: 4, name: "机密", description: "最高敏感", accessRequirement: "严格授权", order: 4 },
];

/**
 * 数据分类
 */
export interface DataClassification {
  id: string;
  code: string;
  name: string;
  relatedLevel: number;
  basis: string;
  remark?: string;
}

/**
 * 分级分类配置
 */
export interface ClassificationConfig {
  id: string;
  resourcePath: string;
  resourceName: string;
  resourceType: "dataset" | "column" | "row";
  currentLevel: number;
  currentClassification: string;
}