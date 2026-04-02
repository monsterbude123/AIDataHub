import { Module, MiddlewareConsumer } from '@nestjs/common';
import { TraceIdMiddleware } from './common/middleware/trace-id.middleware';
import { RequestLoggerMiddleware } from './common/middleware/request-logger.middleware';
import { HealthController } from './controllers/HealthController';
import { ProxyModule } from './modules/proxy/proxy.module';

@Module({
  imports: [ProxyModule],
  controllers: [HealthController],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {
    // Apply traceId middleware first - generates traceId for all requests
    consumer
      .apply(TraceIdMiddleware)
      .forRoutes('*')
      .apply(RequestLoggerMiddleware)
      .forRoutes('*');
  }
}
