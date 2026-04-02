/**
 * 数据安全 Mock 数据
 */

import type { DataClassification, ClassificationConfig } from "@/types/security";
import { DEFAULT_SENSITIVITY_LEVELS } from "@/types/security";

/**
 * 分类字典
 */
export const mockClassifications: DataClassification[] = [
  { id: "cls-1", code: "PII", name: "个人身份信息", relatedLevel: 3, basis: "包含身份证、手机号等", remark: "需严格保护" },
  { id: "cls-2", code: "FIN", name: "财务数据", relatedLevel: 4, basis: "涉及金额、账户信息", remark: "最高级别保护" },
  { id: "cls-3", code: "BIZ", name: "业务数据", relatedLevel: 2, basis: "业务运营数据", remark: "内部访问" },
  { id: "cls-4", code: "PUB", name: "公开数据", relatedLevel: 1, basis: "可对外公开", remark: "" },
  { id: "cls-5", code: "TECH", name: "技术配置", relatedLevel: 2, basis: "系统配置信息", remark: "技术人员访问" },
];

/**
 * 分级分类配置
 */
export const mockClassificationConfigs: ClassificationConfig[] = [
  { id: "cfg-1", resourcePath: "mysql.prod.customer", resourceName: "客户信息表", resourceType: "dataset", currentLevel: 3, currentClassification: "PII" },
  { id: "cfg-2", resourcePath: "mysql.prod.customer.id_card", resourceName: "身份证号", resourceType: "column", currentLevel: 4, currentClassification: "PII" },
  { id: "cfg-3", resourcePath: "mysql.prod.customer.phone", resourceName: "手机号", resourceType: "column", currentLevel: 3, currentClassification: "PII" },
  { id: "cfg-4", resourcePath: "mysql.prod.customer.name", resourceName: "客户姓名", resourceType: "column", currentLevel: 2, currentClassification: "BIZ" },
  { id: "cfg-5", resourcePath: "mysql.prod.order", resourceName: "订单表", resourceType: "dataset", currentLevel: 2, currentClassification: "BIZ" },
  { id: "cfg-6", resourcePath: "mysql.prod.order.amount", resourceName: "订单金额", resourceType: "column", currentLevel: 4, currentClassification: "FIN" },
];

/**
 * 资源树节点
 */
export interface ResourceTreeNode {
  id: string;
  name: string;
  children?: ResourceTreeNode[];
}

export const mockResourceTree: ResourceTreeNode[] = [
  {
    id: "mysql.prod",
    name: "MySQL-生产库",
    children: [
      {
        id: "mysql.prod.customer",
        name: "客户信息表",
        children: [
          { id: "mysql.prod.customer.id_card", name: "身份证号" },
          { id: "mysql.prod.customer.phone", name: "手机号" },
          { id: "mysql.prod.customer.name", name: "客户姓名" },
        ],
      },
      {
        id: "mysql.prod.order",
        name: "订单表",
        children: [
          { id: "mysql.prod.order.amount", name: "订单金额" },
          { id: "mysql.prod.order.status", name: "订单状态" },
        ],
      },
    ],
  },
  {
    id: "hive.dw",
    name: "Hive-数仓",
    children: [
      { id: "hive.dw.user_profile", name: "用户画像表" },
      { id: "hive.dw.product_stats", name: "产品统计表" },
    ],
  },
];

export { DEFAULT_SENSITIVITY_LEVELS };