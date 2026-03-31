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
import { ApprovalTemplateService } from './approval-template.service';
import type { Result, ApprovalTemplate } from '@ai-datahub/contract';

@Controller('approval-templates')
export class ApprovalTemplateController {
  constructor(private readonly service: ApprovalTemplateService) {}

  @Post()
  createApprovalTemplate(
    @Body()
    body: {
      template: Omit<ApprovalTemplate, 'id' | 'createdAt' | 'updatedAt'>;
    }
  ): Promise<Result<{ templateId: string }>> {
    return this.service.createApprovalTemplate(body);
  }

  @Put()
  updateApprovalTemplate(
    @Body() body: { template: ApprovalTemplate }
  ): Promise<Result<{ success: boolean }>> {
    return this.service.updateApprovalTemplate(body);
  }

  @Delete('/:id')
  deleteApprovalTemplate(
    @Param('id') id: string
  ): Promise<Result<{ success: boolean }>> {
    return this.service.deleteApprovalTemplate({ templateId: id });
  }

  @Get()
  listApprovalTemplates(
    @Query('businessType') businessType?: string
  ): Promise<Result<ApprovalTemplate[]>> {
    return this.service.listApprovalTemplates({ businessType });
  }
}
