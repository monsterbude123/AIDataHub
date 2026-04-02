import { ApiProperty } from '@nestjs/swagger';
import type { MenuNode } from '@ai-datahub/contract';

/**
 * 创建/更新菜单节点请求 - 嵌套属性
 */
class UpsertMenuNodeData {
  @ApiProperty({ description: '节点ID（更新时必填）', required: false })
  id?: string;

  @ApiProperty({ description: '父节点ID', required: false })
  parentId?: string;

  @ApiProperty({
    description: '节点类型',
    enum: ['DIRECTORY', 'MENU', 'BUTTON'],
  })
  type: 'DIRECTORY' | 'MENU' | 'BUTTON' = undefined!;

  @ApiProperty({ description: '节点名称' })
  name: string = undefined!;

  @ApiProperty({ description: '路由路径', required: false })
  path?: string;

  @ApiProperty({ description: '图标', required: false })
  icon?: string;

  @ApiProperty({ description: '权限码', required: false })
  permissionCode?: string;

  @ApiProperty({ description: '是否启用', required: false })
  enabled?: boolean;

  @ApiProperty({ description: '排序', required: false })
  sort?: number;
}

/**
 * 创建/更新菜单节点请求
 */
export class UpsertMenuNodeRequest {
  @ApiProperty({
    description: '菜单节点信息',
    type: () => UpsertMenuNodeData,
    required: true,
  })
  node: Omit<MenuNode, 'createdAt' | 'updatedAt'> & { id?: string } =
    undefined!;
}

/**
 * 删除菜单节点请求
 */
export class DeleteMenuNodeRequest {
  @ApiProperty({ description: '菜单节点ID' })
  nodeId: string = undefined!;
}
