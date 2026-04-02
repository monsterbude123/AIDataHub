/**
 * 查询结果导出服务
 * 支持将即席查询结果导出为 CSV 和 Excel 格式
 */

import * as XLSX from "xlsx";
import { downloadFile, formatDate } from "@/lib/utils";

/** 导出格式类型 */
export type ExportFormat = "csv" | "xlsx";

/** 导出选项配置 */
export interface ExportOptions {
  /** 导出格式 */
  format: ExportFormat;
  /** 文件名（不含扩展名） */
  filename?: string;
  /** 是否包含表头 */
  includeHeader?: boolean;
}

/**
 * 将查询结果数据转换为 CSV 格式
 * @param data - 查询结果数据数组
 * @param columns - 列名映射（可选，用于自定义列名）
 * @returns CSV 格式字符串
 */
export function formatQueryResultAsCsv<T extends Record<string, unknown>>(
  data: T[],
  columns?: Record<string, string>
): string {
  if (data.length === 0) {
    return "";
  }

  // 获取所有列名
  const keys = Object.keys(data[0]);
  const headers = columns
    ? keys.map((key) => columns[key] || key)
    : keys;

  // 生成表头行
  const headerRow = headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(",");

  // 生成数据行
  const dataRows = data.map((row) =>
    keys
      .map((key) => {
        const value = row[key];
        if (value === null || value === undefined) {
          return "";
        }
        const strValue = String(value);
        return `"${strValue.replace(/"/g, '""')}"`;
      })
      .join(",")
  );

  return [headerRow, ...dataRows].join("\n");
}

/**
 * 将查询结果数据导出为 CSV 文件
 * @param data - 查询结果数据数组
 * @param options - 导出选项
 * @param columns - 列名映射（可选）
 */
export function exportQueryResultAsCsv<T extends Record<string, unknown>>(
  data: T[],
  options: ExportOptions = { format: "csv" },
  columns?: Record<string, string>
): void {
  const timestamp = formatDate(new Date(), "YYYY-MM-DD");
  const filename = options.filename
    ? `${options.filename}_${timestamp}.csv`
    : `query_result_${timestamp}.csv`;

  const content = formatQueryResultAsCsv(data, columns);
  downloadFile(content, filename, "text/csv;charset=utf-8");
}

/**
 * 将查询结果数据导出为 Excel 文件
 * @param data - 查询结果数据数组
 * @param options - 导出选项
 * @param columns - 列名映射（可选）
 */
export function exportQueryResultAsExcel<T extends Record<string, unknown>>(
  data: T[],
  options: ExportOptions = { format: "xlsx" },
  columns?: Record<string, string>
): void {
  if (data.length === 0) {
    return;
  }

  const timestamp = formatDate(new Date(), "YYYY-MM-DD");
  const filename = options.filename
    ? `${options.filename}_${timestamp}.xlsx`
    : `query_result_${timestamp}.xlsx`;

  // 获取所有列名
  const keys = Object.keys(data[0]);
  const headers = columns
    ? keys.map((key) => columns[key] || key)
    : keys;

  // 创建工作簿
  const workbook = XLSX.utils.book_new();

  // 构建表头和数据
  const sheetData = [
    ["查询结果"],
    ["导出时间", new Date().toLocaleString("zh-CN")],
    [],
    headers,
    ...data.map((row) =>
      keys.map((key) => {
        const value = row[key];
        return value === null || value === undefined ? "" : value;
      })
    ),
  ];

  const sheet = XLSX.utils.aoa_to_sheet(sheetData);

  // 设置列宽自动适应内容
  const colWidths = headers.map((h) => ({ wch: Math.max(h.length, 10) }));
  sheet["!cols"] = colWidths;

  XLSX.utils.book_append_sheet(workbook, sheet, "查询结果");

  // 导出文件
  XLSX.writeFile(workbook, filename);
}

/**
 * 统一的查询结果导出函数
 * @param data - 查询结果数据数组
 * @param options - 导出选项
 * @param columns - 列名映射（可选）
 */
export function exportQueryResult<T extends Record<string, unknown>>(
  data: T[],
  options: ExportOptions,
  columns?: Record<string, string>
): void {
  switch (options.format) {
    case "xlsx":
      exportQueryResultAsExcel(data, options, columns);
      break;
    case "csv":
      exportQueryResultAsCsv(data, options, columns);
      break;
    default:
      exportQueryResultAsCsv(data, options, columns);
  }
}