import { ApiProperty } from '@nestjs/swagger';
import type { DataPermission } from '@ai-datahub/contract';

/**
 * 创建/更新数据权限请求 - 嵌套属性
 */
class UpsertDataPermissionData {
  @ApiProperty({ description: '权限ID（更新时必填）', required: false })
  id?: string;

  @ApiProperty({ description: '角色ID' })
  roleId: string = undefined!;

  @ApiProperty({
    description: '数据范围定义',
    type: 'object',
    additionalProperties: true,
  })
  scope: Record<string, unknown> = undefined!;
}

/**
 * 创建/更新数据权限请求
 */
export class UpsertDataPermissionRequest {
  @ApiProperty({
    description: '数据权限信息',
    type: () => UpsertDataPermissionData,
    required: true,
  })
  permission: Omit<DataPermission, 'createdAt'> & { id?: string } = undefined!;
}

/**
 * 获取角色数据权限请求
 */
export class ListDataPermissionsRequest {
  @ApiProperty({ description: '角色ID' })
  roleId: string = undefined!;

  @ApiProperty({ description: '页码', required: false })
  page?: number = undefined;

  @ApiProperty({ description: '每页数量', required: false })
  pageSize?: number = undefined;
}
