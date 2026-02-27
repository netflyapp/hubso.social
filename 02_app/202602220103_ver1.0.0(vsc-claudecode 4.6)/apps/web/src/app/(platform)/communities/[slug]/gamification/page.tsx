'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Icon } from '@iconify/react'
import { toast } from 'sonner'
import {
  useBadges,
  useChallenges,
  useGamificationStats,
  useCreateBadge,
  useUpdateBadge,
  useDeleteBadge,
  useCreateChallenge,
  useUpdateChallenge,
  useDeleteChallenge,
  useGrantPoints,
  useDeductPoints,
} from '@/lib/hooks/useGamification'
import type { Badge, Challenge } from '@/lib/api'

type AdminTab = 'overview' | 'badges' | 'challenges' | 'points'

export default function GamificationAdminPage() {
  const params = useParams<{ slug: string }>()
  const slug = params?.slug ?? ''
  const [activeTab, setActiveTab] = useState<AdminTab>('overview')

  const tabs = [
    { id: 'overview' as AdminTab, label: 'Przegląd', icon: 'solar:chart-square-linear' },
    { id: 'badges' as AdminTab, label: 'Odznaki', icon: 'solar:medal-star-linear' },
    { id: 'challenges' as AdminTab, label: 'Wyzwania', icon: 'solar:target-linear' },
    { id: 'points' as AdminTab, label: 'Punkty', icon: 'solar:star-linear' },
  ]

  return (
    <main className="flex-1 overflow-y-auto p-4 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Zarządzanie gryfikacją
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Konfiguruj odznaki, wyzwania i przyznawaj punkty członkom
          </p>
        </div>

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

        {activeTab === 'overview' && <OverviewTab slug={slug} />}
        {activeTab === 'badges' && <BadgesAdminTab slug={slug} />}
        {activeTab === 'challenges' && <ChallengesAdminTab slug={slug} />}
        {activeTab === 'points' && <PointsAdminTab slug={slug} />}
      </div>
    </main>
  )
}

// ==================== Overview Tab ====================

function OverviewTab({ slug }: { slug: string }) {
  const { data: stats, isLoading } = useGamificationStats(slug)

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 animate-pulse">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-xl p-5">
            <div className="h-4 w-20 bg-gray-200 dark:bg-slate-700 rounded mb-2" />
            <div className="h-8 w-14 bg-gray-200 dark:bg-slate-700 rounded" />
          </div>
        ))}
      </div>
    )
  }

  const items = [
    { label: 'Punkty przyznane', value: stats?.totalPointsAwarded?.toLocaleString() ?? '0', icon: 'solar:star-bold', color: 'text-amber-500' },
    { label: 'Odznaki', value: String(stats?.totalBadges ?? 0), icon: 'solar:medal-star-bold', color: 'text-indigo-500' },
    { label: 'Wyzwania', value: String(stats?.totalChallenges ?? 0), icon: 'solar:target-bold', color: 'text-purple-500' },
    { label: 'Aktywne wyzwania', value: String(stats?.activeChallenges ?? 0), icon: 'solar:fire-bold', color: 'text-orange-500' },
    { label: 'Aktywni uczestnicy', value: String(stats?.activeParticipants ?? 0), icon: 'solar:users-group-rounded-bold', color: 'text-emerald-500' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {items.map((item) => (
        <div key={item.label} className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Icon icon={item.icon} width={16} height={16} className={item.color} />
            <span className="text-xs text-slate-500 dark:text-slate-400">{item.label}</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{item.value}</p>
        </div>
      ))}
    </div>
  )
}

// ==================== Badges Admin Tab ====================

