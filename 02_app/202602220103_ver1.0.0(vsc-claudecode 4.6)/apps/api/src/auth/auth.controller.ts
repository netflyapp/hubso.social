import { Controller, Post, Get, Body, HttpCode, UseGuards, Request, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterInput, LoginInput } from '@hubso/shared';
import { CaslAbilityService } from '../casl';
import { packRules } from '@casl/ability/extra';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private caslAbilityService: CaslAbilityService,
  ) {}

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

  /**
   * GET /auth/me/permissions — returns packed CASL rules for the current user.
   * Optionally accepts ?communityId= for community-scoped permissions.
   */
  @Get('me/permissions')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async getMyPermissions(
    @Request() req: { user: { userId: string } },
    @Query('communityId') communityId?: string,
  ) {
    if (communityId) {
      const ability = await this.caslAbilityService.forCommunityMember(
        req.user.userId,
        communityId,
      );
      return { rules: packRules(ability.rules as any) };
    }

    const ability = await this.caslAbilityService.forUser(req.user.userId);
    return { rules: packRules(ability.rules as any) };
  }
}
