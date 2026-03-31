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
  ApiBody,
} from '@nestjs/swagger';
import { RoleService } from './role.service';
import type { Result, Role } from '@ai-datahub/contract';

@ApiTags('角色管理')
@ApiBearerAuth()
@Controller('roles')
export class RoleController {
  constructor(private readonly service: RoleService) {}

  @Get()
  @ApiOperation({
    summary: '获取角色列表',
    description: '根据关键字搜索角色列表',
  })
  @ApiResponse({ status: 200, description: '成功返回角色列表' })
  @ApiQuery({ name: 'keyword', description: '搜索关键字', required: false })
  listRoles(@Query('keyword') keyword?: string): Promise<Result<Role[]>> {
    return this.service.listRoles({ keyword });
  }

  @Post()
  @ApiOperation({ summary: '创建角色', description: '创建新角色' })
  @ApiResponse({ status: 201, description: '成功创建角色' })
  @ApiResponse({ status: 400, description: '角色编码已存在' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        role: {
          type: 'object',
          properties: {
            name: { type: 'string', description: '角色名称' },
            code: { type: 'string', description: '角色编码' },
            orgId: { type: 'string', description: '组织ID' },
            enabled: { type: 'boolean', description: '是否启用' },
          },
          required: ['name', 'code'],
        },
      },
    },
  })
  createRole(
    @Body() body: { role: Omit<Role, 'id'> }
  ): Promise<Result<{ roleId: string }>> {
    return this.service.createRole(body);
  }

  @Put()
  @ApiOperation({ summary: '更新角色', description: '更新角色信息' })
  @ApiResponse({ status: 200, description: '成功更新角色' })
  @ApiResponse({ status: 404, description: '角色不存在' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        role: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            code: { type: 'string' },
            orgId: { type: 'string' },
            enabled: { type: 'boolean' },
          },
          required: ['id', 'name', 'code'],
        },
      },
    },
  })
  updateRole(
    @Body() body: { role: Role }
  ): Promise<Result<{ success: boolean }>> {
    return this.service.updateRole(body);
  }

  @Delete('/:id')
  @ApiOperation({
    summary: '删除角色',
    description: '删除指定角色（幂等操作）',
  })
  @ApiResponse({ status: 200, description: '成功删除角色' })
  @ApiParam({ name: 'id', description: '角色ID', type: 'string' })
  deleteRole(@Param('id') id: string): Promise<Result<{ success: boolean }>> {
    return this.service.deleteRole({ roleId: id });
  }
}
