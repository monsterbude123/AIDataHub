/**
 * 通用工具函数集合
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 合并 Tailwind CSS 类名
 * @param inputs - 类名输入
 * @returns 合并后的类名
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 格式化日期
 * @param date - 日期对象或字符串
 * @param format - 格式化模式
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date | string, format = "YYYY-MM-DD"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().split("T")[0];
}

/**
 * 延迟执行
 * @param ms - 延迟毫秒数
 * @returns Promise
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 生成唯一ID
 * @returns 唯一ID字符串
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * 下载文件
 * @param content - 文件内容
 * @param filename - 文件名
 * @param mimeType - MIME 类型
 */
export function downloadFile(content: string | Blob, filename: string, mimeType?: string): void {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType || "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 导出日志
 * @param content - 日志内容
 * @param filename - 文件名
 */
export function exportLogs(content: string, filename: string): void {
  downloadFile(content, filename, "text/plain;charset=utf-8");
}