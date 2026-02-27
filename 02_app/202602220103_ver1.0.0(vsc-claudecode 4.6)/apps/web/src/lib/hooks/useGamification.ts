'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  gamificationApi,
  type Badge,
  type Challenge,
} from '@/lib/api'

// ==================== Query Keys ====================

export const gamificationKeys = {
  all: ['gamification'] as const,
  leaderboard: (communitySlug: string) =>
    [...gamificationKeys.all, 'leaderboard', communitySlug] as const,
  profile: (communitySlug: string) =>
    [...gamificationKeys.all, 'profile', communitySlug] as const,
  userProfile: (communitySlug: string, userId: string) =>
    [...gamificationKeys.all, 'profile', communitySlug, userId] as const,
  points: (communitySlug: string) =>
    [...gamificationKeys.all, 'points', communitySlug] as const,
  badges: (communitySlug: string) =>
    [...gamificationKeys.all, 'badges', communitySlug] as const,
  myBadges: (communitySlug: string) =>
    [...gamificationKeys.all, 'myBadges', communitySlug] as const,
  challenges: (communitySlug: string) =>
    [...gamificationKeys.all, 'challenges', communitySlug] as const,
  challenge: (communitySlug: string, challengeId: string) =>
    [...gamificationKeys.all, 'challenge', communitySlug, challengeId] as const,
  myChallenges: (communitySlug: string) =>
    [...gamificationKeys.all, 'myChallenges', communitySlug] as const,
  streak: (communitySlug: string) =>
    [...gamificationKeys.all, 'streak', communitySlug] as const,
  stats: (communitySlug: string) =>
    [...gamificationKeys.all, 'stats', communitySlug] as const,
}

// ==================== Query Hooks ====================

export function useLeaderboard(communitySlug: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: [...gamificationKeys.leaderboard(communitySlug), page, limit],
    queryFn: () => gamificationApi.getLeaderboard(communitySlug, page, limit),
    enabled: !!communitySlug,
  })
}

export function useGamificationProfile(communitySlug: string) {
  return useQuery({
    queryKey: gamificationKeys.profile(communitySlug),
    queryFn: () => gamificationApi.getMyProfile(communitySlug),
    enabled: !!communitySlug,
  })
}

export function useUserGamificationProfile(communitySlug: string, userId: string) {
  return useQuery({
    queryKey: gamificationKeys.userProfile(communitySlug, userId),
    queryFn: () => gamificationApi.getUserProfile(communitySlug, userId),
    enabled: !!communitySlug && !!userId,
  })
}

export function useMyPoints(communitySlug: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: [...gamificationKeys.points(communitySlug), page, limit],
    queryFn: () => gamificationApi.getMyPoints(communitySlug, page, limit),
    enabled: !!communitySlug,
  })
}

export function useBadges(communitySlug: string) {
  return useQuery({
    queryKey: gamificationKeys.badges(communitySlug),
    queryFn: () => gamificationApi.getBadges(communitySlug),
    enabled: !!communitySlug,
  })
}

export function useMyBadges(communitySlug: string) {
  return useQuery({
    queryKey: gamificationKeys.myBadges(communitySlug),
    queryFn: () => gamificationApi.getMyBadges(communitySlug),
    enabled: !!communitySlug,
  })
}

export function useChallenges(communitySlug: string, all = false) {
  return useQuery({
    queryKey: [...gamificationKeys.challenges(communitySlug), all],
    queryFn: () => gamificationApi.getChallenges(communitySlug, all),
    enabled: !!communitySlug,
  })
}

export function useChallenge(communitySlug: string, challengeId: string) {
  return useQuery({
    queryKey: gamificationKeys.challenge(communitySlug, challengeId),
    queryFn: () => gamificationApi.getChallenge(communitySlug, challengeId),
    enabled: !!communitySlug && !!challengeId,
  })
}

export function useMyChallenges(communitySlug: string) {
  return useQuery({
    queryKey: gamificationKeys.myChallenges(communitySlug),
    queryFn: () => gamificationApi.getMyChallenges(communitySlug),
    enabled: !!communitySlug,
  })
}

export function useMyStreak(communitySlug: string) {
  return useQuery({
    queryKey: gamificationKeys.streak(communitySlug),
    queryFn: () => gamificationApi.getMyStreak(communitySlug),
    enabled: !!communitySlug,
  })
}

