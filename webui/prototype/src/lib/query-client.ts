/**
 * TanStack Query 客户端配置
 */

import { QueryClient } from "@tanstack/react-query";

/**
 * 默认查询客户端配置
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5分钟内数据视为新鲜
      gcTime: 10 * 60 * 1000, // 10分钟后清理缓存
      retry: 2, // 失败重试2次
      refetchOnWindowFocus: false, // 窗口聚焦时不自动刷新
    },
    mutations: {
      retry: 1, // 失败重试1次
    },
  },
});