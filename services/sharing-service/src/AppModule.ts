import { Module } from '@nestjs/common';
import { HealthController } from './controllers/HealthController';
import { DataSharingModule } from './modules/data-sharing/data-sharing.module';

@Module({
  imports: [DataSharingModule],
  controllers: [HealthController],
})
export class AppModule {}
