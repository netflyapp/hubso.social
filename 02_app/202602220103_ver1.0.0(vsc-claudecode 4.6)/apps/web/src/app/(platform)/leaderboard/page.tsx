'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Icon } from '@iconify/react'
import { communitiesApi, type CommunityItem } from '@/lib/api'
import {
  useLeaderboard,
  useGamificationProfile,
  useMyStreak,
  useBadges,
  useMyBadges,
  useChallenges,
  useMyChallenges,
  useJoinChallenge,
  useLeaveChallenge,
} from '@/lib/hooks/useGamification'
import { useAuthStore } from '@/stores/useAuthStore'

type Tab = 'ranking' | 'badges' | 'challenges' | 'profile'

const LEVEL_COLORS: Record<string, string> = {
  NEWBIE: 'bg-slate-400',
  BEGINNER: 'bg-green-500',
  INTERMEDIATE: 'bg-blue-500',
  ADVANCED: 'bg-purple-500',
  PRO: 'bg-amber-500',
  MASTER: 'bg-red-500',
  LEGEND: 'bg-gradient-to-r from-amber-400 to-red-500',
}

const LEVEL_LABELS: Record<string, string> = {
  NEWBIE: 'Nowicjusz',
  BEGINNER: 'Początkujący',
  INTERMEDIATE: 'Średniozaawansowany',
  ADVANCED: 'Zaawansowany',
  PRO: 'Profesjonalista',
  MASTER: 'Mistrz',
  LEGEND: 'Legenda',
}

const BADGE_CATEGORY_LABELS: Record<string, string> = {
  ACHIEVEMENT: 'Osiągnięcie',
  MILESTONE: 'Kamień milowy',
  SPECIAL: 'Specjalna',
  COMMUNITY: 'Społeczność',
  SEASONAL: 'Sezonowa',
  CUSTOM: 'Własna',
}

const BADGE_CATEGORY_ICONS: Record<string, string> = {
  ACHIEVEMENT: 'solar:medal-star-bold',
  MILESTONE: 'solar:flag-bold',
  SPECIAL: 'solar:star-bold',
  COMMUNITY: 'solar:users-group-rounded-bold',
  SEASONAL: 'solar:leaf-bold',
  CUSTOM: 'solar:palette-bold',
}

