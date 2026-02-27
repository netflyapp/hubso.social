import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CaslAbilityService } from '../casl';

@Injectable()
export class SpacesService {
  constructor(
    private prisma: PrismaService,
    private casl: CaslAbilityService,
  ) {}

  // ── Space Groups ────────────────────────────────────

  async findGroups(communitySlug: string) {
    const community = await this.getCommunityBySlug(communitySlug);

    const groups = await this.prisma.spaceGroup.findMany({
      where: { communityId: community.id },
      orderBy: { position: 'asc' },
      include: {
        spaces: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            name: true,
            description: true,
            type: true,
            visibility: true,
            paywallEnabled: true,
            createdAt: true,
            _count: { select: { members: true, posts: true } },
          },
        },
      },
    });

    // Also get ungrouped spaces
    const ungroupedSpaces = await this.prisma.space.findMany({
      where: { communityId: community.id, spaceGroupId: null },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        visibility: true,
        paywallEnabled: true,
        createdAt: true,
        _count: { select: { members: true, posts: true } },
      },
    });

    return {
      groups: groups.map((g) => ({
        id: g.id,
        name: g.name,
        position: g.position,
        collapsedDefault: g.collapsedDefault,
        spaces: g.spaces.map((s) => ({
          ...s,
          memberCount: s._count.members,
          postCount: s._count.posts,
          _count: undefined,
        })),
      })),
      ungroupedSpaces: ungroupedSpaces.map((s) => ({
        ...s,
        memberCount: s._count.members,
        postCount: s._count.posts,
        _count: undefined,
      })),
    };
  }

  async createGroup(
    communitySlug: string,
    userId: string,
    data: { name: string; position?: number; collapsedDefault?: boolean },
  ) {
    const community = await this.getCommunityBySlug(communitySlug);
    const ability = await this.casl.forCommunityMember(userId, community.id);
    if (!ability.can('manage', 'Space')) {
      throw new ForbiddenException('Only community owner or admin can manage spaces.');
    }

    return this.prisma.spaceGroup.create({
      data: {
        communityId: community.id,
        name: data.name,
        position: data.position ?? 0,
        collapsedDefault: data.collapsedDefault ?? false,
      },
    });
  }

  async updateGroup(
    groupId: string,
    userId: string,
    data: { name?: string; position?: number; collapsedDefault?: boolean },
  ) {
    const group = await this.prisma.spaceGroup.findUnique({
      where: { id: groupId },
      select: { id: true, communityId: true },
    });
    if (!group) throw new NotFoundException('Space group not found.');

    const ability = await this.casl.forCommunityMember(userId, group.communityId);
    if (!ability.can('manage', 'Space')) {
      throw new ForbiddenException('Only community owner or admin can manage spaces.');
    }

    return this.prisma.spaceGroup.update({
      where: { id: groupId },
      data,
    });
  }

  async deleteGroup(groupId: string, userId: string) {
    const group = await this.prisma.spaceGroup.findUnique({
      where: { id: groupId },
      select: { id: true, communityId: true },
    });
    if (!group) throw new NotFoundException('Space group not found.');

    const ability = await this.casl.forCommunityMember(userId, group.communityId);
    if (!ability.can('manage', 'Space')) {
      throw new ForbiddenException('Only community owner or admin can manage spaces.');
    }

    // Ungroup spaces (set spaceGroupId to null) instead of deleting them
    await this.prisma.space.updateMany({
      where: { spaceGroupId: groupId },
      data: { spaceGroupId: null },
    });

    await this.prisma.spaceGroup.delete({ where: { id: groupId } });
    return { message: 'Space group deleted.' };
  }

  // ── Spaces ──────────────────────────────────────────

  async findAll(communitySlug: string, userId?: string) {
    const community = await this.getCommunityBySlug(communitySlug);

    const spaces = await this.prisma.space.findMany({
      where: { communityId: community.id },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        visibility: true,
        paywallEnabled: true,
        spaceGroupId: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { members: true, posts: true, events: true } },
        members: userId
          ? { where: { userId }, select: { role: true } }
          : false,
      },
    });

    return spaces.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      type: s.type,
      visibility: s.visibility,
      paywallEnabled: s.paywallEnabled,
      spaceGroupId: s.spaceGroupId,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      memberCount: s._count.members,
      postCount: s._count.posts,
      eventCount: s._count.events,
      isJoined: userId ? (s.members as any[]).length > 0 : false,
      memberRole: userId && (s.members as any[]).length > 0
        ? (s.members as any[])[0].role
        : null,
    }));
  }

  async findById(spaceId: string, userId?: string) {
    const space = await this.prisma.space.findUnique({
      where: { id: spaceId },
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        visibility: true,
        paywallEnabled: true,
        spaceGroupId: true,
        communityId: true,
        createdAt: true,
        updatedAt: true,
        community: {
          select: { id: true, name: true, slug: true },
        },
        spaceGroup: {
          select: { id: true, name: true },
        },
        _count: { select: { members: true, posts: true, events: true } },
        members: userId
          ? { where: { userId }, select: { role: true } }
          : false,
      },
    });

    if (!space) throw new NotFoundException('Space not found.');

    return {
      id: space.id,
      name: space.name,
      description: space.description,
      type: space.type,
      visibility: space.visibility,
      paywallEnabled: space.paywallEnabled,
      spaceGroupId: space.spaceGroupId,
      communityId: space.communityId,
      community: space.community,
      spaceGroup: space.spaceGroup,
      createdAt: space.createdAt,
      updatedAt: space.updatedAt,
      memberCount: space._count.members,
      postCount: space._count.posts,
      eventCount: space._count.events,
      isJoined: userId ? (space.members as any[]).length > 0 : false,
      memberRole: userId && (space.members as any[]).length > 0
        ? (space.members as any[])[0].role
        : null,
    };
  }

  async create(
    communitySlug: string,
    userId: string,
    data: {
      name: string;
      description?: string;
      type: 'POSTS' | 'CHAT' | 'EVENTS' | 'LINKS' | 'FILES';
      visibility?: 'PUBLIC' | 'PRIVATE' | 'SECRET';
      spaceGroupId?: string;
    },
  ) {
    const community = await this.getCommunityBySlug(communitySlug);
    const ability = await this.casl.forCommunityMember(userId, community.id);
    if (!ability.can('manage', 'Space')) {
      throw new ForbiddenException('Only community owner or admin can manage spaces.');
    }

    // Validate spaceGroupId belongs to same community
    if (data.spaceGroupId) {
      const group = await this.prisma.spaceGroup.findUnique({
        where: { id: data.spaceGroupId },
        select: { communityId: true },
      });
      if (!group || group.communityId !== community.id) {
        throw new NotFoundException('Space group not found in this community.');
      }
    }

    const space = await this.prisma.space.create({
      data: {
        communityId: community.id,
        name: data.name,
        description: data.description,
        type: data.type,
        visibility: data.visibility ?? 'PUBLIC',
        spaceGroupId: data.spaceGroupId ?? null,
        members: {
          create: { userId, role: 'OWNER' },
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        visibility: true,
        paywallEnabled: true,
        spaceGroupId: true,
        createdAt: true,
      },
    });

    return space;
  }

  async update(
    spaceId: string,
    userId: string,
    data: {
      name?: string;
      description?: string;
      visibility?: 'PUBLIC' | 'PRIVATE' | 'SECRET';
      spaceGroupId?: string | null;
      paywallEnabled?: boolean;
    },
  ) {
    const space = await this.prisma.space.findUnique({
      where: { id: spaceId },
      select: { id: true, communityId: true },
    });
    if (!space) throw new NotFoundException('Space not found.');

    const ability = await this.casl.forCommunityMember(userId, space.communityId);
    if (!ability.can('manage', 'Space')) {
      throw new ForbiddenException('Only community owner or admin can manage spaces.');
    }

    // Validate spaceGroupId if provided
    if (data.spaceGroupId) {
      const group = await this.prisma.spaceGroup.findUnique({
        where: { id: data.spaceGroupId },
        select: { communityId: true },
      });
      if (!group || group.communityId !== space.communityId) {
        throw new NotFoundException('Space group not found in this community.');
      }
    }

    return this.prisma.space.update({
      where: { id: spaceId },
      data,
    });
  }

  async remove(spaceId: string, userId: string) {
    const space = await this.prisma.space.findUnique({
      where: { id: spaceId },
      select: { id: true, communityId: true, name: true },
    });
    if (!space) throw new NotFoundException('Space not found.');

    const ability = await this.casl.forCommunityMember(userId, space.communityId);
    if (!ability.can('delete', 'Space')) {
      throw new ForbiddenException('Only community owner or admin can delete spaces.');
    }

    await this.prisma.space.delete({ where: { id: spaceId } });
    return { message: `Space '${space.name}' deleted.` };
  }

  // ── Membership ──────────────────────────────────────

  async join(spaceId: string, userId: string) {
    const space = await this.prisma.space.findUnique({
      where: { id: spaceId },
      select: { id: true, name: true, visibility: true, communityId: true },
    });
    if (!space) throw new NotFoundException('Space not found.');

    // Check community membership first
    const communityMember = await this.prisma.communityMember.findUnique({
      where: { communityId_userId: { communityId: space.communityId, userId } },
    });
    if (!communityMember) {
      throw new ForbiddenException('You must be a community member to join spaces.');
    }

    // Check if already a member
    const existing = await this.prisma.spaceMember.findUnique({
      where: { spaceId_userId: { spaceId, userId } },
    });
    if (existing) throw new ConflictException('Already a member of this space.');

    // Private spaces need admin approval (for now, auto-join)
    if (space.visibility === 'SECRET') {
      throw new ForbiddenException('Secret spaces require an invitation.');
    }

    await this.prisma.spaceMember.create({
      data: { spaceId, userId, role: 'MEMBER' },
    });

    return { message: `Joined space '${space.name}'.` };
  }

  async leave(spaceId: string, userId: string) {
    const space = await this.prisma.space.findUnique({
      where: { id: spaceId },
      select: { id: true, name: true },
    });
    if (!space) throw new NotFoundException('Space not found.');

    const membership = await this.prisma.spaceMember.findUnique({
      where: { spaceId_userId: { spaceId, userId } },
    });
    if (!membership) throw new NotFoundException('Not a member of this space.');
    if (membership.role === 'OWNER') {
      throw new ForbiddenException('Owner cannot leave their own space.');
    }

    await this.prisma.spaceMember.delete({
      where: { spaceId_userId: { spaceId, userId } },
    });

    return { message: `Left space '${space.name}'.` };
  }

  async getMembers(spaceId: string) {
    const space = await this.prisma.space.findUnique({
      where: { id: spaceId },
      select: { id: true },
    });
    if (!space) throw new NotFoundException('Space not found.');

    const members = await this.prisma.spaceMember.findMany({
      where: { spaceId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            bio: true,
          },
        },
      },
      orderBy: { addedAt: 'asc' },
    });

    return members.map((m) => ({
      ...m.user,
      role: m.role,
      addedAt: m.addedAt,
    }));
  }

  // ── Helpers ─────────────────────────────────────────

  private async getCommunityBySlug(slug: string) {
    const community = await this.prisma.community.findUnique({
      where: { slug },
      select: { id: true, slug: true },
    });
    if (!community) throw new NotFoundException(`Community '${slug}' not found.`);
    return community;
  }

}
