"use client";

/**
 * 项目统计页
 */

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Empty,
  Spin,
  Button,
  Space,
  message,
} from "antd";
import {
  CheckSquare,
  Flag,
  FileText,
  Users,
  Clock,
  TrendingUp,
  Download,
  RefreshCw,
} from "lucide-react";
import {
  getProjectById,
  getProjectDetailStatistics,
  getProjectMilestones,
  getProjectMembers,
} from "@/services/mock/project";
import type { Project } from "@/types/project";

export default function ProjectStatsPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = () => {
    setLoading(true);
    const projectData = getProjectById(projectId);
    if (projectData) {
      setProject(projectData);
    }
    setLoading(false);
  };

  // 刷新数据
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      loadData();
      setRefreshing(false);
      message.success("数据已刷新");
    }, 1000);
  };

  // 导出报告
  const handleExport = () => {
    message.loading({ content: "正在生成报告...", key: "export" });
    setTimeout(() => {
      message.success({ content: "报告已导出", key: "export" });
    }, 1500);
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

  const stats = getProjectDetailStatistics(projectId);
  const milestones = getProjectMilestones(projectId);
  const members = getProjectMembers(projectId);

  const taskCompletionRate = project.totalTasks > 0
    ? Math.round((project.completedTasks / project.totalTasks) * 100)
    : 0;

  const milestoneCompletionRate = milestones.length > 0
    ? Math.round((milestones.filter(m => m.status === "completed").length / milestones.length) * 100)
    : 0;

  // 计算时间进度
  const startDate = new Date(project.startDate);
  const expectedEndDate = new Date(project.expectedEndDate);
  const totalDays = Math.ceil((expectedEndDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const elapsedDays = Math.ceil((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const remainingDays = totalDays - elapsedDays;
  const timeProgress = Math.round((elapsedDays / totalDays) * 100);

  return (
    <Row gutter={[16, 16]}>
      {/* 操作按钮 */}
      <Col span={24}>
        <Card bodyStyle={{ padding: "12px 24px" }}>
          <Space>
            <Button
              icon={<RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />}
              onClick={handleRefresh}
              loading={refreshing}
            >
              刷新数据
            </Button>
            <Button
              type="primary"
              icon={<Download size={16} />}
              onClick={handleExport}
            >
              导出报告
            </Button>
          </Space>
        </Card>
      </Col>

      {/* 核心指标 */}
      <Col span={24}>
        <Card>
          <Row gutter={24}>
            <Col span={6}>
              <Statistic
                title="任务完成率"
                value={taskCompletionRate}
                suffix="%"
                prefix={<CheckSquare size={20} style={{ marginRight: 8 }} />}
              />
              <Progress percent={taskCompletionRate} size="small" showInfo={false} />
              <div style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>
                {project.completedTasks}/{project.totalTasks} 已完成
              </div>
            </Col>
            <Col span={6}>
              <Statistic
                title="里程碑完成率"
                value={milestoneCompletionRate}
                suffix="%"
                prefix={<Flag size={20} style={{ marginRight: 8 }} />}
              />
              <Progress percent={milestoneCompletionRate} size="small" showInfo={false} />
              <div style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>
                {milestones.filter(m => m.status === "completed").length}/{milestones.length} 已完成
              </div>
            </Col>
            <Col span={6}>
              <Statistic
                title="项目进度"
                value={project.progress}
                suffix="%"
                prefix={<TrendingUp size={20} style={{ marginRight: 8 }} />}
              />
              <Progress percent={project.progress} size="small" showInfo={false} />
            </Col>
            <Col span={6}>
              <Statistic
                title="时间进度"
                value={timeProgress}
                suffix="%"
                prefix={<Clock size={20} style={{ marginRight: 8 }} />}
              />
              <Progress percent={timeProgress} size="small" showInfo={false} />
              <div style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>
                剩余 {Math.max(0, remainingDays)} 天
              </div>
            </Col>
          </Row>
        </Card>
      </Col>

      {/* 资源统计 */}
      <Col span={8}>
        <Card title="资源统计" extra={<Button type="link" size="small">详情</Button>}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Statistic
                title="文档数量"
                value={stats.totalDocuments}
                prefix={<FileText size={18} style={{ marginRight: 4 }} />}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title="成员数量"
                value={stats.totalMembers}
                prefix={<Users size={18} style={{ marginRight: 4 }} />}
              />
            </Col>
          </Row>
        </Card>
      </Col>

      {/* 成员分布 */}
      <Col span={8}>
        <Card title="成员角色分布" extra={<Button type="link" size="small">管理</Button>}>
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Statistic
                title="项目经理"
                value={members.filter(m => m.role === "manager").length}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="项目成员"
                value={members.filter(m => m.role === "member").length}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="只读者"
                value={members.filter(m => m.role === "viewer").length}
              />
            </Col>
          </Row>
        </Card>
      </Col>

      {/* 里程碑状态 */}
      <Col span={8}>
        <Card title="里程碑状态分布" extra={<Button type="link" size="small">查看</Button>}>
          <Row gutter={[16, 16]}>
            <Col span={6}>
              <Statistic
                title="已完成"
                value={milestones.filter(m => m.status === "completed").length}
                styles={{ content: { color: "#10B981" } }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="进行中"
                value={milestones.filter(m => m.status === "in_progress").length}
                styles={{ content: { color: "#3B82F6" } }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="待开始"
                value={milestones.filter(m => m.status === "pending").length}
                styles={{ content: { color: "#6B7280" } }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="已延期"
                value={milestones.filter(m => m.status === "delayed").length}
                styles={{ content: { color: "#EF4444" } }}
              />
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  );
}