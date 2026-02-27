import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CaslAbilityService } from '../casl';
import { CreateCommunityInput } from '@hubso/shared';

@Injectable()
export class CommunitiesService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
    private casl: CaslAbilityService,
  ) {}

  async findAll(userId?: string) {
    const communities = await this.prisma.community.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        coverUrl: true,
        brandColor: true,
        brandFont: true,
        description: true,
        plan: true,
        createdAt: true,
        _count: { select: { members: true } },
        members: userId
          ? { where: { userId }, select: { role: true } }
          : false,
      },
    });

    return communities.map((c) => {
      const membersList = Array.isArray(c.members) ? c.members : [];
      return {
        ...c,
        memberCount: c._count.members,
        isJoined: userId ? membersList.length > 0 : false,
        memberRole: userId && membersList.length > 0 ? membersList[0]?.role ?? null : null,
        _count: undefined,
        members: undefined,
      };
    });
  }

  async findBySlug(slug: string, userId?: string) {
    const community = await this.prisma.community.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        coverUrl: true,
        brandColor: true,
        brandFont: true,
        description: true,
        plan: true,
        createdAt: true,
        owner: {
          select: { id: true, username: true, displayName: true, avatarUrl: true },
        },
        _count: { select: { members: true } },
        members: userId
          ? { where: { userId }, select: { role: true } }
          : false,
      },
    });

    if (!community) throw new NotFoundException(`Community '${slug}' not found.`);

    const membersList = Array.isArray(community.members) ? community.members : [];
    return {
      ...community,
      memberCount: community._count.members,
      isJoined: userId ? membersList.length > 0 : false,
      memberRole:
        userId && membersList.length > 0 ? membersList[0]?.role ?? null : null,
      _count: undefined,
      members: undefined,
    };
  }

  async create(input: CreateCommunityInput, ownerId: string) {
    const existing = await this.prisma.community.findUnique({
      where: { slug: input.slug },
    });
    if (existing) {
      throw new ConflictException(`Slug '${input.slug}' is already taken.`);
    }

    return this.prisma.community.create({
      data: {
        name: input.name,
        slug: input.slug,
        description: input.description,
        logoUrl: input.logoUrl,
        ownerId,
        // Automatycznie dodaj właściciela jako OWNER
        members: {
          create: { userId: ownerId, role: 'OWNER' },
        },
        // Domyślna przestrzeń do postów
        spaces: {
          create: {
            name: 'Ogólny',
            type: 'POSTS',
            visibility: 'PUBLIC',
          },
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        description: true,
        plan: true,
        createdAt: true,
      },
    });
  }

  async join(slug: string, userId: string) {
    const community = await this.prisma.community.findUnique({
      where: { slug },
      select: { id: true, name: true },
    });
    if (!community) throw new NotFoundException(`Community '${slug}' not found.`);

    const existing = await this.prisma.communityMember.findUnique({
      where: { communityId_userId: { communityId: community.id, userId } },
    });
    if (existing) throw new ConflictException('Already a member of this community.');

    await this.prisma.communityMember.create({
      data: { communityId: community.id, userId, role: 'MEMBER' },
    });

    // Notify community owner
    this.notifications.create({
      userId: await this.prisma.community
        .findUnique({ where: { id: community.id }, select: { ownerId: true } })
        .then((c) => c?.ownerId ?? ''),
      type: 'COMMUNITY_JOIN',
      communityId: community.id,
      data: { communityId: community.id, communityName: community.name, newMemberId: userId },
    }).catch(() => {});

    return { message: `Joined community '${community.name}'.` };
  }

  async leave(slug: string, userId: string) {
    const community = await this.prisma.community.findUnique({
      where: { slug },
      select: { id: true, name: true, ownerId: true },
    });
    if (!community) throw new NotFoundException(`Community '${slug}' not found.`);
    if (community.ownerId === userId) {
      throw new ForbiddenException('Owner cannot leave their own community.');
    }

    const membership = await this.prisma.communityMember.findUnique({
      where: { communityId_userId: { communityId: community.id, userId } },
    });
    if (!membership) throw new NotFoundException('Not a member of this community.');

    await this.prisma.communityMember.delete({
      where: { communityId_userId: { communityId: community.id, userId } },
    });

    return { message: `Left community '${community.name}'.` };
  }

  async getMembers(slug: string) {
    const community = await this.prisma.community.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!community) throw new NotFoundException(`Community '${slug}' not found.`);

    const members = await this.prisma.communityMember.findMany({
      where: { communityId: community.id },
      include: {
        user: {
          select: { id: true, username: true, displayName: true, avatarUrl: true, bio: true },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });

    return members.map((m) => ({
      ...m.user,
      role: m.role,
      joinedAt: m.joinedAt,
      points: m.points,
      level: m.level,
    }));
  }

  async update(
    slug: string,
    userId: string,
    data: { name?: string; description?: string; logoUrl?: string; coverUrl?: string; brandColor?: string; brandFont?: string },
  ) {
    const community = await this.prisma.community.findUnique({
      where: { slug },
      select: { id: true, ownerId: true },
    });
    if (!community) throw new NotFoundException(`Community '${slug}' not found.`);

    // CASL-based permission check
    const ability = await this.casl.forCommunityMember(userId, community.id);
    if (!ability.can('update', 'Community')) {
      throw new ForbiddenException('You do not have permission to update this community.');
    }

    const updated = await this.prisma.community.update({
      where: { slug },
      data,
    });

    return {
      id: updated.id,
      name: updated.name,
      slug: updated.slug,
      description: updated.description,
      logoUrl: updated.logoUrl,
      coverUrl: updated.coverUrl,
      brandColor: updated.brandColor,
      brandFont: updated.brandFont,
    };
  }

  async remove(slug: string, userId: string) {
    const community = await this.prisma.community.findUnique({
      where: { slug },
      select: { id: true, ownerId: true },
    });
    if (!community) throw new NotFoundException(`Community '${slug}' not found.`);

    // CASL-based permission check
    const ability = await this.casl.forCommunityMember(userId, community.id);
    if (!ability.can('delete', 'Community')) {
      throw new ForbiddenException('You do not have permission to delete this community.');
    }

    await this.prisma.community.delete({ where: { slug } });
    return { message: `Community '${slug}' deleted.` };
  }
}
