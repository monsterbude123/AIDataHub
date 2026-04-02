/**
 * 元数据管理 Mock 数据
 */

import type { Metadata, MetadataCategory } from "@/types/metadata";

/**
 * 元数据分类树
 */
export const mockMetadataCategories: MetadataCategory[] = [
  {
    id: "cat-1",
    name: "业务元数据",
    code: "business",
    children: [
      { id: "cat-1-1", name: "客户数据", code: "customer", parentId: "cat-1" },
      { id: "cat-1-2", name: "交易数据", code: "transaction", parentId: "cat-1" },
      { id: "cat-1-3", name: "产品数据", code: "product", parentId: "cat-1" },
    ],
  },
  {
    id: "cat-2",
    name: "技术元数据",
    code: "technical",
    children: [
      { id: "cat-2-1", name: "数据库结构", code: "db_schema", parentId: "cat-2" },
      { id: "cat-2-2", name: "ETL流程", code: "etl", parentId: "cat-2" },
    ],
  },
  {
    id: "cat-3",
    name: "管理元数据",
    code: "management",
    children: [
      { id: "cat-3-1", name: "数据质量规则", code: "quality_rule", parentId: "cat-3" },
      { id: "cat-3-2", name: "数据权限", code: "permission", parentId: "cat-3" },
    ],
  },
];

/**
 * 元数据列表
 */
export const mockMetadataList: Metadata[] = [
  {
    id: "meta-1",
    name: "客户信息表",
    type: "table",
    dataSource: "MySQL-生产库",
    currentVersion: "v1.2.3",
    updatedAt: "2024-01-15 10:30",
    updatedBy: "张三",
    subscribed: true,
    description: "存储客户基本信息",
    categoryId: "cat-1-1",
  },
  {
    id: "meta-2",
    name: "订单明细表",
    type: "table",
    dataSource: "MySQL-生产库",
    currentVersion: "v2.0.1",
    updatedAt: "2024-01-14 16:20",
    updatedBy: "李四",
    subscribed: false,
    description: "存储订单交易明细",
    categoryId: "cat-1-2",
  },
  {
    id: "meta-3",
    name: "用户活跃度视图",
    type: "view",
    dataSource: "PostgreSQL-分析库",
    currentVersion: "v1.0.0",
    updatedAt: "2024-01-10 09:15",
    updatedBy: "王五",
    subscribed: true,
    categoryId: "cat-2-1",
  },
  {
    id: "meta-4",
    name: "数据清洗函数",
    type: "function",
    dataSource: "MySQL-生产库",
    currentVersion: "v3.1.0",
    updatedAt: "2024-01-08 14:00",
    updatedBy: "赵六",
    subscribed: false,
    categoryId: "cat-2-2",
  },
  {
    id: "meta-5",
    name: "客户画像表",
    type: "table",
    dataSource: "Hive-数仓",
    currentVersion: "v1.5.2",
    updatedAt: "2024-01-12 11:45",
    updatedBy: "张三",
    subscribed: true,
    description: "客户标签画像汇总",
    categoryId: "cat-1-1",
  },
  {
    id: "meta-6",
    name: "product_catalog",
    type: "database",
    dataSource: "MySQL-生产库",
    currentVersion: "v1.0.0",
    updatedAt: "2024-01-01 00:00",
    updatedBy: "系统",
    subscribed: false,
    categoryId: "cat-2-1",
  },
];

/**
 * 过滤元数据
 */
export function filterMetadata(filters: {
  keyword?: string;
  type?: string;
  categoryId?: string;
}): Metadata[] {
  return mockMetadataList.filter((item) => {
    if (filters.keyword && !item.name.toLowerCase().includes(filters.keyword.toLowerCase())) {
      return false;
    }
    if (filters.type && item.type !== filters.type) {
      return false;
    }
    if (filters.categoryId && item.categoryId !== filters.categoryId) {
      return false;
    }
    return true;
  });
}