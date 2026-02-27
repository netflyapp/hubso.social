import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { postsApi, reactionsApi, type PostItem, type ReactionType } from '@/lib/api'

// ─── Single post ──────────────────────────────────────────────────────────────

export function usePost(postId: string) {
  return useQuery({
    queryKey: ['posts', postId],
    queryFn: () => postsApi.get(postId),
    staleTime: 1000 * 60 * 2,
    enabled: !!postId,
  })
}

// ─── Feed (paginated) ─────────────────────────────────────────────────────────

export function useFeed(limit = 20) {
  return useInfiniteQuery({
    queryKey: ['posts', 'feed'],
    queryFn: ({ pageParam = 1 }) => postsApi.feed(pageParam, limit),
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.pages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    staleTime: 1000 * 60 * 1,
  })
}

// ─── Community posts ──────────────────────────────────────────────────────────

export function useCommunityPosts(slug: string, limit = 20) {
  return useInfiniteQuery({
    queryKey: ['posts', 'community', slug],
    queryFn: ({ pageParam = 1 }) => postsApi.byCommunity(slug, pageParam, limit),
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.pages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    staleTime: 1000 * 60 * 1,
    enabled: !!slug,
  })
}

// ─── Space posts ──────────────────────────────────────────────────────────────

export function useSpacePosts(spaceId: string, limit = 20) {
  return useInfiniteQuery({
    queryKey: ['posts', 'space', spaceId],
    queryFn: ({ pageParam = 1 }) => postsApi.bySpace(spaceId, pageParam, limit),
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.pages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    staleTime: 1000 * 60 * 1,
    enabled: !!spaceId,
  })
}

// ─── Legacy wrapper — flat list ───────────────────────────────────────────────

export function usePosts(limit = 20) {
  const query = useFeed(limit)
  const posts: PostItem[] = query.data?.pages.flatMap((p) => p.data) ?? []
  return { ...query, data: posts }
}

// ─── Create post ──────────────────────────────────────────────────────────────

export function useCreatePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { communitySlug: string; content: unknown; type?: string }) =>
      postsApi.create(data.communitySlug, { content: data.content, type: data.type }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}

// ─── Delete post ──────────────────────────────────────────────────────────────

export function useDeletePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (postId: string) => postsApi.remove(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}

// ─── Toggle reaction ──────────────────────────────────────────────────────────

export function useToggleReaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { targetType: 'Post' | 'Comment'; targetId: string; type: ReactionType }) =>
      reactionsApi.toggle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}
