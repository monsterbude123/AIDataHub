import { Module } from '@nestjs/common';

import { HealthController } from './controllers/HealthController';
import { SchedulerModule } from './modules/scheduler/scheduler.module';

@Module({
  imports: [SchedulerModule],
  controllers: [HealthController],
})
export class AppModule {}
