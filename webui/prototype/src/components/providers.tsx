"use client";

/**
 * 全局 Providers 组件
 * 配置 TanStack Query 和 AntD
 */

import { QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider, App } from "antd";
import zhCN from "antd/locale/zh_CN";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import { queryClient } from "@/lib/query-client";

dayjs.locale("zh-cn");

/**
 * AntD 主题配置
 */
const antdTheme = {
  token: {
    colorPrimary: "#1890ff",
    colorSuccess: "#52c41a",
    colorWarning: "#faad14",
    colorError: "#ff4d4f",
    borderRadius: 6,
  },
};

/**
 * Providers 组件
 * @param children - 子组件
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider locale={zhCN} theme={antdTheme}>
        <App>
          <div style={{ height: "100%", overflow: "hidden" }}>
            {children}
          </div>
        </App>
      </ConfigProvider>
    </QueryClientProvider>
  );
}