import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { DirectoryService } from './directory.service';
import type { Result, DirectoryTreeNode } from '@ai-datahub/contract';

@Controller('directory')
export class DirectoryController {
  constructor(private readonly service: DirectoryService) {}

  @Get('tree')
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
  deleteDirectoryNode(
    @Param('id') id: string
  ): Promise<Result<{ success: boolean }>> {
    return this.service.deleteDirectoryNode({ nodeId: id });
  }
}
