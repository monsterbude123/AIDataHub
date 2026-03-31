import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApprovalTemplateEntity } from '../../entities/ApprovalTemplate.entity';
import { ApprovalTemplateController } from './approval-template.controller';
import { ApprovalTemplateService } from './approval-template.service';

@Module({
  imports: [TypeOrmModule.forFeature([ApprovalTemplateEntity])],
  controllers: [ApprovalTemplateController],
  providers: [ApprovalTemplateService],
  exports: [ApprovalTemplateService],
})
export class ApprovalTemplateModule {}
