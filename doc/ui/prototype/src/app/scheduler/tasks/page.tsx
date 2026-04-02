"use client";

/**
 * 任务运维列表页
 * 页面路径: /scheduler/tasks
 */

import { useState, useMemo, useEffect } from "react";
import { Card, Table, Tag, Button, Space, Input, Select, DatePicker, Badge, Tooltip, Modal } from "antd";
import { Search, RefreshCw, Download, Play, Eye, Edit, Power, AlertTriangle } from "lucide-react";

import { PageLayout } from "@/components/layout";
import { PageBreadcrumb } from "@/components/ui";
import { ROUTES } from "@/constants";
import { mockTaskOperations, filterTaskOperations, TASK_STATUS_LABELS } from "@/services/mock/task-operation";
import { exportTaskReport } from "@/services/export";
import { DAG_NODE_TYPE_LABELS } from "@/types/scheduler";
import type { TaskOperation, TaskExecutionStatus } from "@/services/mock/task-operation";

/**
 * 面包屑配置
 */
const BREADCRUMB_ITEMS = [
  { title: "任务调度", href: ROUTES.SCHEDULER },
  { title: "任务运维" },
];

/**
 * 任务状态颜色
 */
const TASK_STATUS_COLORS: Record<TaskExecutionStatus, "success" | "error" | "processing" | "default"> = {
  success: "success",
  failed: "error",
  running: "processing",
  pending: "default",
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
 * 任务运维页面组件
 */
export default function TaskOperationPage() {
  const [filters, setFilters] = useState<{
    keyword: string;
    status: TaskExecutionStatus | "";
    scheduleType: string;
  }>({
    keyword: "",
    status: "",
    scheduleType: "",
  });

  const [autoRefresh, setAutoRefresh] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskOperation | null>(null);

  /**
   * 过滤后的任务列表
   */
  const filteredTasks = useMemo(() => {
    return filterTaskOperations(filters);
  }, [filters]);

  /**
   * 自动刷新
   */
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // 实际项目中调用API刷新数据
      console.log("Auto refresh tasks...");
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  /**
   * 重新执行任务
   */
  const handleReExecute = (task: TaskOperation) => {
    // 实际项目中调用API重新执行
    console.log("Re-execute task:", task.id);
  };

  /**
   * 查看任务详情
   */
  const handleViewDetail = (task: TaskOperation) => {
    setSelectedTask(task);
    setDetailModalOpen(true);
  };

  /**
   * 下线任务
   */
  const handleOffline = (task: TaskOperation) => {
    // 实际项目中调用API下线任务
    console.log("Offline task:", task.id);
  };

  /**
   * 导出任务运维报表
   */
  const handleExportReport = () => {
    // 使用当前过滤后的任务列表生成报表
    const timestamp = new Date().toISOString().slice(0, 10);
    exportTaskReport(filteredTasks, `任务运维报表_${timestamp}`);
  };

  /**
   * 表格列定义
   */
  const columns = [
    {
      title: "任务名称",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: TaskOperation) => (
        <a style={{ color: "#2563EB" }} onClick={() => handleViewDetail(record)}>
          {name}
        </a>
      ),
    },
    {
      title: "任务类型",
      dataIndex: "type",
      key: "type",
      render: (type: string) => <Tag>{type}</Tag>,
    },
    {
      title: "调度类型",
      dataIndex: "scheduleType",
      key: "scheduleType",
      render: (type: string) => (
        <Tag color={type === "cron" ? "blue" : type === "event" ? "green" : "orange"}>
          {type === "cron" ? "定时" : type === "event" ? "事件" : "依赖"}
        </Tag>
      ),
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
    {
      title: "最后执行时间",
      dataIndex: "lastExecutionTime",
      key: "lastExecutionTime",
    },
    {
      title: "最后执行状态",
      dataIndex: "lastExecutionStatus",
      key: "lastExecutionStatus",
      render: (status: TaskExecutionStatus) => (
        <Badge status={TASK_STATUS_COLORS[status]} text={TASK_STATUS_LABELS[status]} />
      ),
    },
    {
      title: "当前状态",
      dataIndex: "onlineStatus",
      key: "onlineStatus",
      render: (status: string) => (
        <Tag color={status === "online" ? "success" : "default"}>
          {status === "online" ? "在线" : "下线"}
        </Tag>
      ),
    },
    {
      title: "操作",
      key: "actions",
      render: (_: unknown, record: TaskOperation) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<Eye size={14} />}
            onClick={() => handleViewDetail(record)}
          >
            日志
          </Button>
          {record.onlineStatus === "online" && (
            <Button
              type="text"
              size="small"
              icon={<Play size={14} />}
              onClick={() => handleReExecute(record)}
            >
              执行
            </Button>
          )}
          <Button type="text" size="small" icon={<Edit size={14} />}>
            修改
          </Button>
          {record.onlineStatus === "online" && (
            <Button
              type="text"
              size="small"
              danger
              icon={<Power size={14} />}
              onClick={() => handleOffline(record)}
            >
              下线
            </Button>
          )}
        </Space>
      ),
    },
  ];

  /**
   * 统计数据
   */
  const stats = useMemo(() => {
    const success = filteredTasks.filter((t) => t.lastExecutionStatus === "success").length;
    const failed = filteredTasks.filter((t) => t.lastExecutionStatus === "failed").length;
    const running = filteredTasks.filter((t) => t.lastExecutionStatus === "running").length;
    return { success, failed, running, total: filteredTasks.length };
  }, [filteredTasks]);

  return (
    <PageLayout title="任务运维">
      <PageBreadcrumb items={BREADCRUMB_ITEMS} />

      {/* 统计卡片 */}
      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        <Card style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Badge status="success" />
            <div>
              <div style={{ fontSize: 24, fontWeight: 600 }}>{stats.success}</div>
              <div style={{ color: "#6B7280", fontSize: 12 }}>执行成功</div>
            </div>
          </div>
        </Card>
        <Card style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Badge status="error" />
            <div>
              <div style={{ fontSize: 24, fontWeight: 600, color: "#EF4444" }}>{stats.failed}</div>
              <div style={{ color: "#6B7280", fontSize: 12 }}>执行失败</div>
            </div>
          </div>
        </Card>
        <Card style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Badge status="processing" />
            <div>
              <div style={{ fontSize: 24, fontWeight: 600, color: "#3B82F6" }}>{stats.running}</div>
              <div style={{ color: "#6B7280", fontSize: 12 }}>运行中</div>
            </div>
          </div>
        </Card>
        <Card style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Badge status="default" />
            <div>
              <div style={{ fontSize: 24, fontWeight: 600 }}>{stats.total}</div>
              <div style={{ color: "#6B7280", fontSize: 12 }}>任务总数</div>
            </div>
          </div>
        </Card>
      </div>

      {/* 过滤栏 */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Space>
            <Input
              placeholder="搜索任务名称..."
              prefix={<Search size={14} />}
              value={filters.keyword}
              onChange={(e) => setFilters((prev) => ({ ...prev, keyword: e.target.value }))}
              style={{ width: 240 }}
              allowClear
            />
            <Select
              placeholder="执行状态"
              value={filters.status}
              onChange={(value) => setFilters((prev) => ({ ...prev, status: value || "" }))}
              style={{ width: 120 }}
              allowClear
              options={Object.entries(TASK_STATUS_LABELS).map(([key, label]) => ({
                value: key,
                label,
              }))}
            />
            <Select
              placeholder="调度类型"
              value={filters.scheduleType}
              onChange={(value) => setFilters((prev) => ({ ...prev, scheduleType: value || "" }))}
              style={{ width: 120 }}
              allowClear
              options={[
                { value: "cron", label: "定时" },
                { value: "event", label: "事件" },
                { value: "dependency", label: "依赖" },
              ]}
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
            <Button icon={<Download size={14} />} onClick={handleExportReport}>
              导出报表
            </Button>
          </Space>
        </div>
      </Card>

      {/* 任务列表 */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredTasks}
          rowKey="id"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
          rowClassName={(record) =>
            record.lastExecutionStatus === "failed" ? "row-error" : ""
          }
        />
      </Card>

      {/* 任务详情弹窗 */}
      <Modal
        title={selectedTask?.name}
        open={detailModalOpen}
        onCancel={() => {
          setDetailModalOpen(false);
          setSelectedTask(null);
        }}
        footer={null}
        width={700}
      >
        {selectedTask && (
          <div>
            <Card title="基本信息" size="small" style={{ marginBottom: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <span style={{ color: "#6B7280" }}>任务类型:</span>{" "}
                  <Tag>{selectedTask.type}</Tag>
                </div>
                <div>
                  <span style={{ color: "#6B7280" }}>调度类型:</span>{" "}
                  <Tag color={selectedTask.scheduleType === "cron" ? "blue" : "orange"}>
                    {selectedTask.scheduleType === "cron" ? "定时" : "依赖"}
                  </Tag>
                </div>
                <div>
                  <span style={{ color: "#6B7280" }}>优先级:</span>{" "}
                  <Tag color={PRIORITY_COLORS[selectedTask.priority]}>
                    {selectedTask.priority === "high" ? "高" : "中"}
                  </Tag>
                </div>
                <div>
                  <span style={{ color: "#6B7280" }}>状态:</span>{" "}
                  <Tag color={selectedTask.onlineStatus === "online" ? "success" : "default"}>
                    {selectedTask.onlineStatus === "online" ? "在线" : "下线"}
                  </Tag>
                </div>
              </div>
            </Card>

            {selectedTask.errorMessage && (
              <Card title="错误信息" size="small" style={{ marginBottom: 16 }}>
                <div style={{ color: "#EF4444" }}>
                  <AlertTriangle size={16} style={{ marginRight: 8 }} />
                  {selectedTask.errorMessage}
                </div>
              </Card>
            )}

            <Card title="执行历史" size="small">
              <div style={{ color: "#6B7280" }}>
                最后执行: {selectedTask.lastExecutionTime}
                <Badge
                  status={TASK_STATUS_COLORS[selectedTask.lastExecutionStatus]}
                  text={TASK_STATUS_LABELS[selectedTask.lastExecutionStatus]}
                  style={{ marginLeft: 12 }}
                />
              </div>
            </Card>
          </div>
        )}
      </Modal>
    </PageLayout>
  );
}