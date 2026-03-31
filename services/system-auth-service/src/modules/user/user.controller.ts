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
import { UserService } from './user.service';
import type { Result, User, PageResult } from '@ai-datahub/contract';

@Controller('users')
export class UserController {
  constructor(private readonly service: UserService) {}

  @Get()
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
  updateUser(
    @Body() body: { user: Omit<User, 'createdAt' | 'updatedAt'> }
  ): Promise<Result<{ success: boolean }>> {
    return this.service.updateUser(body);
  }

  @Delete('/:id')
  deleteUser(@Param('id') id: string): Promise<Result<{ success: boolean }>> {
    return this.service.deleteUser({ userId: id });
  }

  @Post('/:id/roles')
  assignRoles(
    @Param('id') id: string,
    @Body() body: { roleIds: string[] }
  ): Promise<Result<{ success: boolean }>> {
    return this.service.assignRoles({ userId: id, roleIds: body.roleIds });
  }
}
