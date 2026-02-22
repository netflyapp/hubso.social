import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterInput, LoginInput } from '@hubso/shared';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async register(input: RegisterInput) {
    const passwordHash = await bcrypt.hash(input.password, 10);
    // TODO: Save to database via Prisma
    return {
      id: 'temp-id',
      email: input.email,
      message: 'Registration successful. Please check your email.',
    };
  }

  async login(input: LoginInput) {
    // TODO: Verify credentials from database
    const accessToken = this.jwtService.sign({
      sub: 'temp-id',
      email: input.email,
    });
    return {
      accessToken,
      refreshToken: 'refresh-token',
    };
  }

  async refresh(refreshToken: string) {
    return {
      accessToken: this.jwtService.sign({ sub: 'temp-id' }),
    };
  }
}
