/**
 * 数据集成模块 Mock 数据
 */

import type {
  DataSource,
  DataSourceCategory,
  DataSourceType,
  DataSourceStatus,
} from "@/types/data-integration";

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

/**
 * Mock 数据源分类目录
 */
export const mockDataSourceCategories: DataSourceCategory[] = [
  {
    id: "cat-1",
    name: "业务数据库",
    order: 1,
    children: [
      { id: "cat-1-1", name: "MySQL", parentId: "cat-1", order: 1 },
      { id: "cat-1-2", name: "PostgreSQL", parentId: "cat-1", order: 2 },
      { id: "cat-1-3", name: "Oracle", parentId: "cat-1", order: 3 },
    ],
  },
  {
    id: "cat-2",
    name: "大数据平台",
    order: 2,
    children: [
      { id: "cat-2-1", name: "Hive", parentId: "cat-2", order: 1 },
      { id: "cat-2-2", name: "HDFS", parentId: "cat-2", order: 2 },
      { id: "cat-2-3", name: "Kafka", parentId: "cat-2", order: 3 },
    ],
  },
  {
    id: "cat-3",
    name: "文件存储",
    order: 3,
    children: [
      { id: "cat-3-1", name: "S3", parentId: "cat-3", order: 1 },
      { id: "cat-3-2", name: "FTP", parentId: "cat-3", order: 2 },
      { id: "cat-3-3", name: "本地文件", parentId: "cat-3", order: 3 },
    ],
  },
  {
    id: "cat-4",
    name: "NoSQL",
    order: 4,
    children: [
      { id: "cat-4-1", name: "MongoDB", parentId: "cat-4", order: 1 },
      { id: "cat-4-2", name: "Redis", parentId: "cat-4", order: 2 },
      { id: "cat-4-3", name: "Elasticsearch", parentId: "cat-4", order: 3 },
    ],
  },
];

/**
 * Mock 数据源列表
 */
