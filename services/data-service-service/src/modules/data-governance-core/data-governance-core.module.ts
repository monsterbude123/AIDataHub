import { Module } from '@nestjs/common';
import { DataGovernanceCoreController } from './data-governance-core.controller';
import { DataGovernanceCoreService } from './data-governance-core.service';

@Module({
  controllers: [DataGovernanceCoreController],
  providers: [DataGovernanceCoreService],
})
export class DataGovernanceCoreModule {}
