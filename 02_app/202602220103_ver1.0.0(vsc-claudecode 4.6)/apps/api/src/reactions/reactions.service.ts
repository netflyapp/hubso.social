import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type ReactionType = 'LIKE' | 'LOVE' | 'WOW' | 'FIRE' | 'SAD' | 'ANGRY';
export type TargetType = 'Post' | 'Comment';

export interface ToggleReactionInput {
  targetType: TargetType;
  targetId: string;
  type: ReactionType;
}

@Injectable()
export class ReactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async toggle(userId: string, input: ToggleReactionInput) {
    const { targetType, targetId, type } = input;

    // Validate target exists
    if (targetType === 'Post') {
      const post = await this.prisma.post.findUnique({
        where: { id: targetId },
        select: { id: true },
      });
      if (!post) throw new NotFoundException('Post nie istnieje');
    } else {
      const comment = await this.prisma.comment.findUnique({
        where: { id: targetId },
        select: { id: true },
      });
      if (!comment) throw new NotFoundException('Komentarz nie istnieje');
    }

    // Find existing reaction for this user on this target
    const existing = await this.prisma.reaction.findFirst({
      where:
        targetType === 'Post'
          ? { userId, targetType, postId: targetId }
          : { userId, targetType, commentId: targetId },
    });

    let userReaction: string | null;

    if (existing && existing.type === type) {
      // Same type → toggle off
      await this.prisma.reaction.delete({ where: { id: existing.id } });
      userReaction = null;
    } else if (existing) {
      // Different type → update
      await this.prisma.reaction.update({
        where: { id: existing.id },
        data: { type: type as any },
      });
      userReaction = type;
    } else {
      // No reaction → create
      await this.prisma.reaction.create({
        data: {
          userId,
          targetType,
          type: type as any,
          ...(targetType === 'Post'
            ? { postId: targetId }
            : { commentId: targetId }),
        },
      });
      userReaction = type;
    }

    // Recompute grouped counts
    const grouped = await this.prisma.reaction.groupBy({
      by: ['type'],
      where:
        targetType === 'Post' ? { postId: targetId } : { commentId: targetId },
      _count: { type: true },
    });

    const reactions: Record<string, number> = {};
    for (const row of grouped) {
      reactions[row.type] = row._count.type;
    }

    // Denormalize into Post.reactionsCount
    if (targetType === 'Post') {
      await this.prisma.post.update({
        where: { id: targetId },
        data: { reactionsCount: reactions },
      });
    }

    return { reactions, userReaction };
  }

  /** Batch-fetch user reactions for a list of post IDs */
  async getUserReactionsForPosts(
    userId: string,
    postIds: string[],
  ): Promise<Record<string, string | null>> {
    if (!postIds.length) return {};
    const rows = await this.prisma.reaction.findMany({
      where: { userId, targetType: 'Post', postId: { in: postIds } },
      select: { postId: true, type: true },
    });
    return Object.fromEntries(rows.map((r) => [r.postId as string, r.type]));
  }
}
