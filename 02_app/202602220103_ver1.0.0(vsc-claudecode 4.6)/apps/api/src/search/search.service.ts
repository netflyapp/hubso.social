import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MeilisearchService } from './meilisearch.service';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    private prisma: PrismaService,
    private meili: MeilisearchService,
  ) {}

  /**
   * Global search across users, communities, and posts.
   * Uses Meilisearch when available, falls back to PostgreSQL ILIKE.
   */
  async search(
    query: string,
    type: 'all' | 'users' | 'communities' | 'posts' = 'all',
    limit = 10,
  ) {
    const q = query.trim();
    if (!q || q.length < 2) return { users: [], communities: [], posts: [] };

    // Try Meilisearch first
    if (this.meili.isAvailable) {
      try {
        return await this.searchViaMeilisearch(q, type, limit);
      } catch (err) {
        this.logger.warn('Meilisearch query failed, falling back to ILIKE', (err as Error).message);
      }
    }

    return this.searchViaPostgres(q, type, limit);
  }

  /**
   * Meilisearch-powered search with highlighted results.
   */
  private async searchViaMeilisearch(q: string, type: string, limit: number) {
    if (type === 'all') {
      const results = await this.meili.searchAll(q, limit);
      return {
        users: (results.users as any).hits ?? [],
        communities: (results.communities as any).hits ?? [],
        posts: (results.posts as any).hits ?? [],
        source: 'meilisearch',
      };
    }

    if (type === 'users') {
      const r = await this.meili.searchUsers(q, limit);
      return { users: r.hits, communities: [], posts: [], source: 'meilisearch' };
    }
    if (type === 'communities') {
      const r = await this.meili.searchCommunities(q, limit);
      return { users: [], communities: r.hits, posts: [], source: 'meilisearch' };
    }
    if (type === 'posts') {
      const r = await this.meili.searchPosts(q, { limit });
      return { users: [], communities: [], posts: r.hits, source: 'meilisearch' };
    }

    return { users: [], communities: [], posts: [] };
  }

  /**
   * PostgreSQL ILIKE fallback search.
   */
  private async searchViaPostgres(q: string, type: string, limit: number) {

    const [users, communities, posts] = await Promise.all([
      type === 'communities' || type === 'posts'
        ? Promise.resolve([])
        : this.prisma.user.findMany({
            where: {
              status: 'ACTIVE',
              OR: [
                { username: { contains: q, mode: 'insensitive' } },
                { displayName: { contains: q, mode: 'insensitive' } },
                { bio: { contains: q, mode: 'insensitive' } },
              ],
            },
            take: limit,
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
              bio: true,
              role: true,
            },
          }),

      type === 'users' || type === 'posts'
        ? Promise.resolve([])
        : this.prisma.community.findMany({
            where: {
              OR: [
                { name: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
                { slug: { contains: q, mode: 'insensitive' } },
              ],
            },
            take: limit,
            select: {
              id: true,
              name: true,
              slug: true,
              logoUrl: true,
              description: true,
              _count: { select: { members: true } },
            },
          }),

      type === 'users' || type === 'communities'
        ? Promise.resolve([])
        : this.prisma.post.findMany({
            where: {
              status: 'PUBLISHED',
              isFlagged: false,
              searchableText: { contains: q, mode: 'insensitive' },
            },
            take: limit,
            select: {
              id: true,
              searchableText: true,
              type: true,
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
            },
          }),
    ]);

    return { users, communities, posts };
  }

  /**
   * Member directory search — search users within a community.
   */
  async searchMembers(
    communityId: string,
    query: string,
    role?: string,
    page = 1,
    limit = 20,
  ) {
    const skip = (page - 1) * limit;
    const q = query?.trim();

    const where: Record<string, unknown> = { communityId };
    if (role) where.role = role;
    if (q) {
      where.user = {
        OR: [
          { username: { contains: q, mode: 'insensitive' } },
          { displayName: { contains: q, mode: 'insensitive' } },
          { bio: { contains: q, mode: 'insensitive' } },
        ],
      };
    }

    const [total, members] = await Promise.all([
      this.prisma.communityMember.count({ where }),
      this.prisma.communityMember.findMany({
        where,
        skip,
        take: limit,
        orderBy: { joinedAt: 'asc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
              bio: true,
              socialLinks: true,
              followersCount: true,
            },
          },
        },
      }),
    ]);

    return {
      members: members.map((m) => ({
        ...m.user,
        memberRole: m.role,
        joinedAt: m.joinedAt,
      })),
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Quick suggestions for command palette (Cmd+K).
   * Returns top results fast.
   */
  async suggestions(query: string, userId: string) {
    const q = query.trim();
    if (!q || q.length < 1) return { users: [], communities: [] };

    const [users, communities] = await Promise.all([
      this.prisma.user.findMany({
        where: {
          id: { not: userId },
          status: 'ACTIVE',
          OR: [
            { username: { startsWith: q, mode: 'insensitive' } },
            { displayName: { startsWith: q, mode: 'insensitive' } },
          ],
        },
        take: 5,
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      }),

      this.prisma.community.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { slug: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 5,
        select: {
          id: true,
          name: true,
          slug: true,
          logoUrl: true,
        },
      }),
    ]);

    return { users, communities };
  }

  /**
   * Full reindex — load all content from DB and push to Meilisearch.
   */
  async reindexAll() {
    if (!this.meili.isAvailable) {
      return { message: 'Meilisearch not available, skipping reindex.' };
    }

    // Reindex users
    const users = await this.prisma.user.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, username: true, displayName: true, bio: true, avatarUrl: true },
    });
    await this.meili.reindexUsers(
      users.map((u) => ({
        id: u.id,
        username: u.username,
        displayName: u.displayName ?? '',
        bio: u.bio ?? '',
        avatarUrl: u.avatarUrl,
      })),
    );

    // Reindex communities
    const communities = await this.prisma.community.findMany({
      select: { id: true, name: true, slug: true, description: true, _count: { select: { members: true } } },
    });
    await this.meili.reindexCommunities(
      communities.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description ?? '',
        memberCount: c._count.members,
      })),
    );

    // Reindex posts
    const posts = await this.prisma.post.findMany({
      where: { status: 'PUBLISHED', isFlagged: false },
      select: {
        id: true,
        searchableText: true,
        type: true,
        createdAt: true,
        authorId: true,
        author: { select: { displayName: true } },
        space: {
          select: {
            id: true,
            name: true,
            community: { select: { id: true, slug: true } },
          },
        },
      },
    });
    await this.meili.reindexPosts(
      posts.map((p) => ({
        id: p.id,
        title: '',
        content: p.searchableText ?? '',
        authorId: p.authorId,
        authorName: p.author?.displayName ?? '',
        communityId: p.space?.community?.id ?? '',
        communitySlug: p.space?.community?.slug ?? '',
        spaceId: p.space?.id ?? null,
        spaceName: p.space?.name ?? null,
        createdAt: p.createdAt.getTime(),
      })),
    );

    this.logger.log(`Reindex complete: ${users.length} users, ${communities.length} communities, ${posts.length} posts`);
    return {
      message: 'Reindex complete.',
      indexed: {
        users: users.length,
        communities: communities.length,
        posts: posts.length,
      },
    };
  }
}
