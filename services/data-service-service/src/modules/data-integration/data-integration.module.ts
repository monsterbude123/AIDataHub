import { Module } from '@nestjs/common';
import { DataIntegrationController } from './data-integration.controller';
import { DataIntegrationService } from './data-integration.service';

@Module({
  controllers: [DataIntegrationController],
  providers: [DataIntegrationService],
})
export class DataIntegrationModule {}
