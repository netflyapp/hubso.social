'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQueryClient } from '@tanstack/react-query'
import { Icon } from '@iconify/react'
import { toast } from 'sonner'
import { postsApi, type SpaceItem } from '@/lib/api'
import { useAuthStore } from '@/stores/useAuthStore'
import { useSpace, useSpaceMembers, useJoinSpace, useLeaveSpace } from '@/lib/hooks/useSpaces'
import { useSpacePosts } from '@/lib/hooks/usePosts'
import { PostCard } from '@/components/feed/PostCard'
import { TiptapEditor } from '@/components/editor/TiptapEditor'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_ICON: Record<string, string> = {
  POSTS: 'solar:document-text-linear',
  CHAT: 'solar:chat-round-line-linear',
  EVENTS: 'solar:calendar-linear',
  LINKS: 'solar:link-linear',
  FILES: 'solar:folder-linear',
}

const TYPE_LABEL: Record<string, string> = {
  POSTS: 'Posty',
  CHAT: 'Czat',
  EVENTS: 'Wydarzenia',
  LINKS: 'Linki',
  FILES: 'Pliki',
}

const VISIBILITY_LABEL: Record<string, string> = {
  PUBLIC: 'Publiczny',
  PRIVATE: 'Prywatny',
  SECRET: 'Sekretny',
}

const ROLE_BADGE: Record<string, string> = {
  OWNER: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400',
  ADMIN: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
  MODERATOR: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  MEMBER: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
}

// ─── Space Post Composer ──────────────────────────────────────────────────────

function SpacePostComposer({ spaceId }: { spaceId: string }) {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [content, setContent] = useState<Record<string, unknown> | undefined>(undefined)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!content || isSubmitting) return
    setIsSubmitting(true)
    try {
      await postsApi.createInSpace(spaceId, { content, type: 'TEXT' })
      setContent(undefined)
      queryClient.invalidateQueries({ queryKey: ['posts', 'space', spaceId] })
      toast.success('Post opublikowany!')
    } catch {
      toast.error('Nie udało się opublikować postu')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) return null

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 p-4">
      <div className="flex gap-3">
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatarUrl} alt={user.displayName ?? user.username} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-sm font-semibold text-indigo-600 dark:text-indigo-400 flex-shrink-0">
            {(user.displayName ?? user.username)?.[0]?.toUpperCase() ?? '?'}
          </div>
        )}
        <div className="flex-1">
          <TiptapEditor
            content={content}
            onChange={(val) => setContent(val)}
            placeholder="Napisz coś w tej przestrzeni..."
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !content}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Publikowanie...' : 'Opublikuj'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Posts View ────────────────────────────────────────────────────────────────

