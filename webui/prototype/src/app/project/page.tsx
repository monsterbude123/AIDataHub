"use client";

/**
 * 项目列表页
 * 页面路径: /project
 * 展示所有项目概览，支持按状态、阶段筛选，提供项目创建入口和快速操作
 */

import { useState, useMemo } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Space,
  Input,
  Select,
  Table,
  Typography,
  message,
} from "antd";
import { Plus, Search, FolderKanban } from "lucide-react";

import { PageLayout } from "@/components/layout";
import {
  PageBreadcrumb,
  type KPICardData,
  type BreadcrumbItem,
} from "@/components/ui";
import { ProjectFormModal } from "@/components/features";
import { useProjectTableColumns } from "@/hooks/useProjectTableColumns";
import { ROUTES } from "@/constants";
import {
  getProjectStatistics,
  getFilteredProjects,
  deleteProject,
  archiveProject,
} from "@/services/mock/project";
import type { Project, ProjectStatus, ProjectPhase } from "@/types/project";

const { Text } = Typography;

/**
 * 面包屑配置
 */
const breadcrumbItems: BreadcrumbItem[] = [
  { title: "数据项目", href: ROUTES.PROJECT },
  { title: "项目列表" },
];

/**
 * 状态筛选选项
 */
const statusOptions = [
  { label: "全部", value: "all" },
  { label: "进行中", value: "active" },
  { label: "已完成", value: "completed" },
  { label: "已暂停", value: "paused" },
  { label: "已归档", value: "archived" },
];

/**
 * 阶段筛选选项
 */
const phaseOptions = [
  { label: "全部", value: "all" },
  { label: "立项", value: "initiation" },
  { label: "规划", value: "planning" },
  { label: "执行", value: "execution" },
  { label: "验收", value: "acceptance" },
  { label: "结项", value: "closed" },
];

/**
 * 项目列表页组件
 */
