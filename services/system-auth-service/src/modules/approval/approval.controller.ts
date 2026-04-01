import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { ApprovalService } from './approval.service';
import type { Result, Approval, PageResult } from '@ai-datahub/contract';

@ApiTags('审批管理')
@ApiBearerAuth()
@Controller('approvals')
export class ApprovalController {
  constructor(private readonly service: ApprovalService) {}

  @Post()
  @ApiOperation({ summary: '创建审批', description: '创建新的审批请求' })
  @ApiResponse({ status: 201, description: '成功创建审批' })
  @ApiResponse({ status: 400, description: '审批模板不存在' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        businessType: { type: 'string', description: '业务类型' },
        businessId: { type: 'string', description: '业务ID' },
        title: { type: 'string', description: '审批标题' },
        applicantId: { type: 'string', description: '申请人ID' },
        payload: { type: 'object', description: '审批内容' },
      },
      required: ['businessType', 'businessId', 'title', 'applicantId'],
    },
  })
  createApproval(
    @Body()
    body: {
      businessType: string;
      businessId: string;
      title: string;
      applicantId: string;
      payload?: Record<string, unknown>;
    }
  ): Promise<Result<{ approvalId: string }>> {
    return this.service.createApproval(body);
  }

  @Post('/:id/approve')
  @ApiOperation({
    summary: '审批操作',
    description: '批准或拒绝审批（幂等操作）',
  })
  @ApiResponse({ status: 200, description: '成功执行审批操作' })
  @ApiResponse({ status: 400, description: '审批状态无效' })
  @ApiResponse({ status: 404, description: '审批不存在' })
  @ApiParam({ name: 'id', description: '审批ID', type: 'string' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['APPROVE', 'REJECT'] },
        comment: { type: 'string', description: '审批意见' },
        approverId: { type: 'string', description: '审批人ID' },
      },
      required: ['action', 'approverId'],
    },
  })
  approve(
    @Param('id') id: string,
    @Body()
    body: {
      action: 'APPROVE' | 'REJECT';
      comment?: string;
      approverId: string;
    }
  ): Promise<Result<{ success: boolean }>> {
    return this.service.approve({
      approvalId: id,
      action: body.action,
      comment: body.comment,
      approverId: body.approverId,
    });
  }

  @Get('/todo')
  @ApiOperation({
    summary: '获取待办审批',
    description: '获取用户的待办审批列表',
  })
  @ApiResponse({ status: 200, description: '成功返回待办审批列表' })
  @ApiQuery({ name: 'userId', description: '用户ID', required: true })
  @ApiQuery({
    name: 'page',
    description: '页码',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'pageSize',
    description: '每页数量',
    required: false,
    type: Number,
  })
  listMyTodoApprovals(
    @Query('userId') userId: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number
  ): Promise<Result<PageResult<Approval>>> {
    return this.service.listMyTodoApprovals({
      userId,
      page: { page: page || 1, pageSize: pageSize || 10 },
    });
  }

  @Get('/done')
  @ApiOperation({
    summary: '获取已办审批',
    description: '获取用户的已办审批列表',
  })
  @ApiResponse({ status: 200, description: '成功返回已办审批列表' })
  @ApiQuery({ name: 'userId', description: '用户ID', required: true })
  @ApiQuery({
    name: 'page',
    description: '页码',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'pageSize',
    description: '每页数量',
    required: false,
    type: Number,
  })
  listMyDoneApprovals(
    @Query('userId') userId: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number
  ): Promise<Result<PageResult<Approval>>> {
    return this.service.listMyDoneApprovals({
      userId,
      page: { page: page || 1, pageSize: pageSize || 10 },
    });
  }

  @Post('/:id/remind')
  @ApiOperation({
    summary: '催办',
    description: '发送审批催办提醒（幂等操作）',
  })
  @ApiResponse({ status: 200, description: '成功发送催办' })
  @ApiResponse({ status: 404, description: '审批不存在' })
  @ApiParam({ name: 'id', description: '审批ID', type: 'string' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', description: '催办消息' },
      },
    },
  })
  remindApproval(
    @Param('id') id: string,
    @Body() body?: { message?: string }
  ): Promise<Result<{ success: boolean }>> {
    return this.service.remindApproval({
      approvalId: id,
      message: body?.message,
    });
  }
}
