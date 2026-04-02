import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
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
import { ApprovalTemplateService } from './approval-template.service';
import type { Result, ApprovalTemplate } from '@ai-datahub/contract';
import {
  CreateApprovalTemplateRequest,
  UpdateApprovalTemplateRequest,
} from './approval-template.dtos';

@ApiTags('审批模板')
@ApiBearerAuth()
@Controller('approval-templates')
export class ApprovalTemplateController {
  constructor(private readonly service: ApprovalTemplateService) {}

  @Post()
  @ApiOperation({
    summary: '创建审批模板',
    description: '创建新的审批流程模板',
  })
  @ApiResponse({ status: 201, description: '成功创建审批模板' })
  createApprovalTemplate(
    @Body() body: CreateApprovalTemplateRequest
  ): Promise<Result<{ templateId: string }>> {
    return this.service.createApprovalTemplate(body);
  }

  @Put()
  @ApiOperation({ summary: '更新审批模板', description: '更新审批模板信息' })
  @ApiResponse({ status: 200, description: '成功更新审批模板' })
  @ApiResponse({ status: 404, description: '审批模板不存在' })
  updateApprovalTemplate(
    @Body() body: UpdateApprovalTemplateRequest
  ): Promise<Result<{ success: boolean }>> {
    return this.service.updateApprovalTemplate(body);
  }

  @Delete('/:id')
  @ApiOperation({
    summary: '删除审批模板',
    description: '删除审批模板（幂等操作）',
  })
  @ApiResponse({ status: 200, description: '成功删除审批模板' })
  @ApiParam({ name: 'id', description: '审批模板ID', type: 'string' })
  deleteApprovalTemplate(
    @Param('id') id: string
  ): Promise<Result<{ success: boolean }>> {
    return this.service.deleteApprovalTemplate({ templateId: id });
  }

  @Get()
  @ApiOperation({
    summary: '获取审批模板列表',
    description: '根据业务类型筛选审批模板',
  })
  @ApiResponse({ status: 200, description: '成功返回审批模板列表' })
  @ApiQuery({ name: 'businessType', description: '业务类型', required: false })
  listApprovalTemplates(
    @Query('businessType') businessType?: string
  ): Promise<Result<ApprovalTemplate[]>> {
    return this.service.listApprovalTemplates({ businessType });
  }
}
