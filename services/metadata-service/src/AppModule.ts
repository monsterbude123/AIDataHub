import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { DatabaseModule } from './common/database/database.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { AuthModule } from './modules/auth/auth.module';
import { DataConnectionModule } from './modules/data-connection/data-connection.module';
import { DataAssetModule } from './modules/data-asset/data-asset.module';
import { MetadataCollectionModule } from './modules/metadata-collection/metadata-collection.module';
import { MetadataVersionModule } from './modules/metadata-version/metadata-version.module';
import { HealthController } from './controllers/HealthController';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    DataConnectionModule,
    DataAssetModule,
    MetadataCollectionModule,
    MetadataVersionModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
