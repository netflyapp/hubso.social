'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  videoApi,
  type VideoCreateResponse,
  type VideoStatusResponse,
  type VideoInfoResponse,
  type VideoListResponse,
  type VideoHealthResponse,
} from '@/lib/api'

// ==================== Query Keys ====================

export const videoKeys = {
  all: ['video'] as const,
  list: (params?: Record<string, unknown>) =>
    [...videoKeys.all, 'list', params ?? {}] as const,
  detail: (videoId: string) =>
    [...videoKeys.all, 'detail', videoId] as const,
  status: (videoId: string) =>
    [...videoKeys.all, 'status', videoId] as const,
  health: () => [...videoKeys.all, 'health'] as const,
}

// ==================== Queries ====================

/**
 * Get video info from local DB (no external call).
 */
export function useVideo(videoId: string) {
  return useQuery<VideoInfoResponse>({
    queryKey: videoKeys.detail(videoId),
    queryFn: () => videoApi.getVideo(videoId),
    enabled: !!videoId,
  })
}

/**
 * Poll video processing status from Bunny Stream.
 * Refetches every 3s while still processing.
 */
export function useVideoStatus(videoId: string, enabled = true) {
  return useQuery<VideoStatusResponse>({
    queryKey: videoKeys.status(videoId),
    queryFn: () => videoApi.getStatus(videoId),
    enabled: !!videoId && enabled,
    refetchInterval: (query) => {
      const data = query.state.data
      if (!data) return 3000
      if (data.isReady || data.isError) return false
      return 3000 // poll every 3s while processing
    },
  })
}

/**
 * List videos with pagination and optional community filter.
 */
export function useVideoList(params?: {
  communityId?: string
  page?: number
  limit?: number
}) {
  return useQuery<VideoListResponse>({
    queryKey: videoKeys.list(params as Record<string, unknown>),
    queryFn: () => videoApi.listVideos(params),
  })
}

/**
 * Check Bunny Stream integration health.
 */
export function useVideoHealth() {
  return useQuery<VideoHealthResponse>({
    queryKey: videoKeys.health(),
    queryFn: () => videoApi.health(),
    staleTime: 60_000,
  })
}

// ==================== Mutations ====================

/**
 * Create a new video placeholder and get TUS upload credentials.
 */
export function useCreateVideo() {
  const queryClient = useQueryClient()

  return useMutation<
    VideoCreateResponse,
    Error,
    { title: string; communityId?: string }
  >({
    mutationFn: ({ title, communityId }) =>
      videoApi.create(title, communityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: videoKeys.all })
    },
    onError: () => toast.error('Nie udało się utworzyć wideo'),
  })
}

/**
 * Delete a video from Bunny and DB.
 */
export function useDeleteVideo() {
  const queryClient = useQueryClient()

  return useMutation<{ deleted: boolean }, Error, string>({
    mutationFn: (videoId) => videoApi.deleteVideo(videoId),
    onSuccess: (_, videoId) => {
      queryClient.invalidateQueries({ queryKey: videoKeys.all })
      queryClient.removeQueries({ queryKey: videoKeys.detail(videoId) })
      queryClient.removeQueries({ queryKey: videoKeys.status(videoId) })
      toast.success('Wideo usunięte')
    },
    onError: () => toast.error('Nie udało się usunąć wideo'),
  })
}
