import { Module } from '@nestjs/common';
import { DataAssetModule } from '../data-asset/data-asset.module';
import { MetadataCollectionController } from './metadata-collection.controller';
import { MetadataCollectionService } from './metadata-collection.service';

@Module({
  imports: [DataAssetModule],
  controllers: [MetadataCollectionController],
  providers: [MetadataCollectionService],
  exports: [MetadataCollectionService],
})
export class MetadataCollectionModule {}
