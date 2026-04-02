import { Module } from '@nestjs/common';
import { HealthController } from './controllers/HealthController';
import { SecurityModule } from './modules/security/security.module';

@Module({
  imports: [SecurityModule],
  controllers: [HealthController],
})
export class AppModule {}
