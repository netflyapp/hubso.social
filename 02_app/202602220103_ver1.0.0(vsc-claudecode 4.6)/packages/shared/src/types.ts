export interface CurrentUser {
  id: string;
  email: string;
  username: string;
  avatarUrl?: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR' | 'MEMBER' | 'GUEST';
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ─── Community ────────────────────────────────────────────────────────────────

export type MemberRole = 'OWNER' | 'ADMIN' | 'MODERATOR' | 'MEMBER' | 'GUEST';
export type CommunityPlan = 'STARTER' | 'GROWTH' | 'SCALE' | 'ENTERPRISE';

export interface CommunityListItem {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  description: string | null;
  plan: CommunityPlan;
  memberCount: number;
  isJoined: boolean;
  memberRole: MemberRole | null;
  createdAt: string;
}

export interface CommunityDetail extends CommunityListItem {
  owner: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
}

// ─── Posts ────────────────────────────────────────────────────────────────────

export type PostType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'POLL' | 'LINK' | 'EMBED';
export type PostStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'DELETED';

export interface PostAuthor {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface PostItem {
  id: string;
  content: unknown; // Tiptap JSON or plain string
  type: PostType;
  status: PostStatus;
  pinned: boolean;
  featured: boolean;
  reactionsCount: Record<string, number>;
  author: PostAuthor;
  spaceId: string;
  spaceName: string;
  communityId: string;
  communitySlug: string;
  communityName: string;
  commentsCount: number;
  createdAt: string;
}

export interface PaginatedPostsResponse {
  data: PostItem[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// ==================== Comments ====================

export interface CommentAuthor {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface CommentItem {
  id: string;
  content: string;
  parentId: string | null;
  author: CommentAuthor;
  repliesCount: number;
  reactionsCount: number;
  createdAt: string;
  replies?: CommentItem[];
}
