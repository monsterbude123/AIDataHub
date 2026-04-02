import { Module } from '@nestjs/common';
import { HealthController } from './controllers/HealthController';
import { SystemIntegrationModule } from './modules/system-integration/system-integration.module';

@Module({
  imports: [SystemIntegrationModule],
  controllers: [HealthController],
})
export class AppModule {}
