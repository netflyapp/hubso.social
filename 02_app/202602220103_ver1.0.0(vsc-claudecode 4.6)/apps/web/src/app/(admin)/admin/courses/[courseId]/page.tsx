'use client'

export const dynamic = 'force-dynamic'

import { Suspense, useState, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Icon } from '@iconify/react'
import { toast } from 'sonner'
import { coursesApi, type Course, type CourseModule as CourseModuleType, type Lesson } from '@/lib/api'
import {
  useUpdateCourse,
  useCreateModule,
  useUpdateModule,
  useDeleteModule,
  useCreateLesson,
  useUpdateLesson,
  useDeleteLesson,
} from '@/lib/hooks/useCourses'

// ─── Module Editor ─────────────────────────────────────
function ModuleCard({
  mod,
  communitySlug,
  onRefetch,
}: {
  mod: CourseModuleType
  communitySlug: string
  onRefetch: () => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(mod.title)
  const [description, setDescription] = useState(mod.description ?? '')
  const [showAddLesson, setShowAddLesson] = useState(false)
  const [newLessonTitle, setNewLessonTitle] = useState('')

  const updateModule = useUpdateModule(communitySlug)
  const deleteModule = useDeleteModule(communitySlug)
  const createLesson = useCreateLesson(communitySlug)
  const deleteLesson = useDeleteLesson(communitySlug)
  const updateLesson = useUpdateLesson(communitySlug)

  const handleSaveModule = () => {
    updateModule.mutate(
      { moduleId: mod.id, data: { title, description: description || undefined } },
      {
        onSuccess: () => { setIsEditing(false); toast.success('Moduł zaktualizowany'); onRefetch() },
        onError: () => toast.error('Błąd aktualizacji modułu'),
      },
    )
  }

  const handleDeleteModule = () => {
    if (!confirm(`Usunąć moduł "${mod.title}" i wszystkie jego lekcje?`)) return
    deleteModule.mutate(mod.id, {
      onSuccess: () => { toast.success('Moduł usunięty'); onRefetch() },
      onError: () => toast.error('Błąd usuwania modułu'),
    })
  }

  const handleAddLesson = () => {
    if (!newLessonTitle.trim()) return
    createLesson.mutate(
      { moduleId: mod.id, data: { title: newLessonTitle.trim() } },
      {
        onSuccess: () => { setNewLessonTitle(''); setShowAddLesson(false); toast.success('Lekcja dodana'); onRefetch() },
        onError: () => toast.error('Błąd dodawania lekcji'),
      },
    )
  }

  const handleDeleteLesson = (lessonId: string, lessonTitle: string) => {
    if (!confirm(`Usunąć lekcję "${lessonTitle}"?`)) return
    deleteLesson.mutate(lessonId, {
      onSuccess: () => { toast.success('Lekcja usunięta'); onRefetch() },
      onError: () => toast.error('Błąd usuwania lekcji'),
    })
  }

  const handleToggleFree = (lesson: Lesson) => {
    updateLesson.mutate(
      { lessonId: lesson.id, data: { isFree: !lesson.isFree } },
      {
        onSuccess: () => { toast.success(lesson.isFree ? 'Lekcja zamknięta' : 'Lekcja otwarta'); onRefetch() },
      },
    )
  }

  return (
    <div className="bg-white dark:bg-dark-surface rounded-xl border border-slate-200 dark:border-dark-border overflow-hidden">
      {/* Module header */}
      <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-dark-border">
        <Icon icon="solar:hamburger-menu-linear" width={16} height={16} className="text-slate-400 cursor-grab" />
        
        {isEditing ? (
          <div className="flex-1 space-y-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-9 px-3 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Opis modułu (opcjonalny)"
              className="w-full h-9 px-3 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg text-xs text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex items-center gap-2">
              <button onClick={handleSaveModule} className="h-8 px-3 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                Zapisz
              </button>
              <button onClick={() => { setIsEditing(false); setTitle(mod.title); setDescription(mod.description ?? '') }} className="h-8 px-3 text-xs text-slate-500 hover:text-slate-700 transition-colors">
                Anuluj
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Moduł {mod.position + 1}: {mod.title}
              </h3>
              {mod.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{mod.description}</p>
              )}
            </div>
            <span className="text-xs text-slate-400">{mod.lessons?.length ?? 0} lekcji</span>
            <button onClick={() => setIsEditing(true)} className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-dark-hover transition-colors">
              <Icon icon="solar:pen-2-linear" width={14} height={14} />
            </button>
            <button onClick={handleDeleteModule} className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
              <Icon icon="solar:trash-bin-trash-linear" width={14} height={14} />
            </button>
          </>
        )}
      </div>

      {/* Lessons list */}
      <div className="divide-y divide-slate-100 dark:divide-dark-border">
        {(mod.lessons ?? [])
          .sort((a, b) => a.position - b.position)
          .map((lesson, idx) => (
          <div key={lesson.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-dark-hover transition-colors group">
            <Icon icon="solar:hamburger-menu-linear" width={14} height={14} className="text-slate-300 cursor-grab shrink-0" />
            <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500 shrink-0">
              {idx + 1}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm text-slate-700 dark:text-slate-200 truncate block">{lesson.title}</span>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {lesson.videoUrl && (
                <span title="Ma wideo"><Icon icon="solar:videocamera-record-linear" width={14} height={14} className="text-blue-500" /></span>
              )}
              <button
                onClick={() => handleToggleFree(lesson)}
                className={`px-2 py-0.5 text-[10px] font-bold rounded-full transition-colors ${
                  lesson.isFree
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                    : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                }`}
              >
                {lesson.isFree ? 'FREE' : 'LOCKED'}
              </button>
              <Link
                href={`/admin/courses/lesson/${lesson.id}?community=${communitySlug}`}
                className="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
              >
                <Icon icon="solar:pen-2-linear" width={14} height={14} />
              </Link>
              <button
                onClick={() => handleDeleteLesson(lesson.id, lesson.title)}
                className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
              >
                <Icon icon="solar:trash-bin-trash-linear" width={14} height={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add lesson */}
      <div className="p-3 border-t border-slate-100 dark:border-dark-border">
        {showAddLesson ? (
          <div className="flex items-center gap-2">
            <input
              value={newLessonTitle}
              onChange={(e) => setNewLessonTitle(e.target.value)}
              placeholder="Tytuł lekcji"
              onKeyDown={(e) => e.key === 'Enter' && handleAddLesson()}
              autoFocus
              className="flex-1 h-9 px-3 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleAddLesson}
              disabled={createLesson.isPending}
              className="h-9 px-4 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              Dodaj
            </button>
            <button
              onClick={() => { setShowAddLesson(false); setNewLessonTitle('') }}
              className="h-9 px-2 text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              Anuluj
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAddLesson(true)}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
          >
            <Icon icon="solar:add-circle-linear" width={16} height={16} />
            Dodaj lekcję
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Main Course Editor Page ─────────────────────────

export default function CourseEditorPage({
  params: paramsPromise,
}: {
  params: Promise<{ courseId: string }>
}) {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center"><Icon icon="solar:spinner-bold" width={24} height={24} className="animate-spin text-indigo-500" /></div>}>
      <CourseEditorPageInner params={paramsPromise} />
    </Suspense>
  )
}

function CourseEditorPageInner({
  params: paramsPromise,
}: {
  params: Promise<{ courseId: string }>
}) {
  const params = use(paramsPromise)
  const router = useRouter()
  const searchParams = useSearchParams()
  const communitySlug = searchParams?.get('community') ?? ''
  const courseId = params.courseId

  const [activeTab, setActiveTab] = useState<'content' | 'settings'>('content')
  const [showAddModule, setShowAddModule] = useState(false)
  const [newModuleTitle, setNewModuleTitle] = useState('')

  // Fetch course by ID — we use a direct query since we have courseId not slug
  const { data: course, isLoading, refetch } = useQuery<Course>({
    queryKey: ['course-edit', courseId],
    queryFn: async () => {
      // We list courses and find the one matching — or fetch by slug
      // Since the backend returns course details by slug, we'll use an alternative approach:
      // Fetch all courses and find by ID
      const result = await coursesApi.list(communitySlug, { limit: 100 })
      const found = result.data.find((c) => c.id === courseId)
      if (!found) throw new Error('Kurs nie znaleziony')
      // Now fetch full details by slug
      return coursesApi.get(communitySlug, found.slug)
    },
    enabled: !!communitySlug && !!courseId,
  })

  // Settings state
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editIsFree, setEditIsFree] = useState(true)
  const [editPrice, setEditPrice] = useState('')
  const [editCurrency, setEditCurrency] = useState('PLN')
  const [editAccessType, setEditAccessType] = useState<'PUBLIC' | 'MEMBERS_ONLY' | 'PRIVATE'>('PUBLIC')
  const [settingsLoaded, setSettingsLoaded] = useState(false)

  // Load settings from course data
  if (course && !settingsLoaded) {
    setEditTitle(course.title)
    setEditDescription(course.description ?? '')
    setEditIsFree(course.isFree)
    setEditPrice(course.price?.toString() ?? '')
    setEditCurrency(course.currency)
    setEditAccessType(course.accessType)
    setSettingsLoaded(true)
  }

  const updateCourse = useUpdateCourse(communitySlug)
  const createModule = useCreateModule(communitySlug)

  const handleAddModule = () => {
    if (!newModuleTitle.trim()) return
    createModule.mutate(
      { courseId, data: { title: newModuleTitle.trim() } },
      {
        onSuccess: () => { setNewModuleTitle(''); setShowAddModule(false); toast.success('Moduł dodany'); refetch() },
        onError: () => toast.error('Błąd dodawania modułu'),
      },
    )
  }

  const handleSaveSettings = () => {
    updateCourse.mutate(
      {
        courseId,
        data: {
          title: editTitle,
          description: editDescription || undefined,
          isFree: editIsFree,
          price: editIsFree ? undefined : parseFloat(editPrice) || undefined,
          currency: editCurrency,
          accessType: editAccessType,
        },
      },
      {
        onSuccess: () => { toast.success('Ustawienia zapisane'); refetch() },
        onError: () => toast.error('Błąd zapisywania ustawień'),
      },
    )
  }

  const handlePublish = () => {
    const newStatus = course?.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED'
    updateCourse.mutate(
      { courseId, data: { status: newStatus as 'DRAFT' | 'PUBLISHED' } },
      {
        onSuccess: () => {
          toast.success(newStatus === 'PUBLISHED' ? 'Kurs opublikowany!' : 'Kurs cofnięty do szkicu')
          refetch()
        },
        onError: () => toast.error('Błąd zmiany statusu'),
      },
    )
  }

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-4">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        <div className="h-64 bg-slate-100 dark:bg-dark-surface rounded-xl animate-pulse" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="p-6 lg:p-8 max-w-5xl mx-auto text-center py-16">
        <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Kurs nie znaleziony</h2>
        <Link href="/admin/courses" className="text-indigo-600 hover:underline text-sm mt-2 block">
          Powrót do listy kursów
        </Link>
      </div>
    )
  }

  const modules = (course.modules ?? []).sort((a, b) => a.position - b.position)
  const totalLessons = modules.reduce((sum, m) => sum + (m.lessons?.length ?? 0), 0)

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <Link href="/admin/courses" className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
          Kursy
        </Link>
        <Icon icon="solar:alt-arrow-right-linear" width={14} height={14} />
        <span className="text-slate-900 dark:text-white font-medium truncate max-w-[200px]">{course.title}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight truncate">
              {course.title}
            </h1>
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
              course.status === 'PUBLISHED'
                ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400'
            }`}>
              {course.status === 'PUBLISHED' ? 'Opublikowany' : 'Szkic'}
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {modules.length} modułów · {totalLessons} lekcji · {course.enrollmentsCount ?? 0} uczniów
          </p>
        </div>
        <button
          onClick={handlePublish}
          disabled={updateCourse.isPending}
          className={`h-10 px-5 text-sm font-semibold rounded-lg transition-colors shadow-sm ${
            course.status === 'PUBLISHED'
              ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {course.status === 'PUBLISHED' ? 'Cofnij do szkicu' : 'Opublikuj kurs'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 dark:bg-dark-surface rounded-lg p-1 w-fit">
        <button
          onClick={() => setActiveTab('content')}
          className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors ${
            activeTab === 'content'
              ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
          }`}
        >
          Treść
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors ${
            activeTab === 'settings'
              ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
          }`}
        >
          Ustawienia
        </button>
      </div>

      {/* Content tab */}
      {activeTab === 'content' && (
        <div className="space-y-4">
          {modules.map((mod) => (
            <ModuleCard
              key={mod.id}
              mod={mod}
              communitySlug={communitySlug}
              onRefetch={() => refetch()}
            />
          ))}

          {/* Add module */}
          {showAddModule ? (
            <div className="flex items-center gap-2 p-4 bg-white dark:bg-dark-surface rounded-xl border-2 border-dashed border-indigo-300 dark:border-indigo-600">
              <input
                value={newModuleTitle}
                onChange={(e) => setNewModuleTitle(e.target.value)}
                placeholder="Tytuł modułu"
                onKeyDown={(e) => e.key === 'Enter' && handleAddModule()}
                autoFocus
                className="flex-1 h-10 px-4 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleAddModule}
                disabled={createModule.isPending}
                className="h-10 px-5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                Dodaj moduł
              </button>
              <button
                onClick={() => { setShowAddModule(false); setNewModuleTitle('') }}
                className="h-10 px-3 text-sm text-slate-400 hover:text-slate-600 transition-colors"
              >
                Anuluj
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAddModule(true)}
              className="flex items-center justify-center gap-2 w-full py-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 text-sm text-slate-500 hover:text-indigo-600 hover:border-indigo-400 transition-colors"
            >
              <Icon icon="solar:add-circle-linear" width={20} height={20} />
              Dodaj moduł
            </button>
          )}
        </div>
      )}

      {/* Settings tab */}
      {activeTab === 'settings' && (
        <div className="bg-white dark:bg-dark-surface rounded-xl border border-slate-200 dark:border-dark-border p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Tytuł</label>
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full h-11 px-4 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Opis</label>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Dostępność</label>
              <select
                value={editAccessType}
                onChange={(e) => setEditAccessType(e.target.value as typeof editAccessType)}
                className="w-full h-11 px-4 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="PUBLIC">Publiczny</option>
                <option value="MEMBERS_ONLY">Tylko dla członków</option>
                <option value="PRIVATE">Prywatny</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Cennik</label>
              <div className="flex items-center gap-3 h-11">
                <button
                  type="button"
                  onClick={() => setEditIsFree(true)}
                  className={`flex-1 h-full rounded-lg text-sm font-medium border transition-colors ${
                    editIsFree
                      ? 'bg-green-50 border-green-300 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-400'
                      : 'bg-white dark:bg-dark-surface border-slate-200 dark:border-dark-border text-slate-500'
                  }`}
                >
                  Darmowy
                </button>
                <button
                  type="button"
                  onClick={() => setEditIsFree(false)}
                  className={`flex-1 h-full rounded-lg text-sm font-medium border transition-colors ${
                    !editIsFree
                      ? 'bg-amber-50 border-amber-300 text-amber-700 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-400'
                      : 'bg-white dark:bg-dark-surface border-slate-200 dark:border-dark-border text-slate-500'
                  }`}
                >
                  Płatny
                </button>
              </div>
            </div>
          </div>
          {!editIsFree && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Cena</label>
                <input
                  type="number"
                  step="0.01"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="w-full h-11 px-4 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Waluta</label>
                <select
                  value={editCurrency}
                  onChange={(e) => setEditCurrency(e.target.value)}
                  className="w-full h-11 px-4 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="PLN">PLN</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>
          )}
          <div className="pt-3 border-t border-slate-200 dark:border-dark-border">
            <button
              onClick={handleSaveSettings}
              disabled={updateCourse.isPending}
              className="h-10 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              {updateCourse.isPending ? 'Zapisywanie...' : 'Zapisz ustawienia'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
