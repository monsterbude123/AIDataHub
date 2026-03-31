import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService, LoginRequest, LoginResponse } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: LoginRequest): Promise<LoginResponse> {
    return this.authService.login(body);
  }
}
