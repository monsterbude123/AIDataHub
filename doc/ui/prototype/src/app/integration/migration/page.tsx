"use client";

/**
 * 数据迁移任务列表页
 * 页面路径: /integration/migration
 */

import { useState } from "react";
import {
  Card,
  Button,
  Space,
  Tag,
  Tooltip,
  Popconfirm,
  message,
} from "antd";
import {
  Plus,
  Play,
  Pause,
  RefreshCw,
  Edit,
  Trash2,
  Eye,
  FileText,
} from "lucide-react";

import { PageLayout } from "@/components/layout";
import {
  DataTable,
  FilterBar,
  StatusBadge,
  EmptyData,
  type TableActionItem,
  type FilterItem,
} from "@/components/ui";
import { ROUTES } from "@/constants";

/**
 * 迁移任务状态
 */
type MigrationStatus =
  | "running"
  | "paused"
  | "completed"
  | "failed"
  | "pending";

/**
 * 迁移任务数据
 */
interface MigrationTask {
  id: string;
  name: string;
  sourceType: string;
  sourceName: string;
  targetType: string;
  targetName: string;
  status: MigrationStatus;
  progress: number;
  totalRecords: number;
  processedRecords: number;
  startTime?: string;
  endTime?: string;
  createdAt: string;
  creator: string;
}

/**
 * 模拟数据
 */
const mockTasks: MigrationTask[] = [
  {
    id: "mig-001",
    name: "MySQL到Hive订单数据迁移",
    sourceType: "MySQL",
    sourceName: "生产订单数据库",
    targetType: "Hive",
    targetName: "数据仓库订单表",
    status: "running",
    progress: 65,
    totalRecords: 1000000,
    processedRecords: 650000,
    startTime: "2026-04-03 10:00:00",
    createdAt: "2026-04-02 14:30:00",
    creator: "张三",
  },
  {
    id: "mig-002",
    name: "Oracle客户数据同步",
    sourceType: "Oracle",
    sourceName: "CRM系统",
    targetType: "HBase",
    targetName: "客户信息表",
    status: "completed",
    progress: 100,
    totalRecords: 500000,
    processedRecords: 500000,
    startTime: "2026-04-02 08:00:00",
    endTime: "2026-04-02 12:30:00",
    createdAt: "2026-04-01 16:00:00",
    creator: "李四",
  },
  {
    id: "mig-003",
    name: "PostgreSQL日志数据迁移",
    sourceType: "PostgreSQL",
    sourceName: "日志数据库",
    targetType: "HDFS",
    targetName: "日志存储目录",
    status: "failed",
    progress: 23,
    totalRecords: 2000000,
    processedRecords: 460000,
    startTime: "2026-04-03 02:00:00",
    endTime: "2026-04-03 02:45:00",
    createdAt: "2026-04-02 18:00:00",
    creator: "王五",
  },
  {
    id: "mig-004",
    name: "MongoDB商品数据迁移",
    sourceType: "MongoDB",
    sourceName: "商品数据库",
    targetType: "Elasticsearch",
    targetName: "商品搜索索引",
    status: "paused",
    progress: 45,
    totalRecords: 300000,
    processedRecords: 135000,
    startTime: "2026-04-03 06:00:00",
    createdAt: "2026-04-02 20:00:00",
    creator: "赵六",
  },
];

/**
 * 状态映射
 */
const statusMap: Record<MigrationStatus, { type: "running" | "success" | "error" | "warning" | "pending"; label: string }> = {
  running: { type: "processing", label: "运行中" },
  paused: { type: "warning", label: "已暂停" },
  completed: { type: "success", label: "已完成" },
  failed: { type: "error", label: "失败" },
  pending: { type: "pending", label: "待执行" },
};

/**
 * 数据迁移任务列表页组件
 */
