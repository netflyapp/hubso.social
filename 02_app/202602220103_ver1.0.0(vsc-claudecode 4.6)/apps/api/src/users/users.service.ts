import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  async findById(id: string) {
    // TODO: Query from Prisma
    return {
      id,
      email: 'user@example.com',
      username: 'user',
    };
  }

  async findByEmail(email: string) {
    // TODO: Query from Prisma
    return null;
  }
}
