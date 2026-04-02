"use client";

/**
 * 队列监控总览页
 * 页面路径: /task-queue/monitor
 */

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Input,
  Select,
  Badge,
  Tooltip,
  Modal,
  Popconfirm,
  Progress,
  message,
} from "antd";
import {
  Search,
  RefreshCw,
  Pause,
  Play,
  Trash2,
  Eye,
  Download,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

import { PageLayout } from "@/components/layout";
import { PageBreadcrumb } from "@/components/ui";
import {
  mockQueues,
  filterQueues,
  getQueueOverviewStats,
  getQueueDetail,
  pauseQueue,
  resumeQueue,
  clearQueue,
} from "@/services/mock/task-queue";
import {
  QUEUE_STATUS_LABELS,
  QUEUE_TYPE_LABELS,
  QUEUE_TASK_STATUS_LABELS,
} from "@/types/task-queue";
import type {
  QueueInfo,
  QueueStatus,
  QueueType,
  QueueDetail,
  QueueCapacityPoint,
} from "@/types/task-queue";

/**
 * 面包屑配置
 */
const BREADCRUMB_ITEMS = [
  { title: "任务队列", href: "/task-queue" },
  { title: "队列监控" },
];

/**
 * 队列状态颜色
 */
const QUEUE_STATUS_COLORS: Record<QueueStatus, "success" | "warning" | "error" | "default"> = {
  running: "success",
  paused: "warning",
  error: "error",
  empty: "default",
};

/**
 * 优先级颜色
 */
const PRIORITY_COLORS: Record<string, string> = {
  high: "red",
  medium: "orange",
  low: "default",
};

/**
 * 格式化等待时间
 */
function formatWaitTime(seconds: number): string {
  if (seconds === 0) return "-";
  if (seconds < 60) return `${seconds}秒`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}分钟`;
  return `${Math.round(seconds / 3600)}小时`;
}

/**
 * 简单趋势图组件
 */
function SimpleTrendChart({ data }: { data: QueueCapacityPoint[] }) {
  const maxValue = Math.max(...data.map((d) => d.queueLength), 1);

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 120, padding: "8px 0" }}>
      {data.map((point, index) => {
        const height = (point.queueLength / maxValue) * 100;
        return (
          <Tooltip key={index} title={`${point.time}: ${point.queueLength}`}>
            <div
              style={{
                flex: 1,
                minWidth: 8,
                height: `${height}%`,
                backgroundColor: "#2563EB",
                borderRadius: 2,
                opacity: 0.8,
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "1";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "0.8";
              }}
            />
          </Tooltip>
        );
      })}
    </div>
  );
}

/**
 * 队列监控页面组件
 */
export default function QueueMonitorPage() {
  const [queues, setQueues] = useState<QueueInfo[]>(mockQueues);
  const [filters, setFilters] = useState<{
    keyword: string;
    status: QueueStatus | "";
    type: QueueType | "";
  }>({
    keyword: "",
    status: "",
    type: "",
  });

  const [autoRefresh, setAutoRefresh] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedQueue, setSelectedQueue] = useState<QueueDetail | null>(null);
  const [loading, setLoading] = useState(false);

  /**
   * 过滤后的队列列表
   */
  const filteredQueues = useMemo(() => {
    return filterQueues(filters);
  }, [filters, queues]);

  /**
   * 概览统计
   */
  const stats = useMemo(() => {
    return getQueueOverviewStats();
  }, [queues]);

  /**
   * 自动刷新
   */
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      handleRefresh();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  /**
   * 手动刷新
   */
  const handleRefresh = useCallback(() => {
    setLoading(true);
    // 实际项目中调用API刷新数据
    setTimeout(() => {
      setQueues([...mockQueues]);
      setLoading(false);
    }, 500);
  }, []);

  /**
   * 查看队列详情
   */
  const handleViewDetail = (queue: QueueInfo) => {
    const detail = getQueueDetail(queue.id);
    setSelectedQueue(detail);
    setDetailModalOpen(true);
  };

  /**
   * 暂停队列
   */
  const handlePause = (queueId: string) => {
    if (pauseQueue(queueId)) {
      message.success("队列已暂停");
      handleRefresh();
    } else {
      message.error("暂停失败，队列状态不允许");
    }
  };

  /**
   * 恢复队列
   */
  const handleResume = (queueId: string) => {
    if (resumeQueue(queueId)) {
      message.success("队列已恢复");
      handleRefresh();
    } else {
      message.error("恢复失败，队列状态不允许");
    }
  };

  /**
   * 清空队列
   */
  const handleClear = (queueId: string) => {
    if (clearQueue(queueId)) {
      message.success("队列已清空");
      handleRefresh();
    } else {
      message.error("清空失败，队列无等待任务");
    }
  };

  /**
   * 暂停所有队列
   */
  const handlePauseAll = () => {
    const runningQueues = queues.filter((q) => q.status === "running");
    runningQueues.forEach((q) => pauseQueue(q.id));
    message.success(`已暂停 ${runningQueues.length} 个队列`);
    handleRefresh();
  };

  /**
   * 恢复所有队列
   */
  const handleResumeAll = () => {
    const pausedQueues = queues.filter((q) => q.status === "paused" || q.status === "error");
    pausedQueues.forEach((q) => resumeQueue(q.id));
    message.success(`已恢复 ${pausedQueues.length} 个队列`);
    handleRefresh();
  };

  /**
   * 导出队列报表
   */
  const handleExport = () => {
    message.success("队列监控报表导出成功");
  };

  /**
   * 表格列定义
   */
  const columns = [
    {
      title: "队列名称",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: QueueInfo) => (
        <a style={{ color: "#2563EB" }} onClick={() => handleViewDetail(record)}>
          {name}
        </a>
      ),
    },
    {
      title: "队列类型",
      dataIndex: "type",
      key: "type",
      render: (type: QueueType) => <Tag>{QUEUE_TYPE_LABELS[type]}</Tag>,
    },
    {
      title: "当前状态",
      dataIndex: "status",
      key: "status",
      render: (status: QueueStatus) => (
        <Badge status={QUEUE_STATUS_COLORS[status]} text={QUEUE_STATUS_LABELS[status]} />
      ),
    },
    {
      title: "队列长度",
      dataIndex: "queueLength",
      key: "queueLength",
      render: (length: number, record: QueueInfo) => (
        <span style={{ color: record.hasAlert ? "#EF4444" : undefined }}>
          {length}
          {record.hasAlert && <AlertTriangle size={14} style={{ marginLeft: 4, color: "#EF4444" }} />}
        </span>
      ),
    },
    {
      title: "处理中",
      dataIndex: "processingCount",
      key: "processingCount",
      render: (count: number) => (
        <Tag color={count > 0 ? "processing" : "default"}>{count}</Tag>
      ),
    },
    {
      title: "处理速率",
      dataIndex: "processingRate",
      key: "processingRate",
      render: (rate: number) => <span>{rate} 任务/秒</span>,
    },
    {
      title: "平均等待",
      dataIndex: "avgWaitTime",
      key: "avgWaitTime",
      render: (time: number) => formatWaitTime(time),
    },
    {
      title: "容量使用",
      key: "capacityUsage",
      render: (_: unknown, record: QueueInfo) => {
        const usage = Math.round((record.queueLength / record.maxCapacity) * 100);
        const status = usage > 80 ? "exception" : usage > 50 ? "active" : "normal";
        return (
          <Progress
            percent={usage}
            size="small"
            status={status}
            format={(percent) => `${percent}%`}
          />
        );
      },
    },
    {
      title: "操作",
      key: "actions",
      render: (_: unknown, record: QueueInfo) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="text"
              size="small"
              icon={<Eye size={14} />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          {record.status === "running" && (
            <Tooltip title="暂停队列">
              <Button
                type="text"
                size="small"
                icon={<Pause size={14} />}
                onClick={() => handlePause(record.id)}
              />
            </Tooltip>
          )}
          {(record.status === "paused" || record.status === "error") && (
            <Tooltip title="恢复队列">
              <Button
                type="text"
                size="small"
                icon={<Play size={14} />}
                onClick={() => handleResume(record.id)}
              />
            </Tooltip>
          )}
          {record.queueLength > 0 && (
            <Popconfirm
              title="确认清空队列？"
              description="清空后队列中所有等待任务将被移除"
              onConfirm={() => handleClear(record.id)}
            >
              <Tooltip title="清空队列">
                <Button type="text" size="small" danger icon={<Trash2 size={14} />} />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <PageLayout title="队列监控">
      <PageBreadcrumb items={BREADCRUMB_ITEMS} />

      {/* 统计卡片 */}
      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        <Card style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Badge status="default" />
            <div>
              <div style={{ fontSize: 24, fontWeight: 600 }}>{stats.totalQueues}</div>
              <div style={{ color: "#6B7280", fontSize: 12 }}>总队列数</div>
            </div>
          </div>
        </Card>
        <Card style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Badge status="success" />
            <div>
              <div style={{ fontSize: 24, fontWeight: 600, color: "#10B981" }}>
                {stats.runningQueues}
              </div>
              <div style={{ color: "#6B7280", fontSize: 12 }}>运行中队列</div>
            </div>
          </div>
        </Card>
        <Card style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Badge status="warning" />
            <div>
              <div style={{ fontSize: 24, fontWeight: 600, color: "#F59E0B" }}>
                {stats.totalWaitingTasks}
              </div>
              <div style={{ color: "#6B7280", fontSize: 12 }}>等待任务数</div>
            </div>
          </div>
        </Card>
        <Card style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <TrendingUp size={24} style={{ color: "#3B82F6" }} />
            <div>
              <div style={{ fontSize: 24, fontWeight: 600, color: "#3B82F6" }}>
                {stats.avgProcessingRate}
              </div>
              <div style={{ color: "#6B7280", fontSize: 12 }}>平均处理速率 (任务/秒)</div>
            </div>
          </div>
        </Card>
      </div>

      {/* 过滤栏 */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Space>
            <Input
              placeholder="搜索队列名称..."
              prefix={<Search size={14} />}
              value={filters.keyword}
              onChange={(e) => setFilters((prev) => ({ ...prev, keyword: e.target.value }))}
              style={{ width: 240 }}
              allowClear
            />
            <Select
              placeholder="队列状态"
              value={filters.status}
              onChange={(value) => setFilters((prev) => ({ ...prev, status: value || "" }))}
              style={{ width: 120 }}
              allowClear
              options={Object.entries(QUEUE_STATUS_LABELS).map(([key, label]) => ({
                value: key,
                label,
              }))}
            />
            <Select
              placeholder="队列类型"
              value={filters.type}
              onChange={(value) => setFilters((prev) => ({ ...prev, type: value || "" }))}
              style={{ width: 140 }}
              allowClear
              options={Object.entries(QUEUE_TYPE_LABELS).map(([key, label]) => ({
                value: key,
                label,
              }))}
            />
          </Space>
          <Space>
            <Tooltip title={autoRefresh ? "自动刷新已开启 (30秒)" : "开启自动刷新"}>
              <Button
                icon={<RefreshCw size={14} />}
                type={autoRefresh ? "primary" : "default"}
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                {autoRefresh ? "自动刷新" : "手动刷新"}
              </Button>
            </Tooltip>
            <Popconfirm
              title="确认暂停所有运行中的队列？"
              onConfirm={handlePauseAll}
            >
              <Button icon={<Pause size={14} />}>暂停所有</Button>
            </Popconfirm>
            <Button icon={<Play size={14} />} onClick={handleResumeAll}>
              恢复所有
            </Button>
            <Button icon={<Download size={14} />} onClick={handleExport}>
              导出报表
            </Button>
          </Space>
        </div>
      </Card>

      {/* 队列列表 */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredQueues}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            pageSizeOptions: [10, 20, 50, 100],
          }}
          rowClassName={(record) =>
            record.status === "error" ? "row-error" : record.hasAlert ? "row-warning" : ""
          }
        />
      </Card>

      {/* 队列详情弹窗 */}
      <Modal
        title={`队列详情: ${selectedQueue?.name}`}
        open={detailModalOpen}
        onCancel={() => {
          setDetailModalOpen(false);
          setSelectedQueue(null);
        }}
        footer={null}
        width={800}
      >
        {selectedQueue && (
          <div>
            {/* 基本信息 */}
            <Card title="基本信息" size="small" style={{ marginBottom: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <span style={{ color: "#6B7280" }}>队列类型:</span>{" "}
                  <Tag>{QUEUE_TYPE_LABELS[selectedQueue.type]}</Tag>
                </div>
                <div>
                  <span style={{ color: "#6B7280" }}>当前状态:</span>{" "}
                  <Badge
                    status={QUEUE_STATUS_COLORS[selectedQueue.status]}
                    text={QUEUE_STATUS_LABELS[selectedQueue.status]}
                  />
                </div>
                <div>
                  <span style={{ color: "#6B7280" }}>队列长度:</span>{" "}
                  <span style={{ color: selectedQueue.hasAlert ? "#EF4444" : undefined }}>
                    {selectedQueue.queueLength}
                  </span>
                  {selectedQueue.hasAlert && (
                    <AlertTriangle size={14} style={{ marginLeft: 4, color: "#EF4444" }} />
                  )}
                </div>
                <div>
                  <span style={{ color: "#6B7280" }}>处理中:</span>{" "}
                  {selectedQueue.processingCount}
                </div>
                <div>
                  <span style={{ color: "#6B7280" }}>处理速率:</span>{" "}
                  {selectedQueue.processingRate} 任务/秒
                </div>
                <div>
                  <span style={{ color: "#6B7280" }}>平均等待:</span>{" "}
                  {formatWaitTime(selectedQueue.avgWaitTime)}
                </div>
                <div>
                  <span style={{ color: "#6B7280" }}>堆积告警阈值:</span>{" "}
                  {selectedQueue.alertThreshold}
                </div>
                <div>
                  <span style={{ color: "#6B7280" }}>最大容量:</span>{" "}
                  {selectedQueue.maxCapacity}
                </div>
              </div>
            </Card>

            {/* 容量趋势图表 */}
            <Card title="容量趋势 (最近1小时)" size="small" style={{ marginBottom: 16 }}>
              <SimpleTrendChart data={selectedQueue.capacityTrend} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6B7280", marginTop: 8 }}>
                <span>{selectedQueue.capacityTrend[0]?.time}</span>
                <span>{selectedQueue.capacityTrend[selectedQueue.capacityTrend.length - 1]?.time}</span>
              </div>
            </Card>

            {/* 队列任务列表 */}
            <Card title="当前队列任务" size="small">
              <Table
                columns={[
                  {
                    title: "任务名称",
                    dataIndex: "name",
                    key: "name",
                  },
                  {
                    title: "状态",
                    dataIndex: "status",
                    key: "status",
                    render: (status: string) => {
                      const colors: Record<string, string> = {
                        waiting: "default",
                        processing: "processing",
                        completed: "success",
                        failed: "error",
                      };
                      return (
                        <Tag color={colors[status]}>
                          {QUEUE_TASK_STATUS_LABELS[status as keyof typeof QUEUE_TASK_STATUS_LABELS]}
                        </Tag>
                      );
                    },
                  },
                  {
                    title: "入队时间",
                    dataIndex: "enqueueTime",
                    key: "enqueueTime",
                  },
                  {
                    title: "优先级",
                    dataIndex: "priority",
                    key: "priority",
                    render: (priority: string) => (
                      <Tag color={PRIORITY_COLORS[priority]}>
                        {priority === "high" ? "高" : priority === "medium" ? "中" : "低"}
                      </Tag>
                    ),
                  },
                ]}
                dataSource={selectedQueue.tasks}
                rowKey="id"
                pagination={false}
                size="small"
              />
            </Card>
          </div>
        )}
      </Modal>
    </PageLayout>
  );
}