export default function LeaderboardPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [activeTab, setActiveTab] = useState<Tab>('ranking')
  const [communitySlug, setCommunitySlug] = useState('')
  const [page, setPage] = useState(1)

  // Fetch communities
  const { data: communities } = useQuery<CommunityItem[]>({
    queryKey: ['communities'],
    queryFn: () => communitiesApi.list(),
    enabled: isAuthenticated,
  })

  // Auto-select first community
  useEffect(() => {
    if (communities && communities.length > 0 && !communitySlug) {
      setCommunitySlug(communities[0]!.slug)
    }
  }, [communities, communitySlug])

  // Queries
  const { data: leaderboardData, isLoading: leaderboardLoading } = useLeaderboard(communitySlug, page)
  const { data: profile, isLoading: profileLoading } = useGamificationProfile(communitySlug)
  const { data: streak } = useMyStreak(communitySlug)
  const { data: allBadges, isLoading: badgesLoading } = useBadges(communitySlug)
  const { data: myBadges } = useMyBadges(communitySlug)
  const { data: challenges, isLoading: challengesLoading } = useChallenges(communitySlug)
  const { data: myChallenges } = useMyChallenges(communitySlug)

  // Mutations
  const joinChallenge = useJoinChallenge(communitySlug)
  const leaveChallenge = useLeaveChallenge(communitySlug)

  const leaderboard = leaderboardData?.data ?? []
  const totalPages = leaderboardData?.pages ?? 1
  const earnedBadgeIds = new Set((myBadges ?? []).map((ub) => ub.badgeId))
  const joinedChallengeIds = new Set((myChallenges ?? []).map((cp) => cp.challengeId))

  const tabs = [
    { id: 'ranking' as Tab, label: 'Ranking', icon: 'solar:cup-star-linear' },
    { id: 'badges' as Tab, label: 'Odznaki', icon: 'solar:medal-star-linear' },
    { id: 'challenges' as Tab, label: 'Wyzwania', icon: 'solar:target-linear' },
    { id: 'profile' as Tab, label: 'Mój profil', icon: 'solar:user-circle-linear' },
  ]

  return (
    <main className="flex-1 overflow-y-auto p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Ranking i osiągnięcia
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Zdobywaj punkty, odznaki i rywalizuj na tablicy wyników
            </p>
          </div>

          {/* Community selector */}
          {communities && communities.length > 1 && (
            <select
              value={communitySlug}
              onChange={(e) => { setCommunitySlug(e.target.value); setPage(1) }}
              className="px-3 py-2 text-sm bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {communities.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>
          )}
        </div>

        {/* Quick stats row */}
        {profile && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard
              icon="solar:ranking-linear"
              label="Pozycja"
              value={`#${profile.rank || '—'}`}
              color="text-amber-500"
            />
            <StatCard
              icon="solar:star-linear"
              label="Punkty"
              value={profile.level?.totalPoints?.toLocaleString() ?? '0'}
              color="text-indigo-500"
            />
            <StatCard
              icon="solar:fire-linear"
              label="Streak"
              value={`${streak?.currentStreak ?? 0} dni`}
              color="text-orange-500"
            />
            <StatCard
              icon="solar:medal-star-linear"
              label="Odznaki"
              value={String(profile.badges?.length ?? 0)}
              color="text-emerald-500"
            />
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-dark-surface rounded-lg p-1 w-fit overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
            >
              <Icon icon={tab.icon} width={14} height={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'ranking' && (
          <RankingTab
            leaderboard={leaderboard}
            loading={leaderboardLoading}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}

        {activeTab === 'badges' && (
          <BadgesTab
            badges={allBadges ?? []}
            earnedBadgeIds={earnedBadgeIds}
            loading={badgesLoading}
          />
        )}

        {activeTab === 'challenges' && (
          <ChallengesTab
            challenges={challenges ?? []}
            joinedIds={joinedChallengeIds}
            loading={challengesLoading}
            onJoin={(id) => joinChallenge.mutate(id)}
            onLeave={(id) => leaveChallenge.mutate(id)}
            joining={joinChallenge.isPending}
            leaving={leaveChallenge.isPending}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileTab
            profile={profile ?? null}
            streak={streak ?? null}
            loading={profileLoading}
          />
        )}
      </div>
    </main>
  )
}

// ==================== Stat Card ====================

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <div className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-xl p-4 flex items-center gap-3">
      <div className={`p-2 rounded-lg bg-gray-50 dark:bg-slate-800 ${color}`}>
        <Icon icon={icon} width={20} height={20} />
      </div>
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-lg font-bold text-slate-900 dark:text-white">{value}</p>
      </div>
    </div>
  )
}

// ==================== Ranking Tab ====================

