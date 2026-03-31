import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
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
