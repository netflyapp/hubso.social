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

  /** Fetch packed CASL rules for current user (optionally scoped to a community) */
  permissions: (communityId?: string) =>
    request<{ rules: Array<{ action: string | string[]; subject: string | string[]; inverted?: boolean }> }>(
      communityId ? `/auth/me/permissions?communityId=${communityId}` : '/auth/me/permissions',
    ),
}

export interface MeResponse {
  id: string
  email: string
  username: string
  displayName: string | null
  avatarUrl: string | null
  bio: string | null
  role: string
  status?: string
  followersCount: number
  followingCount: number
  isFollowedByMe?: boolean
  createdAt: string
}

// Users endpoints
export const usersApi = {
  list: (params?: { page?: number; limit?: number; search?: string }) => {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    if (params?.limit) qs.set('limit', String(params.limit))
    if (params?.search) qs.set('search', params.search)
    return request<{
      users: { id: string; username: string; displayName: string | null; avatarUrl: string | null; bio: string | null; role: string; followersCount: number; createdAt: string }[]
      total: number; page: number; pages: number
    }>(`/users?${qs.toString()}`)
  },

  me: () =>
    request<MeResponse>('/users/me'),

  getById: (id: string) =>
    request<MeResponse>(`/users/${id}`),

  updateMe: (data: { displayName?: string; bio?: string; username?: string; avatarUrl?: string }) =>
    request<MeResponse>('/users/me', { method: 'PATCH', body: data }),

  uploadAvatar: async (file: File): Promise<MeResponse> => {
    const token = typeof window !== 'undefined' ? tokenStore.getAccessToken() : null
    const form = new FormData()
    form.append('file', file)
    const res = await fetch(`${API_URL}/users/me/avatar`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    })
    if (!res.ok) {
      const json = await res.json().catch(() => ({}))
      throw new Error(json.message ?? `HTTP ${res.status}`)
    }
    return res.json()
  },
}

// ─── Upload (general media) ──────────────────────────────────────────────────

export interface UploadResult {
  id: string
  url: string
  type: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'FILE'
  storageKey: string
}

export const uploadApi = {
  /** Legacy multipart upload (still works) */
  upload: async (file: File, communityId?: string): Promise<UploadResult> => {
    const token = typeof window !== 'undefined' ? tokenStore.getAccessToken() : null
    const form = new FormData()
    form.append('file', file)
    const params = communityId ? `?communityId=${communityId}` : ''
    const res = await fetch(`${API_URL}/upload${params}`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    })
    if (!res.ok) {
      const json = await res.json().catch(() => ({}))
      throw new Error(json.message ?? `HTTP ${res.status}`)
    }
    return res.json()
  },

  /** Get presigned URL for direct upload to S3/MinIO */
  getPresignedUrl: async (filename: string, contentType: string, folder?: string) => {
    const params = new URLSearchParams({ filename, contentType })
    if (folder) params.append('folder', folder)
    return request<{
      uploadUrl: string
      publicUrl: string
      storageKey: string
      expiresIn: number
    }>(`/upload/presigned?${params}`)
  },

  /** Confirm upload and create MediaFile record */
  confirmUpload: (data: {
    storageKey: string
    publicUrl: string
    contentType: string
    originalName?: string
    size?: number
    communityId?: string
  }) =>
    request<UploadResult>('/upload/confirm', { method: 'POST', body: data }),

  /** Upload via presigned URL (recommended for larger files) */
  uploadPresigned: async (file: File, folder?: string, communityId?: string): Promise<UploadResult> => {
    // 1. Get presigned URL
    const { uploadUrl, publicUrl, storageKey } = await uploadApi.getPresignedUrl(
      file.name,
      file.type,
      folder,
    )

    // 2. Upload directly to S3/MinIO
    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
    })
    if (!uploadRes.ok) throw new Error('Błąd przesyłania pliku do storage')

    // 3. Confirm and create record
    return uploadApi.confirmUpload({
      storageKey,
      publicUrl,
      contentType: file.type,
      originalName: file.name,
      size: file.size,
      communityId,
    })
  },

  /** Check storage health */
  health: () => request<{ available: boolean; healthy: boolean }>('/upload/health'),
}

// ─── Communities ──────────────────────────────────────────────────────────────

export interface CommunityItem {
  id: string
  name: string
  slug: string
  logoUrl: string | null
  coverUrl: string | null
  brandColor: string | null
  brandFont: string | null
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

export interface CommunityMemberItem {
  id: string
  username: string
  displayName: string | null
  avatarUrl: string | null
  bio: string | null
  role: 'OWNER' | 'ADMIN' | 'MODERATOR' | 'MEMBER' | 'GUEST'
  joinedAt: string
  points: number
  level: number
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

  getMembers: (slug: string) =>
    request<CommunityMemberItem[]>(`/communities/${slug}/members`),

  update: (slug: string, payload: { name?: string; description?: string; logoUrl?: string; coverUrl?: string; brandColor?: string; brandFont?: string }) =>
    request<CommunityItem>(`/communities/${slug}`, { method: 'PATCH', body: payload }),

