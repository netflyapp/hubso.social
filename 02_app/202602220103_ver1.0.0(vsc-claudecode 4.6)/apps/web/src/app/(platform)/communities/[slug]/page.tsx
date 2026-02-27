'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Icon } from '@iconify/react'
import { toast } from 'sonner'
import { communitiesApi, postsApi, spacesApi, type CommunityDetailResponse, type CommunityMemberItem, type PostItem, type SpaceItem, type SpaceGroupItem } from '@/lib/api'
import { useAuthStore } from '@/stores/useAuthStore'
import { useCommunityPosts, useCreatePost } from '@/lib/hooks/usePosts'
import { useSpaceGroups, useCreateSpace, useCreateSpaceGroup, useJoinSpace, useLeaveSpace } from '@/lib/hooks/useSpaces'
import { PostCard } from '@/components/feed/PostCard'
import { PostComposer } from '@/components/feed/PostComposer'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('pl-PL', { year: 'numeric', month: 'long', day: 'numeric' })
}

const PLAN_COLOR: Record<string, string> = {
  STARTER: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  GROWTH: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  SCALE: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  ENTERPRISE: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400',
}

const ROLE_BADGE: Record<string, string> = {
  OWNER: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400',
  ADMIN: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
  MODERATOR: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  MEMBER: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  GUEST: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
}

type Tab = 'posts' | 'spaces' | 'members' | 'about'

const SPACE_TYPE_ICON: Record<string, string> = {
  POSTS: 'solar:document-text-linear',
  CHAT: 'solar:chat-round-line-linear',
  EVENTS: 'solar:calendar-linear',
  LINKS: 'solar:link-linear',
  FILES: 'solar:folder-linear',
}

const SPACE_TYPE_LABEL: Record<string, string> = {
  POSTS: 'Posty',
  CHAT: 'Czat',
  EVENTS: 'Wydarzenia',
  LINKS: 'Linki',
  FILES: 'Pliki',
}

const VISIBILITY_ICON: Record<string, string> = {
  PUBLIC: 'solar:globe-linear',
  PRIVATE: 'solar:lock-linear',
  SECRET: 'solar:eye-closed-linear',
}

// ─── Tab: Posts ───────────────────────────────────────────────────────────────

function PostsTab({ slug, isMember }: { slug: string; isMember: boolean }) {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useCommunityPosts(slug)
  const posts = data?.pages.flatMap(p => p.data) ?? []

  return (
    <div className="space-y-4">
      {isMember && <PostComposer fixedCommunitySlug={slug} />}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 p-5 animate-pulse">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-3 w-1/4 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-slate-500 dark:text-slate-400">
          <Icon icon="solar:document-text-linear" width={48} className="mx-auto mb-3 opacity-40" />
          <p className="text-lg font-medium">Brak postów</p>
          <p className="text-sm mt-1">
            {isMember ? 'Napisz pierwszy post w tej społeczności!' : 'Dołącz do społeczności, aby zobaczyć lub tworzyć posty.'}
          </p>
        </div>
      ) : (
        <>
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
          {hasNextPage && (
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="w-full py-3 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
            >
              {isFetchingNextPage ? 'Ładowanie...' : 'Załaduj więcej'}
            </button>
          )}
        </>
      )}
    </div>
  )
}

// ─── Tab: Members ─────────────────────────────────────────────────────────────

