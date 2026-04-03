"use client";

/**
 * 项目子页面布局
 * 用于任务管理、里程碑、文档等子页面
 */

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Space,
  Tag,
  Progress,
  Typography,
  Spin,
  Empty,
} from "antd";
import {
  ArrowLeft,
  Edit,
} from "lucide-react";

import { PageLayout } from "@/components/layout";
import { PageBreadcrumb, type BreadcrumbItem } from "@/components/ui";
import { getProjectById } from "@/services/mock/project";
import { ROUTES } from "@/constants";
import type { Project } from "@/types/project";
import {
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_COLORS,
  PROJECT_PHASE_LABELS,
} from "@/types/project";

const { Title, Text } = Typography;

interface ProjectSubPageLayoutProps {
  children: React.ReactNode;
  title: string;
  extra?: React.ReactNode;
}

export function ProjectSubPageLayout({ children, title, extra }: ProjectSubPageLayoutProps) {
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

  const breadcrumbItems: BreadcrumbItem[] = useMemo(() => {
    if (!project) return [];
    return [
      { title: "数据项目", href: ROUTES.PROJECT },
      { title: project.name, href: `/project/${projectId}` },
      { title },
    ];
  }, [project, projectId, title]);

  const handleBack = () => {
    router.push(`/project/${projectId}`);
  };

  if (loading) {
    return (
      <PageLayout title={title}>
        <div style={{ textAlign: "center", padding: 48 }}>
          <Spin size="large" />
        </div>
      </PageLayout>
    );
  }

  if (!project) {
    return (
      <PageLayout title={title}>
        <Empty description="项目不存在" />
      </PageLayout>
    );
  }

  return (
    <PageLayout title={`${project.name} - ${title}`}>
      <PageBreadcrumb items={breadcrumbItems} />

      {/* 项目头部信息（简化版） */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <Button
                  type="text"
                  icon={<ArrowLeft size={16} />}
                  onClick={handleBack}
                >
                  返回概览
                </Button>
                <Title level={4} style={{ margin: 0 }}>
                  {project.name}
                </Title>
                <Space size="middle">
                  <Tag color={PROJECT_STATUS_COLORS[project.status]}>
                    {PROJECT_STATUS_LABELS[project.status]}
                  </Tag>
                  <Tag>{PROJECT_PHASE_LABELS[project.phase]}</Tag>
                </Space>
              </div>
              {extra}
            </div>
          </Col>

          <Col span={24}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <Text style={{ width: 80 }}>当前进度:</Text>
              <Progress
                percent={project.progress}
                status={project.status === "completed" ? "success" : "active"}
                style={{ flex: 1 }}
              />
              <Text strong style={{ width: 50, textAlign: "right" }}>
                {project.progress}%
              </Text>
            </div>
          </Col>
        </Row>
      </Card>

      {/* 页面内容 */}
      {children}
    </PageLayout>
  );
}