export const mockDataSources: DataSource[] = [
  {
    id: "ds-001",
    name: "生产订单数据库",
    type: "mysql",
    description: "存储生产订单相关数据，包含订单表、产品表、客户表等",
    status: "connected",
    categoryId: "cat-1-1",
    categoryName: "MySQL",
    connectionConfig: {
      host: "192.168.1.100",
      port: 3306,
      database: "production_db",
      username: "admin",
    },
    lastTestTime: "2024-01-15 10:30:00",
    lastTestResult: "success",
    createdBy: "张三",
    createdAt: "2024-01-01 09:00:00",
    updatedAt: "2024-01-15 10:30:00",
  },
  {
    id: "ds-002",
    name: "客户管理系统",
    type: "postgresql",
    description: "客户信息和CRM系统数据库",
    status: "connected",
    categoryId: "cat-1-2",
    categoryName: "PostgreSQL",
    connectionConfig: {
      host: "192.168.1.101",
      port: 5432,
      database: "crm_db",
      username: "crm_admin",
    },
    lastTestTime: "2024-01-15 09:45:00",
    lastTestResult: "success",
    createdBy: "李四",
    createdAt: "2024-01-02 10:00:00",
    updatedAt: "2024-01-15 09:45:00",
  },
  {
    id: "ds-003",
    name: "财务系统",
    type: "oracle",
    description: "财务核算系统主数据库",
    status: "disconnected",
    categoryId: "cat-1-3",
    categoryName: "Oracle",
    connectionConfig: {
      host: "192.168.1.102",
      port: 1521,
      database: "finance_db",
      username: "finance_user",
    },
    lastTestTime: "2024-01-14 16:00:00",
    lastTestResult: "failed",
    createdBy: "王五",
    createdAt: "2024-01-03 11:00:00",
    updatedAt: "2024-01-14 16:00:00",
  },
  {
    id: "ds-004",
    name: "日志数据湖",
    type: "hive",
    description: "存储系统日志和用户行为数据",
    status: "connected",
    categoryId: "cat-2-1",
    categoryName: "Hive",
    connectionConfig: {
      host: "hadoop-cluster.internal",
      port: 10000,
      database: "log_lake",
      username: "hive_user",
    },
    lastTestTime: "2024-01-15 08:00:00",
    lastTestResult: "success",
    createdBy: "赵六",
    createdAt: "2024-01-04 12:00:00",
    updatedAt: "2024-01-15 08:00:00",
  },
  {
    id: "ds-005",
    name: "实时消息流",
    type: "kafka",
    description: "Kafka消息队列，用于实时数据同步",
    status: "connected",
    categoryId: "cat-2-3",
    categoryName: "Kafka",
    connectionConfig: {
      host: "kafka-cluster.internal",
      port: 9092,
      extraParams: {
        topic: "data-sync",
        groupId: "datahub-consumer",
      },
    },
    lastTestTime: "2024-01-15 07:30:00",
    lastTestResult: "success",
    createdBy: "孙七",
    createdAt: "2024-01-05 13:00:00",
    updatedAt: "2024-01-15 07:30:00",
  },
  {
    id: "ds-006",
    name: "用户画像库",
    type: "mongodb",
    description: "存储用户画像和行为标签数据",
    status: "connected",
    categoryId: "cat-4-1",
    categoryName: "MongoDB",
    connectionConfig: {
      host: "192.168.1.103",
      port: 27017,
      database: "user_profile",
      username: "profile_admin",
    },
    lastTestTime: "2024-01-15 11:00:00",
    lastTestResult: "success",
    createdBy: "周八",
    createdAt: "2024-01-06 14:00:00",
    updatedAt: "2024-01-15 11:00:00",
  },
  {
    id: "ds-007",
    name: "缓存服务",
    type: "redis",
    description: "Redis缓存服务，用于数据加速",
    status: "connected",
    categoryId: "cat-4-2",
    categoryName: "Redis",
    connectionConfig: {
      host: "192.168.1.104",
      port: 6379,
      extraParams: {
        db: 0,
      },
    },
    lastTestTime: "2024-01-15 06:00:00",
    lastTestResult: "success",
    createdBy: "吴九",
    createdAt: "2024-01-07 15:00:00",
    updatedAt: "2024-01-15 06:00:00",
  },
  {
    id: "ds-008",
    name: "搜索索引",
    type: "elasticsearch",
    description: "Elasticsearch搜索服务集群",
    status: "connected",
    categoryId: "cat-4-3",
    categoryName: "Elasticsearch",
    connectionConfig: {
      host: "es-cluster.internal",
      port: 9200,
      extraParams: {
        index: "data_search",
      },
    },
    lastTestTime: "2024-01-15 05:30:00",
    lastTestResult: "success",
    createdBy: "郑十",
    createdAt: "2024-01-08 16:00:00",
    updatedAt: "2024-01-15 05:30:00",
  },
  {
    id: "ds-009",
    name: "备份数据存储",
    type: "s3",
    description: "AWS S3存储，用于数据备份",
    status: "connected",
    categoryId: "cat-3-1",
    categoryName: "S3",
    connectionConfig: {
      host: "s3.amazonaws.com",
      extraParams: {
        bucket: "datahub-backup",
        region: "cn-north-1",
      },
    },
    lastTestTime: "2024-01-15 04:00:00",
    lastTestResult: "success",
    createdBy: "张三",
    createdAt: "2024-01-09 17:00:00",
    updatedAt: "2024-01-15 04:00:00",
  },
  {
    id: "ds-010",
    name: "外部接口",
    type: "api",
    description: "第三方API数据接入",
    status: "testing",
    categoryId: "cat-4",
    categoryName: "NoSQL",
    connectionConfig: {
      extraParams: {
        endpoint: "https://api.example.com/data",
        method: "GET",
      },
    },
    createdBy: "李四",
    createdAt: "2024-01-10 18:00:00",
    updatedAt: "2024-01-15 03:00:00",
  },
];

/**
 * 根据分类 ID 获取数据源列表
 */
export function getDataSourcesByCategory(categoryId: string): DataSource[] {
  if (!categoryId || categoryId === "all") {
    return mockDataSources;
  }
  return mockDataSources.filter((ds) => ds.categoryId === categoryId);
}

/**
 * 根据 ID 获取数据源详情
 */
export function getDataSourceById(id: string): DataSource | undefined {
  return mockDataSources.find((ds) => ds.id === id);
}

/**
 * 根据关键词搜索数据源
 */
export function searchDataSources(keyword: string): DataSource[] {
  if (!keyword) return mockDataSources;
  const lowerKeyword = keyword.toLowerCase();
  return mockDataSources.filter(
    (ds) =>
      ds.name.toLowerCase().includes(lowerKeyword) ||
      ds.description?.toLowerCase().includes(lowerKeyword) ||
      ds.type.toLowerCase().includes(lowerKeyword)
  );
}

/**
 * 数据源类型统计
 */
export function getDataSourceTypeStats(): Record<DataSourceType, number> {
  const stats: Partial<Record<DataSourceType, number>> = {};
  mockDataSources.forEach((ds) => {
    stats[ds.type] = (stats[ds.type] ?? 0) + 1;
  });
  return stats as Record<DataSourceType, number>;
}