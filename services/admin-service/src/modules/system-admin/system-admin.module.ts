import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { BearerAuthGuard, WriteAuditLogInterceptor } from '@ai-datahub/shared';
import {
  ProjectGroupsController,
  SystemAdminController,
} from './system-admin.controller';
import { SystemAdminStore } from './system-admin.store';
import { FunctionsController } from './system-admin.functions.controller';
import { DriversController } from './system-admin.drivers.controller';
import { PackagesController } from './system-admin.packages.controller';
import { OperationLogsController } from './system-admin.operation-logs.controller';
import { TicketsController } from './system-admin.tickets.controller';

@Module({
  controllers: [
    SystemAdminController,
    ProjectGroupsController,
    FunctionsController,
    DriversController,
    PackagesController,
    OperationLogsController,
    TicketsController,
  ],
  providers: [
    SystemAdminStore,
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
export class SystemAdminModule {}
