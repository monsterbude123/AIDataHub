import { Module } from '@nestjs/common';

import { HealthController } from './controllers/HealthController';
import { CostManagementModule } from './modules/cost-management/cost-management.module';
import { DataGovernanceCoreModule } from './modules/data-governance-core/data-governance-core.module';
import { DataGovernanceOpsModule } from './modules/data-governance-ops/data-governance-ops.module';
import { DataIntegrationModule } from './modules/data-integration/data-integration.module';
import { DataOrganizationModule } from './modules/data-organization/data-organization.module';

@Module({
  imports: [
    CostManagementModule,
    DataGovernanceCoreModule,
    DataGovernanceOpsModule,
    DataIntegrationModule,
    DataOrganizationModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
