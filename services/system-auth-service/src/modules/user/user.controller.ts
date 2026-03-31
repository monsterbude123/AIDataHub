import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Delete,
  Query,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import type { Result, User, PageResult } from '@ai-datahub/contract';

@ApiTags('用户管理')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly service: UserService) {}

  @Get()
  @ApiOperation({
    summary: '获取用户列表',
    description: '分页查询用户列表，支持组织和关键字过滤',
  })
  @ApiResponse({ status: 200, description: '成功返回用户列表' })
  listUsers(
    @Query('orgId') orgId?: string,
    @Query('keyword') keyword?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number
  ): Promise<Result<PageResult<User>>> {
    return this.service.listUsers({
      orgId,
      keyword,
      page: { page: page || 1, pageSize: pageSize || 10 },
    });
  }

  @Post()
  @ApiOperation({ summary: '创建用户', description: '创建新用户' })
  @ApiResponse({ status: 201, description: '成功创建用户' })
  @ApiResponse({ status: 400, description: '用户名已存在' })
  createUser(
    @Body()
    body: {
      user: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'status'> & {
        status?: User['status'];
      };
    }
  ): Promise<Result<{ userId: string }>> {
    return this.service.createUser(body);
  }

  @Put()
  @ApiOperation({ summary: '更新用户', description: '更新用户信息' })
  @ApiResponse({ status: 200, description: '成功更新用户' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  updateUser(
    @Body() body: { user: Omit<User, 'createdAt' | 'updatedAt'> }
  ): Promise<Result<{ success: boolean }>> {
    return this.service.updateUser(body);
  }

  @Delete('/:id')
  @ApiOperation({
    summary: '删除用户',
    description: '删除指定用户（幂等操作）',
  })
  @ApiResponse({ status: 200, description: '成功删除用户' })
  deleteUser(@Param('id') id: string): Promise<Result<{ success: boolean }>> {
    return this.service.deleteUser({ userId: id });
  }

  @Post('/:id/roles')
  @ApiOperation({
    summary: '分配角色',
    description: '为用户分配角色（幂等操作）',
  })
  @ApiResponse({ status: 200, description: '成功分配角色' })
  @ApiResponse({ status: 404, description: '用户或角色不存在' })
  assignRoles(
    @Param('id') id: string,
    @Body() body: { roleIds: string[] }
  ): Promise<Result<{ success: boolean }>> {
    return this.service.assignRoles({ userId: id, roleIds: body.roleIds });
  }
}
