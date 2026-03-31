import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { ApprovalService } from './approval.service';
import type { Result, Approval, PageResult } from '@ai-datahub/contract';

@Controller('approvals')
export class ApprovalController {
  constructor(private readonly service: ApprovalService) {}

  @Post()
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
