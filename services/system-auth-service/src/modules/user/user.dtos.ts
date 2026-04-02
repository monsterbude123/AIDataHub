import { ApiProperty } from '@nestjs/swagger';
import type { User } from '@ai-datahub/contract';

/**
 * 获取用户列表请求
 */
export class ListUsersRequest {
  @ApiProperty({ description: '组织ID', required: false })
  orgId?: string = undefined;

  @ApiProperty({ description: '搜索关键字', required: false })
  keyword?: string = undefined;

  @ApiProperty({ description: '页码', required: false, minimum: 1 })
  page?: number = undefined;

  @ApiProperty({ description: '每页数量', required: false, minimum: 1 })
  pageSize?: number = undefined;
}

/**
 * 创建用户请求
 */
export class CreateUserRequest {
  @ApiProperty({
    description: '用户信息',
    type: 'object',
    properties: {
      username: { type: 'string', description: '用户名' },
      email: { type: 'string', description: '邮箱' },
      realName: { type: 'string', description: '真实姓名' },
      orgId: { type: 'string', description: '组织ID' },
      status: {
        type: 'string',
        enum: ['ENABLED', 'DISABLED'],
        description: '状态',
      },
    },
  })
  user: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'status'> & {
    status?: User['status'];
  } = undefined!;
}

/**
 * 更新用户请求
 */
export class UpdateUserRequest {
  @ApiProperty({
    description: '用户信息',
    type: 'object',
    additionalProperties: true,
  })
  user: Omit<User, 'createdAt' | 'updatedAt'> = undefined!;
}

/**
 * 删除用户请求
 */
export class DeleteUserRequest {
  @ApiProperty({ description: '用户ID' })
  userId: string = undefined!;
}

/**
 * 分配角色请求
 */
export class AssignRolesRequest {
  @ApiProperty({ description: '角色ID列表', type: [String] })
  roleIds: string[] = undefined!;
}
