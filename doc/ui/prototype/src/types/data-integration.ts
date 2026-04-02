/**
 * 数据集成模块类型定义
 */

/**
 * 数据源类型
 */
export type DataSourceType =
  | "mysql"
  | "postgresql"
  | "oracle"
  | "sqlserver"
  | "mongodb"
  | "redis"
  | "elasticsearch"
  | "kafka"
  | "hive"
  | "hdfs"
  | "s3"
  | "ftp"
  | "api"
  | "file";

/**
 * 数据源连接状态
 */
export type DataSourceStatus = "connected" | "disconnected" | "testing";

/**
 * 数据源分类目录
 */
export interface DataSourceCategory {
  id: string;
  name: string;
  parentId?: string;
  children?: DataSourceCategory[];
  order: number;
}

/**
 * 数据源配置
 */
export interface DataSource {
  id: string;
  name: string;
  type: DataSourceType;
  description?: string;
  status: DataSourceStatus;
  categoryId: string;
  categoryName?: string;
  connectionConfig: {
    host?: string;
    port?: number;
    database?: string;
    username?: string;
    /** 仅展示，实际存储加密 */
    password?: string;
    /** 其他配置参数 */
    extraParams?: Record<string, unknown>;
  };
  lastTestTime?: string;
  lastTestResult?: "success" | "failed";
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 数据源创建/编辑表单
 */
export interface DataSourceFormData {
  name: string;
  type: DataSourceType;
  description?: string;
  categoryId: string;
  connectionConfig: {
    host?: string;
    port?: number;
    database?: string;
    username?: string;
    password?: string;
    extraParams?: Record<string, unknown>;
  };
}

/**
 * 数据源类型图标映射
 */
export const DATA_SOURCE_TYPE_ICONS: Record<DataSourceType, string> = {
  mysql: "MySQL",
  postgresql: "PostgreSQL",
  oracle: "Oracle",
  sqlserver: "SQLServer",
  mongodb: "MongoDB",
  redis: "Redis",
  elasticsearch: "Elasticsearch",
  kafka: "Kafka",
  hive: "Hive",
  hdfs: "HDFS",
  s3: "S3",
  ftp: "FTP",
  api: "API",
  file: "File",
};

/**
 * 数据源类型标签映射
 */
export const DATA_SOURCE_TYPE_LABELS: Record<DataSourceType, string> = {
  mysql: "MySQL",
  postgresql: "PostgreSQL",
  oracle: "Oracle",
  sqlserver: "SQL Server",
  mongodb: "MongoDB",
  redis: "Redis",
  elasticsearch: "Elasticsearch",
  kafka: "Kafka",
  hive: "Hive",
  hdfs: "HDFS",
  s3: "Amazon S3",
  ftp: "FTP",
  api: "API 接口",
  file: "文件上传",
};