function MembersTab({ slug }: { slug: string }) {
  const { data: members, isLoading } = useQuery({
    queryKey: ['communities', slug, 'members'],
    queryFn: () => communitiesApi.getMembers(slug),
  })

  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!members?.length) {
    return (
      <div className="text-center py-16 text-slate-500 dark:text-slate-400">
        <Icon icon="solar:users-group-rounded-linear" width={48} className="mx-auto mb-3 opacity-40" />
        <p>Brak członków</p>
      </div>
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {members.map(member => (
        <Link
          key={member.id}
          href={`/profile/${member.id}`}
          className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors"
        >
          {member.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={member.avatarUrl} alt={member.displayName ?? member.username} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-sm font-semibold text-indigo-600 dark:text-indigo-400">
              {(member.displayName ?? member.username)?.[0]?.toUpperCase() ?? '?'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm text-slate-900 dark:text-white truncate">
                {member.displayName ?? member.username}
              </span>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${ROLE_BADGE[member.role] ?? ROLE_BADGE.MEMBER}`}>
                {member.role}
              </span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">@{member.username}</span>
          </div>
          <div className="text-right text-xs text-slate-400">
            <div>{member.points} pkt</div>
            <div>Lvl {member.level}</div>
          </div>
        </Link>
      ))}
    </div>
  )
}

// ─── Tab: Spaces ──────────────────────────────────────────────────────────────

function SpaceCard({ space }: { space: SpaceItem }) {
  const joinMut = useJoinSpace()
  const leaveMut = useLeaveSpace()

  return (
    <Link
      href={`/spaces/${space.id}`}
      className="block bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 p-4 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
          <Icon icon={SPACE_TYPE_ICON[space.type] || 'solar:document-text-linear'} width={20} className="text-indigo-500 dark:text-indigo-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-sm text-slate-900 dark:text-white truncate">{space.name}</h4>
            {space.visibility !== 'PUBLIC' && (
              <Icon icon={VISIBILITY_ICON[space.visibility] || 'solar:globe-linear'} width={14} className="text-slate-400 flex-shrink-0" />
            )}
          </div>
          {space.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{space.description}</p>
          )}
          <div className="flex items-center gap-3 mt-2 text-xs text-slate-400 dark:text-slate-500">
            <span className="flex items-center gap-1">
              <Icon icon="solar:users-group-rounded-linear" width={12} />
              {space.memberCount}
            </span>
            <span className="flex items-center gap-1">
              <Icon icon={SPACE_TYPE_ICON[space.type] || 'solar:document-text-linear'} width={12} />
              {SPACE_TYPE_LABEL[space.type]}
            </span>
            {space.type === 'POSTS' && (
              <span className="flex items-center gap-1">
                <Icon icon="solar:document-text-linear" width={12} />
                {space.postCount} postów
              </span>
            )}
          </div>
        </div>
        <div className="flex-shrink-0" onClick={(e) => e.preventDefault()}>
          {space.isJoined ? (
            <button
              onClick={() => leaveMut.mutate(space.id)}
              disabled={leaveMut.isPending}
              className="px-3 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-md hover:border-red-300 hover:text-red-500 dark:hover:border-red-800 dark:hover:text-red-400 transition-colors"
            >
              Opuść
            </button>
          ) : (
            <button
              onClick={() => joinMut.mutate(space.id)}
              disabled={joinMut.isPending}
              className="px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
            >
              Dołącz
            </button>
          )}
        </div>
      </div>
    </Link>
  )
}

function SpacesTab({ slug, isAdmin }: { slug: string; isAdmin: boolean }) {
  const { data: spaceGroupsData, isLoading } = useSpaceGroups(slug)
  const createSpaceMut = useCreateSpace(slug)
  const createGroupMut = useCreateSpaceGroup(slug)
  const [showCreateSpace, setShowCreateSpace] = useState(false)
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())

  // Create space form
  const [newSpaceName, setNewSpaceName] = useState('')
  const [newSpaceDesc, setNewSpaceDesc] = useState('')
  const [newSpaceType, setNewSpaceType] = useState<'POSTS' | 'CHAT' | 'EVENTS' | 'LINKS' | 'FILES'>('POSTS')
  const [newSpaceVisibility, setNewSpaceVisibility] = useState<'PUBLIC' | 'PRIVATE' | 'SECRET'>('PUBLIC')
  const [newSpaceGroupId, setNewSpaceGroupId] = useState<string>('')
  const [newGroupName, setNewGroupName] = useState('')

  const toggleGroup = (id: string) =>
    setCollapsedGroups(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const handleCreateSpace = () => {
    if (!newSpaceName.trim()) return
    createSpaceMut.mutate(
      {
        name: newSpaceName.trim(),
        description: newSpaceDesc.trim() || undefined,
        type: newSpaceType,
        visibility: newSpaceVisibility,
        spaceGroupId: newSpaceGroupId || undefined,
      },
      {
        onSuccess: () => {
          setShowCreateSpace(false)
          setNewSpaceName('')
          setNewSpaceDesc('')
          setNewSpaceType('POSTS')
          setNewSpaceVisibility('PUBLIC')
          setNewSpaceGroupId('')
          toast.success('Przestrzeń została utworzona!')
        },
        onError: () => toast.error('Nie udało się utworzyć przestrzeni'),
      },
    )
  }

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return
    createGroupMut.mutate(
      { name: newGroupName.trim() },
      {
        onSuccess: () => {
          setShowCreateGroup(false)
          setNewGroupName('')
          toast.success('Grupa przestrzeni została utworzona!')
        },
        onError: () => toast.error('Nie udało się utworzyć grupy'),
      },
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map(i => (
          <div key={i} className="animate-pulse">
            <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-3" />
            <div className="space-y-2">
              {[1, 2].map(j => (
                <div key={j} className="h-20 bg-slate-200 dark:bg-slate-700 rounded-xl" />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const groups = spaceGroupsData?.groups ?? []
  const ungrouped = spaceGroupsData?.ungroupedSpaces ?? []

  return (
    <div className="space-y-6">
      {/* Admin actions */}
      {isAdmin && (
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreateSpace(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Icon icon="solar:add-circle-linear" width={16} />
            Utwórz przestrzeń
          </button>
          <button
            onClick={() => setShowCreateGroup(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Icon icon="solar:folder-add-linear" width={16} />
            Utwórz grupę
          </button>
        </div>
      )}

      {/* Create Space Dialog */}
      {showCreateSpace && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-indigo-800 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Nowa przestrzeń</h3>

          <input
            value={newSpaceName}
            onChange={e => setNewSpaceName(e.target.value)}
            placeholder="Nazwa przestrzeni"
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <textarea
            value={newSpaceDesc}
            onChange={e => setNewSpaceDesc(e.target.value)}
            placeholder="Opis (opcjonalnie)"
            rows={2}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Typ</label>
              <select
                value={newSpaceType}
                onChange={e => setNewSpaceType(e.target.value as typeof newSpaceType)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="POSTS">Posty</option>
                <option value="CHAT">Czat</option>
                <option value="EVENTS">Wydarzenia</option>
                <option value="LINKS">Linki</option>
                <option value="FILES">Pliki</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Widoczność</label>
              <select
                value={newSpaceVisibility}
                onChange={e => setNewSpaceVisibility(e.target.value as typeof newSpaceVisibility)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="PUBLIC">Publiczny</option>
                <option value="PRIVATE">Prywatny</option>
                <option value="SECRET">Sekretny</option>
              </select>
            </div>
          </div>

          {groups.length > 0 && (
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Grupa (opcjonalnie)</label>
              <select
                value={newSpaceGroupId}
                onChange={e => setNewSpaceGroupId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Bez grupy</option>
                {groups.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowCreateSpace(false)}
              className="px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              Anuluj
            </button>
            <button
              onClick={handleCreateSpace}
              disabled={!newSpaceName.trim() || createSpaceMut.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {createSpaceMut.isPending ? 'Tworzenie...' : 'Utwórz'}
            </button>
          </div>
        </div>
      )}

      {/* Create Group Dialog */}
      {showCreateGroup && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-indigo-800 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Nowa grupa przestrzeni</h3>
          <input
            value={newGroupName}
            onChange={e => setNewGroupName(e.target.value)}
            placeholder="Nazwa grupy"
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowCreateGroup(false)}
              className="px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              Anuluj
            </button>
            <button
              onClick={handleCreateGroup}
              disabled={!newGroupName.trim() || createGroupMut.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {createGroupMut.isPending ? 'Tworzenie...' : 'Utwórz'}
            </button>
          </div>
        </div>
      )}

      {/* Space Groups */}
      {groups.map(group => (
        <div key={group.id}>
          <button
            onClick={() => toggleGroup(group.id)}
            className="flex items-center gap-2 mb-2 w-full text-left"
          >
            <Icon
              icon="solar:alt-arrow-down-linear"
              width={14}
              className={`text-slate-400 transition-transform ${collapsedGroups.has(group.id) ? '-rotate-90' : ''}`}
            />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {group.name}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">({group.spaces.length})</span>
          </button>
          {!collapsedGroups.has(group.id) && (
            <div className="space-y-2 ml-5">
              {group.spaces.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-slate-500 py-2">Brak przestrzeni w tej grupie</p>
              ) : (
                group.spaces.map(space => <SpaceCard key={space.id} space={space} />)
              )}
            </div>
          )}
        </div>
      ))}

      {/* Ungrouped Spaces */}
      {ungrouped.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Icon icon="solar:widget-linear" width={14} className="text-slate-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Bez grupy
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">({ungrouped.length})</span>
          </div>
          <div className="space-y-2 ml-5">
            {ungrouped.map(space => <SpaceCard key={space.id} space={space} />)}
          </div>
        </div>
      )}

      {/* Empty state */}
      {groups.length === 0 && ungrouped.length === 0 && (
        <div className="text-center py-16 text-slate-500 dark:text-slate-400">
          <Icon icon="solar:widget-linear" width={48} className="mx-auto mb-3 opacity-40" />
          <p className="text-lg font-medium">Brak przestrzeni</p>
          <p className="text-sm mt-1">
            {isAdmin ? 'Utwórz pierwszą przestrzeń dla tej społeczności.' : 'W tej społeczności nie ma jeszcze przestrzeni.'}
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Tab: About ───────────────────────────────────────────────────────────────

function AboutTab({ community }: { community: CommunityDetailResponse }) {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 p-6">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">O społeczności</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          {community.description || 'Brak opisu.'}
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 p-6">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Szczegóły</h3>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500 dark:text-slate-400">Założyciel</dt>
            <dd>
              <Link href={`/profile/${community.owner.id}`} className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                {community.owner.displayName ?? community.owner.username}
              </Link>
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500 dark:text-slate-400">Plan</dt>
            <dd><span className={`text-xs font-semibold px-2 py-0.5 rounded ${PLAN_COLOR[community.plan] ?? PLAN_COLOR.STARTER}`}>{community.plan}</span></dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500 dark:text-slate-400">Członkowie</dt>
            <dd className="font-medium text-slate-900 dark:text-white">{community.memberCount}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500 dark:text-slate-400">Utworzono</dt>
            <dd className="text-slate-700 dark:text-slate-300">{formatDate(community.createdAt)}</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CommunityDetailPage() {
  const params = useParams<{ slug: string }>()
  const slug = params?.slug ?? ''
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<Tab>('posts')

  const { data: community, isLoading, error } = useQuery({
    queryKey: ['communities', slug],
    queryFn: () => communitiesApi.get(slug),
    enabled: !!slug,
  })

  const joinMutation = useMutation({
    mutationFn: () => communitiesApi.join(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communities', slug] })
      queryClient.invalidateQueries({ queryKey: ['communities'] })
      toast.success('Dołączono do społeczności!')
    },
    onError: () => toast.error('Nie udało się dołączyć'),
  })

  const leaveMutation = useMutation({
    mutationFn: () => communitiesApi.leave(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communities', slug] })
      queryClient.invalidateQueries({ queryKey: ['communities'] })
      toast.success('Opuszczono społeczność')
    },
    onError: () => toast.error('Nie udało się opuścić'),
  })

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-6 animate-pulse">
        <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-4 w-96 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>
    )
  }

  if (error || !community) {
    return (
      <div className="max-w-4xl mx-auto p-4 text-center py-20">
        <Icon icon="solar:danger-triangle-linear" width={48} className="mx-auto mb-4 text-red-400" />
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Nie znaleziono społeczności</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Społeczność &quot;{slug}&quot; nie istnieje lub została usunięta.
        </p>
        <Link href="/communities" className="inline-block mt-4 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors">
          Wróć do listy
        </Link>
      </div>
    )
  }

  const isMember = !!community.isJoined
  const isOwner = community.owner.id === user?.id
  const isAdmin = community.memberRole === 'ADMIN' || community.memberRole === 'OWNER'

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'posts', label: 'Posty', icon: 'solar:document-text-linear' },
    { key: 'spaces', label: 'Przestrzenie', icon: 'solar:widget-linear' },
    { key: 'members', label: 'Członkowie', icon: 'solar:users-group-rounded-linear' },
    { key: 'about', label: 'O nas', icon: 'solar:info-circle-linear' },
  ]

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* ── Cover + Header ──────────────────────────── */}
      <div className="relative rounded-xl overflow-hidden">
        <div className="h-40 md:h-52 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
          {community.coverUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={community.coverUrl} alt="" className="w-full h-full object-cover" />
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-6 pb-5 pt-12">
          <div className="flex items-end gap-4">
            {/* Logo */}
            <div className="w-16 h-16 rounded-xl bg-white dark:bg-slate-900 border-2 border-white shadow-lg flex items-center justify-center overflow-hidden flex-shrink-0">
              {community.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={community.logoUrl} alt={community.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-bold text-indigo-600">{getInitials(community.name)}</span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-white truncate">{community.name}</h1>
              <div className="flex items-center gap-3 mt-1 text-sm text-white/80">
                <span className="flex items-center gap-1">
                  <Icon icon="solar:users-group-rounded-bold" width={14} />
                  {community.memberCount} członków
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${PLAN_COLOR[community.plan] ?? PLAN_COLOR.STARTER}`}>
                  {community.plan}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 flex-shrink-0">
              {isAdmin && (
                <Link
                  href={`/communities/${slug}/settings`}
                  className="p-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
                  title="Ustawienia"
                >
                  <Icon icon="solar:settings-linear" width={18} />
                </Link>
              )}
              {!isMember ? (
                <button
                  onClick={() => joinMutation.mutate()}
                  disabled={joinMutation.isPending}
                  className="px-4 py-2 bg-white text-indigo-600 text-sm font-semibold rounded-lg hover:bg-indigo-50 transition-colors disabled:opacity-50"
                >
                  {joinMutation.isPending ? 'Dołączanie...' : 'Dołącz'}
                </button>
              ) : isOwner ? (
                <span className="px-3 py-2 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-lg">
                  Właściciel
                </span>
              ) : (
                <button
                  onClick={() => leaveMutation.mutate()}
                  disabled={leaveMutation.isPending}
                  className="px-4 py-2 bg-white/20 text-white text-sm font-medium rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50"
                >
                  {leaveMutation.isPending ? 'Opuszczanie...' : 'Opuść'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Tab bar ─────────────────────────────────── */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800/50 rounded-lg p-1">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md transition-colors flex-1 justify-center ${
              tab === t.key
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Icon icon={t.icon} width={16} />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab content ─────────────────────────────── */}
      {tab === 'posts' && <PostsTab slug={slug} isMember={isMember} />}
      {tab === 'spaces' && <SpacesTab slug={slug} isAdmin={isAdmin} />}
      {tab === 'members' && <MembersTab slug={slug} />}
      {tab === 'about' && <AboutTab community={community} />}
    </div>
  )
}
