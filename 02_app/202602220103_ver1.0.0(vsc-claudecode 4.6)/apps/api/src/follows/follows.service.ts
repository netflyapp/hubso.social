import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class FollowsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async follow(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new BadRequestException('Cannot follow yourself');
    }

    const target = await this.prisma.user.findUnique({ where: { id: followingId } });
    if (!target) throw new NotFoundException('User not found');

    const existing = await this.prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });
    if (existing) throw new ConflictException('Already following');

    await this.prisma.$transaction([
      this.prisma.follow.create({ data: { followerId, followingId } }),
      this.prisma.user.update({
        where: { id: followerId },
        data: { followingCount: { increment: 1 } },
      }),
      this.prisma.user.update({
        where: { id: followingId },
        data: { followersCount: { increment: 1 } },
      }),
    ]);

    // Fire-and-forget notification
    const follower = await this.prisma.user.findUnique({
      where: { id: followerId },
      select: { id: true, username: true, displayName: true, avatarUrl: true },
    });
    this.notifications.create({
      userId: followingId,
      type: 'FOLLOW',
      data: { followerId, followerUsername: follower?.username, followerDisplayName: follower?.displayName, followerAvatarUrl: follower?.avatarUrl },
    }).catch(() => {});

    return { following: true };
  }

  async unfollow(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new BadRequestException('Cannot unfollow yourself');
    }

    const existing = await this.prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });
    if (!existing) throw new NotFoundException('Not following this user');

    await this.prisma.$transaction([
      this.prisma.follow.delete({
        where: { followerId_followingId: { followerId, followingId } },
      }),
      this.prisma.user.update({
        where: { id: followerId },
        data: { followingCount: { decrement: 1 } },
      }),
      this.prisma.user.update({
        where: { id: followingId },
        data: { followersCount: { decrement: 1 } },
      }),
    ]);

    return { following: false };
  }

  async getFollowers(userId: string, requesterId?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const followers = await this.prisma.follow.findMany({
      where: { followingId: userId },
      include: {
        follower: {
          select: { id: true, username: true, displayName: true, avatarUrl: true, bio: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const followerIds = requesterId
      ? await this.prisma.follow
          .findMany({ where: { followerId: requesterId }, select: { followingId: true } })
          .then((r) => new Set(r.map((f) => f.followingId)))
      : new Set<string>();

    return followers.map((f) => ({
      ...f.follower,
      isFollowedByMe: followerIds.has(f.follower.id),
    }));
  }

  async getFollowing(userId: string, requesterId?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const following = await this.prisma.follow.findMany({
      where: { followerId: userId },
      include: {
        following: {
          select: { id: true, username: true, displayName: true, avatarUrl: true, bio: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const followingIds = requesterId
      ? await this.prisma.follow
          .findMany({ where: { followerId: requesterId }, select: { followingId: true } })
          .then((r) => new Set(r.map((f) => f.followingId)))
      : new Set<string>();

    return following.map((f) => ({
      ...f.following,
      isFollowedByMe: followingIds.has(f.following.id),
    }));
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const record = await this.prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });
    return !!record;
  }
}
