/**
 * 数据服务 Mock 数据
 */

import type { DataService, ServiceType, ServiceStatus } from "@/types/data-service";

/**
 * 服务列表
 */
export const mockServiceList: DataService[] = [
  {
    id: "svc-1",
    name: "客户信息查询API",
    description: "根据客户ID查询客户基本信息，支持批量查询",
    type: "query",
    status: "published",
    publisher: "张三",
    createdAt: "2024-01-10",
    callCount: 15234,
    endpoint: "/api/v1/customer/query",
    version: "v1.2.0",
  },
  {
    id: "svc-2",
    name: "订单数据下载服务",
    description: "按时间范围下载订单数据，支持CSV和Excel格式导出",
    type: "download",
    status: "published",
    publisher: "李四",
    createdAt: "2024-01-08",
    callCount: 8567,
    endpoint: "/api/v1/order/download",
    version: "v2.0.0",
  },
  {
    id: "svc-3",
    name: "客户身份比对服务",
    description: "比对两个客户身份信息一致性，返回比对结果报告",
    type: "compare",
    status: "published",
    publisher: "王五",
    createdAt: "2024-01-05",
    callCount: 3421,
    endpoint: "/api/v1/customer/compare",
    version: "v1.0.0",
  },
  {
    id: "svc-4",
    name: "产品库存查询",
    description: "实时查询产品库存数量和库存分布情况",
    type: "query",
    status: "unpublished",
    publisher: "赵六",
    createdAt: "2024-01-12",
    callCount: 0,
    endpoint: "/api/v1/product/inventory",
    version: "v1.0.0",
  },
  {
    id: "svc-5",
    name: "历史交易数据导出",
    description: "导出历史交易数据用于数据分析",
    type: "download",
    status: "offline",
    publisher: "张三",
    createdAt: "2023-12-01",
    callCount: 45230,
    endpoint: "/api/v1/transaction/export",
    version: "v1.5.0",
  },
  {
    id: "svc-6",
    name: "实时数据同步状态",
    description: "查询数据同步任务执行状态和同步进度",
    type: "query",
    status: "published",
    publisher: "系统",
    createdAt: "2024-01-01",
    callCount: 98765,
    endpoint: "/api/v1/sync/status",
    version: "v3.0.0",
  },
];

/**
 * 过滤服务
 */
export function filterServices(filters: {
  keyword?: string;
  type?: ServiceType | "";
  status?: ServiceStatus | "";
}): DataService[] {
  return mockServiceList.filter((item) => {
    if (filters.keyword && !item.name.toLowerCase().includes(filters.keyword.toLowerCase())) {
      return false;
    }
    if (filters.type && item.type !== filters.type) {
      return false;
    }
    if (filters.status && item.status !== filters.status) {
      return false;
    }
    return true;
  });
}