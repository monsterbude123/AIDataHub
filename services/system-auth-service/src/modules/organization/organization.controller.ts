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
import { OrganizationService } from './organization.service';
import type { Result, Organization } from '@ai-datahub/contract';
import {
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
} from './organization.dtos';

@ApiTags('组织管理')
@ApiBearerAuth()
@Controller('organizations')
export class OrganizationController {
  constructor(private readonly service: OrganizationService) {}

  @Get()
  @ApiOperation({
    summary: '获取组织列表',
    description: '根据关键字搜索组织列表',
  })
  @ApiResponse({ status: 200, description: '成功返回组织列表' })
  @ApiQuery({ name: 'keyword', description: '搜索关键字', required: false })
  listOrganizations(
    @Query('keyword') keyword?: string
  ): Promise<Result<Organization[]>> {
    return this.service.listOrganizations({ keyword });
  }

  @Post()
  @ApiOperation({ summary: '创建组织', description: '创建新的组织' })
  @ApiResponse({ status: 201, description: '成功创建组织' })
  @ApiResponse({ status: 400, description: '组织编码已存在' })
  createOrganization(
    @Body() body: CreateOrganizationRequest
  ): Promise<Result<{ orgId: string }>> {
    return this.service.createOrganization(body);
  }

  @Put()
  @ApiOperation({ summary: '更新组织', description: '更新组织信息' })
  @ApiResponse({ status: 200, description: '成功更新组织' })
  @ApiResponse({ status: 404, description: '组织不存在' })
  updateOrganization(
    @Body() body: UpdateOrganizationRequest
  ): Promise<Result<{ success: boolean }>> {
    return this.service.updateOrganization(body);
  }

  @Delete('/:id')
  @ApiOperation({
    summary: '删除组织',
    description: '删除指定组织（幂等操作）',
  })
  @ApiResponse({ status: 200, description: '成功删除组织' })
  @ApiParam({ name: 'id', description: '组织ID', type: 'string' })
  deleteOrganization(
    @Param('id') id: string
  ): Promise<Result<{ success: boolean }>> {
    return this.service.deleteOrganization({ orgId: id });
  }
}
