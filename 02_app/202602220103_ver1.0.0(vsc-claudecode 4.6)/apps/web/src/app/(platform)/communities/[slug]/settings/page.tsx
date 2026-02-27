'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Icon } from '@iconify/react'
import { toast } from 'sonner'
import { communitiesApi, type CommunityDetailResponse } from '@/lib/api'
import { useAuthStore } from '@/stores/useAuthStore'

export default function CommunitySettingsPage() {
  const params = useParams<{ slug: string }>()
  const slug = params?.slug ?? ''
  const router = useRouter()
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)

  const { data: community, isLoading: loading } = useQuery({
    queryKey: ['community', slug],
    queryFn: () => communitiesApi.get(slug),
    enabled: !!slug,
  })

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [brandColor, setBrandColor] = useState('#6366f1')

  useEffect(() => {
    if (community) {
      setName(community.name)
      setDescription(community.description ?? '')
      setBrandColor(community.brandColor ?? '#6366f1')
    }
  }, [community])

  const updateMutation = useMutation({
    mutationFn: (payload: { name?: string; description?: string; brandColor?: string }) =>
      communitiesApi.update(slug, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community', slug] })
      toast.success('Ustawienia zapisane')
    },
    onError: () => toast.error('Nie udało się zapisać ustawień'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => communitiesApi.remove(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communities'] })
      toast.success('Społeczność została usunięta')
      router.push('/communities')
    },
    onError: () => toast.error('Nie udało się usunąć społeczności'),
  })

  const [confirmDelete, setConfirmDelete] = useState(false)

  // Guard: only owner/admin
  const canAccess = community?.memberRole === 'OWNER' || community?.memberRole === 'ADMIN'
  const isOwner = community?.memberRole === 'OWNER'

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Icon icon="solar:refresh-circle-line-duotone" className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    )
  }

  if (!community || !canAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Icon icon="solar:lock-password-line-duotone" className="w-16 h-16 text-slate-300 dark:text-slate-600" />
        <p className="text-slate-500">Brak dostępu do ustawień tej społeczności</p>
        <button onClick={() => router.back()} className="text-indigo-600 hover:underline text-sm">
          Wróć
        </button>
      </div>
    )
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    updateMutation.mutate({ name, description, brandColor })
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push(`/communities/${slug}`)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <Icon icon="solar:arrow-left-line-duotone" className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Ustawienia</h1>
        </div>
        <span className="text-sm text-slate-500">{community.name}</span>
      </div>

      {/* Edit form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 space-y-5">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Informacje ogólne</h2>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Nazwa społeczności
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
              placeholder="Nazwa..."
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Opis
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow resize-none"
              placeholder="Opis społeczności..."
            />
          </div>

          <div>
            <label htmlFor="brandColor" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Kolor marki
            </label>
            <div className="flex items-center gap-3">
              <input
                id="brandColor"
                type="color"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer border border-slate-300 dark:border-slate-600"
              />
              <input
                type="text"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="w-32 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-sm"
                pattern="^#[0-9A-Fa-f]{6}$"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
        >
          {updateMutation.isPending && <Icon icon="solar:refresh-circle-line-duotone" className="w-4 h-4 animate-spin" />}
          Zapisz zmiany
        </button>
      </form>

      {/* Danger zone — only owner */}
      {isOwner && (
        <div className="bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
            <Icon icon="solar:danger-triangle-line-duotone" className="w-5 h-5" />
            Strefa zagrożenia
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Usunięcie społeczności jest nieodwracalne. Wszystkie posty, członkostwa i dane zostaną trwale usunięte.
          </p>

          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              Usuń społeczność
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg transition-colors"
              >
                {deleteMutation.isPending ? 'Usuwanie...' : 'Potwierdź usunięcie'}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 dark:text-slate-400"
              >
                Anuluj
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
