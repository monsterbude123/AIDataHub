import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
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
