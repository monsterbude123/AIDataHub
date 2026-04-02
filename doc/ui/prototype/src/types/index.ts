/**
 * 全局类型定义
 */

/**
 * API 响应通用结构
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  code?: number;
}

/**
 * 分页请求参数
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * 分页响应数据
 */
export interface PaginationData<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 用户信息类型
 */
export interface UserInfo {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

// 导出各模块类型
export * from "./notification";
export * from "./project";