"use client";

/**
 * 项目里程碑管理页
 */

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Card,
  Table,
  Tag,
  Space,
  Button,
  Empty,
  Spin,
  Progress,
  Modal,
  Form,
  Input,
  DatePicker,
  message,
} from "antd";
import {
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  Edit,
  Trash2,
} from "lucide-react";
import {
  getProjectById,
  getProjectMilestones,
} from "@/services/mock/project";
import { MILESTONE_STATUS_LABELS } from "@/types/project";
import type { Project, ProjectMilestone } from "@/types/project";

const milestoneStatusColors: Record<string, string> = {
  completed: "success",
  in_progress: "processing",
  pending: "default",
  delayed: "error",
};

const milestoneStatusIcons: Record<string, React.ReactNode> = {
  completed: <CheckCircle size={16} style={{ color: "#10B981" }} />,
  in_progress: <Clock size={16} style={{ color: "#3B82F6" }} />,
  pending: <Clock size={16} style={{ color: "#6B7280" }} />,
  delayed: <AlertCircle size={16} style={{ color: "#EF4444" }} />,
};

export default function ProjectMilestonesPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal 状态
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [currentMilestone, setCurrentMilestone] = useState<ProjectMilestone | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    setLoading(true);
    const projectData = getProjectById(projectId);
    if (projectData) {
      setProject(projectData);
      setMilestones(getProjectMilestones(projectId));
    }
    setLoading(false);
  }, [projectId]);

  // 打开新建弹窗
  const handleCreate = () => {
    setModalMode("create");
    setCurrentMilestone(null);
    form.resetFields();
    setModalOpen(true);
  };

  // 打开编辑弹窗
  const handleEdit = (milestone: ProjectMilestone) => {
    setModalMode("edit");
    setCurrentMilestone(milestone);
    form.setFieldsValue({
      name: milestone.name,
      description: milestone.description,
      plannedDate: milestone.plannedDate,
    });
    setModalOpen(true);
  };

  // 完成里程碑
  const handleComplete = (milestone: ProjectMilestone) => {
    Modal.confirm({
      title: "确认完成里程碑",
      content: `确定要将「${milestone.name}」标记为已完成吗？`,
      okText: "确认完成",
      cancelText: "取消",
      onOk: () => {
        setMilestones(milestones.map((m) =>
          m.id === milestone.id
            ? { ...m, status: "completed" as const, actualDate: new Date().toISOString().split("T")[0] }
            : m
        ));
        message.success("里程碑已完成");
      },
    });
  };

  // 删除里程碑
  const handleDelete = (milestoneId: string) => {
    Modal.confirm({
      title: "确认删除",
      content: "确定要删除该里程碑吗？此操作不可恢复。",
      okText: "删除",
      cancelText: "取消",
      okButtonProps: { danger: true },
      onOk: () => {
        setMilestones(milestones.filter((m) => m.id !== milestoneId));
        message.success("里程碑已删除");
      },
    });
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (modalMode === "create") {
        const newMilestone: ProjectMilestone = {
          id: `ms-${Date.now()}`,
          projectId,
          name: values.name,
          description: values.description,
          status: "pending",
          plannedDate: values.plannedDate,
          createdAt: new Date().toISOString().split("T")[0],
        };
        setMilestones([...milestones, newMilestone]);
        message.success("里程碑创建成功");
      } else if (modalMode === "edit" && currentMilestone) {
        setMilestones(milestones.map((m) =>
          m.id === currentMilestone.id ? { ...m, ...values } : m
        ));
        message.success("里程碑更新成功");
      }
      setModalOpen(false);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const columns = [
    {
      title: "里程碑名称",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: ProjectMilestone) => (
        <Space>
          {milestoneStatusIcons[record.status]}
          <a onClick={() => handleEdit(record)}>{name}</a>
        </Space>
      ),
    },
    {
      title: "描述",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={milestoneStatusColors[status]}>
          {MILESTONE_STATUS_LABELS[status as keyof typeof MILESTONE_STATUS_LABELS]}
        </Tag>
      ),
    },
    {
      title: "计划完成日期",
      dataIndex: "plannedDate",
      key: "plannedDate",
    },
    {
      title: "实际完成日期",
      dataIndex: "actualDate",
      key: "actualDate",
      render: (date: string | undefined) => date || "-",
    },
    {
      title: "进度",
      key: "progress",
      render: (_: unknown, record: ProjectMilestone) => {
        const progress = record.status === "completed" ? 100 : record.status === "in_progress" ? 50 : 0;
        return <Progress percent={progress} size="small" />;
      },
    },
    {
      title: "操作",
      key: "action",
      render: (_: unknown, record: ProjectMilestone) => (
        <Space>
          {record.status !== "completed" && (
            <Button
              type="link"
              size="small"
              icon={<CheckCircle size={14} />}
              onClick={() => handleComplete(record)}
            >
              完成
            </Button>
          )}
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

  const completedCount = milestones.filter((m) => m.status === "completed").length;
  const totalCount = milestones.length;

  return (
    <>
      <Card
        title={`里程碑 (${completedCount}/${totalCount} 已完成)`}
        extra={
          <Button type="primary" icon={<Plus size={16} />} onClick={handleCreate}>
            新增里程碑
          </Button>
        }
      >
        <Table
          dataSource={milestones}
          columns={columns}
          rowKey="id"
          pagination={false}
        />
      </Card>

      <Modal
        title={modalMode === "create" ? "新增里程碑" : "编辑里程碑"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        okText={modalMode === "create" ? "创建" : "保存"}
        cancelText="取消"
        width={600}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="里程碑名称" rules={[{ required: true, message: "请输入里程碑名称" }]}>
            <Input placeholder="请输入里程碑名称" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="请输入里程碑描述" />
          </Form.Item>
          <Form.Item name="plannedDate" label="计划完成日期" rules={[{ required: true, message: "请选择计划完成日期" }]}>
            <Input type="date" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}