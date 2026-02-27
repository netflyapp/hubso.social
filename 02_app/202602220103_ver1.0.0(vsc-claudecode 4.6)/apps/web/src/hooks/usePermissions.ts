'use client'

import { useQuery } from '@tanstack/react-query'
import { createMongoAbility, type MongoAbility } from '@casl/ability'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/stores/useAuthStore'

// Mirror the backend types for type-safe permission checks
export type Actions =
  | 'manage'
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'join'
  | 'leave'
  | 'moderate'
  | 'ban'
  | 'pin'
  | 'invite'

export type Subjects =
  | 'User'
  | 'Post'
  | 'Comment'
  | 'Community'
  | 'CommunityMember'
  | 'Space'
  | 'SpaceMember'
  | 'Group'
  | 'GroupMember'
  | 'Event'
  | 'EventAttendee'
  | 'Notification'
  | 'Message'
  | 'Conversation'
  | 'File'
  | 'Reaction'
  | 'Follow'
  | 'SearchHistory'
  | 'Calendar'
  | 'CalendarEvent'
  | 'all'

export type AppAbility = MongoAbility<[Actions, Subjects]>

/** Empty ability — no permissions */
const emptyAbility = createMongoAbility<[Actions, Subjects]>()

/**
 * Fetch platform-level permissions for the current user.
 * Returns a CASL Ability instance that can be used for `ability.can(action, subject)`.
 */
export function usePermissions() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  const query = useQuery({
    queryKey: ['auth', 'permissions'],
    queryFn: async () => {
      const { rules } = await authApi.permissions()
      return createMongoAbility<[Actions, Subjects]>(rules as any)
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 min
    gcTime: 1000 * 60 * 10,
  })

  return {
    ability: query.data ?? emptyAbility,
    isLoading: query.isLoading,
    refetch: query.refetch,
  }
}

/**
 * Fetch community-scoped permissions for the current user.
 * Returns abilities that include both platform + community membership rules.
 */
export function useCommunityPermissions(communityId: string | undefined) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  const query = useQuery({
    queryKey: ['auth', 'permissions', communityId],
    queryFn: async () => {
      const { rules } = await authApi.permissions(communityId!)
      return createMongoAbility<[Actions, Subjects]>(rules as any)
    },
    enabled: isAuthenticated && !!communityId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  })

  return {
    ability: query.data ?? emptyAbility,
    isLoading: query.isLoading,
    refetch: query.refetch,
  }
}
