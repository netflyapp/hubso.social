'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  spacesApi,
  SpaceItem,
  SpaceGroupItem,
  SpaceGroupsResponse,
} from '@/lib/api'

// ── Queries ─────────────────────────────────────────

export function useSpaceGroups(communitySlug: string) {
  return useQuery<SpaceGroupsResponse>({
    queryKey: ['space-groups', communitySlug],
    queryFn: () => spacesApi.getGroups(communitySlug),
    enabled: !!communitySlug,
  })
}

export function useSpaces(communitySlug: string) {
  return useQuery<SpaceItem[]>({
    queryKey: ['spaces', communitySlug],
    queryFn: () => spacesApi.list(communitySlug),
    enabled: !!communitySlug,
  })
}

export function useSpace(spaceId: string) {
  return useQuery<SpaceItem>({
    queryKey: ['space', spaceId],
    queryFn: () => spacesApi.get(spaceId),
    enabled: !!spaceId,
  })
}

export function useSpaceMembers(spaceId: string) {
  return useQuery({
    queryKey: ['space-members', spaceId],
    queryFn: () => spacesApi.getMembers(spaceId),
    enabled: !!spaceId,
  })
}

// ── Mutations ───────────────────────────────────────

export function useCreateSpace(communitySlug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      name: string
      description?: string
      type: 'POSTS' | 'CHAT' | 'EVENTS' | 'LINKS' | 'FILES'
      visibility?: 'PUBLIC' | 'PRIVATE' | 'SECRET'
      spaceGroupId?: string
    }) => spacesApi.create(communitySlug, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['spaces', communitySlug] })
      qc.invalidateQueries({ queryKey: ['space-groups', communitySlug] })
      toast.success('Przestrzeń została utworzona')
    },
    onError: () => toast.error('Nie udało się utworzyć przestrzeni'),
  })
}

export function useUpdateSpace() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      spaceId,
      data,
    }: {
      spaceId: string
      data: {
        name?: string
        description?: string
        visibility?: 'PUBLIC' | 'PRIVATE' | 'SECRET'
        spaceGroupId?: string | null
        paywallEnabled?: boolean
      }
    }) => spacesApi.update(spaceId, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['space', vars.spaceId] })
      qc.invalidateQueries({ queryKey: ['spaces'] })
      qc.invalidateQueries({ queryKey: ['space-groups'] })
      toast.success('Przestrzeń zaktualizowana')
    },
    onError: () => toast.error('Nie udało się zaktualizować przestrzeni'),
  })
}

export function useDeleteSpace() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (spaceId: string) => spacesApi.remove(spaceId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['spaces'] })
      qc.invalidateQueries({ queryKey: ['space-groups'] })
      toast.success('Przestrzeń została usunięta')
    },
    onError: () => toast.error('Nie udało się usunąć przestrzeni'),
  })
}

export function useJoinSpace() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (spaceId: string) => spacesApi.join(spaceId),
    onSuccess: (_, spaceId) => {
      qc.invalidateQueries({ queryKey: ['space', spaceId] })
      qc.invalidateQueries({ queryKey: ['spaces'] })
      qc.invalidateQueries({ queryKey: ['space-groups'] })
      toast.success('Dołączono do przestrzeni')
    },
    onError: () => toast.error('Nie udało się dołączyć do przestrzeni'),
  })
}

export function useLeaveSpace() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (spaceId: string) => spacesApi.leave(spaceId),
    onSuccess: (_, spaceId) => {
      qc.invalidateQueries({ queryKey: ['space', spaceId] })
      qc.invalidateQueries({ queryKey: ['spaces'] })
      qc.invalidateQueries({ queryKey: ['space-groups'] })
      toast.success('Opuszczono przestrzeń')
    },
    onError: () => toast.error('Nie udało się opuścić przestrzeni'),
  })
}

// ── Space Group Mutations ───────────────────────────

export function useCreateSpaceGroup(communitySlug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; position?: number; collapsedDefault?: boolean }) =>
      spacesApi.createGroup(communitySlug, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['space-groups', communitySlug] })
      toast.success('Grupa przestrzeni utworzona')
    },
    onError: () => toast.error('Nie udało się utworzyć grupy'),
  })
}

export function useUpdateSpaceGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      groupId,
      data,
    }: {
      groupId: string
      data: { name?: string; position?: number; collapsedDefault?: boolean }
    }) => spacesApi.updateGroup(groupId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['space-groups'] })
      toast.success('Grupa zaktualizowana')
    },
    onError: () => toast.error('Nie udało się zaktualizować grupy'),
  })
}

export function useDeleteSpaceGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (groupId: string) => spacesApi.deleteGroup(groupId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['space-groups'] })
      toast.success('Grupa usunięta')
    },
    onError: () => toast.error('Nie udało się usunąć grupy'),
  })
}
