import { Module } from '@nestjs/common';
import { DataGovernanceOpsController } from './data-governance-ops.controller';
import { DataGovernanceOpsService } from './data-governance-ops.service';

@Module({
  controllers: [DataGovernanceOpsController],
  providers: [DataGovernanceOpsService],
})
export class DataGovernanceOpsModule {}