function RankingTab({
  leaderboard,
  loading,
  page,
  totalPages,
  onPageChange,
}: {
  leaderboard: Array<{
    rank: number
    level: number
    title: string
    totalPoints: number
    user: { id: string; username: string; displayName?: string | null; avatarUrl?: string | null }
  }>
  loading: boolean
  page: number
  totalPages: number
  onPageChange: (p: number) => void
}) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-xl p-4 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-gray-200 dark:bg-slate-700 rounded-full" />
              <div className="h-4 w-32 bg-gray-200 dark:bg-slate-700 rounded" />
              <div className="ml-auto h-4 w-16 bg-gray-200 dark:bg-slate-700 rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (leaderboard.length === 0) {
    return (
      <div className="text-center py-20">
        <Icon icon="solar:cup-star-linear" width={48} height={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Brak wyników</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Zacznij zdobywać punkty, aby pojawić się w rankingu</p>
      </div>
    )
  }

  const medalIcons = ['🥇', '🥈', '🥉']

  return (
    <div className="space-y-4">
      {/* Top 3 podium */}
      {page === 1 && leaderboard.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[1, 0, 2].map((idx) => {
            const entry = leaderboard[idx]!
            const isFirst = idx === 0
            return (
              <div
                key={entry.user.id}
                className={`bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-2xl p-4 text-center ${
                  isFirst ? 'ring-2 ring-amber-400 dark:ring-amber-500 sm:-mt-4' : ''
                }`}
              >
                <div className="text-3xl mb-2">{medalIcons[idx] ?? ''}</div>
                <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg mb-2">
                  {(entry.user.displayName ?? entry.user.username)?.[0]?.toUpperCase() ?? '?'}
                </div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {entry.user.displayName ?? entry.user.username}
                </p>
                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold text-white mt-1 ${LEVEL_COLORS[entry.title] ?? 'bg-slate-400'}`}>
                  {LEVEL_LABELS[entry.title] ?? entry.title}
                </span>
                <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                  {entry.totalPoints.toLocaleString()} pkt
                </p>
              </div>
            )
          })}
        </div>
      )}

      {/* Full list */}
      <div className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[3rem_1fr_6rem_6rem] sm:grid-cols-[4rem_1fr_8rem_8rem] bg-gray-50 dark:bg-slate-800 border-b border-gray-100 dark:border-dark-border px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          <span>#</span>
          <span>Użytkownik</span>
          <span className="text-center">Poziom</span>
          <span className="text-right">Punkty</span>
        </div>
        {leaderboard.map((entry) => (
          <div
            key={entry.user.id}
            className="grid grid-cols-[3rem_1fr_6rem_6rem] sm:grid-cols-[4rem_1fr_8rem_8rem] items-center px-4 py-3 border-b border-gray-50 dark:border-dark-border last:border-0 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <span className="text-sm font-bold text-slate-400 dark:text-slate-500">
              {entry.rank <= 3 ? medalIcons[entry.rank - 1] : entry.rank}
            </span>
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {(entry.user.displayName ?? entry.user.username)?.[0]?.toUpperCase() ?? '?'}
              </div>
              <span className="text-sm font-medium text-slate-900 dark:text-white truncate">
                {entry.user.displayName ?? entry.user.username}
              </span>
            </div>
            <div className="text-center">
              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold text-white ${LEVEL_COLORS[entry.title] ?? 'bg-slate-400'}`}>
                {LEVEL_LABELS[entry.title] ?? entry.title}
              </span>
            </div>
            <span className="text-sm font-bold text-slate-900 dark:text-white text-right">
              {entry.totalPoints.toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="p-2 rounded-lg border border-gray-200 dark:border-dark-border text-slate-500 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Icon icon="solar:alt-arrow-left-linear" width={16} height={16} />
          </button>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {page} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="p-2 rounded-lg border border-gray-200 dark:border-dark-border text-slate-500 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Icon icon="solar:alt-arrow-right-linear" width={16} height={16} />
          </button>
        </div>
      )}
    </div>
  )
}

// ==================== Badges Tab ====================

function BadgesTab({
  badges,
  earnedBadgeIds,
  loading,
}: {
  badges: Array<{
    id: string
    name: string
    description?: string | null
    iconUrl?: string | null
    color: string
    category: string
    pointsReward: number
    isAutomatic: boolean
    _count?: { userBadges: number }
  }>
  earnedBadgeIds: Set<string>
  loading: boolean
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-2xl p-6 animate-pulse">
            <div className="w-12 h-12 bg-gray-200 dark:bg-slate-700 rounded-full mx-auto mb-3" />
            <div className="h-4 w-20 bg-gray-200 dark:bg-slate-700 rounded mx-auto mb-2" />
            <div className="h-3 w-28 bg-gray-200 dark:bg-slate-700 rounded mx-auto" />
          </div>
        ))}
      </div>
    )
  }

  if (badges.length === 0) {
    return (
      <div className="text-center py-20">
        <Icon icon="solar:medal-star-linear" width={48} height={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Brak odznak</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Odznaki nie zostały jeszcze skonfigurowane</p>
      </div>
    )
  }

  // Group by category
  const grouped = badges.reduce<Record<string, typeof badges>>((acc, badge) => {
    const cat = badge.category ?? 'CUSTOM'
    if (!acc[cat]) acc[cat] = []
    acc[cat]!.push(badge)
    return acc
  }, {})

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([category, categoryBadges]) => (
        <div key={category}>
          <div className="flex items-center gap-2 mb-4">
            <Icon icon={BADGE_CATEGORY_ICONS[category] ?? 'solar:star-bold'} width={18} height={18} className="text-slate-500 dark:text-slate-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {BADGE_CATEGORY_LABELS[category] ?? category}
            </h3>
            <span className="text-xs text-slate-400 dark:text-slate-500">({categoryBadges.length})</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categoryBadges.map((badge) => {
              const earned = earnedBadgeIds.has(badge.id)
              return (
                <div
                  key={badge.id}
                  className={`relative bg-white dark:bg-dark-surface border rounded-2xl p-5 text-center transition-all ${
                    earned
                      ? 'border-indigo-200 dark:border-indigo-800 ring-1 ring-indigo-100 dark:ring-indigo-900'
                      : 'border-gray-100 dark:border-dark-border opacity-60 grayscale'
                  }`}
                >
                  {earned && (
                    <div className="absolute top-2 right-2">
                      <Icon icon="solar:check-circle-bold" width={16} height={16} className="text-emerald-500" />
                    </div>
                  )}
                  <div
                    className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl"
                    style={{ backgroundColor: badge.color + '20', color: badge.color }}
                  >
                    {badge.iconUrl ? (
                      <Icon icon={badge.iconUrl} width={28} height={28} />
                    ) : (
                      <Icon icon="solar:medal-star-bold" width={28} height={28} />
                    )}
                  </div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{badge.name}</p>
                  {badge.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{badge.description}</p>
                  )}
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <Icon icon="solar:star-bold" width={12} height={12} className="text-amber-500" />
                    <span className="text-xs font-medium text-amber-600 dark:text-amber-400">+{badge.pointsReward} pkt</span>
                  </div>
                  {badge._count?.userBadges != null && (
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                      Zdobyło: {badge._count.userBadges} osób
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

// ==================== Challenges Tab ====================

function ChallengesTab({
  challenges,
  joinedIds,
  loading,
  onJoin,
  onLeave,
  joining,
  leaving,
}: {
  challenges: Array<{
    id: string
    title: string
    description?: string | null
    type: string
    durationDays: number
    pointsReward: number
    badgeReward?: string | null
    maxParticipants?: number | null
    startDate?: string | null
    endDate?: string | null
    isActive: boolean
    _count?: { participants: number }
  }>
  joinedIds: Set<string>
  loading: boolean
  onJoin: (id: string) => void
  onLeave: (id: string) => void
  joining: boolean
  leaving: boolean
}) {
  const challengeTypeLabels: Record<string, string> = {
    STREAK: 'Streak',
    CUMULATIVE: 'Kumulacyjne',
    ONE_TIME: 'Jednorazowe',
  }

  const challengeTypeIcons: Record<string, string> = {
    STREAK: 'solar:fire-bold',
    CUMULATIVE: 'solar:chart-linear',
    ONE_TIME: 'solar:bolt-circle-bold',
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-2xl p-6 animate-pulse">
            <div className="h-5 w-40 bg-gray-200 dark:bg-slate-700 rounded mb-3" />
            <div className="h-3 w-full bg-gray-200 dark:bg-slate-700 rounded mb-2" />
            <div className="h-3 w-3/4 bg-gray-200 dark:bg-slate-700 rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (challenges.length === 0) {
    return (
      <div className="text-center py-20">
        <Icon icon="solar:target-linear" width={48} height={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Brak wyzwań</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Aktualnie nie ma żadnych aktywnych wyzwań</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {challenges.map((challenge) => {
        const joined = joinedIds.has(challenge.id)
        const participantCount = challenge._count?.participants ?? 0
        const isFull = challenge.maxParticipants != null && participantCount >= challenge.maxParticipants

        return (
          <div
            key={challenge.id}
            className={`bg-white dark:bg-dark-surface border rounded-2xl p-5 transition-all ${
              joined
                ? 'border-indigo-200 dark:border-indigo-800 ring-1 ring-indigo-100 dark:ring-indigo-900'
                : 'border-gray-100 dark:border-dark-border'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                  <Icon icon={challengeTypeIcons[challenge.type] ?? 'solar:target-bold'} width={18} height={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{challenge.title}</h3>
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase">
                    {challengeTypeLabels[challenge.type] ?? challenge.type} · {challenge.durationDays} dni
                  </span>
                </div>
              </div>
              {joined && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                  <Icon icon="solar:check-circle-bold" width={12} height={12} />
                  Dołączono
                </span>
              )}
            </div>

            {challenge.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 line-clamp-2">{challenge.description}</p>
            )}

            <div className="flex items-center gap-4 mt-4 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Icon icon="solar:star-bold" width={12} height={12} className="text-amber-500" />
                +{challenge.pointsReward} pkt
              </span>
              <span className="flex items-center gap-1">
                <Icon icon="solar:users-group-rounded-linear" width={12} height={12} />
                {participantCount}{challenge.maxParticipants ? `/${challenge.maxParticipants}` : ''}
              </span>
              {challenge.endDate && (
                <span className="flex items-center gap-1">
                  <Icon icon="solar:calendar-linear" width={12} height={12} />
                  Do {new Date(challenge.endDate).toLocaleDateString('pl-PL')}
                </span>
              )}
            </div>

            <div className="mt-4">
              {joined ? (
                <button
                  onClick={() => onLeave(challenge.id)}
                  disabled={leaving}
                  className="w-full px-4 py-2 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                >
                  Opuść wyzwanie
                </button>
              ) : (
                <button
                  onClick={() => onJoin(challenge.id)}
                  disabled={joining || isFull}
                  className="w-full px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {isFull ? 'Brak miejsc' : 'Dołącz do wyzwania'}
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ==================== Profile Tab ====================

function ProfileTab({
  profile,
  streak,
  loading,
}: {
  profile: {
    level: { level: number; title: string; totalPoints: number; currentLevelPoints: number; nextLevelThreshold: number } | null
    streak: { currentStreak: number; longestStreak: number; lastActiveDate?: string | null; streakStartDate?: string | null } | null
    badges: Array<{ id: string; badge: { id: string; name: string; color: string; iconUrl?: string | null; category: string } ; awardedAt: string }>
    rank: number
    recentPoints: Array<{ id: string; points: number; reason: string; description?: string | null; createdAt: string }>
  } | null
  streak: { currentStreak: number; longestStreak: number; lastActiveDate?: string | null; streakStartDate?: string | null } | null
  loading: boolean
}) {
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-2xl p-6">
          <div className="h-6 w-40 bg-gray-200 dark:bg-slate-700 rounded mb-4" />
          <div className="h-4 w-full bg-gray-200 dark:bg-slate-700 rounded mb-2" />
          <div className="h-4 w-3/4 bg-gray-200 dark:bg-slate-700 rounded" />
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-20">
        <Icon icon="solar:user-circle-linear" width={48} height={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Nie znaleziono profilu</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Zacznij być aktywny, aby zobaczyć swoje statystyki</p>
      </div>
    )
  }

  const level = profile.level
  const progressPercent = level
    ? level.nextLevelThreshold > 0
      ? Math.min(100, Math.round((level.currentLevelPoints / level.nextLevelThreshold) * 100))
      : 100
    : 0

  const pointReasonLabels: Record<string, string> = {
    POST_CREATED: 'Nowy post',
    COMMENT_CREATED: 'Komentarz',
    REACTION_RECEIVED: 'Reakcja otrzymana',
    REACTION_GIVEN: 'Reakcja dodana',
    DAILY_LOGIN: 'Dzienny login',
    COURSE_COMPLETED: 'Ukończony kurs',
    LESSON_COMPLETED: 'Ukończona lekcja',
    CHALLENGE_COMPLETED: 'Wyzwanie ukończone',
    BADGE_EARNED: 'Odznaka zdobyta',
    STREAK_BONUS: 'Bonus za streak',
    ADMIN_GRANT: 'Przyznane przez admina',
    ADMIN_DEDUCT: 'Odjęte przez admina',
    OTHER: 'Inne',
  }

  return (
    <div className="space-y-6">
      {/* Level card */}
      <div className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${LEVEL_COLORS[level?.title ?? 'NEWBIE'] ?? 'bg-slate-400'}`}>
              {level?.level ?? 1}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {LEVEL_LABELS[level?.title ?? 'NEWBIE'] ?? 'Nowicjusz'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pozycja #{profile.rank} · {level?.totalPoints?.toLocaleString() ?? 0} punktów
              </p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Postęp do następnego poziomu</span>
            <span>{level?.currentLevelPoints ?? 0} / {level?.nextLevelThreshold ?? 100}</span>
          </div>
          <div className="w-full h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Streak card */}
      <div className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-2xl p-6">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Icon icon="solar:fire-bold" width={18} height={18} className="text-orange-500" />
          Streak
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-2xl font-bold text-orange-500">{streak?.currentStreak ?? profile.streak?.currentStreak ?? 0}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Aktualny streak</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{streak?.longestStreak ?? profile.streak?.longestStreak ?? 0}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Najdłuższy streak</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              {(streak?.lastActiveDate ?? profile.streak?.lastActiveDate) ? new Date(streak?.lastActiveDate ?? profile.streak?.lastActiveDate ?? '').toLocaleDateString('pl-PL') : '—'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Ostatnia aktywność</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              {(streak?.streakStartDate ?? profile.streak?.streakStartDate) ? new Date(streak?.streakStartDate ?? profile.streak?.streakStartDate ?? '').toLocaleDateString('pl-PL') : '—'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Start streaka</p>
          </div>
        </div>
      </div>

      {/* Badges earned */}
      {profile.badges.length > 0 && (
        <div className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-2xl p-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Icon icon="solar:medal-star-bold" width={18} height={18} className="text-amber-500" />
            Moje odznaki ({profile.badges.length})
          </h3>
          <div className="flex flex-wrap gap-3">
            {profile.badges.map((ub) => (
              <div
                key={ub.id}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-dark-border"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: ub.badge.color + '20', color: ub.badge.color }}
                >
                  <Icon icon={ub.badge.iconUrl ?? 'solar:medal-star-bold'} width={16} height={16} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">{ub.badge.name}</p>
                  <p className="text-[10px] text-slate-400">{new Date(ub.awardedAt).toLocaleDateString('pl-PL')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent points */}
      {profile.recentPoints.length > 0 && (
        <div className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-2xl p-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Icon icon="solar:clock-circle-linear" width={18} height={18} className="text-indigo-500" />
            Ostatnia aktywność
          </h3>
          <div className="space-y-3">
            {profile.recentPoints.map((pt) => (
              <div key={pt.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    pt.points > 0 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {pt.points > 0 ? '+' : ''}{pt.points}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-900 dark:text-white">
                      {pointReasonLabels[pt.reason] ?? pt.reason}
                    </p>
                    {pt.description && (
                      <p className="text-[10px] text-slate-400 truncate">{pt.description}</p>
                    )}
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 ml-2 shrink-0">
                  {new Date(pt.createdAt).toLocaleDateString('pl-PL')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
