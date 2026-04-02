/**
 * API 接口配置
 */

import type { ApiResponse, PaginationParams, PaginationData } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

/**
 * 基础请求函数
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

/**
 * GET 请求
 */
export async function get<T>(endpoint: string): Promise<ApiResponse<T>> {
  return request<T>(endpoint, { method: "GET" });
}

/**
 * POST 请求
 */
export async function post<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
  return request<T>(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * PUT 请求
 */
export async function put<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
  return request<T>(endpoint, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * DELETE 请求
 */
export async function del<T>(endpoint: string): Promise<ApiResponse<T>> {
  return request<T>(endpoint, { method: "DELETE" });
}

/**
 * 分页请求
 */
export async function getPaginated<T>(
  endpoint: string,
  params: PaginationParams
): Promise<ApiResponse<PaginationData<T>>> {
  const query = new URLSearchParams({
    page: params.page.toString(),
    pageSize: params.pageSize.toString(),
    ...(params.sortBy && { sortBy: params.sortBy }),
    ...(params.sortOrder && { sortOrder: params.sortOrder }),
  });

  return get<PaginationData<T>>(`${endpoint}?${query.toString()}`);
}