export default function ProjectListPage() {
  // 状态筛选
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">("all");
  // 阶段筛选
  const [phaseFilter, setPhaseFilter] = useState<ProjectPhase | "all">("all");
  // 搜索关键词
  const [keyword, setKeyword] = useState("");
  // 项目表单弹窗
  const [modalOpen, setModalOpen] = useState(false);
  // 当前编辑项目（null 表示新建模式）
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  /**
   * 项目统计数据
   */
  const statistics = useMemo(() => getProjectStatistics(), []);

  /**
   * KPI 卡片数据
   */
  const kpiData: KPICardData[] = useMemo(() => [
    {
      title: "全部项目",
      value: statistics.total,
      icon: <FolderKanban size={20} />,
      colorTheme: "primary",
    },
    {
      title: "进行中",
      value: statistics.active,
      icon: <FolderKanban size={20} />,
      colorTheme: "primary",
    },
    {
      title: "已完成",
      value: statistics.completed,
      icon: <FolderKanban size={20} />,
      colorTheme: "success",
    },
    {
      title: "已归档",
      value: statistics.archived,
      icon: <FolderKanban size={20} />,
      colorTheme: "neutral",
    },
  ], [statistics]);

  /**
   * 筛选后的项目列表
   */
  const filteredProjects = useMemo(() => {
    return getFilteredProjects({
      status: statusFilter,
      phase: phaseFilter,
      keyword,
    });
  }, [statusFilter, phaseFilter, keyword]);

  /**
   * 点击统计卡片筛选
   */
  const handleCardClick = (index: number) => {
    const statusValues: (ProjectStatus | "all")[] = ["all", "active", "completed", "archived"];
    setStatusFilter(statusValues[index]);
    setPhaseFilter("all");
    setKeyword("");
  };

  /**
   * 打开新建项目弹窗
   */
  const handleCreateProject = () => {
    setCurrentProject(null);
    setModalOpen(true);
  };

  /**
   * 打开编辑项目弹窗
   */
  const handleEditProject = (project: Project) => {
    setCurrentProject(project);
    setModalOpen(true);
  };

  /**
   * 查看项目详情
   */
  const handleViewProject = (project: Project) => {
    message.info(`查看项目: ${project.name}`);
  };

  /**
   * 归档项目
   */
  const handleArchiveProject = (project: Project) => {
    if (project.status !== "completed") {
      message.warning("仅已完成项目可归档");
      return;
    }
    archiveProject(project.id);
    message.success(`项目 ${project.name} 已归档`);
  };

  /**
   * 删除项目
   */
  const handleDeleteProject = (project: Project) => {
    deleteProject(project.id);
    message.success(`项目 ${project.name} 已删除`);
  };

  /**
   * 提交项目表单
   */
  const handleFormSubmit = async (values: Record<string, unknown>) => {
    console.log("Form values:", values);
    message.success(currentProject ? "项目已更新" : "项目已创建");
    setModalOpen(false);
    setCurrentProject(null);
  };

  /**
   * 关闭项目表单弹窗
   */
  const handleModalCancel = () => {
    setModalOpen(false);
    setCurrentProject(null);
  };

  /**
   * 表格列配置
   */
  const columns = useProjectTableColumns({
    onView: handleViewProject,
    onEdit: handleEditProject,
    onArchive: handleArchiveProject,
    onDelete: handleDeleteProject,
  });

  return (
    <PageLayout title="项目列表">
      {/* 面包屑 */}
      <PageBreadcrumb items={breadcrumbItems} />

      {/* 统计卡片 */}
      <div style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          {kpiData.map((item, index) => (
            <Col key={index} xs={12} sm={6}>
              <Card
                style={{
                  cursor: "pointer",
                  transition: "all 0.2s",
                  borderColor: statusFilter === ["all", "active", "completed", "archived"][index] ? "#2563EB" : undefined,
                }}
                onClick={() => handleCardClick(index)}
                styles={{ body: { padding: "16px 24px" } }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ color: item.colorTheme === "primary" ? "#2563EB" : item.colorTheme === "success" ? "#10B981" : "#6B7280" }}>
                    {item.icon}
                  </div>
                  <div>
                    <Text style={{ fontSize: 24, fontWeight: 600, display: "block" }}>
                      {item.value}
                    </Text>
                    <Text style={{ fontSize: 14, color: "#6B7280" }}>
                      {item.title}
                    </Text>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* 过滤栏 */}
      <Card style={{ marginBottom: 16 }} styles={{ body: { padding: "12px 16px" } }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Space size="middle">
            <Input
              placeholder="搜索项目名称/编号"
              prefix={<Search size={14} />}
              allowClear
              style={{ width: 200 }}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <Select
              placeholder="状态筛选"
              options={statusOptions}
              allowClear
              style={{ width: 120 }}
              value={statusFilter}
              onChange={(value) => setStatusFilter(value || "all")}
            />
            <Select
              placeholder="阶段筛选"
              options={phaseOptions}
              allowClear
              style={{ width: 120 }}
              value={phaseFilter}
              onChange={(value) => setPhaseFilter(value || "all")}
            />
          </Space>

          <Space>
            <Button type="primary" icon={<Plus size={14} />} onClick={handleCreateProject}>
              新建项目
            </Button>
          </Space>
        </div>
      </Card>

      {/* 项目表格 */}
      <Card styles={{ body: { padding: 0 } }}>
        <Table<Project>
          columns={columns}
          dataSource={filteredProjects}
          rowKey="id"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            pageSizeOptions: [10, 20, 50, 100],
          }}
          scroll={{ x: 1400 }}
          style={{ borderRadius: 8 }}
          locale={{ emptyText: "暂无项目数据" }}
        />
      </Card>

      {/* 项目表单弹窗（新建/编辑） */}
      <ProjectFormModal
        open={modalOpen}
        onCancel={handleModalCancel}
        onSubmit={handleFormSubmit}
        editData={currentProject}
        isEdit={currentProject !== null}
      />
    </PageLayout>
  );
}