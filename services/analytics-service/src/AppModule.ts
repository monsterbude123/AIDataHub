import { Module } from '@nestjs/common';
import { HealthController } from './controllers/HealthController';
import { SelfServiceAnalyticsModule } from './modules/self-service-analytics/self-service-analytics.module';

@Module({
  imports: [SelfServiceAnalyticsModule],
  controllers: [HealthController],
})
export class AppModule {}
