import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { okResult, type Result } from '@ai-datahub/contract';
import { Public } from '@ai-datahub/shared';

/**
 * Health check controller
 *
 * Provides liveness and readiness checks for Kubernetes or other orchestration.
 */
@ApiTags('健康检查')
@Controller()
export class HealthController {
  @Public()
  @Get('health')
  @ApiOperation({
    summary: '健康检查',
    description: '检查 API 网关服务是否正常运行',
  })
  @ApiResponse({ status: 200, description: '服务正常运行' })
  health(): Result<{ status: string }> {
    return okResult({ status: 'ok' });
  }
}
