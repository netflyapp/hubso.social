import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import * as path from 'path';

export interface UpdateProfileInput {
  displayName?: string;
  bio?: string;
  username?: string;
}

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  async findMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return user;
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, username: true, status: true },
    });
  }

  async updateMe(userId: string, data: UpdateProfileInput) {
    // Check username uniqueness if username is being changed
    if (data.username) {
      const existing = await this.prisma.user.findFirst({
        where: { username: data.username, NOT: { id: userId } },
        select: { id: true },
      });
      if (existing) {
        throw new ConflictException(
          'Ta nazwa użytkownika jest już zajęta.',
        );
      }
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.displayName !== undefined && { displayName: data.displayName }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.username !== undefined && { username: data.username }),
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    return user;
  }

  async updateAvatar(userId: string, file: Express.Multer.File) {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const filename = `user-${userId}${ext}`;

    // Delete old avatar if it's a local file
    const current = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { avatarUrl: true },
    });
    if (current?.avatarUrl) {
      this.storage.deleteByUrl(current.avatarUrl);
    }

    const avatarUrl = await this.storage.uploadFile(
      'avatars',
      filename,
      file.buffer,
      file.mimetype,
    );

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    return user;
  }
}
