import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { MenuService } from './menu.service';
import type { Result, MenuNode } from '@ai-datahub/contract';

@Controller('menu')
export class MenuController {
  constructor(private readonly service: MenuService) {}

  @Get('tree')
  listMenuTree(): Promise<Result<MenuNode[]>> {
    return this.service.listMenuTree({});
  }

  @Post('upsert')
  upsertMenuNode(
    @Body()
    body: {
      node: Omit<MenuNode, 'createdAt' | 'updatedAt'> & { id?: string };
    }
  ): Promise<Result<{ nodeId: string }>> {
    return this.service.upsertMenuNode(body);
  }

  @Delete(':id')
  deleteMenuNode(
    @Param('id') id: string
  ): Promise<Result<{ success: boolean }>> {
    return this.service.deleteMenuNode({ nodeId: id });
  }
}
