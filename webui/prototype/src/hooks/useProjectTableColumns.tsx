"use client";

/**
 * 项目表格列配置 Hook
 * 定义项目列表页的表格列配置
 */

import type { TableColumnsType } from "antd";
import { Progress, Tag, Avatar, Button, Space, Popconfirm, Typography } from "antd";
import Link from "next/link";
import { Eye, Edit, Archive, Trash2, Users, Calendar } from "lucide-react";
import { ROUTES } from "@/constants";
import type { Project, ProjectStatus, ProjectPhase } from "@/types/project";
import {
  PROJECT_STATUS_LABELS,
  PROJECT_PHASE_LABELS,
  PROJECT_STATUS_COLORS,
  PROJECT_PHASE_COLORS,
} from "@/types/project";

const { Text } = Typography;

/**
 * 项目操作回调接口
 */
interface ProjectActions {
  onView: (project: Project) => void;
  onEdit: (project: Project) => void;
  onArchive: (project: Project) => void;
  onDelete: (project: Project) => void;
}

/**
 * 获取项目表格列配置
 */
export function useProjectTableColumns(actions: ProjectActions): TableColumnsType<Project> {
  return [
    {
      key: "code",
      title: "项目编号",
      dataIndex: "code",
      width: 120,
      render: (code: string) => (
        <Link href={`${ROUTES.PROJECT}/${code}`} style={{ color: "#2563EB" }}>
          {code}
        </Link>
      ),
    },
    {
      key: "name",
      title: "项目名称",
      dataIndex: "name",
      width: 200,
      ellipsis: true,
      render: (name: string, record) => (
        <Link href={`${ROUTES.PROJECT}/${record.id}`} style={{ color: "#1E293B", fontWeight: 500 }}>
          {name}
        </Link>
      ),
    },
    {
      key: "phase",
      title: "当前阶段",
      dataIndex: "phase",
      width: 100,
      render: (phase: ProjectPhase) => (
        <Tag color={PROJECT_PHASE_COLORS[phase]}>
          {PROJECT_PHASE_LABELS[phase]}
        </Tag>
      ),
    },
    {
      key: "progress",
      title: "进度",
      dataIndex: "progress",
      width: 120,
      render: (progress: number) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Progress
            percent={progress}
            size="small"
            style={{ width: 80 }}
            strokeColor={progress >= 100 ? "#10B981" : progress >= 50 ? "#3B82F6" : "#F59E0B"}
          />
          <Text style={{ fontSize: 12 }}>{progress}%</Text>
        </div>
      ),
    },
    {
      key: "managerName",
      title: "负责人",
      dataIndex: "managerName",
      width: 120,
      render: (managerName: string) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Avatar size={24} style={{ backgroundColor: "#2563EB" }}>
            {managerName.charAt(0)}
          </Avatar>
          <Text>{managerName}</Text>
        </div>
      ),
    },
    {
      key: "memberCount",
      title: "成员数",
      dataIndex: "memberCount",
      width: 80,
      align: "center",
      render: (count: number) => (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
          <Users size={14} style={{ color: "#6B7280" }} />
          <Text>{count}</Text>
        </div>
      ),
    },
    {
      key: "tasks",
      title: "任务数",
      width: 100,
      align: "center",
      render: (_, record) => (
        <Text>
          {record.completedTasks}/{record.totalTasks}
        </Text>
      ),
    },
    {
      key: "startDate",
      title: "开始时间",
      dataIndex: "startDate",
      width: 120,
      render: (date: string) => (
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Calendar size={14} style={{ color: "#6B7280" }} />
          <Text style={{ fontSize: 12 }}>{date}</Text>
        </div>
      ),
    },
    {
      key: "expectedEndDate",
      title: "预计完成",
      dataIndex: "expectedEndDate",
      width: 120,
      render: (date: string) => (
        <Text style={{ fontSize: 12 }}>{date}</Text>
      ),
    },
    {
      key: "status",
      title: "状态",
      dataIndex: "status",
      width: 100,
      render: (status: ProjectStatus) => (
        <Tag color={PROJECT_STATUS_COLORS[status]}>
          {PROJECT_STATUS_LABELS[status]}
        </Tag>
      ),
    },
    {
      key: "actions",
      title: "操作",
      width: 150,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<Eye size={14} />}
            onClick={() => actions.onView(record)}
            title="查看详情"
          />
          <Button
            type="text"
            size="small"
            icon={<Edit size={14} />}
            onClick={() => actions.onEdit(record)}
            title="编辑"
          />
          {record.status === "completed" && (
            <Button
              type="text"
              size="small"
              icon={<Archive size={14} />}
              onClick={() => actions.onArchive(record)}
              title="归档"
            />
          )}
          <Popconfirm
            title="确认删除此项目？"
            description="删除后数据将无法恢复"
            onConfirm={() => actions.onDelete(record)}
            okText="删除"
            cancelText="取消"
          >
            <Button
              type="text"
              size="small"
              danger
              icon={<Trash2 size={14} />}
              title="删除"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];
}