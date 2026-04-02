import { ApiProperty } from '@nestjs/swagger';

/**
 * 创建审批请求
 */
export class CreateApprovalRequest {
  @ApiProperty({ description: '业务类型' })
  businessType: string = undefined!;

  @ApiProperty({ description: '业务ID' })
  businessId: string = undefined!;

  @ApiProperty({ description: '审批标题' })
  title: string = undefined!;

  @ApiProperty({ description: '申请人ID' })
  applicantId: string = undefined!;

  @ApiProperty({ description: '审批内容', required: false })
  payload?: Record<string, unknown> = undefined;
}

/**
 * 审批操作请求
 */
export class ApproveApprovalRequest {
  @ApiProperty({
    description: '审批动作',
    enum: ['APPROVE', 'REJECT'],
  })
  action: 'APPROVE' | 'REJECT' = undefined!;

  @ApiProperty({ description: '审批意见', required: false })
  comment?: string = undefined;

  @ApiProperty({ description: '审批人ID' })
  approverId: string = undefined!;
}

/**
 * 获取待办/已办审批请求
 */
export class ListUserApprovalsRequest {
  @ApiProperty({ description: '用户ID' })
  userId: string = undefined!;

  @ApiProperty({ description: '页码', required: false, minimum: 1 })
  page?: number = undefined;

  @ApiProperty({ description: '每页数量', required: false, minimum: 1 })
  pageSize?: number = undefined;
}

/**
 * 催办审批请求
 */
export class RemindApprovalRequest {
  @ApiProperty({ description: '催办消息', required: false })
  message?: string = undefined;
}
