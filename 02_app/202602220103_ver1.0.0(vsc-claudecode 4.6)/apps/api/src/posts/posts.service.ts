import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostInput } from '@hubso/shared';

const POST_SELECT = {
  id: true,
  content: true,
  type: true,
  status: true,
  pinned: true,
  featured: true,
  reactionsCount: true,
  createdAt: true,
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
      community: {
        select: { id: true, slug: true, name: true },
      },
    },
  },
  _count: {
    select: { comments: true },
  },
} as const;

function mapPost(post: any, userReaction?: string | null) {
  return {
    id: post.id,
    content: post.content,
    type: post.type,
    status: post.status,
    pinned: post.pinned,
    featured: post.featured,
    reactionsCount: post.reactionsCount ?? {},
    userReaction: userReaction ?? null,
    author: post.author,
    spaceId: post.space.id,
    spaceName: post.space.name,
    communityId: post.space.community.id,
    communitySlug: post.space.community.slug,
    communityName: post.space.community.name,
    commentsCount: post._count.comments,
    createdAt: post.createdAt.toISOString(),
  };
}

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  /** Znajdź domyślny Space POSTS dla community po slugu */
  private async getDefaultSpace(communitySlug: string) {
    const space = await this.prisma.space.findFirst({
      where: {
        type: 'POSTS',
        community: { slug: communitySlug },
      },
      select: { id: true, communityId: true },
    });
    if (!space) {
      throw new NotFoundException(
        `No POSTS space found in community '${communitySlug}'.`,
      );
    }
    return space;
  }

  /** GET /posts/feed — ostatnie opublikowane posty ze wszystkich community */
  async findFeed(page = 1, limit = 20, userId?: string) {
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: POST_SELECT,
      }),
      this.prisma.post.count({ where: { status: 'PUBLISHED' } }),
    ]);

    // Pobierz reakcje użytkownika jeśli zalogowany
    let userReactionMap: Record<string, string> = {};
    if (userId && posts.length) {
      const postIds = posts.map((p: any) => p.id);
      const rows = await this.prisma.reaction.findMany({
        where: { userId, targetType: 'Post', postId: { in: postIds } },
        select: { postId: true, type: true },
      });
      userReactionMap = Object.fromEntries(
        rows.map((r: any) => [r.postId as string, r.type]),
      );
    }

    return {
      data: posts.map((p: any) => mapPost(p, userReactionMap[p.id] ?? null)),
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  /** GET /communities/:slug/posts — posty w community */
  async findByCommunity(slug: string, page = 1, limit = 20) {
    const space = await this.getDefaultSpace(slug);
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where: { spaceId: space.id, status: 'PUBLISHED' },
        orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
        select: POST_SELECT,
      }),
      this.prisma.post.count({
        where: { spaceId: space.id, status: 'PUBLISHED' },
      }),
    ]);

    return {
      data: posts.map((p: any) => mapPost(p)),
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  /** POST /communities/:slug/posts — utwórz post */
  async create(slug: string, input: CreatePostInput, authorId: string) {
    const space = await this.getDefaultSpace(slug);

    const post = await this.prisma.post.create({
      data: {
        spaceId: space.id,
        authorId,
        content: input.content as any,
        type: (input.type ?? 'TEXT') as any,
        status: 'PUBLISHED',
        reactionsCount: {},
      },
      select: POST_SELECT,
    });

    return mapPost(post);
  }

  /** GET /posts/:id — pojedynczy post */
  async findOne(id: string, userId?: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      select: POST_SELECT,
    });
    if (!post) throw new NotFoundException(`Post '${id}' not found.`);

    let userReaction: string | null = null;
    if (userId) {
      const row = await this.prisma.reaction.findFirst({
        where: { userId, targetType: 'Post', postId: id },
        select: { type: true },
      });
      userReaction = row?.type ?? null;
    }

    return mapPost(post, userReaction);
  }

  /** DELETE /posts/:id — usuń post (autor lub admin) */
  async remove(id: string, userId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      select: { authorId: true },
    });
    if (!post) throw new NotFoundException(`Post '${id}' not found.`);
    if (post.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own posts.');
    }
    await this.prisma.post.delete({ where: { id } });
    return { message: 'Post deleted.' };
  }
}
