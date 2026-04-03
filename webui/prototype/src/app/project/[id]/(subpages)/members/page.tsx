"use client";

/**
 * 项目成员管理页
 */

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Card,
  Table,
  Space,
  Button,
  Avatar,
  Empty,
  Spin,
  Popconfirm,
  Select,
  Modal,
  Form,
  message,
  Typography,
} from "antd";
import {
  UserPlus,
  Trash2,
} from "lucide-react";
import {
  getProjectById,
  getProjectMembers,
} from "@/services/mock/project";
import { mockUsers } from "@/services/mock/system";
import type { Project, ProjectMember, ProjectMemberRole } from "@/types/project";

const { Text } = Typography;

// 可选用户列表
const availableUsers = mockUsers
  .filter((u) => u.status === "normal")
  .map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    orgName: u.orgName || "未分配",
  }));

export default function ProjectMembersPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal 状态
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    setLoading(true);
    const projectData = getProjectById(projectId);
    if (projectData) {
      setProject(projectData);
      setMembers(getProjectMembers(projectId));
    }
    setLoading(false);
  }, [projectId]);

  // 角色变更
  const handleRoleChange = (memberId: string, newRole: ProjectMemberRole) => {
    // 如果是将项目经理改为其他角色，需要确认
    const member = members.find((m) => m.id === memberId);
    if (member?.role === "manager" && newRole !== "manager") {
      Modal.confirm({
        title: "确认变更角色",
        content: "更改项目经理角色可能导致项目管理权限变更，确定要继续吗？",
        okText: "确认",
        cancelText: "取消",
        onOk: () => {
          setMembers(members.map((m) =>
            m.id === memberId ? { ...m, role: newRole } : m
          ));
          message.success("角色已变更");
        },
      });
    } else {
      setMembers(members.map((m) =>
        m.id === memberId ? { ...m, role: newRole } : m
      ));
      message.success("角色已变更");
    }
  };

  // 移除成员
  const handleRemoveMember = (memberId: string, memberName: string) => {
    const member = members.find((m) => m.id === memberId);
    if (member?.role === "manager") {
      Modal.info({
        title: "无法移除项目经理",
        content: "请先变更项目经理角色后再移除该成员。",
        okText: "知道了",
      });
      return;
    }

    Modal.confirm({
      title: "确认移除成员",
      content: `确定要将「${memberName}」从项目中移除吗？移除后该成员将无法访问项目。`,
      okText: "确认移除",
      cancelText: "取消",
      okButtonProps: { danger: true },
      onOk: () => {
        setMembers(members.filter((m) => m.id !== memberId));
        message.success("成员已移除");
      },
    });
  };

  // 打开添加成员弹窗
  const handleAddMember = () => {
    form.resetFields();
    setAddModalOpen(true);
  };

  // 确认添加成员
  const handleAddConfirm = async () => {
    try {
      const values = await form.validateFields();
      const user = availableUsers.find((u) => u.id === values.userId);

      if (!user) {
        message.error("用户不存在");
        return;
      }

      // 检查是否已在项目中
      if (members.some((m) => m.userId === values.userId)) {
        message.warning("该用户已在项目中");
        return;
      }

      const newMember: ProjectMember = {
        id: `member-${Date.now()}`,
        userId: user.id,
        userName: user.name,
        userAvatar: `/avatars/${user.id}.png`,
        role: values.role,
        joinedAt: new Date().toISOString().split("T")[0],
      };

      setMembers([...members, newMember]);
      message.success(`已添加 ${user.name} 到项目`);
      setAddModalOpen(false);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const columns = [
    {
      title: "成员",
      key: "member",
      render: (_: unknown, record: ProjectMember) => (
        <Space>
          <Avatar src={record.userAvatar} size="default">
            {record.userName[0]}
          </Avatar>
          <div>
            <div style={{ fontWeight: 500 }}>{record.userName}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.userId}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "角色",
      dataIndex: "role",
      key: "role",
      render: (role: ProjectMemberRole, record: ProjectMember) => (
        <Select
          value={role}
          onChange={(value) => handleRoleChange(record.id, value)}
          style={{ width: 120 }}
          size="small"
          options={[
            { label: "项目经理", value: "manager" },
            { label: "项目成员", value: "member" },
            { label: "只读者", value: "viewer" },
          ]}
        />
      ),
    },
    {
      title: "加入时间",
      dataIndex: "joinedAt",
      key: "joinedAt",
    },
    {
      title: "操作",
      key: "action",
      render: (_: unknown, record: ProjectMember) => (
        <Button
          type="text"
          danger
          size="small"
          icon={<Trash2 size={14} />}
          onClick={() => handleRemoveMember(record.id, record.userName)}
        >
          移除
        </Button>
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
        title={`项目成员 (${members.length}人)`}
        extra={
          <Button type="primary" icon={<UserPlus size={16} />} onClick={handleAddMember}>
            添加成员
          </Button>
        }
      >
        <Table
          dataSource={members}
          columns={columns}
          rowKey="id"
          pagination={false}
        />
      </Card>

      <Modal
        title="添加成员"
        open={addModalOpen}
        onCancel={() => setAddModalOpen(false)}
        onOk={handleAddConfirm}
        okText="添加"
        cancelText="取消"
        width={500}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="userId"
            label="选择用户"
            rules={[{ required: true, message: "请选择要添加的用户" }]}
          >
            <Select
              placeholder="请选择用户"
              showSearch
              optionFilterProp="label"
              options={availableUsers.map((u) => ({
                label: `${u.name} (${u.email})`,
                value: u.id,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: "请选择角色" }]}
            initialValue="member"
          >
            <Select
              placeholder="请选择角色"
              options={[
                { label: "项目经理", value: "manager" },
                { label: "项目成员", value: "member" },
                { label: "只读者", value: "viewer" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}