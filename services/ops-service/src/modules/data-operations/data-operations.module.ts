import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { BearerAuthGuard, WriteAuditLogInterceptor } from '@ai-datahub/shared';
import { DataOperationsController } from './data-operations.controller';
import { OpsController } from './ops.controller';

@Module({
  controllers: [DataOperationsController, OpsController],
  providers: [
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
export class DataOperationsModule {}
