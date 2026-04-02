"use client";

/**
 * DAG 编辑器组件
 * 封装 ReactFlow，提供完整的 DAG 编辑功能
 */

import { useCallback, useEffect, useRef, useState, useMemo, memo } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  type Node,
  type Edge,
  type Connection,
  type NodeTypes,
  type EdgeTypes,
  BackgroundVariant,
  Panel,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import type { DAGNode, DAGEdge, DAGNodeType } from "@/types/scheduler";
import { DAG_NODE_COLORS, DAG_NODE_TYPE_LABELS } from "@/types/scheduler";
import {
  ContextMenu,
  NODE_CONTEXT_MENU_ITEMS,
  EDGE_CONTEXT_MENU_ITEMS,
  type ContextMenuItem,
} from "@/components/ui/ContextMenu";

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
  initialNodes: DAGNode[];
  initialEdges: DAGEdge[];
  onNodesChange?: (nodes: DAGNode[]) => void;
  onEdgesChange?: (edges: DAGEdge[]) => void;
  onNodeSelect?: (node: DAGNode | null) => void;
  onNodeEdit?: (node: DAGNode) => void;
}

/**
 * DAG节点数据类型
 */
type DAGNodeData = Record<string, unknown>;

/**
 * 最大历史记录数
 */
const MAX_HISTORY_SIZE = 50;

/**
 * 防抖延迟时间（毫秒）
 */
const DEBOUNCE_DELAY = 300;

/**
 * 将 DAGNode 转换为 ReactFlow Node
 */
function dagNodeToFlowNode(dagNode: DAGNode): Node<DAGNodeData> {
  return {
    id: dagNode.id,
    type: "dagNode",
    position: dagNode.position,
    data: {
      nodeType: dagNode.type,
      name: dagNode.name,
      config: dagNode.config,
    },
  };
}

/**
 * 将 ReactFlow Node 转换为 DAGNode
 */
