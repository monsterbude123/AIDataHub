import { ApiProperty } from '@nestjs/swagger';
import type { Role } from '@ai-datahub/contract';

/**
 * 获取角色列表请求
 */
export class ListRolesRequest {
  @ApiProperty({ description: '搜索关键字', required: false })
  keyword?: string = undefined;
}

/**
 * 创建角色请求 - 嵌套属性
 */
class CreateRoleData {
  @ApiProperty({ description: '角色名称' })
  name: string = undefined!;

  @ApiProperty({ description: '角色编码' })
  code: string = undefined!;

  @ApiProperty({ description: '组织ID', required: false })
  orgId?: string;

  @ApiProperty({ description: '是否启用', required: false })
  enabled?: boolean;
}

/**
 * 创建角色请求
 */
export class CreateRoleRequest {
  @ApiProperty({
    description: '角色信息',
    type: () => CreateRoleData,
    required: true,
  })
  role: Omit<Role, 'id'> = undefined!;
}

/**
 * 更新角色请求
 */
export class UpdateRoleRequest {
  @ApiProperty({
    description: '角色信息',
    type: 'object',
    required: true,
    additionalProperties: true,
  })
  role: Role = undefined!;
}

/**
 * 删除角色请求
 */
export class DeleteRoleRequest {
  @ApiProperty({ description: '角色ID' })
  roleId: string = undefined!;
}
