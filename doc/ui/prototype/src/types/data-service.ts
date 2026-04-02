/**
 * 数据服务模块类型定义
 */

/**
 * 服务类型
 */
export type ServiceType = "query" | "download" | "compare";

/**
 * 服务类型标签
 */
export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  query: "查询检索",
  download: "数据下载",
  compare: "比对",
};

/**
 * 服务状态
 */
export type ServiceStatus = "published" | "unpublished" | "offline";

/**
 * 服务状态标签
 */
export const SERVICE_STATUS_LABELS: Record<ServiceStatus, string> = {
  published: "已发布",
  unpublished: "未发布",
  offline: "已下线",
};

/**
 * 数据服务信息
 */
export interface DataService {
  id: string;
  name: string;
  description: string;
  type: ServiceType;
  status: ServiceStatus;
  publisher: string;
  createdAt: string;
  callCount: number;
  endpoint?: string;
  version?: string;
}

/**
 * 服务表单数据
 */
export interface ServiceFormData {
  name: string;
  description: string;
  type: ServiceType;
  endpoint?: string;
}