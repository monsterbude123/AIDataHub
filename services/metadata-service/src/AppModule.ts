import { Module } from '@nestjs/common';

import { HealthController } from './controllers/HealthController';
import { MetadataModule } from './modules/metadata/metadata.module';

@Module({
  imports: [MetadataModule],
  controllers: [HealthController],
})
export class AppModule {}
