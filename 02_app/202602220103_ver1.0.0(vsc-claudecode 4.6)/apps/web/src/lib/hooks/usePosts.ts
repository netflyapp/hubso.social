import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { mockPosts } from "@/lib/mock-data/posts"

export function usePost(postId: string) {
  return useQuery({
    queryKey: ["posts", postId],
    queryFn: async () => mockPosts.find((p) => p.id === postId) || mockPosts[0],
    staleTime: 1000 * 60 * 5,
  })
}

export function usePosts(limit = 20) {
  return useQuery({
    queryKey: ["posts", { limit }],
    queryFn: async () => mockPosts.slice(0, limit),
    staleTime: 1000 * 60 * 2,
  })
}

export function useCreatePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { content: string; spaceId?: string }) => ({ id: Date.now().toString(), ...data }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["posts"] }) },
  })
}

export function useLikePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (postId: string) => ({ postId, liked: true }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["posts"] }) },
  })
}

export function useDeletePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (postId: string) => ({ postId }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["posts"] }) },
  })
}
