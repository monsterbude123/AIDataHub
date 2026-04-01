import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { DataPermissionService } from './data-permission.service';
import type {
  Result,
  DataPermission,
  PageResult,
  PageRequest,
} from '@ai-datahub/contract';

@ApiTags('数据权限')
@ApiBearerAuth()
@Controller('data-permissions')
export class DataPermissionController {
  constructor(private readonly service: DataPermissionService) {}

  @Post()
  @ApiOperation({
    summary: '创建/更新数据权限',
    description: '为角色设置数据权限（幂等操作）',
  })
  @ApiResponse({ status: 200, description: '成功设置数据权限' })
  @ApiResponse({ status: 404, description: '角色不存在' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        permission: {
          type: 'object',
          properties: {
            id: { type: 'string', description: '权限ID（更新时必填）' },
            roleId: { type: 'string', description: '角色ID' },
            scope: { type: 'object', description: '数据范围定义' },
          },
          required: ['roleId', 'scope'],
        },
      },
    },
  })
  upsertDataPermission(
    @Body()
    body: {
      permission: Omit<DataPermission, 'createdAt'> & { id?: string };
    }
  ): Promise<Result<{ permissionId: string }>> {
    return this.service.upsertDataPermission(body);
  }

  @Get('role/:roleId')
  @ApiOperation({
    summary: '获取角色的数据权限',
    description: '分页查询指定角色的数据权限',
  })
  @ApiResponse({ status: 200, description: '成功返回数据权限列表' })
  @ApiParam({ name: 'roleId', description: '角色ID', type: 'string' })
  @ApiQuery({ name: 'page', description: '页码', required: false })
  @ApiQuery({ name: 'pageSize', description: '每页数量', required: false })
  listDataPermissions(
    @Param('roleId') roleId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string
  ): Promise<Result<PageResult<DataPermission>>> {
    const pageRequest: PageRequest = {
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 20,
    };
    return this.service.listDataPermissions({ roleId, page: pageRequest });
  }
}
