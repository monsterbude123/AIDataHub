"use client";

/**
 * 项目调度中心页面
 * 作为调度模块入口，展示 DAG 列表和快速操作
 */

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Table,
  Tag,
  Space,
  Button,
  Empty,
  Spin,
  Typography,
} from "antd";
import {
  Plus,
  Workflow,
  Clock,
  FileText,
  Play,
  Pause,
} from "lucide-react";
import { getProjectById } from "@/services/mock/project";
import type { Project } from "@/types/project";

const { Title, Text } = Typography;

interface DAGListItem {
  id: string;
  name: string;
  status: "running" | "paused" | "completed" | "failed" | "draft";
  scheduleType: "cron" | "manual" | "event";
  lastRunTime?: string;
  nextRunTime?: string;
  taskCount: number;
  successRate: number;
}

const dagStatusColors: Record<string, string> = {
  running: "processing",
  paused: "warning",
  completed: "success",
  failed: "error",
  draft: "default",
};

const dagStatusLabels: Record<string, string> = {
  running: "运行中",
  paused: "已暂停",
  completed: "已完成",
  failed: "已失败",
  draft: "草稿",
};

const scheduleTypeLabels: Record<string, string> = {
  cron: "定时调度",
  manual: "手动触发",
  event: "事件触发",
};

// Mock DAG 数据
const mockDAGList: DAGListItem[] = [
  {
    id: "dag-001",
    name: "数据采集工作流",
    status: "running",
    scheduleType: "cron",
    lastRunTime: "2024-03-28 02:00:00",
    nextRunTime: "2024-03-29 02:00:00",
    taskCount: 12,
    successRate: 98,
  },
  {
    id: "dag-002",
    name: "数据清洗流程",
    status: "paused",
    scheduleType: "event",
    lastRunTime: "2024-03-25 15:30:00",
    taskCount: 8,
    successRate: 95,
  },
  {
    id: "dag-003",
    name: "报表生成任务",
    status: "draft",
    scheduleType: "manual",
    taskCount: 5,
    successRate: 0,
  },
  {
    id: "dag-004",
    name: "数据同步工作流",
    status: "completed",
    scheduleType: "cron",
    lastRunTime: "2024-03-27 06:00:00",
    taskCount: 15,
    successRate: 100,
  },
];

export default function ProjectSchedulerPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const projectData = getProjectById(projectId);
    if (projectData) {
      setProject(projectData);
    }
    setLoading(false);
  }, [projectId]);

  const handleCreateDAG = () => {
    router.push(`/project/${projectId}/scheduler/dag?action=create`);
  };

  const handleViewDAG = (dagId: string) => {
    router.push(`/project/${projectId}/scheduler/dag/${dagId}`);
  };

  const handleViewTasks = () => {
    router.push(`/project/${projectId}/scheduler/tasks`);
  };

  const handleViewLogs = () => {
    router.push(`/project/${projectId}/scheduler/logs`);
  };

  const handleToggleDAG = (dagId: string, currentStatus: string) => {
    // Mock: 切换运行/暂停状态
    console.log(`Toggle DAG ${dagId} from ${currentStatus}`);
  };

  const columns = [
    {
      title: "DAG 名称",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: DAGListItem) => (
        <a onClick={() => handleViewDAG(record.id)}>{name}</a>
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={dagStatusColors[status]}>
          {dagStatusLabels[status]}
        </Tag>
      ),
    },
    {
      title: "调度方式",
      dataIndex: "scheduleType",
      key: "scheduleType",
      render: (type: string) => scheduleTypeLabels[type],
    },
    {
      title: "任务数",
      dataIndex: "taskCount",
      key: "taskCount",
    },
    {
      title: "成功率",
      dataIndex: "successRate",
      key: "successRate",
      render: (rate: number) => `${rate}%`,
    },
    {
      title: "最近运行",
      dataIndex: "lastRunTime",
      key: "lastRunTime",
      render: (time: string | undefined) => time || "-",
    },
    {
      title: "下次运行",
      dataIndex: "nextRunTime",
      key: "nextRunTime",
      render: (time: string | undefined) => time || "-",
    },
    {
      title: "操作",
      key: "action",
      render: (_: unknown, record: DAGListItem) => (
        <Space>
          {record.status === "running" && (
            <Button
              type="text"
              size="small"
              icon={<Pause size={14} />}
              onClick={() => handleToggleDAG(record.id, record.status)}
            >
              暂停
            </Button>
          )}
          {record.status === "paused" && (
            <Button
              type="text"
              size="small"
              icon={<Play size={14} />}
              onClick={() => handleToggleDAG(record.id, record.status)}
            >
              启动
            </Button>
          )}
          <Button type="link" size="small" onClick={() => handleViewDAG(record.id)}>
            编辑
          </Button>
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 48 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!project) {
    return <Empty description="项目不存在" />;
  }

  return (
    <Row gutter={16}>
      <Col span={24}>
        <Card
          title="DAG 工作流列表"
          extra={
            <Space>
              <Button onClick={handleViewTasks} icon={<Clock size={16} />}>
                任务列表
              </Button>
              <Button onClick={handleViewLogs} icon={<FileText size={16} />}>
                运行日志
              </Button>
              <Button type="primary" icon={<Plus size={16} />} onClick={handleCreateDAG}>
                新建 DAG
              </Button>
            </Space>
          }
        >
          <Table
            dataSource={mockDAGList}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Card>
      </Col>
    </Row>
  );
}