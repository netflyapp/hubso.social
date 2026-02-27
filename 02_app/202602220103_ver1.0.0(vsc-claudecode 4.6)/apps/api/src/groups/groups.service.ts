import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CaslAbilityService } from '../casl';

@Injectable()
export class GroupsService {
  constructor(
    private prisma: PrismaService,
    private casl: CaslAbilityService,
  ) {}

  async findByCommunity(communityId: string, userId?: string) {
    const groups = await this.prisma.group.findMany({
      where: { communityId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { members: true } },
        members: userId
          ? { where: { userId }, select: { role: true } }
          : false,
      },
    });

    return groups.map((g) => {
      const members = Array.isArray(g.members) ? (g.members as { role: string }[]) : [];
      return {
        id: g.id,
        name: g.name,
        description: g.description,
        visibility: g.visibility,
        rules: g.rules,
        communityId: g.communityId,
        memberCount: g._count.members,
        isJoined: userId ? members.length > 0 : false,
        memberRole: userId && members.length > 0 ? (members[0]?.role ?? null) : null,
        createdAt: g.createdAt,
      };
    });
  }

  async findById(id: string, userId?: string) {
    const g = await this.prisma.group.findUnique({
      where: { id },
      include: {
        _count: { select: { members: true } },
        members: userId
          ? { where: { userId }, select: { role: true } }
          : false,
      },
    });

    if (!g) throw new NotFoundException('Group not found.');

    const members = Array.isArray(g.members) ? (g.members as { role: string }[]) : [];
    return {
      id: g.id,
      name: g.name,
      description: g.description,
      visibility: g.visibility,
      rules: g.rules,
      communityId: g.communityId,
      memberCount: g._count.members,
      isJoined: userId ? members.length > 0 : false,
      memberRole: userId && members.length > 0 ? (members[0]?.role ?? null) : null,
      createdAt: g.createdAt,
    };
  }

  async create(
    communityId: string,
    creatorId: string,
    name: string,
    description?: string,
    visibility?: 'PUBLIC' | 'PRIVATE' | 'HIDDEN',
    rules?: string,
  ) {
    if (!name || name.trim().length < 2) {
      throw new BadRequestException('Group name must be at least 2 characters.');
    }

    const membership = await this.prisma.communityMember.findUnique({
      where: { communityId_userId: { communityId, userId: creatorId } },
    });
    if (!membership) {
      throw new ForbiddenException('You must be a community member to create a group.');
    }

    const group = await this.prisma.group.create({
      data: {
        communityId,
        name: name.trim(),
        description: description?.trim() ?? null,
        visibility: visibility ?? 'PUBLIC',
        rules: rules?.trim() ?? null,
        memberCount: 1,
      },
    });

    await this.prisma.groupMember.create({
      data: { groupId: group.id, userId: creatorId, role: 'OWNER' },
    });

    return group;
  }

  async update(
    id: string,
    userId: string,
    patch: Partial<{
      name: string;
      description: string;
      visibility: 'PUBLIC' | 'PRIVATE' | 'HIDDEN';
      rules: string;
    }>,
  ) {
    await this._requireGroupOrCommunityRole(id, userId, ['OWNER', 'MODERATOR']);

    return this.prisma.group.update({
      where: { id },
      data: {
        ...(patch.name !== undefined && { name: patch.name.trim() }),
        ...(patch.description !== undefined && {
          description: patch.description.trim() || null,
        }),
        ...(patch.visibility !== undefined && { visibility: patch.visibility }),
        ...(patch.rules !== undefined && { rules: patch.rules.trim() || null }),
      },
    });
  }

  async delete(id: string, userId: string) {
    await this._requireGroupOrCommunityRole(id, userId, ['OWNER']);
    await this.prisma.group.delete({ where: { id } });
    return { deleted: true };
  }

  async join(groupId: string, userId: string) {
    const group = await this.prisma.group.findUnique({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Group not found.');

    if (group.visibility === 'HIDDEN') {
      throw new ForbiddenException('This group is hidden and cannot be joined directly.');
    }

    const existing = await this.prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });
    if (existing) throw new ConflictException('Already a member of this group.');

    await this.prisma.$transaction([
      this.prisma.groupMember.create({
        data: { groupId, userId, role: 'MEMBER' },
      }),
      this.prisma.group.update({
        where: { id: groupId },
        data: { memberCount: { increment: 1 } },
      }),
    ]);

    return { joined: true, groupId };
  }

  async leave(groupId: string, userId: string) {
    const member = await this.prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });
    if (!member) throw new NotFoundException('You are not a member of this group.');
    if (member.role === 'OWNER') {
      throw new ForbiddenException('Owner cannot leave the group. Transfer ownership or delete the group.');
    }

    await this.prisma.$transaction([
      this.prisma.groupMember.delete({
        where: { groupId_userId: { groupId, userId } },
      }),
      this.prisma.group.update({
        where: { id: groupId },
        data: { memberCount: { decrement: 1 } },
      }),
    ]);

    return { left: true, groupId };
  }

  async listMembers(groupId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const members = await this.prisma.groupMember.findMany({
      where: { groupId },
      skip,
      take: limit,
      orderBy: [{ role: 'asc' }, { joinedAt: 'asc' }],
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    const total = await this.prisma.groupMember.count({ where: { groupId } });

    return {
      members: members.map((m) => ({
        userId: m.userId,
        role: m.role,
        joinedAt: m.joinedAt,
        user: m.user,
      })),
      total,
      page,
      limit,
    };
  }

  async removeMember(groupId: string, requestorId: string, targetUserId: string) {
    await this._requireGroupOrCommunityRole(groupId, requestorId, ['OWNER', 'MODERATOR']);

    const target = await this.prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: targetUserId } },
    });
    if (!target) throw new NotFoundException('Member not found in group.');
    if (target.role === 'OWNER') {
      throw new ForbiddenException('Cannot remove the group owner.');
    }

    await this.prisma.$transaction([
      this.prisma.groupMember.delete({
        where: { groupId_userId: { groupId, userId: targetUserId } },
      }),
      this.prisma.group.update({
        where: { id: groupId },
        data: { memberCount: { decrement: 1 } },
      }),
    ]);

    return { removed: true };
  }

  /**
   * Check group-level role OR fall back to community admin/owner via CASL.
   * Community admins can manage all groups in their community.
   */
  private async _requireGroupOrCommunityRole(
    groupId: string,
    userId: string,
    allowedGroupRoles: string[],
  ) {
    // Check group-level membership first
    const member = await this.prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });
    if (member && allowedGroupRoles.includes(member.role)) return;

    // Fall back: community admin/owner can manage any group
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      select: { communityId: true },
    });
    if (!group) throw new NotFoundException('Group not found.');

    const ability = await this.casl.forCommunityMember(userId, group.communityId);
    if (!ability.can('manage', 'Group')) {
      throw new ForbiddenException('Insufficient permissions.');
    }
  }
}
