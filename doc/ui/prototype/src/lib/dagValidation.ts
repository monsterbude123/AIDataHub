/**
 * DAG 验证逻辑
 * 验证 DAG 任务的正确性
 */

import type { DAGNode, DAGEdge } from "@/types/scheduler";

/**
 * 验证结果
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * 检测环路（使用 DFS）
 */
function detectCycle(nodes: DAGNode[], edges: DAGEdge[]): string[] {
  const errors: string[] = [];
  const adjacencyList: Map<string, string[]> = new Map();

  // 构建邻接表
  nodes.forEach((node) => adjacencyList.set(node.id, []));
  edges.forEach((edge) => {
    const targets = adjacencyList.get(edge.source) || [];
    targets.push(edge.target);
    adjacencyList.set(edge.source, targets);
  });

  // DFS 检测环路
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const cyclePath: string[] = [];

  function dfs(nodeId: string): boolean {
    visited.add(nodeId);
    recursionStack.add(nodeId);

    const neighbors = adjacencyList.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) {
          cyclePath.push(nodeId);
          return true;
        }
      } else if (recursionStack.has(neighbor)) {
        cyclePath.push(neighbor);
        cyclePath.push(nodeId);
        return true;
      }
    }

    recursionStack.delete(nodeId);
    return false;
  }

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      if (dfs(node.id)) {
        errors.push(`检测到环路: ${cyclePath.reverse().join(" → ")}`);
        break;
      }
    }
  }

  return errors;
}

/**
 * 检测孤立节点
 */
function detectIsolatedNodes(nodes: DAGNode[], edges: DAGEdge[]): string[] {
  const errors: string[] = [];
  const connectedNodes = new Set<string>();

  edges.forEach((edge) => {
    connectedNodes.add(edge.source);
    connectedNodes.add(edge.target);
  });

  // 单个节点的情况不算孤立
  if (nodes.length <= 1) {
    return [];
  }

  nodes.forEach((node) => {
    if (!connectedNodes.has(node.id)) {
      errors.push(`节点 "${node.name}" 是孤立节点，没有任何连接`);
    }
  });

  return errors;
}

/**
 * 检测未配置参数的节点
 */
function detectMissingConfig(nodes: DAGNode[]): string[] {
  const warnings: string[] = [];

  nodes.forEach((node) => {
    if (!node.config.taskId) {
      warnings.push(`节点 "${node.name}" 未关联任务`);
    }
    if (!node.config.timeout) {
      warnings.push(`节点 "${node.name}" 未设置超时时间`);
    }
  });

  return warnings;
}

/**
 * 验证 DAG 任务
 */
export function validateDAG(nodes: DAGNode[], edges: DAGEdge[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. 检测环路
  const cycleErrors = detectCycle(nodes, edges);
  errors.push(...cycleErrors);

  // 2. 检测孤立节点
  const isolatedErrors = detectIsolatedNodes(nodes, edges);
  errors.push(...isolatedErrors);

  // 3. 检测未配置参数
  const configWarnings = detectMissingConfig(nodes);
  warnings.push(...configWarnings);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * 获取 DAG 入口节点（无上游依赖的节点）
 */
export function getEntryNodes(nodes: DAGNode[], edges: DAGEdge[]): DAGNode[] {
  const hasIncomingEdge = new Set<string>();
  edges.forEach((edge) => hasIncomingEdge.add(edge.target));

  return nodes.filter((node) => !hasIncomingEdge.has(node.id));
}

/**
 * 获取 DAG 出口节点（无下游依赖的节点）
 */
export function getExitNodes(nodes: DAGNode[], edges: DAGEdge[]): DAGNode[] {
  const hasOutgoingEdge = new Set<string>();
  edges.forEach((edge) => hasOutgoingEdge.add(edge.source));

  return nodes.filter((node) => !hasOutgoingEdge.has(node.id));
}

/**
 * 获取节点的所有上游节点
 */
export function getUpstreamNodes(nodeId: string, nodes: DAGNode[], edges: DAGEdge[]): DAGNode[] {
  const upstreamIds = new Set<string>();
  const visited = new Set<string>();

  function traverse(id: string) {
    if (visited.has(id)) return;
    visited.add(id);

    edges.forEach((edge) => {
      if (edge.target === id) {
        upstreamIds.add(edge.source);
        traverse(edge.source);
      }
    });
  }

  traverse(nodeId);
  return nodes.filter((node) => upstreamIds.has(node.id));
}

/**
 * 获取节点的所有下游节点
 */
export function getDownstreamNodes(nodeId: string, nodes: DAGNode[], edges: DAGEdge[]): DAGNode[] {
  const downstreamIds = new Set<string>();
  const visited = new Set<string>();

  function traverse(id: string) {
    if (visited.has(id)) return;
    visited.add(id);

    edges.forEach((edge) => {
      if (edge.source === id) {
        downstreamIds.add(edge.target);
        traverse(edge.target);
      }
    });
  }

  traverse(nodeId);
  return nodes.filter((node) => downstreamIds.has(node.id));
}