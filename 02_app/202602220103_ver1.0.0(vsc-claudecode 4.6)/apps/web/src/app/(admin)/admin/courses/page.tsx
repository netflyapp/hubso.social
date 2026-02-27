'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Icon } from '@iconify/react'
import { toast } from 'sonner'
import { communitiesApi, type CommunityItem } from '@/lib/api'
import { useCourses, useDeleteCourse, useUpdateCourse } from '@/lib/hooks/useCourses'

const STATUS_BADGE: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Szkic', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400' },
  PUBLISHED: { label: 'Opublikowany', color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' },
  ARCHIVED: { label: 'Zarchiwizowany', color: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' },
}

export default function AdminCoursesPage() {
  const [communitySlug, setCommunitySlug] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  const { data: communities, isLoading: commLoading } = useQuery<CommunityItem[]>({
    queryKey: ['communities'],
    queryFn: () => communitiesApi.list(),
  })

  // Auto-select first community
  useEffect(() => {
    if (communities && communities.length > 0 && !communitySlug) {
      setCommunitySlug(communities[0]!.slug)
    }
  }, [communities, communitySlug])

  const { data: coursesData, isLoading: coursesLoading } = useCourses(communitySlug, {
    status: statusFilter || undefined,
    limit: 50,
  })

  const deleteMutation = useDeleteCourse(communitySlug)
  const updateMutation = useUpdateCourse(communitySlug)

  const handleDelete = (courseId: string, title: string) => {
    if (!confirm(`Czy na pewno chcesz usunąć kurs "${title}"? Ta akcja jest nieodwracalna.`)) return
    deleteMutation.mutate(courseId, {
      onSuccess: () => toast.success('Kurs usunięty'),
      onError: () => toast.error('Błąd usuwania kursu'),
    })
  }

  const handleToggleStatus = (courseId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED'
    updateMutation.mutate(
      { courseId, data: { status: newStatus as 'DRAFT' | 'PUBLISHED' } },
      {
        onSuccess: () => toast.success(newStatus === 'PUBLISHED' ? 'Kurs opublikowany' : 'Kurs cofnięty do szkicu'),
        onError: () => toast.error('Błąd zmiany statusu'),
      },
    )
  }

  const courses = coursesData?.data ?? []

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Kursy</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Zarządzaj kursami i materiałami edukacyjnymi
          </p>
        </div>
        {communitySlug && (
          <Link
            href={`/admin/courses/new?community=${communitySlug}`}
            className="inline-flex items-center gap-2 h-10 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
          >
            <Icon icon="solar:add-circle-bold" width={18} height={18} />
            Nowy kurs
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Community selector */}
        <select
          value={communitySlug}
          onChange={(e) => setCommunitySlug(e.target.value)}
          className="h-9 px-3 pr-8 text-sm rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        >
          {commLoading && <option>Ładowanie...</option>}
          {communities?.map((c) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>

        {/* Status filter */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-dark-surface rounded-lg p-1">
          {[
            { value: '', label: 'Wszystkie' },
            { value: 'DRAFT', label: 'Szkice' },
            { value: 'PUBLISHED', label: 'Opublikowane' },
            { value: 'ARCHIVED', label: 'Archiwum' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                statusFilter === tab.value
                  ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Courses table */}
      {coursesLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-slate-100 dark:bg-dark-surface rounded-xl animate-pulse" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-dark-surface rounded-xl border border-slate-200 dark:border-dark-border">
          <Icon icon="solar:notebook-bold-duotone" width={48} height={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">Brak kursów</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Stwórz swój pierwszy kurs dla tej społeczności</p>
          {communitySlug && (
            <Link
              href={`/admin/courses/new?community=${communitySlug}`}
              className="inline-flex items-center gap-2 h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              <Icon icon="solar:add-circle-bold" width={16} height={16} />
              Utwórz kurs
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {courses.map((course) => {
            const badge = (STATUS_BADGE[course.status] ?? STATUS_BADGE['DRAFT'])!
            return (
              <div
                key={course.id}
                className="flex items-center gap-4 p-4 bg-white dark:bg-dark-surface rounded-xl border border-slate-200 dark:border-dark-border hover:shadow-md transition-shadow"
              >
                {/* Cover image */}
                <div className="w-20 h-14 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-700 shrink-0">
                  {course.coverUrl ? (
                    <img src={course.coverUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Icon icon="solar:notebook-bold-duotone" width={24} height={24} className="text-slate-400" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Link
                      href={`/admin/courses/${course.id}?community=${communitySlug}`}
                      className="text-sm font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 truncate transition-colors"
                    >
                      {course.title}
                    </Link>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Icon icon="solar:layers-minimalistic-linear" width={14} height={14} />
                      {course.modules?.length ?? 0} modułów
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon icon="solar:users-group-rounded-linear" width={14} height={14} />
                      {course.enrollmentsCount ?? 0} uczniów
                    </span>
                    <span>
                      {course.isFree ? 'Darmowy' : `${course.price ?? 0} ${course.currency}`}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleToggleStatus(course.id, course.status)}
                    title={course.status === 'PUBLISHED' ? 'Cofnij do szkicu' : 'Opublikuj'}
                    className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                  >
                    <Icon
                      icon={course.status === 'PUBLISHED' ? 'solar:eye-closed-linear' : 'solar:eye-linear'}
                      width={18}
                      height={18}
                    />
                  </button>
                  <Link
                    href={`/admin/courses/${course.id}?community=${communitySlug}`}
                    className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-dark-hover transition-colors"
                  >
                    <Icon icon="solar:pen-2-linear" width={18} height={18} />
                  </Link>
                  <button
                    onClick={() => handleDelete(course.id, course.title)}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  >
                    <Icon icon="solar:trash-bin-trash-linear" width={18} height={18} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
