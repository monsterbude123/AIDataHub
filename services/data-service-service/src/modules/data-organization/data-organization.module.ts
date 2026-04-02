import { Module } from '@nestjs/common';
import { DataOrganizationController } from './data-organization.controller';
import { DataOrganizationService } from './data-organization.service';

@Module({
  controllers: [DataOrganizationController],
  providers: [DataOrganizationService],
})
export class DataOrganizationModule {}
