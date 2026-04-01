import { describe, it, expect } from 'vitest';

import {
  DagEntity,
  DagNode,
} from '../../src/modules/scheduler/entities/dag.entity';

describe('DagEntity', () => {
  it('should create a DAG with nodes', () => {
    const nodes: DagNode[] = [
      { nodeId: 'node-1', taskId: 'task-1' },
      { nodeId: 'node-2', taskId: 'task-2', dependsOn: ['node-1'] },
    ];

    const dag = new DagEntity();
    dag.id = 'dag-1';
    dag.name = 'Simple Pipeline';
    dag.nodes = nodes;
    dag.enabled = true;
    dag.createdAt = new Date();
    dag.updatedAt = new Date();

    expect(dag.id).toBe('dag-1');
    expect(dag.nodes).toHaveLength(2);
    expect(dag.nodes[1].dependsOn).toContain('node-1');
  });

  it('should support linear dependency chain', () => {
    const nodes: DagNode[] = [
      { nodeId: 'a', taskId: 'task-a' },
      { nodeId: 'b', taskId: 'task-b', dependsOn: ['a'] },
      { nodeId: 'c', taskId: 'task-c', dependsOn: ['b'] },
    ];

    const dag = new DagEntity();
    dag.id = 'dag-2';
    dag.name = 'Linear Pipeline';
    dag.nodes = nodes;
    dag.enabled = true;

    // 验证依赖链
    expect(dag.nodes[0].dependsOn).toBeUndefined();
    expect(dag.nodes[1].dependsOn).toContain('a');
    expect(dag.nodes[2].dependsOn).toContain('b');
  });

  it('should detect invalid dependency (non-existent node)', () => {
    const nodes: DagNode[] = [
      { nodeId: 'node-1', taskId: 'task-1' },
      { nodeId: 'node-2', taskId: 'task-2', dependsOn: ['non-existent'] },
    ];

    const dag = new DagEntity();
    dag.id = 'dag-3';
    dag.name = 'Invalid DAG';
    dag.nodes = nodes;
    dag.enabled = true;

    // 检查无效依赖
    const allNodeIds = new Set(dag.nodes.map((n) => n.nodeId));
    const invalidDeps = dag.nodes
      .filter((n) => n.dependsOn)
      .flatMap((n) => n.dependsOn!.filter((d) => !allNodeIds.has(d)));

    expect(invalidDeps).toContain('non-existent');
  });
});
