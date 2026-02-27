import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // ── Dashboard Stats ─────────────────────────────────────────────────────────
  async getDashboardStats() {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 3600 * 1000);

    const [
      totalUsers,
      activeUsers,
      newUsersThisWeek,
      totalCommunities,
      newCommunitiesThisMonth,
      totalPosts,
      newPostsThisWeek,
      flaggedPosts,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { status: 'ACTIVE' } }),
      this.prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
      this.prisma.community.count(),
      this.prisma.community.count({ where: { createdAt: { gte: monthAgo } } }),
      this.prisma.post.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.post.count({
        where: { status: 'PUBLISHED', createdAt: { gte: weekAgo } },
      }),
      this.prisma.post.count({ where: { isFlagged: true, status: 'PUBLISHED' } }),
    ]);

    // Posts per day for the last 7 days
    const postsPerDay = await this.prisma.post.groupBy({
      by: ['createdAt'],
      where: { createdAt: { gte: weekAgo }, status: 'PUBLISHED' },
      _count: { id: true },
    });

    // Users per day for last 30 days
    const usersPerDay = await this.prisma.user.groupBy({
      by: ['createdAt'],
      where: { createdAt: { gte: monthAgo } },
      _count: { id: true },
    });

    return {
      totalUsers,
      activeUsers,
      newUsersThisWeek,
      totalCommunities,
      newCommunitiesThisMonth,
      totalPosts,
      newPostsThisWeek,
      flaggedPosts,
      postsActivity: this._aggregateByDay(postsPerDay, weekAgo, 7),
      userGrowth: this._aggregateByDay(usersPerDay, monthAgo, 30),
    };
  }

  private _aggregateByDay(
    rows: Array<{ createdAt: Date; _count: { id: number } }>,
    from: Date,
    days: number,
  ) {
    const result: Array<{ date: string; count: number }> = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(from.getTime() + i * 24 * 3600 * 1000);
      const key = d.toISOString().slice(0, 10);
      const count = rows
        .filter((r) => r.createdAt.toISOString().slice(0, 10) === key)
        .reduce((s, r) => s + r._count.id, 0);
      result.push({ date: key, count });
    }
    return result;
  }

  // ── User Management ──────────────────────────────────────────────────────────
  async listUsers(params: {
    page: number;
    limit: number;
    search?: string;
    role?: string;
    status?: string;
  }) {
    const { page, limit, search, role, status } = params;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { displayName: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (role) where.role = role;
    if (status) where.status = status;

    const [total, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
          avatarUrl: true,
          role: true,
          status: true,
          createdAt: true,
          _count: {
            select: { posts: true, communityMembers: true },
          },
        },
      }),
    ]);

    return { users, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async updateUser(
    adminId: string,
    targetId: string,
    updates: { role?: string; status?: string },
  ) {
    // Cannot modify self
    if (adminId === targetId) {
      throw new ForbiddenException('Cannot modify your own account.');
    }

    const target = await this.prisma.user.findUnique({
      where: { id: targetId },
    });
    if (!target) throw new NotFoundException('User not found.');

    // Cannot elevate to SUPER_ADMIN via this endpoint
    if (updates.role === 'SUPER_ADMIN') {
      throw new ForbiddenException('Cannot set SUPER_ADMIN via API.');
    }

    const updated = await this.prisma.user.update({
      where: { id: targetId },
      data: {
        ...(updates.role ? { role: updates.role as any } : {}),
        ...(updates.status ? { status: updates.status as any } : {}),
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        status: true,
      },
    });

    return updated;
  }

  async deleteUser(adminId: string, targetId: string) {
    if (adminId === targetId) {
      throw new ForbiddenException('Cannot delete your own account.');
    }

    const target = await this.prisma.user.findUnique({
      where: { id: targetId },
    });
    if (!target) throw new NotFoundException('User not found.');
    if (target.role === 'SUPER_ADMIN') {
      throw new ForbiddenException('Cannot delete SUPER_ADMIN.');
    }

    await this.prisma.user.delete({ where: { id: targetId } });
    return { deleted: true, userId: targetId };
  }

  // ── Content Moderation ───────────────────────────────────────────────────────
  async getModerationQueue(params: { page: number; limit: number }) {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const where = { isFlagged: true, status: 'PUBLISHED' as const };

    const [total, posts] = await Promise.all([
      this.prisma.post.count({ where }),
      this.prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
          space: {
            select: {
              id: true,
              name: true,
              community: { select: { id: true, name: true, slug: true } },
            },
          },
          _count: { select: { comments: true, reactions: true } },
        },
      }),
    ]);

    return { posts, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async flagPost(postId: string, flagged: boolean) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found.');

    const updated = await this.prisma.post.update({
      where: { id: postId },
      data: { isFlagged: flagged },
      select: { id: true, isFlagged: true, status: true },
    });
    return updated;
  }

  async approvePost(postId: string) {
    // Approve = unflag, keep PUBLISHED
    return this.flagPost(postId, false);
  }

  async rejectPost(postId: string) {
    // Reject = set to DELETED + unflag
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found.');

    const updated = await this.prisma.post.update({
      where: { id: postId },
      data: { isFlagged: false, status: 'DELETED' },
      select: { id: true, isFlagged: true, status: true },
    });
    return updated;
  }

  // ── Community Branding ───────────────────────────────────────────────────────
  async updateCommunityBranding(
    slug: string,
    callerId: string,
    data: {
      brandColor?: string;
      brandFont?: string;
      logoUrl?: string;
      coverUrl?: string;
      description?: string;
    },
  ) {
    const community = await this.prisma.community.findUnique({
      where: { slug },
    });
    if (!community) throw new NotFoundException('Community not found.');
    if (community.ownerId !== callerId) {
      throw new ForbiddenException('Only the owner can update branding.');
    }

    const updated = await this.prisma.community.update({
      where: { slug },
      data: {
        ...(data.brandColor !== undefined ? { brandColor: data.brandColor } : {}),
        ...(data.brandFont !== undefined ? { brandFont: data.brandFont } : {}),
        ...(data.logoUrl !== undefined ? { logoUrl: data.logoUrl } : {}),
        ...(data.coverUrl !== undefined ? { coverUrl: data.coverUrl } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
      },
      select: {
        id: true,
        slug: true,
        brandColor: true,
        brandFont: true,
        logoUrl: true,
        coverUrl: true,
        description: true,
      },
    });
    return updated;
  }
}
