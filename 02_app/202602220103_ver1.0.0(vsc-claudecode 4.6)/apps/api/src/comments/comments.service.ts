import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const COMMENT_SELECT = {
  id: true,
  content: true,
  parentId: true,
  createdAt: true,
  author: {
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
    },
  },
  _count: {
    select: { replies: true, reactions: true },
  },
} as const;

function mapComment(c: any) {
  return {
    id: c.id,
    content: typeof c.content === 'string' ? c.content : JSON.stringify(c.content),
    parentId: c.parentId ?? null,
    author: c.author,
    repliesCount: c._count?.replies ?? 0,
    reactionsCount: c._count?.reactions ?? 0,
    createdAt: c.createdAt.toISOString(),
  };
}

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async getByPost(postId: string) {
    const exists = await this.prisma.post.findUnique({ where: { id: postId }, select: { id: true } });
    if (!exists) throw new NotFoundException('Post nie istnieje');

    const comments = await this.prisma.comment.findMany({
      where: { postId, parentId: null },
      select: {
        ...COMMENT_SELECT,
        replies: {
          select: COMMENT_SELECT,
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return comments.map((c) => ({
      ...mapComment(c),
      replies: (c as any).replies?.map(mapComment) ?? [],
    }));
  }

  async create(postId: string, authorId: string, data: { content: string; parentId?: string }) {
    const post = await this.prisma.post.findUnique({ where: { id: postId }, select: { id: true } });
    if (!post) throw new NotFoundException('Post nie istnieje');

    if (data.parentId) {
      const parent = await this.prisma.comment.findUnique({ where: { id: data.parentId }, select: { id: true, postId: true } });
      if (!parent || parent.postId !== postId) throw new NotFoundException('Komentarz-rodzic nie istnieje');
    }

    const comment = await this.prisma.comment.create({
      data: {
        postId,
        authorId,
        parentId: data.parentId ?? null,
        content: data.content,
      },
      select: COMMENT_SELECT,
    });

    // Increment commentsCount on Post (stored denormalized in reactionsCount-style field if exists)
    // For now just return the comment — count is derived from _count
    return mapComment(comment);
  }

  async delete(commentId: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      select: { id: true, authorId: true, post: { select: { space: { select: { community: { select: { members: { where: { userId }, select: { role: true } } } } } } } } },
    });
    if (!comment) throw new NotFoundException('Komentarz nie istnieje');

    const memberRole = comment.post?.space?.community?.members?.[0]?.role;
    const isOwner = comment.authorId === userId;
    const isModerator = memberRole === 'ADMIN' || memberRole === 'MODERATOR';

    if (!isOwner && !isModerator) throw new ForbiddenException('Brak uprawnień');

    await this.prisma.comment.delete({ where: { id: commentId } });
    return { deleted: true };
  }
}
