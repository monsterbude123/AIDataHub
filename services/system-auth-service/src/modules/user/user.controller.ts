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
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import type { Result, User, PageResult } from '@ai-datahub/contract';
import {
  CreateUserRequest,
  UpdateUserRequest,
  AssignRolesRequest,
} from './user.dtos';

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
  @ApiQuery({ name: 'orgId', description: '组织ID', required: false })
  @ApiQuery({ name: 'keyword', description: '搜索关键字', required: false })
  @ApiQuery({
    name: 'page',
    description: '页码',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'pageSize',
    description: '每页数量',
    required: false,
    type: Number,
  })
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
    @Body() body: CreateUserRequest
  ): Promise<Result<{ userId: string }>> {
    return this.service.createUser(body);
  }

  @Put()
  @ApiOperation({ summary: '更新用户', description: '更新用户信息' })
  @ApiResponse({ status: 200, description: '成功更新用户' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  updateUser(
    @Body() body: UpdateUserRequest
  ): Promise<Result<{ success: boolean }>> {
    return this.service.updateUser(body);
  }

  @Delete('/:id')
  @ApiOperation({
    summary: '删除用户',
    description: '删除指定用户（幂等操作）',
  })
  @ApiResponse({ status: 200, description: '成功删除用户' })
  @ApiParam({ name: 'id', description: '用户ID', type: 'string' })
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
  @ApiParam({ name: 'id', description: '用户ID', type: 'string' })
  assignRoles(
    @Param('id') id: string,
    @Body() body: AssignRolesRequest
  ): Promise<Result<{ success: boolean }>> {
    return this.service.assignRoles({ userId: id, roleIds: body.roleIds });
  }
}
