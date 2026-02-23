import { tokenStore } from '@/lib/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  token?: string
  _retry?: boolean
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, _retry = false } = options

  // Użyj podanego tokenu lub pobierz z localStorage
  const token = options.token ?? tokenStore.getAccessToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  // Automatyczny token refresh przy 401
  if (res.status === 401 && !_retry) {
    const refreshToken = tokenStore.getRefreshToken()
    if (refreshToken) {
      try {
        const refreshed = await request<{ accessToken: string }>('/auth/refresh', {
          method: 'POST',
          body: { refreshToken },
          _retry: true,
        })
        tokenStore.setAccessToken(refreshed.accessToken)
        // Ponów oryginalne żądanie z nowym tokenem
        return request<T>(path, { ...options, token: refreshed.accessToken, _retry: true })
      } catch {
        // Refresh się nie powiódł — wyczyść tokeny
        tokenStore.clear()
        throw new ApiError(401, 'Session expired. Please log in again.')
      }
    }
  }

  const data = await res.json().catch(() => ({ message: 'No response body' }))

  if (!res.ok) {
    throw new ApiError(res.status, data?.message ?? res.statusText, data)
  }

  return data as T
}

// Auth endpoints
export const authApi = {
  register: (payload: { email: string; password: string; username?: string; displayName?: string }) =>
    request<{ id: string; email: string; message: string }>('/auth/register', {
      method: 'POST',
      body: payload,
    }),

  login: (payload: { email: string; password: string }) =>
    request<{ accessToken: string; refreshToken: string }>('/auth/login', {
      method: 'POST',
      body: payload,
    }),

  refresh: (refreshToken: string) =>
    request<{ accessToken: string }>('/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
    }),
}

export interface MeResponse {
  id: string
  email: string
  username: string
  displayName: string | null
  avatarUrl: string | null
  bio: string | null
  role: string
  status: string
  createdAt: string
}

// Users endpoints
export const usersApi = {
  me: () =>
    request<MeResponse>('/users/me'),
}

// ─── Communities ──────────────────────────────────────────────────────────────

export interface CommunityItem {
  id: string
  name: string
  slug: string
  logoUrl: string | null
  description: string | null
  plan: 'STARTER' | 'GROWTH' | 'SCALE' | 'ENTERPRISE'
  memberCount: number
  isJoined: boolean
  memberRole: 'OWNER' | 'ADMIN' | 'MODERATOR' | 'MEMBER' | 'GUEST' | null
  createdAt: string
}

export interface CommunityDetailResponse extends CommunityItem {
  owner: {
    id: string
    username: string
    displayName: string | null
    avatarUrl: string | null
  }
}

export const communitiesApi = {
  list: () =>
    request<CommunityItem[]>('/communities'),

  get: (slug: string) =>
    request<CommunityDetailResponse>(`/communities/${slug}`),

  create: (payload: { name: string; slug: string; description?: string; logoUrl?: string }) =>
    request<CommunityItem>('/communities', { method: 'POST', body: payload }),

  join: (slug: string) =>
    request<{ message: string }>(`/communities/${slug}/join`, { method: 'POST' }),

  leave: (slug: string) =>
    request<{ message: string }>(`/communities/${slug}/leave`, { method: 'DELETE' }),
}

// ─── Posts ────────────────────────────────────────────────────────────────────

export interface PostAuthor {
  id: string
  username: string
  displayName: string | null
  avatarUrl: string | null
}

export interface PostItem {
  id: string
  content: unknown
  type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'POLL' | 'LINK' | 'EMBED'
  status: string
  pinned: boolean
  featured: boolean
  reactionsCount: Record<string, number>
  userReaction: string | null
  author: PostAuthor
  spaceId: string
  spaceName: string
  communityId: string
  communitySlug: string
  communityName: string
  commentsCount: number
  createdAt: string
}

export interface PaginatedPostsResponse {
  data: PostItem[]
  total: number
  page: number
  limit: number
  pages: number
}

export const postsApi = {
  feed: (page = 1, limit = 20) =>
    request<PaginatedPostsResponse>(`/posts/feed?page=${page}&limit=${limit}`),

  byCommunity: (slug: string, page = 1, limit = 20) =>
    request<PaginatedPostsResponse>(`/communities/${slug}/posts?page=${page}&limit=${limit}`),

  get: (id: string) =>
    request<PostItem>(`/posts/${id}`),

  create: (slug: string, payload: { content: unknown; type?: string }) =>
    request<PostItem>(`/communities/${slug}/posts`, { method: 'POST', body: payload }),

  remove: (id: string) =>
    request<{ message: string }>(`/posts/${id}`, { method: 'DELETE' }),
}

// ==================== Comments ====================

export interface CommentItem {
  id: string
  content: string
  parentId: string | null
  author: {
    id: string
    username: string
    displayName: string | null
    avatarUrl: string | null
  }
  repliesCount: number
  reactionsCount: number
  createdAt: string
  replies?: CommentItem[]
}

export const commentsApi = {
  list: (postId: string) =>
    request<CommentItem[]>(`/posts/${postId}/comments`),

  create: (postId: string, payload: { content: string; parentId?: string }) =>
    request<CommentItem>(`/posts/${postId}/comments`, { method: 'POST', body: payload }),

  remove: (commentId: string) =>
    request<{ deleted: boolean }>(`/comments/${commentId}`, { method: 'DELETE' }),
}

export type ReactionType = 'LIKE' | 'LOVE' | 'WOW' | 'FIRE' | 'SAD' | 'ANGRY'

export const reactionsApi = {
  toggle: (payload: { targetType: 'Post' | 'Comment'; targetId: string; type: ReactionType }) =>
    request<{ reactions: Record<string, number>; userReaction: string | null }>(
      '/reactions/toggle',
      { method: 'POST', body: payload },
    ),
}
