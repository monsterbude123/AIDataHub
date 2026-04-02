"use client";

/**
 * DAG 自定义节点组件
 * 用于 ReactFlow 渲染 DAG 任务节点
 */

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Database, FileSearch, Shield, Code, Terminal, GitBranch, RefreshCw, X } from "lucide-react";
import { useMemo } from "react";
import { DAG_NODE_COLORS, DAG_NODE_TYPE_LABELS, type DAGNodeType, type DAGNode } from "@/types/scheduler";

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
 * DAG 节点数据类型
 */
interface DAGNodeData {
  nodeType: DAGNodeType;
  name: string;
  config: DAGNode["config"];
  onDelete?: (id: string) => void;
  onSelect?: (id: string) => void;
}

/**
 * DAG 自定义节点组件
 */
function DAGNodeComponent({ id, data, selected }: NodeProps<DAGNodeData>) {
  const color = useMemo(() => DAG_NODE_COLORS[data.nodeType], [data.nodeType]);
  const label = useMemo(() => DAG_NODE_TYPE_LABELS[data.nodeType], [data.nodeType]);
  const icon = useMemo(() => NODE_ICONS[data.nodeType], [data.nodeType]);

  return (
    <div
      style={{
        position: "relative",
        width: 160,
        padding: "12px 16px",
        background: "#fff",
        border: `2px solid ${selected ? "#2563EB" : color}`,
        borderRadius: 8,
        boxShadow: selected ? "0 0 0 2px rgba(37, 99, 235, 0.2)" : "0 2px 8px rgba(0,0,0,0.1)",
        cursor: "pointer",
        transition: "all 0.2s ease",
      }}
      onClick={() => data.onSelect?.(id)}
    >
      {/* 删除按钮 */}
      {selected && (
        <button
          style={{
            position: "absolute",
            top: -8,
            right: -8,
            width: 20,
            height: 20,
            background: "#EF4444",
            border: "none",
            borderRadius: "50%",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 12,
            zIndex: 10,
          }}
          onClick={(e) => {
            e.stopPropagation();
            data.onDelete?.(id);
          }}
        >
          <X size={12} />
        </button>
      )}

      {/* 节点图标和类型 */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <div style={{ color }}>{icon}</div>
        <span style={{ fontSize: 12, color: "#6B7280" }}>{label}</span>
      </div>

      {/* 节点名称 */}
      <div style={{ fontWeight: 500, color: "#1E293B", fontSize: 14 }}>{data.name}</div>

      {/* 左侧输入 Handle */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          width: 10,
          height: 10,
          background: color,
          border: "2px solid #fff",
        }}
      />

      {/* 右侧输出 Handle */}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          width: 10,
          height: 10,
          background: color,
          border: "2px solid #fff",
        }}
      />
    </div>
  );
}

export default DAGNodeComponent;