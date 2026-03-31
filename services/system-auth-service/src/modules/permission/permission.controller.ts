import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { PermissionService } from './permission.service';
import type {
  Result,
  Permission,
  PageResult,
  PageRequest,
} from '@ai-datahub/contract';

@Controller('permissions')
export class PermissionController {
  constructor(private readonly service: PermissionService) {}

  @Get()
  listPermissions(
    @Query('keyword') keyword?: string,
    @Query('page') page?: string,
    @Query('size') size?: string
  ): Promise<Result<PageResult<Permission>>> {
    const pageRequest: PageRequest = {
      page: page ? parseInt(page, 10) : 1,
      size: size ? parseInt(size, 10) : 20,
    };
    return this.service.listPermissions({ keyword, page: pageRequest });
  }

  @Post()
  createPermission(
    @Body() body: { permission: Omit<Permission, 'id' | 'createdAt'> }
  ): Promise<Result<{ permissionId: string }>> {
    return this.service.createPermission(body);
  }

  @Post('bind-to-role')
  bindPermissionsToRole(
    @Body() body: { roleId: string; permissionIds: string[] }
  ): Promise<Result<{ success: boolean }>> {
    return this.service.bindPermissionsToRole(body);
  }
}
