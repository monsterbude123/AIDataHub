import { Controller, Get } from '@nestjs/common';
import { okResult } from '@ai-datahub/contract';

@Controller()
export class HealthController {
  @Get('/health')
  health() {
    return okResult({ service: 'system-auth-service' });
  }
}
