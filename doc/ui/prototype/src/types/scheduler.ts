/**
 * 任务调度模块类型定义
 */

/**
 * DAG节点类型
 */
export type DAGNodeType =
  | "data_input"
  | "data_profiling"
  | "standardization"
  | "quality_check"
  | "tag_extraction"
  | "spark_sql"
  | "python_script"
  | "condition"
  | "loop";

/**
 * DAG节点分类
 */
export const DAG_NODE_CATEGORIES = {
  data_integration: {
    label: "数据集成",
    nodes: ["data_input", "data_profiling", "standardization"],
  },
  data_governance: {
    label: "数据治理",
    nodes: ["quality_check", "tag_extraction"],
  },
  data_processing: {
    label: "数据处理",
    nodes: ["spark_sql", "python_script"],
  },
  control_flow: {
    label: "控制流",
    nodes: ["condition", "loop"],
  },
} as const;

/**
 * DAG节点标签
 */
export const DAG_NODE_TYPE_LABELS: Record<DAGNodeType, string> = {
  data_input: "数据接入",
  data_profiling: "数据探查",
  standardization: "标准化",
  quality_check: "质量检测",
  tag_extraction: "标签提取",
  spark_sql: "Spark SQL",
  python_script: "Python脚本",
  condition: "条件分支",
  loop: "循环",
};

/**
 * DAG节点图标颜色
 */
export const DAG_NODE_COLORS: Record<DAGNodeType, string> = {
  data_input: "#3B82F6",
  data_profiling: "#10B981",
  standardization: "#8B5CF6",
  quality_check: "#F59E0B",
  tag_extraction: "#EC4899",
  spark_sql: "#EF4444",
  python_script: "#14B8A6",
  condition: "#6366F1",
  loop: "#84CC16",
};

/**
 * DAG任务状态
 */
export type DAGStatus = "draft" | "published" | "archived";

/**
 * DAG任务
 */
export interface DAGTask {
  id: string;
  name: string;
  description?: string;
  status: DAGStatus;
  scheduleType: "cron" | "event" | "dependency";
  scheduleConfig: string;
  priority: "high" | "medium" | "low";
  queue: string;
  nodes: DAGNode[];
  edges: DAGEdge[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * DAG节点
 */
export interface DAGNode {
  id: string;
  type: DAGNodeType;
  name: string;
  position: { x: number; y: number };
  config: {
    taskId?: string;
    params?: Record<string, unknown>;
    timeout?: number;
    retryCount?: number;
    failureStrategy?: "continue" | "stop";
  };
}

/**
 * DAG边（连接线）
 */
export interface DAGEdge {
  id: string;
  source: string;
  target: string;
  condition?: string;
}