export function useGamificationStats(communitySlug: string) {
  return useQuery({
    queryKey: gamificationKeys.stats(communitySlug),
    queryFn: () => gamificationApi.getStats(communitySlug),
    enabled: !!communitySlug,
  })
}

// ==================== Mutation Hooks ====================

export function useJoinChallenge(communitySlug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (challengeId: string) =>
      gamificationApi.joinChallenge(communitySlug, challengeId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: gamificationKeys.challenges(communitySlug) })
      qc.invalidateQueries({ queryKey: gamificationKeys.myChallenges(communitySlug) })
      toast.success('Dołączono do wyzwania')
    },
    onError: () => toast.error('Nie udało się dołączyć do wyzwania'),
  })
}

export function useLeaveChallenge(communitySlug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (challengeId: string) =>
      gamificationApi.leaveChallenge(communitySlug, challengeId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: gamificationKeys.challenges(communitySlug) })
      qc.invalidateQueries({ queryKey: gamificationKeys.myChallenges(communitySlug) })
      toast.success('Opuszczono wyzwanie')
    },
    onError: () => toast.error('Nie udało się opuścić wyzwania'),
  })
}

// ==================== Admin Mutation Hooks ====================

export function useCreateBadge(communitySlug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Badge>) =>
      gamificationApi.createBadge(communitySlug, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: gamificationKeys.badges(communitySlug) })
      toast.success('Odznaka utworzona')
    },
    onError: () => toast.error('Nie udało się utworzyć odznaki'),
  })
}

export function useUpdateBadge(communitySlug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ badgeId, data }: { badgeId: string; data: Partial<Badge> }) =>
      gamificationApi.updateBadge(communitySlug, badgeId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: gamificationKeys.badges(communitySlug) })
      toast.success('Odznaka zaktualizowana')
    },
    onError: () => toast.error('Nie udało się zaktualizować odznaki'),
  })
}

export function useDeleteBadge(communitySlug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (badgeId: string) =>
      gamificationApi.deleteBadge(communitySlug, badgeId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: gamificationKeys.badges(communitySlug) })
      toast.success('Odznaka usunięta')
    },
    onError: () => toast.error('Nie udało się usunąć odznaki'),
  })
}

export function useAwardBadge(communitySlug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ badgeId, userId }: { badgeId: string; userId: string }) =>
      gamificationApi.awardBadge(communitySlug, badgeId, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: gamificationKeys.all })
      toast.success('Odznaka przyznana')
    },
    onError: () => toast.error('Nie udało się przyznać odznaki'),
  })
}

export function useGrantPoints(communitySlug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, points, description }: { userId: string; points: number; description?: string }) =>
      gamificationApi.grantPoints(communitySlug, userId, points, description),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: gamificationKeys.all })
      toast.success('Punkty przyznane')
    },
    onError: () => toast.error('Nie udało się przyznać punktów'),
  })
}

export function useDeductPoints(communitySlug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, points, description }: { userId: string; points: number; description?: string }) =>
      gamificationApi.deductPoints(communitySlug, userId, points, description),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: gamificationKeys.all })
      toast.success('Punkty odjete')
    },
    onError: () => toast.error('Nie udało się odjąć punktów'),
  })
}

export function useCreateChallenge(communitySlug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Challenge>) =>
      gamificationApi.createChallenge(communitySlug, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: gamificationKeys.challenges(communitySlug) })
      toast.success('Wyzwanie utworzone')
    },
    onError: () => toast.error('Nie udało się utworzyć wyzwania'),
  })
}

export function useUpdateChallenge(communitySlug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ challengeId, data }: { challengeId: string; data: Partial<Challenge> }) =>
      gamificationApi.updateChallenge(communitySlug, challengeId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: gamificationKeys.challenges(communitySlug) })
      toast.success('Wyzwanie zaktualizowane')
    },
    onError: () => toast.error('Nie udało się zaktualizować wyzwania'),
  })
}

export function useDeleteChallenge(communitySlug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (challengeId: string) =>
      gamificationApi.deleteChallenge(communitySlug, challengeId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: gamificationKeys.challenges(communitySlug) })
      toast.success('Wyzwanie usunięte')
    },
    onError: () => toast.error('Nie udało się usunąć wyzwania'),
  })
}
