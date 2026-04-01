import { Module } from '@nestjs/common';
import { CostManagementController } from './cost-management.controller';
import { CostManagementService } from './cost-management.service';

@Module({
  controllers: [CostManagementController],
  providers: [CostManagementService],
})
export class CostManagementModule {}
