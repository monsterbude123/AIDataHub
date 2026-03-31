import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { DataPermissionService } from './data-permission.service';
import type {
  Result,
  DataPermission,
  PageResult,
  PageRequest,
} from '@ai-datahub/contract';

@Controller('data-permissions')
export class DataPermissionController {
  constructor(private readonly service: DataPermissionService) {}

  @Post()
  upsertDataPermission(
    @Body()
    body: {
      permission: Omit<DataPermission, 'createdAt'> & { id?: string };
    }
  ): Promise<Result<{ permissionId: string }>> {
    return this.service.upsertDataPermission(body);
  }

  @Get('role/:roleId')
  listDataPermissions(
    @Param('roleId') roleId: string,
    @Query('page') page?: string,
    @Query('size') size?: string
  ): Promise<Result<PageResult<DataPermission>>> {
    const pageRequest: PageRequest = {
      page: page ? parseInt(page, 10) : 1,
      size: size ? parseInt(size, 10) : 20,
    };
    return this.service.listDataPermissions({ roleId, page: pageRequest });
  }
}
