'use client'

import { Suspense, useState, use, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Icon } from '@iconify/react'
import { toast } from 'sonner'
import nextDynamic from 'next/dynamic'
import { coursesApi, type Lesson } from '@/lib/api'
import { useUpdateLesson } from '@/lib/hooks/useCourses'
import { VideoUpload } from '@/components/video/video-upload'
import { SmartVideoPlayer } from '@/components/video/video-player'
import { useVideoStatus } from '@/lib/hooks/useVideo'

const TiptapEditor = nextDynamic(
  () => import('@/components/editor/TiptapEditor').then((m) => m.TiptapEditor),
  { ssr: false, loading: () => <div className="h-64 bg-slate-100 dark:bg-dark-surface rounded-lg animate-pulse" /> },
)

export default function LessonEditorPage({
  params: paramsPromise,
}: {
  params: Promise<{ lessonId: string }>
}) {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center"><Icon icon="solar:spinner-bold" width={24} height={24} className="animate-spin text-indigo-500" /></div>}>
      <LessonEditorPageInner params={paramsPromise} />
    </Suspense>
  )
}

function LessonEditorPageInner({
  params: paramsPromise,
}: {
  params: Promise<{ lessonId: string }>
}) {
  const params = use(paramsPromise)
  const router = useRouter()
  const searchParams = useSearchParams()
  const communitySlug = searchParams?.get('community') ?? ''
  const lessonId = params.lessonId

  const { data: lesson, isLoading, refetch } = useQuery<Lesson>({
    queryKey: ['lesson-edit', lessonId],
    queryFn: async () => {
      // Direct fetch via API — we'd typically have a getLesson endpoint
      // For now we use updateLesson to test existence and the existing data
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/communities/${communitySlug}/courses/lessons/${lessonId}`, {
        headers: {
          'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('hubso_access_token') : ''}`,
        },
      })
      if (!res.ok) throw new Error('Lesson not found')
      return res.json()
    },
    enabled: !!communitySlug && !!lessonId,
  })

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [bunnyVideoId, setBunnyVideoId] = useState<string | null>(null)
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
  const [hlsUrl, setHlsUrl] = useState<string | null>(null)
  const [content, setContent] = useState<Record<string, unknown> | undefined>(undefined)
  const [isFree, setIsFree] = useState(false)
  const [loaded, setLoaded] = useState(false)

  // Load lesson data
  if (lesson && !loaded) {
    setTitle(lesson.title)
    setDescription(lesson.description ?? '')
    setVideoUrl(lesson.videoUrl ?? '')
    setBunnyVideoId(lesson.bunnyVideoId ?? null)
    setThumbnailUrl(lesson.thumbnailUrl ?? null)
    setHlsUrl(lesson.hlsUrl ?? null)
    setContent(lesson.content as Record<string, unknown> | undefined)
    setIsFree(lesson.isFree)
    setLoaded(true)
  }

  const updateLesson = useUpdateLesson(communitySlug)

  const handleSave = () => {
    updateLesson.mutate(
      {
        lessonId,
        data: {
          title,
          description: description || undefined,
          videoUrl: videoUrl || undefined,
          bunnyVideoId: bunnyVideoId || undefined,
          thumbnailUrl: thumbnailUrl || undefined,
          hlsUrl: hlsUrl || undefined,
          content: content || undefined,
          isFree,
        },
      },
      {
        onSuccess: () => { toast.success('Lekcja zapisana'); refetch() },
        onError: () => toast.error('Błąd zapisywania lekcji'),
      },
    )
  }

  const handleContentChange = useCallback((json: Record<string, unknown>) => {
    setContent(json)
  }, [])

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-4">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        <div className="h-96 bg-slate-100 dark:bg-dark-surface rounded-xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <Link href="/admin/courses" className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
          Kursy
        </Link>
        <Icon icon="solar:alt-arrow-right-linear" width={14} height={14} />
        <button onClick={() => router.back()} className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
          Moduł
        </button>
        <Icon icon="solar:alt-arrow-right-linear" width={14} height={14} />
        <span className="text-slate-900 dark:text-white font-medium truncate max-w-[200px]">
          {lesson?.title ?? 'Lekcja'}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          Edycja lekcji
        </h1>
        <button
          onClick={handleSave}
          disabled={updateLesson.isPending}
          className="h-10 px-5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
        >
          {updateLesson.isPending ? 'Zapisywanie...' : 'Zapisz'}
        </button>
      </div>

      <div className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            Tytuł lekcji
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full h-11 px-4 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            Krótki opis
          </label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Opcjonalny krótki opis lekcji"
            className="w-full h-11 px-4 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Video Upload (Bunny Stream) */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            Wideo lekcji
          </label>
          {bunnyVideoId ? (
            <div className="space-y-3">
              <SmartVideoPlayer
                videoId={bunnyVideoId}
                embedUrl={`https://iframe.mediadelivery.net/embed/${bunnyVideoId}`}
                hlsUrl={hlsUrl}
                thumbnailUrl={thumbnailUrl}
                status="READY"
                title={title || 'Wideo'}
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">ID: {bunnyVideoId}</p>
                <button
                  type="button"
                  onClick={() => {
                    setBunnyVideoId(null)
                    setThumbnailUrl(null)
                    setHlsUrl(null)
                    setVideoUrl('')
                  }}
                  className="text-xs text-red-500 hover:text-red-700 hover:underline"
                >
                  Usuń wideo
                </button>
              </div>
            </div>
          ) : (
            <VideoUpload
              communityId={communitySlug}
              onVideoReady={(video) => {
                setBunnyVideoId(video.videoId)
                setThumbnailUrl(video.thumbnailUrl)
                setHlsUrl(video.hlsUrl)
                setVideoUrl(video.hlsUrl || '')
                toast.success('Wideo przesłane i gotowe!')
              }}
              onVideoCreated={(videoId) => {
                setBunnyVideoId(videoId)
              }}
            />
          )}
          {/* Fallback: manual URL */}
          {!bunnyVideoId && (
            <div className="mt-3">
              <p className="text-xs text-muted-foreground mb-1">
                Lub podaj URL wideo ręcznie (np. YouTube, Vimeo):
              </p>
              <input
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://..."
                className="w-full h-9 px-3 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
          )}
        </div>

        {/* Free toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsFree(!isFree)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              isFree ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                isFree ? 'translate-x-5' : ''
              }`}
            />
          </button>
          <span className="text-sm text-slate-700 dark:text-slate-200">
            Darmowa lekcja (dostępna bez zapisania się)
          </span>
        </div>

        {/* Content editor */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            Treść lekcji
          </label>
          <div className="border border-slate-200 dark:border-dark-border rounded-xl overflow-hidden bg-white dark:bg-dark-surface">
            {loaded && (
              <TiptapEditor
                content={content}
                onChange={handleContentChange}
                placeholder="Napisz treść lekcji..."
                minHeight="min-h-[300px]"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
