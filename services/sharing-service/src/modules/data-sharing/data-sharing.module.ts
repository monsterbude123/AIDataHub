import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { BearerAuthGuard, WriteAuditLogInterceptor } from '@ai-datahub/shared';
import { DataSharingStore } from './data-sharing.store';
import { PortalController } from './portal.controller';
import { DirectoriesController } from './resource-directories.controller';
import { RegisteredResourcesController } from './registered-resources.controller';
import { CompiledResourcesController } from './compiled-resources.controller';
import { MappingsController } from './mappings.controller';
import { SharingServicesController } from './sharing-services.controller';
import { ApplicationsController } from './applications.controller';
import { ExchangeController } from './exchange.controller';

@Module({
  controllers: [
    PortalController,
    DirectoriesController,
    RegisteredResourcesController,
    CompiledResourcesController,
    MappingsController,
    SharingServicesController,
    ApplicationsController,
    ExchangeController,
  ],
  providers: [
    DataSharingStore,
    {
      provide: APP_GUARD,
      useClass: BearerAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: WriteAuditLogInterceptor,
    },
  ],
})
export class DataSharingModule {}
