import { Module } from '@nestjs/common';
import { HealthController } from './controllers/HealthController';
import { DatabaseModule } from './common/database/database.module';
import { OrganizationModule } from './modules/organization/organization.module';

@Module({
  imports: [DatabaseModule, OrganizationModule],
  controllers: [HealthController],
})
export class AppModule {}
