"use client";

/**
 * 项目任务管理页
 */

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Card,
  Table,
  Tag,
  Space,
  Button,
  Input,
  Select,
  Empty,
  Spin,
  Avatar,
  Modal,
  Form,
  InputNumber,
  message,
} from "antd";
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import {
  getProjectById,
  getProjectMilestones,
} from "@/services/mock/project";
import {
  mockProjectTasks,
  TASK_STATUS_LABELS,
  TASK_PRIORITY_LABELS,
} from "@/mock/project-detail";
import type { Project } from "@/types/project";
import type { ProjectTaskItem } from "@/types/project";

const taskStatusColors: Record<string, string> = {
  completed: "success",
  in_progress: "processing",
  pending: "default",
  overdue: "error",
};

const taskPriorityColors: Record<string, string> = {
  high: "red",
  medium: "orange",
  low: "default",
};

export default function ProjectTasksPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<ProjectTaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [keyword, setKeyword] = useState("");

  // Modal 状态
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "view" | "edit">("create");
  const [currentTask, setCurrentTask] = useState<ProjectTaskItem | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    setLoading(true);
    const projectData = getProjectById(projectId);
    if (projectData) {
      setProject(projectData);
      setTasks([...mockProjectTasks]);
    }
    setLoading(false);
  }, [projectId]);

  const milestones = getProjectMilestones(projectId);

  const filteredTasks = tasks.filter((task) => {
    if (statusFilter !== "all" && task.status !== statusFilter) return false;
    if (keyword && !task.name.toLowerCase().includes(keyword.toLowerCase())) return false;
    return true;
  });

  // 打开新建弹窗
  const handleCreate = () => {
    setModalMode("create");
    setCurrentTask(null);
    form.resetFields();
    setModalOpen(true);
  };

  // 打开查看弹窗
  const handleView = (task: ProjectTaskItem) => {
    setModalMode("view");
    setCurrentTask(task);
    form.setFieldsValue(task);
    setModalOpen(true);
  };

  // 打开编辑弹窗
  const handleEdit = (task: ProjectTaskItem) => {
    setModalMode("edit");
    setCurrentTask(task);
    form.setFieldsValue(task);
    setModalOpen(true);
  };

  // 删除任务
  const handleDelete = (taskId: string) => {
    Modal.confirm({
      title: "确认删除",
      content: "确定要删除该任务吗？此操作不可恢复。",
      okText: "删除",
      cancelText: "取消",
      okButtonProps: { danger: true },
      onOk: () => {
        setTasks(tasks.filter((t) => t.id !== taskId));
        message.success("任务已删除");
      },
    });
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (modalMode === "create") {
        const newTask: ProjectTaskItem = {
          id: `TASK-${Date.now()}`,
          ...values,
          status: "pending",
          assignee: { id: "user-001", name: "张三", avatar: "/avatars/user-001.png" },
        };
        setTasks([newTask, ...tasks]);
        message.success("任务创建成功");
      } else if (modalMode === "edit" && currentTask) {
        setTasks(tasks.map((t) => (t.id === currentTask.id ? { ...t, ...values } : t)));
        message.success("任务更新成功");
      }
      setModalOpen(false);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const columns = [
    {
      title: "任务名称",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: ProjectTaskItem) => (
        <a onClick={() => handleView(record)}>{name}</a>
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={taskStatusColors[status]}>
          {TASK_STATUS_LABELS[status as keyof typeof TASK_STATUS_LABELS]}
        </Tag>
      ),
    },
    {
      title: "优先级",
      dataIndex: "priority",
      key: "priority",
      render: (priority: string) => (
        <Tag color={taskPriorityColors[priority]}>
          {TASK_PRIORITY_LABELS[priority as keyof typeof TASK_PRIORITY_LABELS]}
        </Tag>
      ),
    },
    {
      title: "负责人",
      dataIndex: "assignee",
      key: "assignee",
      render: (assignee: { name: string; avatar: string }) => (
        <Space>
          <Avatar size="small" src={assignee.avatar}>
            {assignee.name[0]}
          </Avatar>
          <span>{assignee.name}</span>
        </Space>
      ),
    },
    {
      title: "里程碑",
      dataIndex: "milestoneId",
      key: "milestoneId",
      render: (milestoneId: string) => {
        const ms = milestones.find((m) => m.id === milestoneId);
        return ms?.name || "-";
      },
    },
    {
      title: "截止日期",
      dataIndex: "dueDate",
      key: "dueDate",
    },
    {
      title: "操作",
      key: "action",
      render: (_: unknown, record: ProjectTaskItem) => (
        <Space>
          <Button type="link" size="small" icon={<Eye size={14} />} onClick={() => handleView(record)}>
            查看
          </Button>
          <Button type="link" size="small" icon={<Edit size={14} />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" size="small" danger icon={<Trash2 size={14} />} onClick={() => handleDelete(record.id)}>
            删除
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
    <>
      <Card
        title="任务管理"
        extra={
          <Button type="primary" icon={<Plus size={16} />} onClick={handleCreate}>
            新增任务
          </Button>
        }
      >
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Input
              placeholder="搜索任务名称"
              prefix={<Search size={16} />}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={{ width: 200 }}
            />
            <Select
              placeholder="状态筛选"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 120 }}
              options={[
                { label: "全部状态", value: "all" },
                { label: "已完成", value: "completed" },
                { label: "进行中", value: "in_progress" },
                { label: "待开始", value: "pending" },
                { label: "已逾期", value: "overdue" },
              ]}
            />
          </Space>
        </div>

        <Table
          dataSource={filteredTasks}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={modalMode === "create" ? "新增任务" : modalMode === "edit" ? "编辑任务" : "任务详情"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={modalMode === "view" ? () => setModalOpen(false) : handleSubmit}
        okText={modalMode === "create" ? "创建" : modalMode === "edit" ? "保存" : "确定"}
        cancelText="取消"
        width={600}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }} disabled={modalMode === "view"}>
          <Form.Item name="name" label="任务名称" rules={[{ required: true, message: "请输入任务名称" }]}>
            <Input placeholder="请输入任务名称" />
          </Form.Item>
          <Form.Item name="priority" label="优先级" rules={[{ required: true, message: "请选择优先级" }]}>
            <Select
              placeholder="请选择优先级"
              options={[
                { label: "高", value: "high" },
                { label: "中", value: "medium" },
                { label: "低", value: "low" },
              ]}
            />
          </Form.Item>
          <Form.Item name="milestoneId" label="关联里程碑">
            <Select
              placeholder="请选择里程碑"
              allowClear
              options={milestones.map((m) => ({ label: m.name, value: m.id }))}
            />
          </Form.Item>
          <Form.Item name="dueDate" label="截止日期" rules={[{ required: true, message: "请选择截止日期" }]}>
            <Input type="date" />
          </Form.Item>
          <Form.Item name="description" label="任务描述">
            <Input.TextArea rows={3} placeholder="请输入任务描述" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}