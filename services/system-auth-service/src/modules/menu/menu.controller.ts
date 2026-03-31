import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { MenuService } from './menu.service';
import type { Result, MenuNode } from '@ai-datahub/contract';

@ApiTags('菜单管理')
@ApiBearerAuth()
@Controller('menu')
export class MenuController {
  constructor(private readonly service: MenuService) {}

  @Get('tree')
  @ApiOperation({ summary: '获取菜单树', description: '获取完整的菜单树结构' })
  @ApiResponse({ status: 200, description: '成功返回菜单树' })
  listMenuTree(): Promise<Result<MenuNode[]>> {
    return this.service.listMenuTree({});
  }

  @Post('upsert')
  @ApiOperation({
    summary: '创建/更新菜单节点',
    description: '创建或更新菜单节点（幂等操作）',
  })
  @ApiResponse({ status: 200, description: '成功创建/更新菜单节点' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        node: {
          type: 'object',
          properties: {
            id: { type: 'string', description: '节点ID（更新时必填）' },
            parentId: { type: 'string', description: '父节点ID' },
            type: { type: 'string', enum: ['DIRECTORY', 'MENU', 'BUTTON'] },
            name: { type: 'string', description: '节点名称' },
            path: { type: 'string', description: '路由路径' },
            icon: { type: 'string', description: '图标' },
            permissionCode: { type: 'string', description: '权限码' },
            enabled: { type: 'boolean', description: '是否启用' },
            sort: { type: 'number', description: '排序' },
          },
        },
      },
    },
  })
  upsertMenuNode(
    @Body()
    body: {
      node: Omit<MenuNode, 'createdAt' | 'updatedAt'> & { id?: string };
    }
  ): Promise<Result<{ nodeId: string }>> {
    return this.service.upsertMenuNode(body);
  }

  @Delete(':id')
  @ApiOperation({
    summary: '删除菜单节点',
    description: '删除菜单节点及其子节点（幂等操作）',
  })
  @ApiResponse({ status: 200, description: '成功删除菜单节点' })
  @ApiParam({ name: 'id', description: '菜单节点ID', type: 'string' })
  deleteMenuNode(
    @Param('id') id: string
  ): Promise<Result<{ success: boolean }>> {
    return this.service.deleteMenuNode({ nodeId: id });
  }
}
