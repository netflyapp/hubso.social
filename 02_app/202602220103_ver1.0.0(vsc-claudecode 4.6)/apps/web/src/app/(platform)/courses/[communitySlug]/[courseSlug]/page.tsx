'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Icon } from '@iconify/react'
import { toast } from 'sonner'
import { useCourse, useEnroll } from '@/lib/hooks/useCourses'
import { useAuthStore } from '@/stores/useAuthStore'

export default function CourseDetailPage() {
  const params = useParams<{ communitySlug: string; courseSlug: string }>()
  const router = useRouter()
  const communitySlug = params?.communitySlug ?? ''
  const courseSlug = params?.courseSlug ?? ''
  const user = useAuthStore((s) => s.user)

  const { data: course, isLoading, error } = useCourse(communitySlug, courseSlug)
  const enrollMutation = useEnroll(communitySlug)

  const isEnrolled = !!course?.enrollment
  const totalLessons = course?.modules?.reduce(
    (sum, m) => sum + (m.lessons?.length ?? 0),
    0,
  ) ?? 0

  function handleEnroll() {
    if (!course) return
    enrollMutation.mutate(course.id, {
      onSuccess: () => {
        toast.success('Zapisano na kurs!')
        router.push(`/courses/${communitySlug}/${courseSlug}/learn`)
      },
      onError: () => {
        toast.error('Nie udało się zapisać na kurs')
      },
    })
  }

  if (isLoading) {
    return (
      <main className="flex-1 overflow-y-auto p-4 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
          <div className="h-40 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
        </div>
      </main>
    )
  }

  if (error || !course) {
    return (
      <main className="flex-1 overflow-y-auto p-4 lg:p-8">
        <div className="max-w-4xl mx-auto text-center py-20">
          <Icon icon="solar:notebook-bold-duotone" width={48} height={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h2 className="text-lg font-bold text-slate-700 dark:text-slate-300">Kurs nie został znaleziony</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Sprawdź czy link jest poprawny lub wróć do listy kursów
          </p>
          <Link
            href="/courses"
            className="mt-4 inline-flex items-center gap-2 h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Wróć do kursów
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 overflow-y-auto">
      {/* Hero / Cover */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/3" />
        </div>
        {course.coverUrl && (
          <div className="absolute inset-0">
            <img src={course.coverUrl} alt="" className="w-full h-full object-cover opacity-20" />
          </div>
        )}
        <div className="relative max-w-4xl mx-auto px-4 lg:px-8 py-10 lg:py-16">
          <Link
            href="/courses"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/70 hover:text-white transition-colors mb-4"
          >
            <Icon icon="solar:arrow-left-linear" width={14} height={14} />
            Wróć do kursów
          </Link>

          <h1 className="text-2xl lg:text-3xl font-extrabold text-white leading-tight">
            {course.title}
          </h1>
          {course.description && (
            <p className="text-sm lg:text-base text-indigo-100/80 mt-3 max-w-2xl leading-relaxed">
              {course.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 mt-6 text-xs text-indigo-200">
            <span className="flex items-center gap-1.5">
              <Icon icon="solar:layers-minimalistic-bold" width={14} height={14} />
              {course.modules?.length} modułów
            </span>
            <span className="flex items-center gap-1.5">
              <Icon icon="solar:video-frame-play-horizontal-bold" width={14} height={14} />
              {totalLessons} lekcji
            </span>
            <span className="flex items-center gap-1.5">
              <Icon icon="solar:users-group-rounded-bold" width={14} height={14} />
              {course.enrollmentsCount ?? 0} uczestników
            </span>
            {course.accessType !== 'PUBLIC' && (
              <span className="flex items-center gap-1.5 px-2 py-0.5 bg-white/10 rounded-full">
                <Icon icon="solar:lock-bold" width={12} height={12} />
                {course.accessType === 'MEMBERS_ONLY' ? 'Tylko członkowie' : 'Prywatny'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 mt-8">
            {isEnrolled ? (
              <Link
                href={`/courses/${communitySlug}/${courseSlug}/learn`}
                className="h-11 px-6 bg-white hover:bg-indigo-50 text-indigo-700 text-sm font-bold rounded-xl transition-colors inline-flex items-center gap-2 shadow-sm"
              >
                <Icon icon="solar:play-bold" width={16} height={16} />
                Kontynuuj naukę
              </Link>
            ) : (
              <button
                onClick={handleEnroll}
                disabled={enrollMutation.isPending}
                className="h-11 px-6 bg-white hover:bg-indigo-50 text-indigo-700 text-sm font-bold rounded-xl transition-colors inline-flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                {enrollMutation.isPending ? (
                  <>
                    <Icon icon="solar:spinner-bold" width={16} height={16} className="animate-spin" />
                    Zapisywanie…
                  </>
                ) : (
                  <>
                    <Icon icon="solar:arrow-right-bold" width={16} height={16} />
                    {course.isFree ? 'Zapisz się za darmo' : `Zapisz się – ${course.price} ${course.currency}`}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-4xl mx-auto px-4 lg:px-8 py-8 space-y-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Program kursu
        </h2>

        {course.modules && course.modules.length > 0 ? (
          <div className="space-y-3">
            {course.modules
              .sort((a, b) => a.position - b.position)
              .map((mod, modIdx) => (
                <ModuleAccordion
                  key={mod.id}
                  module={mod}
                  index={modIdx + 1}
                  isEnrolled={isEnrolled}
                  communitySlug={communitySlug}
                  courseSlug={courseSlug}
                />
              ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-50 dark:bg-dark-surface rounded-xl border border-slate-200 dark:border-dark-border">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Ten kurs nie ma jeszcze opublikowanych modułów
            </p>
          </div>
        )}
      </div>
    </main>
  )
}

// ─── Module Accordion ─────────────────────────────────

import { useState } from 'react'
import type { CourseModule as CourseModuleType } from '@/lib/api'

function ModuleAccordion({
  module: mod,
  index,
  isEnrolled,
  communitySlug,
  courseSlug,
}: {
  module: CourseModuleType
  index: number
  isEnrolled: boolean
  communitySlug: string
  courseSlug: string
}) {
  const [open, setOpen] = useState(index === 1)

  const lessons = (mod.lessons ?? []).sort((a, b) => a.position - b.position)

  return (
    <div className="bg-white dark:bg-dark-surface rounded-xl border border-slate-200 dark:border-dark-border overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center">
            {index}
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
              {mod.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {lessons.length} lekcji
            </p>
          </div>
        </div>
        <Icon
          icon="solar:alt-arrow-down-linear"
          width={16}
          height={16}
          className={`text-slate-400 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && lessons.length > 0 && (
        <div className="border-t border-slate-100 dark:border-dark-border">
          {lessons.map((lesson, lIdx) => (
            <div
              key={lesson.id}
              className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
            >
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[10px] font-bold flex items-center justify-center">
                {lIdx + 1}
              </span>
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Icon
                  icon={lesson.videoUrl ? 'solar:video-frame-play-horizontal-linear' : 'solar:document-text-linear'}
                  width={14}
                  height={14}
                  className="text-slate-400 flex-shrink-0"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300 truncate">
                  {lesson.title}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {lesson.isFree && (
                  <span className="text-[10px] font-bold text-green-600 dark:text-green-400 px-1.5 py-0.5 bg-green-50 dark:bg-green-500/10 rounded">
                    Darmowa
                  </span>
                )}
                {!isEnrolled && !lesson.isFree && (
                  <Icon icon="solar:lock-linear" width={14} height={14} className="text-slate-400" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
