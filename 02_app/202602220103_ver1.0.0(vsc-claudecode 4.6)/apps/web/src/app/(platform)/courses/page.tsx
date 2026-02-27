'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Icon } from '@iconify/react'
import { communitiesApi, type CommunityItem, type Course, type Enrollment } from '@/lib/api'
import { useCourses, useMyEnrollments } from '@/lib/hooks/useCourses'
import { useAuthStore } from '@/stores/useAuthStore'

type Tab = 'enrolled' | 'browse'

export default function CoursesPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [activeTab, setActiveTab] = useState<Tab>('enrolled')
  const [communitySlug, setCommunitySlug] = useState('')

  // Fetch communities for browse tab
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

  // My enrollments
  const { data: enrollmentsData, isLoading: enrollLoading } = useMyEnrollments({
    status: 'ACTIVE',
    limit: 50,
  })

  // Browse courses from selected community
  const { data: coursesData, isLoading: coursesLoading } = useCourses(communitySlug, {
    status: 'PUBLISHED',
    limit: 50,
  })

  const enrollments = enrollmentsData?.data ?? []
  const browseCourses = coursesData?.data ?? []

  return (
    <main className="flex-1 overflow-y-auto p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Kursy i materiały
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Ucz się z najlepszymi materiałami przygotowanymi specjalnie dla członków
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-dark-surface rounded-lg p-1 w-fit">
          <button
            onClick={() => setActiveTab('enrolled')}
            className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors ${
              activeTab === 'enrolled'
                ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
            }`}
          >
            Moje kursy
          </button>
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors ${
              activeTab === 'browse'
                ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
            }`}
          >
            Przeglądaj
          </button>
        </div>

        {/* My Courses tab */}
        {activeTab === 'enrolled' && (
          <>
            {enrollLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-64 bg-slate-100 dark:bg-dark-surface rounded-xl animate-pulse" />
                ))}
              </div>
            ) : enrollments.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-dark-surface rounded-xl border border-slate-200 dark:border-dark-border">
                <Icon icon="solar:notebook-bold-duotone" width={48} height={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nie jesteś zapisany na żaden kurs
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  Przeglądaj dostępne kursy i zacznij naukę
                </p>
                <button
                  onClick={() => setActiveTab('browse')}
                  className="inline-flex items-center gap-2 h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  Przeglądaj kursy
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {enrollments.map((enrollment) => (
                  <EnrolledCourseCard key={enrollment.id} enrollment={enrollment} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Browse tab */}
        {activeTab === 'browse' && (
          <div className="space-y-4">
            {/* Community selector */}
            {communities && communities.length > 1 && (
              <select
                value={communitySlug}
                onChange={(e) => setCommunitySlug(e.target.value)}
                className="h-9 px-3 pr-8 text-sm rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {communities.map((c) => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            )}

            {coursesLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-64 bg-slate-100 dark:bg-dark-surface rounded-xl animate-pulse" />
                ))}
              </div>
            ) : browseCourses.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-dark-surface rounded-xl border border-slate-200 dark:border-dark-border">
                <Icon icon="solar:notebook-bold-duotone" width={48} height={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                  Brak dostępnych kursów
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  W tej społeczności nie ma jeszcze opublikowanych kursów
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {browseCourses.map((course) => (
                  <BrowseCourseCard
                    key={course.id}
                    course={course}
                    communitySlug={communitySlug}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}

// ─── Enrolled Course Card ──────────────────────────────

function EnrolledCourseCard({ enrollment }: { enrollment: Enrollment }) {
  const course = enrollment.course
  if (!course) return null

  // Derive communitySlug from the course's community relation if available
  const slug = (course as any).community?.slug ?? ''

  return (
    <Link
      href={`/courses/${slug}/${course.slug}/learn`}
      className="bg-white dark:bg-dark-surface rounded-xl shadow-card dark:shadow-dark-card border border-transparent dark:border-dark-border overflow-hidden hover:shadow-lg transition-shadow group block"
    >
      {/* Cover */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-slate-700 dark:to-slate-800">
        {course.coverUrl ? (
          <img src={course.coverUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon icon="solar:notebook-bold-duotone" width={40} height={40} className="text-indigo-300 dark:text-slate-600" />
          </div>
        )}
        {enrollment.status === 'COMPLETED' && (
          <div className="absolute top-3 right-3 px-2 py-1 bg-green-500 text-white text-[10px] font-bold rounded">
            Ukończony
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-2">
          {course.title}
        </h3>

        {/* Progress bar */}
        <div className="mt-3 mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              {Math.round(enrollment.progress)}%
            </span>
            <span className="text-[10px] text-slate-400">
              {enrollment.status === 'COMPLETED' ? 'Ukończono' : 'W trakcie'}
            </span>
          </div>
          <div className="w-full h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                enrollment.status === 'COMPLETED' ? 'bg-green-500' : 'bg-indigo-600'
              }`}
              style={{ width: `${enrollment.progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {course.modules?.length ?? 0} modułów
          </div>
          <span className="h-8 px-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-semibold flex items-center hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors">
            Kontynuuj
          </span>
        </div>
      </div>
    </Link>
  )
}

// ─── Browse Course Card ────────────────────────────────

function BrowseCourseCard({ course, communitySlug }: { course: Course; communitySlug: string }) {
  return (
    <Link
      href={`/courses/${communitySlug}/${course.slug}`}
      className="bg-white dark:bg-dark-surface rounded-xl shadow-card dark:shadow-dark-card border border-transparent dark:border-dark-border overflow-hidden hover:shadow-lg transition-shadow group block"
    >
      {/* Cover */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800">
        {course.coverUrl ? (
          <img src={course.coverUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon icon="solar:notebook-bold-duotone" width={40} height={40} className="text-slate-400 dark:text-slate-600" />
          </div>
        )}
        {!course.isFree && (
          <div className="absolute top-3 right-3 px-2 py-1 bg-amber-500 text-white text-[10px] font-bold rounded">
            Premium
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-2">
          {course.title}
        </h3>
        {course.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
            {course.description}
          </p>
        )}

        <div className="flex items-center gap-3 mt-3 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Icon icon="solar:layers-minimalistic-linear" width={14} height={14} />
            {course.modules?.length ?? 0} modułów
          </span>
          <span className="flex items-center gap-1">
            <Icon icon="solar:users-group-rounded-linear" width={14} height={14} />
            {course.enrollmentsCount ?? 0}
          </span>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {course.isFree ? 'Darmowy' : `${course.price ?? 0} ${course.currency}`}
          </div>
          <span className="h-8 px-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-semibold flex items-center">
            Przeglądaj
          </span>
        </div>
      </div>
    </Link>
  )
}
