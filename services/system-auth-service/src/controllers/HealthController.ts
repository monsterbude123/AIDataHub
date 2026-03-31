// services/system-auth-service/src/controllers/HealthController.ts
import { Controller, Get } from '@nestjs/common';
import { okResult } from '@ai-datahub/contract';
import { Public } from '../modules/auth/public.decorator';

@Controller()
export class HealthController {
  @Public()
  @Get('/health')
  health() {
    return okResult({ service: 'system-auth-service' });
  }
}
