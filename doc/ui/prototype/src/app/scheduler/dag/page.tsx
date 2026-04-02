"use client";

/**
 * DAG任务编排页
 * 页面路径: /scheduler/dag
 */

import { useState } from "react";
import { Card, Button, Space, message, Select, Input, Collapse, Form, InputNumber } from "antd";
import {
  Save,
  Play,
  CheckCircle,
  Maximize2,
  ArrowRight,
  Database,
  FileSearch,
  Shield,
  Code,
  Terminal,
  GitBranch,
  RefreshCw,
} from "lucide-react";

import { PageLayout } from "@/components/layout";
import { PageBreadcrumb, ModalForm, type FormFieldConfig } from "@/components/ui";
import { ROUTES } from "@/constants";
import { mockDAGTasks, NODE_PANEL_CONFIG } from "@/services/mock/scheduler";
import {
  DAG_NODE_TYPE_LABELS,
  DAG_NODE_COLORS,
  type DAGNodeType,
  type DAGNode,
} from "@/types/scheduler";

/**
 * 面包屑配置
 */
const BREADCRUMB_ITEMS = [
  { title: "任务调度", href: ROUTES.SCHEDULER },
  { title: "DAG编排" },
];

/**
 * 节点图标映射
 */
const NODE_ICONS: Record<DAGNodeType, React.ReactNode> = {
  data_input: <Database size={16} />,
  data_profiling: <FileSearch size={16} />,
  standardization: <RefreshCw size={16} />,
  quality_check: <Shield size={16} />,
  tag_extraction: <Code size={16} />,
  spark_sql: <Terminal size={16} />,
  python_script: <Code size={16} />,
  condition: <GitBranch size={16} />,
  loop: <RefreshCw size={16} />,
};

/**
 * DAG编排页面组件
 */
