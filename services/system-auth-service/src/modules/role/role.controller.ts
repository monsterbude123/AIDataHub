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
import { RoleService } from './role.service';
import type { Result, Role } from '@ai-datahub/contract';
import { createCacheFromEnv } from '@ai-datahub/shared';
import { CreateRoleRequest, UpdateRoleRequest } from './role.dtos';

@ApiTags('角色管理')
@ApiBearerAuth()
@Controller('roles')
export class RoleController {
  private readonly cache = createCacheFromEnv({ defaultTtlMs: 20_000 });

  constructor(private readonly service: RoleService) {}

  @Get()
  @ApiOperation({
    summary: '获取角色列表',
    description: '根据关键字搜索角色列表',
  })
  @ApiResponse({ status: 200, description: '成功返回角色列表' })
  @ApiQuery({ name: 'keyword', description: '搜索关键字', required: false })
  async listRoles(@Query('keyword') keyword?: string): Promise<Result<Role[]>> {
    const cacheKey = `system-auth:roles:${keyword ?? 'all'}`;
    const cached = this.cache.get<Result<Role[]>>(cacheKey);
    if (cached) return cached;
    const result = await this.service.listRoles({ keyword });
    if (result.ok) this.cache.set(cacheKey, result, 15_000);
    return result;
  }

  @Post()
  @ApiOperation({ summary: '创建角色', description: '创建新角色' })
  @ApiResponse({ status: 201, description: '成功创建角色' })
  @ApiResponse({ status: 400, description: '角色编码已存在' })
  createRole(
    @Body() body: CreateRoleRequest
  ): Promise<Result<{ roleId: string }>> {
    this.cache.clear();
    return this.service.createRole(body);
  }

  @Put()
  @ApiOperation({ summary: '更新角色', description: '更新角色信息' })
  @ApiResponse({ status: 200, description: '成功更新角色' })
  @ApiResponse({ status: 404, description: '角色不存在' })
  updateRole(
    @Body() body: UpdateRoleRequest
  ): Promise<Result<{ success: boolean }>> {
    this.cache.clear();
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
    this.cache.clear();
    return this.service.deleteRole({ roleId: id });
  }
}
