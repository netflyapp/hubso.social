import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterInput, LoginInput } from '@hubso/shared';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @HttpCode(201)
  async register(@Body() input: RegisterInput) {
    return this.authService.register(input);
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() input: LoginInput) {
    return this.authService.login(input);
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(@Body() input: { refreshToken: string }) {
    return this.authService.refresh(input.refreshToken);
  }

  /**
   * DEV ONLY: generuje wygasły access token dla testów interceptora.
   * Używa istniejącego refreshToken, generuje accessToken z TTL = -1s (już wygasły).
   */
  @Post('dev/expired-token')
  @HttpCode(200)
  async devExpiredToken(@Body() input: { refreshToken: string }) {
    return this.authService.generateExpiredToken(input.refreshToken);
  }
}
