import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../common/database/database.module';
import { ApprovalTemplateController } from './approval-template.controller';
import { ApprovalTemplateService } from './approval-template.service';

@Module({
  imports: [DatabaseModule],
  controllers: [ApprovalTemplateController],
  providers: [ApprovalTemplateService],
  exports: [ApprovalTemplateService],
})
export class ApprovalTemplateModule {}
