import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { MeiliSearch } from 'meilisearch';

// ── Document Types ────────────────────────────────────

export interface PostDocument {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  communityId: string;
  communitySlug: string;
  spaceId: string | null;
  spaceName: string | null;
  createdAt: number; // unix timestamp for sorting
}

export interface UserDocument {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string | null;
}

export interface CommunityDocument {
  id: string;
  name: string;
  slug: string;
  description: string;
  memberCount: number;
}

const POSTS_INDEX = 'posts';
const USERS_INDEX = 'users';
const COMMUNITIES_INDEX = 'communities';

@Injectable()
export class MeilisearchService implements OnModuleInit {
  private readonly logger = new Logger(MeilisearchService.name);
  private client: MeiliSearch;
  private _available = false;

  constructor() {
    this.client = new MeiliSearch({
      host: process.env.MEILISEARCH_URL || 'http://localhost:7700',
      apiKey: process.env.MEILISEARCH_API_KEY || 'development-key',
    });
  }

  get isAvailable(): boolean {
    return this._available;
  }

  async onModuleInit() {
    try {
      await this.client.health();
      await this.ensureIndexes();
      this._available = true;
      this.logger.log('Meilisearch connected — full-text search enabled.');
    } catch (err) {
      this._available = false;
      this.logger.warn(
        'Meilisearch not available — falling back to PostgreSQL ILIKE search.',
        (err as Error).message,
      );
    }
  }

  // ── Index Setup ─────────────────────────────────────

  private async ensureIndexes() {
    // Posts
    await this.client.createIndex(POSTS_INDEX, { primaryKey: 'id' }).catch(() => {});
    const posts = this.client.index(POSTS_INDEX);
    await posts.updateSettings({
      searchableAttributes: ['title', 'content', 'authorName'],
      filterableAttributes: ['communityId', 'communitySlug', 'spaceId', 'authorId'],
      sortableAttributes: ['createdAt'],
      rankingRules: ['words', 'typo', 'proximity', 'attribute', 'sort', 'exactness'],
    });

    // Users
    await this.client.createIndex(USERS_INDEX, { primaryKey: 'id' }).catch(() => {});
    const users = this.client.index(USERS_INDEX);
    await users.updateSettings({
      searchableAttributes: ['displayName', 'username', 'bio'],
    });

    // Communities
    await this.client.createIndex(COMMUNITIES_INDEX, { primaryKey: 'id' }).catch(() => {});
    const communities = this.client.index(COMMUNITIES_INDEX);
    await communities.updateSettings({
      searchableAttributes: ['name', 'description', 'slug'],
      sortableAttributes: ['memberCount'],
    });
  }

  // ── Post CRUD ───────────────────────────────────────

  async indexPost(doc: PostDocument) {
    if (!this._available) return;
    try {
      await this.client.index(POSTS_INDEX).addDocuments([doc]);
    } catch (err) {
      this.logger.warn('Failed to index post', (err as Error).message);
    }
  }

  async updatePost(doc: Partial<PostDocument> & { id: string }) {
    if (!this._available) return;
    try {
      await this.client.index(POSTS_INDEX).updateDocuments([doc]);
    } catch (err) {
      this.logger.warn('Failed to update post in index', (err as Error).message);
    }
  }

  async removePost(id: string) {
    if (!this._available) return;
    try {
      await this.client.index(POSTS_INDEX).deleteDocument(id);
    } catch (err) {
      this.logger.warn('Failed to remove post from index', (err as Error).message);
    }
  }

  async searchPosts(
    query: string,
    opts?: { communitySlug?: string; spaceId?: string; limit?: number; offset?: number },
  ) {
    const filters: string[] = [];
    if (opts?.communitySlug) filters.push(`communitySlug = "${opts.communitySlug}"`);
    if (opts?.spaceId) filters.push(`spaceId = "${opts.spaceId}"`);

    return this.client.index(POSTS_INDEX).search<PostDocument>(query, {
      filter: filters.length ? filters.join(' AND ') : undefined,
      limit: opts?.limit ?? 20,
      offset: opts?.offset ?? 0,
      sort: ['createdAt:desc'],
    });
  }

  // ── User CRUD ───────────────────────────────────────

  async indexUser(doc: UserDocument) {
    if (!this._available) return;
    try {
      await this.client.index(USERS_INDEX).addDocuments([doc]);
    } catch (err) {
      this.logger.warn('Failed to index user', (err as Error).message);
    }
  }

  async updateUser(doc: Partial<UserDocument> & { id: string }) {
    if (!this._available) return;
    try {
      await this.client.index(USERS_INDEX).updateDocuments([doc]);
    } catch (err) {
      this.logger.warn('Failed to update user in index', (err as Error).message);
    }
  }

  async searchUsers(query: string, limit = 20, offset = 0) {
    return this.client.index(USERS_INDEX).search<UserDocument>(query, { limit, offset });
  }

  // ── Community CRUD ──────────────────────────────────

  async indexCommunity(doc: CommunityDocument) {
    if (!this._available) return;
    try {
      await this.client.index(COMMUNITIES_INDEX).addDocuments([doc]);
    } catch (err) {
      this.logger.warn('Failed to index community', (err as Error).message);
    }
  }

  async updateCommunity(doc: Partial<CommunityDocument> & { id: string }) {
    if (!this._available) return;
    try {
      await this.client.index(COMMUNITIES_INDEX).updateDocuments([doc]);
    } catch (err) {
      this.logger.warn('Failed to update community in index', (err as Error).message);
    }
  }

  async searchCommunities(query: string, limit = 20, offset = 0) {
    return this.client.index(COMMUNITIES_INDEX).search<CommunityDocument>(query, {
      limit,
      offset,
      sort: ['memberCount:desc'],
    });
  }

  // ── Multi-index Search ──────────────────────────────

  async searchAll(query: string, limit = 10) {
    const results = await this.client.multiSearch({
      queries: [
        { indexUid: POSTS_INDEX, q: query, limit },
        { indexUid: USERS_INDEX, q: query, limit },
        { indexUid: COMMUNITIES_INDEX, q: query, limit },
      ],
    });

    return {
      posts: results.results[0],
      users: results.results[1],
      communities: results.results[2],
    };
  }

  // ── Reindex ─────────────────────────────────────────

  async reindexPosts(docs: PostDocument[]) {
    if (!this._available) return;
    await this.client.index(POSTS_INDEX).deleteAllDocuments();
    if (docs.length) await this.client.index(POSTS_INDEX).addDocuments(docs);
    this.logger.log(`Reindexed ${docs.length} posts.`);
  }

  async reindexUsers(docs: UserDocument[]) {
    if (!this._available) return;
    await this.client.index(USERS_INDEX).deleteAllDocuments();
    if (docs.length) await this.client.index(USERS_INDEX).addDocuments(docs);
    this.logger.log(`Reindexed ${docs.length} users.`);
  }

  async reindexCommunities(docs: CommunityDocument[]) {
    if (!this._available) return;
    await this.client.index(COMMUNITIES_INDEX).deleteAllDocuments();
    if (docs.length) await this.client.index(COMMUNITIES_INDEX).addDocuments(docs);
    this.logger.log(`Reindexed ${docs.length} communities.`);
  }

  /** Health check */
  async isHealthy(): Promise<boolean> {
    try {
      await this.client.health();
      return true;
    } catch {
      return false;
    }
  }
}
