import type { Metadata } from "next";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { Providers } from "@/components/providers";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "AI DataHub Prototype",
  description: "AI DataHub 原型设计系统",
};

/**
 * 根布局组件
 * 配置 AntD 和 TanStack Query
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body style={{ margin: 0, padding: 0, height: "100%", overflow: "hidden" }}>
        <AntdRegistry>
          <Providers>{children}</Providers>
        </AntdRegistry>
      </body>
    </html>
  );
}