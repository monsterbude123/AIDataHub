/**
 * 数据资产 Mock 数据
 */

import type { DataAsset, DataAssetField } from "@/types/data-asset";

/**
 * Mock 数据资产列表
 */
export const mockDataAssets: DataAsset[] = [
  {
    id: "asset-001",
    name: "订单主表",
    path: "业务库/销售域/订单管理",
    layer: "business",
    acquisitionMethod: "collect",
    location: "database",
    sensitivityLevel: "internal",
    rowCount: 1250000,
    dataSize: "2.5GB",
    updatedAt: "2024-01-15 10:00:00",
    tags: ["订单", "核心数据", "日更新"],
    description: "存储所有订单的核心业务数据",
    fields: [
      { name: "order_id", type: "BIGINT", description: "订单ID" },
      { name: "customer_id", type: "BIGINT", description: "客户ID" },
      { name: "product_id", type: "BIGINT", description: "产品ID" },
      { name: "amount", type: "DECIMAL(10,2)", description: "订单金额" },
      { name: "status", type: "VARCHAR(20)", description: "订单状态" },
      { name: "created_at", type: "DATETIME", description: "创建时间" },
    ],
  },
  {
    id: "asset-002",
    name: "客户信息表",
    path: "业务库/客户域/客户管理",
    layer: "business",
    acquisitionMethod: "exchange",
    location: "database",
    sensitivityLevel: "secret",
    rowCount: 85600,
    dataSize: "500MB",
    updatedAt: "2024-01-15 08:00:00",
    tags: ["客户", "敏感数据", "CRM"],
    description: "客户基本信息和联系方式",
    fields: [
      { name: "customer_id", type: "BIGINT", description: "客户ID" },
      { name: "name", type: "VARCHAR(100)", description: "客户姓名" },
      { name: "phone", type: "VARCHAR(20)", description: "手机号" },
      { name: "email", type: "VARCHAR(100)", description: "邮箱" },
      { name: "address", type: "VARCHAR(200)", description: "地址" },
    ],
  },
  {
    id: "asset-003",
    name: "产品目录表",
    path: "资源库/主数据/产品管理",
    layer: "resource",
    acquisitionMethod: "import",
    location: "database",
    sensitivityLevel: "public",
    rowCount: 15000,
    dataSize: "50MB",
    updatedAt: "2024-01-14 16:00:00",
    tags: ["产品", "主数据"],
    description: "产品主数据目录",
    fields: [
      { name: "product_id", type: "BIGINT", description: "产品ID" },
      { name: "product_name", type: "VARCHAR(200)", description: "产品名称" },
      { name: "category", type: "VARCHAR(50)", description: "产品分类" },
      { name: "price", type: "DECIMAL(10,2)", description: "单价" },
    ],
  },
  {
    id: "asset-004",
    name: "用户行为日志",
    path: "原始库/日志数据/用户行为",
    layer: "raw",
    acquisitionMethod: "collect",
    location: "hdfs",
    sensitivityLevel: "internal",
    rowCount: 50000000,
    dataSize: "50GB",
    updatedAt: "2024-01-15 12:00:00",
    tags: ["日志", "用户行为", "实时采集"],
    description: "用户在平台上的行为日志数据",
  },
  {
    id: "asset-005",
    name: "销售统计汇总表",
    path: "主题库/销售主题/统计分析",
    layer: "topic",
    acquisitionMethod: "compute",
    location: "database",
    sensitivityLevel: "internal",
    rowCount: 3650,
    dataSize: "20MB",
    updatedAt: "2024-01-15 06:00:00",
    tags: ["销售", "统计", "汇总"],
    description: "按日期汇总的销售统计数据",
    fields: [
      { name: "date", type: "DATE", description: "日期" },
      { name: "total_orders", type: "BIGINT", description: "订单总数" },
      { name: "total_amount", type: "DECIMAL(15,2)", description: "销售总额" },
      { name: "unique_customers", type: "BIGINT", description: "独立客户数" },
    ],
  },
  {
    id: "asset-006",
    name: "财务凭证表",
    path: "业务库/财务域/凭证管理",
    layer: "business",
    acquisitionMethod: "import",
    location: "database",
    sensitivityLevel: "confidential",
    rowCount: 250000,
    dataSize: "1.2GB",
    updatedAt: "2024-01-14 22:00:00",
    tags: ["财务", "凭证", "核心数据"],
    description: "财务凭证核心数据",
  },
  {
    id: "asset-007",
    name: "供应商信息表",
    path: "资源库/主数据/供应商管理",
    layer: "resource",
    acquisitionMethod: "exchange",
    location: "database",
    sensitivityLevel: "internal",
    rowCount: 3500,
    dataSize: "15MB",
    updatedAt: "2024-01-13 10:00:00",
    tags: ["供应商", "主数据"],
    description: "供应商主数据信息",
  },
  {
    id: "asset-008",
    name: "数据交换日志",
    path: "原始库/日志数据/数据交换",
    layer: "raw",
    acquisitionMethod: "collect",
    location: "object_storage",
    sensitivityLevel: "public",
    rowCount: 10000000,
    dataSize: "5GB",
    updatedAt: "2024-01-15 11:00:00",
    tags: ["日志", "数据交换"],
    description: "数据交换过程中的日志记录",
  },
  {
    id: "asset-009",
    name: "客户画像标签表",
    path: "主题库/客户主题/画像分析",
    layer: "topic",
    acquisitionMethod: "compute",
    location: "database",
    sensitivityLevel: "secret",
    rowCount: 85600,
    dataSize: "200MB",
    updatedAt: "2024-01-15 05:00:00",
    tags: ["客户画像", "标签", "计算"],
    description: "基于客户行为计算的画像标签",
  },
  {
    id: "asset-010",
    name: "库存变动记录",
    path: "业务库/库存域/库存管理",
    layer: "business",
    acquisitionMethod: "collect",
    location: "database",
    sensitivityLevel: "internal",
    rowCount: 5000000,
    dataSize: "800MB",
    updatedAt: "2024-01-15 09:30:00",
    tags: ["库存", "变动", "实时"],
    description: "库存变动实时记录",
  },
];