export default function MigrationTaskListPage() {
  const [tasks, setTasks] = useState<MigrationTask[]>(mockTasks);
  const [loading, setLoading] = useState(false);

  /**
   * 过滤器配置
   */
  const filterItems: FilterItem[] = [
    {
      key: "search",
      type: "search",
      placeholder: "搜索任务名称",
    },
    {
      key: "status",
      type: "select",
      placeholder: "任务状态",
      options: [
        { label: "全部", value: "" },
        { label: "运行中", value: "running" },
        { label: "已暂停", value: "paused" },
        { label: "已完成", value: "completed" },
        { label: "失败", value: "failed" },
        { label: "待执行", value: "pending" },
      ],
    },
    {
      key: "sourceType",
      type: "select",
      placeholder: "数据源类型",
      options: [
        { label: "全部", value: "" },
        { label: "MySQL", value: "MySQL" },
        { label: "Oracle", value: "Oracle" },
        { label: "PostgreSQL", value: "PostgreSQL" },
        { label: "MongoDB", value: "MongoDB" },
      ],
    },
  ];

  /**
   * 表格列配置
   */
  const columns = [
    {
      key: "name",
      title: "任务名称",
      dataIndex: "name",
      width: 200,
      render: (value: string, record: MigrationTask) => (
        <a href={`/integration/migration/${record.id}`}>{value}</a>
      ),
    },
    {
      key: "source",
      title: "数据源",
      dataIndex: "sourceName",
      width: 180,
      render: (_: unknown, record: MigrationTask) => (
        <Tooltip title={`${record.sourceType}: ${record.sourceName}`}>
          <span>
            <Tag>{record.sourceType}</Tag>
            {record.sourceName}
          </span>
        </Tooltip>
      ),
    },
    {
      key: "target",
      title: "目标",
      dataIndex: "targetName",
      width: 180,
      render: (_: unknown, record: MigrationTask) => (
        <Tooltip title={`${record.targetType}: ${record.targetName}`}>
          <span>
            <Tag color="blue">{record.targetType}</Tag>
            {record.targetName}
          </span>
        </Tooltip>
      ),
    },
    {
      key: "status",
      title: "状态",
      dataIndex: "status",
      width: 100,
      render: (status: MigrationStatus) => (
        <StatusBadge status={statusMap[status].type} label={statusMap[status].label} />
      ),
    },
    {
      key: "progress",
      title: "进度",
      dataIndex: "progress",
      width: 120,
      render: (progress: number, record: MigrationTask) => (
        <span>
          {progress}% ({record.processedRecords.toLocaleString()}/{record.totalRecords.toLocaleString()})
        </span>
      ),
    },
    {
      key: "creator",
      title: "创建人",
      dataIndex: "creator",
      width: 100,
    },
    {
      key: "createdAt",
      title: "创建时间",
      dataIndex: "createdAt",
      width: 160,
    },
  ];

  /**
   * 操作配置
   */
  const getActions = (record: MigrationTask): TableActionItem[] => {
    const baseActions: TableActionItem[] = [
      {
        key: "view",
        label: "查看详情",
        icon: <Eye size={14} />,
        onClick: () => {
          window.location.href = `/integration/migration/${record.id}`;
        },
      },
      {
        key: "logs",
        label: "查看日志",
        icon: <FileText size={14} />,
        onClick: () => {
          window.location.href = `/integration/migration/${record.id}/logs`;
        },
      },
    ];

    if (record.status === "running") {
      baseActions.push({
        key: "pause",
        label: "暂停",
        icon: <Pause size={14} />,
        onClick: () => {
          message.success(`任务 ${record.name} 已暂停`);
        },
      });
    } else if (record.status === "paused" || record.status === "failed") {
      baseActions.push({
        key: "resume",
        label: "继续执行",
        icon: <Play size={14} />,
        onClick: () => {
          message.success(`任务 ${record.name} 已继续执行`);
        },
      });
    }

    if (record.status !== "running") {
      baseActions.push(
        {
          key: "edit",
          label: "编辑",
          icon: <Edit size={14} />,
          onClick: () => {
            window.location.href = `/integration/migration/${record.id}/edit`;
          },
        },
        {
          key: "delete",
          label: "删除",
          icon: <Trash2 size={14} />,
          danger: true,
          confirm: true,
          confirmText: "确认删除该迁移任务？",
          onClick: () => {
            setTasks(tasks.filter((t) => t.id !== record.id));
            message.success("任务已删除");
          },
        }
      );
    }

    return baseActions;
  };

  /**
   * 处理新建任务
   */
  const handleCreate = () => {
    window.location.href = ROUTES.MIGRATION_CREATE;
  };

  /**
   * 处理刷新
   */
  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      message.success("列表已刷新");
    }, 1000);
  };

  return (
    <PageLayout title="数据迁移">
      <Card>
        <FilterBar
          filters={filterItems}
          showCreate
          createText="新建迁移任务"
          onCreate={handleCreate}
          showRefresh
          onRefresh={handleRefresh}
          loading={loading}
        />

        {tasks.length > 0 ? (
          <DataTable
            columns={columns}
            dataSource={tasks}
            actions={undefined}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              total: tasks.length,
            }}
          />
        ) : (
          <EmptyData
            onCreate={handleCreate}
            createText="新建迁移任务"
            description="暂无迁移任务，点击下方按钮创建第一个迁移任务"
          />
        )}
      </Card>
    </PageLayout>
  );
}