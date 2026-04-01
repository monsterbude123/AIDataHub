import type { ID } from '@ai-datahub/contract';

/**
 * DAG 节点定义
 */
export interface DagNode {
  nodeId: ID;
  taskId: ID;
  dependsOn?: ID[];
}

/**
 * DAG 实体
 */
export class DagEntity {
  id!: ID;
  name!: string;
  description?: string;
  nodes!: DagNode[];
  enabled!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}