/**
 * 根据筛选条件过滤数据资产
 */
export function filterDataAssets(filters: {
  layers?: string[];
  acquisitionMethods?: string[];
  locations?: string[];
  sensitivityLevels?: string[];
  keyword?: string;
}): DataAsset[] {
  let result = [...mockDataAssets];

  if (filters.layers && filters.layers.length > 0) {
    result = result.filter((asset) => filters.layers!.includes(asset.layer));
  }

  if (filters.acquisitionMethods && filters.acquisitionMethods.length > 0) {
    result = result.filter((asset) => filters.acquisitionMethods!.includes(asset.acquisitionMethod));
  }

  if (filters.locations && filters.locations.length > 0) {
    result = result.filter((asset) => filters.locations!.includes(asset.location));
  }

  if (filters.sensitivityLevels && filters.sensitivityLevels.length > 0) {
    result = result.filter((asset) => filters.sensitivityLevels!.includes(asset.sensitivityLevel));
  }

  if (filters.keyword) {
    const lowerKeyword = filters.keyword.toLowerCase();
    result = result.filter(
      (asset) =>
        asset.name.toLowerCase().includes(lowerKeyword) ||
        asset.path.toLowerCase().includes(lowerKeyword) ||
        asset.tags.some((tag) => tag.toLowerCase().includes(lowerKeyword))
    );
  }

  return result;
}

/**
 * 根据 ID 获取数据资产详情
 */
export function getDataAssetById(id: string): DataAsset | undefined {
  return mockDataAssets.find((asset) => asset.id === id);
}