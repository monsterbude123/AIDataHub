import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { BearerAuthGuard, WriteAuditLogInterceptor } from '@ai-datahub/shared';
import { SystemIntegrationController } from './system-integration.controller';

@Module({
  controllers: [SystemIntegrationController],
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
export class SystemIntegrationModule {}
