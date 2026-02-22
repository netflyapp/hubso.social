import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { mockMembers } from "@/lib/mock-data/members"

export function useMember(memberId: string) {
  return useQuery({
    queryKey: ["members", memberId],
    queryFn: async () => mockMembers.find((m) => m.id === memberId) || mockMembers[0],
    staleTime: 1000 * 60 * 5,
  })
}

export function useMembers(limit = 20, leaderboard = false) {
  return useQuery({
    queryKey: ["members", { limit, leaderboard }],
    queryFn: async () => {
      const sorted = leaderboard
        ? [...mockMembers].sort((a, b) => (b.points || 0) - (a.points || 0))
        : mockMembers
      return sorted.slice(0, limit)
    },
    staleTime: 1000 * 60 * 10,
  })
}

export function useFollowMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (memberId: string) => ({ memberId, following: true }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["members"] }) },
  })
}

export function useUnfollowMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (memberId: string) => ({ memberId, following: false }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["members"] }) },
  })
}
