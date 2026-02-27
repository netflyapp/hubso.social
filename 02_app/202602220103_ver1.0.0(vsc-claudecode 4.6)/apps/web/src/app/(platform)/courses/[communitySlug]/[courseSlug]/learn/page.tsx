'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import nextDynamic from 'next/dynamic'
import { Icon } from '@iconify/react'
import { toast } from 'sonner'
import {
  useCourse,
  useCourseProgress,
  useMarkLessonComplete,
} from '@/lib/hooks/useCourses'
import type { CourseModule as CourseModuleType, Lesson, LessonProgress } from '@/lib/api'

const TiptapRenderer = nextDynamic(
  () => import('@/components/editor/TiptapEditor').then((m) => m.TiptapRenderer),
  { ssr: false, loading: () => <div className="h-32 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg" /> },
)

export default function CourseLearnPage() {
  const params = useParams<{ communitySlug: string; courseSlug: string }>()
  const router = useRouter()
  const communitySlug = params?.communitySlug ?? ''
  const courseSlug = params?.courseSlug ?? ''

  const { data: course, isLoading } = useCourse(communitySlug, courseSlug)
  const courseId = course?.id ?? ''

  const { data: progressData } = useCourseProgress(communitySlug, courseId)
  const markComplete = useMarkLessonComplete(communitySlug)

  const [activeLessonId, setActiveLessonId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Flatten all lessons sorted by module position → lesson position
  const allLessons = useMemo(() => {
    if (!course?.modules) return [] as (Lesson & { moduleTitle: string; moduleId: string })[]
    return course.modules
      .sort((a, b) => a.position - b.position)
      .flatMap((mod) =>
        (mod.lessons ?? [])
          .sort((a, b) => a.position - b.position)
          .map((lesson) => ({ ...lesson, moduleTitle: mod.title, moduleId: mod.id })),
      ) as (Lesson & { moduleTitle: string; moduleId: string })[]
  }, [course])

  // Progress map: lessonId → LessonProgress
  const progressMap = useMemo(() => {
    const map = new Map<string, LessonProgress>()
    if (progressData && Array.isArray(progressData)) {
      for (const lp of progressData) {
        map.set(lp.lessonId, lp)
      }
    }
    return map
  }, [progressData])

  // Set first lesson as active on load
  useEffect(() => {
    if (!activeLessonId && allLessons.length > 0) {
      // Find first incomplete lesson or default to first
      const firstIncomplete = allLessons.find(
        (l) => !progressMap.get(l.id)?.completed,
      )
      setActiveLessonId(firstIncomplete?.id ?? allLessons[0]!.id)
    }
  }, [allLessons, activeLessonId, progressMap])

  const activeLesson = allLessons.find((l) => l.id === activeLessonId)
  const activeLessonIdx = allLessons.findIndex((l) => l.id === activeLessonId)
  const prevLesson = activeLessonIdx > 0 ? allLessons[activeLessonIdx - 1] : null
  const nextLesson =
    activeLessonIdx >= 0 && activeLessonIdx < allLessons.length - 1
      ? allLessons[activeLessonIdx + 1]
      : null

  const isLessonComplete = activeLesson
    ? progressMap.get(activeLesson.id)?.completed ?? false
    : false

  const completedCount = allLessons.filter(
    (l) => progressMap.get(l.id)?.completed,
  ).length
  const overallProgress =
    allLessons.length > 0 ? Math.round((completedCount / allLessons.length) * 100) : 0

  const handleMarkComplete = useCallback(() => {
    if (!activeLesson || isLessonComplete) return
    markComplete.mutate(activeLesson.id, {
      onSuccess: () => {
        toast.success('Lekcja ukończona!')
        // Auto-advance to next lesson
        if (nextLesson) {
          setActiveLessonId(nextLesson.id)
        }
      },
      onError: () => {
        toast.error('Nie udało się oznaczyć lekcji')
      },
    })
  }, [activeLesson, isLessonComplete, markComplete, nextLesson])

  if (isLoading) {
    return (
      <main className="flex-1 flex">
        <div className="flex-1 flex items-center justify-center">
          <Icon icon="solar:spinner-bold" width={32} height={32} className="animate-spin text-indigo-500" />
        </div>
      </main>
    )
  }

  if (!course) {
    return (
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-lg font-bold text-slate-700 dark:text-slate-300">
            Kurs nie został znaleziony
          </h2>
          <Link
            href="/courses"
            className="mt-4 inline-flex items-center gap-2 h-9 px-4 bg-indigo-600 text-white text-sm font-semibold rounded-lg"
          >
            Wróć do kursów
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 flex overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`flex-shrink-0 bg-white dark:bg-dark-surface border-r border-slate-200 dark:border-dark-border overflow-y-auto transition-all duration-200 ${
          sidebarOpen ? 'w-80' : 'w-0'
        }`}
      >
        {sidebarOpen && (
          <div className="flex flex-col h-full">
            {/* Course header */}
            <div className="p-4 border-b border-slate-100 dark:border-dark-border">
              <Link
                href={`/courses/${communitySlug}/${courseSlug}`}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1 mb-2"
              >
                <Icon icon="solar:arrow-left-linear" width={12} height={12} />
                Wróć do kursu
              </Link>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
                {course.title}
              </h2>
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {overallProgress}% ukończono
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {completedCount}/{allLessons.length}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all"
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Module list */}
            <div className="flex-1 overflow-y-auto py-2">
              {course.modules
                ?.sort((a, b) => a.position - b.position)
                .map((mod) => (
                  <SidebarModule
                    key={mod.id}
                    module={mod}
                    activeLessonId={activeLessonId}
                    progressMap={progressMap}
                    onSelectLesson={setActiveLessonId}
                  />
                ))}
            </div>
          </div>
        )}
      </aside>

      {/* Toggle sidebar button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="flex-shrink-0 w-6 flex items-center justify-center bg-slate-50 dark:bg-dark-surface border-r border-slate-200 dark:border-dark-border hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        title={sidebarOpen ? 'Schowaj spis treści' : 'Pokaż spis treści'}
      >
        <Icon
          icon={sidebarOpen ? 'solar:alt-arrow-left-linear' : 'solar:alt-arrow-right-linear'}
          width={14}
          height={14}
          className="text-slate-400"
        />
      </button>

      {/* Main lesson content */}
      <div className="flex-1 overflow-y-auto">
        {activeLesson ? (
          <div className="max-w-4xl mx-auto">
            {/* Video player */}
            {activeLesson.videoUrl && (
              <div className="bg-black aspect-video">
                <video
                  key={activeLesson.id}
                  src={activeLesson.videoUrl}
                  controls
                  className="w-full h-full"
                  playsInline
                />
              </div>
            )}

            {/* Lesson content */}
            <div className="p-6 lg:p-8 space-y-6">
              {/* Lesson header */}
              <div>
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                  {activeLesson.moduleTitle}
                </span>
                <h1 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {activeLesson.title}
                </h1>
                {activeLesson.description && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                    {activeLesson.description}
                  </p>
                )}
              </div>

              {/* Rich text content */}
              {activeLesson.content != null ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <TiptapRenderer content={activeLesson.content} />
                </div>
              ) : null}

              {/* Bottom controls */}
              <div className="flex items-center justify-between border-t border-slate-200 dark:border-dark-border pt-6 mt-8">
                <div>
                  {prevLesson && (
                    <button
                      onClick={() => setActiveLessonId(prevLesson.id)}
                      className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      <Icon icon="solar:arrow-left-linear" width={16} height={16} />
                      Poprzednia lekcja
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {!isLessonComplete ? (
                    <button
                      onClick={handleMarkComplete}
                      disabled={markComplete.isPending}
                      className="h-10 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors inline-flex items-center gap-2 disabled:opacity-50"
                    >
                      {markComplete.isPending ? (
                        <Icon icon="solar:spinner-bold" width={16} height={16} className="animate-spin" />
                      ) : (
                        <Icon icon="solar:check-circle-bold" width={16} height={16} />
                      )}
                      Oznacz jako ukończone
                    </button>
                  ) : (
                    <span className="h-10 px-5 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 text-sm font-semibold rounded-lg inline-flex items-center gap-2">
                      <Icon icon="solar:check-circle-bold" width={16} height={16} />
                      Ukończone
                    </span>
                  )}

                  {nextLesson && (
                    <button
                      onClick={() => setActiveLessonId(nextLesson.id)}
                      className="h-10 px-5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-lg transition-colors inline-flex items-center gap-2"
                    >
                      Następna lekcja
                      <Icon icon="solar:arrow-right-linear" width={16} height={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-center p-8">
            <div>
              <Icon icon="solar:notebook-bold-duotone" width={48} height={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">
                Wybierz lekcję
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Wybierz lekcję z panelu po lewej stronie
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

// ─── Sidebar Module Component ─────────────────────────

function SidebarModule({
  module: mod,
  activeLessonId,
  progressMap,
  onSelectLesson,
}: {
  module: CourseModuleType
  activeLessonId: string | null
  progressMap: Map<string, LessonProgress>
  onSelectLesson: (id: string) => void
}) {
  const [open, setOpen] = useState(true)
  const lessons = (mod.lessons ?? []).sort((a, b) => a.position - b.position)

  const completedInModule = lessons.filter(
    (l) => progressMap.get(l.id)?.completed,
  ).length

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <div className="min-w-0">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide truncate">
            {mod.title}
          </h4>
          <span className="text-[10px] text-slate-400 mt-0.5">
            {completedInModule}/{lessons.length} ukończonych
          </span>
        </div>
        <Icon
          icon="solar:alt-arrow-down-linear"
          width={14}
          height={14}
          className={`text-slate-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="pb-1">
          {lessons.map((lesson, idx) => {
            const isActive = lesson.id === activeLessonId
            const isComplete = progressMap.get(lesson.id)?.completed ?? false

            return (
              <button
                key={lesson.id}
                onClick={() => onSelectLesson(lesson.id)}
                className={`w-full flex items-center gap-2.5 px-4 py-2 text-left transition-colors ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-500/10 border-l-2 border-indigo-600'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/30 border-l-2 border-transparent'
                }`}
              >
                {/* Status icon */}
                <div className="flex-shrink-0">
                  {isComplete ? (
                    <Icon
                      icon="solar:check-circle-bold"
                      width={16}
                      height={16}
                      className="text-green-500"
                    />
                  ) : isActive ? (
                    <Icon
                      icon="solar:play-circle-bold"
                      width={16}
                      height={16}
                      className="text-indigo-600 dark:text-indigo-400"
                    />
                  ) : (
                    <span className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center text-[8px] font-bold text-slate-400">
                      {idx + 1}
                    </span>
                  )}
                </div>

                {/* Lesson info */}
                <div className="min-w-0 flex-1">
                  <span
                    className={`text-xs truncate block ${
                      isActive
                        ? 'font-semibold text-indigo-700 dark:text-indigo-300'
                        : isComplete
                          ? 'text-slate-500 dark:text-slate-400 line-through'
                          : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {lesson.title}
                  </span>
                </div>

                {/* Type icon */}
                <Icon
                  icon={
                    lesson.videoUrl
                      ? 'solar:video-frame-play-horizontal-linear'
                      : 'solar:document-text-linear'
                  }
                  width={12}
                  height={12}
                  className="flex-shrink-0 text-slate-400"
                />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