function flowNodeToDagNode(flowNode: Node): DAGNode {
  const data = flowNode.data as { nodeType: DAGNodeType; name: string; config: DAGNode["config"] };
  return {
    id: flowNode.id,
    type: data.nodeType,
    name: data.name,
    position: flowNode.position,
    config: data.config || {},
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
    markerEnd: { type: "arrowclosed" as const, color: "#94A3B8" },
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
 * 自定义 DAG 节点组件（带连接点）
 * 使用 memo 优化性能，避免不必要的重渲染
 */
const DAGNodeComponent = memo(function DAGNodeComponent({
  id,
  data,
  selected,
  onContextMenu,
}: {
  id: string;
  data: DAGNodeData;
  selected?: boolean;
  onContextMenu?: (event: React.MouseEvent, nodeId: string) => void;
}) {
  const nodeData = data as { nodeType: DAGNodeType; name: string };
  const color = DAG_NODE_COLORS[nodeData.nodeType];
  const label = DAG_NODE_TYPE_LABELS[nodeData.nodeType];

  const handleContextMenu = (event: React.MouseEvent) => {
    onContextMenu?.(event, id);
  };

  return (
    <div
      onContextMenu={handleContextMenu}
      style={{
        position: "relative",
        width: 160,
        padding: "12px 16px",
        background: "#fff",
        border: `2px solid ${selected ? "#2563EB" : color}`,
        borderRadius: 8,
        boxShadow: selected ? "0 0 0 2px rgba(37, 99, 235, 0.2)" : "0 2px 8px rgba(0,0,0,0.1)",
        cursor: "pointer",
        transition: "box-shadow 0.2s ease, border-color 0.2s ease",
      }}
    >
      {/* 左侧输入连接点 */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        style={{
          width: 10,
          height: 10,
          background: "#94A3B8",
          border: "2px solid #fff",
          borderRadius: "50%",
        }}
      />
      {/* 右侧输出连接点 */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        style={{
          width: 10,
          height: 10,
          background: color,
          border: "2px solid #fff",
          borderRadius: "50%",
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <div style={{ color, fontSize: 12 }}>{label}</div>
      </div>
      <div style={{ fontWeight: 500, color: "#1E293B", fontSize: 14 }}>{nodeData.name}</div>
    </div>
  );
});

/**
 * 自定义 DAG 边组件（支持右键菜单）
 * 使用 memo 优化性能
 */
const DAGEdgeComponent = memo(function DAGEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style,
  markerEnd,
  onContextMenu,
}: {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  style?: React.CSSProperties;
  markerEnd?: string;
  onContextMenu?: (event: React.MouseEvent, edgeId: string) => void;
}) {
  const edgePath = `M${sourceX},${sourceY}L${targetX},${targetY}`;

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onContextMenu?.(event, id);
  };

  return (
    <g onContextMenu={handleContextMenu}>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        style={style}
        markerEnd={markerEnd}
      />
      {/* 增大交互区域 */}
      <path
        d={edgePath}
        fill="none"
        strokeWidth={20}
        stroke="transparent"
        style={{ cursor: "pointer" }}
        onContextMenu={handleContextMenu}
      />
    </g>
  );
});

/**
 * 注册自定义节点类型（工厂函数）
 */
const createNodeTypes = (
  onContextMenu: (event: React.MouseEvent, nodeId: string) => void
): NodeTypes => ({
  dagNode: (props) => <DAGNodeComponent {...props} onContextMenu={onContextMenu} />,
});

/**
 * 注册自定义边类型（工厂函数）
 */
const createEdgeTypes = (
  onContextMenu: (event: React.MouseEvent, edgeId: string) => void
) => ({
  dagEdge: (props: any) => <DAGEdgeComponent {...props} onContextMenu={onContextMenu} />,
});

/**
 * DAG 编辑器组件
 */
function DAGEditorInner({
  initialNodes,
  initialEdges,
  onNodesChange,
  onEdgesChange,
  onNodeSelect,
  onNodeEdit,
}: DAGEditorProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // 转换初始数据
  const initialFlowNodes = useMemo(
    () => initialNodes.map(dagNodeToFlowNode),
    [initialNodes]
  );
  const initialFlowEdges = useMemo(
    () => initialEdges.map(dagEdgeToFlowEdge),
    [initialEdges]
  );

  // ReactFlow 状态
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState(initialFlowNodes);
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState(initialFlowEdges);

  // 历史记录
  const [history, setHistory] = useState<HistorySnapshot[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isUndoRedo = useRef(false);

  // 防抖定时器
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingHistoryRef = useRef<{ nodes: Node[]; edges: Edge[] } | null>(null);

  // 右键菜单状态
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    position: { x: number; y: number };
    type: "node" | "edge";
    targetId: string;
  }>({
    visible: false,
    position: { x: 0, y: 0 },
    type: "node",
    targetId: "",
  });

  // 初始化历史
  useEffect(() => {
    if (history.length === 0) {
      setHistory([{ nodes: initialFlowNodes, edges: initialFlowEdges }]);
      setHistoryIndex(0);
    }
  }, []);

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
    setTimeout(() => { isUndoRedo.current = false; }, 100);
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
    setTimeout(() => { isUndoRedo.current = false; }, 100);
  }, [history, historyIndex, setNodes, setEdges]);

  /**
   * 记录历史（带防抖）
   */
  const saveHistoryDebounced = useCallback((newNodes: Node[], newEdges: Edge[]) => {
    if (isUndoRedo.current) return;

    // 清除之前的定时器
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // 存储待保存的状态
    pendingHistoryRef.current = { nodes: newNodes, edges: newEdges };

    // 设置新的定时器
    debounceTimerRef.current = setTimeout(() => {
      if (pendingHistoryRef.current && !isUndoRedo.current) {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(pendingHistoryRef.current);
        if (newHistory.length > MAX_HISTORY_SIZE) newHistory.shift();
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        pendingHistoryRef.current = null;
      }
      debounceTimerRef.current = null;
    }, DEBOUNCE_DELAY);
  }, [history, historyIndex]);

  /**
   * 立即保存历史（不防抖，用于关键操作）
   */
  const saveHistoryImmediate = useCallback((newNodes: Node[], newEdges: Edge[]) => {
    if (isUndoRedo.current) return;
    // 清除防抖定时器
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    pendingHistoryRef.current = null;

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes: newNodes, edges: newEdges });
    if (newHistory.length > MAX_HISTORY_SIZE) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  /**
   * 处理节点变化（使用防抖）
   */
  const handleNodesChange = useCallback((changes: Parameters<typeof onNodesChangeInternal>[0]) => {
    onNodesChangeInternal(changes);
    // 拖拽操作使用防抖
    const hasPositionChange = changes.some(c => c.type === 'position' && c.dragging);
    if (hasPositionChange) {
      saveHistoryDebounced(nodes, edges);
    }
  }, [onNodesChangeInternal, nodes, edges, saveHistoryDebounced]);

  /**
   * 处理边变化
   */
  const handleEdgesChange = useCallback((changes: Parameters<typeof onEdgesChangeInternal>[0]) => {
    onEdgesChangeInternal(changes);
    // 边的变化立即保存
    saveHistoryImmediate(nodes, edges);
  }, [onNodesChangeInternal, nodes, edges, saveHistoryImmediate]);

  /**
   * 处理连接
   */
  const onConnect = useCallback((connection: Connection) => {
    // 验证连接有效性
    if (connection.source === connection.target) return; // 禁止自连

    // 检查是否已存在相同连接
    const exists = edges.some(e => e.source === connection.source && e.target === connection.target);
    if (exists) return;

    const newEdge: Edge = {
      id: `edge-${Date.now()}`,
      source: connection.source!,
      target: connection.target!,
      type: "dagEdge",
      animated: false,
      style: { stroke: "#94A3B8", strokeWidth: 2 },
      markerEnd: { type: "arrowclosed" as const, color: "#94A3B8" },
    };
    const newEdges = addEdge(newEdge, edges);
    setEdges(newEdges);
    saveHistoryImmediate(nodes, newEdges as Edge[]);
  }, [nodes, edges, setEdges, saveHistoryImmediate]);

  /**
   * 处理选中变化
   */
  const onSelectionChange = useCallback(({ nodes: selectedNodes }: { nodes: Node[] }) => {
    if (onNodeSelect) {
      if (selectedNodes.length > 0) {
        onNodeSelect(flowNodeToDagNode(selectedNodes[0] as Node<DAGNodeData>));
      } else {
        onNodeSelect(null);
      }
    }
  }, [onNodeSelect]);

  /**
   * 处理拖放
   */
  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const nodeType = event.dataTransfer.getData("nodeType") as DAGNodeType;
    if (!nodeType) return;

    const bounds = reactFlowWrapper.current?.getBoundingClientRect();
    if (!bounds) return;

    const position = {
      x: event.clientX - bounds.left - 80,
      y: event.clientY - bounds.top - 25,
    };

    const newNode: Node<DAGNodeData> = {
      id: `node-${Date.now()}`,
      type: "dagNode",
      position,
      data: {
        nodeType,
        name: `${DAG_NODE_TYPE_LABELS[nodeType]} ${nodes.length + 1}`,
        config: { timeout: 30, retryCount: 3, failureStrategy: "stop" },
      },
    };

    const newNodes = [...nodes, newNode];
    setNodes(newNodes);
    saveHistoryImmediate(newNodes, edges);
  }, [nodes, edges, setNodes, saveHistoryImmediate]);

  /**
   * 处理拖拽经过
   */
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  /**
   * 键盘事件
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "z" && !event.shiftKey) {
        event.preventDefault();
        undo();
      }
      if (event.ctrlKey && event.shiftKey && event.key === "z") {
        event.preventDefault();
        redo();
      }
      if (event.key === "Delete" || event.key === "Backspace") {
        const selectedNodeIds = nodes.filter((n) => n.selected).map((n) => n.id);
        if (selectedNodeIds.length > 0) {
          const newNodes = nodes.filter((n) => !selectedNodeIds.includes(n.id));
          const newEdges = edges.filter((e) => !selectedNodeIds.includes(e.source) && !selectedNodeIds.includes(e.target));
          setNodes(newNodes);
          setEdges(newEdges);
          saveHistoryImmediate(newNodes, newEdges);
          onNodeSelect?.(null);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, nodes, edges, setNodes, setEdges, saveHistoryImmediate, onNodeSelect]);

  /**
   * 关闭右键菜单
   */
  const closeContextMenu = useCallback(() => {
    setContextMenu({ visible: false, position: { x: 0, y: 0 }, type: "node", targetId: "" });
  }, []);

  /**
   * 处理节点右键菜单
   */
  const handleNodeContextMenu = useCallback((event: React.MouseEvent, nodeId: string) => {
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({
      visible: true,
      position: { x: event.clientX, y: event.clientY },
      type: "node",
      targetId: nodeId,
    });
  }, []);

  /**
   * 处理连线右键菜单
   */
  const handleEdgeContextMenu = useCallback((event: React.MouseEvent, edgeId: string) => {
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({
      visible: true,
      position: { x: event.clientX, y: event.clientY },
      type: "edge",
      targetId: edgeId,
    });
  }, []);

  /**
   * 处理右键菜单项点击
   */
  const handleContextMenuClick = useCallback((item: ContextMenuItem) => {
    if (contextMenu.type === "node") {
      if (item.key === "edit") {
        const node = nodes.find((n) => n.id === contextMenu.targetId);
        if (node) {
          const dagNode = flowNodeToDagNode(node as Node<DAGNodeData>);
          onNodeSelect?.(dagNode);
          onNodeEdit?.(dagNode);
        }
      } else if (item.key === "delete") {
        const nodeId = contextMenu.targetId;
        const newNodes = nodes.filter((n) => n.id !== nodeId);
        const newEdges = edges.filter((e) => e.source !== nodeId && e.target !== nodeId);
        setNodes(newNodes);
        setEdges(newEdges);
        saveHistoryImmediate(newNodes, newEdges);
        onNodeSelect?.(null);
      }
    } else if (contextMenu.type === "edge") {
      if (item.key === "delete") {
        const edgeId = contextMenu.targetId;
        const newEdges = edges.filter((e) => e.id !== edgeId);
        setEdges(newEdges);
        saveHistoryImmediate(nodes, newEdges);
      }
    }
    closeContextMenu();
  }, [contextMenu, nodes, edges, setNodes, setEdges, saveHistoryImmediate, onNodeSelect, onNodeEdit, closeContextMenu]);

  /**
   * 获取当前右键菜单项
   */
  const currentMenuItems = useMemo(() => {
    const items = contextMenu.type === "node" ? NODE_CONTEXT_MENU_ITEMS : EDGE_CONTEXT_MENU_ITEMS;
    return items.map((item) => ({
      ...item,
      onClick: () => handleContextMenuClick(item),
    }));
  }, [contextMenu.type, handleContextMenuClick]);

  /**
   * 同步节点变化
   */
  useEffect(() => {
    if (onNodesChange) {
      onNodesChange(nodes.map((n) => flowNodeToDagNode(n as Node<DAGNodeData>)));
    }
  }, [nodes, onNodesChange]);

  /**
   * 同步边变化
   */
  useEffect(() => {
    if (onEdgesChange) {
      onEdgesChange(edges.map(flowEdgeToDagEdge));
    }
  }, [edges, onEdgesChange]);

  /**
   * MiniMap 节点颜色
   */
  const minimapNodeColor = (node: Node) => {
    const data = node.data as { nodeType?: DAGNodeType };
    return DAG_NODE_COLORS[data?.nodeType as DAGNodeType] || "#94A3B8";
  };

  /**
   * 动态创建 nodeTypes 和 edgeTypes
   */
  const nodeTypes = useMemo(
    () => createNodeTypes(handleNodeContextMenu),
    [handleNodeContextMenu]
  );
  const edgeTypes = useMemo(
    () => createEdgeTypes(handleEdgeContextMenu),
    [handleEdgeContextMenu]
  );

  // 清理防抖定时器
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div ref={reactFlowWrapper} style={{ width: "100%", height: "100%" }} onClick={closeContextMenu}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        snapToGrid
        snapGrid={[20, 20]}
        // 性能优化配置
        nodesDraggable={true}
        panOnDrag={true}
        zoomOnScroll={true}
        zoomOnPinch={true}
        preventScrolling={true}
        selectNodesOnDrag={false}
        panOnScroll={false}
        // 连线配置
        connectionLineStyle={{ stroke: "#2563EB", strokeWidth: 2 }}
        defaultEdgeOptions={{
          type: "dagEdge",
          animated: false,
          style: { stroke: "#94A3B8", strokeWidth: 2 },
          markerEnd: { type: "arrowclosed" as const, color: "#94A3B8" },
        }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#E2E8F0" />
        <Controls position="bottom-right" showInteractive={false} />
        <MiniMap
          nodeColor={minimapNodeColor}
          nodeStrokeWidth={3}
          zoomable
          pannable
          position="bottom-left"
        />
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
      {/* 右键菜单 */}
      <ContextMenu
        items={currentMenuItems}
        position={contextMenu.position}
        visible={contextMenu.visible}
        onClose={closeContextMenu}
      />
    </div>
  );
}

/**
 * DAG 编辑器组件（带 Provider）
 */
export function DAGEditor(props: DAGEditorProps) {
  return (
    <ReactFlowProvider>
      <DAGEditorInner {...props} />
    </ReactFlowProvider>
  );
}

export default DAGEditor;