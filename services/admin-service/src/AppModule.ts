import { Module } from '@nestjs/common';
import { HealthController } from './controllers/HealthController';
import { SystemAdminModule } from './modules/system-admin/system-admin.module';

@Module({
  imports: [SystemAdminModule],
  controllers: [HealthController],
})
export class AppModule {}
