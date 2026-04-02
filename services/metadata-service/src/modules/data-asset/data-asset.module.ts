import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../common/database/database.module';
import { DataAssetController } from './data-asset.controller';
import { DataAssetService } from './data-asset.service';

@Module({
  imports: [DatabaseModule],
  controllers: [DataAssetController],
  providers: [DataAssetService],
  exports: [DataAssetService],
})
export class DataAssetModule {}
