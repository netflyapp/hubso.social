import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RegisterInput, LoginInput } from '@hubso/shared';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async register(input: RegisterInput) {
    // Sprawdź czy email już istnieje
    const existing = await this.prisma.user.findUnique({
      where: { email: input.email },
    });
    if (existing) {
      throw new ConflictException('Email is already registered.');
    }

    // Generuj unikalny username z email
    const baseUsername = (input.email.split('@')[0] ?? 'user').toLowerCase().replace(/[^a-z0-9]/g, '');
    const suffix = Math.floor(Math.random() * 9000) + 1000;
    const username = `${baseUsername}${suffix}`;

    const passwordHash = await bcrypt.hash(input.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: input.email,
        username,
        passwordHash,
        settings: {},
      },
      select: { id: true, email: true, username: true, createdAt: true },
    });

    this.logger.log(`New user registered: ${user.email} (${user.id})`);
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      message: 'Registration successful.',
    };
  }

  async login(input: LoginInput) {
    const user = await this.prisma.user.findUnique({
      where: { email: input.email },
      select: { id: true, email: true, username: true, passwordHash: true, status: true },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    if (user.status === 'SUSPENDED' || user.status === 'DELETED') {
      throw new UnauthorizedException('Account is suspended or deleted.');
    }

    const isValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    // Fetch user role for JWT payload
    const userData = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });

    const payload = { sub: user.id, email: user.email, role: userData?.role || 'MEMBER' };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRES_IN') || '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get('REFRESH_TOKEN_EXPIRES_IN') || '7d',
    });

    return { accessToken, refreshToken };
  }

  async refresh(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('REFRESH_TOKEN_SECRET'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, email: true, status: true, role: true },
      });

      if (!user || user.status === 'SUSPENDED' || user.status === 'DELETED') {
        throw new UnauthorizedException('Invalid session.');
      }

      const newPayload = { sub: user.id, email: user.email, role: user.role };
      const accessToken = this.jwtService.sign(newPayload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN') || '15m',
      });

      return { accessToken };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }
  }

  /**
   * DEV ONLY: generuje natychmiast wygasły access token na podstawie aktualnego refreshToken.
   * Służy do testowania interceptora 401 → refresh → retry.
   */
  async generateExpiredToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('REFRESH_TOKEN_SECRET'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, email: true },
      });

      if (!user) throw new UnauthorizedException('User not found.');

      // Generuj token już wygasły (iat w przeszłości)
      const expiredAccessToken = this.jwtService.sign(
        { sub: user.id, email: user.email },
        {
          secret: this.configService.get('JWT_SECRET'),
          expiresIn: '1ms', // wygasa natychmiast
        },
      );

      return { expiredAccessToken, refreshToken };
    } catch {
      throw new UnauthorizedException('Invalid refresh token.');
    }
  }
}
