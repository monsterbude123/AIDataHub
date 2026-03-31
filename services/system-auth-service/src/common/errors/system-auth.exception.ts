import { HttpException, HttpStatus } from '@nestjs/common';
import type { SystemAuthErrorCode } from '@ai-datahub/contract';

export class SystemAuthException extends HttpException {
  constructor(
    public readonly code: SystemAuthErrorCode,
    message: string
  ) {
    super({ code, message }, HttpStatus.BAD_REQUEST);
  }
}
