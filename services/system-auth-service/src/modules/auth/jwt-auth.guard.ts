import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthenticatedUser } from './auth.service';

declare global {
  interface Request {
    user?: AuthenticatedUser;
  }
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Get token from Authorization header
    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header missing');
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedException('Invalid authorization header format');
    }

    const token = parts[1];
    if (!token) {
      throw new UnauthorizedException('Token missing');
    }

    // Validate token and get user
    const user = await this.authService.validateToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Attach user to request
    request.user = user;

    return true;
  }
}
