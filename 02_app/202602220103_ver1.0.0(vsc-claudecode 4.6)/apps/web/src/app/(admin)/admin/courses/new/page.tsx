'use client'

export const dynamic = 'force-dynamic'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Icon } from '@iconify/react'
import { toast } from 'sonner'
import { useCreateCourse } from '@/lib/hooks/useCourses'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export default function NewCoursePage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center"><Icon icon="solar:spinner-bold" width={24} height={24} className="animate-spin text-indigo-500" /></div>}>
      <NewCoursePageInner />
    </Suspense>
  )
}

function NewCoursePageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const communitySlug = searchParams?.get('community') ?? ''

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [isFree, setIsFree] = useState(true)
  const [price, setPrice] = useState('')
  const [currency, setCurrency] = useState('PLN')
  const [accessType, setAccessType] = useState<'PUBLIC' | 'MEMBERS_ONLY' | 'PRIVATE'>('PUBLIC')
  const [autoSlug, setAutoSlug] = useState(true)

  const createMutation = useCreateCourse(communitySlug)

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (autoSlug) setSlug(slugify(value))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !slug.trim()) {
      toast.error('Tytuł i slug są wymagane')
      return
    }
    createMutation.mutate(
      {
        title: title.trim(),
        slug: slug.trim(),
        description: description.trim() || undefined,
        isFree,
        price: isFree ? undefined : parseFloat(price) || undefined,
        currency,
        accessType,
      },
      {
        onSuccess: (course) => {
          toast.success('Kurs utworzony!')
          router.push(`/admin/courses/${course.id}?community=${communitySlug}`)
        },
        onError: () => toast.error('Błąd tworzenia kursu'),
      },
    )
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <Link href="/admin/courses" className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
          Kursy
        </Link>
        <Icon icon="solar:alt-arrow-right-linear" width={14} height={14} />
        <span className="text-slate-900 dark:text-white font-medium">Nowy kurs</span>
      </div>

      <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
        Utwórz nowy kurs
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            Tytuł kursu *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="np. Budowanie społeczności online"
            className="w-full h-11 px-4 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            Slug (URL)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={slug}
              onChange={(e) => { setAutoSlug(false); setSlug(e.target.value) }}
              placeholder="budowanie-spolecznosci"
              className="flex-1 h-11 px-4 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow font-mono"
            />
            <button
              type="button"
              onClick={() => { setAutoSlug(true); setSlug(slugify(title)) }}
              className="h-11 px-3 text-xs text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"
              title="Auto-generuj z tytułu"
            >
              <Icon icon="solar:refresh-linear" width={16} height={16} />
            </button>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            Opis
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Krótki opis kursu widoczny na stronie..."
            className="w-full px-4 py-3 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow resize-none"
          />
        </div>

        {/* Access & Pricing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Access type */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
              Dostępność
            </label>
            <select
              value={accessType}
              onChange={(e) => setAccessType(e.target.value as typeof accessType)}
              className="w-full h-11 px-4 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="PUBLIC">Publiczny</option>
              <option value="MEMBERS_ONLY">Tylko dla członków</option>
              <option value="PRIVATE">Prywatny (zaproszenia)</option>
            </select>
          </div>

          {/* Pricing toggle */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
              Cennik
            </label>
            <div className="flex items-center gap-3 h-11">
              <button
                type="button"
                onClick={() => setIsFree(true)}
                className={`flex-1 h-full rounded-lg text-sm font-medium border transition-colors ${
                  isFree
                    ? 'bg-green-50 border-green-300 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-400'
                    : 'bg-white dark:bg-dark-surface border-slate-200 dark:border-dark-border text-slate-500'
                }`}
              >
                Darmowy
              </button>
              <button
                type="button"
                onClick={() => setIsFree(false)}
                className={`flex-1 h-full rounded-lg text-sm font-medium border transition-colors ${
                  !isFree
                    ? 'bg-amber-50 border-amber-300 text-amber-700 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-400'
                    : 'bg-white dark:bg-dark-surface border-slate-200 dark:border-dark-border text-slate-500'
                }`}
              >
                Płatny
              </button>
            </div>
          </div>
        </div>

        {/* Price (if paid) */}
        {!isFree && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                Cena
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="99.00"
                className="w-full h-11 px-4 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                Waluta
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full h-11 px-4 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="PLN">PLN</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-dark-border">
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="h-10 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
          >
            {createMutation.isPending ? 'Tworzenie...' : 'Utwórz kurs'}
          </button>
          <Link
            href="/admin/courses"
            className="h-10 px-4 flex items-center text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            Anuluj
          </Link>
        </div>
      </form>
    </div>
  )
}