function BadgesAdminTab({ slug }: { slug: string }) {
  const { data: badges, isLoading } = useBadges(slug)
  const createBadge = useCreateBadge(slug)
  const updateBadge = useUpdateBadge(slug)
  const deleteBadge = useDeleteBadge(slug)

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Badge | null>(null)
  const [form, setForm] = useState({
    name: '',
    description: '',
    color: '#6366f1',
    category: 'ACHIEVEMENT',
    pointsReward: 10,
    isAutomatic: false,
  })

  const resetForm = () => {
    setForm({ name: '', description: '', color: '#6366f1', category: 'ACHIEVEMENT', pointsReward: 10, isAutomatic: false })
    setEditing(null)
    setShowForm(false)
  }

  const handleEdit = (badge: Badge) => {
    setForm({
      name: badge.name,
      description: badge.description ?? '',
      color: badge.color,
      category: badge.category,
      pointsReward: badge.pointsReward,
      isAutomatic: badge.isAutomatic,
    })
    setEditing(badge)
    setShowForm(true)
  }

  const handleSubmit = async () => {
    try {
      if (editing) {
        await updateBadge.mutateAsync({ badgeId: editing.id, data: form })
        toast.success('Odznaka zaktualizowana')
      } else {
        await createBadge.mutateAsync(form)
        toast.success('Odznaka utworzona')
      }
      resetForm()
    } catch {
      toast.error('Nie udało się zapisać odznaki')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteBadge.mutateAsync(id)
      toast.success('Odznaka usunięta')
    } catch {
      toast.error('Nie udało się usunąć odznaki')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Odznaki ({badges?.length ?? 0})
        </h3>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors"
        >
          <Icon icon="solar:add-circle-linear" width={14} height={14} />
          Nowa odznaka
        </button>
      </div>

      {/* Badge form */}
      {showForm && (
        <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl p-5 space-y-4">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            {editing ? 'Edytuj odznakę' : 'Nowa odznaka'}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Nazwa</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-gray-200 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Nazwa odznaki"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Kategoria</label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-gray-200 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ACHIEVEMENT">Osiągnięcie</option>
                <option value="MILESTONE">Kamień milowy</option>
                <option value="SPECIAL">Specjalna</option>
                <option value="COMMUNITY">Społeczność</option>
                <option value="SEASONAL">Sezonowa</option>
                <option value="CUSTOM">Własna</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Opis</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-gray-200 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                placeholder="Opis odznaki"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Kolor</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                  className="w-8 h-8 rounded border-0 cursor-pointer"
                />
                <input
                  value={form.color}
                  onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                  className="flex-1 px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-gray-200 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Punkty nagrody</label>
              <input
                type="number"
                value={form.pointsReward}
                onChange={(e) => setForm((f) => ({ ...f, pointsReward: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-gray-200 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                min={0}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isAutomatic}
              onChange={(e) => setForm((f) => ({ ...f, isAutomatic: e.target.checked }))}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-xs text-slate-600 dark:text-slate-400">Automatycznie przyznawana (na podstawie kryteriów)</span>
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSubmit}
              disabled={!form.name || createBadge.isPending || updateBadge.isPending}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {editing ? 'Zapisz zmiany' : 'Utwórz odznakę'}
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-dark-border text-slate-600 dark:text-slate-400 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
            >
              Anuluj
            </button>
          </div>
        </div>
      )}

      {/* Badge list */}
      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 dark:bg-slate-700 rounded-full" />
                <div className="h-4 w-32 bg-gray-200 dark:bg-slate-700 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : (badges ?? []).length === 0 ? (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          <Icon icon="solar:medal-star-linear" width={40} height={40} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">Brak odznak. Utwórz pierwszą!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(badges ?? []).map((badge) => (
            <div key={badge.id} className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: badge.color + '20', color: badge.color }}
                >
                  <Icon icon="solar:medal-star-bold" width={20} height={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{badge.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {badge.category} · +{badge.pointsReward} pkt · {badge._count?.userBadges ?? 0} przyznanych
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleEdit(badge)}
                  className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                >
                  <Icon icon="solar:pen-linear" width={16} height={16} />
                </button>
                <button
                  onClick={() => handleDelete(badge.id)}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Icon icon="solar:trash-bin-2-linear" width={16} height={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ==================== Challenges Admin Tab ====================

function ChallengesAdminTab({ slug }: { slug: string }) {
  const { data: challenges, isLoading } = useChallenges(slug, true)
  const createChallenge = useCreateChallenge(slug)
  const updateChallenge = useUpdateChallenge(slug)
  const deleteChallenge = useDeleteChallenge(slug)

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Challenge | null>(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'CUMULATIVE',
    durationDays: 7,
    pointsReward: 25,
    maxParticipants: '',
  })

  const resetForm = () => {
    setForm({ title: '', description: '', type: 'CUMULATIVE', durationDays: 7, pointsReward: 25, maxParticipants: '' })
    setEditing(null)
    setShowForm(false)
  }

  const handleEdit = (challenge: Challenge) => {
    setForm({
      title: challenge.title,
      description: challenge.description ?? '',
      type: challenge.type,
      durationDays: challenge.durationDays,
      pointsReward: challenge.pointsReward,
      maxParticipants: challenge.maxParticipants?.toString() ?? '',
    })
    setEditing(challenge)
    setShowForm(true)
  }

  const handleSubmit = async () => {
    try {
      const payload = {
        ...form,
        maxParticipants: form.maxParticipants ? parseInt(form.maxParticipants) : undefined,
      }
      if (editing) {
        await updateChallenge.mutateAsync({ challengeId: editing.id, data: payload })
        toast.success('Wyzwanie zaktualizowane')
      } else {
        await createChallenge.mutateAsync(payload)
        toast.success('Wyzwanie utworzone')
      }
      resetForm()
    } catch {
      toast.error('Nie udało się zapisać wyzwania')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteChallenge.mutateAsync(id)
      toast.success('Wyzwanie usunięte')
    } catch {
      toast.error('Nie udało się usunąć wyzwania')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Wyzwania ({challenges?.length ?? 0})
        </h3>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors"
        >
          <Icon icon="solar:add-circle-linear" width={14} height={14} />
          Nowe wyzwanie
        </button>
      </div>

      {/* Challenge form */}
      {showForm && (
        <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl p-5 space-y-4">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            {editing ? 'Edytuj wyzwanie' : 'Nowe wyzwanie'}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Tytuł</label>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-gray-200 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Tytuł wyzwania"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Opis</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-gray-200 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                placeholder="Opis wyzwania"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Typ</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-gray-200 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="STREAK">Streak (ciągłość)</option>
                <option value="CUMULATIVE">Kumulacyjne (suma)</option>
                <option value="ONE_TIME">Jednorazowe</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Czas trwania (dni)</label>
              <input
                type="number"
                value={form.durationDays}
                onChange={(e) => setForm((f) => ({ ...f, durationDays: parseInt(e.target.value) || 1 }))}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-gray-200 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                min={1}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Punkty nagrody</label>
              <input
                type="number"
                value={form.pointsReward}
                onChange={(e) => setForm((f) => ({ ...f, pointsReward: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-gray-200 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                min={0}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Maks. uczestników (opcjonalnie)</label>
              <input
                type="number"
                value={form.maxParticipants}
                onChange={(e) => setForm((f) => ({ ...f, maxParticipants: e.target.value }))}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-gray-200 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                min={1}
                placeholder="Bez limitu"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSubmit}
              disabled={!form.title || createChallenge.isPending || updateChallenge.isPending}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {editing ? 'Zapisz zmiany' : 'Utwórz wyzwanie'}
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-dark-border text-slate-600 dark:text-slate-400 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
            >
              Anuluj
            </button>
          </div>
        </div>
      )}

      {/* Challenge list */}
      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-xl p-4">
              <div className="h-5 w-40 bg-gray-200 dark:bg-slate-700 rounded mb-2" />
              <div className="h-3 w-64 bg-gray-200 dark:bg-slate-700 rounded" />
            </div>
          ))}
        </div>
      ) : (challenges ?? []).length === 0 ? (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          <Icon icon="solar:target-linear" width={40} height={40} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">Brak wyzwań. Utwórz pierwsze!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(challenges ?? []).map((challenge) => (
            <div key={challenge.id} className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{challenge.title}</p>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      challenge.isActive
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-slate-500'
                    }`}>
                      {challenge.isActive ? 'Aktywne' : 'Nieaktywne'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {challenge.type} · {challenge.durationDays} dni · +{challenge.pointsReward} pkt · {challenge._count?.participants ?? 0} uczestników
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(challenge)}
                    className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                  >
                    <Icon icon="solar:pen-linear" width={16} height={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(challenge.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Icon icon="solar:trash-bin-2-linear" width={16} height={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ==================== Points Admin Tab ====================

function PointsAdminTab({ slug }: { slug: string }) {
  const grantPoints = useGrantPoints(slug)
  const deductPoints = useDeductPoints(slug)

  const [mode, setMode] = useState<'grant' | 'deduct'>('grant')
  const [userId, setUserId] = useState('')
  const [points, setPoints] = useState(10)
  const [description, setDescription] = useState('')

  const handleSubmit = async () => {
    try {
      if (mode === 'grant') {
        await grantPoints.mutateAsync({ userId, points, description: description || undefined })
        toast.success(`Przyznano ${points} punktów`)
      } else {
        await deductPoints.mutateAsync({ userId, points, description: description || undefined })
        toast.success(`Odjęto ${points} punktów`)
      }
      setUserId('')
      setPoints(10)
      setDescription('')
    } catch {
      toast.error('Nie udało się wykonać operacji')
    }
  }

  return (
    <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl p-6 space-y-5">
      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Zarządzanie punktami</h3>

      {/* Mode toggle */}
      <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-800 rounded-lg p-1 w-fit">
        <button
          onClick={() => setMode('grant')}
          className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors ${
            mode === 'grant'
              ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Przyznaj punkty
        </button>
        <button
          onClick={() => setMode('deduct')}
          className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors ${
            mode === 'deduct'
              ? 'bg-white dark:bg-slate-700 shadow-sm text-red-600'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Odejmij punkty
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">ID użytkownika</label>
          <input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-gray-200 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="UUID użytkownika"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Liczba punktów</label>
          <input
            type="number"
            value={points}
            onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-gray-200 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            min={1}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Opis (opcjonalnie)</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-gray-200 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="np. Nagroda za aktywność"
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!userId || points <= 0 || grantPoints.isPending || deductPoints.isPending}
        className={`px-4 py-2 rounded-lg text-white text-xs font-semibold transition-colors disabled:opacity-50 ${
          mode === 'grant'
            ? 'bg-emerald-600 hover:bg-emerald-700'
            : 'bg-red-600 hover:bg-red-700'
        }`}
      >
        {mode === 'grant' ? 'Przyznaj punkty' : 'Odejmij punkty'}
      </button>
    </div>
  )
}
