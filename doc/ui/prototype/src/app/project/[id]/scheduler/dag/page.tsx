"use client";

/**
 * DAG任务编排页
 * 页面路径: /project/[id]/scheduler/dag
 * 使用 ReactFlow 实现可编辑的 DAG 画布
 */

import { useState, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import { Card, Button, Space, message, Select, Input, Collapse, InputNumber, Modal } from "antd";
import { Save, Play, CheckCircle, Maximize2, Database, FileSearch, Shield, Code, Terminal, GitBranch, RefreshCw } from "lucide-react";

import { PageLayout } from "@/components/layout";
import { PageBreadcrumb, type BreadcrumbItem } from "@/components/ui";
import DAGEditor from "@/components/features/DAGEditor";
import { ROUTES } from "@/constants";
import { mockDAGTasks, NODE_PANEL_CONFIG } from "@/services/mock/scheduler";
import { validateDAG } from "@/lib/dagValidation";
import { DAG_NODE_TYPE_LABELS, DAG_NODE_COLORS, type DAGNodeType, type DAGNode, type DAGEdge } from "@/types/scheduler";

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

export default function DAGPage() {
  const params = useParams();
  const projectId = params.id as string;

  const initialDAG = mockDAGTasks[0];
  const [nodes, setNodes] = useState<DAGNode[]>(initialDAG.nodes);
  const [edges, setEdges] = useState<DAGEdge[]>(initialDAG.edges);
  const [selectedNode, setSelectedNode] = useState<DAGNode | null>(null);
  const [validationResult, setValidationResult] = useState<{valid: boolean; errors: string[]; warnings: string[]} | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  /**
   * 面包屑配置（动态项目路由）
   */
  const breadcrumbItems: BreadcrumbItem[] = useMemo(() => [
    { title: "数据项目", href: ROUTES.PROJECT },
    { title: "项目详情", href: `/project/${projectId}` },
    { title: "任务调度", href: `/project/${projectId}/scheduler/dag` },
    { title: "DAG编排" },
  ], [projectId]);

  const handleNodesChange = useCallback((newNodes: DAGNode[]) => { setNodes(newNodes); setValidationResult(null); }, []);
  const handleEdgesChange = useCallback((newEdges: DAGEdge[]) => { setEdges(newEdges); setValidationResult(null); }, []);
  const handleNodeSelect = useCallback((node: DAGNode | null) => { setSelectedNode(node); }, []);
  const handleNodeEdit = useCallback((node: DAGNode) => { setSelectedNode(node); }, []);

  const handleSave = useCallback(() => {
    const result = validateDAG(nodes, edges);
    setValidationResult(result);
    if (!result.valid) {
      Modal.error({ title: "保存失败", content: <div><p>DAG 配置存在以下问题：</p><ul>{result.errors.map((err, i) => <li key={i} style={{ color: '#EF4444' }}>{err}</li>)}</ul></div> });
      return;
    }
    message.success("DAG配置已保存");
  }, [nodes, edges]);

  const handleValidate = useCallback(() => {
    message.loading({ content: "正在验证DAG...", key: "validate" });
    setTimeout(() => {
      const result = validateDAG(nodes, edges);
      setValidationResult(result);
      if (result.valid) { message.success({ content: "DAG验证通过", key: "validate" }); }
      else { message.error({ content: "验证失败: " + result.errors[0], key: "validate" }); }
    }, 500);
  }, [nodes, edges]);

  const handleRun = useCallback(() => {
    const result = validateDAG(nodes, edges);
    if (!result.valid) { Modal.error({ title: "无法运行", content: "DAG 配置存在问题: " + result.errors[0] }); return; }
    message.loading({ content: "正在提交运行...", key: "run" });
    setTimeout(() => { message.success({ content: "DAG任务已提交运行", key: "run" }); }, 1500);
  }, [nodes, edges]);

  const handleFullscreen = useCallback(() => { setIsFullscreen(!isFullscreen); }, [isFullscreen]);

  const handleUpdateSelectedNode = useCallback((field: string, value: unknown) => {
    if (!selectedNode) return;
    const updatedNodes = nodes.map((n) => {
      if (n.id === selectedNode.id) { return { ...n, [field]: value, config: { ...n.config, ...(field === "name" ? {} : { [field]: value }) } }; }
      return n;
    });
    setNodes(updatedNodes);
    setSelectedNode({ ...selectedNode, [field]: value, config: { ...selectedNode.config, ...(field === "name" ? {} : { [field]: value }) } });
  }, [selectedNode, nodes]);

  const renderNodePanelItem = (type: DAGNodeType) => {
    const color = DAG_NODE_COLORS[type];
    const label = DAG_NODE_TYPE_LABELS[type];
    const icon = NODE_ICONS[type];
    return (
      <div key={type} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "#F8FAFC", borderRadius: 6, cursor: "grab", marginBottom: 8, border: "1px solid #E2E8F0" }}
        draggable onDragStart={(e) => { e.dataTransfer.setData("nodeType", type); e.dataTransfer.effectAllowed = "move"; }}>
        <div style={{ color }}>{icon}</div>
        <span style={{ fontSize: 14 }}>{label}</span>
      </div>
    );
  };

  const fullscreenStyle = isFullscreen ? { position: "fixed" as const, top: 0, left: 0, right: 0, bottom: 0, zIndex: 100, background: "#fff" } : {};

  return (
    <PageLayout title="DAG任务编排">
      {!isFullscreen && <PageBreadcrumb items={breadcrumbItems} />}
      <Card style={{ marginBottom: 16, ...fullscreenStyle }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Space>
            <Button type="primary" icon={<Save size={14} />} onClick={handleSave}>保存</Button>
            <Button icon={<CheckCircle size={14} />} onClick={handleValidate}>验证</Button>
            <Button icon={<Play size={14} />} onClick={handleRun}>立即运行</Button>
            <Button icon={<Maximize2 size={14} />} onClick={handleFullscreen} type={isFullscreen ? "primary" : "default"}>{isFullscreen ? "退出全屏" : "全屏"}</Button>
          </Space>
          <Space>
            <span style={{ color: "#6B7280" }}>调度策略:</span>
            <Select defaultValue={initialDAG.scheduleType} style={{ width: 120 }} options={[{ value: "cron", label: "定时调度" }, { value: "event", label: "事件触发" }, { value: "dependency", label: "依赖触发" }]} />
            <Input placeholder="Cron表达式" style={{ width: 150 }} defaultValue={initialDAG.scheduleConfig} />
          </Space>
        </div>
        {validationResult && !validationResult.valid && (
          <div style={{ marginTop: 12, padding: "8px 12px", background: "#FEF2F2", borderRadius: 4, color: "#EF4444" }}>
            {validationResult.errors.map((err, i) => (<div key={i}>• {err}</div>))}
          </div>
        )}
      </Card>
      <div style={{ display: "flex", gap: 16, height: isFullscreen ? "calc(100vh - 80px)" : "calc(100vh - 280px)", minHeight: 500, ...fullscreenStyle }}>
        {!isFullscreen && (
          <Card title="节点面板" style={{ width: 200, overflow: "auto" }} styles={{ body: { padding: 12 } }}>
            <Collapse defaultActiveKey={["data_integration", "data_governance", "data_processing", "control_flow"]} ghost expandIconPosition="end">
              {NODE_PANEL_CONFIG.map((category) => (
                <Collapse.Panel key={category.category} header={<span style={{ fontWeight: 500 }}>{category.label}</span>}>
                  {category.nodes.map((node) => renderNodePanelItem(node.type as DAGNodeType))}
                </Collapse.Panel>
              ))}
            </Collapse>
          </Card>
        )}
        <Card style={{ flex: 1, overflow: "hidden", ...fullscreenStyle }} styles={{ body: { padding: 0, height: "100%" } }}>
          <DAGEditor initialNodes={nodes} initialEdges={edges} onNodesChange={handleNodesChange} onEdgesChange={handleEdgesChange} onNodeSelect={handleNodeSelect} onNodeEdit={handleNodeEdit} />
        </Card>
        {!isFullscreen && (
          <Card title="属性配置" style={{ width: 280, overflow: "auto" }} styles={{ body: { padding: 16 } }}>
            {selectedNode ? (
              <div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 12, color: "#6B7280", display: "block", marginBottom: 4 }}>节点名称</label>
                  <Input value={selectedNode.name} onChange={(e) => handleUpdateSelectedNode("name", e.target.value)} style={{ width: "100%" }} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 12, color: "#6B7280", display: "block", marginBottom: 4 }}>节点类型</label>
                  <div style={{ fontWeight: 500 }}>{DAG_NODE_TYPE_LABELS[selectedNode.type]}</div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 12, color: "#6B7280", display: "block", marginBottom: 4 }}>关联任务</label>
                  <Select style={{ width: "100%" }} value={selectedNode.config.taskId} onChange={(v) => handleUpdateSelectedNode("taskId", v)} options={[{ value: "task-001", label: "数据接入任务" }, { value: "task-002", label: "数据探查任务" }, { value: "task-003", label: "质量检测任务" }]} allowClear />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 12, color: "#6B7280", display: "block", marginBottom: 4 }}>超时时间（分钟）</label>
                  <InputNumber style={{ width: "100%" }} value={selectedNode.config.timeout || 30} onChange={(v) => handleUpdateSelectedNode("timeout", v)} min={1} max={600} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 12, color: "#6B7280", display: "block", marginBottom: 4 }}>重试次数</label>
                  <InputNumber style={{ width: "100%" }} value={selectedNode.config.retryCount || 3} onChange={(v) => handleUpdateSelectedNode("retryCount", v)} min={0} max={10} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 12, color: "#6B7280", display: "block", marginBottom: 4 }}>失败策略</label>
                  <Select style={{ width: "100%" }} value={selectedNode.config.failureStrategy || "stop"} onChange={(v) => handleUpdateSelectedNode("failureStrategy", v)} options={[{ value: "continue", label: "继续执行" }, { value: "stop", label: "停止整个流程" }]} />
                </div>
              </div>
            ) : (
              <div style={{ color: "#94A3B8", textAlign: "center", padding: 24 }}>点击画布中的节点查看属性</div>
            )}
          </Card>
        )}
      </div>
    </PageLayout>
  );
}
