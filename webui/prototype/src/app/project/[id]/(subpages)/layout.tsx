"use client";

/**
 * 项目子页面共享布局
 * 用于任务管理、里程碑、文档、统计、成员等子页面
 * 包含面包屑导航返回项目详情
 */

import { useParams, usePathname, useRouter } from "next/navigation";
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

/**
 * 子页面名称映射
 */
const SUBPAGE_NAMES: Record<string, string> = {
  tasks: "任务管理",
  milestones: "里程碑",
  docs: "文档",
  stats: "统计",
  members: "成员",
  scheduler: "调度中心",
};

/**
 * 项目子页面布局组件属性
 */
interface ProjectSubpageLayoutProps {
  /** 子组件 */
  children: React.ReactNode;
}

/**
 * 项目子页面布局组件
 */
export default function ProjectSubpageLayout({ children }: ProjectSubpageLayoutProps) {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();

  const projectId = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
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
      }
      setLoading(false);
    };

    loadData();
  }, [projectId]);

  /**
   * 获取当前子页面名称
   */
  const getSubpageName = () => {
    const segments = pathname.split("/");
    const subpageSegment = segments[3]; // /project/[id]/xxx
    if (subpageSegment === "scheduler") {
      const schedulerSub = segments[4]; // dag/tasks/logs
      if (schedulerSub === "dag") return "DAG编排";
      if (schedulerSub === "tasks") return "任务运维";
      if (schedulerSub === "logs") return "日志中心";
      return "调度中心";
    }
    return SUBPAGE_NAMES[subpageSegment] || "详情";
  };

  const subpageName = getSubpageName();

  /**
   * 检测是否为 DAG 详情页（有 dagId 参数）
   * DAG 详情页有自己的完整布局，不需要子页面布局
   */
  const isDAGDetailPage = useMemo(() => {
    const segments = pathname.split("/");
    // /project/[id]/scheduler/dag/[dagId]
    return segments[3] === "scheduler" && segments[4] === "dag" && segments[5];
  }, [pathname]);

  /**
   * 面包屑配置
   * 必须在所有 hooks 之后才能进行条件返回
   */
  const breadcrumbItems: BreadcrumbItem[] = useMemo(() => {
    if (!project) return [];
    return [
      { title: "数据项目", href: ROUTES.PROJECT },
      { title: "项目列表", href: ROUTES.PROJECT },
      { title: project.name, href: `/project/${projectId}` },
      { title: subpageName },
    ];
  }, [project, projectId, subpageName]);

  /**
   * 返回项目详情
   */
  const handleBack = () => {
    router.push(`/project/${projectId}`);
  };

  // DAG 详情页直接返回 children，不使用子页面布局
  // 注意：所有 hooks 必须在此之前调用
  if (isDAGDetailPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <PageLayout title="加载中">
        <div style={{ textAlign: "center", padding: 48 }}>
          <Spin size="large" />
        </div>
      </PageLayout>
    );
  }

  if (!project) {
    return (
      <PageLayout title="项目不存在">
        <PageBreadcrumb items={[{ title: "数据项目", href: ROUTES.PROJECT }, { title: "项目不存在" }]} />
        <Empty description="项目不存在或已被删除" />
      </PageLayout>
    );
  }

  return (
    <PageLayout title={`${project.name} - ${subpageName}`}>
      {/* 面包屑 */}
      <PageBreadcrumb items={breadcrumbItems} />

      {/* 项目头部简要信息 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <Space size="middle">
                  <Button
                    type="text"
                    icon={<ArrowLeft size={16} />}
                    onClick={handleBack}
                  >
                    返回项目
                  </Button>
                  <Title level={4} style={{ marginBottom: 0 }}>
                    {project.name}
                  </Title>
                  <Tag color={PROJECT_STATUS_COLORS[project.status]}>
                    {PROJECT_STATUS_LABELS[project.status]}
                  </Tag>
                  <Tag>{PROJECT_PHASE_LABELS[project.phase]}</Tag>
                </Space>
              </div>
              <Space>
                <Button icon={<Edit size={14} />}>编辑</Button>
              </Space>
            </div>
          </Col>

          <Col span={24}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <Text type="secondary">进度:</Text>
              <Progress
                percent={project.progress}
                status={project.status === "completed" ? "success" : "active"}
                style={{ flex: 1, maxWidth: 300 }}
              />
              <Text strong>{project.progress}%</Text>
            </div>
          </Col>
        </Row>
      </Card>

      {/* 子页面内容 */}
      {children}
    </PageLayout>
  );
}