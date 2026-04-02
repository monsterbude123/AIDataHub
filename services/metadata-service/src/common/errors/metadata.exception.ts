import { HttpException, HttpStatus } from '@nestjs/common';
import type { MetadataErrorCode } from '@ai-datahub/contract';

export class MetadataServiceException extends HttpException {
  constructor(
    public readonly code: MetadataErrorCode,
    message: string
  ) {
    super({ code, message }, HttpStatus.BAD_REQUEST);
  }
}
