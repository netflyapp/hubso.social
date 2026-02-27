'use client'

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  coursesApi,
  type Course,
  type CourseModule,
  type Lesson,
  type Enrollment,
  type LessonProgress,
} from '@/lib/api'

// ── Keys ────────────────────────────────────────────

export const courseKeys = {
  all: ['courses'] as const,
  lists: () => [...courseKeys.all, 'list'] as const,
  list: (communitySlug: string) => [...courseKeys.lists(), communitySlug] as const,
  details: () => [...courseKeys.all, 'detail'] as const,
  detail: (communitySlug: string, courseSlug: string) =>
    [...courseKeys.details(), communitySlug, courseSlug] as const,
  enrollments: () => [...courseKeys.all, 'enrollments'] as const,
  myEnrollments: () => [...courseKeys.enrollments(), 'my'] as const,
  progress: (communitySlug: string, courseId: string) =>
    [...courseKeys.all, 'progress', communitySlug, courseId] as const,
}

// ── Queries ─────────────────────────────────────────

export function useCourses(communitySlug: string, params?: { status?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: [...courseKeys.list(communitySlug), params],
    queryFn: () => coursesApi.list(communitySlug, params),
    enabled: !!communitySlug,
  })
}

export function useCourse(communitySlug: string, courseSlug: string) {
  return useQuery({
    queryKey: courseKeys.detail(communitySlug, courseSlug),
    queryFn: () => coursesApi.get(communitySlug, courseSlug),
    enabled: !!communitySlug && !!courseSlug,
  })
}

export function useMyEnrollments(params?: { status?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: [...courseKeys.myEnrollments(), params],
    queryFn: () => coursesApi.getMyEnrollments(params),
  })
}

export function useCourseProgress(communitySlug: string, courseId: string) {
  return useQuery({
    queryKey: courseKeys.progress(communitySlug, courseId),
    queryFn: () => coursesApi.getProgress(communitySlug, courseId),
    enabled: !!communitySlug && !!courseId,
  })
}

// ── Mutations ───────────────────────────────────────

export function useCreateCourse(communitySlug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Parameters<typeof coursesApi.create>[1]) =>
      coursesApi.create(communitySlug, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: courseKeys.list(communitySlug) })
      toast.success('Kurs utworzony')
    },
    onError: () => toast.error('Nie udało się utworzyć kursu'),
  })
}

export function useUpdateCourse(communitySlug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ courseId, data }: { courseId: string; data: Parameters<typeof coursesApi.update>[2] }) =>
      coursesApi.update(communitySlug, courseId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: courseKeys.lists() })
      qc.invalidateQueries({ queryKey: courseKeys.details() })
      toast.success('Kurs zaktualizowany')
    },
    onError: () => toast.error('Nie udało się zaktualizować kursu'),
  })
}

export function useDeleteCourse(communitySlug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (courseId: string) => coursesApi.delete(communitySlug, courseId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: courseKeys.list(communitySlug) })
      toast.success('Kurs usunięty')
    },
    onError: () => toast.error('Nie udało się usunąć kursu'),
  })
}

// ── Module mutations ────────────────────────────────

export function useCreateModule(communitySlug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ courseId, data }: { courseId: string; data: Parameters<typeof coursesApi.createModule>[2] }) =>
      coursesApi.createModule(communitySlug, courseId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: courseKeys.details() })
      toast.success('Moduł utworzony')
    },
    onError: () => toast.error('Nie udało się utworzyć modułu'),
  })
}

export function useUpdateModule(communitySlug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ moduleId, data }: { moduleId: string; data: Parameters<typeof coursesApi.updateModule>[2] }) =>
      coursesApi.updateModule(communitySlug, moduleId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: courseKeys.details() })
      toast.success('Moduł zaktualizowany')
    },
    onError: () => toast.error('Nie udało się zaktualizować modułu'),
  })
}

export function useDeleteModule(communitySlug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (moduleId: string) => coursesApi.deleteModule(communitySlug, moduleId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: courseKeys.details() })
      toast.success('Moduł usunięty')
    },
    onError: () => toast.error('Nie udało się usunąć modułu'),
  })
}

export function useReorderModules(communitySlug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ courseId, moduleIds }: { courseId: string; moduleIds: string[] }) =>
      coursesApi.reorderModules(communitySlug, courseId, moduleIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: courseKeys.details() })
    },
    onError: () => toast.error('Nie udało się zmienić kolejności modułów'),
  })
}

// ── Lesson mutations ────────────────────────────────

export function useCreateLesson(communitySlug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ moduleId, data }: { moduleId: string; data: Parameters<typeof coursesApi.createLesson>[2] }) =>
      coursesApi.createLesson(communitySlug, moduleId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: courseKeys.details() })
      toast.success('Lekcja utworzona')
    },
    onError: () => toast.error('Nie udało się utworzyć lekcji'),
  })
}

export function useUpdateLesson(communitySlug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ lessonId, data }: { lessonId: string; data: Parameters<typeof coursesApi.updateLesson>[2] }) =>
      coursesApi.updateLesson(communitySlug, lessonId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: courseKeys.details() })
      toast.success('Lekcja zapisana')
    },
    onError: () => toast.error('Nie udało się zapisać lekcji'),
  })
}

export function useDeleteLesson(communitySlug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (lessonId: string) => coursesApi.deleteLesson(communitySlug, lessonId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: courseKeys.details() })
      toast.success('Lekcja usunięta')
    },
    onError: () => toast.error('Nie udało się usunąć lekcji'),
  })
}

// ── Enrollment mutations ────────────────────────────

export function useEnroll(communitySlug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (courseId: string) => coursesApi.enroll(communitySlug, courseId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: courseKeys.myEnrollments() })
      qc.invalidateQueries({ queryKey: courseKeys.details() })
      toast.success('Zapisano na kurs')
    },
    onError: () => toast.error('Nie udało się zapisać na kurs'),
  })
}

export function useUnenroll(communitySlug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (courseId: string) => coursesApi.unenroll(communitySlug, courseId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: courseKeys.myEnrollments() })
      qc.invalidateQueries({ queryKey: courseKeys.details() })
      toast.success('Wypisano z kursu')
    },
    onError: () => toast.error('Nie udało się wypisać z kursu'),
  })
}

// ── Progress mutations ──────────────────────────────

export function useMarkLessonComplete(communitySlug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (lessonId: string) => coursesApi.markLessonComplete(communitySlug, lessonId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: courseKeys.all })
      toast.success('Lekcja ukończona!')
    },
    onError: () => toast.error('Nie udało się oznaczyć lekcji'),
  })
}

export function useUpdateWatchTime(communitySlug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ lessonId, watchTime }: { lessonId: string; watchTime: number }) =>
      coursesApi.updateWatchTime(communitySlug, lessonId, watchTime),
  })
}
