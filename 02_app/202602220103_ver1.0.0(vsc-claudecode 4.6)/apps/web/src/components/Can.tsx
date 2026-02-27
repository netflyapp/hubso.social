'use client'

import { type ReactNode } from 'react'
import {
  usePermissions,
  useCommunityPermissions,
  type Actions,
  type Subjects,
} from '@/hooks/usePermissions'

interface CanProps {
  /** The action to check, e.g. 'create', 'update', 'delete', 'manage' */
  action: Actions
  /** The subject to check, e.g. 'Post', 'Community', 'Space' */
  subject: Subjects
  /** Optional community ID for community-scoped checks */
  communityId?: string
  /** Content to render when permission is granted */
  children: ReactNode
  /** Optional fallback to render when permission is denied */
  fallback?: ReactNode
}

/**
 * Declarative permission check component.
 * Renders children only if the current user has the specified ability.
 *
 * @example
 * <Can action="manage" subject="Community" communityId={community.id}>
 *   <button>Edit Community</button>
 * </Can>
 *
 * <Can action="create" subject="Post" fallback={<p>You cannot post here</p>}>
 *   <PostEditor />
 * </Can>
 */
export function Can({ action, subject, communityId, children, fallback = null }: CanProps) {
  const platform = usePermissions()
  const community = useCommunityPermissions(communityId)

  const ability = communityId ? community.ability : platform.ability
  const isLoading = communityId ? community.isLoading : platform.isLoading

  if (isLoading) return null
  if (!ability.can(action, subject)) return <>{fallback}</>

  return <>{children}</>
}
