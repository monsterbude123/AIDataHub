"use client";

/**
 * 项目详情布局
 * 包含项目头部信息、阶段进度条、快捷入口和Tab导航
 */

import { useParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import {
  Card,
  Tabs,
  Row,
  Col,
  Button,
  Space,
  Tag,
  Progress,
  Typography,
  Spin,
  Empty,
  Popconfirm,
  message,
} from "antd";
import {
  Edit,
  Trash2,
  LayoutDashboard,
  ListTodo,
  Flag,
  FileText,
  BarChart3,
  Users,
  Workflow,
} from "lucide-react";

import { PageLayout } from "@/components/layout";
import { PageBreadcrumb, type BreadcrumbItem } from "@/components/ui";
import { ProjectPhaseProgress } from "@/components/features/ProjectPhaseProgress";
import {
  getProjectById,
  getProjectDetailStatistics,
  advanceProjectPhase,
  revertProjectPhase,
} from "@/services/mock/project";
import { ROUTES } from "@/constants";
import type { Project, ProjectDetailStatistics } from "@/types/project";
import {
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_COLORS,
  PROJECT_PHASE_LABELS,
} from "@/types/project";

const { Title, Text } = Typography;

/**
 * 快捷入口配置
 */
const QUICK_ENTRIES = [
  {
    key: "tasks",
    title: "任务管理",
    icon: <ListTodo size={20} />,
    href: "/project/[id]/tasks",
    color: "#2563EB",
  },
  {
    key: "milestones",
    title: "里程碑",
    icon: <Flag size={20} />,
    href: "/project/[id]/milestones",
    color: "#10B981",
  },
  {
    key: "docs",
    title: "文档",
    icon: <FileText size={20} />,
    href: "/project/[id]/docs",
    color: "#F59E0B",
  },
  {
    key: "stats",
    title: "统计",
    icon: <BarChart3 size={20} />,
    href: "/project/[id]/stats",
    color: "#8B5CF6",
  },
  {
    key: "members",
    title: "成员",
    icon: <Users size={20} />,
    href: "/project/[id]/members",
    color: "#EF4444",
  },
  {
    key: "scheduler",
    title: "调度中心",
    icon: <Workflow size={20} />,
    href: "/project/[id]/scheduler",
    color: "#3B82F6",
  },
];

/**
 * Tab 配置 - 仅保留概览
 */
const tabItems = [
  { key: "overview", label: "概览", icon: <LayoutDashboard size={16} /> },
];

/**
 * 项目详情布局组件属性
 */
interface ProjectDetailLayoutProps {
  /** 子组件（Tab内容） */
  children: React.ReactNode;
}

/**
 * 项目详情布局组件
 */
export default function ProjectDetailLayout({ children }: ProjectDetailLayoutProps) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();

  const projectId = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [statistics, setStatistics] = useState<ProjectDetailStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  // 判断是否为概览页（只有概览页显示完整布局）
  const isOverviewPage = pathname === `/project/${projectId}`;

  /**
   * 加载项目数据
   */
  useEffect(() => {
    const loadData = () => {
      setLoading(true);
      const projectData = getProjectById(projectId);
      if (projectData) {
        setProject(projectData);
        setStatistics(getProjectDetailStatistics(projectId));
      }
      setLoading(false);
    };

    loadData();
  }, [projectId]);

  /**
   * 面包屑配置
   */
  const breadcrumbItems: BreadcrumbItem[] = useMemo(() => {
    if (!project) return [];
    return [
      { title: "数据项目", href: ROUTES.PROJECT },
      { title: "项目列表", href: ROUTES.PROJECT },
      { title: project.name },
    ];
  }, [project]);

  /**
   * 获取当前激活的 Tab - 仅概览
   */
  const getActiveTab = () => {
    // 子页面有独立 layout，此 layout 仅用于概览
    return "overview";
  };

  const activeTab = getActiveTab();

  /**
   * Tab 切换处理
   */
  const handleTabChange = (key: string) => {
    if (key === "overview") {
      router.push(`/project/${projectId}`);
    } else {
      router.push(`/project/${projectId}/${key}`);
    }
  };

  /**
   * 推进阶段
   */
  const handleAdvancePhase = () => {
    const updatedProject = advanceProjectPhase(projectId);
    if (updatedProject) {
      setProject(updatedProject);
    }
  };

  /**
   * 回退阶段
   */
  const handleRevertPhase = (reason: string) => {
    const updatedProject = revertProjectPhase(projectId, reason);
    if (updatedProject) {
      setProject(updatedProject);
    }
  };

  /**
   * 删除项目
   */
  const handleDeleteProject = () => {
    router.push(ROUTES.PROJECT);
  };

  const handleEditProject = () => {
    message.info("打开项目编辑弹窗");
  };

  /**
   * 渲染 Tab 内容
   */
  const renderTabsContent = () => {
    const tabsData = tabItems.map((item) => ({
      key: item.key,
      label: (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          {item.icon}
          {item.label}
        </span>
      ),
      children: item.key === activeTab ? children : null,
    }));

    return (
      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        items={tabsData}
        style={{ marginTop: 16 }}
      />
    );
  };

  if (loading) {
    return (
      <PageLayout title="项目详情">
        <div style={{ textAlign: "center", padding: 48 }}>
          <Spin size="large" />
        </div>
      </PageLayout>
    );
  }

  if (!project) {
    return (
      <PageLayout title="项目详情">
        <PageBreadcrumb items={[{ title: "数据项目", href: ROUTES.PROJECT }, { title: "项目不存在" }]} />
        <Empty description="项目不存在或已被删除" />
      </PageLayout>
    );
  }

  // 子页面直接渲染 children，不显示项目详情布局
  if (!isOverviewPage) {
    return <>{children}</>;
  }

  return (
    <PageLayout title={project.name}>
      {/* 面包屑 */}
      <PageBreadcrumb items={breadcrumbItems} />

      {/* 项目头部信息 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <Title level={3} style={{ marginBottom: 8 }}>
                  {project.name}
                </Title>
                <Space size="middle">
                  <Tag color={PROJECT_STATUS_COLORS[project.status]}>
                    {PROJECT_STATUS_LABELS[project.status]}
                  </Tag>
                  <Text type="secondary">项目编号: {project.code}</Text>
                  <Text type="secondary">负责人: {project.managerName}</Text>
                  <Tag>{PROJECT_PHASE_LABELS[project.phase]}</Tag>
                </Space>
              </div>
              <Space>
                <Button icon={<Edit size={14} />} onClick={handleEditProject}>编辑</Button>
                <Popconfirm
                  title="确认删除此项目？"
                  description="删除后数据将无法恢复"
                  onConfirm={handleDeleteProject}
                  okText="删除"
                  cancelText="取消"
                  okButtonProps={{ danger: true }}
                >
                  <Button danger icon={<Trash2 size={14} />}>
                    删除
                  </Button>
                </Popconfirm>
              </Space>
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

      {/* 阶段进度条 */}
      <Card style={{ marginBottom: 16 }} title="阶段进度">
        <ProjectPhaseProgress
          currentPhase={project.phase}
          showActions={true}
          isManager={true}
          onAdvance={handleAdvancePhase}
          onRevert={handleRevertPhase}
        />
      </Card>

      {/* 快捷入口 */}
      <Card title="快捷入口" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          {QUICK_ENTRIES.map((entry) => {
            const actualHref = entry.href.replace("[id]", projectId);
            return (
              <Col span={4} key={entry.key}>
                <Link href={actualHref} style={{ textDecoration: "none" }}>
                  <Card
                    styles={{
                      body: {
                        textAlign: "center",
                        padding: 16,
                        cursor: "pointer",
                        transition: "all 0.2s",
                      },
                    }}
                    hoverable
                  >
                    <div style={{ color: entry.color, marginBottom: 8 }}>{entry.icon}</div>
                    <Text strong>{entry.title}</Text>
                  </Card>
                </Link>
              </Col>
            );
          })}
        </Row>
      </Card>

      {/* 关键指标卡片 */}
      {statistics && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Card styles={{ body: { textAlign: "center" } }}>
              <Text style={{ fontSize: 24, fontWeight: 600 }}>{statistics.totalTasks}</Text>
              <br />
              <Text type="secondary">任务总数</Text>
              <br />
              <Text style={{ fontSize: 12, color: "#10B981" }}>
                完成: {statistics.completedTasks}
              </Text>
            </Card>
          </Col>
          <Col span={6}>
            <Card styles={{ body: { textAlign: "center" } }}>
              <Text style={{ fontSize: 24, fontWeight: 600 }}>{statistics.totalMilestones}</Text>
              <br />
              <Text type="secondary">里程碑</Text>
              <br />
              <Text style={{ fontSize: 12, color: "#10B981" }}>
                完成: {statistics.completedMilestones}
              </Text>
            </Card>
          </Col>
          <Col span={6}>
            <Card styles={{ body: { textAlign: "center" } }}>
              <Text style={{ fontSize: 24, fontWeight: 600 }}>{statistics.totalDocuments}</Text>
              <br />
              <Text type="secondary">文档数</Text>
            </Card>
          </Col>
          <Col span={6}>
            <Card styles={{ body: { textAlign: "center" } }}>
              <Text style={{ fontSize: 24, fontWeight: 600 }}>{statistics.totalMembers}</Text>
              <br />
              <Text type="secondary">成员数</Text>
            </Card>
          </Col>
        </Row>
      )}

      {/* Tab 导航和内容 */}
      <Card>{renderTabsContent()}</Card>
    </PageLayout>
  );
}