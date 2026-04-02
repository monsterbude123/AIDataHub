"use client";

/**
 * DAG 编辑器组件
 * 封装 ReactFlow，提供完整的 DAG 编辑功能
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type Connection,
  type OnNodesChange,
  type OnEdgesChange,
  type NodeTypes,
  BackgroundVariant,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import DAGNodeComponent from "./DAGNodeComponent";
import type { DAGNode, DAGEdge, DAGNodeType } from "@/types/scheduler";
import { DAG_NODE_COLORS, DAG_NODE_TYPE_LABELS } from "@/types/scheduler";

/**
 * 历史快照类型
 */
interface HistorySnapshot {
  nodes: Node[];
  edges: Edge[];
}

/**
 * DAG 编辑器属性
 */
interface DAGEditorProps {
  /** 初始 DAG 节点 */
  initialNodes: DAGNode[];
  /** 初始 DAG 边 */
  initialEdges: DAGEdge[];
  /** 节点变化回调 */
  onNodesChange?: (nodes: DAGNode[]) => void;
  /** 边变化回调 */
  onEdgesChange?: (edges: DAGEdge[]) => void;
  /** 节点选中回调 */
  onNodeSelect?: (node: DAGNode | null) => void;
  /** 验证结果回调 */
  onValidationChange?: (valid: boolean, errors: string[]) => void;
}

/**
 * 注册自定义节点类型
 */
const nodeTypes: NodeTypes = {
  dagNode: DAGNodeComponent,
};

/**
 * 最大历史记录数
 */
const MAX_HISTORY_SIZE = 50;

/**
 * 将 DAGNode 转换为 ReactFlow Node
 */
function dagNodeToFlowNode(
  dagNode: DAGNode,
  onDelete: (id: string) => void,
  onSelect: (id: string) => void
): Node {
  return {
    id: dagNode.id,
    type: "dagNode",
    position: dagNode.position,
    data: {
      nodeType: dagNode.type,
      name: dagNode.name,
      config: dagNode.config,
      onDelete,
      onSelect,
    },
  };
}

/**
 * 将 ReactFlow Node 转换为 DAGNode
 */
function flowNodeToDagNode(flowNode: Node): DAGNode {
  return {
    id: flowNode.id,
    type: flowNode.data.nodeType as DAGNodeType,
    name: flowNode.data.name as string,
    position: flowNode.position,
    config: flowNode.data.config || {},
  };
}

/**
 * 将 DAGEdge 转换为 ReactFlow Edge
 */
function dagEdgeToFlowEdge(dagEdge: DAGEdge): Edge {
  return {
    id: dagEdge.id,
    source: dagEdge.source,
    target: dagEdge.target,
    animated: false,
    style: { stroke: "#94A3B8", strokeWidth: 2 },
    markerEnd: { type: "arrowclosed", color: "#94A3B8" },
  };
}

/**
 * 将 ReactFlow Edge 转换为 DAGEdge
 */
function flowEdgeToDagEdge(flowEdge: Edge): DAGEdge {
  return {
    id: flowEdge.id,
    source: flowEdge.source,
    target: flowEdge.target,
  };
}

/**
 * DAG 编辑器组件
 */
