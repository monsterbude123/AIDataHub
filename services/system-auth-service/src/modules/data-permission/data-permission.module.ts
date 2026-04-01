import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../common/database/database.module';
import { DataPermissionController } from './data-permission.controller';
import { DataPermissionService } from './data-permission.service';

@Module({
  imports: [DatabaseModule],
  controllers: [DataPermissionController],
  providers: [DataPermissionService],
  exports: [DataPermissionService],
})
export class DataPermissionModule {}
