"use client";

/**
 * 项目详情概览页
 * 展示项目基本信息、关键指标和最近动态
 */

import { useParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Timeline,
  Empty,
  Spin,
  List,
  Tag,
  Space,
} from "antd";
import {
  Layers,
  CheckCircle,
  AlertCircle,
  FileText,
  Users,
  Clock,
  Calendar,
} from "lucide-react";

import {
  getProjectById,
  getProjectActivities,
} from "@/services/mock/project";
import type { Project, ProjectActivity } from "@/types/project";
import {
  PROJECT_ACTIVITY_TYPE_LABELS,
} from "@/types/project";

const { Title, Text, Paragraph } = Typography;

/**
 * 动态图标映射
 */
const getActivityIcon = (type: ProjectActivity["type"]) => {
  switch (type) {
    case "phase_change":
      return <Layers size={16} style={{ color: "#2563EB" }} />;
    case "milestone_complete":
      return <CheckCircle size={16} style={{ color: "#10B981" }} />;
    case "document_upload":
      return <FileText size={16} style={{ color: "#F59E0B" }} />;
    case "member_change":
      return <Users size={16} style={{ color: "#8B5CF6" }} />;
    default:
      return <AlertCircle size={16} style={{ color: "#6B7280" }} />;
  }
};

/**
 * 项目详情概览页组件
 */
export default function ProjectOverviewPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [activities, setActivities] = useState<ProjectActivity[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * 加载项目数据
   */
  useEffect(() => {
    const loadData = () => {
      setLoading(true);
      const projectData = getProjectById(projectId);
      if (projectData) {
        setProject(projectData);
        setActivities(getProjectActivities(projectId));
      }
      setLoading(false);
    };

    loadData();
  }, [projectId]);

  /**
   * 基本信息
   */
  const basicInfo = useMemo(() => {
    if (!project) return [];
    return [
      { label: "项目描述", value: project.description || "暂无描述", icon: <FileText size={16} /> },
      { label: "开始时间", value: project.startDate, icon: <Calendar size={16} /> },
      { label: "预计完成", value: project.expectedEndDate, icon: <Clock size={16} /> },
      { label: "实际完成", value: project.actualEndDate || "待完成", icon: <CheckCircle size={16} /> },
      { label: "创建时间", value: project.createdAt, icon: <Clock size={16} /> },
    ];
  }, [project]);

  /**
   * 最近动态（取前5条）
   */
  const recentActivities = useMemo(() => {
    return activities.slice(0, 5);
  }, [activities]);

  /**
   * 格式化时间显示
   */
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
      {/* 基本信息 */}
      <Col span={8}>
        <Card title="基本信息" style={{ marginBottom: 16 }}>
          <List
            dataSource={basicInfo}
            renderItem={(item) => (
              <List.Item style={{ border: "none", padding: "8px 0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ color: "#6B7280" }}>{item.icon}</span>
                  <Text type="secondary" style={{ width: 80 }}>
                    {item.label}:
                  </Text>
                  <Text>{item.value}</Text>
                </div>
              </List.Item>
            )}
          />
        </Card>
      </Col>

      {/* 最近动态 */}
      <Col span={16}>
        <Card title="最近动态" extra={<a href="#">查看全部</a>}>
          {recentActivities.length > 0 ? (
            <Timeline
              items={recentActivities.map((activity) => ({
                key: activity.id,
                dot: getActivityIcon(activity.type),
                children: (
                  <div>
                    <div style={{ marginBottom: 4 }}>
                      <Tag color="blue" style={{ marginRight: 8 }}>
                        {PROJECT_ACTIVITY_TYPE_LABELS[activity.type]}
                      </Tag>
                      <Text>{activity.description}</Text>
                    </div>
                    <div style={{ fontSize: 12, color: "#6B7280" }}>
                      <Space size="middle">
                        <span>操作人: {activity.operator}</span>
                        <span>{formatTime(activity.createdAt)}</span>
                      </Space>
                    </div>
                  </div>
                ),
              }))}
            />
          ) : (
            <Empty description="暂无动态记录" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </Card>
      </Col>
    </Row>
  );
}