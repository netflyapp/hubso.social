'use client'

import { useRef, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Icon } from '@iconify/react'
import { usersApi, type MeResponse } from '@/lib/api'
import { useAuthStore } from '@/stores/useAuthStore'

// ─── Validation Schema ────────────────────────────────────────────────────────

const schema = z.object({
  displayName: z.string().min(1, 'Wymagane').max(50, 'Maks. 50 znaków'),
  bio: z.string().max(500, 'Maks. 500 znaków').optional(),
  username: z
    .string()
    .min(3, 'Min. 3 znaki')
    .max(30, 'Maks. 30 znaków')
    .regex(/^[a-z0-9_]+$/, 'Tylko małe litery, cyfry i _'),
})

type FormValues = z.infer<typeof schema>

// ─── Avatar Upload ────────────────────────────────────────────────────────────

interface AvatarUploadProps {
  currentUrl: string | null | undefined
  displayName: string | null
  onUpload: (user: MeResponse) => void
}

function AvatarUpload({ currentUrl, displayName, onUpload }: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const avatarSrc =
    preview ??
    currentUrl ??
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName ?? 'U')}&background=6366f1&color=fff&size=128`

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        toast.error('Dozwolone tylko pliki graficzne.')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Plik nie może przekraczać 5 MB.')
        return
      }

      // Instant preview
      const reader = new FileReader()
      reader.onloadend = () => setPreview(reader.result as string)
      reader.readAsDataURL(file)

      setUploading(true)
      try {
        const updated = await usersApi.uploadAvatar(file)
        onUpload(updated)
        toast.success('Awatar zaktualizowany!')
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Błąd przesyłania.'
        toast.error(msg)
        setPreview(null)
      } finally {
        setUploading(false)
      }
    },
    [onUpload],
  )

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        role="button"
        tabIndex={0}
        aria-label="Zmień awatar"
        className={[
          'relative w-24 h-24 rounded-2xl overflow-hidden cursor-pointer',
          'ring-2 ring-offset-2 transition-all',
          dragOver
            ? 'ring-indigo-500 ring-offset-indigo-50 dark:ring-offset-slate-900'
            : 'ring-transparent hover:ring-indigo-400',
        ].join(' ')}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          const file = e.dataTransfer.files[0]
          if (file) handleFile(file)
        }}
      >
        <img
          src={avatarSrc}
          alt="Awatar"
          className="w-full h-full object-cover"
        />
        {/* Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
          {uploading ? (
            <Icon icon="solar:spinner-linear" className="text-white animate-spin" width={24} />
          ) : (
            <Icon icon="solar:camera-add-linear" className="text-white" width={24} />
          )}
        </div>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        Kliknij lub przeciągnij · JPEG, PNG, WebP · maks. 5 MB
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

interface EditProfileModalProps {
  onClose: () => void
}

export default function EditProfileModal({ onClose }: EditProfileModalProps) {
  const { user, setUser } = useAuthStore()
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      displayName: user?.displayName ?? '',
      bio: user?.bio ?? '',
      username: user?.username ?? '',
    },
  })

  const onSubmit = async (data: FormValues) => {
    setSaving(true)
    try {
      const updated = await usersApi.updateMe(data)
      setUser(updated)
      toast.success('Profil zaktualizowany!')
      onClose()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Błąd zapisu.'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = (updated: MeResponse) => {
    setUser(updated)
  }

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Edytuj profil"
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Edytuj profil
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Icon icon="solar:close-linear" width={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Avatar section */}
          <AvatarUpload
            currentUrl={user?.avatarUrl}
            displayName={user?.displayName ?? user?.username ?? null}
            onUpload={handleAvatarUpload}
          />

          <hr className="border-gray-100 dark:border-slate-800" />

          {/* Form */}
          <form id="edit-profile-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Wyświetlana nazwa
              </label>
              <input
                {...register('displayName')}
                type="text"
                placeholder="Jan Kowalski"
                className={[
                  'w-full px-3 py-2 rounded-lg border text-sm transition-colors',
                  'bg-white dark:bg-slate-800 text-slate-900 dark:text-white',
                  'placeholder:text-slate-400 dark:placeholder:text-slate-500',
                  'focus:outline-none focus:ring-2 focus:ring-indigo-500',
                  errors.displayName
                    ? 'border-red-400 dark:border-red-500'
                    : 'border-gray-200 dark:border-slate-700',
                ].join(' ')}
              />
              {errors.displayName && (
                <p className="mt-1 text-xs text-red-500">{errors.displayName.message}</p>
              )}
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Nazwa użytkownika
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm select-none">
                  @
                </span>
                <input
                  {...register('username')}
                  type="text"
                  placeholder="jan_kowalski"
                  className={[
                    'w-full pl-7 pr-3 py-2 rounded-lg border text-sm transition-colors',
                    'bg-white dark:bg-slate-800 text-slate-900 dark:text-white',
                    'placeholder:text-slate-400 dark:placeholder:text-slate-500',
                    'focus:outline-none focus:ring-2 focus:ring-indigo-500',
                    errors.username
                      ? 'border-red-400 dark:border-red-500'
                      : 'border-gray-200 dark:border-slate-700',
                  ].join(' ')}
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-xs text-red-500">{errors.username.message}</p>
              )}
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Bio
              </label>
              <textarea
                {...register('bio')}
                rows={3}
                placeholder="Napisz coś o sobie…"
                className={[
                  'w-full px-3 py-2 rounded-lg border text-sm transition-colors resize-none',
                  'bg-white dark:bg-slate-800 text-slate-900 dark:text-white',
                  'placeholder:text-slate-400 dark:placeholder:text-slate-500',
                  'focus:outline-none focus:ring-2 focus:ring-indigo-500',
                  errors.bio
                    ? 'border-red-400 dark:border-red-500'
                    : 'border-gray-200 dark:border-slate-700',
                ].join(' ')}
              />
              {errors.bio && (
                <p className="mt-1 text-xs text-red-500">{errors.bio.message}</p>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Anuluj
          </button>
          <button
            type="submit"
            form="edit-profile-form"
            disabled={saving || !isDirty}
            className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors flex items-center gap-2"
          >
            {saving && <Icon icon="solar:spinner-linear" className="animate-spin" width={16} />}
            {saving ? 'Zapisuję…' : 'Zapisz zmiany'}
          </button>
        </div>
      </div>
    </div>
  )
}
