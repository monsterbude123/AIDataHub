import { Module } from '@nestjs/common';
import { HealthController } from './controllers/HealthController';
import { DataOperationsModule } from './modules/data-operations/data-operations.module';

@Module({
  imports: [DataOperationsModule],
  controllers: [HealthController],
})
export class AppModule {}
