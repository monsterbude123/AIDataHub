"use client";

/**
 * 数据迁移任务详情页
 * 页面路径: /integration/migration/[taskId]
 */

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  Row,
  Col,
  Descriptions,
  Tag,
  Button,
  Space,
  Progress,
  Timeline,
  Table,
  Tabs,
  Statistic,
  Empty,
  Spin,
  message,
  Modal,
  Divider,
} from "antd";
import {
  Play,
  Pause,
  RefreshCw,
  Edit,
  Trash2,
  FileText,
  Clock,
  Database,
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";

import { PageLayout } from "@/components/layout";
import {
  PageBreadcrumb,
  StatusBadge,
  LoadingState,
  EmptyData,
} from "@/components/ui";
import { ROUTES } from "@/constants";

/**
 * 面包屑配置
 */
const BREADCRUMB_ITEMS = [
  { title: "数据集成", href: "/integration" },
  { title: "数据迁移", href: ROUTES.MIGRATION },
  { title: "任务详情" },
];

/**
 * Mock 任务详情数据
 */
const mockTaskDetail = {
  id: "mig-001",
  name: "MySQL到Hive订单数据迁移",
  status: "running",
  progress: 65,
  source: {
    type: "MySQL",
    name: "生产订单数据库",
    database: "production",
    table: "orders",
    query: "WHERE created_at > '2024-01-01'",
  },
  target: {
    type: "Hive",
    name: "数据仓库订单表",
    database: "dw",
    table: "order_detail",
    writeMode: "append",
  },
  statistics: {
    totalRecords: 1000000,
    processedRecords: 650000,
    failedRecords: 12,
    speed: 1250,
    estimatedTime: "2小时30分钟",
  },
  schedule: {
    type: "daily",
    executeTime: "02:00",
    retryCount: 3,
    timeout: 120,
  },
  createdAt: "2026-04-02 14:30:00",
  creator: "张三",
  startTime: "2026-04-03 10:00:00",
  updatedAt: "2026-04-03 11:35:00",
};

/**
 * Mock 执行历史
 */
const mockExecutionHistory = [
  {
    id: "exec-001",
    startTime: "2026-04-03 10:00:00",
    endTime: "2026-04-03 11:30:00",
    status: "running",
    records: 650000,
    duration: "1小时35分钟",
  },
  {
    id: "exec-002",
    startTime: "2026-04-02 10:00:00",
    endTime: "2026-04-02 11:45:00",
    status: "success",
    records: 980000,
    duration: "1小时45分钟",
  },
  {
    id: "exec-003",
    startTime: "2026-04-01 10:00:00",
    endTime: "2026-04-01 10:30:00",
    status: "failed",
    records: 120000,
    duration: "30分钟",
  },
];

/**
 * Mock 字段映射
 */
const mockFieldMappings = [
  { source: "order_id", sourceType: "BIGINT", target: "id", targetType: "BIGINT", status: "success" },
  { source: "customer_id", sourceType: "BIGINT", target: "customer_id", targetType: "BIGINT", status: "success" },
  { source: "order_date", sourceType: "DATETIME", target: "order_time", targetType: "TIMESTAMP", status: "success" },
  { source: "total_amount", sourceType: "DECIMAL", target: "amount", targetType: "DECIMAL", status: "success" },
  { source: "status", sourceType: "INT", target: "order_status", targetType: "INT", status: "processing" },
];

/**
 * 状态映射
 */
const statusConfig: Record<string, { color: string; label: string }> = {
  running: { color: "processing", label: "运行中" },
  paused: { color: "warning", label: "已暂停" },
  completed: { color: "success", label: "已完成" },
  failed: { color: "error", label: "失败" },
  pending: { color: "default", label: "待执行" },
};

/**
 * 数据迁移任务详情页组件
 */
export default function MigrationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.taskId as string;

  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState<typeof mockTaskDetail | null>(null);

  /**
   * 加载任务详情
   */
  useEffect(() => {
    const loadTask = async () => {
      setLoading(true);
      // 模拟 API 调用
      await new Promise((resolve) => setTimeout(resolve, 800));
      setTask(mockTaskDetail);
      setLoading(false);
    };

    loadTask();
  }, [taskId]);

  /**
   * 处理操作
   */
  const handleAction = (action: string) => {
    switch (action) {
      case "pause":
        message.success("任务已暂停");
        break;
      case "resume":
        message.success("任务已恢复");
        break;
      case "retry":
        message.success("正在重试任务");
        break;
      case "edit":
        router.push(`/integration/migration/${taskId}/edit`);
        break;
      case "delete":
        Modal.confirm({
          title: "确认删除",
          content: "删除后无法恢复，确定要删除该迁移任务吗？",
          okText: "删除",
          okType: "danger",
          cancelText: "取消",
          onOk: () => {
            message.success("任务已删除");
            router.push(ROUTES.MIGRATION);
          },
        });
        break;
    }
  };

  /**
   * 执行历史表格列
   */
  const historyColumns = [
    { title: "执行开始时间", dataIndex: "startTime", key: "startTime", width: 180 },
    { title: "执行结束时间", dataIndex: "endTime", key: "endTime", width: 180 },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => (
        <Tag color={statusConfig[status as keyof typeof statusConfig]?.color}>
          {statusConfig[status as keyof typeof statusConfig]?.label}
        </Tag>
      ),
    },
    { title: "处理记录数", dataIndex: "records", key: "records", width: 120, render: (v: number) => v.toLocaleString() },
    { title: "执行时长", dataIndex: "duration", key: "duration", width: 120 },
    {
      title: "操作",
      key: "actions",
      width: 150,
      render: () => (
        <Space>
          <Button type="link" size="small">查看日志</Button>
          <Button type="link" size="small">详情</Button>
        </Space>
      ),
    },
  ];

  /**
   * 字段映射表格列
   */
  const mappingColumns = [
    { title: "源字段", dataIndex: "source", key: "source", width: 150 },
    { title: "源类型", dataIndex: "sourceType", key: "sourceType", width: 120 },
    {
      title: "",
      key: "arrow",
      width: 40,
      render: () => <ArrowRight size={14} color="#2563EB" />,
    },
    { title: "目标字段", dataIndex: "target", key: "target", width: 150 },
    { title: "目标类型", dataIndex: "targetType", key: "targetType", width: 120 },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => (
        <Tag color={status === "success" ? "success" : status === "processing" ? "processing" : "default"}>
          {status === "success" ? "成功" : status === "processing" ? "处理中" : "待处理"}
        </Tag>
      ),
    },
  ];

  if (loading) {
    return (
      <PageLayout title="任务详情">
        <LoadingState type="spinner" tip="加载中..." />
      </PageLayout>
    );
  }

  if (!task) {
    return (
      <PageLayout title="任务详情">
        <EmptyData description="任务不存在" />
      </PageLayout>
    );
  }

  return (
    <PageLayout title={task.name}>
      <PageBreadcrumb items={BREADCRUMB_ITEMS} />

      {/* 状态概览 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={24} align="middle">
          <Col span={12}>
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Tag color={statusConfig[task.status].color} style={{ fontSize: 14, padding: "4px 12px" }}>
                  {statusConfig[task.status].label}
                </Tag>
                <span style={{ fontSize: 14, color: "#6B7280" }}>
                  进度: {task.progress}%
                </span>
              </div>
              <Progress
                percent={task.progress}
                status={task.status === "running" ? "active" : task.status === "completed" ? "success" : "exception"}
                strokeColor={{
                  "0%": "#2563EB",
                  "100%": "#10B981",
                }}
              />
            </Space>
          </Col>
          <Col span={12} style={{ textAlign: "right" }}>
            <Space>
              {task.status === "running" && (
                <Button icon={<Pause size={14} />} onClick={() => handleAction("pause")}>
                  暂停
                </Button>
              )}
              {task.status === "paused" && (
                <Button type="primary" icon={<Play size={14} />} onClick={() => handleAction("resume")}>
                  继续
                </Button>
              )}
              {task.status === "failed" && (
                <Button type="primary" icon={<RefreshCw size={14} />} onClick={() => handleAction("retry")}>
                  重试
                </Button>
              )}
              <Button icon={<Edit size={14} />} onClick={() => handleAction("edit")}>
                编辑
              </Button>
              <Button
                icon={<FileText size={14} />}
                onClick={() => router.push(`/integration/migration/${taskId}/logs`)}
              >
                查看日志
              </Button>
              <Button danger icon={<Trash2 size={14} />} onClick={() => handleAction("delete")}>
                删除
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 统计信息 */}
      {task.status === "running" && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="已处理记录"
                value={task.statistics.processedRecords}
                suffix={`/ ${task.statistics.totalRecords.toLocaleString()}`}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="处理速度"
                value={task.statistics.speed}
                suffix="条/秒"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="失败记录"
                value={task.statistics.failedRecords}
                valueStyle={{ color: task.statistics.failedRecords > 0 ? "#EF4444" : undefined }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="预计剩余时间"
                value={task.statistics.estimatedTime}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Tab 详情 */}
      <Tabs
        items={[
          {
            key: "info",
            label: "基本信息",
            children: (
              <Card>
                <Descriptions bordered column={2}>
                  <Descriptions.Item label="任务ID">{task.id}</Descriptions.Item>
                  <Descriptions.Item label="任务名称">{task.name}</Descriptions.Item>
                  <Descriptions.Item label="状态">
                    <Tag color={statusConfig[task.status].color}>{statusConfig[task.status].label}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="创建人">{task.creator}</Descriptions.Item>
                  <Descriptions.Item label="创建时间">{task.createdAt}</Descriptions.Item>
                  <Descriptions.Item label="开始时间">{task.startTime}</Descriptions.Item>
                  <Descriptions.Item label="最后更新">{task.updatedAt}</Descriptions.Item>
                  <Descriptions.Item label="调度方式">
                    {task.schedule.type === "daily" ? `每日 ${task.schedule.executeTime}` : "手动执行"}
                  </Descriptions.Item>
                </Descriptions>

                <Divider>数据源配置</Divider>

                <Descriptions bordered column={2}>
                  <Descriptions.Item label="源类型">
                    <Tag color="blue">{task.source.type}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="数据源名称">{task.source.name}</Descriptions.Item>
                  <Descriptions.Item label="数据库">{task.source.database}</Descriptions.Item>
                  <Descriptions.Item label="数据表">{task.source.table}</Descriptions.Item>
                </Descriptions>

                <Divider>目标配置</Divider>

                <Descriptions bordered column={2}>
                  <Descriptions.Item label="目标类型">
                    <Tag color="green">{task.target.type}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="目标名称">{task.target.name}</Descriptions.Item>
                  <Descriptions.Item label="目标数据库">{task.target.database}</Descriptions.Item>
                  <Descriptions.Item label="目标表">{task.target.table}</Descriptions.Item>
                  <Descriptions.Item label="写入模式">
                    {task.target.writeMode === "append" ? "追加" : task.target.writeMode === "overwrite" ? "覆盖" : "更新"}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            ),
          },
          {
            key: "mapping",
            label: "字段映射",
            children: (
              <Card>
                <Table
                  dataSource={mockFieldMappings}
                  columns={mappingColumns}
                  rowKey="source"
                  pagination={false}
                />
              </Card>
            ),
          },
          {
            key: "history",
            label: "执行历史",
            children: (
              <Card>
                <Table
                  dataSource={mockExecutionHistory}
                  columns={historyColumns}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              </Card>
            ),
          },
        ]}
      />
    </PageLayout>
  );
}