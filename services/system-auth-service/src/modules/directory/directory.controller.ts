import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DirectoryService } from './directory.service';
import type { Result, DirectoryTreeNode } from '@ai-datahub/contract';

@ApiTags('目录树管理')
@ApiBearerAuth()
@Controller('directory')
export class DirectoryController {
  constructor(private readonly service: DirectoryService) {}

  @Get('tree')
  @ApiOperation({
    summary: '获取目录树',
    description: '获取目录树节点列表，支持父节点和关键字过滤',
  })
  @ApiResponse({ status: 200, description: '成功返回目录树节点' })
  listDirectoryTree(
    @Query('parentId') parentId?: string,
    @Query('keyword') keyword?: string
  ): Promise<Result<DirectoryTreeNode[]>> {
    return this.service.listDirectoryTree({
      parentId,
      keyword,
    });
  }

  @Post('upsert')
  @ApiOperation({
    summary: '创建/更新目录节点',
    description: '创建或更新目录节点（幂等操作）',
  })
  @ApiResponse({ status: 200, description: '成功创建/更新目录节点' })
  upsertDirectoryNode(
    @Body()
    body: {
      node: Omit<DirectoryTreeNode, 'createdAt' | 'updatedAt'> & {
        id?: string;
      };
    }
  ): Promise<Result<{ nodeId: string }>> {
    return this.service.upsertDirectoryNode(body);
  }

  @Delete(':id')
  @ApiOperation({
    summary: '删除目录节点',
    description: '删除目录节点及其子节点（幂等操作）',
  })
  @ApiResponse({ status: 200, description: '成功删除目录节点' })
  deleteDirectoryNode(
    @Param('id') id: string
  ): Promise<Result<{ success: boolean }>> {
    return this.service.deleteDirectoryNode({ nodeId: id });
  }
}