export function DAGEditor({
  initialNodes,
  initialEdges,
  onNodesChange,
  onEdgesChange,
  onNodeSelect,
  onValidationChange,
}: DAGEditorProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReturnType<typeof useNodesState>[0] | null>(null);

  // 历史记录（用于撤销/重做）
  const [history, setHistory] = useState<HistorySnapshot[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isUndoRedo = useRef(false);

  /**
   * 删除节点处理函数
   */
  const handleDeleteNode = useCallback(
    (id: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== id));
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    },
    [setNodes, setEdges]
  );

  /**
   * 选中节点处理函数
   */
  const handleSelectNode = useCallback(
    (id: string) => {
      const flowNode = nodes.find((n) => n.id === id);
      if (flowNode && onNodeSelect) {
        onNodeSelect(flowNodeToDagNode(flowNode));
      }
    },
    [nodes, onNodeSelect]
  );

  /**
   * 初始化 ReactFlow 节点状态
   */
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState(
    initialNodes.map((n) => dagNodeToFlowNode(n, handleDeleteNode, handleSelectNode))
  );

  /**
   * 初始化 ReactFlow 边状态
   */
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState(
    initialEdges.map(dagEdgeToFlowEdge)
  );

  /**
   * 更新节点数据函数（用于属性面板编辑）
   */
  const updateNodeData = useCallback(
    (id: string, newData: Partial<{ name: string; config: DAGNode["config"] }>) => {
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === id) {
            return {
              ...n,
              data: {
                ...n.data,
                ...newData,
              },
            };
          }
          return n;
        })
      );
    },
    [setNodes]
  );

  /**
   * 记录历史快照
   */
  const saveHistory = useCallback(
    (newNodes: Node[], newEdges: Edge[]) => {
      if (isUndoRedo.current) return;

      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push({ nodes: newNodes, edges: newEdges });

      if (newHistory.length > MAX_HISTORY_SIZE) {
        newHistory.shift();
      }

      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    },
    [history, historyIndex]
  );

  /**
   * 撤销操作
   */
  const undo = useCallback(() => {
    if (historyIndex <= 0) return;

    isUndoRedo.current = true;
    const newIndex = historyIndex - 1;
    const snapshot = history[newIndex];

    setNodes(snapshot.nodes);
    setEdges(snapshot.edges);
    setHistoryIndex(newIndex);

    setTimeout(() => {
      isUndoRedo.current = false;
    }, 100);
  }, [history, historyIndex, setNodes, setEdges]);

  /**
   * 重做操作
   */
  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;

    isUndoRedo.current = true;
    const newIndex = historyIndex + 1;
    const snapshot = history[newIndex];

    setNodes(snapshot.nodes);
    setEdges(snapshot.edges);
    setHistoryIndex(newIndex);

    setTimeout(() => {
      isUndoRedo.current = false;
    }, 100);
  }, [history, historyIndex, setNodes, setEdges]);

  /**
   * 处理节点变化（记录历史）
   */
  const handleNodesChange: OnNodesChange = useCallback(
    (changes) => {
      onNodesChangeInternal(changes);
      const newNodes = nodes.map((n) => {
        const change = changes.find((c) => c.id === n.id);
        if (change && change.type === "position" && change.position) {
          return { ...n, position: change.position };
        }
        return n;
      });
      saveHistory(newNodes, edges);
    },
    [onNodesChangeInternal, nodes, edges, saveHistory]
  );

  /**
   * 处理边变化（记录历史）
   */
  const handleEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      onEdgesChangeInternal(changes);
      saveHistory(nodes, edges);
    },
    [onEdgesChangeInternal, nodes, edges, saveHistory]
  );

  /**
   * 处理连接（创建新边）
   */
  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge = {
        ...connection,
        id: `edge-${Date.now()}`,
        animated: false,
        style: { stroke: "#94A3B8", strokeWidth: 2 },
        markerEnd: { type: "arrowclosed", color: "#94A3B8" },
      };
      setEdges((eds) => addEdge(newEdge, eds));
      saveHistory(nodes, [...edges, newEdge]);
    },
    [nodes, edges, setEdges, saveHistory]
  );

  /**
   * 处理拖放新节点
   */
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const nodeType = event.dataTransfer.getData("nodeType") as DAGNodeType;
      if (!nodeType || !reactFlowInstance) return;

      // 获取拖放位置
      const bounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!bounds) return;

      const position = {
        x: event.clientX - bounds.left - 80,
        y: event.clientY - bounds.top - 25,
      };

      // 创建新节点
      const newNode: Node = {
        id: `node-${Date.now()}`,
        type: "dagNode",
        position,
        data: {
          nodeType,
          name: `${DAG_NODE_TYPE_LABELS[nodeType]} ${nodes.length + 1}`,
          config: {
            timeout: 30,
            retryCount: 3,
            failureStrategy: "stop",
          },
          onDelete: handleDeleteNode,
          onSelect: handleSelectNode,
        },
      };

      setNodes((nds) => [...nds, newNode]);
      saveHistory([...nodes, newNode], edges);
    },
    [reactFlowInstance, nodes, edges, setNodes, handleDeleteNode, handleSelectNode, saveHistory]
  );

  /**
   * 处理拖拽经过
   */
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  /**
   * 处理键盘事件（撤销/重做/删除）
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+Z 撤销
      if (event.ctrlKey && event.key === "z" && !event.shiftKey) {
        event.preventDefault();
        undo();
      }
      // Ctrl+Shift+Z 重做
      if (event.ctrlKey && event.shiftKey && event.key === "z") {
        event.preventDefault();
        redo();
      }
      // Delete 删除选中节点
      if (event.key === "Delete" || event.key === "Backspace") {
        const selectedNodes = nodes.filter((n) => n.selected);
        if (selectedNodes.length > 0) {
          const selectedIds = selectedNodes.map((n) => n.id);
          setNodes((nds) => nds.filter((n) => !selectedIds.includes(n.id)));
          setEdges((eds) =>
            eds.filter((e) => !selectedIds.includes(e.source) && !selectedIds.includes(e.target))
          );
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, nodes, setNodes, setEdges]);

  /**
   * 同步节点变化到外部
   */
  useEffect(() => {
    if (onNodesChange) {
      onNodesChange(nodes.map(flowNodeToDagNode));
    }
  }, [nodes, onNodesChange]);

  /**
   * 同步边变化到外部
   */
  useEffect(() => {
    if (onEdgesChange) {
      onEdgesChange(edges.map(flowEdgeToDagEdge));
    }
  }, [edges, onEdgesChange]);

  /**
   * 初始化历史记录
   */
  useEffect(() => {
    if (history.length === 0) {
      const initialFlowNodes = initialNodes.map((n) => dagNodeToFlowNode(n, handleDeleteNode, handleSelectNode));
      const initialFlowEdges = initialEdges.map(dagEdgeToFlowEdge);
      setHistory([{ nodes: initialFlowNodes, edges: initialFlowEdges }]);
      setHistoryIndex(0);
    }
  }, []);

  /**
   * MiniMap 节点颜色
   */
  const minimapNodeColor = (node: Node) => {
    return DAG_NODE_COLORS[node.data.nodeType as DAGNodeType] || "#94A3B8";
  };

  return (
    <div ref={reactFlowWrapper} style={{ width: "100%", height: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid
        snapGrid={[20, 20]}
        defaultEdgeOptions={{
          animated: false,
          style: { stroke: "#94A3B8", strokeWidth: 2 },
          markerEnd: { type: "arrowclosed", color: "#94A3B8" },
        }}
      >
        {/* 背景网格 */}
        <Background variant={BackgroundVariant.Lines} gap={20} size={1} color="#E2E8F0" />

        {/* 控制面板（缩放/居中） */}
        <Controls position="bottom-right" />

        {/* 小地图 */}
        <MiniMap
          nodeColor={minimapNodeColor}
          nodeStrokeWidth={3}
          zoomable
          pannable
          position="bottom-left"
        />

        {/* 撤销/重做按钮面板 */}
        <Panel position="top-left">
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              style={{
                padding: "6px 12px",
                background: historyIndex <= 0 ? "#E2E8F0" : "#fff",
                border: "1px solid #E2E8F0",
                borderRadius: 4,
                cursor: historyIndex <= 0 ? "not-allowed" : "pointer",
                fontSize: 12,
              }}
            >
              撤销 (Ctrl+Z)
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              style={{
                padding: "6px 12px",
                background: historyIndex >= history.length - 1 ? "#E2E8F0" : "#fff",
                border: "1px solid #E2E8F0",
                borderRadius: 4,
                cursor: historyIndex >= history.length - 1 ? "not-allowed" : "pointer",
                fontSize: 12,
              }}
            >
              重做 (Ctrl+Shift+Z)
            </button>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}

export default DAGEditor;