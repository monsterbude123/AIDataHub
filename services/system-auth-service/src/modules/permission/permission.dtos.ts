import { ApiProperty } from '@nestjs/swagger';
import type { Permission } from '@ai-datahub/contract';

/**
 * 获取权限列表请求
 */
export class ListPermissionsRequest {
  @ApiProperty({ description: '搜索关键字', required: false })
  keyword?: string = undefined;

  @ApiProperty({ description: '页码', required: false })
  page?: number = undefined;

  @ApiProperty({ description: '每页数量', required: false })
  pageSize?: number = undefined;
}

/**
 * 创建权限请求
 */
export class CreatePermissionRequest {
  @ApiProperty({
    description: '权限信息',
    type: 'object',
    properties: {
      type: {
        type: 'string',
        enum: ['URI', 'PAGE_ELEMENT'],
        description: '权限类型',
      },
      name: { type: 'string', description: '权限名称' },
      code: { type: 'string', description: '权限编码' },
      resource: { type: 'string', description: '资源标识' },
    },
  })
  permission: Omit<Permission, 'id' | 'createdAt'> = undefined!;
}

/**
 * 绑定权限到角色请求
 */
export class BindPermissionsToRoleRequest {
  @ApiProperty({ description: '角色ID' })
  roleId: string = undefined!;

  @ApiProperty({ description: '权限ID列表', type: [String] })
  permissionIds: string[] = undefined!;
}
