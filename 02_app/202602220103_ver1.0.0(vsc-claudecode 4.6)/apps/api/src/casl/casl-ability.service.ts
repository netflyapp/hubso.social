import { Injectable } from '@nestjs/common';
import {
  AppAbility,
  UserContext,
  CommunityContext,
  buildPlatformAbility,
  buildCommunityAbility,
} from './casl-ability.factory';
import { PrismaService } from '../prisma/prisma.service';

/**
 * CaslAbilityService — resolves user abilities from DB context.
 *
 * Usage:
 *   const ability = await caslAbilityService.forUser(userId);
 *   if (ability.can('delete', 'Post')) { ... }
 *
 *   const communityAbility = await caslAbilityService.forCommunityMember(userId, communityId);
 *   if (communityAbility.can('manage', 'Space')) { ... }
 */
@Injectable()
export class CaslAbilityService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Build platform-level abilities for a user.
   */
  async forUser(userId: string): Promise<AppAbility> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      return buildPlatformAbility({
        userId: '',
        email: '',
        role: 'GUEST',
      });
    }

    return buildPlatformAbility({
      userId: user.id,
      email: user.email,
      role: user.role as UserContext['role'],
    });
  }

  /**
   * Build community-scoped abilities for a user within a specific community.
   */
  async forCommunityMember(
    userId: string,
    communityId: string,
  ): Promise<AppAbility> {
    const [user, membership] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, role: true },
      }),
      this.prisma.communityMember.findUnique({
        where: { communityId_userId: { communityId, userId } },
        select: { role: true },
      }),
    ]);

    if (!user) {
      return buildCommunityAbility(
        { userId: '', email: '', role: 'GUEST' },
        { communityId, memberRole: null },
      );
    }

    const userCtx: UserContext = {
      userId: user.id,
      email: user.email,
      role: user.role as UserContext['role'],
    };

    const communityCtx: CommunityContext = {
      communityId,
      memberRole: (membership?.role as CommunityContext['memberRole']) ?? null,
    };

    return buildCommunityAbility(userCtx, communityCtx);
  }

  /**
   * Resolve community-scoped ability by community slug.
   */
  async forCommunityMemberBySlug(
    userId: string,
    slug: string,
  ): Promise<AppAbility> {
    const community = await this.prisma.community.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!community) {
      return buildCommunityAbility(
        { userId, email: '', role: 'GUEST' },
        { communityId: '', memberRole: null },
      );
    }

    return this.forCommunityMember(userId, community.id);
  }
}
