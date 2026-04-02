import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { BearerAuthGuard, WriteAuditLogInterceptor } from '@ai-datahub/shared';
import { DataSecurityController } from './data-security.controller';
import { DataLifecycleController } from './data-lifecycle.controller';
import { SecurityStore } from './security.store';

@Module({
  controllers: [DataSecurityController, DataLifecycleController],
  providers: [
    SecurityStore,
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
export class SecurityModule {}
