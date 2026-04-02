import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../common/database/database.module';
import { MetadataVersionController } from './metadata-version.controller';
import { MetadataVersionService } from './metadata-version.service';

@Module({
  imports: [DatabaseModule],
  controllers: [MetadataVersionController],
  providers: [MetadataVersionService],
  exports: [MetadataVersionService],
})
export class MetadataVersionModule {}
