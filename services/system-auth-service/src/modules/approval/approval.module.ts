import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApprovalEntity } from '../../entities/Approval.entity';
import { ApprovalTemplateEntity } from '../../entities/ApprovalTemplate.entity';
import { ApprovalController } from './approval.controller';
import { ApprovalService } from './approval.service';

@Module({
  imports: [TypeOrmModule.forFeature([ApprovalEntity, ApprovalTemplateEntity])],
  controllers: [ApprovalController],
  providers: [ApprovalService],
  exports: [ApprovalService],
})
export class ApprovalModule {}