  remove: (slug: string) =>
    request<{ message: string }>(`/communities/${slug}`, { method: 'DELETE' }),
}

// ─── Follow ───────────────────────────────────────────────────────────────────

export interface FollowUserItem {
  id: string
  username: string
  displayName: string | null
  avatarUrl: string | null
  bio: string | null
  isFollowedByMe: boolean
}

export const followsApi = {
  follow: (userId: string) =>
    request<{ following: boolean }>(`/users/${userId}/follow`, { method: 'POST' }),

  unfollow: (userId: string) =>
    request<{ following: boolean }>(`/users/${userId}/follow`, { method: 'DELETE' }),

  getFollowers: (userId: string) =>
    request<FollowUserItem[]>(`/users/${userId}/followers`),

  getFollowing: (userId: string) =>
    request<FollowUserItem[]>(`/users/${userId}/following`),
}

// ─── Notifications ────────────────────────────────────────────────────────────

export interface NotificationItem {
  id: string
  type: string
  data: Record<string, unknown>
  readAt: string | null
  communityId: string | null
  createdAt: string
}

export const notificationsApi = {
  list: () =>
    request<{ notifications: NotificationItem[]; unreadCount: number }>('/notifications'),

  getCount: () =>
    request<{ count: number }>('/notifications/count'),

  unreadCount: () =>
    request<{ count: number }>('/notifications/count'),

  markRead: (id: string) =>
    request<NotificationItem>(`/notifications/${id}/read`, { method: 'PATCH' }),

  markAllRead: () =>
    request<{ updated: number }>('/notifications/read-all', { method: 'POST' }),
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

  bySpace: (spaceId: string, page = 1, limit = 20) =>
    request<PaginatedPostsResponse>(`/spaces/${spaceId}/posts?page=${page}&limit=${limit}`),

  createInSpace: (spaceId: string, payload: { content: unknown; type?: string }) =>
    request<PostItem>(`/spaces/${spaceId}/posts`, { method: 'POST', body: payload }),

  byUser: (userId: string, page = 1, limit = 20) =>
    request<PaginatedPostsResponse>(`/users/${userId}/posts?page=${page}&limit=${limit}`),
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

// ==================== Direct Messages ====================

export interface MessageSender {
  id: string
  username: string
  displayName: string | null
  avatarUrl: string | null
  bio: string | null
}

export interface MessageItem {
  id: string
  conversationId: string
  senderId: string
  content: string
  type: 'TEXT' | 'IMAGE' | 'FILE' | 'VOICE' | 'VIDEO'
  parentId: string | null
  readAt: string | null
  createdAt: string
  updatedAt: string
  sender: MessageSender
}

export interface ConversationItem {
  id: string
  type: 'DIRECT' | 'GROUP'
  name: string | null
  avatarUrl: string | null
  createdAt: string
  updatedAt: string
  participants: MessageSender[]
  otherParticipants: MessageSender[]
  lastMessage: MessageItem | null
  unreadCount?: number
}

export interface MessagesResponse {
  messages: MessageItem[]
  nextCursor: string | null
  hasMore: boolean
}

export const conversationsApi = {
  list: () =>
    request<ConversationItem[]>('/conversations'),

  getOrCreateDm: (recipientId: string) =>
    request<ConversationItem>('/conversations/dm', {
      method: 'POST',
      body: { recipientId },
    }),

  createGroup: (name: string, participantIds: string[]) =>
    request<ConversationItem>('/conversations/group', {
      method: 'POST',
      body: { name, participantIds },
    }),

  updateGroup: (conversationId: string, data: { name?: string; avatarUrl?: string }) =>
    request<ConversationItem>(`/conversations/${conversationId}/group`, {
      method: 'PATCH',
      body: data,
    }),

  addParticipant: (conversationId: string, userId: string) =>
    request<{ added: boolean; user: MessageSender }>(`/conversations/${conversationId}/participants`, {
      method: 'POST',
      body: { userId },
    }),

  removeParticipant: (conversationId: string, userId: string) =>
    request<{ removed: boolean }>(`/conversations/${conversationId}/participants/${userId}`, {
      method: 'DELETE',
    }),

  leaveGroup: (conversationId: string) =>
    request<{ left: boolean }>(`/conversations/${conversationId}/leave`, {
      method: 'DELETE',
    }),

  getMessages: (conversationId: string, cursor?: string, limit = 50) => {
    const params = new URLSearchParams({ limit: String(limit) })
    if (cursor) params.set('cursor', cursor)
    return request<MessagesResponse>(
      `/conversations/${conversationId}/messages?${params}`,
    )
  },

  sendMessage: (conversationId: string, content: string, type = 'TEXT') =>
    request<MessageItem>(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: { content, type },
    }),

  markRead: (conversationId: string) =>
    request<{ markedRead: number; conversationId: string }>(
      `/conversations/${conversationId}/read`,
      { method: 'POST' },
    ),

  deleteMessage: (messageId: string) =>
    request<{ deleted: boolean }>(`/messages/${messageId}`, {
      method: 'DELETE',
    }),

  getUnreadCounts: () =>
    request<Record<string, number>>('/conversations/unread'),
}

// ─── Presence ─────────────────────────────────────────────────────────────────

export const presenceApi = {
  /**
   * GET /users/presence?ids=id1,id2,id3
   * Returns { [userId]: boolean }
   */
  get: (userIds: string[]) =>
    request<Record<string, boolean>>(`/presence?ids=${userIds.join(',')}`),

  /**
   * GET /presence/me
   */
  me: () =>
    request<{ userId: string; online: boolean }>('/presence/me'),
}

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface GroupItem {
  id: string
  name: string
  description: string | null
  visibility: 'PUBLIC' | 'PRIVATE' | 'HIDDEN'
  rules: string | null
  communityId: string
  memberCount: number
  isJoined: boolean
  memberRole: string | null
  createdAt: string
}

export interface GroupMemberItem {
  userId: string
  role: string
  joinedAt: string
  user: {
    id: string
    username: string
    displayName: string | null
    avatarUrl: string | null
  }
}

export interface EventItem {
  id: string
  title: string
  description: string | null
  startsAt: string
  endsAt: string
  locationType: 'VIRTUAL' | 'IN_PERSON' | 'HYBRID'
  location: string | null
  maxAttendees: number | null
  ticketPrice: number | null
  spaceId: string
  creator: {
    id: string
    username: string
    displayName: string | null
    avatarUrl: string | null
  }
  attendeeCount: number
  myRsvp: 'GOING' | 'MAYBE' | 'NOT_GOING' | null
  createdAt: string
}

// ─── Groups ───────────────────────────────────────────────────────────────────

export const groupsApi = {
  list: (communityId: string) =>
    request<GroupItem[]>(`/groups?communityId=${communityId}`),

  get: (id: string) =>
    request<GroupItem>(`/groups/${id}`),

  create: (payload: {
    communityId: string
    name: string
    description?: string
    visibility?: 'PUBLIC' | 'PRIVATE' | 'HIDDEN'
    rules?: string
  }) =>
    request<GroupItem>('/groups', { method: 'POST', body: payload }),

  update: (
    id: string,
    patch: Partial<{ name: string; description: string; visibility: 'PUBLIC' | 'PRIVATE' | 'HIDDEN'; rules: string }>,
  ) =>
    request<GroupItem>(`/groups/${id}`, { method: 'PATCH', body: patch }),

  delete: (id: string) =>
    request<{ deleted: boolean }>(`/groups/${id}`, { method: 'DELETE' }),

  join: (id: string) =>
    request<{ joined: boolean; groupId: string }>(`/groups/${id}/join`, { method: 'POST' }),

  leave: (id: string) =>
    request<{ left: boolean; groupId: string }>(`/groups/${id}/leave`, { method: 'DELETE' }),

  members: (id: string, page = 1, limit = 20) =>
    request<{ members: GroupMemberItem[]; total: number; page: number; limit: number }>(
      `/groups/${id}/members?page=${page}&limit=${limit}`,
    ),

  removeMember: (groupId: string, userId: string) =>
    request<{ removed: boolean }>(`/groups/${groupId}/members/${userId}`, { method: 'DELETE' }),
}

// ─── Events ───────────────────────────────────────────────────────────────────

export const eventsApi = {
  listBySpace: (spaceId: string) =>
    request<EventItem[]>(`/events?spaceId=${spaceId}`),

  upcoming: () =>
    request<EventItem[]>('/events/upcoming'),

  get: (id: string) =>
    request<EventItem>(`/events/${id}`),

  create: (payload: {
    spaceId: string
    title: string
    description?: string
    startsAt: string
    endsAt: string
    locationType?: 'VIRTUAL' | 'IN_PERSON' | 'HYBRID'
    location?: string
    maxAttendees?: number
    ticketPrice?: number
  }) =>
    request<EventItem>('/events', { method: 'POST', body: payload }),

  update: (
    id: string,
    patch: Partial<{
      title: string
      description: string
      startsAt: string
      endsAt: string
      locationType: 'VIRTUAL' | 'IN_PERSON' | 'HYBRID'
      location: string
      maxAttendees: number
      ticketPrice: number
    }>,
  ) =>
    request<EventItem>(`/events/${id}`, { method: 'PATCH', body: patch }),

  delete: (id: string) =>
    request<{ deleted: boolean }>(`/events/${id}`, { method: 'DELETE' }),

  rsvp: (id: string, status: 'GOING' | 'MAYBE' | 'NOT_GOING') =>
    request<{ rsvpStatus: string; eventId: string }>(`/events/${id}/rsvp`, {
      method: 'POST',
      body: { status },
    }),

  cancelRsvp: (id: string) =>
    request<{ cancelled: boolean; eventId: string }>(`/events/${id}/rsvp`, { method: 'DELETE' }),

  attendees: (id: string, page = 1, limit = 20) =>
    request<{ attendees: GroupMemberItem[]; total: number; page: number; limit: number }>(
      `/events/${id}/attendees?page=${page}&limit=${limit}`,
    ),

  icalUrl: (id: string) =>
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/events/${id}/ical`,
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export const adminApi = {
  stats: () =>
    request<{
      totalUsers: number
      activeUsers: number
      newUsersThisWeek: number
      totalCommunities: number
      newCommunitiesThisMonth: number
      totalPosts: number
      newPostsThisWeek: number
      flaggedPosts: number
      postsActivity: { date: string; posts: number }[]
      userGrowth: { date: string; users: number }[]
    }>('/admin/stats'),

  users: (params?: {
    page?: number
    limit?: number
    search?: string
    role?: string
    status?: string
  }) => {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    if (params?.limit) qs.set('limit', String(params.limit))
    if (params?.search) qs.set('search', params.search)
    if (params?.role) qs.set('role', params.role)
    if (params?.status) qs.set('status', params.status)
    return request<{
      users: {
        id: string
        email: string
        username: string
        displayName: string | null
        avatarUrl: string | null
        role: string
        status: string
        followersCount: number
        createdAt: string
      }[]
      total: number
      page: number
      limit: number
      pages: number
    }>(`/admin/users?${qs.toString()}`)
  },

  updateUser: (id: string, data: { role?: string; status?: string }) =>
    request<{ id: string; role: string; status: string }>(
      `/admin/users/${id}`,
      { method: 'PATCH', body: data },
    ),

  deleteUser: (id: string) =>
    request<{ deleted: boolean }>(`/admin/users/${id}`, { method: 'DELETE' }),

  moderation: (params?: { page?: number; limit?: number }) => {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    if (params?.limit) qs.set('limit', String(params.limit))
    return request<{
      posts: {
        id: string
        content: Record<string, unknown>
        createdAt: string
        author: { id: string; username: string; displayName: string | null; avatarUrl: string | null }
        space?: { id: string; name: string } | null
        community?: { id: string; name: string; slug: string } | null
      }[]
      total: number
      page: number
      limit: number
      pages: number
    }>(`/admin/moderation?${qs.toString()}`)
  },

  flagPost: (postId: string) =>
    request<{ flagged: boolean }>(`/admin/moderation/${postId}/flag`, {
      method: 'POST',
    }),

  unflagPost: (postId: string) =>
    request<{ flagged: boolean }>(`/admin/moderation/${postId}/unflag`, {
      method: 'POST',
    }),

  approvePost: (postId: string) =>
    request<{ approved: boolean }>(`/admin/moderation/${postId}/approve`, {
      method: 'POST',
    }),

  rejectPost: (postId: string) =>
    request<{ rejected: boolean }>(`/admin/moderation/${postId}/reject`, {
      method: 'POST',
    }),

  updateBranding: (
    slug: string,
    data: {
      brandColor?: string
      brandFont?: string
      logoUrl?: string
      coverUrl?: string
      description?: string
    },
  ) =>
    request<{ id: string; slug: string; brandColor: string | null; brandFont: string | null }>(
      `/admin/communities/${slug}/branding`,
      { method: 'PATCH', body: data },
    ),
}

// ─── Search ───────────────────────────────────────────────────────────────────

// ── Spaces ──────────────────────────────────────────

export interface SpaceItem {
  id: string
  name: string
  description: string | null
  type: 'POSTS' | 'CHAT' | 'EVENTS' | 'LINKS' | 'FILES'
  visibility: 'PUBLIC' | 'PRIVATE' | 'SECRET'
  paywallEnabled: boolean
  spaceGroupId: string | null
  createdAt: string
  updatedAt?: string
  communityId?: string
  community?: { id: string; name: string; slug: string }
  spaceGroup?: { id: string; name: string } | null
  memberCount: number
  postCount: number
  eventCount?: number
  isJoined: boolean
  memberRole: string | null
}

export interface SpaceGroupItem {
  id: string
  name: string
  position: number
  collapsedDefault: boolean
  spaces: SpaceItem[]
}

export interface SpaceGroupsResponse {
  groups: SpaceGroupItem[]
  ungroupedSpaces: SpaceItem[]
}

export const spacesApi = {
  // Space Groups
  getGroups: (communitySlug: string) =>
    request<SpaceGroupsResponse>(`/communities/${communitySlug}/space-groups`),

  createGroup: (communitySlug: string, data: { name: string; position?: number; collapsedDefault?: boolean }) =>
    request<SpaceGroupItem>(`/communities/${communitySlug}/space-groups`, { method: 'POST', body: data }),

  updateGroup: (groupId: string, data: { name?: string; position?: number; collapsedDefault?: boolean }) =>
    request<SpaceGroupItem>(`/space-groups/${groupId}`, { method: 'PATCH', body: data }),

  deleteGroup: (groupId: string) =>
    request<{ message: string }>(`/space-groups/${groupId}`, { method: 'DELETE' }),

  // Spaces
  list: (communitySlug: string) =>
    request<SpaceItem[]>(`/communities/${communitySlug}/spaces`),

  get: (spaceId: string) =>
    request<SpaceItem>(`/spaces/${spaceId}`),

  create: (communitySlug: string, data: {
    name: string
    description?: string
    type: 'POSTS' | 'CHAT' | 'EVENTS' | 'LINKS' | 'FILES'
    visibility?: 'PUBLIC' | 'PRIVATE' | 'SECRET'
    spaceGroupId?: string
  }) =>
    request<SpaceItem>(`/communities/${communitySlug}/spaces`, { method: 'POST', body: data }),

  update: (spaceId: string, data: {
    name?: string
    description?: string
    visibility?: 'PUBLIC' | 'PRIVATE' | 'SECRET'
    spaceGroupId?: string | null
    paywallEnabled?: boolean
  }) =>
    request<SpaceItem>(`/spaces/${spaceId}`, { method: 'PATCH', body: data }),

  remove: (spaceId: string) =>
    request<{ message: string }>(`/spaces/${spaceId}`, { method: 'DELETE' }),

  // Membership
  join: (spaceId: string) =>
    request<{ message: string }>(`/spaces/${spaceId}/join`, { method: 'POST' }),

  leave: (spaceId: string) =>
    request<{ message: string }>(`/spaces/${spaceId}/leave`, { method: 'DELETE' }),

  getMembers: (spaceId: string) =>
    request<{ id: string; username: string; displayName: string | null; avatarUrl: string | null; bio: string | null; role: string; addedAt: string }[]>(
      `/spaces/${spaceId}/members`,
    ),
}

export const searchApi = {
  search: (
    q: string,
    type: 'all' | 'users' | 'communities' | 'posts' = 'all',
    limit = 10,
  ) =>
    request<{
      users: {
        id: string
        username: string
        displayName: string | null
        avatarUrl: string | null
        bio: string | null
        role: string
      }[]
      communities: {
        id: string
        name: string
        slug: string
        logoUrl: string | null
        description: string | null
        _count: { members: number }
      }[]
      posts: {
        id: string
        searchableText: string | null
        type: string
        createdAt: string
        author: {
          id: string
          username: string
          displayName: string | null
          avatarUrl: string | null
        }
        space: {
          id: string
          name: string
          community: { id: string; slug: string; name: string }
        } | null
      }[]
    }>(`/search?q=${encodeURIComponent(q)}&type=${type}&limit=${limit}`),

  suggestions: (q: string) =>
    request<{
      users: { id: string; username: string; displayName: string | null; avatarUrl: string | null }[]
      communities: { id: string; name: string; slug: string; logoUrl: string | null }[]
    }>(`/search/suggestions?q=${encodeURIComponent(q)}`),

  members: (
    communityId: string,
    params?: { q?: string; role?: string; page?: number; limit?: number },
  ) => {
    const qs = new URLSearchParams()
    if (params?.q) qs.set('q', params.q)
    if (params?.role) qs.set('role', params.role)
    if (params?.page) qs.set('page', String(params.page))
    if (params?.limit) qs.set('limit', String(params.limit))
    return request<{
      members: {
        id: string
        username: string
        displayName: string | null
        avatarUrl: string | null
        bio: string | null
        socialLinks: Record<string, string>
        followersCount: number
        memberRole: string
        joinedAt: string
      }[]
      total: number
      page: number
      limit: number
      pages: number
    }>(`/search/members/${communityId}?${qs.toString()}`)
  },
}

// ─── Courses API ─────────────────────────────────────────────────────────────

export interface Course {
  id: string
  communityId: string
  title: string
  slug: string
  description: string | null
  coverUrl: string | null
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  price: string | null
  currency: string
  isFree: boolean
  accessType: 'PUBLIC' | 'MEMBERS_ONLY' | 'PRIVATE'
  settings: Record<string, unknown>
  createdAt: string
  updatedAt: string
  modules: CourseModule[]
  lessonsCount?: number
  enrollmentsCount?: number
  enrollment?: Enrollment | null
}

export interface CourseModule {
  id: string
  courseId: string
  title: string
  description: string | null
  position: number
  createdAt: string
  updatedAt: string
  lessons: Lesson[]
}

export interface Lesson {
  id: string
  moduleId: string
  title: string
  description: string | null
  content: unknown | null
  videoUrl: string | null
  videoDuration: number | null
  bunnyVideoId: string | null
  thumbnailUrl: string | null
  hlsUrl: string | null
  position: number
  isFree: boolean
  createdAt: string
  updatedAt: string
}

export interface Enrollment {
  id: string
  userId: string
  courseId: string
  status: 'ACTIVE' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED'
  progress: number
  completedAt: string | null
  createdAt: string
  updatedAt: string
  lessonProgress?: LessonProgress[]
  course?: Course
}

export interface LessonProgress {
  id: string
  enrollmentId: string
  lessonId: string
  completed: boolean
  watchTime: number
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

export const coursesApi = {
  // Course CRUD
  list: (communitySlug: string, params?: { status?: string; page?: number; limit?: number }) => {
    const qs = new URLSearchParams()
    if (params?.status) qs.set('status', params.status)
    if (params?.page) qs.set('page', String(params.page))
    if (params?.limit) qs.set('limit', String(params.limit))
    return request<{
      data: Course[]
      total: number
      page: number
      limit: number
      pages: number
    }>(`/communities/${communitySlug}/courses?${qs.toString()}`)
  },

  get: (communitySlug: string, courseSlug: string) =>
    request<Course>(`/communities/${communitySlug}/courses/${courseSlug}`),

  create: (communitySlug: string, data: {
    title: string
    slug: string
    description?: string
    coverUrl?: string
    price?: number
    currency?: string
    isFree?: boolean
    accessType?: 'PUBLIC' | 'MEMBERS_ONLY' | 'PRIVATE'
  }) =>
    request<Course>(`/communities/${communitySlug}/courses`, {
      method: 'POST',
      body: data,
    }),

  update: (communitySlug: string, courseId: string, data: Partial<{
    title: string
    slug: string
    description: string
    coverUrl: string
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
    price: number
    currency: string
    isFree: boolean
    accessType: 'PUBLIC' | 'MEMBERS_ONLY' | 'PRIVATE'
    settings: Record<string, unknown>
  }>) =>
    request<Course>(`/communities/${communitySlug}/courses/${courseId}`, {
      method: 'PATCH',
      body: data,
    }),

  delete: (communitySlug: string, courseId: string) =>
    request<{ success: boolean }>(`/communities/${communitySlug}/courses/${courseId}`, {
      method: 'DELETE',
    }),

  // Module CRUD
  createModule: (communitySlug: string, courseId: string, data: {
    title: string
    description?: string
    position?: number
  }) =>
    request<CourseModule>(`/communities/${communitySlug}/courses/${courseId}/modules`, {
      method: 'POST',
      body: data,
    }),

  updateModule: (communitySlug: string, moduleId: string, data: Partial<{
    title: string
    description: string
    position: number
  }>) =>
    request<CourseModule>(`/communities/${communitySlug}/courses/modules/${moduleId}`, {
      method: 'PATCH',
      body: data,
    }),

  deleteModule: (communitySlug: string, moduleId: string) =>
    request<{ success: boolean }>(`/communities/${communitySlug}/courses/modules/${moduleId}`, {
      method: 'DELETE',
    }),

  reorderModules: (communitySlug: string, courseId: string, moduleIds: string[]) =>
    request<Course>(`/communities/${communitySlug}/courses/${courseId}/modules/reorder`, {
      method: 'PATCH',
      body: { moduleIds },
    }),

  // Lesson CRUD
  createLesson: (communitySlug: string, moduleId: string, data: {
    title: string
    description?: string
    content?: unknown
    videoUrl?: string
    videoDuration?: number
    position?: number
    isFree?: boolean
  }) =>
    request<Lesson>(`/communities/${communitySlug}/courses/modules/${moduleId}/lessons`, {
      method: 'POST',
      body: data,
    }),

  updateLesson: (communitySlug: string, lessonId: string, data: Partial<{
    title: string
    description: string
    content: unknown
    videoUrl: string
    videoDuration: number
    bunnyVideoId: string
    thumbnailUrl: string
    hlsUrl: string
    position: number
    isFree: boolean
  }>) =>
    request<Lesson>(`/communities/${communitySlug}/courses/lessons/${lessonId}`, {
      method: 'PATCH',
      body: data,
    }),

  deleteLesson: (communitySlug: string, lessonId: string) =>
    request<{ success: boolean }>(`/communities/${communitySlug}/courses/lessons/${lessonId}`, {
      method: 'DELETE',
    }),

  reorderLessons: (communitySlug: string, moduleId: string, lessonIds: string[]) =>
    request<CourseModule>(`/communities/${communitySlug}/courses/modules/${moduleId}/lessons/reorder`, {
      method: 'PATCH',
      body: { lessonIds },
    }),

  // Enrollment
  enroll: (communitySlug: string, courseId: string) =>
    request<Enrollment>(`/communities/${communitySlug}/courses/${courseId}/enroll`, {
      method: 'POST',
    }),

  unenroll: (communitySlug: string, courseId: string) =>
    request<{ success: boolean }>(`/communities/${communitySlug}/courses/${courseId}/enroll`, {
      method: 'DELETE',
    }),

  getMyEnrollments: (params?: { status?: string; page?: number; limit?: number }) => {
    const qs = new URLSearchParams()
    if (params?.status) qs.set('status', params.status)
    if (params?.page) qs.set('page', String(params.page))
    if (params?.limit) qs.set('limit', String(params.limit))
    return request<{
      data: Enrollment[]
      total: number
      page: number
      limit: number
      pages: number
    }>(`/enrollments/my?${qs.toString()}`)
  },

  // Progress
  markLessonComplete: (communitySlug: string, lessonId: string) =>
    request<LessonProgress>(`/communities/${communitySlug}/courses/lessons/${lessonId}/complete`, {
      method: 'POST',
    }),

  updateWatchTime: (communitySlug: string, lessonId: string, watchTime: number) =>
    request<LessonProgress>(`/communities/${communitySlug}/courses/lessons/${lessonId}/watch-time`, {
      method: 'PATCH',
      body: { watchTime },
    }),

  getProgress: (communitySlug: string, courseId: string) =>
    request<{
      enrolled: boolean
      enrollmentId?: string
      overallProgress?: number
      status?: string
      completedAt?: string | null
      progress?: LessonProgress[]
    }>(`/communities/${communitySlug}/courses/${courseId}/progress`),
}

// ==================== Gamification ====================

export interface PointTransaction {
  id: string
  userId: string
  communityId: string
  points: number
  reason: string
  referenceType?: string | null
  referenceId?: string | null
  description?: string | null
  createdAt: string
}

export interface Badge {
  id: string
  communityId: string
  name: string
  slug: string
  description?: string | null
  iconUrl?: string | null
  color: string
  category: string
  criteria: Record<string, unknown>
  pointsReward: number
  isAutomatic: boolean
  isActive: boolean
  sortOrder: number
  createdAt: string
  _count?: { userBadges: number }
}

export interface UserBadge {
  id: string
  userId: string
  badgeId: string
  badge: Badge
  awardedAt: string
  awardedBy?: string | null
}

export interface UserLevel {
  id: string
  userId: string
  communityId: string
  level: number
  title: string
  totalPoints: number
  currentLevelPoints: number
  nextLevelThreshold: number
}

export interface UserStreak {
  id: string
  userId: string
  communityId: string
  currentStreak: number
  longestStreak: number
  lastActiveDate?: string | null
  streakStartDate?: string | null
}

export interface Challenge {
  id: string
  communityId: string
  title: string
  slug: string
  description?: string | null
  type: string
  durationDays: number
  goal: Record<string, unknown>
  pointsReward: number
  badgeReward?: string | null
  maxParticipants?: number | null
  startDate?: string | null
  endDate?: string | null
  isActive: boolean
  createdAt: string
  _count?: { participants: number }
  participants?: Array<{
    id: string
    progress: number
    status: string
    user: { id: string; username: string; displayName?: string | null; avatarUrl?: string | null }
  }>
}

export interface ChallengeParticipation {
  id: string
  challengeId: string
  challenge: Challenge
  userId: string
  progress: number
  status: string
  completedAt?: string | null
  joinedAt: string
}

export interface LeaderboardEntry {
  rank: number
  id: string
  userId: string
  communityId: string
  level: number
  title: string
  totalPoints: number
  user: {
    id: string
    username: string
    displayName?: string | null
    avatarUrl?: string | null
  }
}

export interface GamificationProfile {
  level: UserLevel | null
  streak: UserStreak | null
  badges: UserBadge[]
  rank: number
  recentPoints: PointTransaction[]
}

export interface GamificationStats {
  totalPointsAwarded: number
  totalBadges: number
  totalChallenges: number
  activeChallenges: number
  activeParticipants: number
}

export const gamificationApi = {
  // Leaderboard
  getLeaderboard: (communitySlug: string, page = 1, limit = 20) =>
    request<{ data: LeaderboardEntry[]; total: number; page: number; limit: number; pages: number }>(
      `/communities/${communitySlug}/gamification/leaderboard?page=${page}&limit=${limit}`,
    ),

  // Profile
  getMyProfile: (communitySlug: string) =>
    request<GamificationProfile>(`/communities/${communitySlug}/gamification/profile`),

  getUserProfile: (communitySlug: string, userId: string) =>
    request<GamificationProfile>(`/communities/${communitySlug}/gamification/profile/${userId}`),

  // Points
  getMyPoints: (communitySlug: string, page = 1, limit = 20) =>
    request<{ data: PointTransaction[]; total: number; page: number; limit: number; pages: number }>(
      `/communities/${communitySlug}/gamification/points?page=${page}&limit=${limit}`,
    ),

  // Badges
  getBadges: (communitySlug: string) =>
    request<Badge[]>(`/communities/${communitySlug}/gamification/badges`),

  getMyBadges: (communitySlug: string) =>
    request<UserBadge[]>(`/communities/${communitySlug}/gamification/badges/my`),

  // Challenges
  getChallenges: (communitySlug: string, all = false) =>
    request<Challenge[]>(`/communities/${communitySlug}/gamification/challenges${all ? '?all=true' : ''}`),

  getChallenge: (communitySlug: string, challengeId: string) =>
    request<Challenge>(`/communities/${communitySlug}/gamification/challenges/${challengeId}`),

  joinChallenge: (communitySlug: string, challengeId: string) =>
    request<ChallengeParticipation>(`/communities/${communitySlug}/gamification/challenges/${challengeId}/join`, {
      method: 'POST',
    }),

  leaveChallenge: (communitySlug: string, challengeId: string) =>
    request<void>(`/communities/${communitySlug}/gamification/challenges/${challengeId}/leave`, {
      method: 'DELETE',
    }),

  getMyChallenges: (communitySlug: string) =>
    request<ChallengeParticipation[]>(`/communities/${communitySlug}/gamification/challenges/my`),

  // Streak
  getMyStreak: (communitySlug: string) =>
    request<UserStreak>(`/communities/${communitySlug}/gamification/streak`),

  // Stats
  getStats: (communitySlug: string) =>
    request<GamificationStats>(`/communities/${communitySlug}/gamification/stats`),

  // Admin - Badges
  createBadge: (communitySlug: string, data: Partial<Badge>) =>
    request<Badge>(`/communities/${communitySlug}/gamification/admin/badges`, {
      method: 'POST',
      body: data,
    }),

  updateBadge: (communitySlug: string, badgeId: string, data: Partial<Badge>) =>
    request<Badge>(`/communities/${communitySlug}/gamification/admin/badges/${badgeId}`, {
      method: 'PATCH',
      body: data,
    }),

  deleteBadge: (communitySlug: string, badgeId: string) =>
    request<void>(`/communities/${communitySlug}/gamification/admin/badges/${badgeId}`, {
      method: 'DELETE',
    }),

  awardBadge: (communitySlug: string, badgeId: string, userId: string) =>
    request<UserBadge>(`/communities/${communitySlug}/gamification/admin/badges/${badgeId}/award/${userId}`, {
      method: 'POST',
    }),

  revokeBadge: (communitySlug: string, badgeId: string, userId: string) =>
    request<void>(`/communities/${communitySlug}/gamification/admin/badges/${badgeId}/revoke/${userId}`, {
      method: 'DELETE',
    }),

  // Admin - Points
  grantPoints: (communitySlug: string, userId: string, points: number, description?: string) =>
    request<PointTransaction>(`/communities/${communitySlug}/gamification/admin/points/grant`, {
      method: 'POST',
      body: { userId, points, description },
    }),

  deductPoints: (communitySlug: string, userId: string, points: number, description?: string) =>
    request<PointTransaction>(`/communities/${communitySlug}/gamification/admin/points/deduct`, {
      method: 'POST',
      body: { userId, points, description },
    }),

  // Admin - Challenges
  createChallenge: (communitySlug: string, data: Partial<Challenge>) =>
    request<Challenge>(`/communities/${communitySlug}/gamification/admin/challenges`, {
      method: 'POST',
      body: data,
    }),

  updateChallenge: (communitySlug: string, challengeId: string, data: Partial<Challenge>) =>
    request<Challenge>(`/communities/${communitySlug}/gamification/admin/challenges/${challengeId}`, {
      method: 'PATCH',
      body: data,
    }),

  deleteChallenge: (communitySlug: string, challengeId: string) =>
    request<void>(`/communities/${communitySlug}/gamification/admin/challenges/${challengeId}`, {
      method: 'DELETE',
    }),
}

// ─── Plugins ─────────────────────────────────────────────────

export interface PluginItem {
  id: string
  pluginId: string
  name: string
  description: string | null
  version: string
  category: string
  pricing: string
  price: number | null
  icon: string | null
  coverImage: string | null
  screenshots: string[]
  tags: string[]
  authorName: string
  authorEmail: string | null
  authorUrl: string | null
  authorVerified: boolean
  official: boolean
  hubsoVersion: string | null
  permissions: string[]
  dependencies: string[]
  repository: string | null
  docs: string | null
  changelog: string | null
  downloads: number
  rating: number
  ratingCount: number
  featured: boolean
  createdAt: string
  updatedAt: string
}

export interface InstalledPluginItem {
  id: string
  pluginId: string
  communityId: string
  status: string
  version: string
  installedBy: string | null
  config: Record<string, unknown>
  createdAt: string
  updatedAt: string
  plugin?: PluginItem
  settings?: PluginSettingItem[]
}

export interface PluginSettingItem {
  id: string
  installedPluginId: string
  key: string
  value: unknown
}

export interface MarketplaceStats {
  total: number
  official: number
  free: number
  paid: number
  byCategory: Record<string, number>
}

export interface PaginatedPluginsResponse {
  data: PluginItem[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export const pluginsApi = {
  // ─── Marketplace (public) ────────────────────────────

  listPlugins: (params?: {
    search?: string
    category?: string
    pricing?: string
    official?: boolean
    featured?: boolean
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: string
  }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.set(key, String(value))
        }
      })
    }
    const qs = searchParams.toString()
    return request<PaginatedPluginsResponse>(`/plugins/marketplace${qs ? `?${qs}` : ''}`)
  },

  getPlugin: (pluginId: string) =>
    request<PluginItem>(`/plugins/marketplace/${pluginId}`),

  getMarketplaceStats: () =>
    request<MarketplaceStats>('/plugins/marketplace/stats'),

  // ─── Admin ───────────────────────────────────────────

  registerPlugin: (data: Partial<PluginItem>) =>
    request<PluginItem>('/plugins/admin/register', {
      method: 'POST',
      body: data,
    }),

  updatePlugin: (pluginId: string, data: Partial<PluginItem>) =>
    request<PluginItem>(`/plugins/admin/${pluginId}`, {
      method: 'PATCH',
      body: data,
    }),

  deletePlugin: (pluginId: string) =>
    request<void>(`/plugins/admin/${pluginId}`, {
      method: 'DELETE',
    }),

  seedOfficialPlugins: () =>
    request<{ seeded: number }>('/plugins/admin/seed', {
      method: 'POST',
    }),

  // ─── Community Plugin Management ─────────────────────

  getInstalledPlugins: (communitySlug: string) =>
    request<InstalledPluginItem[]>(`/communities/${communitySlug}/plugins`),

  getInstalledPlugin: (communitySlug: string, pluginId: string) =>
    request<InstalledPluginItem>(`/communities/${communitySlug}/plugins/${pluginId}`),

  installPlugin: (communitySlug: string, pluginId: string) =>
    request<InstalledPluginItem>(`/communities/${communitySlug}/plugins/install`, {
      method: 'POST',
      body: { pluginId },
    }),

  uninstallPlugin: (communitySlug: string, pluginId: string) =>
    request<void>(`/communities/${communitySlug}/plugins/${pluginId}/uninstall`, {
      method: 'DELETE',
    }),

  togglePluginStatus: (communitySlug: string, pluginId: string, status: string) =>
    request<InstalledPluginItem>(`/communities/${communitySlug}/plugins/${pluginId}/status`, {
      method: 'PATCH',
      body: { status },
    }),

  updatePluginConfig: (communitySlug: string, pluginId: string, config: Record<string, unknown>) =>
    request<InstalledPluginItem>(`/communities/${communitySlug}/plugins/${pluginId}/config`, {
      method: 'PATCH',
      body: config,
    }),

  // ─── Plugin Settings ────────────────────────────────

  getPluginSettings: (communitySlug: string, pluginId: string) =>
    request<Record<string, unknown>>(`/communities/${communitySlug}/plugins/${pluginId}/settings`),

  setPluginSetting: (communitySlug: string, pluginId: string, key: string, value: unknown) =>
    request<PluginSettingItem>(`/communities/${communitySlug}/plugins/${pluginId}/settings`, {
      method: 'POST',
      body: { key, value },
    }),

  deletePluginSetting: (communitySlug: string, pluginId: string, key: string) =>
    request<void>(`/communities/${communitySlug}/plugins/${pluginId}/settings/${key}`, {
      method: 'DELETE',
    }),

  // ─── Plugin Hooks ───────────────────────────────────

  getPluginHooks: (communitySlug: string, pluginId: string) =>
    request<unknown[]>(`/communities/${communitySlug}/plugins/${pluginId}/hooks`),

  registerHook: (communitySlug: string, pluginId: string, event: string, config?: Record<string, unknown>) =>
    request<unknown>(`/communities/${communitySlug}/plugins/${pluginId}/hooks`, {
      method: 'POST',
      body: { event, config },
    }),
}

// ─── Video (Bunny Stream) ─────────────────────────────────────

export interface VideoCreateResponse {
  mediaId: string
  videoId: string
  tusEndpoint: string
  tusAuthToken: string
  tusExpirationTime: string
  libraryId: string
}

export interface VideoStatusResponse {
  mediaId: string
  videoId: string
  status: 'PROCESSING' | 'READY' | 'FAILED'
  statusLabel: string
  progress: number
  duration: number | null
  width: number | null
  height: number | null
  thumbnailUrl: string | null
  hlsUrl: string | null
  previewUrl: string | null
  embedUrl: string | null
  resolutions: string | null
  isReady: boolean
  isError: boolean
}

export interface VideoInfoResponse {
  mediaId: string
  videoId: string | null
  status: string
  progress: number | null
  duration: number | null
  thumbnailUrl: string | null
  hlsUrl: string | null
  previewUrl: string | null
  embedUrl: string | null
  cdnUrl: string | null
  isReady: boolean
  createdAt: string
}

export interface VideoListResponse {
  data: VideoInfoResponse[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface VideoHealthResponse {
  configured: boolean
  provider: string
}

export const videoApi = {
  create: (title: string, communityId?: string) =>
    request<VideoCreateResponse>('/video/create', {
      method: 'POST',
      body: { title, communityId },
    }),

  getStatus: (videoId: string) =>
    request<VideoStatusResponse>(`/video/${videoId}/status`),

  getVideo: (videoId: string) =>
    request<VideoInfoResponse>(`/video/${videoId}`),

  deleteVideo: (videoId: string) =>
    request<{ deleted: boolean }>(`/video/${videoId}`, {
      method: 'DELETE',
    }),

  listVideos: (params?: { communityId?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.set(key, String(value))
        }
      })
    }
    const qs = searchParams.toString()
    return request<VideoListResponse>(`/video${qs ? `?${qs}` : ''}`)
  },

  health: () => request<VideoHealthResponse>('/video/health'),
}
