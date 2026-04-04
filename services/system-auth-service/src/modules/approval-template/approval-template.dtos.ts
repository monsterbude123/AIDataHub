import { ApiProperty } from '@nestjs/swagger';
import type { ApprovalTemplate } from '@ai-datahub/contract';

/**
 * 创建审批模板请求 - 嵌套属性
 */
class CreateApprovalTemplateData {
  @ApiProperty({ description: '业务类型' })
  businessType: string = undefined!;

  @ApiProperty({ description: '模板名称' })
  name: string = undefined!;

  @ApiProperty({
    description: '审批流程定义',
    type: 'object',
    additionalProperties: true,
  })
  definition: Record<string, unknown> = undefined!;
}

/**
 * 创建审批模板请求
 */
export class CreateApprovalTemplateRequest {
  @ApiProperty({
    description: '审批模板信息',
    type: () => CreateApprovalTemplateData,
    required: true,
  })
  template: Omit<ApprovalTemplate, 'id' | 'createdAt' | 'updatedAt'> =
    undefined!;
}

/**
 * 更新审批模板请求 - 嵌套属性
 */
class UpdateApprovalTemplateData {
  @ApiProperty({ description: '模板ID' })
  id: string = undefined!;

  @ApiProperty({ description: '业务类型' })
  businessType: string = undefined!;

  @ApiProperty({ description: '模板名称' })
  name: string = undefined!;

  @ApiProperty({
    description: '审批流程定义',
    type: 'object',
    additionalProperties: true,
  })
  definition: Record<string, unknown> = undefined!;
}

/**
 * 更新审批模板请求
 */
export class UpdateApprovalTemplateRequest {
  @ApiProperty({
    description: '审批模板信息',
    type: () => UpdateApprovalTemplateData,
    required: true,
  })
  template: Omit<ApprovalTemplate, 'createdAt' | 'updatedAt'> = undefined!;
}

/**
 * 删除审批模板请求
 */
export class DeleteApprovalTemplateRequest {
  @ApiProperty({ description: '审批模板ID' })
  templateId: string = undefined!;
}

/**
 * 获取审批模板列表请求
 */
export class ListApprovalTemplatesRequest {
  @ApiProperty({ description: '业务类型过滤', required: false })
  businessType?: string = undefined;
}
