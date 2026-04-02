import { Controller, Get } from '@nestjs/common';
import type { Result } from '@ai-datahub/contract';
import { Public } from '@ai-datahub/shared';

@Controller('health')
export class HealthController {
  @Public()
  @Get()
  health(): Result<{ service: string }> {
    return { ok: true, data: { service: 'integration-service' } };
  }
}
