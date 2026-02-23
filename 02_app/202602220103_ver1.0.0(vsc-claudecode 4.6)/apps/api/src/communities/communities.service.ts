import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommunityInput } from '@hubso/shared';

@Injectable()
export class CommunitiesService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId?: string) {
    const communities = await this.prisma.community.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        description: true,
        plan: true,
        createdAt: true,
        _count: { select: { members: true } },
        members: userId
          ? { where: { userId }, select: { role: true } }
          : false,
      },
    });

    return communities.map((c) => ({
      ...c,
      memberCount: c._count.members,
      isJoined: userId ? c.members.length > 0 : false,
      memberRole: userId && c.members.length > 0 ? c.members[0].role : null,
      _count: undefined,
      members: undefined,
    }));
  }

  async findBySlug(slug: string, userId?: string) {
    const community = await this.prisma.community.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
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

    return {
      ...community,
      memberCount: community._count.members,
      isJoined: userId ? community.members.length > 0 : false,
      memberRole:
        userId && community.members.length > 0 ? community.members[0].role : null,
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
}
