/**
 * 任务调度模块 Mock 数据
 */

import type { DAGTask, DAGNode, DAGEdge, DAGNodeType } from "@/types/scheduler";

/**
 * Mock DAG任务节点
 */
export const mockDAGNodes: DAGNode[] = [
  {
    id: "node-1",
    type: "data_input",
    name: "接入订单数据",
    position: { x: 100, y: 100 },
    config: {
      taskId: "task-input-001",
      params: { source: "mysql_orders" },
      timeout: 30,
      retryCount: 3,
      failureStrategy: "stop",
    },
  },
  {
    id: "node-2",
    type: "data_profiling",
    name: "数据探查",
    position: { x: 300, y: 100 },
    config: {
      taskId: "task-profile-001",
      timeout: 60,
      retryCount: 2,
      failureStrategy: "continue",
    },
  },
  {
    id: "node-3",
    type: "quality_check",
    name: "质量检测",
    position: { x: 500, y: 100 },
    config: {
      taskId: "task-quality-001",
      params: { rules: ["rule-001", "rule-002"] },
      timeout: 45,
      retryCount: 2,
      failureStrategy: "stop",
    },
  },
  {
    id: "node-4",
    type: "spark_sql",
    name: "数据转换",
    position: { x: 500, y: 250 },
    config: {
      taskId: "task-sql-001",
      params: { sql: "SELECT * FROM orders WHERE status = 'valid'" },
      timeout: 120,
      retryCount: 3,
      failureStrategy: "stop",
    },
  },
  {
    id: "node-5",
    type: "python_script",
    name: "数据清洗",
    position: { x: 700, y: 250 },
    config: {
      taskId: "task-python-001",
      params: { script: "clean_data.py" },
      timeout: 180,
      retryCount: 2,
      failureStrategy: "stop",
    },
  },
];

/**
 * Mock DAG边
 */
export const mockDAGEdges: DAGEdge[] = [
  { id: "edge-1", source: "node-1", target: "node-2" },
  { id: "edge-2", source: "node-2", target: "node-3" },
  { id: "edge-3", source: "node-3", target: "node-4" },
  { id: "edge-4", source: "node-4", target: "node-5" },
];

/**
 * Mock DAG任务
 */
export const mockDAGTasks: DAGTask[] = [
  {
    id: "dag-001",
    name: "订单数据处理流程",
    description: "从订单数据库接入数据，进行探查、质量检测和清洗",
    status: "published",
    scheduleType: "cron",
    scheduleConfig: "0 2 * * *",
    priority: "high",
    queue: "default",
    nodes: mockDAGNodes,
    edges: mockDAGEdges,
    createdBy: "张三",
    createdAt: "2024-01-01 09:00:00",
    updatedAt: "2024-01-15 10:30:00",
  },
  {
    id: "dag-002",
    name: "用户画像标签计算",
    description: "计算用户行为标签，更新用户画像",
    status: "published",
    scheduleType: "event",
    scheduleConfig: "on_user_behavior_update",
    priority: "medium",
    queue: "user-profile",
    nodes: [
      {
        id: "node-1",
        type: "data_input",
        name: "接入行为日志",
        position: { x: 100, y: 100 },
        config: { timeout: 30 },
      },
      {
        id: "node-2",
        type: "tag_extraction",
        name: "标签提取",
        position: { x: 300, y: 100 },
        config: { timeout: 60 },
      },
    ],
    edges: [{ id: "edge-1", source: "node-1", target: "node-2" }],
    createdBy: "李四",
    createdAt: "2024-01-05 14:00:00",
    updatedAt: "2024-01-10 16:00:00",
  },
  {
    id: "dag-003",
    name: "数据同步测试",
    status: "draft",
    scheduleType: "dependency",
    scheduleConfig: "after_import_complete",
    priority: "low",
    queue: "default",
    nodes: [],
    edges: [],
    createdBy: "王五",
    createdAt: "2024-01-10 11:00:00",
    updatedAt: "2024-01-10 11:00:00",
  },
];

/**
 * 节点面板配置
 */
export const NODE_PANEL_CONFIG = [
  {
    category: "data_integration",
    label: "数据集成",
    nodes: [
      { type: "data_input", label: "数据接入" },
      { type: "data_profiling", label: "数据探查" },
      { type: "standardization", label: "标准化" },
    ],
  },
  {
    category: "data_governance",
    label: "数据治理",
    nodes: [
      { type: "quality_check", label: "质量检测" },
      { type: "tag_extraction", label: "标签提取" },
    ],
  },
  {
    category: "data_processing",
    label: "数据处理",
    nodes: [
      { type: "spark_sql", label: "Spark SQL" },
      { type: "python_script", label: "Python脚本" },
    ],
  },
  {
    category: "control_flow",
    label: "控制流",
    nodes: [
      { type: "condition", label: "条件分支" },
      { type: "loop", label: "循环" },
    ],
  },
];