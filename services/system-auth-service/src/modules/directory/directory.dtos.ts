import { ApiProperty } from '@nestjs/swagger';
import type { DirectoryTreeNode } from '@ai-datahub/contract';

/**
 * 获取目录树请求
 */
export class ListDirectoryTreeRequest {
  @ApiProperty({ description: '父节点ID', required: false })
  parentId?: string = undefined;

  @ApiProperty({ description: '搜索关键字', required: false })
  keyword?: string = undefined;
}

/**
 * 创建/更新目录节点请求 - 嵌套属性
 */
class UpsertDirectoryNodeData {
  @ApiProperty({ description: '节点ID（更新时必填）', required: false })
  id?: string;

  @ApiProperty({ description: '父节点ID', required: false })
  parentId?: string;

  @ApiProperty({ description: '节点名称' })
  name: string = undefined!;

  @ApiProperty({ description: '节点编码' })
  code: string = undefined!;

  @ApiProperty({
    description: '扩展属性',
    type: 'object',
    required: false,
    additionalProperties: true,
  })
  attributes?: Record<string, unknown>;
}

/**
 * 创建/更新目录节点请求
 */
export class UpsertDirectoryNodeRequest {
  @ApiProperty({
    description: '目录节点信息',
    type: () => UpsertDirectoryNodeData,
    required: true,
  })
  node: Omit<DirectoryTreeNode, 'createdAt' | 'updatedAt'> & {
    id?: string;
  } = undefined!;
}

/**
 * 删除目录节点请求
 */
export class DeleteDirectoryNodeRequest {
  @ApiProperty({ description: '目录节点ID' })
  nodeId: string = undefined!;
}