export default function DAGPage() {
  const [selectedNode, setSelectedNode] = useState<DAGNode | null>(null);
  const [nodeModalOpen, setNodeModalOpen] = useState(false);

  // 使用第一个 DAG 作为示例
  const currentDAG = mockDAGTasks[0];

  /**
   * 渲染节点面板项
   */
  const renderNodePanelItem = (type: DAGNodeType) => {
    const color = DAG_NODE_COLORS[type];
    const label = DAG_NODE_TYPE_LABELS[type];
    const icon = NODE_ICONS[type];

    return (
      <div
        key={type}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 12px",
          background: "#F8FAFC",
          borderRadius: 6,
          cursor: "grab",
          marginBottom: 8,
          border: "1px solid #E2E8F0",
        }}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData("nodeType", type);
        }}
      >
        <div style={{ color }}>{icon}</div>
        <span style={{ fontSize: 14 }}>{label}</span>
      </div>
    );
  };

  /**
   * 节点属性表单字段
   */
  const nodeFormFields: FormFieldConfig[] = [
    {
      name: "name",
      label: "节点名称",
      type: "text",
      required: true,
      placeholder: "请输入节点名称",
    },
    {
      name: "taskId",
      label: "关联任务",
      type: "select",
      options: [
        { value: "task-001", label: "数据接入任务" },
        { value: "task-002", label: "数据探查任务" },
        { value: "task-003", label: "质量检测任务" },
      ],
    },
    {
      name: "timeout",
      label: "超时时间（分钟）",
      type: "number",
      initialValue: 30,
    },
    {
      name: "retryCount",
      label: "重试次数",
      type: "number",
      initialValue: 3,
    },
    {
      name: "failureStrategy",
      label: "失败策略",
      type: "select",
      options: [
        { value: "continue", label: "继续执行" },
        { value: "stop", label: "停止整个流程" },
      ],
      initialValue: "stop",
    },
    {
      name: "params",
      label: "执行参数（JSON）",
      type: "textarea",
      placeholder: '{"key": "value"}',
    },
  ];

  /**
   * 处理保存
   */
  const handleSave = () => {
    message.success("DAG配置已保存");
  };

  /**
   * 处理验证
   */
  const handleValidate = () => {
    message.loading({ content: "正在验证DAG...", key: "validate" });
    setTimeout(() => {
      message.success({ content: "DAG验证通过，无环路和孤立节点", key: "validate" });
    }, 1000);
  };

  /**
   * 处理运行
   */
  const handleRun = () => {
    message.loading({ content: "正在提交运行...", key: "run" });
    setTimeout(() => {
      message.success({ content: "DAG任务已提交运行", key: "run" });
    }, 1500);
  };

  /**
   * 处理节点点击
   */
  const handleNodeClick = (node: DAGNode) => {
    setSelectedNode(node);
    setNodeModalOpen(true);
  };

  /**
   * 处理节点表单提交
   */
  const handleNodeSubmit = async (values: Record<string, unknown>) => {
    console.log("Submit node:", values);
    message.success("节点配置已更新");
    setNodeModalOpen(false);
  };

  return (
    <PageLayout title="DAG任务编排">
      {/* 面包屑 */}
      <PageBreadcrumb items={BREADCRUMB_ITEMS} />

      {/* 顶部工具栏 */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Space>
            <Button type="primary" icon={<Save size={14} />} onClick={handleSave}>
              保存
            </Button>
            <Button icon={<CheckCircle size={14} />} onClick={handleValidate}>
              验证
            </Button>
            <Button icon={<Play size={14} />} onClick={handleRun}>
              立即运行
            </Button>
            <Button icon={<Maximize2 size={14} />}>
              全屏
            </Button>
          </Space>

          <Space>
            <span style={{ color: "#6B7280" }}>调度策略:</span>
            <Select
              defaultValue="cron"
              style={{ width: 120 }}
              options={[
                { value: "cron", label: "定时调度" },
                { value: "event", label: "事件触发" },
                { value: "dependency", label: "依赖触发" },
              ]}
            />
            <Input placeholder="Cron表达式" style={{ width: 150 }} defaultValue="0 2 * * *" />
          </Space>
        </div>
      </Card>

      {/* 主体布局 */}
      <div style={{ display: "flex", gap: 16, height: "calc(100vh - 280px)", minHeight: 500 }}>
        {/* 左侧节点面板 */}
        <Card
          title="节点面板"
          style={{ width: 200, overflow: "auto" }}
          bodyStyle={{ padding: 12 }}
        >
          <Collapse
            defaultActiveKey={["data_integration", "data_governance", "data_processing", "control_flow"]}
            ghost
            expandIconPosition="end"
          >
            {NODE_PANEL_CONFIG.map((category) => (
              <Collapse.Panel
                key={category.category}
                header={<span style={{ fontWeight: 500 }}>{category.label}</span>}
              >
                {category.nodes.map((node) => renderNodePanelItem(node.type as DAGNodeType))}
              </Collapse.Panel>
            ))}
          </Collapse>
        </Card>

        {/* 中间DAG画布 */}
        <Card
          style={{ flex: 1, overflow: "hidden" }}
          bodyStyle={{ padding: 0, height: "100%" }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "linear-gradient(90deg, #F1F5F9 1px, transparent 1px), linear-gradient(#F1F5F9 1px, transparent 1px)",
              backgroundSize: "20px 20px",
              position: "relative",
            }}
            onDrop={(e) => {
              e.preventDefault();
              const nodeType = e.dataTransfer.getData("nodeType");
              message.info(`放置节点: ${DAG_NODE_TYPE_LABELS[nodeType as DAGNodeType]}`);
            }}
            onDragOver={(e) => e.preventDefault()}
          >
            {/* 渲染节点和连线 */}
            <svg
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
              }}
            >
              {/* 连接线 */}
              {currentDAG.edges.map((edge) => {
                const sourceNode = currentDAG.nodes.find((n) => n.id === edge.source);
                const targetNode = currentDAG.nodes.find((n) => n.id === edge.target);
                if (!sourceNode || !targetNode) return null;

                return (
                  <line
                    key={edge.id}
                    x1={sourceNode.position.x + 80}
                    y1={sourceNode.position.y + 25}
                    x2={targetNode.position.x}
                    y2={targetNode.position.y + 25}
                    stroke="#94A3B8"
                    strokeWidth={2}
                    markerEnd="url(#arrow)"
                  />
                );
              })}
              {/* 箭头标记定义 */}
              <defs>
                <marker
                  id="arrow"
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#94A3B8" />
                </marker>
              </defs>
            </svg>

            {/* 渲染节点 */}
            {currentDAG.nodes.map((node) => {
              const color = DAG_NODE_COLORS[node.type];
              const icon = NODE_ICONS[node.type];

              return (
                <div
                  key={node.id}
                  onClick={() => handleNodeClick(node)}
                  style={{
                    position: "absolute",
                    left: node.position.x,
                    top: node.position.y,
                    width: 160,
                    padding: "12px 16px",
                    background: "#fff",
                    border: `2px solid ${selectedNode?.id === node.id ? "#2563EB" : color}`,
                    borderRadius: 8,
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <div style={{ color }}>{icon}</div>
                    <span style={{ fontSize: 12, color: "#6B7280" }}>
                      {DAG_NODE_TYPE_LABELS[node.type]}
                    </span>
                  </div>
                  <div style={{ fontWeight: 500, color: "#1E293B" }}>{node.name}</div>
                </div>
              );
            })}

            {/* 空状态提示 */}
            {currentDAG.nodes.length === 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  textAlign: "center",
                  color: "#94A3B8",
                }}
              >
                <p style={{ fontSize: 16 }}>从左侧拖拽节点到画布</p>
                <p style={{ fontSize: 14 }}>或右键点击画布添加节点</p>
              </div>
            )}
          </div>
        </Card>

        {/* 右侧属性面板 */}
        <Card
          title="属性配置"
          style={{ width: 280, overflow: "auto" }}
          bodyStyle={{ padding: 16 }}
        >
          {selectedNode ? (
            <div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: "#6B7280" }}>节点名称</label>
                <div style={{ fontWeight: 500 }}>{selectedNode.name}</div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: "#6B7280" }}>节点类型</label>
                <div>{DAG_NODE_TYPE_LABELS[selectedNode.type]}</div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: "#6B7280" }}>关联任务</label>
                <Select
                  style={{ width: "100%" }}
                  defaultValue={selectedNode.config.taskId}
                  options={[
                    { value: "task-001", label: "数据接入任务" },
                    { value: "task-002", label: "数据探查任务" },
                    { value: "task-003", label: "质量检测任务" },
                  ]}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: "#6B7280" }}>超时时间（分钟）</label>
                <InputNumber
                  style={{ width: "100%" }}
                  defaultValue={selectedNode.config.timeout || 30}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: "#6B7280" }}>重试次数</label>
                <InputNumber
                  style={{ width: "100%" }}
                  defaultValue={selectedNode.config.retryCount || 3}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: "#6B7280" }}>失败策略</label>
                <Select
                  style={{ width: "100%" }}
                  defaultValue={selectedNode.config.failureStrategy || "stop"}
                  options={[
                    { value: "continue", label: "继续执行" },
                    { value: "stop", label: "停止整个流程" },
                  ]}
                />
              </div>
            </div>
          ) : (
            <div style={{ color: "#94A3B8", textAlign: "center", padding: 24 }}>
              点击画布中的节点查看属性
            </div>
          )}
        </Card>
      </div>

      {/* 节点编辑弹窗 */}
      <ModalForm
        title="编辑节点"
        open={nodeModalOpen}
        onCancel={() => setNodeModalOpen(false)}
        onSubmit={handleNodeSubmit}
        fields={nodeFormFields}
        initialValues={selectedNode ? { ...selectedNode, ...selectedNode.config } : undefined}
        width={500}
      />
    </PageLayout>
  );
}