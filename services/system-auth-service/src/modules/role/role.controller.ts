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
import { RoleService } from './role.service';
import type { Result, Role } from '@ai-datahub/contract';

@Controller('roles')
export class RoleController {
  constructor(private readonly service: RoleService) {}

  @Get()
  listRoles(@Query('keyword') keyword?: string): Promise<Result<Role[]>> {
    return this.service.listRoles({ keyword });
  }

  @Post()
  createRole(
    @Body() body: { role: Omit<Role, 'id'> }
  ): Promise<Result<{ roleId: string }>> {
    return this.service.createRole(body);
  }

  @Put()
  updateRole(
    @Body() body: { role: Role }
  ): Promise<Result<{ success: boolean }>> {
    return this.service.updateRole(body);
  }

  @Delete('/:id')
  deleteRole(@Param('id') id: string): Promise<Result<{ success: boolean }>> {
    return this.service.deleteRole({ roleId: id });
  }
}