function PostsView({ spaceId, isMember }: { spaceId: string; isMember: boolean }) {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useSpacePosts(spaceId)
  const posts = data?.pages.flatMap(p => p.data) ?? []

  return (
    <div className="space-y-4">
      {isMember && <SpacePostComposer spaceId={spaceId} />}

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
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-slate-500 dark:text-slate-400">
          <Icon icon="solar:document-text-linear" width={48} className="mx-auto mb-3 opacity-40" />
          <p className="text-lg font-medium">Brak postów</p>
          <p className="text-sm mt-1">
            {isMember ? 'Napisz pierwszy post w tej przestrzeni!' : 'Dołącz, aby tworzyć posty.'}
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

// ─── Placeholder views ────────────────────────────────────────────────────────

function PlaceholderView({ type }: { type: string }) {
  const icons: Record<string, string> = {
    CHAT: 'solar:chat-round-line-linear',
    EVENTS: 'solar:calendar-linear',
    LINKS: 'solar:link-linear',
    FILES: 'solar:folder-linear',
  }
  const labels: Record<string, string> = {
    CHAT: 'Czat',
    EVENTS: 'Wydarzenia',
    LINKS: 'Linki',
    FILES: 'Pliki',
  }

  return (
    <div className="text-center py-20 text-slate-500 dark:text-slate-400">
      <Icon icon={icons[type] || 'solar:widget-linear'} width={56} className="mx-auto mb-4 opacity-40" />
      <p className="text-lg font-medium">{labels[type] ?? type}</p>
      <p className="text-sm mt-1">Ta funkcja będzie dostępna wkrótce.</p>
    </div>
  )
}

// ─── Members Sidebar ──────────────────────────────────────────────────────────

function MembersSidebar({ spaceId }: { spaceId: string }) {
  const { data: members, isLoading } = useSpaceMembers(spaceId)

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-2 animate-pulse">
            <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700" />
            <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (!members?.length) return null

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
        Członkowie ({members.length})
      </h3>
      <div className="space-y-2">
        {members.slice(0, 20).map((member: any) => (
          <Link
            key={member.id}
            href={`/profile/${member.user?.id ?? member.userId}`}
            className="flex items-center gap-2 py-1 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded px-1 -mx-1 transition-colors"
          >
            {member.user?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={member.user.avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                {(member.user?.displayName ?? member.user?.username)?.[0]?.toUpperCase() ?? '?'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <span className="text-xs font-medium text-slate-900 dark:text-white truncate block">
                {member.user?.displayName ?? member.user?.username ?? 'Użytkownik'}
              </span>
            </div>
            <span className={`text-[9px] font-semibold px-1 py-0.5 rounded ${ROLE_BADGE[member.role] ?? ROLE_BADGE.MEMBER}`}>
              {member.role}
            </span>
          </Link>
        ))}
        {members.length > 20 && (
          <p className="text-xs text-slate-400 text-center pt-1">
            +{members.length - 20} więcej
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SpaceDetailPage() {
  const params = useParams<{ id: string }>()
  const spaceId = params?.id ?? ''
  const router = useRouter()
  const { user } = useAuthStore()
  const joinMut = useJoinSpace()
  const leaveMut = useLeaveSpace()

  const { data: space, isLoading, error } = useSpace(spaceId)

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto p-4 space-y-6 animate-pulse">
        <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>
    )
  }

  if (error || !space) {
    return (
      <div className="max-w-4xl mx-auto p-4 text-center py-20">
        <Icon icon="solar:danger-triangle-linear" width={48} className="mx-auto mb-4 text-red-400" />
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Nie znaleziono przestrzeni</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Ta przestrzeń nie istnieje lub została usunięta.
        </p>
        <button onClick={() => router.back()} className="inline-block mt-4 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors">
          Wróć
        </button>
      </div>
    )
  }

  const isMember = space.isJoined
  const isOwner = space.memberRole === 'OWNER'

  return (
    <div className="max-w-5xl mx-auto p-4">
      {/* ── Header ────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 p-5 mb-6">
        <div className="flex items-start gap-4">
          {/* Back + Icon */}
          <div className="flex items-center gap-3">
            {space.community && (
              <Link
                href={`/communities/${space.community.slug}`}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Wróć do społeczności"
              >
                <Icon icon="solar:arrow-left-linear" width={18} className="text-slate-500" />
              </Link>
            )}
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
              <Icon icon={TYPE_ICON[space.type] || 'solar:document-text-linear'} width={24} className="text-indigo-500 dark:text-indigo-400" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white truncate">{space.name}</h1>
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                {TYPE_LABEL[space.type] ?? space.type}
              </span>
            </div>
            {space.description && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{space.description}</p>
            )}
            <div className="flex items-center gap-4 mt-2 text-xs text-slate-400 dark:text-slate-500">
              <span className="flex items-center gap-1">
                <Icon icon="solar:users-group-rounded-linear" width={13} />
                {space.memberCount} członków
              </span>
              {space.type === 'POSTS' && (
                <span className="flex items-center gap-1">
                  <Icon icon="solar:document-text-linear" width={13} />
                  {space.postCount} postów
                </span>
              )}
              <span className="flex items-center gap-1">
                <Icon icon={space.visibility === 'PUBLIC' ? 'solar:globe-linear' : 'solar:lock-linear'} width={13} />
                {VISIBILITY_LABEL[space.visibility] ?? space.visibility}
              </span>
              {space.community && (
                <Link
                  href={`/communities/${space.community.slug}`}
                  className="flex items-center gap-1 text-indigo-500 dark:text-indigo-400 hover:underline"
                >
                  <Icon icon="solar:home-2-linear" width={13} />
                  {space.community.name}
                </Link>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex-shrink-0">
            {!isMember ? (
              <button
                onClick={() => joinMut.mutate(spaceId)}
                disabled={joinMut.isPending}
                className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {joinMut.isPending ? 'Dołączanie...' : 'Dołącz'}
              </button>
            ) : isOwner ? (
              <span className="px-3 py-2 text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400 rounded-lg">
                Właściciel
              </span>
            ) : (
              <button
                onClick={() => leaveMut.mutate(spaceId)}
                disabled={leaveMut.isPending}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-red-300 hover:text-red-500 transition-colors disabled:opacity-50"
              >
                {leaveMut.isPending ? 'Opuszczanie...' : 'Opuść'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Content ───────────────────────────────── */}
      <div className="flex gap-6">
        {/* Main area */}
        <div className="flex-1 min-w-0">
          {space.type === 'POSTS' ? (
            <PostsView spaceId={spaceId} isMember={isMember} />
          ) : (
            <PlaceholderView type={space.type} />
          )}
        </div>

        {/* Sidebar */}
        <div className="w-64 flex-shrink-0 hidden lg:block space-y-4">
          <MembersSidebar spaceId={spaceId} />
        </div>
      </div>
    </div>
  )
}
