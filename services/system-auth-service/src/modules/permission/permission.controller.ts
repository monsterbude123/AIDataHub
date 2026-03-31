import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { PermissionService } from './permission.service';
import type {
  Result,
  Permission,
  PageResult,
  PageRequest,
} from '@ai-datahub/contract';

@ApiTags('权限管理')
@ApiBearerAuth()
@Controller('permissions')
export class PermissionController {
  constructor(private readonly service: PermissionService) {}

  @Get()
  @ApiOperation({ summary: '获取权限列表', description: '分页查询权限列表' })
  @ApiResponse({ status: 200, description: '成功返回权限列表' })
  @ApiQuery({ name: 'keyword', description: '搜索关键字', required: false })
  @ApiQuery({ name: 'page', description: '页码', required: false })
  @ApiQuery({ name: 'pageSize', description: '每页数量', required: false })
  listPermissions(
    @Query('keyword') keyword?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string
  ): Promise<Result<PageResult<Permission>>> {
    const pageRequest: PageRequest = {
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 20,
    };
    return this.service.listPermissions({ keyword, page: pageRequest });
  }

  @Post()
  @ApiOperation({
    summary: '创建权限',
    description: '创建新权限（URI或页面元素）',
  })
  @ApiResponse({ status: 201, description: '成功创建权限' })
  @ApiResponse({ status: 400, description: '权限编码已存在' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        permission: {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['URI', 'PAGE_ELEMENT'] },
            name: { type: 'string', description: '权限名称' },
            code: { type: 'string', description: '权限编码' },
            resource: { type: 'string', description: '资源标识' },
          },
          required: ['type', 'name', 'code', 'resource'],
        },
      },
    },
  })
  createPermission(
    @Body() body: { permission: Omit<Permission, 'id' | 'createdAt'> }
  ): Promise<Result<{ permissionId: string }>> {
    return this.service.createPermission(body);
  }

  @Post('bind-to-role')
  @ApiOperation({
    summary: '绑定权限到角色',
    description: '将权限绑定到指定角色（幂等操作）',
  })
  @ApiResponse({ status: 200, description: '成功绑定权限' })
  @ApiResponse({ status: 404, description: '角色或权限不存在' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        roleId: { type: 'string', description: '角色ID' },
        permissionIds: {
          type: 'array',
          items: { type: 'string' },
          description: '权限ID列表',
        },
      },
      required: ['roleId', 'permissionIds'],
    },
  })
  bindPermissionsToRole(
    @Body() body: { roleId: string; permissionIds: string[] }
  ): Promise<Result<{ success: boolean }>> {
    return this.service.bindPermissionsToRole(body);
  }
}
