// services/system-auth-service/src/modules/auth/public.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorator to mark endpoints as public (no authentication required).
 * Use on controller methods or classes to bypass JWT authentication.
 *
 * @example
 * @Public()
 * @Get('public-data')
 * getPublicData() {}
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
